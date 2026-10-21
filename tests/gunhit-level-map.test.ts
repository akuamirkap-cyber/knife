import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { makeLevel } from '../src/games/gunhit/game/Game';
import { getGunHitMapBoss, getGunHitMapNodeCaption, getGunHitMapNodeTheme, getGunHitMapStage, GUN_HIT_MAP_BOSS_NAMES, GUN_HIT_MAP_MAX_LEVEL } from '../src/games/gunhit/game/stageMap';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (file: string) => readFileSync(path.join(ROOT, file), 'utf8');

test('the 100-stage SGA map mirrors the existing normal, special, boss cycle', () => {
  assert.equal(GUN_HIT_MAP_MAX_LEVEL, 100);
  for (let stage = 1; stage <= GUN_HIT_MAP_MAX_LEVEL; stage++) {
    const actual = makeLevel(stage);
    const expected = actual.boss ? 'boss'
      : ['boulder', 'bonus', 'treasure'].includes(actual.mode) ? 'special'
      : 'normal';
    assert.equal(getGunHitMapStage(stage), expected, `map stage ${stage} must match Game.makeLevel`);
  }
});

test('the 20 map cycles use the user-provided icon and boss names exactly', () => {
  const rows = [
    ['Gentong', 'Perisai', 'Goblin', 'Dark Knight'],
    ['Bijih besi', 'Landasan', 'Prajurit', 'Iron Knight'],
    ['Lentera gelap', 'Perisai hitam', 'Bayangan', 'Shadow Knight'],
    ['Mahkota', 'Perisai kerajaan', 'Pengawal', 'Royal Knight'],
    ['Kristal void', 'Perisai retak', 'Penjaga gelap', 'Void Knight'],
    ['Lentera Jepang', 'Topeng Oni', 'Goblin samurai', 'Oni Demon'],
    ['Arang', 'Perisai api', 'Penjaga merah', 'Flame Oni'],
    ['Genderang', 'Tameng', 'Prajurit Oni', 'War Oni'],
    ['Mahkota iblis', 'Segel', 'Pengawal iblis', 'Demon Emperor'],
    ['Bendera', 'Katana', 'Samurai', 'Oni Shogun'],
    ['Roda gigi', 'Pelat baja', 'Robot penjaga', 'Mecha Cyborg'],
    ['Chip', 'Perisai energi', 'Drone', 'Cyber Warden'],
    ['Inti reaktor', 'Armor berat', 'Robot tempur', 'Omega Mecha'],
    ['Kristal energi', 'Kubah', 'Drone plasma', 'Nova Cyborg'],
    ['Baterai', 'Armor berat', 'Robot elit', 'Final Mecha'],
    ['Tong mesiu', 'Jangkar', 'Bajak laut', 'Pirate Lord'],
    ['Lentera hantu', 'Jangkar karat', 'Kerangka', 'Ghost Captain'],
    ['Kompas', 'Meriam', 'Penjaga kerangka', 'Cursed Admiral'],
    ['Mutiara gelap', 'Karang', 'Penjaga laut', 'Abyss Pirate'],
    ['Peti harta', 'Pedang kerajaan', 'Pengawal elite', 'Pirate King'],
  ];
  assert.equal(GUN_HIT_MAP_BOSS_NAMES.length, 20);
  rows.forEach((row, cycle) => {
    const firstStage = cycle * 5 + 1;
    assert.deepEqual([0, 1, 2].map(offset => getGunHitMapNodeTheme(firstStage + offset).label), row.slice(0, 3));
    assert.equal(getGunHitMapNodeTheme(firstStage + 3).label, 'Spesial');
    assert.equal(getGunHitMapNodeTheme(firstStage + 4).label, row[3]);
    assert.equal(GUN_HIT_MAP_BOSS_NAMES[cycle], row[3]);
  });
  assert.equal(getGunHitMapNodeCaption(1), 'GENTONG LV1');
  assert.equal(getGunHitMapNodeCaption(3), 'GOBLIN LV3');
  assert.equal(getGunHitMapNodeCaption(5), 'DARK KNIGHT LV5');
  const map = read('src/games/gunhit/components/LevelMap.tsx');
  assert.ok(map.includes('>QUEST</h2>'));
  assert.ok(map.includes('getGunHitMapNodeTheme(level)'));
  assert.ok(map.includes('getGunHitMapNodeCaption(level)'));
});

test('map boss portraits follow the submitted five-boss faction groups while SGA combat roster remains unchanged', () => {
  const factions = ['knight', 'oni', 'cyborg', 'pirate'] as const;
  for (let bossNumber = 0; bossNumber < 20; bossNumber++) {
    assert.equal(getGunHitMapBoss((bossNumber + 1) * 5), factions[Math.floor(bossNumber / 5)]);
  }
  assert.deepEqual([5, 10, 15, 20, 25].map(stage => makeLevel(stage).style), ['knight', 'oni', 'cyborg', 'pirate', 'knight']);
});

test('all arcade slides are wired in the hub and the QUEST map keeps the SGB entrance effects', () => {
  const app = read('src/App.tsx');
  const map = read('src/games/gunhit/components/LevelMap.tsx');
  // Hub ini memang "Arcade Hub": setiap game di src/games punya slide sendiri.
  assert.ok(app.includes("type SlideId = 'gunhit' | 'knife-hit' | 'rifle-rock' | 'sunburst'"));
  assert.ok(app.includes('KnifeHitGame'));
  assert.ok(app.includes('RifleRockGame'));
  assert.ok(app.includes('SunburstGame'));
  for (const id of ["id: 'gunhit'", "id: 'knife-hit'", "id: 'rifle-rock'", "id: 'sunburst'"]) {
    assert.ok(app.includes(id), `slide ${id} harus terdaftar di hub`);
  }
  for (const effect of ['fade-in', 'fade-up', 'tap-hint', 'ring-ping', 'thin-scroll']) {
    assert.ok(map.includes(effect), `SGA QUEST map reuses the ${effect} effect from SGB's map`);
  }
});

test('starting a map node launches that real SGA level without replacing stage generation', () => {
  const game = read('src/games/gunhit/game/Game.ts');
  const map = read('src/games/gunhit/components/LevelMap.tsx');
  const app = read('src/games/gunhit/App.tsx');
  assert.ok(game.includes('startAtLevel(level: number) { this.startRun(Math.max(1, Math.floor(level))); }'));
  assert.ok(map.includes('Stage spesial SGA: sistem tetap memilih Batu, Bonus, atau Harta Karun'));
  assert.ok(app.includes('gameRef.current?.startAtLevel(startingLevelRef.current)'));
});
