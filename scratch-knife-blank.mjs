import { mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
const OUT = 'scratch-shots3';
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  args: chromium.args, executablePath: await chromium.executablePath(), headless: 'shell',
  defaultViewport: { width: 2100, height: 1320 },
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message.slice(0, 300)));
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 150)); });
await page.evaluateOnNewDocument(() => {
  Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
  Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
});
const shot = async (name) => { await page.screenshot({ path: `${OUT}/${name}.png` }); console.log('shot', name); };
const clickText = async (t, xMin, xMax) => {
  return page.evaluate((tt, a, b) => {
    for (const el of document.querySelectorAll('button,span,div,h1,h2,h3')) {
      const txt = el.textContent?.trim();
      if (!txt || txt.length > 40) continue;
      if (!txt.toUpperCase().includes(tt.toUpperCase())) continue;
      const target = el.closest('button') || el;
      const r = target.getBoundingClientRect();
      const x = r.x + r.width / 2, y = r.y + r.height / 2;
      if (r.width > 0 && x >= a && x <= b && y >= 0 && y < 1320) return { x, y };
    }
    return null;
  }, t, xMin, xMax);
};

await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 45000 });
await sleep(1500);

// Aktifkan Knife Boss (kartu ke-3)
let p = await clickText('Knife Boss', 1400, 1800);
console.log('knife title:', JSON.stringify(p));
if (p) { await page.mouse.click(p.x, p.y); await sleep(1200); }
await shot('10-knife-active');

// Klik PLAY di kartu knife
p = await clickText('PLAY', 1400, 1800);
console.log('PLAY:', JSON.stringify(p));
if (p) { await page.mouse.click(p.x, p.y); await sleep(1500); }
await shot('11-knife-after-play');

// Mungkin muncul tombol main lagi / stage select
p = await clickText('MULAI', 1400, 1800) || await clickText('MAIN', 1400, 1800);
if (p) { await page.mouse.click(p.x, p.y); await sleep(1500); }
await shot('12-knife-stage');

// sekarang aktifkan Gun Hit lalu kembali ke Knife — apakah tetap blank?
p = await clickText('CHALLENGES', 850, 1250);
if (p) { await page.mouse.click(p.x, p.y); await sleep(1200); }
await shot('13-knife-paused');
p = await clickText('Knife Boss', 1400, 1800);
if (p) { await page.mouse.click(p.x, p.y); await sleep(1500); }
await shot('14-knife-resumed');

console.log('errors:', errors.slice(0, 10).join(' || ') || 'none');
await browser.close();
console.log('done');
