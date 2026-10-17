export const TAU = Math.PI * 2;
export const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** shared mutable state the game sets before drawing (e.g. minigun spin) */
export const gunState = { spin: 0, spinAngle: 0, sinceShot: 9, reloadT: 0, charge: 0, shots: 0, tint: '244,63,94', bigShot: 0 };

type C = CanvasRenderingContext2D;

export function lin(c: C, x0: number, x1: number, stops: string[]) {
  const g = c.createLinearGradient(x0, 0, x1, 0);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
  return g;
}
export function vlin(c: C, y0: number, y1: number, stops: string[]) {
  const g = c.createLinearGradient(0, y0, 0, y1);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
  return g;
}
export const steel = (c: C, x0: number, x1: number) => lin(c, x0, x1, ['#141619', '#5a6068', '#141619']);
export const chrome = (c: C, x0: number, x1: number) => lin(c, x0, x1, ['#4a515c', '#f5f7fa', '#aeb6c2', '#3d434c']);
export const wood = (c: C, x0: number, x1: number) => lin(c, x0, x1, ['#4a220b', '#c4692b', '#a0521f', '#4a220b']);
export const brass = (c: C, x0: number, x1: number) => lin(c, x0, x1, ['#5a3a08', '#f3cf6a', '#c28f22', '#4a2e05']);

export function rr(c: C, x: number, y: number, w: number, h: number, r: number | number[], fill: string | CanvasGradient, stroke?: string, lw = 2) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = lw;
    c.stroke();
  }
}

import { drawModernGrip } from './gripSystem';

export function grip(c: C, cx: number, y: number, c1: string, _c2?: string, _len = 0.85) {
  drawModernGrip(c, cx, y, c1, 'g10');
}

export function guard(_c: C, _cx: number, _y: number, _col = '#1a1c20', _r = 14) {
  // Integrated seamlessly inside drawModernGrip
}

export function glow(c: C, x: number, y: number, r: number, col: string, blur = 12) {
  c.save();
  c.shadowColor = col;
  c.shadowBlur = blur;
  c.fillStyle = col;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
  c.restore();
}

export function jag(c: C, x0: number, y0: number, x1: number, y1: number, amp: number, n = 6) {
  c.beginPath();
  c.moveTo(x0, y0);
  for (let i = 1; i < n; i++) {
    const k = i / n;
    c.lineTo(x0 + (x1 - x0) * k + rand(-amp, amp), y0 + (y1 - y0) * k + rand(-amp, amp));
  }
  c.lineTo(x1, y1);
  c.stroke();
}

export function star(c: C, x: number, y: number, r: number, fill: string, points = 5) {
  c.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rr2 = i % 2 === 0 ? r : r * 0.45;
    const a = (i / (points * 2)) * TAU - Math.PI / 2;
    c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2);
  }
  c.closePath();
  c.fillStyle = fill;
  c.fill();
}

export function radial(c: C, x: number, y: number, r: number, stops: string[]) {
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
  return g;
}
