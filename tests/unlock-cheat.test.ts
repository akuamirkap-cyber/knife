import assert from 'node:assert/strict';
import test from 'node:test';
import { ACHIEVEMENTS, MILESTONES } from '../src/games/knife-hit/achievements';
import { isUnlocked, unlockEverythingPatch } from '../src/games/knife-hit/progress';
import { MAX_LEVEL } from '../src/games/knife-hit/stages';
import { WEAPONS as KNIFE_WEAPONS } from '../src/games/knife-hit/weapons';
import { GUN_HIT_MAP_MAX_LEVEL } from '../src/games/gunhit/game/stageMap';
import { isWeaponUnlocked, WEAPONS as GUN_WEAPONS } from '../src/games/gunhit/game/weapons';

test('cheat C (knife-hit): patch membuka semua level 1..100', () => {
  const patch = unlockEverythingPatch();
  assert.equal(patch.highestUnlocked, MAX_LEVEL);
  for (let lv = 1; lv <= MAX_LEVEL; lv++) {
    assert.ok(isUnlocked(lv, patch.highestUnlocked ?? 0), `level ${lv} harus terbuka`);
  }
});

test('cheat C (knife-hit): patch membuka semua senjata, achievement, dan milestone', () => {
  const patch = unlockEverythingPatch();
  assert.deepEqual(
    [...(patch.unlockedWeapons ?? [])].sort(),
    [...KNIFE_WEAPONS.map((w) => w.id)].sort(),
  );
  assert.deepEqual(
    [...(patch.claimedAch ?? [])].sort(),
    [...ACHIEVEMENTS.map((a) => a.id)].sort(),
  );
  assert.deepEqual(
    [...(patch.milestonesClaimed ?? [])].sort((a, b) => a - b),
    [...MILESTONES.map((m) => m.count)].sort((a, b) => a - b),
  );
});

test('cheat C (gunhit): seluruh senjata UMUM+LANGKA+EPIC+LEGENDARIS terbuka begitu dimiliki', () => {
  const normal = GUN_WEAPONS.filter((w) => w.rarity !== 'LANGKA').map((w) => w.id);
  const rare = GUN_WEAPONS.filter((w) => w.rarity === 'LANGKA').map((w) => w.id);
  const all = [...normal, ...rare];
  assert.equal(new Set(all).size, GUN_WEAPONS.length);
  for (const w of GUN_WEAPONS) {
    assert.ok(isWeaponUnlocked(w, all), `${w.id} harus terbuka`);
  }
});

test('cheat C (gunhit): peta level terbuka penuh sampai GUN_HIT_MAP_MAX_LEVEL', () => {
  assert.equal(GUN_HIT_MAP_MAX_LEVEL, 100);
});
