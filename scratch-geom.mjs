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
const exp = await page.evaluate(() => {
  for (const el of document.querySelectorAll('button')) {
    const t = (el.getAttribute('title') || '') + (el.getAttribute('aria-label') || '');
    if (/Perbesar Knife/.test(t)) { const r = el.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }
  }
  return null;
});
await page.mouse.click(exp.x, exp.y);
await sleep(1200);
const geom = await page.evaluate(() => {
  const pick = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
  const out = {};
  // card = punya border-amber-400 & aspect
  for (const el of document.querySelectorAll('div')) {
    const c = (el.className || '').toString();
    if (c.includes('border-amber-400') && c.includes('aspect-[9/16]')) { out.card = pick(el); break; }
  }
  // game-font root
  const root = document.querySelector('.game-font');
  if (root) out.gameRoot = pick(root);
  // status bar: teks Perfect Shot
  for (const el of document.querySelectorAll('div,span') ) {
    if ((el.textContent || '').trim().startsWith('Perfect Shot') && (el.textContent || '').length < 40) { out.statusRow = pick(el.closest('div')?.parentElement || el); break; }
  }
  // cari elemen dengan tinggi 52 atau class h-[52px]
  for (const el of document.querySelectorAll('div')) {
    const c = (el.className || '').toString();
    if (c.includes('h-[52px]')) { out.statusBar52 = pick(el); break; }
  }
  for (const el of document.querySelectorAll('div')) {
    const c = (el.className || '').toString();
    if (c.includes('h-[120px]')) { out.chrome120 = pick(el); break; }
  }
  for (const el of document.querySelectorAll('div')) {
    const c = (el.className || '').toString();
    if (c.includes('min-h-0') && c.includes('flex-1') && c.includes('relative')) { out.gameArea = pick(el); break; }
  }
  return out;
});
for (const [k,v] of Object.entries(geom)) console.log(k, v ? `x=${v.x} y=${v.y} w=${v.w} h=${v.h} bottom=${v.y+v.h}` : "null");
await browser.close();
