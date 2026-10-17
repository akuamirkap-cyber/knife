import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({
  args: chromium.args, executablePath: await chromium.executablePath(), headless: 'shell',
  defaultViewport: { width: 2400, height: 1400 },
});
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => {
  Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
  Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
});
await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 45000 });
await sleep(1500);
const kt = await page.evaluate(() => {
  for (const el of document.querySelectorAll('span')) {
    if ((el.textContent || '').trim() === 'Knife Boss 100 Lv') { const r = el.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; }
  }
  return null;
});
await page.mouse.click(kt.x, kt.y);
await sleep(800);
const m = await page.evaluate(() => {
  const out = [];
  const find = (re, tag) => {
    for (const el of document.querySelectorAll('button,span,div')) {
      if (re.test((el.textContent || '').trim()) && (el.textContent || '').length < 30) {
        const r = el.getBoundingClientRect();
        out.push({ tag, txt: (el.textContent||'').trim().slice(0,16), y: Math.round(r.y), h: Math.round(r.height), bottom: Math.round(r.y+r.height) });
        return;
      }
    }
    out.push({ tag, txt: 'NOT FOUND' });
  };
  find(/^READY/, 'ready-badge');
  find(/^PLAY/, 'play-btn');
  find(/PETA 100 LEVEL/, 'peta-btn');
  find(/HARTA/, 'harta-btn');
  find(/^Perfect Shot/, 'hud-card');
  find(/Sunburst/, 'sunburst');
  // game root & area
  const root = document.querySelector('.game-font');
  if (root) { const r = root.getBoundingClientRect(); out.push({ tag: 'root', y: Math.round(r.y), h: Math.round(r.height), bottom: Math.round(r.y+r.height) }); }
  return out;
});
for (const row of m) console.log(JSON.stringify(row));
await browser.close();
