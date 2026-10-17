import { TAU, rand, lin, rr, grip, guard, glow, star, radial, chrome, wood, gunState } from './kit';
import { shotPulse } from './commonGunMotion';
import type { VariantWeapon } from './gunVariants';

// Pre-overhaul renderers are preserved from git HEAD (c0769f5).
// Only Moonbeam's original pistol grip is replaced by a continuous staff so
// All Moonbeam choices obey the 'wand, not gun' design constraint.
type C = CanvasRenderingContext2D;
const angledGrip = grip;
const triggerGuard = guard;
const glowDot = glow;
function jagged(c: C, x0: number, y0: number, x1: number, y1: number, amp: number, n = 6) {
  c.beginPath(); c.moveTo(x0, y0);
  for (let i = 1; i < n; i++) {
    const k = i / n;
    c.lineTo(x0 + (x1 - x0) * k + rand(-amp, amp), y0 + (y1 - y0) * k + rand(-amp, amp));
  }
  c.lineTo(x1, y1); c.stroke();
}
const gold = (c: C, x0: number, x1: number) =>
  lin(c, x0, x1, ['#7a5800', '#ffe680', '#d9a825', '#7a5800']);

export function drawOriginalGun(c: C, id: VariantWeapon, cx: number, y0: number, t: number, ready = true) {
  switch (id) {
    case 'dragon': dragon(c, cx, y0, t); break;
    case 'rainbow': rainbowGun(c, cx, y0, t); break;
    case 'meteor': meteorGun(c, cx, y0, t); break;
    case 'diamond': diamondGun(c, cx, y0, t); break;
    case 'moonbeam': moonbeamGun(c, cx, y0, t); break;
    case 'golden': golden(c, cx, y0, t); break;
    case 'blackhole': blackhole(c, cx, y0, t); break;
    case 'plasma': plasma(c, cx, y0, t); break;
    case 'laser': laserGun(c, cx, y0, t); break;
    case 'chicken': chickenGun(c, cx, y0, t, ready); break;
    case 'honey': classicHoney(c, cx, y0, t); break;
    default: { const _never: never = id; return _never; }
  }
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

function dragon(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 120, '#3f1d0b', '#7c2d12', 0.8);
  guard(c, cx, y0 + 112, '#1c0a00');
  // wings
  for (const s of [-1, 1]) {
    c.save();
    c.translate(cx + s * 14, y0 + 70);
    c.rotate(s * (0.2 + Math.sin(t * 4) * 0.08));
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(s * 30, -10, s * 34, 16);
    c.quadraticCurveTo(s * 24, 12, s * 20, 22);
    c.quadraticCurveTo(s * 12, 16, s * 6, 26);
    c.closePath();
    c.fillStyle = lin(c, 0, s * 34, ['#7f1d1d', '#b91c1c']);
    c.fill();
    c.strokeStyle = '#450a0a';
    c.lineWidth = 1.5;
    c.stroke();
    c.restore();
  }
  // body scales
  rr(c, cx - 15, y0 + 40, 30, 96, [10, 10, 6, 6], lin(c, cx - 15, cx + 15, ['#450a0a', '#dc2626', '#991b1b', '#450a0a']), '#1c0505');
  c.fillStyle = 'rgba(251,191,36,0.6)';
  for (let r = 0; r < 7; r++) {
    for (let k = 0; k < 3; k++) {
      c.beginPath();
      c.arc(cx - 8 + k * 8 + (r % 2) * 4, y0 + 52 + r * 12, 3.5, 0, Math.PI);
      c.fill();
    }
  }
  // head (pointing up, jaw open)
  c.save();
  c.translate(cx, y0 + 34);
  // horns
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 8, -6);
    c.quadraticCurveTo(s * 20, 0, s * 22, 14);
    c.lineTo(s * 12, 2);
    c.closePath();
    c.fillStyle = '#fef3c7';
    c.fill();
  }
  c.beginPath();
  c.moveTo(-14, 8);
  c.lineTo(-11, -20);
  c.lineTo(-6, -32);
  c.lineTo(-2, -24);
  c.lineTo(2, -24);
  c.lineTo(6, -32);
  c.lineTo(11, -20);
  c.lineTo(14, 8);
  c.closePath();
  c.fillStyle = lin(c, -14, 14, ['#7f1d1d', '#ef4444', '#991b1b']);
  c.fill();
  c.strokeStyle = '#1c0505';
  c.lineWidth = 1.5;
  c.stroke();
  // mouth glow
  const f = 0.7 + 0.3 * Math.sin(t * 20);
  c.beginPath();
  c.ellipse(0, -24, 4, 6, 0, 0, TAU);
  c.fillStyle = `rgba(255,${150 + f * 80},40,1)`;
  c.fill();
  // teeth
  c.fillStyle = '#fff';
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 4, -28);
    c.lineTo(s * 2.5, -22);
    c.lineTo(s * 5, -22);
    c.fill();
  }
  // eyes
  for (const s of [-1, 1]) glow(c, s * 7, -4, 2.5, '#fde047', 10);
  c.restore();
  if (Math.random() < 0.5) glow(c, cx + rand(-2, 2), y0 + rand(0, 6), rand(1, 2.5), '#fb923c', 8);
}

function rainbowGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 108, '#f9fafb', '#e5e7eb', 0.78);
  guard(c, cx, y0 + 100, '#9ca3af');
  // body with rainbow bands
  const RB = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa'];
  c.save();
  c.beginPath();
  c.roundRect(cx - 18, y0 + 36, 36, 96, 12);
  c.clip();
  for (let i = 0; i < 6; i++) {
    c.fillStyle = RB[(i + Math.floor(t * 4)) % 6];
    c.fillRect(cx - 18 + i * 6, y0 + 36, 6, 96);
  }
  c.fillStyle = 'rgba(255,255,255,0.3)';
  c.fillRect(cx - 12, y0 + 36, 4, 96);
  c.restore();
  c.beginPath();
  c.roundRect(cx - 18, y0 + 36, 36, 96, 12);
  c.strokeStyle = '#fff';
  c.lineWidth = 2;
  c.stroke();
  // clouds
  const cloud = (x: number, y: number, s: number) => {
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(x, y, 7 * s, 0, TAU);
    c.arc(x + 8 * s, y + 2 * s, 6 * s, 0, TAU);
    c.arc(x - 8 * s, y + 2 * s, 6 * s, 0, TAU);
    c.fill();
  };
  // arc
  for (let i = 0; i < 6; i++) {
    c.strokeStyle = RB[i];
    c.lineWidth = 2.6;
    c.beginPath();
    c.arc(cx, y0 + 34, 26 - i * 2.6, Math.PI, TAU);
    c.stroke();
  }
  cloud(cx - 24, y0 + 34, 0.8);
  cloud(cx + 24, y0 + 34, 0.8);
  // star emitter
  c.save();
  c.translate(cx, y0 + 6);
  c.rotate(t * 2);
  star(c, 0, 0, 8, '#fde047');
  c.restore();
  glow(c, cx, y0 + 6, 3, '#ffffff', 14);
}

function meteorGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 120, '#1c1917', '#44403c', 0.8);
  guard(c, cx, y0 + 112);
  // volcanic rock body with lava cracks
  c.beginPath();
  c.moveTo(cx - 22, y0 + 140);
  c.lineTo(cx - 24, y0 + 60);
  c.lineTo(cx - 16, y0 + 36);
  c.lineTo(cx + 14, y0 + 32);
  c.lineTo(cx + 24, y0 + 58);
  c.lineTo(cx + 22, y0 + 140);
  c.closePath();
  c.fillStyle = lin(c, cx - 24, cx + 24, ['#0c0a09', '#44403c', '#292524', '#0c0a09']);
  c.fill();
  c.save();
  c.clip();
  const lv = 0.6 + 0.4 * Math.sin(t * 4);
  c.shadowColor = '#f97316';
  c.shadowBlur = 10 * lv;
  c.strokeStyle = `rgba(251,146,60,${0.7 + 0.3 * lv})`;
  c.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.moveTo(cx - 24 + i * 14, y0 + 140);
    c.lineTo(cx - 16 + i * 10, y0 + 110);
    c.lineTo(cx - 20 + i * 12, y0 + 80);
    c.lineTo(cx - 12 + i * 8, y0 + 46);
    c.stroke();
  }
  c.restore();
  // molten core muzzle
  c.beginPath();
  c.arc(cx, y0 + 18, 15, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 18, 15, ['#fff7ed', '#fb923c', '#7c2d12']);
  c.shadowColor = '#f97316';
  c.shadowBlur = 20;
  c.fill();
  c.shadowBlur = 0;
  // orbiting rocks
  for (let i = 0; i < 3; i++) {
    const a = t * 2 + (i / 3) * TAU;
    c.fillStyle = '#57534e';
    c.beginPath();
    c.arc(cx + Math.cos(a) * 24, y0 + 18 + Math.sin(a) * 9, 3, 0, TAU);
    c.fill();
  }
  if (Math.random() < 0.4) glow(c, cx + rand(-10, 10), y0 + rand(-4, 10), rand(1, 2), '#fdba74', 8);
}

function diamondGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 104, '#e5e7eb', '#9ca3af', 0.78);
  guard(c, cx, y0 + 96, '#475569');
  // platinum body
  rr(c, cx - 14, y0 + 44, 28, 86, 6, chrome(c, cx - 14, cx + 14), '#334155');
  // inset gems
  const gem = (x: number, y: number, s: number, col: string) => {
    c.beginPath();
    c.moveTo(x, y - s);
    c.lineTo(x + s * 0.8, y);
    c.lineTo(x, y + s);
    c.lineTo(x - s * 0.8, y);
    c.closePath();
    c.fillStyle = col;
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.8)';
    c.lineWidth = 0.8;
    c.stroke();
  };
  gem(cx, y0 + 70, 6, '#67e8f9');
  gem(cx - 6, y0 + 94, 4, '#f472b6');
  gem(cx + 6, y0 + 94, 4, '#a78bfa');
  gem(cx, y0 + 114, 5, '#4ade80');
  // big diamond at muzzle
  c.save();
  c.translate(cx, y0 + 18);
  c.beginPath();
  c.moveTo(-16, -4);
  c.lineTo(-9, -14);
  c.lineTo(9, -14);
  c.lineTo(16, -4);
  c.lineTo(0, 22);
  c.closePath();
  const g = c.createLinearGradient(-16, -14, 16, 22);
  g.addColorStop(0, '#ecfeff');
  g.addColorStop(0.4, '#67e8f9');
  g.addColorStop(0.7, '#e0f2fe');
  g.addColorStop(1, '#0891b2');
  c.fillStyle = g;
  c.shadowColor = '#a5f3fc';
  c.shadowBlur = 14;
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = 'rgba(255,255,255,0.9)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(-16, -4);
  c.lineTo(16, -4);
  c.moveTo(-9, -14);
  c.lineTo(-4, -4);
  c.lineTo(0, 22);
  c.lineTo(4, -4);
  c.lineTo(9, -14);
  c.stroke();
  c.restore();
  for (let i = 0; i < 3; i++) {
    const a = Math.sin(t * 3 + i * 2.1);
    if (a > 0.4) star(c, cx + [-14, 14, 4][i], y0 + [8, 24, -2][i], 5 * a, '#ffffff', 4);
  }
}

function moonbeamGun(c: C, cx: number, y0: number, t: number) {
  // The original crescent and orb, with its pistol grip exchanged for a
  // continuous wand shaft: even the 'Sebelumnya' option stays a magic wand.
  rr(c, cx - 6, y0 + 119, 12, 65, 5, lin(c, cx - 6, cx + 6,
    ['#312e81', '#e0e7ff', '#6d5aa9', '#241544']), '#312e81');
  rr(c, cx - 10, y0 + 176, 20, 7, 3, '#c4b5fd', '#6d5aa9');
  // silver staff body
  rr(c, cx - 7, y0 + 40, 14, 92, 6, chrome(c, cx - 7, cx + 7), '#312e81', 1.2);
  for (let i = 0; i < 3; i++) star(c, cx, y0 + 60 + i * 24, 3, '#c4b5fd');
  // crescent moon housing
  c.save();
  c.translate(cx, y0 + 20);
  c.shadowColor = '#ddd6fe';
  c.shadowBlur = 16;
  c.beginPath();
  c.arc(0, 0, 22, Math.PI * 0.15, Math.PI * 1.85);
  c.arc(8, 0, 17, Math.PI * 1.75, Math.PI * 0.25, true);
  c.closePath();
  c.fillStyle = lin(c, -22, 22, ['#a78bfa', '#f5f3ff', '#c4b5fd']);
  c.fill();
  c.restore();
  // orb
  const p = 0.7 + 0.3 * Math.sin(t * 3);
  c.beginPath();
  c.arc(cx + 2, y0 + 20, 8, 0, TAU);
  c.fillStyle = radial(c, cx + 2, y0 + 20, 8, ['#ffffff', '#ede9fe', '#a78bfa']);
  c.shadowColor = '#ffffff';
  c.shadowBlur = 18 * p;
  c.fill();
  c.shadowBlur = 0;
  // tiny stars
  for (let i = 0; i < 5; i++) {
    const a = t * 0.8 + (i / 5) * TAU;
    const tw = 0.5 + 0.5 * Math.sin(t * 5 + i);
    star(c, cx + Math.cos(a) * 32, y0 + 20 + Math.sin(a) * 14, 2.5 * tw + 0.5, '#ffffff', 4);
  }
}

// Added classic Plasma, Laser and Rubber Chicken: their original HEAD art.
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

function chickenGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  grip(c, cx, y0 + 118, '#dc2626', '#f87171', 0.8);
  guard(c, cx, y0 + 110, '#7f1d1d');
  // plunger
  rr(c, cx - 4, y0 + 142, 8, 36, 2, '#9ca3af');
  rr(c, cx - 12, y0 + 174, 24, 10, 4, '#ef4444', '#7f1d1d');
  // tube with stripes
  c.save();
  c.beginPath();
  c.roundRect(cx - 17, y0 + 30, 34, 116, 6);
  c.clip();
  c.fillStyle = '#facc15';
  c.fillRect(cx - 17, y0 + 30, 34, 116);
  c.fillStyle = '#ef4444';
  for (let i = -2; i < 10; i++) {
    c.beginPath();
    c.moveTo(cx - 17, y0 + 30 + i * 18);
    c.lineTo(cx + 17, y0 + 18 + i * 18);
    c.lineTo(cx + 17, y0 + 27 + i * 18);
    c.lineTo(cx - 17, y0 + 39 + i * 18);
    c.fill();
  }
  c.fillStyle = 'rgba(255,255,255,0.3)';
  c.fillRect(cx - 12, y0 + 30, 4, 116);
  c.restore();
  c.beginPath();
  c.roundRect(cx - 17, y0 + 30, 34, 116, 6);
  c.strokeStyle = '#7c2d12';
  c.lineWidth = 2;
  c.stroke();
  rr(c, cx - 20, y0 + 24, 40, 10, 4, '#7c2d12');
  // chicken head popping out
  if (ready) {
    const bob = Math.sin(t * 8) * 1.5;
    c.save();
    c.translate(cx, y0 + 18 + bob);
    rr(c, -6, -2, 12, 14, 4, '#fde047', '#a16207', 1.2);
    c.beginPath();
    c.ellipse(0, -8, 9, 10, 0, 0, TAU);
    c.fillStyle = radial(c, 0, -8, 10, ['#fef9c3', '#fde047', '#eab308']);
    c.fill();
    c.strokeStyle = '#a16207';
    c.stroke();
    c.fillStyle = '#ef4444';
    for (let i = -1; i <= 1; i++) {
      c.beginPath();
      c.arc(i * 3.5, -18 - (i === 0 ? 2 : 0), 3, 0, TAU);
      c.fill();
    }
    c.fillStyle = '#f97316';
    c.beginPath();
    c.moveTo(-3, -4);
    c.lineTo(3, -4);
    c.lineTo(0, 3);
    c.closePath();
    c.fill();
    c.strokeStyle = '#111';
    c.lineWidth = 1.3;
    for (const s of [-1, 1]) {
      c.beginPath();
      c.moveTo(s * 5 - 2, -12);
      c.lineTo(s * 5 + 2, -8);
      c.moveTo(s * 5 + 2, -12);
      c.lineTo(s * 5 - 2, -8);
      c.stroke();
    }
    c.restore();
  }
}

// Original glass jar, cloth lid and bee from before the Honey Blaster rework.
function classicHoney(c: C, cx: number, y0: number, t: number) {
  const surge = shotPulse(gunState.sinceShot, 0.32);
  grip(c, cx, y0 + 110, '#78350f', '#b45309', 0.8);
  guard(c, cx, y0 + 102, '#451a03');
  // honey jar body
  c.beginPath();
  c.roundRect(cx - 24, y0 + 40, 48, 76, [10, 10, 16, 16]);
  c.fillStyle = 'rgba(254,243,199,0.35)';
  c.fill();
  c.save();
  c.clip();
  const lvl = y0 + 58 + Math.sin(t * 2) * 2 + surge * 5;
  c.fillStyle = lin(c, cx - 24, cx + 24, ['#b45309', '#fbbf24', '#f59e0b', '#92400e']);
  c.fillRect(cx - 24, lvl, 48, 80);
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.fillRect(cx - 18, lvl + 4, 4, 50);
  // honeycomb
  c.strokeStyle = 'rgba(120,53,15,0.45)';
  c.lineWidth = 1;
  for (let r2 = 0; r2 < 4; r2++) {
    for (let k = 0; k < 4; k++) {
      const hx = cx - 15 + k * 10 + (r2 % 2) * 5;
      const hy = y0 + 70 + r2 * 9;
      c.beginPath();
      for (let i = 0; i < 6; i++) c.lineTo(hx + Math.cos((i / 6) * TAU) * 5, hy + Math.sin((i / 6) * TAU) * 5);
      c.closePath();
      c.stroke();
    }
  }
  // Small bubbles churn within the original jar, not a replacement design.
  c.fillStyle = 'rgba(255,248,196,0.75)';
  for (let i = 0; i < 3; i++) {
    const by = y0 + 109 - ((t * (9 + surge * 18) + i * 13) % 39);
    c.beginPath();
    c.arc(cx - 12 + i * 12 + Math.sin(t * 3 + i) * 1.5, by, 1.7 + surge, 0, TAU);
    c.fill();
  }
  c.restore();
  c.beginPath();
  c.roundRect(cx - 24, y0 + 40, 48, 76, [10, 10, 16, 16]);
  c.strokeStyle = '#78350f';
  c.lineWidth = 2;
  c.stroke();
  // The old cloth lid compresses for a beat when honey is pumped out.
  const lidY = y0 + 32 + surge * 4;
  rr(c, cx - 27, lidY, 54, 12, 4, '#dc2626', '#7f1d1d');
  c.fillStyle = '#fff';
  for (let i = 0; i < 6; i++) c.fillRect(cx - 24 + i * 9, lidY + 3, 4, 4);
  c.strokeStyle = '#a16207';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(cx - 26, lidY + 12);
  c.lineTo(cx + 26, lidY + 12);
  c.stroke();
  // dipper nozzle
  rr(c, cx - 4, y0 + 4, 8, 30, 3, wood(c, cx - 4, cx + 4));
  for (let i = 0; i < 3; i++) rr(c, cx - 8, y0 + 2 + i * 6, 16, 4, 2, '#a16207');
  // drip
  const dp = (t * 0.8) % 1;
  c.fillStyle = '#f59e0b';
  c.beginPath();
  c.ellipse(cx, y0 - 2 + dp * 10 - surge * 5, 2.5, 3 + dp * 3 + surge, 0, 0, TAU);
  c.fill();
  if (surge > 0.02) {
    c.strokeStyle = `rgba(255,213,78,${surge * 0.8})`;
    c.lineWidth = 2 + surge;
    c.beginPath();
    c.moveTo(cx, y0 + 1);
    c.quadraticCurveTo(cx + surge * 9, y0 - 9, cx, y0 - 16 - surge * 7);
    c.stroke();
  }
  // bee buddy
  const bx = cx + 30 + Math.sin(t * 3) * 4 + surge * 7;
  const by = y0 + 30 + Math.cos(t * 4) * 4;
  c.fillStyle = '#facc15';
  c.beginPath();
  c.ellipse(bx, by, 5, 3.5, 0, 0, TAU);
  c.fill();
  c.fillStyle = '#111';
  c.fillRect(bx - 1, by - 3.5, 1.5, 7);
  c.fillStyle = 'rgba(255,255,255,0.7)';
  c.beginPath();
  c.ellipse(bx - 1, by - 5, 3, 2 + Math.abs(Math.sin(t * 40)), 0, 0, TAU);
  c.fill();
}
