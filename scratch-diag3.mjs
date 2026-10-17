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
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 200)); });
await page.evaluateOnNewDocument(() => {
  Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
  Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
});
const shot = async (name) => { await page.screenshot({ path: `${OUT}/${name}.png` }); console.log('shot', name); };

await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 45000 });
await sleep(1500);
await shot('00-hub');

// 1) Knife Boss slide
const knife = await page.evaluate(() => {
  for (const el of document.querySelectorAll('button,div,span,h1,h2,h3')) {
    const t = el.textContent?.trim();
    if (t === 'Knife Boss 100 Lv') {
      const target = el.closest('button') || el.parentElement || el;
      const r = target.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    }
  }
  return null;
});
console.log('knife card:', JSON.stringify(knife));
if (knife) {
  await page.mouse.click(knife.x, knife.y);
  await sleep(2000);
  await shot('01-knife');
  const info = await page.evaluate(() => {
    const iframes = [...document.querySelectorAll('iframe')].map((f) => { const r = f.getBoundingClientRect(); return { src: f.src?.slice(0, 60), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; });
    return { iframes, bodyLen: document.body.innerHTML.length };
  });
  console.log('knife info:', JSON.stringify(info));
}
console.log('errors so far:', errors.slice(0, 8).join(' || ') || 'none');

// 2) Gun Hit boss
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 45000 });
await sleep(1200);
const chal = await page.evaluate(() => {
  for (const el of document.querySelectorAll('button,span,div')) {
    if (el.textContent?.trim() !== 'CHALLENGES') continue;
    const target = el.closest('button') || el;
    const r = target.getBoundingClientRect();
    const x = r.x + r.width / 2;
    if (x >= 850 && x <= 1250) return { x, y: r.y + r.height / 2 };
  }
  return null;
});
console.log('CHALLENGES:', JSON.stringify(chal));
if (chal) { await page.mouse.click(chal.x, chal.y); await sleep(1400); }
const b = await page.evaluate(() => {
  for (const c of document.querySelectorAll('canvas')) {
    const r = c.getBoundingClientRect();
    if (r.x > 720 && r.x < 1500 && r.width > 300) return { x: r.x, y: r.y, w: r.width, h: r.height };
  }
  return null;
});
if (b) { await page.mouse.move(b.x + b.w / 2, b.y + b.h * 0.45); await page.mouse.down(); await sleep(50); await page.mouse.up(); }
await sleep(2500);
await shot('02-boss-t0');
await sleep(1200);
await shot('03-boss-t1');
await sleep(1200);
await shot('04-boss-t2');
await sleep(1500);
await shot('05-boss-t3');
console.log('errors end:', errors.slice(0, 12).join(' || ') || 'none');
await browser.close();
console.log('done');
