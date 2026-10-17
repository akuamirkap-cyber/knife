import assert from 'node:assert/strict';
import test from 'node:test';
import { Game as GunHit } from '../src/games/gunhit/game/Game';
import { Game as RifleRock } from '../src/games/rifle-rock/game/engine';
import { GUN_SUNBURST_RGB, gunSunburstColor } from '../src/games/gunhit/game/sunburstPalette';
import { getWeapon, type Rarity } from '../src/games/gunhit/game/weapons';

test('Gun Hit tiers have their own FX Lab rays, including every equipped weapon', () => {
  const tiers: Rarity[] = ['UMUM', 'LANGKA', 'EPIC', 'LEGENDARIS'];
  assert.deepEqual(Object.keys(GUN_SUNBURST_RGB), tiers);
  assert.equal(new Set(tiers.map(gunSunburstColor)).size, 4);
  for (const id of ['pistol', 'plasma', 'cricket', 'golden'] as const) {
    const color = gunSunburstColor(getWeapon(id).rarity);
    assert.match(color, /^\d{1,3},\d{1,3},\d{1,3}$/);
  }
});

test('Gun Hit and Diamond Breaker cancel RAF on blur and schedule only on return', () => {
  const savedFrame = globalThis.requestAnimationFrame;
  const savedCancel = globalThis.cancelAnimationFrame;
  let frames = 0;
  const cancelled: number[] = [];
  globalThis.requestAnimationFrame = () => ++frames;
  globalThis.cancelAnimationFrame = (id) => { cancelled.push(id); };
  try {
    for (const GameEngine of [GunHit, RifleRock]) {
      // No DOM needed: setActive owns only the animation lifecycle. The
      // browser integration checks that each live canvas actually freezes.
      const engine = Object.create(GameEngine.prototype) as InstanceType<typeof GameEngine>;
      const state = engine as unknown as Record<string, unknown>;
      state.active = false;
      state.raf = 0;
      state.holding = true;
      state.firing = true;
      state.aiming = true;
      state.charging = true;

      engine.setActive(false);
      assert.equal(state.raf, 0);
      engine.setActive(true);
      const first = state.raf as number;
      assert.equal(first, frames);
      engine.setActive(true);
      assert.equal(frames, first, 'no second loop on redundant focus');
      engine.setActive(false);
      assert.ok(cancelled.includes(first));
      assert.equal(state.raf, 0);
      engine.setActive(false);
      assert.equal(cancelled.filter((id) => id === first).length, 1);
      engine.setActive(true);
      assert.equal(state.raf, first + 1, 'resuming creates one fresh loop');
      engine.setActive(false);
      if (GameEngine === GunHit) {
        assert.equal(state.holding, false);
        assert.equal(state.aiming, false);
        assert.equal(state.charging, false);
      } else {
        assert.equal(state.firing, false);
      }
    }
  } finally {
    globalThis.requestAnimationFrame = savedFrame;
    globalThis.cancelAnimationFrame = savedCancel;
  }
});
