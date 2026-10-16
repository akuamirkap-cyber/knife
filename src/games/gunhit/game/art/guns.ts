import type { WeaponId } from '../weapons';
import { drawGunExtra, drawFlashExtra } from './guns3';

const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function lin(c: CanvasRenderingContext2D, x0: number, x1: number, stops: string[]) {
  const g = c.createLinearGradient(x0, 0, x1, 0);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
  return g;
}
const steel = (c: CanvasRenderingContext2D, x0: number, x1: number) => lin(c, x0, x1, ['#141619', '#5a6068', '#141619']);
const chrome = (c: CanvasRenderingContext2D, x0: number, x1: number) => lin(c, x0, x1, ['#4a515c', '#f5f7fa', '#aeb6c2', '#3d434c']);
const gold = (c: CanvasRenderingContext2D, x0: number, x1: number) => lin(c, x0, x1, ['#6b4c00', '#fff3a0', '#e0b020', '#5a3e00']);
const woodG = (c: CanvasRenderingContext2D, x0: number, x1: number) => lin(c, x0, x1, ['#4a220b', '#c4692b', '#a0521f', '#4a220b']);

function jagged(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, amp: number, n = 6) {
  c.beginPath();
  c.moveTo(x0, y0);
  for (let i = 1; i < n; i++) {
    const k = i / n;
    c.lineTo(x0 + (x1 - x0) * k + rand(-amp, amp), y0 + (y1 - y0) * k + rand(-amp, amp));
  }
  c.lineTo(x1, y1);
  c.stroke();
}

import { drawModernGrip } from './gripSystem';

function angledGrip(c: CanvasRenderingContext2D, cx: number, y: number, c1: string, _c2?: string, _len = 1) {
  drawModernGrip(c, cx, y, c1, 'g10');
}

function triggerGuard(_c: CanvasRenderingContext2D, _cx: number, _y: number, _col = '#1a1c20', _r = 16) {
  // Integrated smoothly inside drawModernGrip
}

function glowDot(c: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, blur = 12) {
  c.save();
  c.shadowColor = col;
  c.shadowBlur = blur;
  c.fillStyle = col;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
  c.restore();
}

// ---------------------------------------------------------------- guns
// muzzle tip at (cx, y0), gun extends downward
export function drawGun(
  c: CanvasRenderingContext2D, id: WeaponId, cx: number, y0: number, t: number, flash: number, ready = true,
) {
  c.save();
  switch (id) {
    case 'pistol': pistol(c, cx, y0); break;
    case 'ak47': ak(c, cx, y0); break;
    case 'plasma': plasma(c, cx, y0, t); break;
    case 'laser': laserGun(c, cx, y0, t); break;
    case 'cricket': cricket(c, cx, y0, t); break;
    case 'electro': electro(c, cx, y0, t); break;
    case 'nail': nailGun(c, cx, y0); break;
    case 'fish': fishGun(c, cx, y0, t); break;
    case 'crossbow': crossbow(c, cx, y0, ready); break;
    case 'bazooka': bazooka(c, cx, y0, ready); break;
    case 'rpg': rpg(c, cx, y0, ready); break;
    case 'freeze': freeze(c, cx, y0, t); break;
    case 'golden': golden(c, cx, y0, t); break;
    case 'blackhole': blackhole(c, cx, y0, t); break;
    default: drawGunExtra(c, id, cx, y0, t, ready); break;
  }
  c.restore();
  if (flash > 0) drawFlash(c, id, cx, y0, t, flash);
}

function pistol(c: CanvasRenderingContext2D, cx: number, y0: number) {
  angledGrip(c, cx, y0 + 82, '#2b2420', '#4a3a2e');
  triggerGuard(c, cx, y0 + 70);
  c.beginPath();
  c.roundRect(cx - 16, y0, 32, 130, [6, 6, 4, 4]);
  c.fillStyle = lin(c, cx - 17, cx + 17, ['#1d2025', '#5e6670', '#8a939e', '#1a1d22']);
  c.fill();
  c.strokeStyle = '#0b0c0e';
  c.lineWidth = 2;
  c.stroke();
  c.fillStyle = '#0a0a0b';
  c.beginPath();
  c.roundRect(cx - 6, y0 - 4, 12, 8, 2);
  c.fill();
  c.fillStyle = '#ff5a36';
  c.fillRect(cx - 2, y0 + 4, 4, 5);
  c.fillStyle = '#0e0f12';
  c.fillRect(cx + 2, y0 + 38, 12, 26);
  c.fillStyle = '#c99a3a';
  c.fillRect(cx + 5, y0 + 42, 6, 18);
  c.strokeStyle = 'rgba(0,0,0,0.5)';
  c.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.moveTo(cx - 13, y0 + 92 + i * 6);
    c.lineTo(cx + 13, y0 + 92 + i * 6);
    c.stroke();
  }
  c.fillStyle = 'rgba(255,255,255,0.18)';
  c.fillRect(cx - 6, y0 + 8, 3, 115);
}

function ak(c: CanvasRenderingContext2D, cx: number, y0: number) {
  c.beginPath();
  c.moveTo(cx - 11, y0 + 166);
  c.lineTo(cx + 13, y0 + 166);
  c.lineTo(cx + 24, y0 + 260);
  c.lineTo(cx - 14, y0 + 260);
  c.closePath();
  c.fillStyle = woodG(c, cx - 14, cx + 24);
  c.fill();
  c.strokeStyle = '#2a1205';
  c.lineWidth = 2;
  c.stroke();
  c.beginPath();
  c.moveTo(cx + 12, y0 + 152);
  c.lineTo(cx + 54, y0 + 168);
  c.lineTo(cx + 48, y0 + 186);
  c.lineTo(cx + 12, y0 + 172);
  c.closePath();
  c.fillStyle = '#4a250c';
  c.fill();
  c.stroke();
  triggerGuard(c, cx - 4, y0 + 158, '#202226');
  c.beginPath();
  c.moveTo(cx + 12, y0 + 114);
  c.quadraticCurveTo(cx + 46, y0 + 110, cx + 66, y0 + 80);
  c.lineTo(cx + 86, y0 + 92);
  c.quadraticCurveTo(cx + 58, y0 + 140, cx + 12, y0 + 146);
  c.closePath();
  const mg = c.createLinearGradient(cx + 12, y0 + 90, cx + 80, y0 + 140);
  mg.addColorStop(0, '#d0682a');
  mg.addColorStop(0.5, '#a64a17');
  mg.addColorStop(1, '#6b2c0a');
  c.fillStyle = mg;
  c.fill();
  c.strokeStyle = '#2b1104';
  c.stroke();
  c.beginPath();
  c.roundRect(cx - 11, y0 + 108, 24, 60, 3);
  c.fillStyle = steel(c, cx - 11, cx + 13);
  c.fill();
  c.strokeStyle = '#08090a';
  c.stroke();
  c.fillStyle = '#6a7079';
  c.fillRect(cx + 13, y0 + 124, 8, 5);
  c.beginPath();
  c.roundRect(cx - 4, y0 + 60, 15, 50, 5);
  c.fillStyle = woodG(c, cx - 4, cx + 11);
  c.fill();
  c.fillStyle = steel(c, cx - 10, cx - 3);
  c.fillRect(cx - 10, y0 + 34, 6, 30);
  c.beginPath();
  c.roundRect(cx - 12, y0 + 66, 9, 38, 4);
  c.fillStyle = woodG(c, cx - 12, cx - 3);
  c.fill();
  c.fillStyle = steel(c, cx - 3.5, cx + 3.5);
  c.fillRect(cx - 3.5, y0 + 10, 7, 54);
  c.fillStyle = '#202327';
  c.fillRect(cx - 7, y0 + 18, 14, 8);
  c.fillRect(cx - 9, y0 + 12, 3, 10);
  c.beginPath();
  c.roundRect(cx - 5, y0 - 3, 10, 16, 2);
  c.fillStyle = steel(c, cx - 5, cx + 5);
  c.fill();
  c.fillStyle = '#050505';
  c.fillRect(cx - 5, y0 + 2, 3, 2);
  c.fillRect(cx - 5, y0 + 7, 3, 2);
}

function plasma(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const pulse = 0.6 + 0.4 * Math.sin(t * 6);
  angledGrip(c, cx, y0 + 112, '#1c1f2a', '#353a4d', 0.85);
  triggerGuard(c, cx, y0 + 104);
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 10, y0 + 40);
    c.lineTo(cx + s * 19, y0 + 40);
    c.lineTo(cx + s * 17, y0 + 4);
    c.lineTo(cx + s * 12, y0 + 2);
    c.closePath();
    c.fillStyle = '#3b4154';
    c.fill();
    glowDot(c, cx + s * 14.5, y0 + 4, 3, '#39ff9c');
  }
  c.strokeStyle = `rgba(120,255,190,${0.4 + 0.5 * pulse})`;
  c.lineWidth = 1.5;
  jagged(c, cx - 14, y0 + 6, cx + 14, y0 + 6, 4);
  c.beginPath();
  c.roundRect(cx - 22, y0 + 26, 44, 100, [14, 14, 6, 6]);
  c.fillStyle = lin(c, cx - 24, cx + 24, ['#10121b', '#4c5470', '#3a4058', '#10121b']);
  c.fill();
  c.strokeStyle = '#07080c';
  c.lineWidth = 2;
  c.stroke();
  c.beginPath();
  c.arc(cx, y0 + 18, 11, 0, TAU);
  c.fillStyle = '#20242f';
  c.fill();
  glowDot(c, cx, y0 + 18, 6, '#8dffc8', 14);
  c.beginPath();
  c.roundRect(cx - 7, y0 + 44, 14, 64, 7);
  c.fillStyle = '#062216';
  c.fill();
  c.save();
  c.shadowColor = '#39ff9c';
  c.shadowBlur = 14 * pulse;
  c.fillStyle = '#1fe08a';
  c.beginPath();
  c.roundRect(cx - 4.5, y0 + 46 + (1 - pulse) * 12, 9, 60 - (1 - pulse) * 12, 4.5);
  c.fill();
  c.restore();
  c.strokeStyle = '#b28a3a';
  c.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.moveTo(cx - 21, y0 + 52 + i * 14);
    c.lineTo(cx - 9, y0 + 52 + i * 14);
    c.moveTo(cx + 9, y0 + 52 + i * 14);
    c.lineTo(cx + 21, y0 + 52 + i * 14);
    c.stroke();
  }
}

function laserGun(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const pulse = 0.6 + 0.4 * Math.sin(t * 8);
  angledGrip(c, cx, y0 + 98, '#d9dee6', '#7d8796', 0.9);
  triggerGuard(c, cx, y0 + 90, '#2a2e35');
  for (let i = 0; i < 2; i++) {
    c.beginPath();
    c.moveTo(cx - 14, y0 + 52 + i * 34);
    c.lineTo(cx - 30, y0 + 70 + i * 34);
    c.lineTo(cx - 30, y0 + 80 + i * 34);
    c.lineTo(cx - 14, y0 + 76 + i * 34);
    c.closePath();
    c.fillStyle = '#2a2e35';
    c.fill();
  }
  c.beginPath();
  c.moveTo(cx - 6, y0 + 4);
  c.lineTo(cx + 6, y0 + 4);
  c.lineTo(cx + 12, y0 + 34);
  c.lineTo(cx + 17, y0 + 40);
  c.lineTo(cx + 17, y0 + 128);
  c.lineTo(cx - 17, y0 + 128);
  c.lineTo(cx - 17, y0 + 40);
  c.lineTo(cx - 12, y0 + 34);
  c.closePath();
  c.fillStyle = lin(c, cx - 18, cx + 18, ['#6d7684', '#f4f6fa', '#c5ccd6', '#6d7684']);
  c.fill();
  c.strokeStyle = '#2a2e35';
  c.lineWidth = 2;
  c.stroke();
  c.beginPath();
  c.roundRect(cx - 8, y0 + 44, 16, 74, 4);
  c.fillStyle = '#16181d';
  c.fill();
  for (let i = 0; i < 6; i++) {
    const on = i / 6 < pulse;
    c.fillStyle = on ? '#ff2a55' : '#3a1018';
    c.fillRect(cx - 5, y0 + 108 - i * 11, 10, 7);
  }
  c.save();
  c.shadowColor = '#ff2a55';
  c.shadowBlur = 10;
  c.strokeStyle = '#ff4d70';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(cx - 12.5, y0 + 44);
  c.lineTo(cx - 12.5, y0 + 122);
  c.moveTo(cx + 12.5, y0 + 44);
  c.lineTo(cx + 12.5, y0 + 122);
  c.stroke();
  c.restore();
  glowDot(c, cx, y0 + 1, 3.5, '#ffd6de', 14);
}

function cricket(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const pulse = 0.6 + 0.4 * Math.sin(t * 7);
  // tiny grip
  c.beginPath();
  c.moveTo(cx + 3, y0 + 40);
  c.lineTo(cx + 3, y0 + 60);
  c.lineTo(cx + 24, y0 + 74);
  c.lineTo(cx + 31, y0 + 62);
  c.lineTo(cx + 14, y0 + 40);
  c.closePath();
  c.fillStyle = lin(c, cx, cx + 30, ['#1b1d22', '#3d424b']);
  c.fill();
  c.strokeStyle = '#08090b';
  c.lineWidth = 1.5;
  c.stroke();
  c.beginPath();
  c.arc(cx + 10, y0 + 42, 7, -Math.PI * 0.5, Math.PI * 0.5);
  c.strokeStyle = '#2a2e35';
  c.lineWidth = 2.5;
  c.stroke();
  // body
  c.beginPath();
  c.roundRect(cx - 11, y0 + 12, 22, 34, [4, 4, 8, 8]);
  c.fillStyle = chrome(c, cx - 11, cx + 11);
  c.fill();
  c.strokeStyle = '#2a2e35';
  c.lineWidth = 1.5;
  c.stroke();
  // ridges
  c.strokeStyle = 'rgba(0,0,0,0.45)';
  c.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.moveTo(cx - 11, y0 + 20 + i * 6);
    c.lineTo(cx - 6, y0 + 20 + i * 6);
    c.moveTo(cx + 6, y0 + 20 + i * 6);
    c.lineTo(cx + 11, y0 + 20 + i * 6);
    c.stroke();
  }
  // hammer
  c.fillStyle = chrome(c, cx - 4, cx + 4);
  c.beginPath();
  c.roundRect(cx - 4, y0 + 44, 8, 8, 2);
  c.fill();
  // bulb emitter
  c.beginPath();
  c.arc(cx, y0 + 7, 10, 0, TAU);
  c.fillStyle = chrome(c, cx - 10, cx + 10);
  c.fill();
  c.strokeStyle = '#2a2e35';
  c.stroke();
  c.beginPath();
  c.arc(cx, y0 + 7, 6.5, 0, TAU);
  c.fillStyle = '#0d1a2b';
  c.fill();
  glowDot(c, cx, y0 + 7, 3.5 * pulse + 1, '#7cc8ff', 16);
  c.beginPath();
  c.arc(cx, y0 + 7, 8.5, 0, TAU);
  c.strokeStyle = 'rgba(124,200,255,0.6)';
  c.lineWidth = 1;
  c.stroke();
}

function electro(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  angledGrip(c, cx, y0 + 108, '#1f2a33', '#3b4d5c', 0.85);
  triggerGuard(c, cx, y0 + 100);
  c.beginPath();
  c.roundRect(cx - 18, y0 + 40, 36, 92, 8);
  c.fillStyle = lin(c, cx - 18, cx + 18, ['#0f161d', '#465a6b', '#2b3a47', '#0f161d']);
  c.fill();
  c.strokeStyle = '#05080b';
  c.lineWidth = 2;
  c.stroke();
  // glass tube
  c.beginPath();
  c.roundRect(cx - 9, y0 + 50, 18, 72, 9);
  c.fillStyle = '#061520';
  c.fill();
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.shadowColor = '#5ad1ff';
  c.shadowBlur = 8;
  c.strokeStyle = '#9be8ff';
  c.lineWidth = 1.4;
  for (let i = 0; i < 2; i++) jagged(c, cx, y0 + 54, cx + rand(-4, 4), y0 + 118, 4, 7);
  c.restore();
  c.fillStyle = 'rgba(255,255,255,0.15)';
  c.fillRect(cx - 6, y0 + 54, 2, 64);
  // copper coils
  c.strokeStyle = '#c47a35';
  c.lineWidth = 3;
  for (let i = 0; i < 9; i++) {
    c.beginPath();
    c.moveTo(cx - 18, y0 + 50 + i * 8);
    c.lineTo(cx - 10, y0 + 52 + i * 8);
    c.moveTo(cx + 10, y0 + 52 + i * 8);
    c.lineTo(cx + 18, y0 + 50 + i * 8);
    c.stroke();
  }
  // electrodes
  for (const s of [-1, 1]) {
    c.fillStyle = steel(c, cx + s * 10 - 2, cx + s * 10 + 2);
    c.fillRect(cx + s * 10 - 2, y0 + 10, 4, 32);
    c.beginPath();
    c.arc(cx + s * 10, y0 + 10, 4.5, 0, TAU);
    c.fillStyle = '#e09a50';
    c.fill();
  }
  c.fillStyle = steel(c, cx - 2.5, cx + 2.5);
  c.fillRect(cx - 2.5, y0 + 2, 5, 40);
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.strokeStyle = `rgba(155,232,255,${0.6 + 0.4 * Math.sin(t * 30)})`;
  c.lineWidth = 1.5;
  jagged(c, cx - 10, y0 + 10, cx, y0 + 2, 3, 4);
  jagged(c, cx + 10, y0 + 10, cx, y0 + 2, 3, 4);
  c.restore();
  glowDot(c, cx, y0 + 1, 3.5, '#bff1ff', 16);
}

function nailGun(c: CanvasRenderingContext2D, cx: number, y0: number) {
  // magazine strip
  c.beginPath();
  c.moveTo(cx - 14, y0 + 28);
  c.lineTo(cx - 26, y0 + 28);
  c.lineTo(cx - 64, y0 + 126);
  c.lineTo(cx - 52, y0 + 132);
  c.lineTo(cx - 14, y0 + 52);
  c.closePath();
  c.fillStyle = '#26282c';
  c.fill();
  c.strokeStyle = '#0a0a0a';
  c.lineWidth = 1.5;
  c.stroke();
  c.strokeStyle = '#c9ced4';
  c.lineWidth = 1;
  for (let i = 0; i < 9; i++) {
    const k = i / 9;
    c.beginPath();
    c.moveTo(cx - 24 - 36 * k, y0 + 32 + 94 * k);
    c.lineTo(cx - 17 - 33 * k, y0 + 36 + 92 * k);
    c.stroke();
  }
  // handle
  c.beginPath();
  c.moveTo(cx + 2, y0 + 88);
  c.lineTo(cx + 18, y0 + 86);
  c.lineTo(cx + 42, y0 + 168);
  c.lineTo(cx + 24, y0 + 174);
  c.closePath();
  c.fillStyle = '#1b1b1b';
  c.fill();
  c.strokeStyle = '#000';
  c.stroke();
  // battery
  c.beginPath();
  c.roundRect(cx + 10, y0 + 166, 50, 28, 4);
  c.fillStyle = lin(c, cx + 10, cx + 60, ['#a87d00', '#ffd23f', '#c99400']);
  c.fill();
  c.strokeStyle = '#1b1b1b';
  c.lineWidth = 2;
  c.stroke();
  c.fillStyle = '#1b1b1b';
  c.fillRect(cx + 10, y0 + 178, 50, 5);
  glowDot(c, cx + 52, y0 + 172, 2, '#3bff6b', 6);
  // trigger
  c.fillStyle = '#111';
  c.fillRect(cx + 4, y0 + 92, 6, 14);
  // body
  c.beginPath();
  c.roundRect(cx - 18, y0 + 22, 36, 72, 9);
  c.fillStyle = lin(c, cx - 18, cx + 18, ['#a87d00', '#ffd23f', '#e8b000', '#8a6600']);
  c.fill();
  c.strokeStyle = '#1b1b1b';
  c.lineWidth = 2;
  c.stroke();
  c.fillStyle = '#1b1b1b';
  c.fillRect(cx - 18, y0 + 58, 36, 10);
  c.fillStyle = '#1b1b1b';
  c.font = 'bold 8px sans-serif';
  c.textAlign = 'center';
  c.save();
  c.translate(cx, y0 + 42);
  c.rotate(-Math.PI / 2);
  c.fillText('NAIL', 0, 3);
  c.restore();
  // nose
  c.beginPath();
  c.roundRect(cx - 5, y0 - 2, 10, 26, 2);
  c.fillStyle = steel(c, cx - 5, cx + 5);
  c.fill();
  c.fillStyle = '#c62828';
  c.fillRect(cx - 5, y0 + 14, 10, 3);
}

function fishGun(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  angledGrip(c, cx, y0 + 112, '#0d4a7a', '#1f7fc0', 0.85);
  triggerGuard(c, cx, y0 + 104, '#0b2f4d');
  // stock cap
  c.beginPath();
  c.roundRect(cx - 14, y0 + 112, 28, 30, 6);
  c.fillStyle = '#0d3a5e';
  c.fill();
  // tank
  c.beginPath();
  c.roundRect(cx - 22, y0 + 26, 44, 86, 14);
  const wg = c.createLinearGradient(0, y0 + 26, 0, y0 + 112);
  wg.addColorStop(0, 'rgba(140,225,255,0.75)');
  wg.addColorStop(1, 'rgba(30,120,200,0.85)');
  c.fillStyle = wg;
  c.fill();
  // swimming fish
  c.save();
  c.beginPath();
  c.roundRect(cx - 22, y0 + 26, 44, 86, 14);
  c.clip();
  const fx = cx + Math.sin(t * 2) * 10;
  const fy = y0 + 64 + Math.sin(t * 3) * 8;
  const dir = Math.cos(t * 2) > 0 ? 1 : -1;
  c.fillStyle = '#ff8a1c';
  c.beginPath();
  c.ellipse(fx, fy, 8, 5, 0, 0, TAU);
  c.fill();
  c.beginPath();
  c.moveTo(fx - dir * 7, fy);
  c.lineTo(fx - dir * 13, fy - 5);
  c.lineTo(fx - dir * 13, fy + 5);
  c.closePath();
  c.fill();
  c.fillStyle = '#fff';
  c.fillRect(fx - 1, fy - 5, 2, 10);
  c.fillStyle = '#000';
  c.beginPath();
  c.arc(fx + dir * 4, fy - 1, 1.2, 0, TAU);
  c.fill();
  // bubbles
  c.strokeStyle = 'rgba(255,255,255,0.8)';
  c.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    const by = y0 + 110 - ((t * 30 + i * 19) % 84);
    const bx = cx - 12 + i * 6 + Math.sin(t * 4 + i) * 2;
    c.beginPath();
    c.arc(bx, by, 1.5 + (i % 2), 0, TAU);
    c.stroke();
  }
  // seaweed
  c.strokeStyle = '#2fbf5a';
  c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(cx - 14, y0 + 112);
  c.quadraticCurveTo(cx - 10 + Math.sin(t * 2) * 4, y0 + 96, cx - 15, y0 + 84);
  c.stroke();
  c.restore();
  c.beginPath();
  c.roundRect(cx - 22, y0 + 26, 44, 86, 14);
  c.strokeStyle = '#0b2f4d';
  c.lineWidth = 4;
  c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.fillRect(cx - 17, y0 + 34, 3, 70);
  // bands
  c.fillStyle = '#ff8a1c';
  c.fillRect(cx - 24, y0 + 22, 48, 7);
  c.fillRect(cx - 24, y0 + 106, 48, 8);
  // funnel muzzle
  c.beginPath();
  c.moveTo(cx - 15, y0);
  c.lineTo(cx + 15, y0);
  c.lineTo(cx + 7, y0 + 23);
  c.lineTo(cx - 7, y0 + 23);
  c.closePath();
  c.fillStyle = lin(c, cx - 15, cx + 15, ['#b85a00', '#ffb35a', '#c06000']);
  c.fill();
  c.strokeStyle = '#5a2a00';
  c.lineWidth = 1.5;
  c.stroke();
  c.beginPath();
  c.ellipse(cx, y0, 15, 3.5, 0, 0, TAU);
  c.fillStyle = '#1a4d7a';
  c.fill();
}

function crossbow(c: CanvasRenderingContext2D, cx: number, y0: number, ready: boolean) {
  // stock
  c.beginPath();
  c.moveTo(cx - 7, y0 + 30);
  c.lineTo(cx + 7, y0 + 30);
  c.lineTo(cx + 15, y0 + 220);
  c.lineTo(cx - 15, y0 + 220);
  c.closePath();
  c.fillStyle = woodG(c, cx - 15, cx + 15);
  c.fill();
  c.strokeStyle = '#2a1205';
  c.lineWidth = 2;
  c.stroke();
  // grip + trigger
  c.beginPath();
  c.moveTo(cx + 9, y0 + 130);
  c.lineTo(cx + 44, y0 + 160);
  c.lineTo(cx + 34, y0 + 174);
  c.lineTo(cx + 11, y0 + 152);
  c.closePath();
  c.fillStyle = '#4a250c';
  c.fill();
  c.stroke();
  c.fillStyle = '#222';
  c.fillRect(cx + 8, y0 + 120, 8, 4);
  // rail
  c.fillStyle = '#1d1f22';
  c.fillRect(cx - 3, y0 + 26, 6, 100);
  // limbs
  const tipY = y0 + 66;
  c.lineCap = 'round';
  c.strokeStyle = '#1f2226';
  c.lineWidth = 8;
  c.beginPath();
  c.moveTo(cx - 72, tipY);
  c.quadraticCurveTo(cx - 40, y0 + 28, cx, y0 + 40);
  c.quadraticCurveTo(cx + 40, y0 + 28, cx + 72, tipY);
  c.stroke();
  c.strokeStyle = '#5a6068';
  c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(cx - 70, tipY - 2);
  c.quadraticCurveTo(cx - 40, y0 + 26, cx, y0 + 38);
  c.quadraticCurveTo(cx + 40, y0 + 26, cx + 70, tipY - 2);
  c.stroke();
  // string
  const sy = ready ? y0 + 104 : y0 + 46;
  c.strokeStyle = '#e8e2d0';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx - 72, tipY);
  c.lineTo(cx, sy);
  c.lineTo(cx + 72, tipY);
  c.stroke();
  // riser
  c.fillStyle = '#2a2d31';
  c.beginPath();
  c.roundRect(cx - 11, y0 + 32, 22, 16, 3);
  c.fill();
  // stirrup
  c.strokeStyle = '#2a2d31';
  c.lineWidth = 3;
  c.beginPath();
  c.arc(cx, y0 + 30, 11, Math.PI, 0);
  c.stroke();
  // loaded bolt
  if (ready) {
    c.fillStyle = lin(c, cx - 2, cx + 2, ['#6b3d15', '#d8a060', '#6b3d15']);
    c.fillRect(cx - 1.6, y0 + 9, 3.2, 94);
    c.fillStyle = lin(c, cx - 4, cx + 4, ['#4b5058', '#f0f4f8', '#4b5058']);
    c.beginPath();
    c.moveTo(cx, y0 - 2);
    c.lineTo(cx + 4.5, y0 + 9);
    c.lineTo(cx - 4.5, y0 + 9);
    c.closePath();
    c.fill();
    c.fillStyle = '#e02424';
    for (const s of [-1, 1]) {
      c.beginPath();
      c.moveTo(cx + s * 1.6, y0 + 86);
      c.lineTo(cx + s * 6.5, y0 + 100);
      c.lineTo(cx + s * 1.6, y0 + 98);
      c.closePath();
      c.fill();
    }
  }
  // scope
  c.beginPath();
  c.roundRect(cx - 22, y0 + 64, 9, 34, 4);
  c.fillStyle = '#16181b';
  c.fill();
  glowDot(c, cx - 17.5, y0 + 66, 2, '#ff3030', 6);
}

function bazooka(c: CanvasRenderingContext2D, cx: number, y0: number, ready: boolean) {
  // grips
  for (const gy of [y0 + 110, y0 + 168]) {
    c.beginPath();
    c.moveTo(cx + 12, gy);
    c.lineTo(cx + 42, gy + 26);
    c.lineTo(cx + 32, gy + 36);
    c.lineTo(cx + 12, gy + 20);
    c.closePath();
    c.fillStyle = '#3a2412';
    c.fill();
    c.strokeStyle = '#140a03';
    c.lineWidth = 1.5;
    c.stroke();
  }
  triggerGuard(c, cx - 6, y0 + 178, '#1b1d1f', 12);
  // tube
  c.beginPath();
  c.roundRect(cx - 15, y0 + 8, 30, 260, 4);
  c.fillStyle = lin(c, cx - 15, cx + 15, ['#232c14', '#7c8c4c', '#56653a', '#1f2711']);
  c.fill();
  c.strokeStyle = '#11160a';
  c.lineWidth = 2;
  c.stroke();
  // bands
  c.fillStyle = 'rgba(0,0,0,0.35)';
  for (const by of [y0 + 60, y0 + 150, y0 + 220]) c.fillRect(cx - 15, by, 30, 6);
  c.fillStyle = '#e0c040';
  c.fillRect(cx - 15, y0 + 24, 30, 5);
  c.fillStyle = '#111';
  c.font = 'bold 7px sans-serif';
  c.textAlign = 'center';
  c.save();
  c.translate(cx, y0 + 105);
  c.rotate(-Math.PI / 2);
  c.fillText('ROCKET', 0, 2);
  c.restore();
  // sight
  c.beginPath();
  c.roundRect(cx - 28, y0 + 70, 13, 32, 3);
  c.fillStyle = '#1b1f13';
  c.fill();
  c.strokeStyle = '#3d4528';
  c.strokeRect(cx - 26, y0 + 74, 9, 10);
  // shoulder pad
  c.beginPath();
  c.roundRect(cx - 18, y0 + 196, 36, 30, 6);
  c.fillStyle = '#151515';
  c.fill();
  // flared muzzle
  c.beginPath();
  c.moveTo(cx - 19, y0);
  c.lineTo(cx + 19, y0);
  c.lineTo(cx + 15, y0 + 14);
  c.lineTo(cx - 15, y0 + 14);
  c.closePath();
  c.fillStyle = lin(c, cx - 19, cx + 19, ['#1a2010', '#5d6b38', '#1a2010']);
  c.fill();
  c.beginPath();
  c.ellipse(cx, y0, 17, 4, 0, 0, TAU);
  c.fillStyle = '#080a05';
  c.fill();
  if (ready) {
    c.beginPath();
    c.ellipse(cx, y0 + 1, 7, 2.5, 0, 0, TAU);
    c.fillStyle = '#c4302a';
    c.fill();
  }
}

function rpg(c: CanvasRenderingContext2D, cx: number, y0: number, ready: boolean) {
  const top = y0 + 50;
  // grips
  for (const gy of [top + 70, top + 122]) {
    c.beginPath();
    c.moveTo(cx + 7, gy);
    c.lineTo(cx + 38, gy + 26);
    c.lineTo(cx + 28, gy + 36);
    c.lineTo(cx + 7, gy + 20);
    c.closePath();
    c.fillStyle = '#2a2d31';
    c.fill();
    c.strokeStyle = '#0a0b0c';
    c.lineWidth = 1.5;
    c.stroke();
  }
  triggerGuard(c, cx - 11, top + 132, '#1b1d1f', 11);
  // tube
  c.beginPath();
  c.roundRect(cx - 8, top, 16, 220, 3);
  c.fillStyle = steel(c, cx - 8, cx + 8);
  c.fill();
  c.strokeStyle = '#08090a';
  c.lineWidth = 1.5;
  c.stroke();
  c.fillStyle = '#2b2e33';
  c.fillRect(cx - 10, top, 20, 8);
  // wood heat guard
  c.beginPath();
  c.roundRect(cx - 11, top + 50, 22, 70, 5);
  c.fillStyle = woodG(c, cx - 11, cx + 11);
  c.fill();
  c.strokeStyle = '#2a1205';
  c.stroke();
  c.fillStyle = 'rgba(0,0,0,0.4)';
  c.fillRect(cx - 11, top + 82, 22, 3);
  // optic
  c.beginPath();
  c.roundRect(cx - 26, top + 40, 12, 40, 4);
  c.fillStyle = '#121416';
  c.fill();
  glowDot(c, cx - 20, top + 42, 3, '#7ec8ff', 4);
  // warhead
  if (ready) {
    c.fillStyle = steel(c, cx - 3, cx + 3);
    c.fillRect(cx - 3, y0 + 26, 6, top - y0 - 22);
    c.beginPath();
    c.moveTo(cx, y0 - 4);
    c.lineTo(cx + 4, y0 + 2);
    c.lineTo(cx + 13, y0 + 22);
    c.lineTo(cx + 10, y0 + 32);
    c.lineTo(cx + 4, y0 + 36);
    c.lineTo(cx - 4, y0 + 36);
    c.lineTo(cx - 10, y0 + 32);
    c.lineTo(cx - 13, y0 + 22);
    c.lineTo(cx - 4, y0 + 2);
    c.closePath();
    c.fillStyle = lin(c, cx - 13, cx + 13, ['#2f3a1e', '#a0b066', '#2f3a1e']);
    c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.5)';
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = '#c9a227';
    c.fillRect(cx - 12.5, y0 + 21, 25, 2.5);
  }
}

function freeze(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  const pulse = 0.6 + 0.4 * Math.sin(t * 5);
  angledGrip(c, cx, y0 + 108, '#cfe8f5', '#7aa6c2', 0.85);
  triggerGuard(c, cx, y0 + 100, '#36576b');
  // coolant tank
  c.beginPath();
  c.roundRect(cx - 35, y0 + 56, 15, 58, 7);
  c.fillStyle = '#0d2a3a';
  c.fill();
  c.strokeStyle = '#36576b';
  c.lineWidth = 2;
  c.stroke();
  c.save();
  c.shadowColor = '#7fe3ff';
  c.shadowBlur = 10 * pulse;
  c.fillStyle = `rgba(127,227,255,${0.6 + 0.3 * pulse})`;
  c.beginPath();
  c.roundRect(cx - 32, y0 + 70, 9, 41, 4);
  c.fill();
  c.restore();
  c.fillStyle = '#36576b';
  c.fillRect(cx - 22, y0 + 76, 6, 4);
  // body
  c.beginPath();
  c.roundRect(cx - 18, y0 + 38, 36, 94, 10);
  c.fillStyle = lin(c, cx - 18, cx + 18, ['#8fb4cc', '#ffffff', '#dbeef8', '#7aa0b8']);
  c.fill();
  c.strokeStyle = '#36576b';
  c.lineWidth = 2;
  c.stroke();
  c.fillStyle = '#29a8e0';
  c.fillRect(cx - 18, y0 + 70, 36, 4);
  c.fillRect(cx - 18, y0 + 100, 36, 4);
  // snowflake emblem
  c.save();
  c.translate(cx, y0 + 87);
  c.strokeStyle = '#29a8e0';
  c.lineWidth = 1.5;
  for (let i = 0; i < 3; i++) {
    c.rotate(Math.PI / 3);
    c.beginPath();
    c.moveTo(-7, 0);
    c.lineTo(7, 0);
    c.stroke();
  }
  c.restore();
  // dish cone
  c.beginPath();
  c.moveTo(cx - 9, y0 + 40);
  c.lineTo(cx - 24, y0 + 9);
  c.lineTo(cx + 24, y0 + 9);
  c.lineTo(cx + 9, y0 + 40);
  c.closePath();
  c.fillStyle = lin(c, cx - 24, cx + 24, ['#5d84a0', '#d8ecf7', '#5d84a0']);
  c.fill();
  c.strokeStyle = '#36576b';
  c.stroke();
  c.beginPath();
  c.ellipse(cx, y0 + 9, 24, 6, 0, 0, TAU);
  c.fillStyle = '#e8f8ff';
  c.fill();
  c.stroke();
  c.beginPath();
  c.ellipse(cx, y0 + 9, 16, 3.5, 0, 0, TAU);
  c.fillStyle = 'rgba(127,227,255,0.6)';
  c.fill();
  // crystal emitter
  c.save();
  c.shadowColor = '#9be7ff';
  c.shadowBlur = 14;
  c.fillStyle = '#d6f6ff';
  c.beginPath();
  c.moveTo(cx, y0 - 4);
  c.lineTo(cx + 4, y0 + 4);
  c.lineTo(cx, y0 + 10);
  c.lineTo(cx - 4, y0 + 4);
  c.closePath();
  c.fill();
  c.restore();
}

function golden(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  // grip (cigarette case)
  c.beginPath();
  c.moveTo(cx + 6, y0 + 108);
  c.lineTo(cx + 62, y0 + 148);
  c.lineTo(cx + 50, y0 + 170);
  c.lineTo(cx + 2, y0 + 132);
  c.closePath();
  const gg = c.createLinearGradient(cx, y0 + 108, cx + 60, y0 + 170);
  gg.addColorStop(0, '#7a5800');
  gg.addColorStop(0.4, '#ffe680');
  gg.addColorStop(1, '#8a6400');
  c.fillStyle = gg;
  c.fill();
  c.strokeStyle = '#4a3400';
  c.lineWidth = 1.5;
  c.stroke();
  c.strokeStyle = 'rgba(90,60,0,0.5)';
  c.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.moveTo(cx + 12 + i * 10, y0 + 120 + i * 7);
    c.lineTo(cx + 6 + i * 10, y0 + 132 + i * 7);
    c.stroke();
  }
  // cufflink trigger
  c.beginPath();
  c.arc(cx + 16, y0 + 118, 5, 0, TAU);
  c.fillStyle = gold(c, cx + 11, cx + 21);
  c.fill();
  c.strokeStyle = '#4a3400';
  c.stroke();
  // lighter body
  c.beginPath();
  c.roundRect(cx - 11, y0 + 74, 22, 54, 4);
  c.fillStyle = gold(c, cx - 11, cx + 11);
  c.fill();
  c.strokeStyle = '#4a3400';
  c.lineWidth = 1.5;
  c.stroke();
  c.strokeStyle = 'rgba(90,60,0,0.6)';
  c.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.moveTo(cx - 11, y0 + 84 + i * 9);
    c.lineTo(cx + 11, y0 + 84 + i * 9);
    c.stroke();
  }
  // pen barrel
  c.beginPath();
  c.roundRect(cx - 4.5, y0, 9, 78, 3);
  c.fillStyle = gold(c, cx - 4.5, cx + 4.5);
  c.fill();
  c.strokeStyle = '#4a3400';
  c.stroke();
  c.fillStyle = '#5a3e00';
  c.fillRect(cx + 4.5, y0 + 20, 2.5, 30);
  c.fillRect(cx - 5.5, y0 + 6, 11, 3);
  c.beginPath();
  c.arc(cx, y0 + 1, 2.5, 0, TAU);
  c.fillStyle = '#2a1e00';
  c.fill();
  // twinkles
  for (let i = 0; i < 3; i++) {
    const ph = (t * 1.3 + i * 0.33) % 1;
    const a = Math.sin(ph * Math.PI);
    const pts = [[cx - 2, y0 + 30], [cx + 6, y0 + 96], [cx + 34, y0 + 140]][i];
    c.save();
    c.translate(pts[0], pts[1]);
    c.globalAlpha = a;
    c.fillStyle = '#fffbe0';
    c.beginPath();
    const s = 6 * a;
    c.moveTo(0, -s);
    c.lineTo(1.2, -1.2);
    c.lineTo(s, 0);
    c.lineTo(1.2, 1.2);
    c.lineTo(0, s);
    c.lineTo(-1.2, 1.2);
    c.lineTo(-s, 0);
    c.lineTo(-1.2, -1.2);
    c.closePath();
    c.fill();
    c.restore();
  }
}

function blackhole(c: CanvasRenderingContext2D, cx: number, y0: number, t: number) {
  angledGrip(c, cx, y0 + 108, '#1a1026', '#3a2456', 0.85);
  triggerGuard(c, cx, y0 + 100, '#120a1c');
  c.beginPath();
  c.roundRect(cx - 20, y0 + 36, 40, 96, 12);
  c.fillStyle = lin(c, cx - 20, cx + 20, ['#07040c', '#3a2456', '#22143a', '#07040c']);
  c.fill();
  c.strokeStyle = '#000';
  c.lineWidth = 2;
  c.stroke();
  // glowing rings
  c.save();
  c.shadowColor = '#a855f7';
  c.shadowBlur = 10;
  for (let i = 0; i < 3; i++) {
    const yy = y0 + 56 + i * 26 + Math.sin(t * 3 + i) * 2;
    c.strokeStyle = `rgba(192,132,252,${0.5 + 0.5 * Math.sin(t * 4 + i * 2)})`;
    c.lineWidth = 2.5;
    c.beginPath();
    c.ellipse(cx, yy, 22, 5, 0, 0, TAU);
    c.stroke();
  }
  c.restore();
  // containment arms
  for (const s of [-1, 1]) {
    c.strokeStyle = '#2a1d3d';
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(cx + s * 16, y0 + 40);
    c.quadraticCurveTo(cx + s * 26, y0 + 18, cx + s * 14, y0 + 2);
    c.stroke();
    glowDot(c, cx + s * 14, y0 + 2, 2.5, '#d8b4fe', 8);
  }
  // singularity
  c.save();
  c.translate(cx, y0 + 16);
  c.rotate(t * 3);
  const g = c.createRadialGradient(0, 0, 4, 0, 0, 16);
  g.addColorStop(0, 'rgba(255,180,90,1)');
  g.addColorStop(0.4, 'rgba(200,90,255,0.9)');
  g.addColorStop(1, 'rgba(120,40,220,0)');
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, 0, 17, 6, 0, 0, TAU);
  c.fill();
  c.restore();
  c.beginPath();
  c.arc(cx, y0 + 16, 7, 0, TAU);
  c.fillStyle = '#000';
  c.fill();
  c.strokeStyle = 'rgba(240,220,255,0.8)';
  c.lineWidth = 1;
  c.stroke();
}

// ---------------------------------------------------------------- muzzle flashes
function drawFlash(c: CanvasRenderingContext2D, id: WeaponId, cx: number, y0: number, t: number, a: number) {
  c.save();
  c.translate(cx, y0 - 6);
  c.globalCompositeOperation = 'lighter';
  const fire = (big: number) => {
    const fg = c.createRadialGradient(0, 0, 2, 0, 0, 46 * big);
    fg.addColorStop(0, `rgba(255,255,220,${a})`);
    fg.addColorStop(0.3, `rgba(255,200,60,${a * 0.9})`);
    fg.addColorStop(1, 'rgba(255,90,0,0)');
    c.fillStyle = fg;
    c.beginPath();
    const spikes = 9;
    for (let i = 0; i <= spikes * 2; i++) {
      const ang = (i / (spikes * 2)) * TAU + t * 10;
      const r = (i % 2 === 0 ? rand(30, 50) : rand(8, 14)) * big;
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r * 1.2 - 10 * big;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.fill();
  };
  const energy = (rgb: string, r: number) => {
    const fg = c.createRadialGradient(0, 0, 2, 0, 0, r);
    fg.addColorStop(0, `rgba(255,255,255,${a})`);
    fg.addColorStop(0.35, `rgba(${rgb},${a * 0.85})`);
    fg.addColorStop(1, `rgba(${rgb},0)`);
    c.fillStyle = fg;
    c.beginPath();
    c.arc(0, -4, r, 0, TAU);
    c.fill();
    c.strokeStyle = `rgba(${rgb},${a})`;
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(0, -4, r * 0.6 * (1.4 - a), r * 0.18 * (1.4 - a), 0, 0, TAU);
    c.stroke();
  };
  switch (id) {
    case 'pistol': fire(1); break;
    case 'golden': fire(1.1); break;
    case 'ak47':
      fire(1.3);
      for (const s of [-1, 1]) {
        c.fillStyle = `rgba(255,220,120,${a})`;
        c.beginPath();
        c.moveTo(0, 6);
        c.lineTo(s * rand(26, 38), 2);
        c.lineTo(s * rand(26, 38), 14);
        c.closePath();
        c.fill();
      }
      break;
    case 'bazooka': fire(1.9); break;
    case 'rpg': fire(1.6); break;
    case 'plasma': energy('57,255,156', 50); break;
    case 'laser': energy('255,42,85', 34); break;
    case 'cricket':
      energy('90,170,255', 90);
      fire(1.4);
      break;
    case 'electro':
      energy('90,209,255', 40);
      c.strokeStyle = `rgba(200,245,255,${a})`;
      c.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const ang = rand(0, TAU);
        jagged(c, 0, 0, Math.cos(ang) * 40, Math.sin(ang) * 40 - 10, 5, 4);
      }
      break;
    case 'freeze': energy('155,231,255', 46); break;
    case 'blackhole': energy('168,85,247', 50); break;
    case 'nail': {
      c.globalCompositeOperation = 'source-over';
      c.fillStyle = `rgba(220,220,220,${a * 0.6})`;
      c.beginPath();
      c.arc(0, -2, 10 * (1.5 - a), 0, TAU);
      c.fill();
      break;
    }
    case 'fish': {
      c.globalCompositeOperation = 'source-over';
      c.fillStyle = `rgba(120,210,255,${a * 0.8})`;
      for (let i = 0; i < 8; i++) {
        c.beginPath();
        c.arc(rand(-18, 18), rand(-24, 0), rand(2, 5), 0, TAU);
        c.fill();
      }
      break;
    }
    case 'crossbow':
      break;
    default:
      drawFlashExtra(c, id, t, a);
      break;
  }
  c.restore();
}
