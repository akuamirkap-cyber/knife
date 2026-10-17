import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Game, makeLevel } from '../src/games/gunhit/game/Game';
import { getWeapon } from '../src/games/gunhit/game/weapons';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (p: string) => readFileSync(path.join(ROOT, p), 'utf8');

test('boss DARK KNIGHT tampil bersih: tanpa duri jebakan & penghalang (peluru berkarat)', () => {
  for (const n of [5, 25, 45]) {
    const level = makeLevel(n);
    assert.equal(level.boss, true, `level ${n} harus boss`);
    assert.equal(level.style, 'knight', `level ${n} harus boss knight`);
    assert.equal(level.spikes, 0, `level ${n} knight tanpa duri`);
    assert.equal(level.old, 0, `level ${n} knight tanpa peluru berkarat penghalang`);
    // koin tetap ada sebagai hadiah
    assert.ok(['classic'].includes(level.mode));
  }
});

test('boss lain tetap memakai duri & penghalang seperti semula', () => {
  const oni = makeLevel(10);
  assert.equal(oni.style, 'oni');
  assert.equal(oni.spikes, 4);
  assert.equal(oni.old, 3);
  const pirate = makeLevel(20);
  assert.equal(pirate.style, 'pirate');
  assert.equal(pirate.spikes, 5);
  assert.equal(pirate.old, 5);
});

test('proyektil bos menghadap arah gerak (ke pemain), tidak berputar', () => {
  const src = read('src/games/gunhit/game/Game.ts');
  assert.ok(
    src.includes('bp.rot = Math.atan2(bp.vy, bp.vx) - Math.PI / 2'),
    'rotasi proyektil bos harus mengikuti arah gerak'
  );
  assert.ok(!src.includes('bp.rot += s * 4'), 'proyektil bos tidak boleh berputar di jalan');
});

test('bos berputar pelan konstan: mulai tegak, update memutar pelan, render memakai this.rot', () => {
  const src = read('src/games/gunhit/game/Game.ts');
  assert.ok(
    src.includes('this.rot = this.level.boss ? 0 : rand(0, TAU)'),
    'boss harus mulai pada sudut 0 (tegak)'
  );
  assert.ok(
    src.includes('if (this.level.boss) this.rot += 0.5 * s * slowF * aimF;'),
    'bos harus berputar pelan & konstan (muter, tidak diem, tidak liar)'
  );
  assert.ok(
    src.includes("if (this.level.mode !== 'treasure') c.rotate(this.rot);"),
    'render harus memutar lapisan target memakai this.rot (bos ikut berputar)'
  );
  assert.ok(
    !src.includes('this.rot = 0;'),
    'bos tidak boleh dikunci diam (this.rot = 0)'
  );
  assert.ok(
    src.includes('c.translate(Math.sin(bt * 0.53) * 3.2, Math.sin(bt * 1.15) * 3.8);'),
    'bos punya gerak idle melayang (terlihat hidup)'
  );
});

// ---------------------------------------------------------------------------
// Behavior: render dengan ctx perekam. this.rot sengaja diisi nilai non-nol
// (adversarial) — untuk bos TIDAK BOLEH ada rotate(±nilai itu) yang sampai ke
// kanvas, sedangkan target biasa tetap berputar (kontrol).
// ---------------------------------------------------------------------------
interface Recorder { events: string[]; ctx: CanvasRenderingContext2D }

function recorder(): Recorder {
  const events: string[] = [];
  const gradient = { addColorStop: () => {} };
  const ctx = new Proxy({}, {
    get: (_t, prop) => (...args: unknown[]) => {
      const name = String(prop);
      if (name === 'createLinearGradient' || name === 'createRadialGradient') {
        events.push(`${name}(${args.map(Number).join(',')})`);
        return gradient;
      }
      if (name === 'measureText') return { width: 30 };
      if (['rotate', 'translate', 'scale', 'drawImage', 'setTransform'].includes(name)) {
        events.push(`${name}(${args.map((v) => (typeof v === 'number' ? v.toFixed(3) : typeof v)).join(',')})`);
      }
      return undefined;
    },
    set: () => true,
  }) as unknown as CanvasRenderingContext2D;
  return { events, ctx };
}

function renderProbe(events: string[], ctx: CanvasRenderingContext2D, levelN: number, rot: number, extra: Record<string, unknown> = {}) {
  const game = Object.create(Game.prototype) as Record<string, unknown>;
  const stub = () => {};
  Object.assign(game, {
    ctx,
    level: makeLevel(levelN),
    scale: 1,
    dpr: 1,
    time: 0.5,
    rt: 0.5,
    camY: 0,
    shake: 0,
    state: 'play',
    introT: 1,
    bump: 0,
    rot,
    items: [],
    face: { tag: 'face-tex' },
    faceR: 122,
    hitFlash: 0,
    slowT: 0,
    slowF: 1,
    slowKind: 'ice',
    slowRgb: '0,0,0',
    bossProjs: [],
    projs: [],
    beams: [],
    particles: [],
    frags: [],
    flyers: [],
    rockFragments: [],
    fallenCells: [],
    chestBullets: [],
    rockBullets: [],
    treasureCoins: [],
    bonusCoins: [],
    portals: [],
    lights: [],
    texts: [],
    twinGuns: false,
    rock: null,
    chest: null,
    star: null,
    weapon: getWeapon('pistol'),
    ammoLeft: 12,
    reloadT: 0,
    recoil: 0,
    tintA: 0,
    tintRgb: '0,0,0',
    diamondPing: 0,
    spikeOffT: 0,
    burnT: 0,
    failProjAngle: 0,
    // method gambar berat di-stub; yang diuji inline di render()
    drawForestBackground: stub,
    drawGunNow: stub,
    drawHUD: stub,
    drawProj: stub,
    drawSpike: stub,
    drawCoin: stub,
    drawEmbeddedShot: stub,
    drawEmbeddedDiamond: stub,
    drawBonusRing: stub,
    ...extra,
  });
  (Game.prototype as unknown as { render(this: unknown): void }).render.call(game);
  return events;
}

test('render: lapisan wajah bos ikut berputar (this.rot sampai ke kanvas) + goyangan idle', () => {
  const ADV = 1.234; // sudut papan bos yang HARUS sampai ke kanvas
  const r1 = recorder();
  const boss = renderProbe(r1.events, r1.ctx, 5, ADV);
  assert.ok(
    boss.some((e) => e.startsWith('drawImage(object')),
    'wajah bos harus digambar'
  );
  assert.ok(
    boss.some((e) => e === `rotate(${ADV.toFixed(3)})`),
    `rotasi papan bos harus sampai ke kanvas — bos harus muter (rotate(${ADV}))`
  );
  assert.ok(
    boss.some((e) => e.startsWith('rotate(') && e !== `rotate(${ADV.toFixed(3)})`),
    'bos punya goyangan idle tambahan (terlihat hidup)'
  );
  // kontrol: target biasa (non-boss) tetap memutar lapisan target
  const r2 = recorder();
  const normal = renderProbe(r2.events, r2.ctx, 1, ADV);
  assert.ok(
    normal.some((e) => e === `rotate(${ADV.toFixed(3)})`),
    'target biasa harus tetap berputar (rotasi papan target)'
  );
});

test('render: api peluru bos digambar di sisi ekor (lokal -Y)', () => {
  const r = recorder();
  const events = renderProbe(r.events, r.ctx, 5, 0, {
    bossProjs: [{ x: 540, y: 800, vx: 20, vy: 180, rot: Math.atan2(180, 20) - Math.PI / 2, type: 'knight' }],
  });
  // gradient api ekor: berakar di y=-13 (ekor) dan berlanjut ke -Y (belakang)
  assert.ok(
    events.some((e) => e.startsWith('createLinearGradient(0,-13,')),
    'api harus punya gradasi yang berakar di ekor (y negatif lokal)'
  );
});

test('api & jejak peluru bos mengekor di ekor (partikel spawn di belakang)', () => {
  const src = read('src/games/gunhit/game/Game.ts');
  assert.ok(
    /tailX = bp\.x - dirx \* 44/.test(src) && /tailY = bp\.y - diry \* 44/.test(src),
    'partikel api harus spawn di posisi ekor (44px di belakang pusat peluru)'
  );
  assert.ok(
    src.includes('x: tailX + rand(-7, 7)') && src.includes('y: tailY + rand(-7, 7)'),
    'partikel jejak harus disebar di sekitar ekor'
  );
});

test('knight: tanpa lingkaran hitam di belakang bos & tanpa glow outline', () => {
  const gameSrc = read('src/games/gunhit/game/Game.ts');
  assert.ok(
    gameSrc.includes("!(this.level.boss && this.level.style === 'knight')"),
    'disk bayangan gelap harus dilewati untuk boss knight'
  );
  const rendererSrc = read('src/games/gunhit/game/bossRenderer.ts');
  assert.ok(
    rendererSrc.includes("if (type !== 'knight')"),
    'glow outline neon harus dilewati untuk boss knight'
  );
});
