import test from 'node:test';
import assert from 'node:assert/strict';
import { Game, makeLevel } from '../src/games/gunhit/game/Game';
import { DiamondRock } from '../src/games/gunhit/game/art/diamondRock';
import { getWeapon } from '../src/games/gunhit/game/weapons';
import { throwTreasureCoins, advanceTreasureCoins, type TreasureCoin } from '../src/games/gunhit/game/treasureShower';

test('Arcade progression includes playable rock, coin bonus, boss, then treasure', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(n => makeLevel(n).mode),
    ['classic', 'classic', 'boulder', 'bonus', 'classic', 'treasure']);
  assert.equal(makeLevel(5).boss, true);
  assert.equal(makeLevel(10).boss, true); // bosses always take priority
  assert.equal(makeLevel(13).mode, 'double'); // original double-gun mode survives
  assert.equal(makeLevel(14).mode, 'bonus');
  assert.equal(makeLevel(16).mode, 'treasure');
  assert.equal(makeLevel(17).mode, 'boulder');
  for (const n of [3, 4, 6]) {
    const level = makeLevel(n);
    assert.equal(level.old + level.spikes + level.coins, 0);
    assert.equal(level.ammo, 12); // renewable magazine on timed stages
  }
  assert.equal(makeLevel(3).radius, 166); // the full-size Diamond Breaker rock
  assert.equal(makeLevel(4).radius, 166);
});

test('Diamond Breaker rock has individually breakable chunks and a protected diamond core', () => {
  for (let run = 0; run < 12; run++) {
    const rock = new DiamondRock();
    assert.equal(rock.total, 92);
    assert.equal(rock.remaining, rock.total);
    assert.equal(rock.hitAt({ x: 0, y: 0 }, 4, 43)?.kind, 'diamond');
    assert.equal(rock.remaining, rock.total);
    assert.equal(rock.hitAt({ x: 235, y: 0 }, 4, 43), null);

    // The stone outline is jagged, so scan several angles until one shot lands.
    const hits = Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      return rock.hitAt({ x: Math.cos(a) * 181, y: Math.sin(a) * 181 }, 4, 43);
    });
    assert.ok(hits.some(hit => hit?.kind === 'rock' && hit.broken.length > 0));
    assert.ok(rock.remaining > 0, 'one volley should not shatter the entire boulder');
    assert.ok(rock.remaining < rock.total, 'chunks disappear where the shots landed');
  }
});

test('star upgrades pause the game until chosen and affect either type of stage', () => {
  const game = Object.create(Game.prototype) as Game & { choosingBuff: boolean; ammoLeft: number; maxAmmoMult: number; treasureBuff: string | null };
  Object.assign(game, { level: makeLevel(3), weapon: getWeapon('pistol'), choosingBuff: true, ammoLeft: 4, maxAmmoMult: 1, treasureBuff: null });
  game.applyBuff('ammo');
  assert.equal(game.choosingBuff, false);
  assert.equal(game.ammoLeft, 16);
  assert.equal(game.maxAmmoMult, 2);

  Object.assign(game, { level: makeLevel(6), choosingBuff: true });
  game.applyBuff('power'); // ordinary upgrades cannot silently dismiss a treasure star
  assert.equal(game.choosingBuff, true);
  game.applyBuff('double');
  assert.equal(game.choosingBuff, false);
  assert.equal(game.treasureBuff, 'double');
  assert.equal((game as unknown as { twinGuns: boolean }).twinGuns, true);
  assert.deepEqual((game as unknown as { gunOffsets: number[] }).gunOffsets, [-30, 30]);

  // The same selectable pair is available on normal/rock stages too.
  Object.assign(game, { level: makeLevel(3), choosingBuff: true, twinGuns: false });
  game.applyBuff('double');
  assert.equal(game.choosingBuff, false);
  assert.equal((game as unknown as { twinGuns: boolean }).twinGuns, true);
});

test('floating star traverses the gap instead of steering the weapon', () => {
  const game = Object.create(Game.prototype) as Game & {
    spawnFloatingStar(): void;
    tryTapStar(x: number, y: number): boolean;
    star: { x: number; y: number; baseY: number; vx: number; r: number } | null;
    choosingBuff: boolean;
  };
  Object.assign(game, {
    level: makeLevel(3), state: 'play', star: null, choosingBuff: false,
    particles: [], projs: [], flashWhite: 0, holding: false,
    sink: { push: () => {}, light: () => {} },
    events: { onStarHit: () => {} },
  });
  game.spawnFloatingStar();
  assert.ok(game.star);
  assert.ok(game.star.x < 0 || game.star.x > 420);
  assert.ok(game.star.baseY > 282 + game.level.radius + game.star.r);
  assert.ok(game.star.baseY + game.star.r < 575);
  assert.equal(Math.sign(game.star.vx), game.star.x < 0 ? 1 : -1);
  assert.equal(game.tryTapStar(game.star.x, game.star.y), true);
  assert.equal(game.choosingBuff, true);
  assert.equal(game.star, null);

  // A projectile can also catch the passing star without aiming the gun.
  Object.assign(game, {
    choosingBuff: false, weapon: { half: 4.75 },
    star: { x: 210, y: 490, baseY: 490, vx: 140, age: 1, life: 5, max: 6, r: 26 },
  });
  const shot = (game as unknown as { stepProj(p: { x: number; y: number }): { res: string } })
    .stepProj({ x: 210, y: 490 });
  assert.equal(shot.res, 'hit');
  assert.equal(game.choosingBuff, true);
  assert.equal(game.star, null);
});

test('bonus rings and stage banking award coins only once', () => {
  const getCoins = Game.prototype as unknown as { buildBonusCoins(): { radius: number; taken: boolean }[] };
  const coins = getCoins.buildBonusCoins();
  assert.equal(coins.length, 48);
  assert.deepEqual([96, 132, 168].map(r => coins.filter(c => c.radius === r).length), [12, 16, 20]);

  const awards: { mode: string; level: number; coins: number }[] = [];
  const game = Object.create(Game.prototype) as Game & { finishSpecialStage(): void };
  Object.assign(game, {
    level: makeLevel(4), state: 'play', stageStartCoins: 3, coins: 17,
    bankedCoins: 0, score: 100, shake: 0, particles: [], projs: [{}],
    star: { x: 1 }, holding: true, choosingBuff: false,
    sink: { light: () => {} },
    events: { onStageReward: (mode: string, level: number, earned: number) => awards.push({ mode, level, coins: earned }) },
  });
  game.finishSpecialStage();
  game.finishSpecialStage();
  assert.equal(game.state, 'clear');
  assert.equal(game.coins, 17);
  assert.deepEqual(awards, [{ mode: 'bonus', level: 4, coins: 14 }]);
  assert.equal((game as unknown as { bankedCoins: number }).bankedCoins, 14);

  // The diamond-clear reward is granted once, separately from the coin round.
  Object.assign(game, { level: makeLevel(3), state: 'play', stageStartCoins: 17, bankedCoins: 14, stageRewardPaid: false });
  game.finishSpecialStage();
  game.finishSpecialStage();
  assert.equal(game.coins, 20);
  assert.equal((game as unknown as { bankedCoins: number }).bankedCoins, 17);
  assert.deepEqual(awards[1], { mode: 'boulder', level: 3, coins: 3 });
  assert.equal(awards.length, 2);
});

test('every dual-gun stage fires, flashes and charges at both real muzzles', () => {
  for (const levelNumber of [3, 6, 13]) {
    const lights: number[] = [];
    const game = Object.create(Game.prototype) as Game & {
      projs: { x: number; originX: number }[];
      particles: { kind: string; x: number }[];
      twinGuns: boolean;
    };
    Object.assign(game, {
      level: makeLevel(levelNumber), state: 'play', weapon: getWeapon('plasma'),
      twinGuns: true, projs: [], particles: [], beams: [], ammoLeft: 12,
      cooldown: 0, reloadT: 0, speedMult: 1, chargeLevel: 0, rt: 0,
      recoil: 0, muzzle: 0, shake: 0, camY: 0,
      sink: { push: () => {}, light: (x: number) => lights.push(x) },
    });
    game.shoot();
    assert.deepEqual(game.projs.map(p => p.x).sort((a, b) => a - b), [180, 240]);
    assert.deepEqual(game.projs.map(p => p.originX).sort((a, b) => a - b), [180, 240]);
    assert.deepEqual(lights.slice(0, 2), [180, 240], `muzzle flashes on level ${levelNumber}`);
    assert.deepEqual(game.particles.filter(p => p.kind === 'ring').map(p => p.x), [180, 240]);
    assert.ok(!game.particles.some(p => p.x === 210 && p.kind === 'ring'), 'no phantom middle muzzle');
  }
});

test('rounds embedded in a real stone chunk tumble with that same chunk', () => {
  const game = Object.create(Game.prototype) as Game & {
    detachRockCells(cells: { id: number; x: number; y: number }[]): void;
    rockBullets: { cellId?: number; x: number; y: number }[];
    fallenCells: { id: number; cx: number; cy: number; bullets: { cellId?: number; x: number; y: number }[] }[];
  };
  const shot = { cellId: 7, x: 12, y: 92, angle: 0, w: 'pistol', scale: 1, big: 0, age: 0 };
  Object.assign(game, {
    level: makeLevel(3), rockBullets: [shot, { ...shot, cellId: 8 }],
    fallenCells: [], rot: 0, bump: 0,
  });
  game.detachRockCells([{ id: 7, x: 15, y: 87 }]);
  assert.equal(game.fallenCells.length, 1);
  assert.equal(game.fallenCells[0].id, 7);
  assert.equal(game.fallenCells[0].bullets[0], shot, 'bullet stays rigidly attached to the falling cell');
  assert.equal(game.rockBullets.length, 1);
  assert.equal(game.rockBullets[0].cellId, 8, 'bullet on intact stone stays in the spinning target');
});

test('treasure coins bounce and credit gradually without losing or duplicating their value', () => {
  const shower = throwTreasureCoins(210, 282, 13, () => 0.5);
  assert.equal(shower.length, 6);
  assert.equal(shower.reduce((total, c) => total + c.value, 0), 13);
  let bounces = 0;
  const arrivals: number[] = [];
  let earned = 0;
  for (let frame = 0; frame < 300 && shower.length; frame++) {
    const value = advanceTreasureCoins(shower, 1 / 60, () => bounces++);
    if (value) { earned += value; arrivals.push(frame); }
  }
  assert.equal(shower.length, 0);
  assert.equal(earned, 13);
  assert.ok(bounces >= 12, 'every coin lands and bounces before it is collected');
  assert.ok(new Set(arrivals).size >= 3, 'the counter ticks up over multiple frames, not in one jump');

  const deposits: number[] = [];
  const awards: number[] = [];
  const game = Object.create(Game.prototype) as Game & {
    finishSpecialStage(): void;
    updateTreasureShower(dt: number): void;
    treasureCoins: TreasureCoin[];
    bankedCoins: number;
    time: number;
  };
  Object.assign(game, {
    level: makeLevel(6), state: 'play', stageStartCoins: 4, coins: 4, score: 0,
    stageRewardPaid: false, bankedCoins: 3, time: 0, lastCoinSound: -10,
    coinPulse: 0, treasureCoins: throwTreasureCoins(210, 282, 6, () => 0.5),
    shake: 0, flashWhite: 0, particles: [], projs: [], star: null,
    holding: false, choosingBuff: false, stateT: 0,
    sink: { light: () => {}, push: () => {} },
    events: {
      onTreasureCoin: (amount: number) => deposits.push(amount),
      onStageReward: (_mode: string, _level: number, amount: number) => awards.push(amount),
    },
  });
  game.finishSpecialStage();
  assert.equal(game.coins, 4, 'shooting itself does not credit coins');
  assert.deepEqual(awards, [], 'stage reward waits for the flying coins');
  for (let frame = 0; frame < 300 && game.treasureCoins.length; frame++) {
    game.time += 1 / 60;
    game.updateTreasureShower(1 / 60);
  }
  assert.equal(game.coins, 10);
  assert.equal(game.bankedCoins, 9);
  assert.equal(deposits.reduce((a, b) => a + b, 0), 6);
  assert.deepEqual(awards, [0], 'coins already saved on arrival cannot be paid twice');
  game.finishSpecialStage();
  game.updateTreasureShower(1 / 60);
  assert.deepEqual(awards, [0]);
});
