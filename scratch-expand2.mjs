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
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message.slice(0, 400)));
await page.evaluateOnNewDocument(() => {
  Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
  Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
});
const shot = async (name) => { await page.screenshot({ path: `${OUT}/${name}.png` }); console.log('shot', name); };

await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 45000 });
await sleep(1500);
// expand knife
const exp = await page.evaluate(() => {
  for (const el of document.querySelectorAll('button')) {
    const t = (el.getAttribute('title') || '') + (el.getAttribute('aria-label') || '');
    if (/Perbesar Knife/.test(t)) { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }
  }
  return null;
});
await page.mouse.click(exp.x, exp.y);
await sleep(1200);
// klik PLAY (cari teks PLAY di dalam frame)
const play = await page.evaluate(() => {
  const els = [...document.querySelectorAll('button')].filter((el) => /^PLAY/.test((el.textContent || '').trim()));
  if (!els.length) return null;
  const el = els[els.length - 1];
  const r = el.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, txt: (el.textContent || '').trim().slice(0, 20) };
});
console.log('PLAY btn:', JSON.stringify(play));
if (play && play.w > 0) {
  await page.mouse.click(play.x, play.y);
  await sleep(1500);
  await shot('21-expanded-play');
  // lempar pisau beberapa kali di tengah area game
  const frame = await page.evaluate(() => {
    // frame game = elemen dengan aspect 9/16 yang expanded (border amber)
    for (const el of document.querySelectorAll('div')) {
      if ((el.className || '').toString().includes('border-amber-400')) {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      }
    }
    return null;
  });
  console.log('expanded frame:', JSON.stringify(frame));
  if (frame) {
    for (let i = 0; i < 6; i++) {
      await page.mouse.click(frame.x + frame.w / 2, frame.y + frame.h * 0.35);
      await sleep(400);
    }
    await shot('22-expanded-thrown');
  }
} else {
  console.log('PLAY tidak bisa diklik (tertutup/0 size)');
  await shot('21-expanded-play-miss');
}
console.log('errors:', errors.join(' || ') || 'none');
await browser.close();
console.log('done');
