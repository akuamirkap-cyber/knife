import assert from 'node:assert/strict';
import test from 'node:test';
import { bossXpReward, getPlayerProgress, PLAYER_XP_PER_LEVEL } from '../src/games/gunhit/game/playerProgress';

test('persistent player XP maps cleanly to level progress, independently of stage number', () => {
  assert.equal(PLAYER_XP_PER_LEVEL, 100);
  assert.deepEqual(getPlayerProgress(0), { level: 1, xp: 0 });
  assert.deepEqual(getPlayerProgress(95), { level: 1, xp: 95 });
  assert.deepEqual(getPlayerProgress(105), { level: 2, xp: 5 });
  assert.deepEqual(getPlayerProgress(-4), { level: 1, xp: 0 });
});

test('boss rewards add XP to the player level track', () => {
  assert.equal(bossXpReward(5), 45);
  assert.equal(bossXpReward(10), 55);
  assert.equal(bossXpReward(0), 35);
});
