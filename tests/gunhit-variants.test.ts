import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getGunVariant, setGunVariant, getGunEffect, setGunEffect, supportsGunVariants,
  canChooseGunDesign, VARIANT_WEAPONS, EDITABLE_WEAPONS, FIXED_CLASSIC_WEAPONS,
  GUN_VARIANTS, GUN_EFFECTS, getGunVariantOptions, getGunEffectOptions,
  type GunVariant, type GunEffect, type VariantWeapon,
} from '../src/games/gunhit/game/art/gunVariants';
import { drawProjectile } from '../src/games/gunhit/game/art/projectiles';
import { drawMaterialTrail } from '../src/games/gunhit/game/art/projectileTrails';
import { drawClassicBeam, drawLaserBeam } from '../src/games/gunhit/game/art/beamEffects';
import { FX, spawnImpact, spawnMuzzle, type Particle } from '../src/games/gunhit/game/fx';
import { getGunMetrics } from '../src/games/gunhit/game/art/metrics';
import { drawGun } from '../src/games/gunhit/game/art/guns';
import { getWeapon, WEAPONS } from '../src/games/gunhit/game/weapons';

// Structural rendering probe that also validates every CanvasGradient stop.
// Browsers throw synchronously on an invalid stop (e.g. '#111' + '18'), which
// used to unmount the entire slide on the EPIC Arsenal tab.
function artContext(calls: string[]) {
  const gradient = { addColorStop: (_at: number, color: string) => {
    if (color.startsWith('#')) assert.match(color, /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i,
      `invalid CanvasGradient color stop: ${color}`);
  } };
  return new Proxy({}, {
    get: (_target, prop) => (...args: unknown[]) => {
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient') return gradient;
      if (prop === 'measureText') return { width: 30 };
      if (['beginPath', 'lineTo', 'roundRect', 'arc', 'bezierCurveTo', 'fill', 'stroke',
        'ellipse', 'quadraticCurveTo', 'fillRect'].includes(String(prop))) {
        calls.push(`${String(prop)}:${args.length}`);
      }
    },
    set: () => true,
  }) as CanvasRenderingContext2D;
}

function pathsFor(id: VariantWeapon, variant: GunVariant) {
  const calls: string[] = [];
  drawGun(artContext(calls), id, 0, 0, 0.8, 0, true, undefined, variant);
  return calls.join(',');
}

test('user loadouts use the requested classic/new combination; only real alternatives can be selected', () => {
  assert.deepEqual(GUN_VARIANTS.map(v => v.label), ['Sebelumnya', 'Sekarang', 'Terbaru']);
  assert.deepEqual(GUN_EFFECTS.map(v => v.label), ['Sebelumnya', 'Baru']);
  assert.equal(VARIANT_WEAPONS.length, 11);
  assert.equal(EDITABLE_WEAPONS.length, 8);
  assert.equal(getGunVariant('pistol'), 'current');
  assert.equal(getGunEffect('pistol'), 'new');
  for (const id of FIXED_CLASSIC_WEAPONS) {
    assert.equal(supportsGunVariants(id), true);
    assert.equal(canChooseGunDesign(id), false);
    assert.deepEqual(getGunVariantOptions(id).map(v => v.id), ['original']);
    assert.deepEqual(getGunEffectOptions(id).map(v => v.id), ['original']);
    assert.equal(getGunVariant(id), 'original');
    assert.equal(getGunEffect(id), 'original');
    assert.equal(pathsFor(id, 'original'), pathsFor(id, 'current'));
    assert.equal(pathsFor(id, 'original'), pathsFor(id, 'latest'));
    assert.equal(drawMaterialTrail(artContext([]), id, 'new'), false,
      `${id} never uses a new trail, even with a stale caller`);
  }
  const requested = {
    dragon: ['original', 'new'], rainbow: ['original', 'new'], meteor: ['original', 'new'],
    diamond: ['latest', 'new'], moonbeam: ['original', 'original'],
    golden: ['original', 'original'], honey: ['original', 'new'],
    chicken: ['latest', 'new'],
  } as const;
  for (const id of EDITABLE_WEAPONS) {
    assert.equal(canChooseGunDesign(id), true);
    assert.deepEqual([getGunVariant(id), getGunEffect(id)], requested[id]);
  }
  assert.deepEqual(getGunVariantOptions('honey').map(v => v.id), ['original', 'current']);
  assert.equal(getGunVariantOptions('chicken').length, 3);
  assert.equal(getGunEffectOptions('honey').length, 2);
  assert.equal(getGunMetrics('honey', 'latest').span, getGunMetrics('honey', 'current').span);
});

test('every offered design is a distinct full renderer without modifying weapon mechanics', () => {
  assert.equal(supportsGunVariants('pistol'), false);
  for (const id of EDITABLE_WEAPONS) {
    const weapon = getWeapon(id);
    const before = { speed: weapon.speed, stick: weapon.stick, rarity: weapon.rarity, perk: weapon.perk };
    const signatures = getGunVariantOptions(id).map(({ id: variant }) => pathsFor(id, variant));
    assert.ok(signatures.every(s => s.length > 100), `${id} must draw a whole gun`);
    assert.equal(new Set(signatures).size, signatures.length, `${id} must not label one drawing as two designs`);
    assert.deepEqual({ speed: weapon.speed, stick: weapon.stick, rarity: weapon.rarity, perk: weapon.perk }, before);
  }
});

test('Arsenal thumbnails never pass invalid colors to CanvasGradient, even after changing tabs', () => {
  for (const weapon of WEAPONS) {
    const calls: string[] = [];
    drawGun(artContext(calls), weapon.id, 0, 0, 0.8, 0);
    assert.ok(calls.length, `${weapon.id} thumbnail must render`);
  }
});

test('choices persist per weapon and the preview metrics follow the chosen silhouette', () => {
  const written: Record<string, string> = {};
  const old = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    setItem: (key: string, value: string) => { written[key] = value; },
  } });
  try {
    setGunVariant('diamond', 'original');
    setGunVariant('honey', 'current');
    setGunVariant('honey', 'latest'); // This version does not exist.
    assert.equal(getGunVariant('diamond'), 'original');
    assert.equal(getGunVariant('honey'), 'current');
    assert.equal(getGunVariant('dragon'), 'original');
    assert.equal(getGunMetrics('diamond').span, getGunMetrics('diamond', 'original').span);
    assert.notEqual(getGunMetrics('diamond').span, getGunMetrics('diamond', 'latest').span);
    const persisted = JSON.parse(written['gunhit:gun-designs:v2']);
    assert.equal(persisted.diamond, 'original');
    assert.equal(persisted.honey, 'current');
  } finally {
    setGunVariant('diamond', 'latest');
    setGunVariant('honey', 'original');
    if (old) Object.defineProperty(globalThis, 'localStorage', old);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

function effectArt(id: VariantWeapon, effect: GunEffect) {
  const calls: string[] = [];
  const ctx = artContext(calls);
  if (id === 'laser') {
    if (effect === 'original') drawClassicBeam(ctx, 0, 5, 100, 0.9, getWeapon(id).trail);
    else drawLaserBeam(ctx, 0, 5, 100, 0.9, 0.8);
  } else {
    drawMaterialTrail(ctx, id, effect);
    drawProjectile(ctx, id, 40, 0.8, 0, false, effect);
  }
  return calls.join(',');
}

test('eight editable guns show the old and new actual shot renderers', () => {
  for (const id of EDITABLE_WEAPONS) {
    const oldArt = effectArt(id, 'original');
    const newArt = effectArt(id, 'new');
    assert.ok(oldArt.length > 30 && newArt.length > 30, `${id} must draw both shots`);
    assert.notEqual(oldArt, newArt, `${id} must change its shot/beam, not just a label`);
  }
  for (const id of ['plasma', 'blackhole'] as const) {
    assert.equal(effectArt(id, 'new'), effectArt(id, 'original'), `${id} new shot retired`);
  }
});

test('honey old/new effects persist independently of design and leave gameplay rules intact', () => {
  const written: Record<string, string> = {};
  const old = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    setItem: (key: string, value: string) => { written[key] = value; },
  } });
  try {
    const honey = getWeapon('honey');
    const mechanics = { speed: honey.speed, stick: honey.stick, half: honey.half,
      points: honey.points, cooldown: honey.cooldown, recoil: honey.recoil };
    setGunEffect('honey', 'original');
    setGunEffect('chicken', 'new');
    setGunVariant('honey', 'current');
    assert.equal(getGunVariant('honey'), 'current');
    assert.equal(getGunEffect('honey'), 'original');
    assert.equal(getGunEffect('chicken'), 'new');
    assert.equal(getGunEffect('laser'), 'original');
    assert.equal(JSON.parse(written['gunhit:shot-effects:v2']).honey, 'original');
    assert.equal(JSON.parse(written['gunhit:shot-effects:v2']).chicken, 'new');
    assert.deepEqual({ speed: honey.speed, stick: honey.stick, half: honey.half,
      points: honey.points, cooldown: honey.cooldown, recoil: honey.recoil }, mechanics);
    const oldParticles: Particle[] = [], newParticles: Particle[] = [];
    const sink = (particles: Particle[]) => ({ push: (p: Particle) => particles.push(p), light: () => {} });
    spawnImpact(sink(oldParticles), FX.honey, honey, 210, 340, 0, -1, ['#aab6c6']);
    spawnMuzzle(sink(oldParticles), FX.honey, honey, 210, 570);
    setGunEffect('honey', 'new');
    spawnImpact(sink(newParticles), FX.honey, honey, 210, 340, 0, -1, ['#aab6c6']);
    spawnMuzzle(sink(newParticles), FX.honey, honey, 210, 570);
    assert.ok(oldParticles.length && newParticles.length);
    assert.notDeepEqual(oldParticles.map(p => p.kind).sort(), newParticles.map(p => p.kind).sort());
  } finally {
    setGunEffect('honey', 'new');
    setGunEffect('chicken', 'new');
    setGunVariant('honey', 'original');
    if (old) Object.defineProperty(globalThis, 'localStorage', old);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
