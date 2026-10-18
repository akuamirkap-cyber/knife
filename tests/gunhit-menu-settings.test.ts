import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const app = readFileSync(path.join(process.cwd(), 'src/games/gunhit/App.tsx'), 'utf8');

test('Gun Hit menu uses PERFECT SHOT branding and keeps special-stage picks in Settings', () => {
  const menuStart = app.indexOf('MAIN MENU: EXACT MATCHING SCREENSHOT');
  const settingsStart = app.indexOf("{screen === 'menu' && settingsOpen && (");
  const modalsStart = app.indexOf('{/* Modals */}', settingsStart);
  assert.notEqual(menuStart, -1);
  assert.notEqual(settingsStart, -1);
  assert.notEqual(modalsStart, -1);

  const menu = app.slice(menuStart, settingsStart);
  const settings = app.slice(settingsStart, modalsStart);
  assert.match(menu, />\s*PERFECT\s*</);
  assert.match(menu, />\s*SHOT\s*</);
  assert.doesNotMatch(menu, /startSpecial\(/);
  assert.match(settings, /PENGATURAN/);
  assert.match(settings, /onClick=\{\(\) => startSpecial\('boulder'\)\}/);
  assert.match(settings, /onClick=\{\(\) => startSpecial\('bonus'\)\}/);
  assert.match(settings, /onClick=\{\(\) => startSpecial\('treasure'\)\}/);
  assert.match(menu, /<CoinSprite size=\{25\}/);
  assert.match(menu, /<DiamondSprite size=\{24\} fillRatio=\{0\.92\}/);
  assert.match(menu, /from-\[#ff9a38\].*to-\[#a91435\]/s);
  assert.match(menu, /from-\[#b7ff73\].*to-\[#006b39\]/s);
  assert.doesNotMatch(menu, /🍎|\{getWeapon\(weapon\)\.name\}/);
  assert.match(app, /const pw = 312;\s+const ph = 273;/);
  assert.match(app, /SETTINGS sits immediately to the right of READY!/);
  const bottomBar = app.slice(app.indexOf('{/* Bottom Icon Bar */}'), app.indexOf("{screen === 'menu' && settingsOpen && ("));
  assert.doesNotMatch(bottomBar, /data-gloss="off"/);
  assert.doesNotMatch(bottomBar, /group-hover:border/);
  assert.equal((bottomBar.match(/rounded-2xl transition hover:-translate-y-1/g) ?? []).length, 4);

  const game = readFileSync(path.join(process.cwd(), 'src/games/gunhit/game/Game.ts'), 'utf8');
  const faces = readFileSync(path.join(process.cwd(), 'src/games/gunhit/game/faces.ts'), 'utf8');
  assert.match(faces, /bgTop: '#1b4d59', bgBot: '#153743'/);
  assert.match(game, /lowerShade\.addColorStop\(0\.58, 'rgba\(2, 10, 18, 0\.045\)'\)/);
  assert.match(game, /lowerShade\.addColorStop\(1, 'rgba\(2, 10, 18, 0\.12\)'\)/);
  assert.match(app, /SunburstFX size=\{430\} color=\{gunSunburstColor\(getWeapon\(weapon\)\.rarity\)\} intensity=\{0\.34\}[^>]*core=\{false\}/);
  const coinSprite = readFileSync(path.join(process.cwd(), 'src/games/shared/CoinSprite.tsx'), 'utf8');
  assert.match(coinSprite, /0\.68 \+ Math\.abs\(Math\.cos/);
  assert.match(coinSprite, /false, false/);
});

test('menu gun preview shifts right 9 percent while its sunburst remains centered', () => {
  assert.match(app, /className="relative z-10 block translate-x-\[9%\][^"]*"/);
  const previewArea = app.slice(app.indexOf('/* Upright gun with a layered'), app.indexOf('{/* Two Main Action Buttons */}'));
  assert.match(previewArea, /SunburstFX size=\{430\}/);
  assert.match(previewArea, /translate-x-\[9%\]/);
  assert.doesNotMatch(previewArea.slice(0, previewArea.indexOf('<canvas')), /translate-x-\[9%\]/);
});

test('menu theme choices default to forest and can switch to morning, town and snow', () => {
  const themes = readFileSync(path.join(process.cwd(), 'src/games/gunhit/components/MenuEnvironment.tsx'), 'utf8');
  assert.match(app, /saved === 'morning' \|\| saved === 'town' \|\| saved === 'snow' \? saved : 'forest'/);
  assert.match(app, /TEMA LATAR MENU/);
  for (const theme of ['forest', 'morning', 'town', 'snow']) assert.ok(app.includes(`id: '${theme}'`));
  assert.match(themes, /data-menu-environment="morning"/);
  assert.match(themes, /data-menu-environment="town"/);
  assert.match(themes, /data-menu-environment="snow"/);
});
