import type { GunForm, WeaponDef } from './catalog';
import { decorate } from './signature';
import { HERO_GUNS, HERO_LEN } from './hero';

const TAU = Math.PI * 2;

export const GUN_LEN: Record<GunForm, number> = {
  pistol: 150, revolver: 158, rifle: 250, ak: 252, smg: 196, shotgun: 236,
  sniper: 338, minigun: 244, cannon: 226, launcher: 236, blaster: 206,
  beam: 226, wand: 176, bow: 196, sling: 150, blowgun: 236, novelty: 160,
  organic: 206, heavy: 236, orb: 196, tank: 232,
};

export function svOf(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 7) % 4;
}

export interface GunDraw {
  flash: number; tilt: number; magDrop: number; spin: number;
  charge: number; heat: number; t: number;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const cl = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = cl(((n >> 16) & 255) * (1 + amt)), g = cl(((n >> 8) & 255) * (1 + amt)), b = cl((n & 255) * (1 + amt));
  return `rgb(${r},${g},${b})`;
}
function body(ctx: CanvasRenderingContext2D, w: number, base: string) {
  const g = ctx.createLinearGradient(-w, 0, w, 0);
  g.addColorStop(0, shade(base, 0.75));
  g.addColorStop(0.34, shade(base, 0.18));
  g.addColorStop(0.62, shade(base, -0.34));
  g.addColorStop(1, shade(base, -0.05));
  return g;
}
function glowBall(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, a = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.restore();
}
function flashFx(ctx: CanvasRenderingContext2D, f: number, size: number, col: string) {
  if (f <= 0) return;
  const s = size * (0.55 + f * 0.7);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = f;
  const g = ctx.createRadialGradient(0, -s * 0.3, 0, 0, -s * 0.3, s * 1.7);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, -s * 0.3, s * 1.7, 0, TAU); ctx.fill();
  ctx.fillStyle = col;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU - Math.PI / 2;
    const r = i % 2 === 0 ? s * 1.5 : s * 0.45;
    const px = Math.cos(a) * r * (i % 2 ? 1 : 0.5), py = Math.sin(a) * r - s * 0.25;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(0, -s * 0.3, s * 0.17, s * 0.55, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
function grip(ctx: CanvasRenderingContext2D, y: number, col: string, len = 26) {
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(9, y); ctx.lineTo(9 + len, y + 11);
  ctx.quadraticCurveTo(15 + len, y + 17, 11 + len, y + 25);
  ctx.lineTo(9, y + 16); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(14 + i * 6, y + 4 + i * 2); ctx.lineTo(12 + i * 6, y + 17 + i * 2); ctx.stroke();
  }
}
function trigger(ctx: CanvasRenderingContext2D, y: number) {
  ctx.strokeStyle = '#14171c'; ctx.lineWidth = 3.2;
  ctx.beginPath(); ctx.arc(13, y, 9, -Math.PI / 2, Math.PI / 2); ctx.stroke();
  ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(11, y - 4); ctx.quadraticCurveTo(18, y - 1, 16, y + 4); ctx.stroke();
}
function stock(ctx: CanvasRenderingContext2D, y: number, col: string, len = 74) {
  ctx.fillStyle = body(ctx, 14, col);
  ctx.beginPath();
  ctx.moveTo(-10, y); ctx.lineTo(10, y); ctx.lineTo(18, y + len); ctx.lineTo(-11, y + len);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.26)';
  ctx.beginPath();
  ctx.moveTo(-2, y + 12); ctx.lineTo(8, y + 12); ctx.lineTo(12, y + len - 20); ctx.lineTo(-2, y + len - 20);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#15181d'; ctx.fillRect(-11, y + len - 6, 29, 9);
  ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(-10, y + 2, 2.2, len - 8);
}
function mag(ctx: CanvasRenderingContext2D, y: number, d: GunDraw, col: string, accent: string, curved = true) {
  ctx.save();
  ctx.translate(d.magDrop * 0.55, d.magDrop);
  ctx.globalAlpha = Math.max(0, 1 - d.magDrop / 70);
  ctx.fillStyle = shade(col, -0.5);
  ctx.beginPath();
  if (curved) {
    ctx.moveTo(10, y + 4);
    ctx.quadraticCurveTo(30, y, 47, y - 13);
    ctx.lineTo(50, y + 9);
    ctx.quadraticCurveTo(32, y + 23, 10, y + 27);
  } else {
    ctx.moveTo(10, y + 4); ctx.lineTo(34, y + 6); ctx.lineTo(34, y + 30); ctx.lineTo(10, y + 28);
  }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.fillStyle = accent; ctx.globalAlpha *= 0.65; ctx.fillRect(22, y + 2, 4, 12);
  ctx.restore();
}
/** little emoji charm hanging on the weapon = personality per gun */
function charm(ctx: CanvasRenderingContext2D, x: number, y: number, emoji: string, size = 15, sway = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(sway);
  ctx.strokeStyle = 'rgba(220,220,230,0.55)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 0); ctx.stroke();
  ctx.font = `${size}px serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 0, size * 0.45);
  ctx.restore();
}
function plate(ctx: CanvasRenderingContext2D, x: number, y: number, emoji: string, size: number, rot = 0) {
  ctx.save();
  ctx.translate(x, y); ctx.rotate(rot);
  ctx.font = `${size}px serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 0, 0);
  ctx.restore();
}

/* =============== forms =============== */
type Drawer = (ctx: CanvasRenderingContext2D, w: WeaponDef, d: GunDraw) => void;

const drawPistol: Drawer = (ctx, w, d) => {
  flashFx(ctx, d.flash, 24, w.glow);
  const slide = d.flash * 10;
  ctx.fillStyle = body(ctx, 10, w.c1);
  rr(ctx, -10, 0 + slide, 20, 78, 4); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  rr(ctx, -4, 20 + slide, 7, 22, 2); ctx.fill();
  ctx.fillStyle = w.c2;
  ctx.fillRect(-10, 6 + slide, 20, 2.6);
  ctx.fillRect(-9, 62 + slide, 18, 2.2);
  ctx.fillStyle = '#12151a';
  ctx.beginPath(); ctx.ellipse(0, 2 + slide, 4.6, 3, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = body(ctx, 11, w.c1);
  rr(ctx, -11, 70, 22, 34, 4); ctx.fill();
  mag(ctx, 96, d, w.c1, w.c2, false);
  trigger(ctx, 96);
  ctx.fillStyle = shade(w.c1, -0.4);
  ctx.beginPath();
  ctx.moveTo(9, 86); ctx.lineTo(34, 100); ctx.quadraticCurveTo(40, 108, 33, 118);
  ctx.lineTo(8, 106); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1.1;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(14 + i * 5, 90 + i * 3); ctx.lineTo(12 + i * 5, 104 + i * 3); ctx.stroke(); }
  glowBall(ctx, 0, 6 + slide, 10, w.glow, 0.25 + d.flash * 0.6);
  charm(ctx, -14, 88, w.emoji, 14, Math.sin(d.t * 3) * 0.2);
};

const drawRevolver: Drawer = (ctx, w, d) => {
  flashFx(ctx, d.flash, 26, w.glow);
  ctx.fillStyle = body(ctx, 8, w.c1);
  rr(ctx, -8, 0, 16, 62, 3); ctx.fill();
  ctx.fillStyle = w.c2; ctx.fillRect(-8, 4, 16, 2);
  // cylinder
  ctx.save();
  ctx.translate(0, 72); ctx.rotate(d.spin * 0.6 + d.flash);
  ctx.fillStyle = body(ctx, 17, w.c1);
  ctx.beginPath(); ctx.arc(0, 0, 17, 0, TAU); ctx.fill();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath(); ctx.arc(Math.cos(a) * 10, Math.sin(a) * 10, 3.6, 0, TAU); ctx.fill();
    ctx.fillStyle = w.glow;
    ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.arc(Math.cos(a) * 10, Math.sin(a) * 10, 1.9, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  ctx.fillStyle = body(ctx, 11, w.c1);
  rr(ctx, -11, 58, 22, 38, 4); ctx.fill();
  trigger(ctx, 94);
  ctx.fillStyle = shade(w.c1, -0.45);
  ctx.beginPath();
  ctx.moveTo(8, 84); ctx.quadraticCurveTo(34, 96, 32, 126); ctx.lineTo(10, 118);
  ctx.quadraticCurveTo(6, 100, 8, 84); ctx.closePath(); ctx.fill();
  plate(ctx, 20, 104, w.emoji, 13, 0.4);
  glowBall(ctx, 0, 72, 22, w.glow, 0.3 + d.flash * 0.5);
};

const drawRifleLike = (barrelLen: number, woodStock: boolean): Drawer => (ctx, w, d) => {
  flashFx(ctx, d.flash, 28, w.glow);
  ctx.fillStyle = '#15181d'; rr(ctx, -6, 0, 12, 18, 2.5); ctx.fill();
  ctx.fillStyle = w.c2; ctx.globalAlpha = 0.6; ctx.fillRect(-6, 5, 12, 2); ctx.globalAlpha = 1;
  ctx.fillStyle = body(ctx, 4, '#4a515c'); ctx.fillRect(-3.4, 16, 6.8, barrelLen);
  const hg = 16 + barrelLen - 10;
  ctx.fillStyle = '#15181d';
  ctx.beginPath(); ctx.moveTo(-4, hg - 6); ctx.lineTo(-16, hg - 2); ctx.lineTo(-16, hg + 5); ctx.lineTo(-4, hg + 7); ctx.closePath(); ctx.fill();
  ctx.fillStyle = body(ctx, 11, w.c1);
  rr(ctx, -11, hg, 22, 58, 5); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  for (let i = 0; i < 5; i++) { rr(ctx, -6.5, hg + 6 + i * 10, 13, 5, 2); ctx.fill(); }
  ctx.fillStyle = w.c2; ctx.globalAlpha = 0.6; ctx.fillRect(7, hg + 6, 3, 46); ctx.globalAlpha = 1;
  const hgEnd = hg + 58;
  mag(ctx, hgEnd + 2, d, w.c1, w.c2, true);
  ctx.fillStyle = body(ctx, 12, w.c1);
  rr(ctx, -12, hgEnd, 24, 58, 4); ctx.fill();
  ctx.fillStyle = '#0f1216'; rr(ctx, -5, hgEnd + 10, 8, 20, 2); ctx.fill();
  ctx.fillStyle = '#c9a24a'; ctx.fillRect(-3, hgEnd + 14 + d.flash * 7, 4, 11);
  ctx.fillStyle = '#15181d'; ctx.fillRect(-16, hgEnd + 6, 5, 26);
  ctx.fillStyle = '#20252c'; rr(ctx, -28, hgEnd + 2, 13, 28, 3); ctx.fill();
  ctx.fillStyle = w.c2; ctx.fillRect(-27, hgEnd + 1, 11, 2.6);
  glowBall(ctx, -22, hgEnd + 4, 10, w.glow, 0.7);
  const recEnd = hgEnd + 58;
  trigger(ctx, recEnd - 20);
  grip(ctx, recEnd - 12, shade(w.c1, -0.4));
  stock(ctx, recEnd, woodStock ? '#7a5027' : w.c1, 74);
  charm(ctx, 16, hgEnd + 40, w.emoji, 14, Math.sin(d.t * 2.4) * 0.25);
};

const drawSmg: Drawer = (ctx, w, d) => {
  flashFx(ctx, d.flash, 22, w.glow);
  ctx.fillStyle = body(ctx, 5, '#4a515c'); ctx.fillRect(-4.5, 0, 9, 50);
  ctx.fillStyle = '#15181d';
  for (let i = 0; i < 6; i++) { rr(ctx, -7, 6 + i * 7, 14, 3.4, 1.5); ctx.fill(); }
  ctx.fillStyle = body(ctx, 14, w.c1);
  rr(ctx, -14, 46, 28, 76, 7); ctx.fill();
  ctx.fillStyle = w.c2; rr(ctx, -10, 54, 7, 48, 3); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; rr(ctx, 2, 56, 9, 22, 3); ctx.fill();
  mag(ctx, 108, d, w.c1, w.c2, false);
  trigger(ctx, 126);
  grip(ctx, 118, shade(w.c1, -0.4), 24);
  ctx.fillStyle = body(ctx, 10, w.c1);
  rr(ctx, -10, 122, 20, 54, 6); ctx.fill();
  ctx.fillStyle = '#15181d'; rr(ctx, -12, 170, 26, 12, 4); ctx.fill();
  plate(ctx, -20, 70, w.emoji, 15, -0.3);
  glowBall(ctx, 0, 8, 12, w.glow, 0.2 + d.flash * 0.6);
};

const drawShotgun: Drawer = (ctx, w, d) => {
  flashFx(ctx, d.flash, 44, w.glow);
  ctx.fillStyle = body(ctx, 7, w.c1); rr(ctx, -7, 0, 14, 92, 4); ctx.fill();
  ctx.fillStyle = body(ctx, 5, shade(w.c1, -0.3)); rr(ctx, 5, 10, 10, 76, 4); ctx.fill();
  ctx.fillStyle = '#12151a'; ctx.beginPath(); ctx.ellipse(0, 2, 5, 3, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = w.c2; ctx.beginPath(); ctx.arc(-6, 8, 2.4, 0, TAU); ctx.fill();
  const slide = d.flash * 16;
  ctx.save(); ctx.translate(0, 40 + slide);
  ctx.fillStyle = body(ctx, 12, shade(w.c1, 0.25));
  rr(ctx, -12, 0, 24, 44, 6); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.6;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-11, 5 + i * 7); ctx.lineTo(11, 5 + i * 7); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle = body(ctx, 14, w.c1); rr(ctx, -14, 100, 28, 54, 5); ctx.fill();
  ctx.save();
  ctx.globalAlpha = Math.max(0, 1 - d.magDrop / 70);
  for (let i = 0; i < 4; i++) {
    const yy = 104 + i * 12;
    ctx.fillStyle = w.c2; rr(ctx, 14 + d.magDrop * 0.3, yy, 16, 9, 2); ctx.fill();
    ctx.fillStyle = '#d9b04a'; ctx.fillRect(14 + d.magDrop * 0.3, yy, 5, 9);
  }
  ctx.restore();
  trigger(ctx, 132);
  grip(ctx, 140, shade(w.c1, -0.4), 24);
  stock(ctx, 150, shade(w.c1, 0.3), 72);
  charm(ctx, -17, 120, w.emoji, 14, Math.sin(d.t * 2) * 0.2);
};

const drawSniper: Drawer = (ctx, w, d) => {
  flashFx(ctx, d.flash, 48, w.glow);
  ctx.fillStyle = '#1a1f26';
  ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.lineTo(7, 30); ctx.lineTo(-7, 30); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0d1014';
  for (let i = 0; i < 3; i++) ctx.fillRect(-9, 6 + i * 7, 18, 3);
  ctx.fillStyle = body(ctx, 5, '#555e6b'); ctx.fillRect(-4.5, 28, 9, 100);
  for (let i = 0; i < 4; i++) {
    const yy = 44 + i * 22;
    ctx.fillStyle = '#20252d'; rr(ctx, -8, yy, 16, 8, 2); ctx.fill();
    ctx.fillStyle = w.c2;
    ctx.globalAlpha = 0.35 + 0.5 * Math.max(0, Math.sin(d.t * 5 - i * 0.7));
    ctx.fillRect(-8, yy + 2.5, 16, 2.6); ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = '#1b1f25'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 132); ctx.lineTo(-26, 168); ctx.moveTo(0, 132); ctx.lineTo(26, 168); ctx.stroke();
  ctx.fillStyle = body(ctx, 13, w.c1); rr(ctx, -13, 128, 26, 60, 5); ctx.fill();
  const hgEnd = 188;
  mag(ctx, hgEnd + 6, d, w.c1, w.c2, false);
  ctx.fillStyle = body(ctx, 13, w.c1); rr(ctx, -13, hgEnd, 26, 62, 4); ctx.fill();
  ctx.fillStyle = '#10131a'; rr(ctx, 2, hgEnd + 12, 9, 22, 2); ctx.fill();
  ctx.fillStyle = '#5c6673'; ctx.beginPath(); ctx.arc(13, hgEnd + 22, 5, 0, TAU); ctx.fill();
  ctx.fillRect(13, hgEnd + 19, 16, 6);
  ctx.fillStyle = '#15181d'; ctx.fillRect(-19, hgEnd + 4, 7, 7); ctx.fillRect(-19, hgEnd + 44, 7, 7);
  ctx.fillStyle = body(ctx, 8, '#2a3038'); rr(ctx, -32, hgEnd - 40, 15, 108, 6); ctx.fill();
  ctx.fillStyle = '#2f353f'; rr(ctx, -36, hgEnd - 48, 22, 24, 5); ctx.fill();
  ctx.fillStyle = w.c2; ctx.fillRect(-35, hgEnd - 50, 20, 4);
  glowBall(ctx, -25, hgEnd - 46, 15, w.glow, 0.85);
  trigger(ctx, hgEnd + 42);
  grip(ctx, hgEnd + 50, shade(w.c1, -0.4), 28);
  stock(ctx, hgEnd + 62, w.c1, 84);
  charm(ctx, 18, hgEnd + 30, w.emoji, 14, Math.sin(d.t * 2) * 0.22);
};

const drawMinigun: Drawer = (ctx, w, d) => {
  flashFx(ctx, d.flash, 34, w.glow);
  const bl = 104, n = 6;
  for (let i = 0; i < n; i++) {
    const a = d.spin + (i / n) * TAU;
    const px = Math.cos(a) * 11, depth = (Math.sin(a) + 1) / 2;
    ctx.fillStyle = `hsl(215,10%,${28 + depth * 40}%)`;
    const bw = 5 + depth * 1.6;
    rr(ctx, px - bw / 2, 0, bw, bl, 2); ctx.fill();
    if (depth > 0.75) { ctx.fillStyle = `rgba(255,120,40,${d.heat * 0.6})`; rr(ctx, px - bw / 2, 0, bw, 26, 2); ctx.fill(); }
  }
  ctx.strokeStyle = '#2a3038'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.ellipse(0, 6, 14, 5.5, 0, 0, TAU); ctx.stroke();
  ctx.fillStyle = body(ctx, 20, w.c1); rr(ctx, -20, bl - 6, 40, 70, 10); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  for (let i = 0; i < 4; i++) { rr(ctx, -16, bl + 2 + i * 14, 32, 7, 3); ctx.fill(); }
  glowBall(ctx, 0, bl + 28, 24, w.glow, 0.25 + d.heat * 0.5);
  ctx.save();
  ctx.translate(d.magDrop * 0.4, d.magDrop);
  ctx.globalAlpha = Math.max(0, 1 - d.magDrop / 80);
  ctx.fillStyle = '#20252d'; ctx.beginPath(); ctx.arc(34, bl + 54, 26, 0, TAU); ctx.fill();
  ctx.strokeStyle = w.c2; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(34, bl + 54, 16, d.spin, d.spin + 4); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#23272e'; rr(ctx, -34, bl + 10, 16, 12, 4); ctx.fill();
  rr(ctx, -40, bl + 16, 11, 40, 5); ctx.fill();
  grip(ctx, bl + 60, '#23272e', 22);
  ctx.fillStyle = body(ctx, 12, w.c1); rr(ctx, -12, bl + 64, 24, 54, 6); ctx.fill();
  plate(ctx, -26, bl + 40, w.emoji, 16, -0.2);
};

const drawCannon: Drawer = (ctx, w, d) => {
  flashFx(ctx, d.flash, 50, w.glow);
  ctx.fillStyle = body(ctx, 24, w.c1);
  ctx.beginPath();
  ctx.moveTo(-24, 6); ctx.lineTo(24, 6);
  ctx.quadraticCurveTo(20, 90, 15, 150);
  ctx.lineTo(-15, 150);
  ctx.quadraticCurveTo(-20, 90, -24, 6);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0f1115'; ctx.beginPath(); ctx.ellipse(0, 6, 23, 7, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = w.c2; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(0, 6, 23, 7, 0, 0, TAU); ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const yy = 26 + i * 30;
    ctx.fillStyle = shade(w.c2, -0.1);
    rr(ctx, -22 + i, yy, 44 - i * 2, 7, 3); ctx.fill();
  }
  glowBall(ctx, 0, 14, 26, w.glow, 0.22 + d.flash * 0.7);
  ctx.fillStyle = body(ctx, 18, shade(w.c1, -0.25));
  rr(ctx, -18, 146, 36, 48, 8); ctx.fill();
  ctx.save();
  ctx.translate(d.magDrop * 0.4, d.magDrop);
  ctx.globalAlpha = Math.max(0, 1 - d.magDrop / 80);
  ctx.fillStyle = shade(w.c1, -0.45); rr(ctx, 16, 150, 26, 32, 6); ctx.fill();
  plate(ctx, 29, 166, w.emoji, 15);
  ctx.restore();
  trigger(ctx, 186);
  grip(ctx, 178, shade(w.c1, -0.5), 26);
  ctx.fillStyle = body(ctx, 12, w.c1); rr(ctx, -12, 188, 24, 36, 6); ctx.fill();
  ctx.fillStyle = '#15181d'; rr(ctx, -16, 218, 32, 10, 4); ctx.fill();
};

const drawLauncher: Drawer = (ctx, w, d) => {
  flashFx(ctx, d.flash, 54, w.glow);
  ctx.fillStyle = body(ctx, 20, w.c1);
  ctx.beginPath(); ctx.moveTo(-13, 24); ctx.lineTo(-20, 0); ctx.lineTo(20, 0); ctx.lineTo(13, 24); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#121511'; ctx.beginPath(); ctx.ellipse(0, 2, 19, 5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = body(ctx, 14, w.c1); rr(ctx, -14, 20, 28, 150, 6); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.roundRect(-14, 20, 28, 150, 6); ctx.clip();
  ctx.fillStyle = w.c2; ctx.globalAlpha = 0.85;
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(0, 40 + i * 10); ctx.rotate(-0.5); ctx.fillRect(-26, 0, 52, 4); ctx.restore(); }
  ctx.restore();
  ctx.globalAlpha = 1 - Math.min(1, d.flash * 1.5);
  plate(ctx, 0, 14, w.projEmoji || w.emoji, 18);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#1c2119'; rr(ctx, -22, 50, 9, 34, 4); ctx.fill();
  ctx.fillStyle = shade(w.c1, 0.3); rr(ctx, -30, 46, 11, 26, 4); ctx.fill();
  ctx.fillStyle = w.c2; ctx.fillRect(-29, 44, 9, 3);
  glowBall(ctx, -24, 48, 13, w.glow, 0.75);
  ctx.fillStyle = shade(w.c1, -0.4); rr(ctx, 12, 56, 26, 11, 5); ctx.fill(); rr(ctx, 30, 60, 11, 30, 5); ctx.fill();
  ctx.save();
  ctx.translate(d.magDrop * 0.6, d.magDrop);
  ctx.globalAlpha = Math.max(0, 1 - d.magDrop / 80);
  ctx.fillStyle = shade(w.c1, -0.3); rr(ctx, 12, 104, 28, 34, 5); ctx.fill();
  plate(ctx, 26, 121, w.emoji, 15);
  ctx.restore();
  ctx.fillStyle = body(ctx, 16, w.c1); rr(ctx, -16, 150, 32, 46, 7); ctx.fill();
  ctx.fillStyle = '#141811';
  ctx.beginPath(); ctx.moveTo(-16, 196); ctx.lineTo(16, 196); ctx.lineTo(22, 220); ctx.lineTo(-22, 220); ctx.closePath(); ctx.fill();
  trigger(ctx, 168); grip(ctx, 160, shade(w.c1, -0.5), 26);
};

const drawBlaster: Drawer = (ctx, w, d) => {
  const pulse = 0.5 + 0.5 * Math.sin(d.t * 5);
  const ch = Math.max(d.charge, d.flash);
  const sv = svOf(w.id);
  flashFx(ctx, d.flash, 36, w.glow);

  // emitter prongs
  ctx.fillStyle = body(ctx, 10, w.c1);
  for (const s of [-1, 1]) {
    ctx.save(); ctx.scale(s, 1);
    ctx.beginPath(); ctx.moveTo(6, 4); ctx.lineTo(17, 16); ctx.lineTo(19, 56); ctx.lineTo(8, 52); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  glowBall(ctx, 0, 24, 26 + ch * 18, w.glow, 0.55 + ch * 0.45);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = `rgba(255,255,255,${0.5 + ch * 0.5})`;
  ctx.beginPath(); ctx.ellipse(0, 24, 5 + ch * 5, 9 + ch * 8, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = w.c2; ctx.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.moveTo(-14, 12 + i * 10);
    ctx.quadraticCurveTo(Math.sin(d.t * 3 + i * 2) * 10, 20 + i * 10, 14, 14 + i * 10);
    ctx.stroke();
  }
  ctx.restore();

  if (sv === 0) {
    // --- compact sidearm blaster: no stock, stubby body ---
    ctx.fillStyle = body(ctx, 14, w.c1);
    rr(ctx, -14, 50, 28, 46, 10); ctx.fill();
    ctx.fillStyle = w.c2; ctx.globalAlpha = 0.4 + pulse * 0.4;
    for (let i = 0; i < 3; i++) { rr(ctx, -9, 56 + i * 12, 18, 5, 2.5); ctx.fill(); }
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(d.magDrop * 0.5, d.magDrop);
    ctx.globalAlpha = Math.max(0, 1 - d.magDrop / 70);
    ctx.fillStyle = shade(w.c1, -0.4); rr(ctx, 10, 86, 24, 30, 6); ctx.fill();
    ctx.fillStyle = w.glow; rr(ctx, 15, 92, 14, 18, 4); ctx.fill();
    ctx.restore();
    trigger(ctx, 108);
    grip(ctx, 96, shade(w.c1, -0.45), 30);
    glowBall(ctx, 22, 112, 14, w.glow, 0.4);
  } else if (sv === 1) {
    // --- backpack-fed cannon: fat drum reactor, short frame ---
    ctx.fillStyle = body(ctx, 20, w.c1);
    ctx.beginPath(); ctx.ellipse(0, 86, 21, 32, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = w.c2; ctx.lineWidth = 2.6;
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.4 + 0.4 * Math.sin(d.t * 4 - i);
      ctx.beginPath(); ctx.ellipse(0, 72 + i * 14, 17, 5, 0, 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(d.magDrop * 0.4, d.magDrop);
    ctx.globalAlpha = Math.max(0, 1 - d.magDrop / 80);
    ctx.fillStyle = shade(w.c1, -0.35);
    ctx.beginPath(); ctx.arc(32, 112, 22, 0, TAU); ctx.fill();
    ctx.fillStyle = w.glow; ctx.globalAlpha *= 0.8;
    ctx.beginPath(); ctx.arc(32, 112, 12, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = shade(w.c1, -0.5); ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(14, 96); ctx.quadraticCurveTo(30, 104, 26, 118); ctx.stroke();
    ctx.fillStyle = body(ctx, 12, w.c1); rr(ctx, -12, 116, 24, 40, 7); ctx.fill();
    trigger(ctx, 150); grip(ctx, 142, shade(w.c1, -0.45), 26);
  } else if (sv === 2) {
    // --- bullpup: magazine behind the grip, skeleton frame ---
    ctx.fillStyle = body(ctx, 13, w.c1);
    ctx.beginPath();
    ctx.moveTo(-13, 52); ctx.lineTo(13, 52); ctx.lineTo(13, 150);
    ctx.lineTo(-10, 150); ctx.lineTo(-10, 112); ctx.lineTo(-13, 104);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 66 + i * 16, 6, 0, TAU); ctx.fill(); }
    trigger(ctx, 92); grip(ctx, 82, shade(w.c1, -0.45), 26);
    ctx.save();
    ctx.translate(d.magDrop * 0.5, d.magDrop);
    ctx.globalAlpha = Math.max(0, 1 - d.magDrop / 70);
    ctx.fillStyle = shade(w.c1, -0.4); rr(ctx, 10, 112, 26, 34, 6); ctx.fill();
    ctx.fillStyle = w.glow; ctx.globalAlpha *= 0.85; rr(ctx, 15, 118, 16, 22, 4); ctx.fill();
    ctx.restore();
    ctx.fillStyle = shade(w.c1, 0.2); rr(ctx, -12, 148, 26, 20, 6); ctx.fill();
    ctx.fillStyle = w.c2; ctx.globalAlpha = 0.5 + pulse * 0.4;
    rr(ctx, -8, 153, 18, 8, 3); ctx.fill(); ctx.globalAlpha = 1;
  } else {
    // --- heavy braced rifle frame (original) ---
    ctx.fillStyle = body(ctx, 15, w.c1);
    ctx.beginPath();
    ctx.moveTo(-15, 52); ctx.quadraticCurveTo(-18, 80, -14, 120); ctx.lineTo(14, 120);
    ctx.quadraticCurveTo(18, 80, 15, 52); ctx.closePath(); ctx.fill();
    ctx.fillStyle = w.c2;
    for (let i = 0; i < 4; i++) { ctx.globalAlpha = 0.4 + pulse * 0.4; rr(ctx, -10, 60 + i * 14, 20, 5, 2.5); ctx.fill(); }
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(d.magDrop * 0.5, d.magDrop);
    ctx.globalAlpha = Math.max(0, 1 - d.magDrop / 70);
    ctx.fillStyle = shade(w.c1, -0.4); rr(ctx, 12, 98, 26, 34, 6); ctx.fill();
    ctx.fillStyle = w.glow; ctx.globalAlpha *= 0.8; rr(ctx, 17, 104, 16, 22, 4); ctx.fill();
    ctx.restore();
    ctx.fillStyle = body(ctx, 13, w.c1); rr(ctx, -13, 118, 26, 46, 7); ctx.fill();
    ctx.fillStyle = shade(w.c1, 0.4); rr(ctx, -26, 122, 12, 24, 4); ctx.fill();
    glowBall(ctx, -20, 124, 13, w.glow, 0.8);
    trigger(ctx, 150); grip(ctx, 158, shade(w.c1, -0.45), 26);
    stock(ctx, 166, w.c1, 44);
  }
  plate(ctx, 22, 136, w.emoji, 15, 0.3);
};

const drawBeam: Drawer = (ctx, w, d) => {
  const pulse = 0.5 + 0.5 * Math.sin(d.t * 6);
  const ch = Math.max(d.charge, d.flash);
  const sv = svOf(w.id);
  flashFx(ctx, d.flash, 30, w.glow);

  // focusing crystal
  ctx.save();
  ctx.translate(0, 26); ctx.rotate(d.t * 1.6);
  const cs = 13 + ch * 5;
  const cg = ctx.createLinearGradient(-cs, -cs, cs, cs);
  cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.5, w.c2); cg.addColorStop(1, w.glow);
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.moveTo(0, -cs); ctx.lineTo(cs * 0.7, 0); ctx.lineTo(0, cs); ctx.lineTo(-cs * 0.7, 0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.restore();
  glowBall(ctx, 0, 26, 30 + ch * 22, w.glow, 0.5 + ch * 0.5);

  if (sv === 0) {
    // --- floating halo emitter: ring instead of barrel ---
    ctx.save();
    ctx.translate(0, 58); ctx.rotate(d.t * 0.8);
    ctx.strokeStyle = shade(w.c1, 0.6); ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(0, 0, 26, 0, TAU); ctx.stroke();
    ctx.strokeStyle = w.c2; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.arc(0, 0, 26, 0.4, 3.2); ctx.stroke();
    ctx.restore();
    for (let i = 0; i < 3; i++) {
      const a = d.t * 2 + (i / 3) * TAU;
      glowBall(ctx, Math.cos(a) * 26, 58 + Math.sin(a) * 10, 9, w.glow, 0.6);
    }
    ctx.fillStyle = body(ctx, 12, w.c1); rr(ctx, -12, 84, 24, 48, 10); ctx.fill();
    ctx.fillStyle = w.c2; ctx.globalAlpha = 0.5 + pulse * 0.4;
    rr(ctx, -7, 92, 14, 26, 5); ctx.fill(); ctx.globalAlpha = 1;
    trigger(ctx, 126); grip(ctx, 118, shade(w.c1, -0.4), 28);
  } else if (sv === 1) {
    // --- twin-rail emitter with open frame ---
    ctx.fillStyle = body(ctx, 9, shade(w.c1, 0.5));
    for (const s of [-1, 1]) { ctx.save(); ctx.scale(s, 1); rr(ctx, 9, 0, 10, 92, 4); ctx.fill(); ctx.restore(); }
    ctx.fillStyle = w.c2;
    for (const s of [-1, 1]) {
      ctx.globalAlpha = 0.5 + pulse * 0.45;
      ctx.fillRect(s * 12 - 2.5, 8, 5, 76);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = w.glow; ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.globalAlpha = 0.35 + 0.4 * Math.sin(d.t * 5 - i);
      ctx.beginPath(); ctx.moveTo(-11, 20 + i * 18); ctx.lineTo(11, 20 + i * 18); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = body(ctx, 13, w.c1); rr(ctx, -13, 92, 26, 52, 8); ctx.fill();
    ctx.save();
    ctx.translate(d.magDrop * 0.5, d.magDrop);
    ctx.globalAlpha = Math.max(0, 1 - d.magDrop / 70);
    ctx.fillStyle = shade(w.c1, -0.35); rr(ctx, 12, 100, 24, 30, 7); ctx.fill();
    ctx.fillStyle = w.glow; ctx.globalAlpha *= 0.85; rr(ctx, 17, 106, 14, 18, 4); ctx.fill();
    ctx.restore();
    trigger(ctx, 138); grip(ctx, 130, shade(w.c1, -0.4), 26);
  } else if (sv === 2) {
    // --- wrist-mounted gauntlet: wide, no stock ---
    ctx.fillStyle = body(ctx, 22, w.c1);
    ctx.beginPath();
    ctx.moveTo(-18, 44); ctx.lineTo(18, 44);
    ctx.quadraticCurveTo(24, 76, 20, 112); ctx.lineTo(-20, 112);
    ctx.quadraticCurveTo(-24, 76, -18, 44);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = w.c2; ctx.globalAlpha = 0.45 + pulse * 0.4;
    for (let i = 0; i < 4; i++) { rr(ctx, -14, 52 + i * 14, 28, 6, 3); ctx.fill(); }
    ctx.globalAlpha = 1;
    // knuckle plates
    ctx.fillStyle = shade(w.c1, 0.4);
    for (let i = 0; i < 3; i++) { rr(ctx, -16 + i * 12, 114, 10, 14, 3); ctx.fill(); }
    // forearm straps
    ctx.strokeStyle = shade(w.c1, -0.5); ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-20, 128); ctx.lineTo(20, 132); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-19, 148); ctx.lineTo(19, 152); ctx.stroke();
    glowBall(ctx, 0, 80, 26, w.glow, 0.35 + ch * 0.4);
  } else {
    // --- sleek carbine (original) ---
    ctx.fillStyle = body(ctx, 9, shade(w.c1, 0.5));
    for (const s of [-1, 1]) { ctx.save(); ctx.scale(s, 1); rr(ctx, 7, 0, 9, 56, 3); ctx.fill(); ctx.restore(); }
    ctx.fillStyle = w.c2; ctx.globalAlpha = 0.5 + pulse * 0.4;
    for (const s of [-1, 1]) ctx.fillRect(s * 9 - 2, 6, 4, 44);
    ctx.globalAlpha = 1;
    ctx.fillStyle = body(ctx, 15, w.c1);
    ctx.beginPath();
    ctx.moveTo(-11, 44); ctx.quadraticCurveTo(-16, 70, -14, 110); ctx.lineTo(14, 110);
    ctx.quadraticCurveTo(16, 70, 11, 44); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = w.glow; ctx.lineWidth = 2.4; ctx.globalAlpha = 0.6 + pulse * 0.4;
    ctx.beginPath(); ctx.moveTo(-9, 52); ctx.quadraticCurveTo(-12, 76, -10, 106); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9, 52); ctx.quadraticCurveTo(12, 76, 10, 106); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(8,16,22,0.8)'; rr(ctx, -5, 62, 10, 38, 4); ctx.fill();
    ctx.fillStyle = w.c2;
    const h = 34 * (0.3 + pulse * 0.25 + ch * 0.45);
    rr(ctx, -4, 98 - h, 8, h, 3); ctx.fill();
    ctx.save();
    ctx.translate(d.magDrop * 0.5, d.magDrop);
    ctx.globalAlpha = Math.max(0, 1 - d.magDrop / 70);
    ctx.fillStyle = shade(w.c1, -0.3); rr(ctx, 11, 104, 24, 30, 7); ctx.fill();
    ctx.fillStyle = w.glow; ctx.globalAlpha *= 0.85; rr(ctx, 16, 110, 14, 18, 4); ctx.fill();
    ctx.restore();
    ctx.fillStyle = body(ctx, 13, w.c1); rr(ctx, -13, 108, 26, 50, 8); ctx.fill();
    trigger(ctx, 142); grip(ctx, 150, shade(w.c1, -0.4), 25);
    ctx.fillStyle = body(ctx, 14, w.c1);
    ctx.beginPath();
    ctx.moveTo(-10, 156); ctx.lineTo(8, 156); ctx.lineTo(16, 218); ctx.lineTo(2, 218);
    ctx.lineTo(-2, 176); ctx.lineTo(-10, 176); ctx.closePath(); ctx.fill();
  }
  plate(ctx, 22, 132, w.emoji, 15, 0.25);
};

const drawWand: Drawer = (ctx, w, d) => {
  const pulse = 0.5 + 0.5 * Math.sin(d.t * 5);
  flashFx(ctx, d.flash, 30, w.glow);
  // floating star tip
  ctx.save();
  ctx.translate(0, 16); ctx.rotate(d.t * 1.2);
  ctx.fillStyle = w.c2;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU - Math.PI / 2;
    const r = i % 2 ? 5 : 13 + pulse * 3;
    const px = Math.cos(a) * r, py = Math.sin(a) * r;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath(); ctx.fill();
  ctx.restore();
  glowBall(ctx, 0, 16, 32, w.glow, 0.6 + pulse * 0.3);
  // sparkles orbiting
  for (let i = 0; i < 4; i++) {
    const a = d.t * 2 + (i / 4) * TAU;
    glowBall(ctx, Math.cos(a) * 20, 16 + Math.sin(a) * 12, 6, w.glow, 0.6);
  }
  // shaft
  const sg = ctx.createLinearGradient(-6, 0, 6, 0);
  sg.addColorStop(0, shade(w.c1, 0.7)); sg.addColorStop(0.5, w.c1); sg.addColorStop(1, shade(w.c1, -0.5));
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.moveTo(-5, 28); ctx.lineTo(5, 28); ctx.lineTo(8, 150); ctx.lineTo(-8, 150); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = w.c2; ctx.globalAlpha = 0.6; ctx.lineWidth = 1.6;
  for (let i = 0; i < 6; i++) {
    const yy = 40 + i * 18;
    ctx.beginPath(); ctx.moveTo(-6, yy); ctx.quadraticCurveTo(0, yy + 6, 6, yy + 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // handle wrap
  ctx.fillStyle = shade(w.c1, -0.55); rr(ctx, -9, 120, 18, 42, 6); ctx.fill();
  ctx.strokeStyle = w.c2; ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-9, 124 + i * 8); ctx.lineTo(9, 128 + i * 8); ctx.stroke(); }
  ctx.fillStyle = w.c2; ctx.beginPath(); ctx.arc(0, 168, 8, 0, TAU); ctx.fill();
  charm(ctx, 12, 112, w.emoji, 15, Math.sin(d.t * 3) * 0.3);
};

const drawBow: Drawer = (ctx, w, d) => {
  flashFx(ctx, d.flash, 20, w.glow);
  const pull = 1 - Math.min(1, d.flash * 2);
  // limbs
  ctx.strokeStyle = body(ctx, 40, w.c1) as unknown as string;
  ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.strokeStyle = shade(w.c1, 0.2);
  ctx.beginPath();
  ctx.moveTo(-42, 40); ctx.quadraticCurveTo(-18, 10, -6, 34);
  ctx.moveTo(42, 40); ctx.quadraticCurveTo(18, 10, 6, 34);
  ctx.stroke();
  ctx.strokeStyle = w.c2; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(-42, 40); ctx.lineTo(0, 44 + pull * 16); ctx.lineTo(42, 40); ctx.stroke();
  // bolt
  ctx.globalAlpha = pull;
  ctx.fillStyle = '#d7dde5';
  ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(4, 18); ctx.lineTo(-4, 18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = shade(w.c1, -0.2); ctx.fillRect(-2, 16, 4, 44);
  ctx.globalAlpha = 1;
  // stock rail
  ctx.fillStyle = body(ctx, 12, w.c1); rr(ctx, -12, 30, 24, 108, 5); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; rr(ctx, -4, 36, 8, 92, 3); ctx.fill();
  ctx.fillStyle = w.c2; rr(ctx, -12, 52, 3, 70, 2); ctx.fill();
  // sight
  ctx.fillStyle = shade(w.c1, 0.3); rr(ctx, -24, 58, 11, 22, 3); ctx.fill();
  glowBall(ctx, -19, 62, 11, w.glow, 0.7);
  trigger(ctx, 136); grip(ctx, 128, shade(w.c1, -0.45), 26);
  stock(ctx, 138, w.c1, 56);
  charm(ctx, 16, 96, w.emoji, 14, Math.sin(d.t * 2) * 0.3);
};

const drawSling: Drawer = (ctx, w, d) => {
  flashFx(ctx, d.flash, 18, w.glow);
  const pull = 1 - Math.min(1, d.flash * 2);
  ctx.strokeStyle = shade(w.c1, 0.1); ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-26, 10); ctx.lineTo(-12, 56); ctx.lineTo(0, 74);
  ctx.moveTo(26, 10); ctx.lineTo(12, 56); ctx.lineTo(0, 74);
  ctx.stroke();
  ctx.strokeStyle = w.c2; ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(-26, 10); ctx.quadraticCurveTo(-10, 24 + pull * 26, 0, 26 + pull * 30);
  ctx.quadraticCurveTo(10, 24 + pull * 26, 26, 10);
  ctx.stroke();
  ctx.globalAlpha = pull;
  ctx.fillStyle = '#8d8d93';
  ctx.beginPath(); ctx.arc(0, 26 + pull * 30, 7, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = body(ctx, 11, w.c1); rr(ctx, -11, 70, 22, 60, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.4;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-10, 80 + i * 9); ctx.lineTo(10, 83 + i * 9); ctx.stroke(); }
  plate(ctx, 0, 112, w.emoji, 15);
  glowBall(ctx, 0, 24, 14, w.glow, 0.3 + d.flash * 0.5);
};

const drawBlowgun: Drawer = (ctx, w, d) => {
  flashFx(ctx, d.flash, 16, w.glow);
  const g = ctx.createLinearGradient(-8, 0, 8, 0);
  g.addColorStop(0, shade(w.c1, 0.6)); g.addColorStop(0.45, w.c1); g.addColorStop(1, shade(w.c1, -0.5));
  ctx.fillStyle = g; rr(ctx, -7, 0, 14, 210, 6); ctx.fill();
  ctx.fillStyle = '#0d1410'; ctx.beginPath(); ctx.ellipse(0, 3, 4.6, 2.6, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = shade(w.c2, -0.2); ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) { const yy = 24 + i * 40; ctx.beginPath(); ctx.moveTo(-7, yy); ctx.lineTo(7, yy); ctx.stroke(); }
  // feather binding
  ctx.strokeStyle = w.c2; ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-7, 150 + i * 5); ctx.lineTo(7, 154 + i * 5); ctx.stroke(); }
  charm(ctx, 10, 60, w.emoji, 14, Math.sin(d.t * 2.5) * 0.35);
  charm(ctx, -10, 120, '🪶', 13, Math.sin(d.t * 2 + 1) * 0.35);
  ctx.fillStyle = shade(w.c1, -0.35); rr(ctx, -9, 198, 18, 36, 7); ctx.fill();
  glowBall(ctx, 0, 6, 10, w.glow, 0.2 + d.flash * 0.6);
};

const drawNovelty: Drawer = (ctx, w, d) => {
  flashFx(ctx, d.flash, 26, w.glow);
  // the object itself is the weapon
  const bob = Math.sin(d.t * 3) * 2;
  glowBall(ctx, 0, 26 + bob, 34, w.glow, 0.35 + d.flash * 0.5);
  plate(ctx, 0, 30 + bob, w.emoji, 54, Math.sin(d.t * 1.6) * 0.12);
  // launcher cradle
  ctx.fillStyle = body(ctx, 16, w.c1);
  ctx.beginPath();
  ctx.moveTo(-16, 56); ctx.lineTo(16, 56); ctx.lineTo(13, 112); ctx.lineTo(-13, 112); ctx.closePath(); ctx.fill();
  ctx.fillStyle = w.c2; ctx.globalAlpha = 0.75;
  rr(ctx, -11, 64, 22, 6, 3); ctx.fill(); rr(ctx, -10, 78, 20, 6, 3); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = shade(w.c1, 0.4); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-15, 58); ctx.quadraticCurveTo(-24, 36, -12, 24); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(15, 58); ctx.quadraticCurveTo(24, 36, 12, 24); ctx.stroke();
  trigger(ctx, 118); grip(ctx, 108, shade(w.c1, -0.45), 25);
  ctx.fillStyle = body(ctx, 11, w.c1); rr(ctx, -11, 110, 22, 42, 6); ctx.fill();
  ctx.fillStyle = '#15181d'; rr(ctx, -14, 146, 28, 10, 4); ctx.fill();
};

const drawOrganic: Drawer = (ctx, w, d) => {
  const pulse = 0.5 + 0.5 * Math.sin(d.t * 4);
  flashFx(ctx, d.flash, 30, w.glow);
  // fleshy nozzle
  ctx.fillStyle = body(ctx, 16, w.c1);
  ctx.beginPath();
  ctx.moveTo(-9, 0);
  ctx.quadraticCurveTo(-20, 30, -16, 70);
  ctx.quadraticCurveTo(0, 86, 16, 70);
  ctx.quadraticCurveTo(20, 30, 9, 0);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(0, 3, 7, 4, 0, 0, TAU); ctx.fill();
  // suckers / segments
  ctx.fillStyle = w.c2; ctx.globalAlpha = 0.55 + pulse * 0.3;
  for (let i = 0; i < 5; i++) {
    const yy = 14 + i * 12;
    ctx.beginPath(); ctx.ellipse(-8 + (i % 2) * 16, yy, 4, 3, 0, 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // sac body
  ctx.fillStyle = body(ctx, 20, shade(w.c1, 0.2));
  ctx.beginPath(); ctx.ellipse(0, 100, 20, 34, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = w.glow; ctx.globalAlpha = 0.3 + pulse * 0.25;
  ctx.beginPath(); ctx.ellipse(-4, 96, 11, 20, 0, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
  // tentacle strap
  ctx.strokeStyle = shade(w.c1, -0.3); ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(16, 70);
  ctx.quadraticCurveTo(36 + Math.sin(d.t * 3) * 4, 100, 22, 130);
  ctx.stroke();
  plate(ctx, -20, 118, w.emoji, 16, -0.25);
  trigger(ctx, 148); grip(ctx, 140, shade(w.c1, -0.5), 24);
  ctx.fillStyle = body(ctx, 12, w.c1); rr(ctx, -12, 132, 24, 50, 8); ctx.fill();
  glowBall(ctx, 0, 10, 16, w.glow, 0.3 + d.flash * 0.6);
};

const drawHeavy: Drawer = (ctx, w, d) => {
  flashFx(ctx, d.flash, 40, w.glow);
  ctx.fillStyle = body(ctx, 16, w.c1);
  ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.lineTo(16, 60); ctx.lineTo(-16, 60); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0e1116'; ctx.beginPath(); ctx.ellipse(0, 2, 8, 3.4, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = w.c2; ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) { const yy = 16 + i * 16; ctx.beginPath(); ctx.moveTo(-13 + i, yy); ctx.lineTo(13 - i, yy); ctx.stroke(); }
  ctx.fillStyle = body(ctx, 18, w.c1); rr(ctx, -18, 56, 36, 84, 8); ctx.fill();
  // spool / winch
  ctx.save();
  ctx.translate(0, 98); ctx.rotate(d.spin * 0.4);
  ctx.fillStyle = shade(w.c1, -0.45); ctx.beginPath(); ctx.arc(0, 0, 18, 0, TAU); ctx.fill();
  ctx.strokeStyle = w.c2; ctx.lineWidth = 2.4;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU;
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * 5, Math.sin(a) * 5); ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); ctx.stroke();
  }
  ctx.restore();
  glowBall(ctx, 0, 98, 22, w.glow, 0.35);
  ctx.save();
  ctx.translate(d.magDrop * 0.5, d.magDrop);
  ctx.globalAlpha = Math.max(0, 1 - d.magDrop / 80);
  ctx.fillStyle = shade(w.c1, -0.4); rr(ctx, 18, 118, 26, 30, 6); ctx.fill();
  plate(ctx, 31, 133, w.emoji, 14);
  ctx.restore();
  ctx.fillStyle = body(ctx, 14, w.c1); rr(ctx, -14, 136, 28, 54, 7); ctx.fill();
  trigger(ctx, 176); grip(ctx, 168, shade(w.c1, -0.5), 28);
  stock(ctx, 186, w.c1, 46);
};

const drawOrb: Drawer = (ctx, w, d) => {
  const pulse = 0.5 + 0.5 * Math.sin(d.t * 3);
  flashFx(ctx, d.flash, 36, w.glow);
  // containment ring
  ctx.save();
  ctx.translate(0, 40);
  ctx.strokeStyle = shade(w.c1, 0.6); ctx.lineWidth = 7;
  ctx.beginPath(); ctx.ellipse(0, 0, 30, 12 + pulse * 3, 0, 0, TAU); ctx.stroke();
  ctx.strokeStyle = w.c2; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.ellipse(0, 0, 30, 12 + pulse * 3, 0, 0, TAU); ctx.stroke();
  ctx.save();
  ctx.rotate(d.t * 0.9);
  ctx.strokeStyle = w.glow; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(0, 0, 24, 24, 0, 0, TAU); ctx.stroke();
  ctx.restore();
  // core
  const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
  cg.addColorStop(0, '#fff'); cg.addColorStop(0.4, w.c2); cg.addColorStop(1, w.glow);
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.arc(0, 0, 13 + pulse * 2 + d.charge * 5, 0, TAU); ctx.fill();
  ctx.restore();
  glowBall(ctx, 0, 40, 46, w.glow, 0.5 + d.charge * 0.4);
  // body
  ctx.fillStyle = body(ctx, 17, w.c1);
  ctx.beginPath();
  ctx.moveTo(-17, 54); ctx.quadraticCurveTo(-22, 90, -15, 128); ctx.lineTo(15, 128);
  ctx.quadraticCurveTo(22, 90, 17, 54); ctx.closePath(); ctx.fill();
  ctx.fillStyle = w.c2; ctx.globalAlpha = 0.5 + pulse * 0.3;
  rr(ctx, -9, 66, 18, 8, 4); ctx.fill(); rr(ctx, -9, 82, 18, 8, 4); ctx.fill();
  ctx.globalAlpha = 1;
  plate(ctx, 0, 108, w.emoji, 20);
  ctx.save();
  ctx.translate(d.magDrop * 0.5, d.magDrop);
  ctx.globalAlpha = Math.max(0, 1 - d.magDrop / 70);
  ctx.fillStyle = shade(w.c1, -0.4); rr(ctx, 12, 118, 24, 28, 6); ctx.fill();
  ctx.restore();
  trigger(ctx, 150); grip(ctx, 142, shade(w.c1, -0.45), 26);
  ctx.fillStyle = body(ctx, 12, w.c1); rr(ctx, -12, 136, 24, 50, 7); ctx.fill();
};

const drawTank: Drawer = (ctx, w, d) => {
  const pulse = 0.5 + 0.5 * Math.sin(d.t * 5);
  flashFx(ctx, d.flash, 38, w.glow);
  // wide nozzle
  ctx.fillStyle = body(ctx, 14, shade(w.c1, 0.2));
  ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.lineTo(8, 44); ctx.lineTo(-8, 44); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#0e1013'; ctx.beginPath(); ctx.ellipse(0, 3, 12, 4, 0, 0, TAU); ctx.fill();
  // pilot light / emitter ring
  ctx.fillStyle = w.c2; ctx.globalAlpha = 0.6 + pulse * 0.4;
  ctx.fillRect(-14, 8, 28, 3); ctx.globalAlpha = 1;
  glowBall(ctx, 0, 8, 20, w.glow, 0.4 + d.flash * 0.6);
  ctx.fillStyle = body(ctx, 6, '#39414d'); ctx.fillRect(-5, 40, 10, 48);
  // body
  ctx.fillStyle = body(ctx, 16, w.c1); rr(ctx, -16, 80, 32, 72, 8); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  for (let i = 0; i < 3; i++) { rr(ctx, -12, 88 + i * 16, 24, 7, 3); ctx.fill(); }
  // twin tanks on the grip side
  ctx.save();
  ctx.translate(d.magDrop * 0.4, d.magDrop);
  ctx.globalAlpha = Math.max(0, 1 - d.magDrop / 80);
  for (let i = 0; i < 2; i++) {
    const xx = 22 + i * 17;
    ctx.fillStyle = shade(w.c1, i ? -0.3 : -0.1);
    rr(ctx, xx, 86, 15, 62, 7); ctx.fill();
    ctx.fillStyle = w.c2; ctx.globalAlpha *= 0.9; rr(ctx, xx + 3, 94, 9, 16, 4); ctx.fill();
    ctx.globalAlpha = Math.max(0, 1 - d.magDrop / 80);
  }
  ctx.restore();
  // hose
  ctx.strokeStyle = shade(w.c1, -0.5); ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(14, 96);
  ctx.quadraticCurveTo(30 + Math.sin(d.t * 4) * 3, 70, 22, 60);
  ctx.stroke();
  plate(ctx, -22, 110, w.emoji, 16, -0.2);
  trigger(ctx, 162); grip(ctx, 152, shade(w.c1, -0.5), 26);
  ctx.fillStyle = body(ctx, 13, w.c1); rr(ctx, -13, 148, 26, 56, 7); ctx.fill();
  ctx.fillStyle = '#15181d'; rr(ctx, -16, 198, 32, 12, 5); ctx.fill();
};

const DRAWERS: Record<GunForm, Drawer> = {
  pistol: drawPistol,
  revolver: drawRevolver,
  rifle: drawRifleLike(62, false),
  ak: drawRifleLike(64, true),
  smg: drawSmg,
  shotgun: drawShotgun,
  sniper: drawSniper,
  minigun: drawMinigun,
  cannon: drawCannon,
  launcher: drawLauncher,
  blaster: drawBlaster,
  beam: drawBeam,
  wand: drawWand,
  bow: drawBow,
  sling: drawSling,
  blowgun: drawBlowgun,
  novelty: drawNovelty,
  organic: drawOrganic,
  heavy: drawHeavy,
  orb: drawOrb,
  tank: drawTank,
};

export function gunLength(w: WeaponDef) {
  return HERO_LEN[w.id] ?? GUN_LEN[w.form];
}

export function drawGun(
  ctx: CanvasRenderingContext2D, x: number, y: number, angle: number,
  side: number, w: WeaponDef, d: GunDraw,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + d.tilt * side);
  // subtle per-weapon proportions so no two guns share an identical silhouette
  let hv = 2166136261;
  for (let i = 0; i < w.id.length; i++) { hv ^= w.id.charCodeAt(i); hv = Math.imul(hv, 16777619); }
  hv >>>= 0;
  const isHero = !!HERO_GUNS[w.id];
  const sx = isHero ? 1 : 0.88 + ((hv >>> 3) % 28) / 100;
  const sy = isHero ? 1 : 0.9 + ((hv >>> 9) % 24) / 100;
  ctx.scale(side * sx, sy);
  ctx.lineJoin = 'round';
  const heroFn = HERO_GUNS[w.id];
  if (heroFn) {
    // bespoke artwork: no generic attachment kit, no proportion jitter
    heroFn(ctx, w, d);
  } else {
    DRAWERS[w.form](ctx, w, d);
    decorate(ctx, w, d);
  }
  ctx.restore();
}
