import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, makeLevel } from '../src/games/gunhit/game/Game';
import { DiamondRock } from '../src/games/gunhit/game/art/diamondRock';
import { TreasureChest } from '../src/games/gunhit/game/art/bonusArt';
import { SNOWBALL_RADIUS } from '../src/games/gunhit/game/art/projectiles2';
import { SNOWBALL_MAG_SIZE } from '../src/games/gunhit/game/art/guns2';
import { drawMaterialTrail } from '../src/games/gunhit/game/art/projectileTrails';
import { drawClassicBeam } from '../src/games/gunhit/game/art/beamEffects';
import { getGunEffect, setGunEffect } from '../src/games/gunhit/game/art/gunVariants';
import { goldenSlideOffset } from '../src/games/gunhit/game/art/guns';
import { bananaPeelOpen, bananaFleshFill } from '../src/games/gunhit/game/art/guns2';
import { dragonFlameSurge } from '../src/games/gunhit/game/art/guns3';
import { honeyPumpPulse } from '../src/games/gunhit/game/art/guns4';
import { FX, spawnImpact, spawnMuzzle, type Particle } from '../src/games/gunhit/game/fx';
import { drawProjectile, getWeapon } from '../src/games/gunhit/game/weapons';

interface Shot { x: number; y: number; vx: number; vy: number }
interface Embedded { cellId?: number; x: number; y: number; angle: number; w: string }
interface Falling { id: number; x: number; y: number; cx: number; cy: number; rot: number; bullets: Embedded[] }
interface Probe {
  shoot(): void;
  advanceReload(dt: number): void;
  stepSpecialProjectile(p: Shot): { res: string };
  specialImpact(x: number, y: number, material: 'rock' | 'gold'): void;
  level: ReturnType<typeof makeLevel>;
  projs: Shot[];
  particles: { kind: string; x: number; y: number }[];
  lights: { x: number; y: number }[];
  fallenCells: Falling[];
  flyers: { kind: string; x: number; y: number }[];
  rockBullets: Embedded[];
  chestBullets: Embedded[];
  rockFragments: unknown[];
  ammoLeft: number;
  snowLoaded: number;
  reloadT: number;
  cooldown: number;
  coins: number;
  score: number;
  beams: { x: number; y: number }[];
  slowT: number;
  slowF: number;
  slowKind: string;
}

function probe(level: number, weapon = 'pistol'): Probe {
  const game = Object.create(Game.prototype) as Probe;
  const particles: Probe['particles'] = [];
  const lights: Probe['lights'] = [];
  Object.assign(game, {
    level: makeLevel(level), weapon: getWeapon(weapon), state: 'play',
    projs: [], beams: [], rockBullets: [], chestBullets: [], treasureCoins: [], fallenCells: [], rockFragments: [], flyers: [],
    particles, lights, sink: {
      push: (p: Probe['particles'][number]) => particles.push(p),
      light: (x: number, y: number) => lights.push({ x, y }),
    },
    events: {}, rot: 0, camY: 0, bump: 0, shake: 0, hitStop: 0, flashWhite: 0,
    cooldown: 0, reloadT: 0, ammoLeft: 12, snowLoaded: SNOWBALL_MAG_SIZE, maxAmmoMult: 1,
    speedMult: 1, dmgMult: 1, rt: 0, coins: 0, score: 0, slowT: 0, slowF: 1, slowKind: 'ice',
  });
  return game;
}

test('portal shot is visual art, with no new portal hitbox or teleport rule', () => {
  const portal = getWeapon('portal');
  assert.equal(portal.half, 4.5);
  assert.equal(portal.speed, 2600);
  assert.equal(portal.saveFx, 'portal');
  assert.equal(portal.saves, 2, 'the existing defensive perk is unchanged');
  assert.equal(FX.portal.ghost, 0, 'no procession of afterimages behind the ring');
  assert.equal(drawMaterialTrail({} as CanvasRenderingContext2D, 'portal'), true,
    'the flying ring must not receive a long comet/tadpole tail');
});

test('snowball doubles in size and breaks into clumps of white snow, not blue ice', () => {
  const snow = getWeapon('snowball');
  assert.equal(SNOWBALL_RADIUS, 16);
  assert.equal(snow.half, 13, 'the collision radius grows with the visible ball');
  assert.equal(snow.stick, 16, 'the surface entry depth remains unchanged');
  const particles: Particle[] = [];
  const sink = { push: (p: Particle) => particles.push(p), light: () => {} };
  spawnMuzzle(sink, FX.snowball, snow, 210, 570);
  assert.ok(particles.some(p => p.kind === 'snowflake'), 'snow sprays from the cannon');
  particles.length = 0;
  spawnImpact(sink, FX.snowball, snow, 210, 360, 0, 1, ['#999999']);
  assert.ok(particles.filter(p => p.kind === 'snowChunk').length >= 10);
  assert.ok(particles.filter(p => p.kind === 'snowDust').length >= 20);
  assert.ok(particles.some(p => p.kind === 'snowflake'));
  assert.ok(particles.some(p => p.kind === 'smoke'), 'powder cloud softens the snow burst');
  assert.equal(particles.some(p => p.kind === 'iceShard'), false);
});

test('the five Snowball Cannon chambers empty on shots and refill only after a reload', () => {
  const game = probe(7, 'snowball');
  game.ammoLeft = game.level.ammo;
  assert.equal(game.ammoLeft, 8);
  assert.equal(SNOWBALL_MAG_SIZE, 5);
  for (let fired = 1; fired <= SNOWBALL_MAG_SIZE; fired++) {
    game.cooldown = 0;
    game.shoot();
    assert.equal(game.snowLoaded, SNOWBALL_MAG_SIZE - fired);
    assert.equal(game.ammoLeft, 8 - fired);
  }
  assert.ok(game.reloadT > 0, 'empty magazine starts an automatic reload');
  const shots = game.projs.length;
  game.cooldown = 0;
  game.shoot();
  assert.equal(game.projs.length, shots, 'cannot fire an invisible sixth snowball');
  game.advanceReload(0.42);
  assert.equal(game.snowLoaded, 0, 'hopper stays empty during the reload');
  game.advanceReload(0.5);
  assert.equal(game.snowLoaded, 3, 'the next magazine holds only the remaining stage ammo');
  assert.equal(game.ammoLeft, 3, 'classic stages never gain infinite ammunition');
  game.cooldown = 0;
  game.shoot();
  assert.equal(game.snowLoaded, 2);
  assert.equal(game.ammoLeft, 2);

  const timed = probe(3, 'snowball');
  timed.snowLoaded = 1;
  timed.shoot();
  assert.ok(timed.reloadT > 0);
  timed.advanceReload(1);
  assert.equal(timed.ammoLeft, 11, 'magazine reload must NOT refill remaining timed-stage ammo');
  assert.equal(timed.snowLoaded, 5);
  timed.ammoLeft = 1;
  timed.snowLoaded = 1;
  timed.cooldown = 0;
  timed.shoot();
  timed.advanceReload(1);
  assert.equal(timed.ammoLeft, timed.level.ammo, 'timed stages refill the stage quota only after it reaches zero');
  assert.equal(timed.snowLoaded, 5);
});

test('Super Soaker fires liquid spray and splashes instead of slow-perk glass chips', () => {
  const water = getWeapon('soaker');
  const particles: Particle[] = [];
  const sink = { push: (p: Particle) => particles.push(p), light: () => {} };
  spawnMuzzle(sink, FX.soaker, water, 210, 570);
  assert.ok(particles.every(p => p.kind === 'waterDrop'));
  particles.length = 0;
  spawnImpact(sink, FX.soaker, water, 210, 360, 0, 1, ['#999999']);
  assert.equal(particles.filter(p => p.kind === 'waterSplash').length, 1);
  assert.ok(particles.filter(p => p.kind === 'waterDrop').length >= 15);
  assert.equal(particles.some(p => p.kind === 'chip'), false);
  assert.equal(water.slowFactor, 0.6, 'the visual overhaul does not change the wet slowdown');
});

test('Honey Blaster keeps its slowdown but leaves sticky amber beads and a splash on every target', () => {
  const honey = getWeapon('honey');
  assert.equal(honey.slowFactor, 0.5);
  assert.equal(honey.slowTime, 1.6);
  assert.equal(honey.slowStyle, 'honey', 'slowdown cannot borrow the Soaker\'s blue film');
  assert.equal(honey.stick, 22);
  const particles: Particle[] = [];
  const sink = { push: (p: Particle) => particles.push(p), light: () => {} };
  spawnMuzzle(sink, FX.honey, honey, 210, 570);
  assert.ok(particles.filter(p => p.kind === 'honeyDrop').length >= 6);
  particles.length = 0;
  spawnImpact(sink, FX.honey, honey, 210, 360, 0, 1, ['#999999']);
  assert.equal(particles.filter(p => p.kind === 'honeySplash').length, 1);
  assert.ok(particles.filter(p => p.kind === 'honeyDrop').length >= 17);
  assert.ok(particles.every(p => p.kind !== 'waterDrop' && p.kind !== 'chip'));

  const rock = probe(3, 'honey');
  const stone = new DiamondRock();
  const cells = (stone as unknown as { cells: { center: { x: number; y: number }; hp: number }[] }).cells;
  const cell = cells.find(c => c.hp >= 2 && c.center.y > 140 && Math.abs(c.center.x) < 40)!;
  assert.ok(cell);
  Object.assign(rock, { rock: stone, dmgMult: 0.25 });
  assert.equal(rock.stepSpecialProjectile({ x: 210 + cell.center.x * rock.level.radius / 196,
    y: 282 + cell.center.y * rock.level.radius / 196, vx: 0, vy: -1900 }).res, 'hit');
  assert.ok([...rock.rockBullets, ...rock.fallenCells.flatMap(f => f.bullets)].some(b => b.w === 'honey'),
    'the liquid bead must remain attached to the actual stone cell');
  assert.equal(rock.slowKind, 'honey');
  assert.equal(rock.slowF, 0.5);
  assert.ok(rock.particles.some(p => p.kind === 'honeySplash'));

  const chest = probe(6, 'honey');
  Object.assign(chest, { chest: { hit: () => {} } });
  assert.equal(chest.stepSpecialProjectile({ x: 210, y: 362, vx: 0, vy: -1900 }).res, 'hit');
  assert.equal(chest.chestBullets[0].w, 'honey', 'the liquid sticks to the shaking treasure chest too');
  assert.ok(chest.particles.some(p => p.kind === 'honeySplash'));
});

test('embedded hornets point a long sharp sting into the board, not their head', () => {
  const bee = getWeapon('bee');
  assert.equal(bee.half, 3.5);
  assert.equal(bee.stick, 24);
  assert.equal(bee.auto, true);
  const calls: { method: string; args: number[] }[] = [];
  const ctx = new Proxy({}, {
    get: (_target, method) => method === 'createLinearGradient' || method === 'createRadialGradient'
      ? () => ({ addColorStop: () => {} })
      : (...args: number[]) => { calls.push({ method: String(method), args }); },
    set: () => true,
  }) as CanvasRenderingContext2D;
  drawProjectile(ctx, 'bee', 36, 0.6, 1, true);
  assert.ok(calls.some(call => call.method === 'lineTo' && call.args[0] === 0
    && Math.abs(call.args[1] - (36 * 0.35 - 12)) < 0.001),
  'the needle tip penetrates past the surface while its root remains visible');
  assert.ok(calls.some(call => call.method === 'ellipse' && call.args[0] === 0
    && call.args[1] === 18 && call.args[2] === 8),
  'the tiny puncture halo marks where the barbed tail enters the board');
  calls.length = 0;
  drawProjectile(ctx, 'bee', 36, 0.6, 0.1);
  assert.ok(calls.some(call => call.method === 'lineTo' && call.args[0] === 0 && call.args[1] === -12),
    'a flying hornet also travels stinger-first');
});

test('Moonbeam defaults to its original shot while the optional new star beam keeps the same hit rules', () => {
  const moon = getWeapon('moonbeam');
  assert.equal(getGunEffect('moonbeam'), 'original');
  assert.equal(moon.beam, true);
  assert.equal(moon.speed, 14000);
  assert.equal(moon.points, 2);
  const classic = probe(1, 'moonbeam');
  classic.shoot();
  assert.equal(classic.projs.length, 1);
  assert.equal(classic.beams.length, 1);
  setGunEffect('moonbeam', 'new');
  try {
    const game = probe(1, 'moonbeam');
    game.shoot();
    assert.equal(game.projs.length, 1);
    assert.equal(game.beams.length, 1);
    assert.ok(game.particles.filter(p => p.kind === 'star').length >= 24,
      'the optional new shot opens with stars at the wand and along the beam');
    const particles: Particle[] = [];
    spawnImpact({ push: p => particles.push(p), light: () => {} }, FX.moonbeam, moon, 210, 360, 0, 1, []);
    assert.ok(particles.filter(p => p.kind === 'star').length >= 18);
    assert.equal(particles.filter(p => p.kind === 'shock').length, 2);
    assert.ok(FX.moonbeam.lightR >= 200);
    const translations: number[] = [];
    const ctx = new Proxy({}, {
      get: (_target, method) => method === 'createRadialGradient' || method === 'createLinearGradient'
        ? () => ({ addColorStop: () => {} })
        : method === 'translate' ? (_x: number, y: number) => { translations.push(y); } : () => {},
      set: () => true,
    }) as CanvasRenderingContext2D;
    drawProjectile(ctx, 'moonbeam', 42, 1, 1, true);
    assert.ok(translations.includes(42 * 0.53), 'the optional new star stays centered on the target surface');
  } finally { setGunEffect('moonbeam', 'original'); }
});

test('viscous honey, stars, rainbow light and dragon fire have their own material trails', () => {
  const ctx = new Proxy({}, {
    get: (_target, method) => method === 'createLinearGradient' || method === 'createRadialGradient'
      ? () => ({ addColorStop: () => {} }) : () => {},
    set: () => true,
  }) as CanvasRenderingContext2D;
  for (const weapon of ['honey', 'rainbow', 'dragon', 'meteor'] as const) {
    assert.equal(drawMaterialTrail(ctx, weapon), true, weapon);
  }
  assert.equal(drawMaterialTrail(ctx, 'moonbeam'), false, 'selected classic shot has no new trail');
  assert.equal(drawMaterialTrail(ctx, 'moonbeam', 'new'), true, 'the optional new shot still has stars');
});

test('treasure coins form a supported heap inside the rim, without clipped crowns', () => {
  // Each chest has its own slight jitter. Check many layouts so a rare seed
  // cannot leave a detached coin at the edge or above the old crop line.
  for (let sample = 0; sample < 50; sample++) {
    const coins = (new TreasureChest() as unknown as {
      coins: { x: number; y: number; r: number }[];
    }).coins;
    assert.equal(coins.length, 32);
    for (const coin of coins) {
      assert.ok(coin.x - coin.r > -88 && coin.x + coin.r < 88, 'within the open mouth');
      assert.ok(coin.y - coin.r > -45, 'no coin crown is cut by the old clip line');
      assert.ok(coin.y + coin.r < 21, 'lowest coins disappear behind the front wall');
      if (coin.y < -3) {
        assert.ok(coins.some(below => below.y - coin.y > 7 && below.y - coin.y < 17
          && Math.hypot(below.x - coin.x, below.y - coin.y) < coin.r + below.r),
        'every visible upper coin rests against another coin below it');
      }
    }
  }
});

test('both barrels own their muzzle rings, glow and projectiles in rock and treasure', () => {
  for (const stage of [3, 6]) {
    const game = probe(stage, 'plasma');
    Object.assign(game, { twinGuns: true });
    game.shoot();
    assert.deepEqual(game.projs.map(p => p.x), [164, 256]);
    assert.deepEqual(game.particles.filter(p => p.kind === 'ring').map(p => p.x), [164, 256]);
    assert.deepEqual(game.lights.map(l => l.x), [164, 256]);
    assert.equal(game.ammoLeft, 11);
  }

  const pistol = probe(3);
  Object.assign(pistol, { twinGuns: true });
  pistol.shoot();
  const casings = pistol.particles.filter(p => p.kind === 'shell');
  assert.deepEqual(casings.map(p => p.x), [148, 272], 'mirrored guns eject outward');
});

test('special-stage explosions keep the weapon’s normal impact burst', () => {
  for (const [stage, material] of [[3, 'rock'], [6, 'gold']] as const) {
    const game = probe(stage, 'rpg');
    game.specialImpact(164, 360, material);
    assert.ok(game.particles.some(p => p.kind === 'shock' && p.x === 164));
    assert.ok(game.particles.some(p => p.kind === 'smoke' && Math.abs(p.x - 164) < 25));
    assert.ok(game.particles.some(p => p.kind === 'ring' && p.x === 164));
  }
});

test('rounds stay on their exact rotating cell and tumble with that cell when it breaks', () => {
  const rock = new DiamondRock();
  const cells = (rock as unknown as { cells: { id: number; center: { x: number; y: number }; hp: number }[] }).cells;
  const target = cells.find(c => c.hp >= 2 && c.center.y > 150 && Math.abs(c.center.x) < 40)!;
  assert.ok(target);
  const initialHp = target.hp;
  const game = probe(3);
  Object.assign(game, { rock, dmgMult: 0.25, twinGuns: true });
  const sc = game.level.radius / 196;
  for (let i = 0; i < initialHp; i++) {
    const rotation = i * 0.11;
    Object.assign(game, { rot: rotation });
    const x = 210 + (target.center.x * Math.cos(rotation) - target.center.y * Math.sin(rotation)) * sc;
    const y = 282 + (target.center.x * Math.sin(rotation) + target.center.y * Math.cos(rotation)) * sc;
    assert.equal(game.stepSpecialProjectile({ x, y, vx: 0, vy: -2700 }).res, 'hit');
    if (i === 0) {
      assert.equal(game.rockBullets.length, 1);
      assert.equal(game.rockBullets[0].cellId, target.id);
      assert.equal(game.fallenCells.length, 0);
    }
  }
  assert.equal(game.rockBullets.some(b => b.cellId === target.id), false);
  const fallen = game.fallenCells.find(f => f.id === target.id)!;
  assert.ok(fallen, 'the struck textured chunk drops, not just generic dust');
  assert.equal(fallen.bullets.length, initialHp, 'old and breaking shots follow the chunk together');
  assert.ok(fallen.bullets.every(b => b.cellId === target.id && b.w === 'pistol'));
  // A bullet's offsets and orientation are cell-local, so changing the falling
  // chunk transform moves the bullet without detaching it or leaving a ghost.
  const first = fallen.bullets[0];
  const relativeX = (first.x - fallen.cx) * sc, relativeY = (first.y - fallen.cy) * sc;
  const before = { x: fallen.x + relativeX * Math.cos(fallen.rot) - relativeY * Math.sin(fallen.rot),
    y: fallen.y + relativeX * Math.sin(fallen.rot) + relativeY * Math.cos(fallen.rot) };
  fallen.y += 60;
  fallen.rot += 0.25;
  const after = { x: fallen.x + relativeX * Math.cos(fallen.rot) - relativeY * Math.sin(fallen.rot),
    y: fallen.y + relativeX * Math.sin(fallen.rot) + relativeY * Math.cos(fallen.rot) };
  assert.ok(Math.hypot(after.x - before.x, after.y - before.y) > 40);
});

test('splash damage carries bullets away with neighboring chunks too', () => {
  const rock = new DiamondRock();
  const cells = (rock as unknown as { cells: { id: number; center: { x: number; y: number }; hp: number; alive: boolean }[] }).cells;
  const target = cells.find(c => c.hp >= 2 && c.hp <= 3 && c.center.y > 140 && Math.abs(c.center.x) < 80
    && cells.some(other => other !== c && Math.hypot(other.center.x - c.center.x, other.center.y - c.center.y) < 40))!;
  assert.ok(target);
  const neighbor = cells.find(c => c !== target && Math.hypot(c.center.x - target.center.x, c.center.y - target.center.y) < 40)!;
  const game = probe(3);
  Object.assign(game, { rock, dmgMult: 0.25 });
  const sc = game.level.radius / 196;
  const hit = (cell: typeof target) => game.stepSpecialProjectile({
    x: 210 + cell.center.x * sc, y: 282 + cell.center.y * sc, vx: 0, vy: -2700,
  });
  assert.equal(hit(target).res, 'hit');
  assert.equal(game.rockBullets[0].cellId, target.id);
  Object.assign(game, { dmgMult: 1 });
  assert.equal(hit(neighbor).res, 'hit');
  assert.equal(target.alive, false);
  assert.equal(game.fallenCells.find(f => f.id === target.id)?.bullets.length, 1);
  assert.equal(game.rockBullets.some(b => b.cellId === target.id), false);
});

test('treasure hits use normal weapon impacts at each lane and embed rounds in the shaking chest', () => {
  const game = probe(6, 'plasma');
  let hits = 0;
  Object.assign(game, { chest: { hit: () => { hits++; } }, treasureBuff: 'double', twinGuns: true });
  for (const x of [164, 256]) assert.equal(game.stepSpecialProjectile({ x, y: 362, vx: 0, vy: -1700 }).res, 'hit');
  assert.equal(hits, 2);
  assert.deepEqual(game.chestBullets.map(b => b.x), [-46, 46]);
  assert.equal(game.coins, 0, 'coins must wait for the shower to land before being credited');
  assert.ok((game as unknown as { treasureCoins: { value: number }[] }).treasureCoins.reduce((n, c) => n + c.value, 0) >= 2);
  assert.ok(game.lights.some(l => l.x === 164));
  assert.ok(game.lights.some(l => l.x === 256));
  assert.ok(game.particles.some(p => p.x === 164 && p.kind === 'shock'));
  assert.ok(game.particles.some(p => p.x === 256 && p.kind === 'shock'));

  game.stepSpecialProjectile({ x: 164, y: 362, vx: 0, vy: -1700 });
  assert.equal(hits, 3);
  assert.deepEqual(game.chestBullets.map(b => b.x), [46, -46]);
  assert.equal(game.flyers.filter(f => f.kind === 'bullet').length, 1, 'a repeat hit dislodges only the previous round');
});

test('rock and treasure retain the gun-specific flames, confetti and notes of ordinary rounds', () => {
  for (const stage of [3, 6]) {
    const fire = probe(stage, 'dragon');
    fire.specialImpact(164, 370, stage === 3 ? 'rock' : 'gold');
    assert.ok(fire.particles.some(p => p.kind === 'glow' && p.x > 145 && p.x < 185));

    const confetti = probe(stage, 'confetti');
    confetti.specialImpact(256, 370, stage === 3 ? 'rock' : 'gold');
    assert.ok(confetti.particles.filter(p => p.kind === 'chip').length >= 28);

    const notes = probe(stage, 'angklung');
    Object.assign(notes, { perkCount: 0 });
    notes.specialImpact(164, 370, stage === 3 ? 'rock' : 'gold');
    assert.equal(notes.particles.filter(p => p.kind === 'text').length, 3);
  }
});

test('Banana flesh enters the target halfway, splashes juice, and never gains reload ammo', () => {
  const banana = getWeapon('banana');
  assert.equal(banana.half, 5.5);
  assert.equal(banana.stick, 30);
  const seams: number[] = [];
  const ctx = new Proxy({}, {
    get: (_target, method) => method === 'createLinearGradient' || method === 'createRadialGradient'
      ? () => ({ addColorStop: () => {} })
      : method === 'ellipse' ? (_x: number, y: number) => { seams.push(y); } : () => {},
    set: () => true,
  }) as CanvasRenderingContext2D;
  drawProjectile(ctx, 'banana', banana.stick, 0.3, 1, true);
  assert.ok(seams.includes(banana.stick * 0.5), 'the embedded flesh marks its halfway surface');
  const classic = probe(1, 'banana');
  classic.ammoLeft = classic.level.ammo;
  classic.shoot();
  assert.equal(classic.ammoLeft, classic.level.ammo - 1, 'closing peel does not refill ammo');
  const chest = probe(6, 'banana');
  Object.assign(chest, { chest: { hit: () => {} } });
  assert.equal(chest.stepSpecialProjectile({ x: 210, y: 362, vx: 0, vy: -1700 }).res, 'hit');
  assert.equal(chest.chestBullets[0].w, 'banana');
  assert.ok(chest.particles.some(p => p.kind === 'bananaSplash'));
  assert.ok(chest.particles.filter(p => p.kind === 'bananaDrop').length >= 10);
});

test('Bamboo firecracker and twice-sized chick retain their original stage rules', () => {
  const bamboo = getWeapon('bamboo');
  const particles: Particle[] = [];
  const sink = { push: (p: Particle) => particles.push(p), light: () => {} };
  spawnImpact(sink, FX.bamboo, bamboo, 210, 360, 0, 1, ['#999999']);
  assert.ok(particles.some(p => p.kind === 'smoke' && p.color.includes('255')));
  assert.equal(bamboo.points, 2);
  const chicken = getWeapon('chicken');
  assert.equal(chicken.half, 12, 'larger chick gets a matching collision width');
  assert.equal(chicken.stick, 70);
  assert.equal(chicken.burst?.n, undefined, 'visual growth cannot grant extra shots');
  const game = probe(1, 'chicken');
  game.shoot();
  assert.equal(game.projs.length, 1);
  assert.equal(game.ammoLeft, 11);
});

test('Golden Gun cycles its slide after a shot and while reloading without refilling classic ammo', () => {
  assert.equal(goldenSlideOffset(9, 0), 0);
  assert.ok(goldenSlideOffset(0.125, 0) >= 16, 'the chamber recoils visibly');
  assert.ok(goldenSlideOffset(9, 0.325) >= 16, 'timed-stage reload moves the same upper slide');
  assert.equal(goldenSlideOffset(9, 0.65), 0);
  const classic = probe(1, 'golden');
  classic.shoot();
  assert.equal(classic.ammoLeft, 11);
  assert.equal(classic.reloadT, 0, 'classic stage has no invented reload between shots');
  const timed = probe(3, 'golden');
  timed.ammoLeft = 1;
  timed.shoot();
  assert.ok(timed.reloadT > 0);
  timed.advanceReload(0.1);
  assert.equal(timed.ammoLeft, 0, 'animation cannot give free rounds early');
  timed.advanceReload(1);
  assert.equal(timed.ammoLeft, timed.level.ammo);
});

test('Laser keeps its instant hit with the former beam; BLACK HOLE keeps its compact classic round', () => {
  assert.equal(getGunEffect('laser'), 'original');
  assert.equal(getGunEffect('blackhole'), 'original');
  assert.equal(getGunEffect('plasma'), 'original');
  assert.equal(getWeapon('laser').beam, true);
  assert.notEqual(getWeapon('blackhole').beam, true);
  const laser = probe(1, 'laser');
  laser.shoot();
  assert.equal(laser.projs.length, 1, 'the fast projectile still handles collision');
  assert.equal(laser.beams.length, 1, 'the classic beam is a visual overlay');
  const voidShot = probe(1, 'blackhole');
  voidShot.shoot();
  assert.equal(voidShot.projs.length, 1);
  assert.equal(voidShot.beams.length, 0);

  const calls: { method: string; args: number[] }[] = [];
  const ctx = new Proxy({}, {
    get: (_target, method) => method === 'createLinearGradient' || method === 'createRadialGradient'
      ? () => ({ addColorStop: () => {} })
      : (...args: number[]) => { calls.push({ method: String(method), args }); },
    set: () => true,
  }) as CanvasRenderingContext2D;
  drawClassicBeam(ctx, 210, 180, 570, 0.8, getWeapon('laser').trail);
  assert.equal(calls.filter(call => call.method === 'fillRect').length, 2,
    'classic beam has a narrow core and a soft glow, not the new filaments');
  calls.length = 0;
  drawProjectile(ctx, 'blackhole', 36, 1.5, 1, true);
  assert.ok(calls.some(call => call.method === 'arc' && call.args[2] === 5.5));
  assert.equal(calls.some(call => call.method === 'arc' && call.args[2] > 24), false,
    'no oversized opaque black circle is placed on a rock or chest');
  const impact: Particle[] = [];
  spawnImpact({ push: p => impact.push(p), light: () => {} }, FX.blackhole,
    getWeapon('blackhole'), 210, 360, 0, 1, ['#777777']);
  assert.ok(impact.length);
  for (const id of ['blackhole', 'plasma'] as const) {
    assert.equal(drawMaterialTrail(ctx, id, 'new'), false,
      'the retired new trail cannot return through a stale saved choice');
  }
});

test('bee-shaped Honey Blaster pumps on impact without altering its sticky slowdown', () => {
  assert.equal(honeyPumpPulse(9), 0);
  assert.equal(honeyPumpPulse(0), 0);
  assert.ok(honeyPumpPulse(0.14) > 0.99);
  assert.equal(honeyPumpPulse(0.28), 0);
  const w = getWeapon('honey');
  assert.equal(w.slowStyle, 'honey');
  assert.equal(w.slowFactor, 0.5);
  assert.equal(w.slowTime, 1.6);
});

test('banana peel opens for the launched pulp, then closes as the fruit visibly refills', () => {
  assert.equal(bananaPeelOpen(9), 0);
  assert.equal(bananaFleshFill(9), 1);
  assert.equal(bananaFleshFill(0), 0);
  assert.equal(bananaFleshFill(0.06), 0);
  assert.ok(bananaPeelOpen(0.065) > 0.99);
  assert.ok(Math.abs(bananaFleshFill(0.13) - 0.5) < 1e-6);
  assert.equal(bananaPeelOpen(0.2), 0);
  assert.equal(bananaFleshFill(0.2), 1);
});

test('dragon breath flares beyond the horns after a shot, then settles without extra rounds', () => {
  assert.equal(dragonFlameSurge(9), 0);
  assert.ok(dragonFlameSurge(0.11) > 0.99);
  assert.equal(dragonFlameSurge(0.22), 0);
  const game = probe(1, 'dragon');
  game.shoot();
  assert.equal(game.projs.length, 1);
  assert.equal(game.ammoLeft, 11);
});
