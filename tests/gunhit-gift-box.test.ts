import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  GIFT_RARITY_WEIGHT,
  WEAPONS,
  rollGiftWeapon,
  type Rarity,
} from '../src/games/gunhit/game/weapons';
import { BossGiftBoxModal, giftBoxCoins } from '../src/games/gunhit/components/BossGiftBoxModal';

const ROOT = path.resolve(import.meta.dirname, '..');

test('rollGiftWeapon mengambil senjata dari katalog Gun Hit dan mengkecualikan senjata aktif', () => {
  const rarities = new Set<Rarity>(WEAPONS.map((w) => w.rarity));
  for (const r of rarities) assert.ok(GIFT_RARITY_WEIGHT[r] > 0, `bobot rarity ${r} harus > 0`);

  const current = WEAPONS[0].id;
  for (let i = 0; i < 200; i++) {
    const rolled = rollGiftWeapon(current);
    assert.ok(WEAPONS.some((w) => w.id === rolled.id), 'hasil roll harus ada di WEAPONS');
    assert.notEqual(rolled.id, current, 'senjata yang sedang dipakai tidak boleh jadi hadiah');
    assert.ok(GIFT_RARITY_WEIGHT[rolled.rarity] > 0);
  }
  // eksklusi penuh: panggil berulang dengan excludeId berbeda tetap valid
  for (const w of WEAPONS) {
    const rolled = rollGiftWeapon(w.id);
    assert.notEqual(rolled.id, w.id);
    assert.ok(WEAPONS.some((x) => x.id === rolled.id));
  }
});

test('koin bonus kotak hadiah naik per stage dan per rarity', () => {
  const stage5 = giftBoxCoins(5, 'UMUM');
  const stage50 = giftBoxCoins(50, 'UMUM');
  assert.ok(stage50 > stage5, 'koin naik mengikuti stage');
  const order: Rarity[] = ['UMUM', 'LANGKA', 'EPIC', 'LEGENDARIS'];
  for (let i = 1; i < order.length; i++) {
    assert.ok(giftBoxCoins(10, order[i]) > giftBoxCoins(10, order[i - 1]), `rarity ${order[i]} harus lebih besar`);
  }
});

test('BossGiftBoxModal memakai kotak hadiah & efek Knife, tapi senjata dari data Gun Hit', () => {
  const src = readFileSync(path.join(ROOT, 'src/games/gunhit/components/BossGiftBoxModal.tsx'), 'utf8');
  // efek & art kotak hadiah yang sama dengan slide Knife Boss 100 Lv
  for (const needle of [
    "from '../../knife-hit/components/Art'",
    "from '../../knife-hit/components/Effects'",
    "from '../../knife-hit/sfx'",
    'GiftBoxLid',
    'GiftBoxBody',
    'drop-in',
    'lid-fly',
    'box-sink',
    'weapon-rise',
    'seam-pulse',
    'tap-hint',
  ]) {
    assert.ok(src.includes(needle), `BossGiftBoxModal harus memakai ${needle}`);
  }
  // senjata & warna rarity dari data Gun Hit
  assert.match(src, /rollGiftWeapon/);
  assert.match(src, /RARITY_COLOR/);
  assert.match(src, /drawGunCentered/);

  // smoke render: komponen bisa dirender dengan data senjata Gun Hit
  const html = renderToStaticMarkup(
    createElement(BossGiftBoxModal, {
      bossName: 'MECHA',
      stage: 12,
      currentWeaponId: WEAPONS[0].id,
      onClaim: () => {},
    }),
  );
  // Judul LetterPop terpecah per huruf; pastikan ada animasi huruf + copy khas box stage
  assert.match(html, /letter-pop/);
  assert.match(html, /drop-in/);
  assert.match(html, /BONUS REWARD STAGE/);
  assert.match(html, /Kotak hadiah boss didapat/);
});

test('alur boss Gun Hit memakai BossGiftBoxModal sebagai bonus stage', () => {
  const app = readFileSync(path.join(ROOT, 'src/games/gunhit/App.tsx'), 'utf8');
  assert.match(app, /import \{ BossGiftBoxModal \}/);
  assert.match(app, /<BossGiftBoxModal/);
  assert.match(app, /onClaim=\{handleGiftBoxClaim\}/);
  assert.match(app, /setBonusStageOpen\(true\)/);
});
