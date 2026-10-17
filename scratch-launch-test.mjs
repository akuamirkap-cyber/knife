import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
const exe = await chromium.executablePath();
console.log('exe:', exe);
import { existsSync, readdirSync } from 'node:fs';
console.log('/tmp dirs:', readdirSync('/tmp').filter((d) => !d.startsWith('.')));
const browser = await puppeteer.launch({
  args: chromium.args, executablePath: exe, headless: 'shell',
  defaultViewport: { width: 720, height: 1280 },
});
const page = await browser.newPage();
await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
console.log('title:', await page.title());
await browser.close();
console.log('LAUNCH OK');
