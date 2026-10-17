import test from 'node:test';
import assert from 'node:assert/strict';
import { WEAPONS, getWeapon, type WeaponId } from '../src/games/gunhit/game/weapons';
import { COMMON_GUN_IDS, commonGunPreviewState, isCommonGun, shotPulse } from '../src/games/gunhit/game/art/commonGunMotion';
import { drawGun } from '../src/games/gunhit/game/art/guns';
import { drawGunCentered } from '../src/games/gunhit/game/art/drawCentered';
import { gunState } from '../src/games/gunhit/game/art/kit';

// Check the geometry passed to Canvas, not just whether the draw function was
// called. A bad dimension/color can otherwise blank the whole Arsenal slide.
function canvasArt(events: string[]): CanvasRenderingContext2D {
  const gradient = { addColorStop: (_at: number, color: string) => {
    if (color.startsWith('#')) assert.match(color, /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i);
  } };
  return new Proxy({}, {
    get: (_target, prop) => (...args: unknown[]) => {
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return gradient;
      if (prop === 'measureText') return { width: 30 };
      for (const arg of args) {
        if (typeof arg === 'number') assert.ok(Number.isFinite(arg), `${String(prop)} received ${arg}`);
      }
      if (prop === 'arc' || prop === 'ellipse') {
        assert.ok((args[2] as number) >= 0);
        if (prop === 'ellipse') assert.ok((args[3] as number) >= 0);
      }
      if (prop === 'roundRect') {
        assert.ok((args[2] as number) >= 0 && (args[3] as number) >= 0);
      }
      if (['roundRect', 'arc', 'ellipse', 'bezierCurveTo', 'quadraticCurveTo',
        'moveTo', 'lineTo', 'fillRect', 'rotate', 'translate'].includes(String(prop))) {
        events.push(`${String(prop)}(${args.map(v => typeof v === 'number' ? v.toFixed(2) : String(v)).join(',')})`);
      }
    },
    set: () => true,
  }) as CanvasRenderingContext2D;
}

function render(id: WeaponId, age: number, t: number, ready = true): string {
  const previousShot = gunState.sinceShot, previousReload = gunState.reloadT;
  const events: string[] = [];
  try {
    gunState.sinceShot = age;
    gunState.reloadT = 0;
    drawGun(canvasArt(events), id, 0, 0, t, 0, ready);
  } finally {
    gunState.sinceShot = previousShot;
    gunState.reloadT = previousReload;
  }
  assert.ok(events.length < 1800, `${id} must stay cheap to draw at 30/60 fps`);
  return events.join(';');
}

test('the complete UMUM rarity has 14 distinct animated weapons, and the shot curve ends cleanly', () => {
  assert.deepEqual([...COMMON_GUN_IDS].sort(), WEAPONS.filter(w => w.rarity === 'UMUM').map(w => w.id).sort());
  assert.equal(new Set(COMMON_GUN_IDS).size, 14);
  assert.ok(COMMON_GUN_IDS.every(isCommonGun));
  assert.equal(isCommonGun('golden'), false);
  assert.equal(shotPulse(-1), 0);
  assert.equal(shotPulse(9), 0);
  assert.equal(shotPulse(Number.NaN), 0);
  assert.ok(shotPulse(0.14) > 0.99);
  assert.equal(shotPulse(0.28), 0);
});

test('every common weapon animates both its idle details and its own shot motion', () => {
  for (const id of COMMON_GUN_IDS) {
    const weapon = getWeapon(id);
    const mechanics = { cooldown: weapon.cooldown, speed: weapon.speed, half: weapon.half,
      recoil: weapon.recoil, stick: weapon.stick, auto: weapon.auto };
    const idle = render(id, 9, 0.3);
    const later = render(id, 9, 1.2);
    const firing = render(id, 0.12, 0.3);
    assert.ok(idle.length > 150, `${id} has a visible body`);
    assert.notEqual(idle, later, `${id} needs a moving idle detail`);
    assert.notEqual(idle, firing, `${id} needs a real moving firing detail`);
    assert.deepEqual({ cooldown: weapon.cooldown, speed: weapon.speed, half: weapon.half,
      recoil: weapon.recoil, stick: weapon.stick, auto: weapon.auto }, mechanics,
    `${id} visuals must not touch weapon rules`);
  }
  assert.notEqual(render('honey', 9, 0.3), render('honey', 0.12, 0.3), 'the default classic jar reacts to firing');
});

test('menu and Arsenal demonstrate a shot, one refill, then return to idle without changing live gun state', () => {
  assert.equal(commonGunPreviewState(0).sinceShot, 9);
  assert.ok(commonGunPreviewState(0.9).flash > 0);
  assert.equal(commonGunPreviewState(0.9).ready, false);
  assert.ok(commonGunPreviewState(1.18).reloadT > 0);
  assert.equal(commonGunPreviewState(1.65).ready, true);
  assert.deepEqual(commonGunPreviewState(2.8), commonGunPreviewState(0));
  gunState.sinceShot = 0.47;
  gunState.reloadT = 1.25;
  try {
    for (const id of COMMON_GUN_IDS) {
      const events: string[] = [];
      for (const t of [0, 0.9, 1.18, 1.65]) {
        drawGunCentered(canvasArt(events), id, t, 0, true, undefined, true);
        assert.equal(gunState.sinceShot, 0.47, `${id}: demo must restore shot time`);
        assert.equal(gunState.reloadT, 1.25, `${id}: demo must restore reload time`);
      }
      assert.ok(events.length, `${id} preview draws`);
    }
    const rarePreview: string[] = [], rareNormal: string[] = [];
    drawGunCentered(canvasArt(rarePreview), 'golden', 1.18, 0, true, undefined, true);
    drawGunCentered(canvasArt(rareNormal), 'golden', 1.18);
    assert.deepEqual(rarePreview, rareNormal, 'preview shot cycle is reserved for UMUM');
    assert.throws(() => drawGunCentered(new Proxy({}, {
      get: () => { throw new Error('canvas lost'); },
    }) as CanvasRenderingContext2D, 'honey', 1.18, 0, true, undefined, true));
    assert.equal(gunState.sinceShot, 0.47, 'state is restored even when rendering throws');
    assert.equal(gunState.reloadT, 1.25);
  } finally {
    gunState.sinceShot = 9;
    gunState.reloadT = 0;
  }
});

test('Snowball Cannon demonstration only draws the five real hopper chambers, losing one before refill', () => {
  function hopperBalls(t: number): number {
    const events: string[] = [];
    drawGunCentered(canvasArt(events), 'snowball', t, 0, true, undefined, true);
    return events.filter(e => e.startsWith('arc(') && e.split(',')[2]?.startsWith('5.90')).length;
  }
  assert.equal(hopperBalls(0), 5);
  assert.equal(hopperBalls(1.18), 4);
  assert.equal(hopperBalls(1.65), 5);
});
