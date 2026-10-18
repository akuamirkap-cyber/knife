import type { WeaponId } from '../weapons';
import { TAU, rand, lin, vlin, steel, chrome, brass, rr, grip, guard, glow, jag, star, radial, gunState } from './kit';
import {
  slingshot, blowgun, shotgun, soaker, snowball, SNOWBALL_MAG_SIZE, sniper, flamethrower, bamboo, banana,
  bubbleGun, harpoon, chickenGun, confettiGun, seedGun,
} from './guns2';
import { drawGunExtra2, FLASH2, FLASH3 } from './guns4';
import { discGun } from './guns6';
import { drawChronoGrip, drawPortalGrip } from './gripSystem';

type C = CanvasRenderingContext2D;

// ------------------------------------------------------------- PIZZA
function pizzaGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  grip(c, cx, y0 + 116, '#7c2d12', '#c2410c', 0.8);
  guard(c, cx, y0 + 108, '#431407');
  // box body
  rr(c, cx - 24, y0 + 46, 48, 86, 3, lin(c, cx - 24, cx + 24, ['#a16207', '#e3b779', '#c8954d', '#92400e']), '#5a3a12');
  c.strokeStyle = 'rgba(90,58,18,0.5)';
  c.lineWidth = 1;
  c.strokeRect(cx - 20, y0 + 50, 40, 78);
  c.fillStyle = '#dc2626';
  c.font = "bold 9px 'Russo One', sans-serif";
  c.textAlign = 'center';
  c.save();
  c.translate(cx, y0 + 90);
  c.rotate(-Math.PI / 2);
  c.fillText('PIZZA!', 0, 3);
  c.restore();
  c.fillStyle = '#16a34a';
  c.fillRect(cx - 20, y0 + 52, 6, 74);
  c.fillStyle = '#dc2626';
  c.fillRect(cx + 14, y0 + 52, 6, 74);
  // barrel
  rr(c, cx - 7, y0 + 14, 14, 36, 3, steel(c, cx - 7, cx + 7), '#000', 1);
  // spinning pizza
  if (ready) {
    c.save();
    c.translate(cx, y0 + 8);
    c.scale(1, 0.38);
    c.beginPath();
    c.arc(0, 0, 22, 0, TAU);
    c.fillStyle = '#d97706';
    c.fill();
    c.beginPath();
    c.arc(0, 0, 18, 0, TAU);
    c.fillStyle = '#fbbf24';
    c.fill();
    c.rotate(t * 4);
    c.strokeStyle = 'rgba(146,64,14,0.6)';
    c.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      c.rotate(Math.PI / 4);
      c.beginPath();
      c.moveTo(-18, 0);
      c.lineTo(18, 0);
      c.stroke();
    }
    c.fillStyle = '#b91c1c';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      c.beginPath();
      c.arc(Math.cos(a) * 11, Math.sin(a) * 11, 3.5, 0, TAU);
      c.fill();
    }
    c.restore();
  }
}

// ------------------------------------------------------------- MINIGUN
function minigun(c: C, cx: number, y0: number) {
  const sp = gunState.spinAngle;
  // spade grips
  for (const s of [-1, 1]) {
    c.strokeStyle = '#1f2937';
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(cx + s * 14, y0 + 196);
    c.lineTo(cx + s * 30, y0 + 222);
    c.stroke();
    rr(c, cx + s * 30 - 6, y0 + 218, 12, 22, 4, '#111');
  }
  // ammo belt
  c.save();
  for (let i = 0; i < 9; i++) {
    const bx = cx + 26 + i * 4;
    const by = y0 + 150 + i * 9 + Math.sin(i * 0.8) * 3;
    c.save();
    c.translate(bx, by);
    c.rotate(0.6);
    c.fillStyle = '#c28f22';
    c.fillRect(-2.5, -8, 5, 12);
    c.fillStyle = '#b45309';
    c.beginPath();
    c.moveTo(-2.5, -8);
    c.lineTo(0, -13);
    c.lineTo(2.5, -8);
    c.fill();
    c.fillStyle = '#374151';
    c.fillRect(-4, 2, 8, 3);
    c.restore();
  }
  c.restore();
  // motor housing
  rr(c, cx - 22, y0 + 128, 44, 70, 8, lin(c, cx - 22, cx + 22, ['#0b0c0e', '#4b5563', '#1f2937', '#0b0c0e']), '#000');
  c.fillStyle = 'rgba(0,0,0,0.5)';
  for (let i = 0; i < 5; i++) c.fillRect(cx - 16, y0 + 140 + i * 9, 32, 3);
  glow(c, cx - 12, y0 + 186, 2.5, gunState.spin > 0.3 ? '#22c55e' : '#ef4444', 8);
  // carry handle
  c.strokeStyle = '#111827';
  c.lineWidth = 5;
  c.beginPath();
  c.moveTo(cx - 22, y0 + 136);
  c.quadraticCurveTo(cx - 40, y0 + 160, cx - 22, y0 + 186);
  c.stroke();
  // rotating barrels (6) — draw back ones first
  const barrels = Array.from({ length: 6 }, (_, k) => {
    const a = sp + (k / 6) * TAU;
    return { x: Math.cos(a) * 10, z: Math.sin(a) };
  }).sort((a, b) => a.z - b.z);
  for (const b of barrels) {
    const shade = Math.round(40 + (b.z + 1) * 50);
    c.fillStyle = `rgb(${shade},${shade + 4},${shade + 10})`;
    c.fillRect(cx + b.x - 3, y0 + 2, 6, 128);
    c.fillStyle = 'rgba(255,255,255,0.15)';
    c.fillRect(cx + b.x - 1.5, y0 + 2, 1.2, 128);
  }
  for (const by of [y0 + 6, y0 + 58, y0 + 112]) rr(c, cx - 16, by, 32, 8, 3, steel(c, cx - 16, cx + 16), '#000', 1);
  if (gunState.spin > 0.5) {
    c.save();
    c.globalAlpha = (gunState.spin - 0.5) * 0.8;
    c.fillStyle = 'rgba(200,210,220,0.25)';
    c.fillRect(cx - 14, y0 + 14, 28, 96);
    c.restore();
  }
}

// ------------------------------------------------------------- RAILGUN
function railgun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 140, '#0f172a', '#1e293b', 0.8);
  guard(c, cx, y0 + 132, '#020617');
  // body
  rr(c, cx - 20, y0 + 110, 40, 48, 6, lin(c, cx - 20, cx + 20, ['#020617', '#334155', '#0f172a']), '#000');
  // capacitors
  for (let i = 0; i < 3; i++) {
    const x = cx - 15 + i * 11;
    rr(c, x - 4, y0 + 116, 8, 36, 3, '#0b1324', '#38bdf8', 1);
    const lv = 0.5 + 0.5 * Math.sin(t * 5 + i);
    c.save();
    c.shadowColor = '#38bdf8';
    c.shadowBlur = 8;
    c.fillStyle = '#7dd3fc';
    c.fillRect(x - 2, y0 + 148 - 30 * lv, 4, 30 * lv);
    c.restore();
  }
  // rails
  for (const s of [-1, 1]) {
    rr(c, cx + s * 11 - 4, y0 + 2, 8, 112, 2, lin(c, cx + s * 11 - 4, cx + s * 11 + 4, ['#111827', '#64748b', '#111827']), '#000', 1);
    c.fillStyle = '#c2410c';
    c.fillRect(cx + s * 7 - 1, y0 + 6, 2, 104);
  }
  // cross braces
  for (const by of [y0 + 24, y0 + 64, y0 + 100]) rr(c, cx - 15, by, 30, 5, 1, '#1e293b');
  // arcs
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.shadowColor = '#38bdf8';
  c.shadowBlur = 10;
  c.strokeStyle = `rgba(186,230,253,${0.6 + 0.4 * Math.sin(t * 40)})`;
  c.lineWidth = 1.4;
  for (let i = 0; i < 3; i++) {
    const yy = y0 + 14 + ((t * 120 + i * 33) % 96);
    jag(c, cx - 7, yy, cx + 7, yy + rand(-3, 3), 2, 4);
  }
  c.restore();
  glow(c, cx, y0 + 4, 3, '#e0f2fe', 14);
}

// ------------------------------------------------------------- MAGNET
function magnetGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 110, '#1f2937', '#4b5563', 0.8);
  guard(c, cx, y0 + 102);
  rr(c, cx - 16, y0 + 50, 32, 82, 6, steel(c, cx - 16, cx + 16), '#000');
  // copper coils
  c.strokeStyle = '#c2410c';
  c.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    c.beginPath();
    c.moveTo(cx - 16, y0 + 60 + i * 8);
    c.lineTo(cx + 16, y0 + 62 + i * 8);
    c.stroke();
  }
  // horseshoe magnet
  c.lineCap = 'butt';
  c.strokeStyle = lin(c, cx - 20, cx + 20, ['#7f1d1d', '#ef4444', '#991b1b']) as unknown as string;
  c.lineWidth = 12;
  c.beginPath();
  c.moveTo(cx - 14, y0 + 2);
  c.lineTo(cx - 14, y0 + 30);
  c.arc(cx, y0 + 30, 14, Math.PI, 0, true);
  c.lineTo(cx + 14, y0 + 2);
  c.stroke();
  c.fillStyle = chrome(c, cx - 20, cx - 8);
  c.fillRect(cx - 20, y0 - 2, 12, 10);
  c.fillStyle = chrome(c, cx + 8, cx + 20);
  c.fillRect(cx + 8, y0 - 2, 12, 10);
  c.fillStyle = '#fff';
  c.font = 'bold 7px sans-serif';
  c.textAlign = 'center';
  c.fillText('N', cx - 14, y0 + 6);
  c.fillText('S', cx + 14, y0 + 6);
  // field lines
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const k = ((t * 0.8 + i / 3) % 1);
    c.strokeStyle = `rgba(255,120,120,${0.6 * (1 - k)})`;
    c.lineWidth = 1.5;
    c.beginPath();
    c.ellipse(cx, y0 - 2, 14 + k * 10, 6 + k * 14, 0, Math.PI, TAU);
    c.stroke();
  }
  c.restore();
}

// ------------------------------------------------------------- SHRINK / GROW RAY
function rayGun(c: C, cx: number, y0: number, t: number, growMode: boolean) {
  const col = growMode ? ['#9a3412', '#fdba74', '#f97316', '#7c2d12'] : ['#14532d', '#86efac', '#22c55e', '#052e16'];
  const glowC = growMode ? '#fb923c' : '#4ade80';
  grip(c, cx, y0 + 108, '#e5e7eb', '#9ca3af', 0.78);
  guard(c, cx, y0 + 100, '#374151');
  // fins
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 14, y0 + 90);
    c.lineTo(cx + s * 30, y0 + 120);
    c.lineTo(cx + s * 14, y0 + 118);
    c.closePath();
    c.fillStyle = col[2];
    c.fill();
    c.strokeStyle = col[3];
    c.lineWidth = 1.5;
    c.stroke();
  }
  // body (bulb)
  c.beginPath();
  c.ellipse(cx, y0 + 98, 18, 30, 0, 0, TAU);
  c.fillStyle = chrome(c, cx - 18, cx + 18);
  c.fill();
  c.strokeStyle = '#374151';
  c.lineWidth = 2;
  c.stroke();
  // glass dome
  c.beginPath();
  c.arc(cx, y0 + 96, 9, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 96, 9, ['#ffffff', glowC, col[3]]);
  c.fill();
  glow(c, cx, y0 + 96, 3 + Math.sin(t * 6), '#ffffff', 10);
  // barrel
  rr(c, cx - 5, y0 + 10, 10, 64, 3, chrome(c, cx - 5, cx + 5), '#374151', 1);
  // rings (shrink: big->small toward tip; grow: small->big)
  for (let i = 0; i < 4; i++) {
    const k = growMode ? 0.5 + i * 0.22 : 1.2 - i * 0.22;
    const ry = y0 + 62 - i * 15;
    const wv = 1 + 0.08 * Math.sin(t * 8 - i);
    c.beginPath();
    c.ellipse(cx, ry, 14 * k * wv, 4 * k, 0, 0, TAU);
    c.fillStyle = lin(c, cx - 14 * k, cx + 14 * k, col);
    c.fill();
    c.strokeStyle = col[3];
    c.lineWidth = 1;
    c.stroke();
  }
  glow(c, cx, y0 + 4, growMode ? 6 : 3, glowC, 14);
}

// ------------------------------------------------------------- PIRATE CANNON
function pirate(c: C, cx: number, y0: number, t: number) {
  // wooden stock
  c.beginPath();
  c.moveTo(cx - 12, y0 + 120);
  c.lineTo(cx + 12, y0 + 120);
  c.lineTo(cx + 40, y0 + 196);
  c.lineTo(cx + 16, y0 + 204);
  c.closePath();
  c.fillStyle = lin(c, cx - 12, cx + 40, ['#3b1d0a', '#7c4a1e', '#3b1d0a']);
  c.fill();
  c.strokeStyle = '#1c0a00';
  c.lineWidth = 2;
  c.stroke();
  // fuse
  c.strokeStyle = '#78716c';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(cx - 10, y0 + 120);
  c.quadraticCurveTo(cx - 26, y0 + 126, cx - 24, y0 + 140);
  c.stroke();
  const f = 0.7 + 0.3 * Math.sin(t * 30);
  glow(c, cx - 24, y0 + 141, 2.5 * f + 1, '#fbbf24', 12);
  for (let i = 0; i < 3; i++) {
    c.fillStyle = `rgba(255,200,80,${rand(0.3, 1)})`;
    c.fillRect(cx - 24 + rand(-6, 6), y0 + 141 + rand(-6, 6), 1.5, 1.5);
  }
  // barrel (tapered iron)
  c.beginPath();
  c.moveTo(cx - 15, y0 + 8);
  c.lineTo(cx + 15, y0 + 8);
  c.lineTo(cx + 19, y0 + 126);
  c.quadraticCurveTo(cx, y0 + 140, cx - 19, y0 + 126);
  c.closePath();
  c.fillStyle = lin(c, cx - 19, cx + 19, ['#0a0a0a', '#4b5563', '#1f2937', '#000']);
  c.fill();
  c.strokeStyle = '#000';
  c.lineWidth = 1.5;
  c.stroke();
  for (const by of [y0 + 30, y0 + 80, y0 + 112]) rr(c, cx - 19, by, 38, 7, 3, lin(c, cx - 19, cx + 19, ['#111', '#6b7280', '#111']));
  // skull emblem
  c.fillStyle = '#e5e7eb';
  c.beginPath();
  c.arc(cx, y0 + 58, 6, 0, TAU);
  c.fill();
  c.fillRect(cx - 3.5, y0 + 62, 7, 4);
  c.fillStyle = '#111';
  c.beginPath();
  c.arc(cx - 2.2, y0 + 58, 1.6, 0, TAU);
  c.arc(cx + 2.2, y0 + 58, 1.6, 0, TAU);
  c.fill();
  c.strokeStyle = '#e5e7eb';
  c.lineWidth = 1.8;
  c.beginPath();
  c.moveTo(cx - 9, y0 + 66);
  c.lineTo(cx + 9, y0 + 74);
  c.moveTo(cx + 9, y0 + 66);
  c.lineTo(cx - 9, y0 + 74);
  c.stroke();
  // flared muzzle
  c.beginPath();
  c.moveTo(cx - 20, y0);
  c.lineTo(cx + 20, y0);
  c.lineTo(cx + 15, y0 + 12);
  c.lineTo(cx - 15, y0 + 12);
  c.closePath();
  c.fillStyle = lin(c, cx - 20, cx + 20, ['#000', '#6b7280', '#000']);
  c.fill();
  c.beginPath();
  c.ellipse(cx, y0, 16, 4, 0, 0, TAU);
  c.fillStyle = '#000';
  c.fill();
}

// ------------------------------------------------------------- CARD GUN
function cardGun(c: C, cx: number, y0: number, ready: boolean) {
  grip(c, cx, y0 + 102, '#111', '#3f3f46', 0.78);
  guard(c, cx, y0 + 94, '#000');
  // deck magazine
  rr(c, cx + 16, y0 + 60, 18, 40, 2, '#fafafa', '#a1a1aa', 1);
  for (let i = 0; i < 6; i++) {
    c.fillStyle = i % 2 ? '#e4e4e7' : '#fafafa';
    c.fillRect(cx + 16, y0 + 62 + i * 6, 18, 2);
  }
  // body
  c.beginPath();
  c.roundRect(cx - 16, y0 + 18, 32, 106, [4, 4, 8, 8]);
  c.fillStyle = lin(c, cx - 16, cx + 16, ['#000', '#3f3f46', '#18181b']);
  c.fill();
  c.strokeStyle = '#dc2626';
  c.lineWidth = 2;
  c.stroke();
  // gold trim + suits
  c.strokeStyle = '#eab308';
  c.lineWidth = 1;
  c.strokeRect(cx - 12, y0 + 24, 24, 94);
  c.font = 'bold 12px serif';
  c.textAlign = 'center';
  c.fillStyle = '#dc2626';
  c.fillText('♥', cx, y0 + 46);
  c.fillText('♦', cx, y0 + 96);
  c.fillStyle = '#e5e7eb';
  c.fillText('♠', cx, y0 + 71);
  c.fillText('♣', cx, y0 + 118);
  // slot
  rr(c, cx - 10, y0 + 12, 20, 6, 1, '#000');
  if (ready) {
    rr(c, cx - 9, y0 - 6, 18, 22, 2, '#ffffff', '#a1a1aa', 1);
    c.fillStyle = '#dc2626';
    c.font = 'bold 9px serif';
    c.fillText('A♥', cx, y0 + 7);
  }
}

// ------------------------------------------------------------- SONIC BLASTER
function sonic(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 112, '#1c1917', '#44403c', 0.8);
  guard(c, cx, y0 + 104);
  rr(c, cx - 16, y0 + 44, 32, 88, 6, lin(c, cx - 16, cx + 16, ['#0c0a09', '#44403c', '#1c1917']), '#000');
  // equalizer
  for (let i = 0; i < 5; i++) {
    const h = 6 + Math.abs(Math.sin(t * 9 + i * 1.3)) * 28;
    for (let j = 0; j < h / 4; j++) {
      c.fillStyle = j > 6 ? '#ef4444' : j > 4 ? '#facc15' : '#a3e635';
      c.fillRect(cx - 12 + i * 5, y0 + 124 - j * 4, 4, 3);
    }
  }
  // horn
  c.beginPath();
  c.moveTo(cx - 8, y0 + 46);
  c.lineTo(cx - 26, y0 + 4);
  c.lineTo(cx + 26, y0 + 4);
  c.lineTo(cx + 8, y0 + 46);
  c.closePath();
  c.fillStyle = lin(c, cx - 26, cx + 26, ['#1c1917', '#78716c', '#292524']);
  c.fill();
  c.strokeStyle = '#000';
  c.lineWidth = 2;
  c.stroke();
  // speaker cone
  const pump = 1 + 0.08 * Math.sin(t * 20);
  c.beginPath();
  c.ellipse(cx, y0 + 4, 26, 7, 0, 0, TAU);
  c.fillStyle = '#0c0a09';
  c.fill();
  c.beginPath();
  c.ellipse(cx, y0 + 4, 18 * pump, 5 * pump, 0, 0, TAU);
  c.fillStyle = '#292524';
  c.fill();
  c.strokeStyle = '#a3e635';
  c.lineWidth = 1.5;
  c.stroke();
  c.beginPath();
  c.ellipse(cx, y0 + 4, 6 * pump, 2 * pump, 0, 0, TAU);
  c.fillStyle = '#a3e635';
  c.fill();
  // waves
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) {
    const k = (t * 1.5 + i / 3) % 1;
    c.strokeStyle = `rgba(190,255,120,${0.7 * (1 - k)})`;
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(cx, y0 - k * 26, 22 + k * 10, 6 + k * 3, 0, Math.PI, TAU);
    c.stroke();
  }
  c.restore();
}

// ------------------------------------------------------------- MIRROR GUN
function mirrorGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 108, '#cbd5e1', '#64748b', 0.78);
  guard(c, cx, y0 + 100, '#334155');
  // crystal facets body
  const pts: [number, number][] = [[cx, y0 + 20], [cx + 18, y0 + 48], [cx + 16, y0 + 128], [cx - 16, y0 + 128], [cx - 18, y0 + 48]];
  c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fillStyle = lin(c, cx - 18, cx + 18, ['#94a3b8', '#f8fafc', '#cbd5e1', '#e2e8f0', '#64748b']);
  c.fill();
  c.strokeStyle = '#334155';
  c.lineWidth = 2;
  c.stroke();
  c.strokeStyle = 'rgba(51,65,85,0.5)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(cx, y0 + 20);
  c.lineTo(cx - 4, y0 + 128);
  c.moveTo(cx - 18, y0 + 48);
  c.lineTo(cx + 6, y0 + 80);
  c.lineTo(cx + 16, y0 + 128);
  c.moveTo(cx + 18, y0 + 48);
  c.lineTo(cx - 8, y0 + 96);
  c.stroke();
  // moving glare
  c.save();
  c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.clip();
  const gy = y0 + 20 + ((t * 60) % 140);
  c.fillStyle = 'rgba(255,255,255,0.7)';
  c.beginPath();
  c.moveTo(cx - 20, gy);
  c.lineTo(cx + 20, gy - 20);
  c.lineTo(cx + 20, gy - 12);
  c.lineTo(cx - 20, gy + 8);
  c.fill();
  c.restore();
  // prism tip
  c.beginPath();
  c.moveTo(cx, y0 - 4);
  c.lineTo(cx + 9, y0 + 22);
  c.lineTo(cx - 9, y0 + 22);
  c.closePath();
  const pg = c.createLinearGradient(cx - 9, 0, cx + 9, 0);
  ['#f87171', '#facc15', '#4ade80', '#60a5fa', '#c084fc'].forEach((s, i) => pg.addColorStop(i / 4, s));
  c.fillStyle = pg;
  c.globalAlpha = 0.85;
  c.fill();
  c.globalAlpha = 1;
  c.strokeStyle = '#fff';
  c.lineWidth = 1;
  c.stroke();
  for (let i = 0; i < 3; i++) {
    const a = Math.sin(t * 3 + i * 2);
    if (a > 0.3) star(c, cx + [-12, 10, 2][i], y0 + [50, 90, 116][i], 4 * a, '#ffffff', 4);
  }
}

// ------------------------------------------------------------- PORTAL GUN
function portalGun(c: C, cx: number, y0: number, t: number) {
  const blue = Math.floor(t * 0.7) % 2 === 0;
  const pc = blue ? '#3b82f6' : '#fb923c';
  drawPortalGrip(c, cx, y0 + 98, pc);
  guard(c, cx, y0 + 100, '#1f2937');
  // body white glossy
  c.beginPath();
  c.roundRect(cx - 20, y0 + 40, 40, 90, [16, 16, 10, 10]);
  c.fillStyle = lin(c, cx - 20, cx + 20, ['#cbd5e1', '#ffffff', '#e2e8f0', '#94a3b8']);
  c.fill();
  c.strokeStyle = '#334155';
  c.lineWidth = 2;
  c.stroke();
  rr(c, cx - 20, y0 + 96, 40, 34, [0, 0, 10, 10], '#1f2937');
  // core tube
  rr(c, cx - 7, y0 + 50, 14, 50, 7, '#0b1020', '#475569', 1);
  c.save();
  c.shadowColor = pc;
  c.shadowBlur = 14;
  c.fillStyle = pc;
  c.beginPath();
  c.roundRect(cx - 4, y0 + 54, 8, 42, 4);
  c.fill();
  c.restore();
  c.fillStyle = 'rgba(255,255,255,0.6)';
  c.fillRect(cx - 2, y0 + 56, 1.5, 38);
  // prongs
  for (const a of [-0.5, 0, 0.5]) {
    c.save();
    c.translate(cx, y0 + 34);
    c.rotate(a);
    rr(c, -3, -30, 6, 30, 3, '#111827');
    c.restore();
  }
  // orb
  glow(c, cx, y0 + 8, 7 + Math.sin(t * 6), pc, 18);
  c.beginPath();
  c.arc(cx, y0 + 8, 4, 0, TAU);
  c.fillStyle = '#fff';
  c.fill();
  c.strokeStyle = pc;
  c.lineWidth = 1.5;
  c.beginPath();
  c.ellipse(cx, y0 + 8, 12, 4, t * 2, 0, TAU);
  c.stroke();
}

// ------------------------------------------------------------- CHRONO
function chronoGun(c: C, cx: number, y0: number, t: number) {
  drawChronoGrip(c, cx, y0 + 102);
  guard(c, cx, y0 + 104, '#451a03');
  rr(c, cx - 16, y0 + 40, 32, 92, 6, brass(c, cx - 16, cx + 16), '#451a03');
  // gears
  const gear = (x: number, y: number, r: number, rot: number, teeth: number) => {
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.beginPath();
    for (let i = 0; i < teeth * 2; i++) {
      const rr2 = i % 2 === 0 ? r : r * 0.78;
      const a = (i / (teeth * 2)) * TAU;
      c.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2);
    }
    c.closePath();
    c.fillStyle = brass(c, -r, r);
    c.fill();
    c.strokeStyle = '#451a03';
    c.lineWidth = 1;
    c.stroke();
    c.beginPath();
    c.arc(0, 0, r * 0.3, 0, TAU);
    c.fillStyle = '#451a03';
    c.fill();
    c.restore();
  };
  gear(cx - 20, y0 + 116, 11, t * 1.2, 10);
  gear(cx - 26, y0 + 98, 7, -t * 1.9, 7);
  // clock dial
  c.beginPath();
  c.arc(cx, y0 + 76, 13, 0, TAU);
  c.fillStyle = '#fefce8';
  c.fill();
  c.strokeStyle = '#a16207';
  c.lineWidth = 2.5;
  c.stroke();
  c.strokeStyle = '#451a03';
  c.lineWidth = 1;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * 10, y0 + 76 + Math.sin(a) * 10);
    c.lineTo(cx + Math.cos(a) * 12, y0 + 76 + Math.sin(a) * 12);
    c.stroke();
  }
  const sec = Math.floor(t * 2) / 2;
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx, y0 + 76);
  c.lineTo(cx + Math.cos(sec * 1.05 - Math.PI / 2) * 10, y0 + 76 + Math.sin(sec * 1.05 - Math.PI / 2) * 10);
  c.strokeStyle = '#b91c1c';
  c.stroke();
  c.beginPath();
  c.moveTo(cx, y0 + 76);
  c.lineTo(cx + Math.cos(t * 0.1) * 6, y0 + 76 + Math.sin(t * 0.1) * 6);
  c.strokeStyle = '#111';
  c.lineWidth = 2;
  c.stroke();
  // hourglass tube
  rr(c, cx - 6, y0 + 14, 12, 28, 4, 'rgba(254,249,195,0.5)', '#a16207', 1.5);
  c.fillStyle = '#facc15';
  const sand = (t * 0.3) % 1;
  c.beginPath();
  c.moveTo(cx - 4, y0 + 18);
  c.lineTo(cx + 4, y0 + 18);
  c.lineTo(cx, y0 + 18 + 10 * (1 - sand));
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(cx - 4, y0 + 40);
  c.lineTo(cx + 4, y0 + 40);
  c.lineTo(cx, y0 + 40 - 10 * sand);
  c.closePath();
  c.fill();
  // emitter
  rr(c, cx - 8, y0 - 2, 16, 16, 4, brass(c, cx - 8, cx + 8), '#451a03');
  glow(c, cx, y0 + 4, 3, '#fde047', 14);
}

// ------------------------------------------------------------- GLITCH GUN (pixel art)
function glitchGun(c: C, cx: number, y0: number, t: number) {
  const P = 6;
  const map = [
    '..##..',
    '..##..',
    '.####.',
    '.####.',
    '.#@@#.',
    '.#@@#.',
    '.####.',
    '.####.',
    '.#######',
    '.########',
    '.####..###',
    '.####...###',
    '.####....###',
    '..........##',
  ];
  const glitchOn = Math.sin(t * 13) > 0.7 || Math.sin(t * 7.3) > 0.92;
  const drawMap = (ox: number, col: string, colB: string) => {
    for (let r = 0; r < map.length; r++) {
      for (let k = 0; k < map[r].length; k++) {
        const ch = map[r][k];
        if (ch === '.') continue;
        c.fillStyle = ch === '@' ? colB : col;
        c.fillRect(cx - 3 * P + k * P + ox, y0 + r * P * 1.6, P, P * 1.6);
      }
    }
  };
  if (glitchOn) {
    c.save();
    c.globalCompositeOperation = 'lighter';
    drawMap(-3, 'rgba(255,0,85,0.7)', 'rgba(255,0,85,0.7)');
    drawMap(3, 'rgba(0,255,238,0.7)', 'rgba(0,255,238,0.7)');
    c.restore();
  }
  drawMap(0, '#16a34a', '#22ff88');
  // pixel outline highlight
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.fillRect(cx - 2 * P + 1, y0 + 2, 2, P * 1.6 * 8);
  if (glitchOn) {
    c.fillStyle = 'rgba(0,255,140,0.5)';
    c.fillRect(cx - 30, y0 + rand(0, 100), 60, 3);
  }
  glow(c, cx, y0 + 2, 3, '#22ff88', 10);
}

// ------------------------------------------------------------- DRAGON BREATH
export function dragonFlameSurge(sinceShot: number): number {
  return sinceShot >= 0 && sinceShot < 0.22
    ? Math.sin(Math.PI * sinceShot / 0.22) : 0;
}

function dragon(c: C, cx: number, y0: number, t: number) {
  // A living dragon wraps the barrel; its tail forms the grip and its mouth
  // sits right on the muzzle. Wings have articulated ribs and scalloped skin.
  const blast = dragonFlameSurge(gunState.sinceShot);
  c.lineCap = 'round';
  c.strokeStyle = '#40141c'; c.lineWidth = 11;
  c.beginPath(); c.moveTo(cx + 8, y0 + 112);
  c.bezierCurveTo(cx + 30, y0 + 135, cx + 34, y0 + 153, cx + 12, y0 + 167); c.stroke();
  c.strokeStyle = '#d95b32'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(cx + 17, y0 + 126);
  c.bezierCurveTo(cx + 31, y0 + 144, cx + 26, y0 + 157, cx + 13, y0 + 165); c.stroke();
  c.fillStyle = '#eaa363'; c.beginPath();
  c.moveTo(cx + 12, y0 + 167); c.lineTo(cx + 3, y0 + 172);
  c.lineTo(cx + 15, y0 + 157); c.closePath(); c.fill();

  for (const side of [-1, 1]) {
    c.save(); c.translate(cx + side * 12, y0 + 68); c.scale(side, 1);
    c.rotate(Math.sin(t * 3.2) * 0.055);
    c.beginPath(); c.moveTo(0, 14);
    c.quadraticCurveTo(20, -27, 60, -41);
    c.lineTo(51, -4);
    c.quadraticCurveTo(69, 12, 62, 43);
    c.quadraticCurveTo(48, 32, 39, 54);
    c.quadraticCurveTo(27, 38, 17, 52);
    c.quadraticCurveTo(9, 29, 0, 14); c.closePath();
    const membrane = c.createLinearGradient(8, -42, 54, 54);
    membrane.addColorStop(0, '#ef7a4e');
    membrane.addColorStop(0.36, '#ad2d32');
    membrane.addColorStop(1, '#431536');
    c.fillStyle = membrane; c.fill();
    c.strokeStyle = '#38101d'; c.lineWidth = 3; c.stroke();
    c.strokeStyle = 'rgba(255,192,112,0.75)'; c.lineWidth = 2;
    for (const [xx, yy] of [[60, -41], [51, -4], [62, 43], [39, 54], [17, 52]]) {
      c.beginPath(); c.moveTo(1, 14);
      c.quadraticCurveTo(xx * 0.4, yy * 0.36, xx, yy); c.stroke();
    }
    // Small illuminated scales between the wing bones catch the firelight.
    c.fillStyle = 'rgba(255,185,113,0.39)';
    for (const [xx, yy] of [[22, -1], [38, -13], [29, 22], [46, 17], [50, 36]]) {
      c.beginPath(); c.moveTo(xx - 4, yy);
      c.quadraticCurveTo(xx + 1, yy - 6, xx + 5, yy);
      c.quadraticCurveTo(xx + 1, yy + 3, xx - 4, yy); c.fill();
    }
    c.fillStyle = '#eeb67a';
    for (const [xx, yy] of [[60, -41], [62, 43]]) {
      c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + 5, yy - 4);
      c.lineTo(xx - 4, yy + 6); c.closePath(); c.fill();
    }
    c.restore();
  }

  rr(c, cx - 16, y0 + 52, 32, 106, 13,
    lin(c, cx - 17, cx + 17, ['#471224', '#c53c37', '#94242e', '#351021']), '#3b1018', 2.5);
  // Layered, pointed scales and a bright segmented underbelly.
  for (let row = 0; row < 8; row++) {
    const yy = y0 + 61 + row * 12;
    c.fillStyle = row % 2 ? '#e8754c' : '#db5a37';
    c.beginPath(); c.moveTo(cx - 10, yy);
    c.quadraticCurveTo(cx, yy + 2, cx + 10, yy);
    c.lineTo(cx + 7, yy + 8); c.quadraticCurveTo(cx, yy + 13, cx - 7, yy + 8);
    c.closePath(); c.fill();
    c.strokeStyle = '#85302c'; c.lineWidth = 0.9; c.stroke();
    for (const side of [-1, 1]) {
      c.fillStyle = '#71202b'; c.beginPath();
      c.moveTo(cx + side * 12, yy - 1);
      c.lineTo(cx + side * 19, yy + 3);
      c.lineTo(cx + side * 12, yy + 8); c.closePath(); c.fill();
    }
  }
  // Crest spines connect the neck to the armored crown.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      c.fillStyle = '#e9a673'; c.beginPath();
      c.moveTo(cx + side * 13, y0 + 50 + i * 15);
      c.lineTo(cx + side * (20 + (2 - i) * 2), y0 + 42 + i * 15);
      c.lineTo(cx + side * 15, y0 + 57 + i * 15); c.closePath(); c.fill();
    }
  }

  c.save(); c.translate(cx, y0 + 24);
  // A separate lower jaw keeps the blazing mouth visibly open.
  c.beginPath(); c.moveTo(-11, 2); c.quadraticCurveTo(0, 10, 11, 2);
  c.lineTo(7, 23); c.quadraticCurveTo(0, 29, -7, 23); c.closePath();
  c.fillStyle = '#792333'; c.fill(); c.strokeStyle = '#350e19'; c.lineWidth = 2; c.stroke();
  c.save(); c.shadowColor = '#ff9e36'; c.shadowBlur = 15;
  c.fillStyle = radial(c, 0, -3, 16, ['#fffce0', '#ffc352', '#ee5b24', '#6d1722']);
  c.beginPath(); c.ellipse(0, -3, 7, 12, 0, 0, TAU); c.fill(); c.restore();
  for (const side of [-1, 1]) {
    c.fillStyle = '#ffdab0'; c.beginPath();
    c.moveTo(side * 5, 0); c.lineTo(side * 3, 9); c.lineTo(side * 8, 3);
    c.closePath(); c.fill();
  }
  c.beginPath();
  c.moveTo(-15, 6); c.lineTo(-12, -14); c.lineTo(-8, -20);
  c.lineTo(-5, -17); c.lineTo(0, -25); c.lineTo(5, -17);
  c.lineTo(8, -20); c.lineTo(12, -14); c.lineTo(15, 6);
  c.quadraticCurveTo(0, 12, -15, 6); c.closePath();
  c.fillStyle = lin(c, -16, 16, ['#742036', '#ee6d49', '#b73335', '#64152a']);
  c.fill(); c.strokeStyle = '#390d19'; c.lineWidth = 2; c.stroke();
  for (const side of [-1, 1]) {
    c.fillStyle = '#f2c391'; c.beginPath();
    c.moveTo(side * 8, -17); c.quadraticCurveTo(side * 22, -21, side * 25, -35);
    c.quadraticCurveTo(side * 19, -28, side * 12, -27); c.closePath(); c.fill();
    c.fillStyle = '#fceca8'; c.beginPath();
    c.ellipse(side * 8, -6, 3.1, 1.9, side * 0.22, 0, TAU); c.fill();
    c.fillStyle = '#3c1519'; c.beginPath(); c.arc(side * 8, -6, 1, 0, TAU); c.fill();
    c.fillStyle = '#45111b'; c.beginPath(); c.arc(side * 3.2, -18, 1.2, 0, TAU); c.fill();
  }
  // Raised snout, nostrils and cheek ridges give the head a reptilian face
  // rather than a flat rectangular red mask; the open lower jaw stays visible.
  c.fillStyle = lin(c, -12, 12, ['#7e2330', '#ed8055', '#be3837', '#71202b']);
  c.beginPath(); c.moveTo(-10, -2);
  c.quadraticCurveTo(0, -5, 10, -2);
  c.lineTo(7, 8); c.quadraticCurveTo(0, 13, -7, 8); c.closePath(); c.fill();
  c.strokeStyle = '#5a1728'; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = '#45141f';
  for (const side of [-1, 1]) {
    c.beginPath(); c.ellipse(side * 4.5, 5, 1.4, 2, side * 0.23, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,210,142,0.88)'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(side * 11, -3);
    c.quadraticCurveTo(side * 13, 2, side * 7, 8); c.stroke();
  }
  c.restore();
  // Fire breath surges BEYOND the horns after firing, then settles back to a
  // short living tongue. It follows shot time, never changes hitboxes/ammo.
  const flicker = Math.sin(t * 17) * 3;
  c.save(); c.shadowColor = '#f97316'; c.shadowBlur = 14 + blast * 13;
  c.fillStyle = '#df4529'; c.beginPath(); c.moveTo(cx - 7, y0 + 4);
  c.quadraticCurveTo(cx - 17 - blast * 14, y0 - 8,
    cx + flicker * 0.5, y0 - 19 - blast * 47);
  c.quadraticCurveTo(cx + 16 + blast * 14, y0 - 6, cx + 7, y0 + 4);
  c.closePath(); c.fill();
  c.fillStyle = '#ffae39'; c.beginPath(); c.moveTo(cx - 5, y0 + 3);
  c.quadraticCurveTo(cx - 10 - blast * 7, y0 - 6,
    cx + flicker * 0.4, y0 - 16 - blast * 33);
  c.quadraticCurveTo(cx + 11 + blast * 7, y0 - 5, cx + 5, y0 + 3);
  c.closePath(); c.fill();
  c.fillStyle = '#fff3bf'; c.beginPath(); c.moveTo(cx - 2.5, y0 + 2);
  c.quadraticCurveTo(cx - 3 - blast * 3, y0 - 3,
    cx + flicker * 0.2, y0 - 10 - blast * 19);
  c.quadraticCurveTo(cx + 4 + blast * 3, y0 - 3, cx + 2.5, y0 + 2);
  c.closePath(); c.fill(); c.restore();
}

// ------------------------------------------------------------- GRAVITY
function gravityGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 112, '#1e1b4b', '#3730a3', 0.8);
  guard(c, cx, y0 + 104, '#0f0a2e');
  rr(c, cx - 18, y0 + 44, 36, 88, 8, lin(c, cx - 18, cx + 18, ['#0f0a2e', '#3730a3', '#1e1b4b', '#0f0a2e']), '#000');
  // starfield panel
  c.save();
  c.beginPath();
  c.roundRect(cx - 12, y0 + 52, 24, 70, 6);
  c.clip();
  c.fillStyle = '#05031a';
  c.fillRect(cx - 12, y0 + 52, 24, 70);
  for (let i = 0; i < 14; i++) {
    const sy = y0 + 52 + ((i * 17 + t * 12) % 70);
    c.fillStyle = `rgba(255,255,255,${0.4 + (i % 3) * 0.2})`;
    c.fillRect(cx - 11 + ((i * 7) % 22), sy, 1.2, 1.2);
  }
  c.restore();
  // arms
  for (const s of [-1, 1]) {
    c.strokeStyle = '#312e81';
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(cx + s * 14, y0 + 46);
    c.quadraticCurveTo(cx + s * 22, y0 + 26, cx + s * 12, y0 + 16);
    c.stroke();
  }
  // planet
  c.beginPath();
  c.arc(cx, y0 + 14, 10, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 14, 10, ['#c7d2fe', '#6366f1', '#1e1b4b']);
  c.fill();
  // ring
  c.save();
  c.translate(cx, y0 + 14);
  c.rotate(-0.3);
  c.strokeStyle = 'rgba(199,210,254,0.85)';
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(0, 0, 18, 5, 0, 0, Math.PI);
  c.stroke();
  c.restore();
  // moon orbit
  const ma = t * 3;
  const mx = cx + Math.cos(ma) * 20;
  const my = y0 + 14 + Math.sin(ma) * 7;
  glow(c, mx, my, 2.5, '#e0e7ff', 8);
}

// ================================================================ dispatch
export function drawGunExtra(c: C, id: WeaponId, cx: number, y0: number, t: number, ready: boolean, snowLoaded = SNOWBALL_MAG_SIZE) {
  switch (id) {
    case 'slingshot': slingshot(c, cx, y0, t, ready); break;
    case 'blowgun': blowgun(c, cx, y0, t); break;
    case 'shotgun': shotgun(c, cx, y0, t, ready); break;
    case 'soaker': soaker(c, cx, y0, t); break;
    case 'snowball': snowball(c, cx, y0, t, snowLoaded); break;
    case 'sniper': sniper(c, cx, y0); break;
    case 'flamethrower': flamethrower(c, cx, y0, t); break;
    case 'disc': discGun(c, cx, y0, t, ready); break;
    case 'bamboo': bamboo(c, cx, y0, t); break;
    case 'banana': banana(c, cx, y0, t); break;
    case 'bubble': bubbleGun(c, cx, y0, t); break;
    case 'harpoon': harpoon(c, cx, y0, ready); break;
    case 'chicken': chickenGun(c, cx, y0, t, ready); break;
    case 'confetti': confettiGun(c, cx, y0, t); break;
    case 'seed': seedGun(c, cx, y0, t); break;
    case 'pizza': pizzaGun(c, cx, y0, t, ready); break;
    case 'minigun': minigun(c, cx, y0); break;
    case 'railgun': railgun(c, cx, y0, t); break;
    case 'magnet': magnetGun(c, cx, y0, t); break;
    case 'shrink': rayGun(c, cx, y0, t, false); break;
    case 'grow': rayGun(c, cx, y0, t, true); break;
    case 'pirate': pirate(c, cx, y0, t); break;
    case 'card': cardGun(c, cx, y0, ready); break;
    case 'sonic': sonic(c, cx, y0, t); break;
    case 'mirror': mirrorGun(c, cx, y0, t); break;
    case 'portal': portalGun(c, cx, y0, t); break;
    case 'chrono': chronoGun(c, cx, y0, t); break;
    case 'glitch': glitchGun(c, cx, y0, t); break;
    case 'dragon': dragon(c, cx, y0, t); break;
    case 'gravity': gravityGun(c, cx, y0, t); break;
    default: drawGunExtra2(c, id, cx, y0, t, ready); break;
  }
}

// ================================================================ flashes
type Flash = { k: 'fire'; s: number } | { k: 'energy'; rgb: string; r: number } | { k: 'puff'; col: string; n: number } | { k: 'none' };
const FLASH: Partial<Record<WeaponId, Flash>> = {
  shotgun: { k: 'fire', s: 1.6 }, sniper: { k: 'fire', s: 1.5 }, minigun: { k: 'fire', s: 0.9 }, pirate: { k: 'fire', s: 1.8 },
  bamboo: { k: 'fire', s: 1.7 }, flamethrower: { k: 'fire', s: 1.1 }, dragon: { k: 'fire', s: 1.4 },
  railgun: { k: 'energy', rgb: '56,189,248', r: 50 }, portal: { k: 'energy', rgb: '251,146,60', r: 44 },
  magnet: { k: 'energy', rgb: '239,68,68', r: 36 }, shrink: { k: 'energy', rgb: '74,222,128', r: 36 },
  grow: { k: 'energy', rgb: '251,146,60', r: 50 }, sonic: { k: 'energy', rgb: '163,230,53', r: 46 },
  mirror: { k: 'energy', rgb: '226,232,240', r: 36 }, chrono: { k: 'energy', rgb: '250,204,21', r: 40 },
  glitch: { k: 'energy', rgb: '34,255,136', r: 40 }, gravity: { k: 'energy', rgb: '129,140,248', r: 46 },
  soaker: { k: 'puff', col: 'rgba(147,197,253,', n: 10 }, bubble: { k: 'puff', col: 'rgba(250,200,240,', n: 8 },
  snowball: { k: 'puff', col: 'rgba(255,255,255,', n: 12 }, confetti: { k: 'puff', col: 'rgba(255,180,220,', n: 6 },
  seed: { k: 'puff', col: 'rgba(160,230,120,', n: 5 }, chicken: { k: 'puff', col: 'rgba(255,250,200,', n: 6 },
  pizza: { k: 'puff', col: 'rgba(255,220,160,', n: 6 }, blowgun: { k: 'puff', col: 'rgba(230,255,210,', n: 4 },
};

export function drawFlashExtra(c: C, id: WeaponId, t: number, a: number) {
  const f: Flash = FLASH[id] ?? FLASH2[id] ?? FLASH3[id] ?? { k: 'none' };
  if (f.k === 'none') return;
  c.globalCompositeOperation = f.k === 'puff' ? 'source-over' : 'lighter';
  if (f.k === 'fire') {
    const big = f.s;
    const fg = c.createRadialGradient(0, 0, 2, 0, 0, 46 * big);
    fg.addColorStop(0, `rgba(255,255,220,${a})`);
    fg.addColorStop(0.3, `rgba(255,200,60,${a * 0.9})`);
    fg.addColorStop(1, 'rgba(255,90,0,0)');
    c.fillStyle = fg;
    c.beginPath();
    for (let i = 0; i <= 18; i++) {
      const ang = (i / 18) * TAU + t * 10;
      const r = (i % 2 === 0 ? rand(30, 50) : rand(8, 14)) * big;
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r * 1.2 - 10 * big;
      if (i === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.fill();
  } else if (f.k === 'energy') {
    const fg = c.createRadialGradient(0, 0, 2, 0, 0, f.r);
    fg.addColorStop(0, `rgba(255,255,255,${a})`);
    fg.addColorStop(0.35, `rgba(${f.rgb},${a * 0.85})`);
    fg.addColorStop(1, `rgba(${f.rgb},0)`);
    c.fillStyle = fg;
    c.beginPath();
    c.arc(0, -4, f.r, 0, TAU);
    c.fill();
    c.strokeStyle = `rgba(${f.rgb},${a})`;
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(0, -4, f.r * 0.6 * (1.4 - a), f.r * 0.18 * (1.4 - a), 0, 0, TAU);
    c.stroke();
  } else {
    for (let i = 0; i < f.n; i++) {
      c.fillStyle = `${f.col}${a * 0.8})`;
      c.beginPath();
      c.arc(rand(-16, 16), rand(-26, 0), rand(2, 6) * (1.5 - a), 0, TAU);
      c.fill();
    }
  }
  void vlin;
}
