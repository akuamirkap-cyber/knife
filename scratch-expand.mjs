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

// cari tombol expand (svg maximize / ⤢) di header kartu Knife — coba semua elemen dengan title/aria mengandung perbesar/expand
const exp = await page.evaluate(() => {
  const out = [];
  for (const el of document.querySelectorAll('button,div,span,svg')) {
    const t = (el.getAttribute('title') || el.getAttribute('aria-label') || el.textContent || '').trim();
    if (/perbesar|expand|maximize|fullscreen/i.test(t) && t.length < 40) {
      const r = el.getBoundingClientRect();
      out.push({ t, x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), w: Math.round(r.width), h: Math.round(r.height) });
    }
  }
  return out;
});
console.log('expand buttons:', JSON.stringify(exp));
// klik yang terdekat dengan kartu knife (x terbesar)
if (exp.length) {
  const target = exp.sort((a, b) => b.x - a.x)[0];
  await page.mouse.click(target.x, target.y);
  await sleep(1500);
  await shot('20-expanded-knife');
  const info = await page.evaluate(() => {
    const frames = [];
    for (const el of document.querySelectorAll('canvas,iframe')) {
      const r = el.getBoundingClientRect();
      frames.push({ tag: el.tagName, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) });
    }
    return frames;
  });
  console.log('canvases/frames after expand:', JSON.stringify(info));
}
console.log('errors:', errors.join(' || ') || 'none');
await browser.close();
console.log('done');
