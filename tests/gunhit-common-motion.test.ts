import test from 'node:test';
import assert from 'node:assert/strict';
import { WEAPONS, getWeapon, type WeaponId } from '../src/games/gunhit/game/weapons';
import { COMMON_GUN_IDS, commonGunPreviewState, isCommonGun, shotPulse } from '../src/games/gunhit/game/art/commonGunMotion';
import { drawGun } from '../src/games/gunhit/game/art/guns';
import { drawGunCentered } from '../src/games/gunhit/game/art/drawCentered';
import { gunState, lin, vlin } from '../src/games/gunhit/game/art/kit';
import { drawChronoGrip, drawElectroGrip, drawFishGrip, drawFrostGrip, drawFreezeGrip, drawPortalGrip, drawVoidGrip, drawWaterGrip } from '../src/games/gunhit/game/art/gripSystem';

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

test('shared body gradients add a restrained button-like gloss highlight', () => {
  const gradients: Array<Array<[number, string]>> = [];
  const ctx = {
    createLinearGradient: () => {
      const stops: Array<[number, string]> = [];
      gradients.push(stops);
      return { addColorStop: (offset: number, color: string) => stops.push([offset, color]) };
    },
  } as unknown as CanvasRenderingContext2D;
  lin(ctx, -10, 10, ['#142536', '#789abc']);
  vlin(ctx, 0, 100, ['#142536', '#789abc']);
  assert.equal(gradients.length, 2, 'horizontal and vertical finish gradients share the gloss pass');
  for (const stops of gradients) {
    assert.ok(stops.length >= 6, 'the surface gets a broad multi-stop reflection, not one sharp streak');
    const offsets = stops.map(([offset]) => offset);
    assert.deepEqual(offsets, [...offsets].sort((a, b) => a - b));
    const parsed = stops.map(([offset, color]) => {
      const values = color.startsWith('rgba(') ? color.slice(5, -1).split(',').map(Number) : [];
      assert.equal(values.length, 4, 'clear-coat colors remain valid RGBA values');
      assert.equal(values[3], 1, 'the finish stays fully opaque');
      return { offset, channels: values.slice(0, 3) };
    });
    const peak = parsed.find(stop => stop.offset >= 0.4 && stop.offset <= 0.45)!;
    assert.ok(peak.channels[0] > 100 && peak.channels[1] > 120, 'the specular area is visibly lifted without replacing the material hue');
    const first = parsed[0].channels, last = parsed.at(-1)!.channels;
    assert.ok(first[0] > 20 && last[0] > 120, 'the original palette is preserved under a smooth gloss tint');
  }
});

test('themed grips use distinct silhouettes and palettes while leaning like the Golden Gun', () => {
  function drawGrip(draw: (ctx: CanvasRenderingContext2D, cx: number, y: number) => void) {
    const colors: string[] = [];
    const events: string[] = [];
    const ctx = new Proxy({}, {
      get: (_target, prop) => {
        if (prop === 'createLinearGradient' || prop === 'createRadialGradient') {
          return () => ({ addColorStop: (_offset: number, color: string) => colors.push(color) });
        }
        return (...args: unknown[]) => events.push(`${String(prop)}:${args.join(',')}`);
      },
      set: (_target, prop, value) => { if (typeof value === 'string') colors.push(value); return true; },
    }) as CanvasRenderingContext2D;
    draw(ctx, 0, 0);
    return { colors, events };
  }
  function keepsTint(colors: string[], hex: string) {
    const target = hex.slice(1).match(/../g)!.map(pair => parseInt(pair, 16));
    return colors.some(color => {
      const rgba = color.startsWith('rgba(') ? color.slice(5, color.indexOf(')')).split(',').slice(0, 3).map(Number) : null;
      const value = rgba ?? (color.startsWith('#') && color.slice(1).length === 6 ? color.slice(1).match(/../g)!.map(pair => parseInt(pair, 16)) : null);
      return !!value && value.every((channel, i) => Math.abs(channel - target[i]) <= 65);
    });
  }
  const water = drawGrip(drawWaterGrip);
  const electroGrip = drawGrip(drawElectroGrip);
  const fishGrip = drawGrip(drawFishGrip);
  const frost = drawGrip(drawFrostGrip);
  const voidGrip = drawGrip(drawVoidGrip);
  const portal = drawGrip((ctx, cx, y) => drawPortalGrip(ctx, cx, y, '#3b82f6'));
  const chrono = drawGrip(drawChronoGrip);
  const freeze = drawGrip(drawFreezeGrip);
  assert.ok(keepsTint(water.colors, '#14b8a6') && keepsTint(water.colors, '#a3e635'), 'Soaker grip keeps its teal/lime toy palette');
  assert.ok(keepsTint(electroGrip.colors, '#22d3ee') && keepsTint(electroGrip.colors, '#d97732'), 'Electro grip pairs its live cyan conductor with copper windings');
  assert.ok(keepsTint(fishGrip.colors, '#38bdf8') && keepsTint(fishGrip.colors, '#fb923c'), 'Fish Gun grip uses aquarium blue and a fin-like amber cap');
  assert.ok(keepsTint(frost.colors, '#bae6fd') && keepsTint(frost.colors, '#7dd3fc'), 'Snowball grip keeps its frosted blue palette');
  assert.ok(keepsTint(voidGrip.colors, '#a855f7') && keepsTint(voidGrip.colors, '#d8b4fe'), 'Black Hole grip keeps its violet containment accents');
  assert.ok(keepsTint(portal.colors, '#3b82f6'), 'Portal grip carries the weapon portal accent');
  assert.ok(keepsTint(chrono.colors, '#b45309') && keepsTint(chrono.colors, '#fbbf24'), 'Chrono grip uses walnut and timepiece gold');
  assert.ok(keepsTint(freeze.colors, '#67e8f9') && keepsTint(freeze.colors, '#075985'), 'Freeze Ray grip has a distinct cryogenic cyan core and deep-teal palm panel');
  assert.notDeepEqual(water.events, frost.events, 'water and snow grips have distinct molded details');
  assert.notDeepEqual(frost.events, voidGrip.events, 'frost and void grips have distinct silhouettes');
  assert.notDeepEqual(portal.events, chrono.events, 'Portal and Chrono grips have distinct silhouettes');
  for (const [name, grip] of [['water', water], ['fish', fishGrip], ['electro', electroGrip], ['snow', frost], ['void', voidGrip], ['portal', portal], ['chrono', chrono], ['freeze', freeze]] as const) {
    assert.ok(grip.events.some(event => event.startsWith('rotate:-0.72')), `${name} handle angles downward like the Golden Gun grip`);
  }
  for (const [name, grip] of [['Super Soaker', water], ['Fish Gun', fishGrip], ['Electro Gun', electroGrip], ['Portal Gun', portal], ['Chrono Gun', chrono], ['Freeze Ray', freeze]] as const) {
    const hasSharpHeel = grip.events.some(event => {
      if (!event.startsWith('lineTo:')) return false;
      const [, y] = event.slice('lineTo:'.length).split(',').map(Number);
      return y >= 95;
    });
    assert.ok(hasSharpHeel, `${name} grip ends in a defined angled heel rather than a rounded blunt end`);
  }
  const actualBlackHole: string[] = [];
  drawGunCentered(canvasArt(actualBlackHole), 'blackhole', 0);
  assert.ok(actualBlackHole.some(event => event.startsWith('rotate(-0.72')), 'the active Black Hole renderer uses its angled violet grip');
  for (const id of ['portal', 'chrono', 'freeze', 'fish', 'electro'] as const) {
    const events: string[] = [];
    drawGunCentered(canvasArt(events), id, 0);
    assert.ok(events.some(event => event.startsWith('rotate(-0.72')), `${id} renderer uses its angled themed grip`);
  }
  const cricketEvents: string[] = [];
  drawGunCentered(canvasArt(cricketEvents), 'cricket', 0);
  assert.ok(cricketEvents.length > 30, 'Noisy Cricket renders its redesigned miniature receiver and emitter');
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
