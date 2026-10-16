import type { Ammo } from './catalog';

const TAU = Math.PI * 2;
import { HERO_BULLETS } from './heroBullets';

export interface BulletView {
  kind: Ammo;
  variant: number;
  wid: string;
  x: number; y: number; vx: number; vy: number;
  age: number; size: number;
  c1: string; c2: string; glow: string;
  emoji?: string;
  trail: { x: number; y: number }[];
}

function tail(b: BulletView, len: number) {
  const a = Math.atan2(b.vy, b.vx);
  return { a, tx: b.x - Math.cos(a) * len, ty: b.y - Math.sin(a) * len };
}
function streak(ctx: CanvasRenderingContext2D, b: BulletView, len: number, width: number, core: string, edge: string) {
  const { tx, ty } = tail(b, len);
  const g = ctx.createLinearGradient(b.x, b.y, tx, ty);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.22, core);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.strokeStyle = g; ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tx, ty); ctx.stroke();
  ctx.globalAlpha = 0.45; ctx.strokeStyle = edge; ctx.lineWidth = width * 3;
  ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x * 0.65 + tx * 0.35, b.y * 0.65 + ty * 0.35); ctx.stroke();
  ctx.globalAlpha = 1;
}
function orb(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c1: string, c2: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, c1); g.addColorStop(0.6, c2); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r * 3, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(x, y, r * 0.5, 0, TAU); ctx.fill();
}
function cometTail(ctx: CanvasRenderingContext2D, b: BulletView, r: number, col: string) {
  for (let i = 0; i < b.trail.length; i++) {
    const p = b.trail[i];
    const f = i / Math.max(1, b.trail.length);
    ctx.globalAlpha = f * 0.5;
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(p.x, p.y, r * (0.25 + f * 0.9), 0, TAU); ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function emojiProj(ctx: CanvasRenderingContext2D, b: BulletView, size: number, spin: number, glow = true) {
  if (glow) {
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, size * 1.5);
    g.addColorStop(0, b.glow); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 0.55; ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x, b.y, size * 1.5, 0, TAU); ctx.fill();
    ctx.globalAlpha = 1;
  }
  cometTail(ctx, b, size * 0.3, b.glow);
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(spin);
  ctx.font = `${size}px serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(b.emoji || '⭐', 0, 0);
  ctx.restore();
}
function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, points: number, inner: number, rot: number) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * TAU + rot;
    const rr = i % 2 ? r * inner : r;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
}

/** per-weapon signature flourish drawn around every projectile */
function flourish(ctx: CanvasRenderingContext2D, b: BulletView, t: number) {
  const v = b.variant % 8;
  const ang = Math.atan2(b.vy, b.vx);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  switch (v) {
    case 0: { // twin spiral sparks
      for (let i = 0; i < 2; i++) {
        const a = b.age * 18 + i * Math.PI;
        const r = 9 + Math.sin(b.age * 10) * 3;
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = b.c2;
        ctx.beginPath();
        ctx.arc(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r * 0.6, 2.4, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 1: { // pulsing halo ring
      const k = (b.age * 3) % 1;
      ctx.strokeStyle = b.glow; ctx.globalAlpha = (1 - k) * 0.6; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(b.x, b.y, 6 + k * 18, 0, TAU); ctx.stroke();
      break;
    }
    case 2: { // chevron wake
      ctx.strokeStyle = b.c2; ctx.globalAlpha = 0.5; ctx.lineWidth = 2;
      for (let i = 1; i <= 2; i++) {
        const d = i * 13;
        const px = b.x - Math.cos(ang) * d, py = b.y - Math.sin(ang) * d;
        ctx.save(); ctx.translate(px, py); ctx.rotate(ang);
        ctx.beginPath(); ctx.moveTo(-5, -7); ctx.lineTo(3, 0); ctx.lineTo(-5, 7); ctx.stroke();
        ctx.restore();
      }
      break;
    }
    case 3: { // crossed glare
      ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 1.6;
      const s = 10 + Math.sin(t * 12 + b.age * 20) * 4;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(b.x - s, b.y); ctx.lineTo(b.x + s, b.y);
      ctx.moveTo(b.x, b.y - s); ctx.lineTo(b.x, b.y + s);
      ctx.stroke();
      break;
    }
    case 4: { // dust motes trailing
      ctx.fillStyle = b.glow; ctx.globalAlpha = 0.5;
      for (let i = 0; i < 3; i++) {
        const d = 8 + i * 9;
        const off = Math.sin(b.age * 14 + i * 2) * 6;
        ctx.beginPath();
        ctx.arc(b.x - Math.cos(ang) * d + Math.cos(ang + 1.57) * off,
          b.y - Math.sin(ang) * d + Math.sin(ang + 1.57) * off, 2 - i * 0.4, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 5: { // orbiting diamond
      const a = b.age * 10;
      ctx.fillStyle = b.c2; ctx.globalAlpha = 0.85;
      ctx.save();
      ctx.translate(b.x + Math.cos(a) * 13, b.y + Math.sin(a) * 13);
      ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(3, 0); ctx.lineTo(0, 4); ctx.lineTo(-3, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
      break;
    }
    case 6: { // ribbon wave behind
      ctx.strokeStyle = b.glow; ctx.globalAlpha = 0.55; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i <= 8; i++) {
        const d = i * 6;
        const off = Math.sin(b.age * 22 - i * 0.8) * 7;
        const px = b.x - Math.cos(ang) * d + Math.cos(ang + 1.57) * off;
        const py = b.y - Math.sin(ang) * d + Math.sin(ang + 1.57) * off;
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
      break;
    }
    default: { // bright aura pulse
      const r = 14 + Math.sin(b.age * 16) * 4;
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      g.addColorStop(0, b.glow); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.5; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}

export function drawBullet(ctx: CanvasRenderingContext2D, b: BulletView, t: number) {
  const hero = HERO_BULLETS[b.wid];
  if (hero) { ctx.save(); hero(ctx, b, t); ctx.restore(); return; }
  const ang = Math.atan2(b.vy, b.vx);
  const spin = b.age * 14 + b.variant;
  flourish(ctx, b, t);
  switch (b.kind) {
    case 'tracer': streak(ctx, b, 42, 3.4, b.c2, b.glow); dot(ctx, b, 2.4); break;
    case 'heavy': streak(ctx, b, 58, 5, b.c2, b.glow); dot(ctx, b, 3.4); break;
    case 'pellet': streak(ctx, b, 20, 2.6, b.c2, b.glow); dot(ctx, b, 2); break;
    case 'nail': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang + Math.PI / 2);
      ctx.fillStyle = '#e7ecf2'; ctx.fillRect(-1.3, -12, 2.6, 20);
      ctx.fillStyle = b.c2; ctx.fillRect(-4, 6, 8, 3);
      ctx.restore();
      streak(ctx, b, 16, 1.6, b.c2, b.glow);
      break;
    }
    case 'bolt': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang + Math.PI / 2);
      ctx.fillStyle = '#5a3b22'; ctx.fillRect(-1.8, -14, 3.6, 30);
      ctx.fillStyle = '#d7dde5';
      ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(5, -10); ctx.lineTo(-5, -10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = b.c2;
      ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(6, 20); ctx.lineTo(0, 16); ctx.lineTo(-6, 20); ctx.closePath(); ctx.fill();
      ctx.restore();
      break;
    }
    case 'dart': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang + Math.PI / 2);
      ctx.fillStyle = '#2f3b2a'; ctx.fillRect(-1.2, -10, 2.4, 20);
      ctx.fillStyle = b.glow; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(3, -8); ctx.lineTo(-3, -8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e7d6a8'; ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(4, 16); ctx.lineTo(-4, 16); ctx.closePath(); ctx.fill();
      ctx.restore();
      break;
    }
    case 'stone': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(spin * 0.4);
      ctx.fillStyle = '#8c8c93';
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU; const r = 7 + Math.sin(i * 3) * 2;
        i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(-2, -2, 3, 0, TAU); ctx.fill();
      ctx.restore();
      cometTail(ctx, b, 2.4, 'rgba(190,180,160,0.6)');
      break;
    }
    case 'water': {
      cometTail(ctx, b, 3, b.glow);
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang + Math.PI / 2);
      const g = ctx.createLinearGradient(0, -12, 0, 8);
      g.addColorStop(0, '#dffaff'); g.addColorStop(1, b.glow);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(0, -13); ctx.quadraticCurveTo(7, 2, 0, 9); ctx.quadraticCurveTo(-7, 2, 0, -13); ctx.fill();
      ctx.restore();
      break;
    }
    case 'snow': {
      cometTail(ctx, b, 3, 'rgba(230,250,255,0.8)');
      ctx.fillStyle = '#f2fbff';
      ctx.beginPath(); ctx.arc(b.x, b.y, 8, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(160,210,240,0.8)';
      ctx.beginPath(); ctx.arc(b.x + 2, b.y + 2, 5, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const a = spin + (i / 3) * Math.PI;
        ctx.beginPath(); ctx.moveTo(b.x - Math.cos(a) * 9, b.y - Math.sin(a) * 9); ctx.lineTo(b.x + Math.cos(a) * 9, b.y + Math.sin(a) * 9); ctx.stroke();
      }
      break;
    }
    case 'honey': {
      cometTail(ctx, b, 4, 'rgba(255,190,60,0.5)');
      const r = 9 + Math.sin(b.age * 18) * 1.6;
      const g = ctx.createRadialGradient(b.x - 2, b.y - 3, 1, b.x, b.y, r);
      g.addColorStop(0, '#ffe9a8'); g.addColorStop(1, '#d99a1c');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(b.x, b.y, r * 0.85, r, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.beginPath(); ctx.ellipse(b.x - 3, b.y - 3, 2.4, 3.4, -0.4, 0, TAU); ctx.fill();
      break;
    }
    case 'coconut': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(spin * 0.3);
      ctx.fillStyle = '#6b4a2a'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3c2a16';
      for (let i = 0; i < 3; i++) ctx.beginPath(), ctx.arc(-4 + i * 4, -4, 1.8, 0, TAU), ctx.fill();
      ctx.strokeStyle = '#4a3218'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(0, 0, 7, 0.4, 2.6); ctx.stroke();
      ctx.restore();
      cometTail(ctx, b, 3, 'rgba(200,160,110,0.5)');
      break;
    }
    case 'pencil': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang + Math.PI / 2);
      ctx.fillStyle = '#f2c200'; ctx.fillRect(-2.5, -8, 5, 22);
      ctx.fillStyle = '#f0dcae'; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(3, -8); ctx.lineTo(-3, -8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#333'; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(1.3, -12); ctx.lineTo(-1.3, -12); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff8da1'; ctx.fillRect(-2.5, 12, 5, 5);
      ctx.restore();
      break;
    }
    case 'paint': {
      const hue = (b.age * 300 + b.x) % 360;
      cometTail(ctx, b, 3.5, `hsla(${hue},90%,65%,0.8)`);
      ctx.fillStyle = `hsl(${hue},95%,62%)`;
      ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.beginPath(); ctx.arc(b.x - 2, b.y - 2, 2.4, 0, TAU); ctx.fill();
      break;
    }
    case 'plasma': {
      const r = b.size * (0.8 + Math.sin(b.age * 28) * 0.2);
      orb(ctx, b.x, b.y, r, b.c2, b.glow);
      cometTail(ctx, b, r * 0.8, b.glow);
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.6;
      for (let i = 0; i < 2; i++) {
        ctx.beginPath(); ctx.ellipse(b.x, b.y, r * 1.9, r * 0.7, b.age * 14 + i * Math.PI, 0, TAU); ctx.stroke();
      }
      break;
    }
    case 'laser': {
      const { tx, ty } = tail(b, 180);
      const g = ctx.createLinearGradient(b.x, b.y, tx, ty);
      g.addColorStop(0, '#fff'); g.addColorStop(0.15, b.c2); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.45; ctx.strokeStyle = b.glow; ctx.lineWidth = 17;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo((b.x + tx) / 2, (b.y + ty) / 2); ctx.stroke();
      break;
    }
    case 'beamgalaxy': {
      const { tx, ty } = tail(b, 220);
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = 0.35 - i * 0.08;
        ctx.strokeStyle = i === 0 ? b.glow : i === 1 ? b.c2 : '#fff';
        ctx.lineWidth = 22 - i * 7;
        ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tx, ty); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tx, ty); ctx.stroke();
      for (let i = 0; i < 6; i++) {
        const f = Math.random();
        star(ctx, b.x + (tx - b.x) * f + (Math.random() - 0.5) * 14, b.y + (ty - b.y) * f, 3, 4, 0.4, t);
        ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - f)})`; ctx.fill();
      }
      break;
    }
    case 'rocket': case 'meteor': {
      const fire = b.kind === 'meteor';
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang + Math.PI / 2);
      const fl = 22 + Math.sin(b.age * 50) * 7;
      const g = ctx.createLinearGradient(0, 0, 0, fl);
      g.addColorStop(0, 'rgba(255,255,220,0.95)'); g.addColorStop(0.4, 'rgba(255,170,40,0.8)'); g.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(-7, 6); ctx.quadraticCurveTo(0, fl * 1.2, 7, 6); ctx.closePath(); ctx.fill();
      if (fire) {
        ctx.fillStyle = '#4a3326'; ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU; const r = 12 + Math.sin(i * 2.3) * 3;
          i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#ff8a3c';
        ctx.beginPath(); ctx.arc(-3, -3, 4, 0, TAU); ctx.fill();
      } else {
        ctx.fillStyle = '#d7dbe0';
        ctx.beginPath(); ctx.moveTo(0, -17); ctx.lineTo(6, -4); ctx.lineTo(6, 8); ctx.lineTo(-6, 8); ctx.lineTo(-6, -4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = b.c2; ctx.beginPath(); ctx.moveTo(0, -17); ctx.lineTo(5, -5); ctx.lineTo(-5, -5); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#394049';
        ctx.beginPath(); ctx.moveTo(-6, 2); ctx.lineTo(-12, 12); ctx.lineTo(-6, 9); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(6, 2); ctx.lineTo(12, 12); ctx.lineTo(6, 9); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
      break;
    }
    case 'flame': {
      const k = Math.min(1, b.age * 3);
      const r = 7 + k * 20;
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      g.addColorStop(0, `rgba(255,255,220,${0.9 - k * 0.6})`);
      g.addColorStop(0.35, `rgba(255,160,40,${0.8 - k * 0.5})`);
      g.addColorStop(1, 'rgba(255,40,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, TAU); ctx.fill();
      break;
    }
    case 'disc': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(spin * 2.5);
      const g = ctx.createLinearGradient(-12, 0, 12, 0);
      g.addColorStop(0, b.c2); g.addColorStop(0.5, '#fff'); g.addColorStop(1, b.glow);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(0, 0, 13, 5, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.stroke();
      ctx.restore();
      cometTail(ctx, b, 3, b.glow);
      break;
    }
    case 'bubble': {
      const r = b.size + Math.sin(b.age * 10) * 1.5;
      const g = ctx.createRadialGradient(b.x - r * 0.3, b.y - r * 0.3, 1, b.x, b.y, r);
      g.addColorStop(0, 'rgba(255,255,255,0.9)');
      g.addColorStop(0.5, 'rgba(180,235,255,0.35)');
      g.addColorStop(1, 'rgba(120,200,255,0.55)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(b.x, b.y, r + 4, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.4; ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath(); ctx.arc(b.x - r * 0.4, b.y - r * 0.4, r * 0.22, 0, TAU); ctx.fill();
      break;
    }
    case 'boom': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(spin * 0.5);
      ctx.fillStyle = '#1b1b1f'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3a3a42'; ctx.beginPath(); ctx.arc(-3, -3, 4, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#b08030'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(6, -7); ctx.quadraticCurveTo(14, -14, 10, -20); ctx.stroke();
      ctx.restore();
      const sp = 4 + Math.sin(t * 40) * 2;
      ctx.fillStyle = '#ffd166';
      ctx.beginPath(); ctx.arc(b.x + 8, b.y - 20, sp, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,120,30,0.6)';
      ctx.beginPath(); ctx.arc(b.x + 8, b.y - 20, sp * 1.8, 0, TAU); ctx.fill();
      break;
    }
    case 'confetti': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(spin * 2);
      const hue = (b.x * 7 + b.age * 400) % 360;
      ctx.fillStyle = `hsl(${hue},95%,65%)`;
      ctx.fillRect(-4, -2.5, 8, 5);
      ctx.restore();
      break;
    }
    case 'seed': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang + Math.PI / 2);
      ctx.fillStyle = '#9a7b3f'; ctx.beginPath(); ctx.ellipse(0, 0, 4, 7, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#86d35b';
      ctx.beginPath(); ctx.ellipse(4, 4, 5, 2.4, -0.6, 0, TAU); ctx.fill();
      ctx.restore();
      cometTail(ctx, b, 2, 'rgba(140,230,110,0.5)');
      break;
    }
    case 'note': {
      cometTail(ctx, b, 3, b.glow);
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.sin(b.age * 10) * 0.3);
      ctx.font = '20px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(['🎵', '🎶', '🎼'][Math.floor(b.age * 10) % 3], 0, 0);
      ctx.restore();
      break;
    }
    case 'ink': {
      cometTail(ctx, b, 5, 'rgba(90,30,140,0.5)');
      ctx.fillStyle = b.c1;
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * TAU + b.age;
        const r = 8 + Math.sin(i * 2 + b.age * 10) * 3;
        i ? ctx.lineTo(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r) : ctx.moveTo(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r);
      }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = b.glow; ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.arc(b.x - 2, b.y - 2, 3, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
      break;
    }
    case 'yoyo': {
      const { tx, ty } = tail(b, 120);
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(spin * 3);
      ctx.fillStyle = b.c1; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill();
      ctx.fillStyle = b.c2; ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillRect(-11, -1.5, 22, 3);
      ctx.restore();
      break;
    }
    case 'petal': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(spin * 0.8 + Math.sin(b.age * 6));
      ctx.fillStyle = '#ffd3e6';
      for (let i = 0; i < 5; i++) {
        ctx.rotate(TAU / 5);
        ctx.beginPath(); ctx.ellipse(0, -6, 3.4, 6, 0, 0, TAU); ctx.fill();
      }
      ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, TAU); ctx.fill();
      ctx.restore();
      cometTail(ctx, b, 2.4, 'rgba(255,190,220,0.6)');
      break;
    }
    case 'acid': {
      cometTail(ctx, b, 4, 'rgba(160,255,60,0.5)');
      const r = 9 + Math.sin(b.age * 22) * 2;
      const g = ctx.createRadialGradient(b.x - 2, b.y - 2, 1, b.x, b.y, r);
      g.addColorStop(0, '#f0ffb0'); g.addColorStop(1, b.glow);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(b.x, b.y, r * 0.9, r, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let i = 0; i < 3; i++) {
        const a = b.age * 8 + i * 2;
        ctx.beginPath(); ctx.arc(b.x + Math.cos(a) * 4, b.y + Math.sin(a) * 4, 1.4, 0, TAU); ctx.fill();
      }
      break;
    }
    case 'magic': {
      orb(ctx, b.x, b.y, b.size * 0.8, b.c2, b.glow);
      for (let i = 0; i < 4; i++) {
        const a = b.age * 8 + (i / 4) * TAU;
        star(ctx, b.x + Math.cos(a) * 13, b.y + Math.sin(a) * 13, 4, 4, 0.35, a);
        ctx.fillStyle = '#fff'; ctx.fill();
      }
      cometTail(ctx, b, 3, b.glow);
      break;
    }
    case 'card': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(spin * 1.5);
      ctx.scale(Math.abs(Math.cos(b.age * 12)) * 0.8 + 0.3, 1);
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.roundRect(-7, -10, 14, 20, 2.5); ctx.fill();
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = b.c2; ctx.font = '11px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('A', 0, 0);
      ctx.restore();
      break;
    }
    case 'sonic': {
      for (let i = 0; i < 3; i++) {
        const k = ((b.age * 6 + i * 0.33) % 1);
        ctx.strokeStyle = b.glow;
        ctx.globalAlpha = (1 - k) * 0.8;
        ctx.lineWidth = 3;
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang);
        ctx.beginPath(); ctx.ellipse(0, 0, 6 + k * 16, 16 + k * 26, 0, -1.1, 1.1); ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      orb(ctx, b.x, b.y, 4, b.c2, b.glow);
      break;
    }
    case 'shard': case 'freeze': {
      const cold = b.kind === 'freeze';
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang + Math.PI / 2 + Math.sin(b.age * 8) * 0.1);
      const g = ctx.createLinearGradient(-8, -14, 8, 14);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, b.c2); g.addColorStop(1, b.glow);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(7, 0); ctx.lineTo(0, 15); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.restore();
      cometTail(ctx, b, 3, cold ? 'rgba(190,235,255,0.6)' : b.glow);
      break;
    }
    case 'coin': {
      ctx.save(); ctx.translate(b.x, b.y);
      ctx.scale(Math.abs(Math.cos(b.age * 16)) * 0.9 + 0.15, 1);
      const g = ctx.createRadialGradient(-2, -2, 1, 0, 0, 9);
      g.addColorStop(0, '#fff6c2'); g.addColorStop(0.6, '#fcd34d'); g.addColorStop(1, '#b45309');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#92400e'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.restore();
      cometTail(ctx, b, 3, 'rgba(255,215,100,0.6)');
      break;
    }
    case 'star': {
      star(ctx, b.x, b.y, 11, 5, 0.42, spin * 0.6);
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 16);
      g.addColorStop(0, '#fff'); g.addColorStop(1, b.glow);
      ctx.fillStyle = g; ctx.fill();
      cometTail(ctx, b, 3, b.glow);
      break;
    }
    case 'bolt_elec': {
      const { tx, ty } = tail(b, 90);
      ctx.strokeStyle = b.glow; ctx.lineWidth = 7; ctx.globalAlpha = 0.35;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      for (let i = 1; i <= 5; i++) {
        const f = i / 5;
        const nx = b.x + (tx - b.x) * f + (Math.random() - 0.5) * 16;
        const ny = b.y + (ty - b.y) * f + (Math.random() - 0.5) * 16;
        ctx.lineTo(nx, ny);
      }
      ctx.stroke();
      ctx.strokeStyle = b.c2; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      for (let i = 1; i <= 4; i++) {
        const f = i / 4;
        ctx.lineTo(b.x + (tx - b.x) * f + (Math.random() - 0.5) * 24, b.y + (ty - b.y) * f + (Math.random() - 0.5) * 24);
      }
      ctx.stroke();
      break;
    }
    case 'rainbow': {
      const cols = ['#ff4d4d', '#ffa64d', '#ffe74d', '#6bff8f', '#4dd2ff', '#9b6bff'];
      const { tx, ty } = tail(b, 70);
      for (let i = 0; i < cols.length; i++) {
        const off = (i - 2.5) * 3.4;
        ctx.strokeStyle = cols[i]; ctx.lineWidth = 3; ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(b.x + Math.cos(ang + Math.PI / 2) * off, b.y + Math.sin(ang + Math.PI / 2) * off);
        ctx.lineTo(tx + Math.cos(ang + Math.PI / 2) * off, ty + Math.sin(ang + Math.PI / 2) * off);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, TAU); ctx.fill();
      break;
    }
    case 'blackhole': {
      const r = b.size + Math.sin(b.age * 6) * 2;
      const g = ctx.createRadialGradient(b.x, b.y, r * 0.3, b.x, b.y, r * 3.4);
      g.addColorStop(0, '#000');
      g.addColorStop(0.42, '#1a0b33');
      g.addColorStop(0.72, b.glow);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(b.x, b.y, r * 3.4, 0, TAU); ctx.fill();
      ctx.strokeStyle = b.c2; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = 0.8 - i * 0.2;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, r * (1.6 + i * 0.5), r * (0.5 + i * 0.2), b.age * 6 + i, 0, TAU);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(b.x, b.y, r * 0.9, 0, TAU); ctx.fill();
      break;
    }
    case 'portal': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.age * 7);
      for (let i = 0; i < 2; i++) {
        ctx.strokeStyle = i ? b.c2 : b.glow;
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.ellipse(0, 0, 13 - i * 4, 8 - i * 3, i * 1.2, 0, TAU); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fill();
      ctx.restore();
      cometTail(ctx, b, 3, b.glow);
      break;
    }
    case 'holy': {
      const { tx, ty } = tail(b, 150);
      const g = ctx.createLinearGradient(b.x, b.y, tx, ty);
      g.addColorStop(0, '#fffbe6'); g.addColorStop(0.3, b.c2); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = 0.5; ctx.strokeStyle = b.glow; ctx.lineWidth = 24;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tx, ty); ctx.stroke();
      // cross flare
      ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(b.x - 16, b.y); ctx.lineTo(b.x + 16, b.y); ctx.stroke();
      star(ctx, b.x, b.y, 10, 4, 0.25, Math.PI / 4);
      ctx.fillStyle = '#fff'; ctx.fill();
      break;
    }
    case 'tornado': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang + Math.PI / 2);
      ctx.strokeStyle = b.glow; ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        const yy = -14 + i * 8;
        const rw = 4 + i * 3.2;
        ctx.globalAlpha = 0.9 - i * 0.12;
        ctx.beginPath(); ctx.ellipse(Math.sin(b.age * 18 + i) * 2, yy, rw, 3.4, 0, 0, TAU); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      break;
    }
    case 'firework': {
      orb(ctx, b.x, b.y, 5, b.c2, b.glow);
      for (let i = 0; i < 4; i++) {
        const p = b.trail[Math.max(0, b.trail.length - 1 - i * 2)];
        if (!p) continue;
        ctx.fillStyle = `hsla(${(i * 70 + b.age * 300) % 360},95%,65%,${0.6 - i * 0.12})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 4 - i * 0.6, 0, TAU); ctx.fill();
      }
      break;
    }
    case 'anchor': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang + Math.PI / 2 + Math.sin(b.age * 6) * 0.2);
      ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, 12); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -14, 5, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-9, -4); ctx.lineTo(9, -4); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-12, 4); ctx.quadraticCurveTo(0, 20, 12, 4); ctx.stroke();
      ctx.restore();
      const { tx, ty } = tail(b, 90);
      ctx.strokeStyle = 'rgba(200,210,225,0.4)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tx, ty); ctx.stroke();
      break;
    }
    case 'chain': {
      const { tx, ty } = tail(b, 110);
      ctx.strokeStyle = 'rgba(190,205,225,0.75)'; ctx.lineWidth = 3;
      ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.setLineDash([]);
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang + Math.PI / 2);
      ctx.fillStyle = '#cfd8e3';
      ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(5, -4); ctx.lineTo(2, -4); ctx.lineTo(2, 12); ctx.lineTo(-2, 12); ctx.lineTo(-2, -4); ctx.lineTo(-5, -4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(-2, 2); ctx.moveTo(6, -2); ctx.lineTo(2, 2); ctx.stroke();
      ctx.restore();
      break;
    }
    case 'shrink': {
      for (let i = 0; i < 3; i++) {
        const k = (b.age * 5 + i * 0.33) % 1;
        ctx.strokeStyle = b.glow; ctx.globalAlpha = 1 - k; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(b.x, b.y, 4 + (1 - k) * 16, 0, TAU); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      orb(ctx, b.x, b.y, 4, b.c2, b.glow);
      break;
    }
    case 'pixel': {
      const px = 4;
      const grid = [[0, -2], [0, -1], [-1, 0], [0, 0], [1, 0], [0, 1]];
      ctx.fillStyle = b.c2;
      for (const [gx, gy] of grid) ctx.fillRect(b.x + gx * px - px / 2, b.y + gy * px - px / 2, px, px);
      ctx.fillStyle = 'rgba(80,255,80,0.35)';
      for (let i = 0; i < b.trail.length; i += 2) {
        const p = b.trail[i];
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      }
      break;
    }
    case 'kunai': {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(spin * 2.2);
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        const r = i % 2 ? 4 : 13;
        i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#1d2228'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, TAU); ctx.fill();
      ctx.restore();
      streak(ctx, b, 24, 2, '#e2e8f0', b.glow);
      break;
    }
    case 'slug': {
      streak(ctx, b, 110, 7, b.c2, b.glow);
      for (let i = 0; i < 3; i++) {
        const f = 0.18 + i * 0.22;
        const rx = b.x - Math.cos(ang) * 110 * f, ry = b.y - Math.sin(ang) * 110 * f;
        ctx.strokeStyle = `rgba(200,240,255,${0.5 - i * 0.14})`; ctx.lineWidth = 2;
        ctx.save(); ctx.translate(rx, ry); ctx.rotate(ang);
        ctx.beginPath(); ctx.ellipse(0, 0, 4 + i * 3, 9 + i * 7, 0, 0, TAU); ctx.stroke();
        ctx.restore();
      }
      dot(ctx, b, 4.2);
      break;
    }
    case 'emoji':
    default:
      emojiProj(ctx, b, 26, spin * 0.5);
      break;
  }
}

function dot(ctx: CanvasRenderingContext2D, b: BulletView, r: number) {
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, TAU); ctx.fill();
}
