import test from 'node:test';
import assert from 'node:assert/strict';
import { MILESTONES, QUESTS, type QuestState } from '../src/games/gunhit/game/quests';
import { getWeapon } from '../src/games/gunhit/game/weapons';

const stats: QuestState = {
  claimed: [], milestonesClaimed: [], maxCombo: 0, totalCoinsCollected: 0,
  highestScore: 0, highestLevel: 1, stagesWon: 0, bossesDefeated: 0,
  boxesOpened: 0, weaponEquips: 0, shotsFired: 0, highestPlayerLevel: 0,
};

test('Gun Hit achievements follow the DAILY and SKILL board structure', () => {
  assert.equal(QUESTS.length, 23);
  assert.equal(QUESTS.filter(q => q.category === 'daily').length, 6);
  assert.equal(QUESTS.filter(q => q.category === 'skill').length, 17);
  assert.equal(new Set(QUESTS.map(q => q.id)).size, QUESTS.length);
  for (const q of QUESTS) {
    assert.ok(q.title && q.desc && q.icon);
    assert.ok(q.target > 0 && q.rewardCoins > 0);
    assert.equal(q.progress(stats, 0), 0, `${q.id} starts at zero progress`);
  }
});

test('milestones award 5/10/20 non-LANGKA weapons only', () => {
  assert.deepEqual(MILESTONES.map(m => m.count), [5, 10, 20]);
  assert.deepEqual(MILESTONES.map(m => m.rarity), ['UMUM', 'EPIC', 'LEGENDARIS']);
  for (const q of QUESTS) {
    if (q.rewardWeapon) assert.notEqual(getWeapon(q.rewardWeapon).rarity, 'LANGKA', `${q.id} must not grant LANGKA`);
  }
});

test('achievement progress is bound to the gameplay action represented by each mission', () => {
  const sample: QuestState = {
    ...stats, totalCoinsCollected: 27, stagesWon: 4, bossesDefeated: 2,
    boxesOpened: 3, weaponEquips: 1, shotsFired: 14, highestPlayerLevel: 5,
  };
  const progress = (id: string) => QUESTS.find(q => q.id === id)!.progress(sample, 3);
  assert.equal(progress('d-stage'), 4);
  assert.equal(progress('d-boss'), 2);
  assert.equal(progress('d-box'), 3);
  assert.equal(progress('d-equip'), 1);
  assert.equal(progress('d-shots'), 14);
  assert.equal(progress('d-coins'), 27);
  assert.equal(progress('s-col3'), 3);
  assert.equal(progress('s-playerlevel5'), 5);
});
