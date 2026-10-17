import { mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
const OUT = 'scratch-shots3';
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  args: chromium.args, executablePath: await chromium.executablePath(), headless: 'shell',
  defaultViewport: { width: 2400, height: 1400 },
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message.slice(0, 300)));
await page.evaluateOnNewDocument(() => {
  Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
  Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
});
const shot = async (name) => { await page.screenshot({ path: `${OUT}/${name}.png` }); console.log('shot', name); };

await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 45000 });
await sleep(1500);
// klik kartu knife dulu (buat aktif)
const kt = await page.evaluate(() => {
  for (const el of document.querySelectorAll('span')) {
    if ((el.textContent || '').trim() === 'Knife Boss 100 Lv') { const r = el.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; }
  }
  return null;
});
if (kt) await page.mouse.click(kt.x, kt.y);
await sleep(800);

// daftar chip fase: klik satu-satu lewat teks chip
const chips = ['2. Boss','3. Normal','4. Kotak','5. Bonus','6. Destroy','7. Harta','8. Defeated','1. Peta','0. Menu'];
for (const label of chips) {
  const btn = await page.evaluate((lab) => {
    for (const el of document.querySelectorAll('button')) {
      if ((el.textContent || '').trim() === lab) { const r = el.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2, w: r.width }; }
    }
    return null;
  }, label);
  if (!btn || btn.w === 0) { console.log('chip miss', label); continue; }
  await page.mouse.click(btn.x, btn.y);
  await sleep(2200);
  const tag = label.replace(/[^a-z0-9]/gi, '');
  await shot(`30-phase-${tag}`);
}
console.log('errors:', errors.join(' || ') || 'none');
await browser.close();
console.log('done');
