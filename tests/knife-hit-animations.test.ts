import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LetterPop } from '../src/games/knife-hit/components/Effects';

const ROOT = path.resolve(import.meta.dirname, '..');
const css = readFileSync(path.join(ROOT, 'src/index.css'), 'utf8');

/** Kelas animasi/style kustom Knife Hit (dari stylesheet asli game).
 *  Semua ini wajib ada di src/index.css — tanpa mereka layar kotak hadiah
 *  (BoxScreen) tampil rusak: kotak tidak jatuh, tutup tidak terbang,
 *  dan overlay .flash putih menutupi layar permanen. */
const KNIFE_HIT_CUSTOM_CLASSES = [
  // rays & particles
  'rays-in', 'shockwave', 'burst', 'confetti', 'flash', 'white-flash', 'twinkle', 'dust', 'score-pop', 'piece-fly',
  // gift box (kotak hadiah)
  'drop-in', 'idle-bob', 'wobble', 'violent', 'lid-fly', 'box-sink', 'seam-pulse',
  // weapon reveal
  'weapon-rise', 'float', 'heartbeat', 'reveal-pop', 'equip-spin',
  // ui
  'fade-up', 'fade-in', 'letter-pop', 'count-pulse', 'btn-breathe', 'tap-hint', 'ring-ping',
  'card-in', 'glow-breathe', 'progress-shine', 'title-float', 'shimmer-x', 'anim-border-flow', 'podium-spin',
  'premium-panel', 'glass-row',
  // bonus & treasure stages
  'coin-blink', 'coin-shine-move', 'coin-fly', 'coin-collect', 'bullet-fly', 'muzzle',
  'chest-open', 'chest-hit', 'chest-glow-pulse', 'dmg-pop', 'star-twinkle', 'star-trail', 'buff-flash',
];

function definedClasses(source: string): Set<string> {
  const out = new Set<string>();
  for (const m of source.matchAll(/\.([a-zA-Z][\w-]*)\s*(?:\{|,)/g)) out.add(m[1]);
  return out;
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(tsx?|css)$/.test(name)) acc.push(p);
  }
  return acc;
}

test('every Knife Hit custom animation class is defined in the shared stylesheet', () => {
  const defined = definedClasses(css);
  const missing = KNIFE_HIT_CUSTOM_CLASSES.filter((cls) => !defined.has(cls));
  assert.deepEqual(
    missing,
    [],
    `kelas animasi Knife Hit hilang dari src/index.css: ${missing.join(', ')}`,
  );
});

test('gift box open choreography has its keyframes, including the flash overlay opacity', () => {
  for (const kf of ['drop-in', 'lid-fly', 'box-sink', 'weapon-rise', 'seam-pulse', 'flash']) {
    assert.match(css, new RegExp(`@keyframes\\s+${kf}\\b`), `@keyframes ${kf} hilang`);
  }
  // Bug yang pernah ada: elemen .flash memakai bg-white tanpa opacity inline.
  // Keyframes wajib menganimasikan opacity dari/ke 0 agar layar tidak putih permanen.
  const flashBlock = css.match(/@keyframes\s+flash\s*\{[\s\S]*?\n\}/)?.[0] ?? '';
  assert.match(flashBlock, /opacity:\s*0/, '@keyframes flash harus mengembalikan opacity ke 0');
});

test('knife-hit flying coins use coin-fly while Rifle Rock keeps its coin-pop pulse', () => {
  const defined = definedClasses(css);
  assert.ok(defined.has('coin-fly'), 'kelas coin-fly (koin terbang --dx/--dy) belum ada');
  assert.ok(defined.has('coin-pop'), 'kelas coin-pop (denyut koin Rifle Rock) harus tetap ada');
  assert.notEqual(
    defined.has('coin-fly') && css.includes('animation: coin-fly'),
    false,
  );

  const special = readFileSync(
    path.join(ROOT, 'src/games/knife-hit/components/SpecialStages.tsx'),
    'utf8',
  );
  assert.match(special, /className="coin-fly\b/, 'koin terbang di SpecialStages harus memakai coin-fly');
  assert.doesNotMatch(special, /className="coin-pop\b/, 'coin-pop tidak boleh dipakai Knife Hit (bentrok dengan Rifle Rock)');
});

test('no knife-hit component references a custom animation class missing from the stylesheet', () => {
  const defined = definedClasses(css);
  const sources = walk(path.join(ROOT, 'src/games/knife-hit'))
    .concat(walk(path.join(ROOT, 'src/games/shared')))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');
  const missing = KNIFE_HIT_CUSTOM_CLASSES.filter(
    (cls) =>
      new RegExp(`(^|[^\\w-])${cls}([^\\w-]|$)`).test(sources) && !defined.has(cls),
  );
  assert.deepEqual(missing, [], `dipakai komponen tapi tidak ada di CSS: ${missing.join(', ')}`);
});

test('reward panel (kotak hadiah -> boss loot) terpusat tanpa mengandalkan transform animasi', () => {
  // Bug yang pernah ada: panel memakai `panel-in absolute left-1/2`, tapi keyframes
  // panel-in milik Rifle Rock berakhir di `transform: none` sehingga translate(-50%)
  // hilang dan panel melenceng ke kanan + terpotong.
  const screens = readFileSync(path.join(ROOT, 'src/games/knife-hit/components/Screens.tsx'), 'utf8');
  const cls = screens.match(/className="([^"]*top-\[80px\][^"]*)"/)?.[1];
  assert.ok(cls, 'wrapper panel reward (top-[80px]) tidak ditemukan');
  assert.match(cls, /inset-x-0/, 'panel reward harus di-center lewat layout (inset-x-0)');
  assert.match(cls, /mx-auto/, 'panel reward harus di-center lewat layout (mx-auto)');
  assert.doesNotMatch(cls, /left-1\/2/, 'panel reward tidak boleh mengandalkan left-1/2 + transform animasi');
});

test('LetterPop hanya memenggal baris antar kata, bukan di tengah kata', () => {
  const html = renderToStaticMarkup(createElement(LetterPop, { text: 'SOLARION DEFEATED!' }));
  const groups = html.match(/white-space:nowrap/g) ?? [];
  assert.equal(groups.length, 2, 'harus ada satu grup nowrap per kata');
  assert.match(html, /<\/span> <span style="white-space:nowrap">/, 'spasi antar kata harus di luar grup nowrap (jadi titik patah baris)');
  // kata panjang tetap utuh dalam satu grup
  const single = renderToStaticMarkup(createElement(LetterPop, { text: 'DEFEATED!' }));
  assert.equal((single.match(/white-space:nowrap/g) ?? []).length, 1);
  for (const ch of 'DEFEATED!') assert.ok(single.includes(`>${ch}</span>`), `huruf ${ch} harus muncul`);
});
