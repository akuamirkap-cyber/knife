import test from 'node:test';
import assert from 'node:assert/strict';
import { bossFireInterval, bossRiseOffset, makeLevel } from '../src/games/gunhit/game/Game';

test('boss fights give bosses twice the health and twice the player-shot quota', () => {
  for (const levelNumber of [5, 10, 15, 20, 25]) {
    const level = makeLevel(levelNumber);
    const oldQuota = Math.min(5 + Math.floor(levelNumber * 0.5), 13) + 2;
    assert.equal(level.boss, true);
    assert.equal(level.ammo, oldQuota * 2, `boss level ${levelNumber} must allow twice as many hits`);
    assert.equal(level.ammo * 10, oldQuota * 20, `boss level ${levelNumber} health must be double the old max`);
  }
});

test('bosses rise and return with a smooth pause at their original position', () => {
  assert.equal(bossRiseOffset(0), 0);
  assert.equal(bossRiseOffset(2), 0);
  assert.ok(bossRiseOffset(2.65) > 0 && bossRiseOffset(2.65) < 58, 'rise eases smoothly');
  assert.equal(bossRiseOffset(3.3), 58, 'boss holds its raised position briefly');
  assert.equal(bossRiseOffset(4.6), 58);
  assert.ok(bossRiseOffset(5.25) > 0 && bossRiseOffset(5.25) < 58, 'return eases smoothly');
  assert.equal(bossRiseOffset(5.9), 0);
  assert.equal(bossRiseOffset(8), 0, 'player gets a rest at the original position');
  assert.equal(bossRiseOffset(10), 0, 'movement pattern loops cleanly');
});

test('bosses shoot more often than their normal roster fire intervals', () => {
  for (const baseInterval of [1.9, 2.0, 2.2, 2.3]) {
    const fastest = bossFireInterval(baseInterval, -0.18);
    const slowest = bossFireInterval(baseInterval, 0.22);
    assert.ok(fastest > 1 && fastest < baseInterval);
    assert.ok(slowest < baseInterval);
    assert.ok(slowest > fastest);
  }
});
