import type { WeaponId } from '../weapons';
import { TAU, rand, lin, steel, chrome, brass, wood, rr, grip, guard, glow, jag, star, radial, gunState } from './kit';
import { bit8Gun, coinGun, kunaiGun, starWarsBlaster } from './guns6';
import { drawGunExtra4, FLASH4 } from './guns7';

type C = CanvasRenderingContext2D;

function gem(c: C, x: number, y: number, s: number, light: string, mid: string, dark: string) {
  c.beginPath();
  c.moveTo(x, y - s);
  c.lineTo(x + s * 0.8, y - s * 0.3);
  c.lineTo(x + s * 0.55, y + s * 0.8);
  c.lineTo(x - s * 0.55, y + s * 0.8);
  c.lineTo(x - s * 0.8, y - s * 0.3);
  c.closePath();
  const g = c.createLinearGradient(x - s, y - s, x + s, y + s);
  g.addColorStop(0, light);
  g.addColorStop(0.5, mid);
  g.addColorStop(1, dark);
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.75)';
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(x - s * 0.8, y - s * 0.3);
  c.lineTo(x + s * 0.8, y - s * 0.3);
  c.moveTo(x, y - s);
  c.lineTo(x - s * 0.3, y - s * 0.3);
  c.lineTo(x, y + s * 0.8);
  c.lineTo(x + s * 0.3, y - s * 0.3);
  c.closePath();
  c.stroke();
}

// ------------------------------------------------------------- PENCIL (LEBIH RAMPING & ELEGANT!)
function pencilGun(c: C, cx: number, y0: number, _t: number, ready: boolean) {
  grip(c, cx, y0 + 120, '#f472b6', '#f9a8d4', 0.65);
  guard(c, cx, y0 + 114, '#9d174d');
  // Sleek slender hexagonal pencil body (lebar ramping 16px bukan 30px)
  rr(c, cx - 8, y0 + 36, 16, 118, 2, lin(c, cx - 8, cx + 8, ['#ca8a04', '#fde047', '#facc15', '#ca8a04']), '#713f12', 1.2);
  c.strokeStyle = 'rgba(113,63,18,0.45)';
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(cx, y0 + 36); c.lineTo(cx, y0 + 154);
  c.stroke();
  c.fillStyle = '#111';
  c.font = "bold 7px 'Russo One', sans-serif";
  c.textAlign = 'center';
  c.save();
  c.translate(cx, y0 + 96);
  c.rotate(-Math.PI / 2);
  c.fillText('2B', 0, 2.5);
  c.restore();
  // Sleek silver ferrule + pink eraser
  rr(c, cx - 8.5, y0 + 152, 17, 10, 1.5, chrome(c, cx - 8.5, cx + 8.5), '#475569', 1);
  rr(c, cx - 8, y0 + 162, 16, 14, [1, 1, 6, 6], lin(c, cx - 8, cx + 8, ['#db2777', '#f9a8d4', '#ec4899']), '#831843', 1);
  // Sharpened slender cone
  c.beginPath();
  c.moveTo(cx - 8, y0 + 36);
  c.lineTo(cx + 8, y0 + 36);
  c.lineTo(cx + 2.5, y0 + 8);
  c.lineTo(cx - 2.5, y0 + 8);
  c.closePath();
  c.fillStyle = lin(c, cx - 8, cx + 8, ['#c08a5a', '#f1cfa6', '#d4a373']);
  c.fill();
  c.strokeStyle = '#7c4a1e';
  c.lineWidth = 1;
  c.stroke();
  // Graphite sharp needle tip
  c.beginPath();
  c.moveTo(cx - 2.5, y0 + 8);
  c.lineTo(cx + 2.5, y0 + 8);
  c.lineTo(cx, y0 - 4);
  c.closePath();
  c.fillStyle = '#1f2937';
  c.fill();
  if (ready) glow(c, cx, y0 - 3, 2, '#9ca3af', 5);
}

// ------------------------------------------------------------- SANDAL JEPIT
export function drawSandal(c: C, x: number, y: number, s: number, rot = 0) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.scale(s, s);
  // sole
  c.beginPath();
  c.moveTo(0, -24);
  c.bezierCurveTo(12, -24, 12, -6, 9, 2);
  c.bezierCurveTo(7, 10, 11, 20, 0, 24);
  c.bezierCurveTo(-11, 20, -7, 10, -9, 2);
  c.bezierCurveTo(-12, -6, -12, -24, 0, -24);
  c.closePath();
  c.fillStyle = '#f8fafc';
  c.fill();
  c.strokeStyle = '#1e3a8a';
  c.lineWidth = 2.6;
  c.stroke();
  // blue bottom edge
  c.save();
  c.clip();
  c.fillStyle = '#2563eb';
  c.fillRect(-14, 16, 28, 10);
  c.restore();
  // strap V
  c.strokeStyle = '#2563eb';
  c.lineWidth = 4;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(-9, 2);
  c.quadraticCurveTo(-2, -10, 0, -16);
  c.quadraticCurveTo(2, -10, 9, 2);
  c.stroke();
  c.fillStyle = '#1e3a8a';
  c.beginPath();
  c.arc(0, -16, 2.5, 0, TAU);
  c.fill();
  c.restore();
}

function sandalGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  grip(c, cx, y0 + 112, '#1e3a8a', '#2563eb', 0.8);
  guard(c, cx, y0 + 104, '#172554');
  // launcher body: blue-white striped like the iconic sandal
  rr(c, cx - 18, y0 + 50, 36, 82, 8, lin(c, cx - 18, cx + 18, ['#e2e8f0', '#ffffff', '#cbd5e1']), '#1e3a8a', 2);
  c.fillStyle = '#2563eb';
  c.fillRect(cx - 18, y0 + 112, 36, 8);
  c.fillRect(cx - 18, y0 + 62, 36, 4);
  c.fillStyle = '#1e3a8a';
  c.font = "bold 8px 'Russo One', sans-serif";
  c.textAlign = 'center';
  c.fillText('EMAK', cx, y0 + 88);
  c.fillText('POWER', cx, y0 + 100);
  // rubber flaps (launch mouth)
  rr(c, cx - 22, y0 + 38, 44, 14, 6, '#1d4ed8', '#172554', 1.5);
  if (ready) drawSandal(c, cx, y0 + 12, 0.9, Math.sin(t * 3) * 0.08);
  else {
    c.fillStyle = '#0b1530';
    c.beginPath();
    c.ellipse(cx, y0 + 40, 16, 4, 0, 0, TAU);
    c.fill();
  }
}

// ------------------------------------------------------------- PAINTBALL
function paintballGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 130, '#111827', '#374151', 0.8);
  guard(c, cx, y0 + 122, '#000');
  // CO2 tank
  rr(c, cx + 20, y0 + 140, 16, 70, 8, chrome(c, cx + 20, cx + 36), '#334155', 1.5);
  rr(c, cx + 23, y0 + 136, 10, 8, 2, '#111');
  // body (neon)
  rr(c, cx - 14, y0 + 90, 28, 70, 6, lin(c, cx - 14, cx + 14, ['#9d174d', '#f472b6', '#db2777', '#831843']), '#500724', 2);
  c.fillStyle = '#facc15';
  c.fillRect(cx - 14, y0 + 112, 28, 4);
  // hopper (transparent with colored balls)
  c.beginPath();
  c.roundRect(cx - 34, y0 + 62, 30, 44, 12);
  c.fillStyle = 'rgba(255,255,255,0.18)';
  c.fill();
  c.save();
  c.clip();
  const cols = ['#f43f5e', '#facc15', '#22d3ee', '#a855f7', '#4ade80', '#fb923c'];
  for (let i = 0; i < 9; i++) {
    const bx = cx - 28 + (i % 3) * 9 + (Math.floor(i / 3) % 2) * 4;
    const by = y0 + 98 - Math.floor(i / 3) * 9 + Math.sin(t * 6 + i) * 0.8;
    c.beginPath();
    c.arc(bx, by, 4.2, 0, TAU);
    c.fillStyle = radial(c, bx, by, 4.2, ['#ffffff', cols[i % 6], cols[i % 6]]);
    c.fill();
  }
  c.restore();
  c.beginPath();
  c.roundRect(cx - 34, y0 + 62, 30, 44, 12);
  c.strokeStyle = '#111';
  c.lineWidth = 2;
  c.stroke();
  rr(c, cx - 12, y0 + 92, 10, 8, 2, '#111');
  // barrel
  rr(c, cx - 5, y0 + 2, 10, 92, 3, lin(c, cx - 5, cx + 5, ['#111', '#4b5563', '#111']), '#000', 1);
  for (let i = 0; i < 6; i++) {
    c.fillStyle = '#000';
    c.beginPath();
    c.arc(cx, y0 + 10 + i * 6, 1, 0, TAU);
    c.fill();
  }
  // paint splats on body
  c.fillStyle = 'rgba(34,211,238,0.85)';
  c.beginPath();
  c.arc(cx + 6, y0 + 130, 4, 0, TAU);
  c.arc(cx + 9, y0 + 136, 2, 0, TAU);
  c.fill();
  c.fillStyle = 'rgba(250,204,21,0.9)';
  c.beginPath();
  c.arc(cx - 7, y0 + 146, 3, 0, TAU);
  c.fill();
}

// ------------------------------------------------------------- MAGIC WAND
function magicWand(c: C, cx: number, y0: number, t: number) {
  // wand shaft (dark wood with silver spiral)
  c.save();
  rr(c, cx - 5, y0 + 24, 10, 160, 4, lin(c, cx - 5, cx + 5, ['#1c0a00', '#5b2b10', '#2a1205']), '#000', 1);
  c.strokeStyle = '#e5e7eb';
  c.lineWidth = 1.2;
  c.beginPath();
  for (let y = 0; y < 150; y += 2) c.lineTo(cx + Math.sin(y * 0.18 + t * 2) * 4.5, y0 + 30 + y);
  c.stroke();
  rr(c, cx - 7, y0 + 140, 14, 44, 5, lin(c, cx - 7, cx + 7, ['#3b0764', '#7e22ce', '#3b0764']), '#1e0636', 1);
  for (let i = 0; i < 4; i++) rr(c, cx - 8, y0 + 144 + i * 10, 16, 3, 1, brass(c, cx - 8, cx + 8));
  c.restore();
  // star tip
  const pulse = 1 + 0.08 * Math.sin(t * 6);
  c.save();
  c.translate(cx, y0 + 10);
  c.rotate(t * 0.8);
  c.scale(pulse, pulse);
  c.shadowColor = '#fde047';
  c.shadowBlur = 18;
  star(c, 0, 0, 16, '#fde047');
  c.shadowBlur = 0;
  star(c, 0, 0, 9, '#fff7cc');
  c.restore();
  glow(c, cx, y0 + 10, 3, '#ffffff', 12);
  // orbiting sparkles
  for (let i = 0; i < 6; i++) {
    const a = t * 2 + (i / 6) * TAU;
    const rr2 = 26 + Math.sin(t * 3 + i) * 4;
    const tw = 0.5 + 0.5 * Math.sin(t * 8 + i);
    star(c, cx + Math.cos(a) * rr2, y0 + 10 + Math.sin(a) * rr2 * 0.5, 2 + 2.5 * tw, i % 2 ? '#f5d0fe' : '#ffffff', 4);
  }
  // ribbon
  c.strokeStyle = '#c084fc';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(cx, y0 + 26);
  c.bezierCurveTo(cx + 18, y0 + 40 + Math.sin(t * 3) * 6, cx - 14, y0 + 60, cx + 12 + Math.sin(t * 2) * 4, y0 + 80);
  c.stroke();
}

// ------------------------------------------------------------- RUBY REVOLVER
function rubyRevolver(c: C, cx: number, y0: number, t: number) {
  // ivory grip
  c.beginPath();
  c.moveTo(cx + 4, y0 + 108);
  c.quadraticCurveTo(cx + 40, y0 + 120, cx + 62, y0 + 160);
  c.lineTo(cx + 46, y0 + 176);
  c.quadraticCurveTo(cx + 22, y0 + 140, cx - 2, y0 + 132);
  c.closePath();
  c.fillStyle = lin(c, cx, cx + 60, ['#e7e0cf', '#fffbeb', '#d6cdb5']);
  c.fill();
  c.strokeStyle = '#78716c';
  c.lineWidth = 1.5;
  c.stroke();
  gem(c, cx + 30, y0 + 140, 5, '#fecdd3', '#e11d48', '#4c0519');
  guard(c, cx - 6, y0 + 112, '#a16207', 12);
  // frame (gold engraved)
  rr(c, cx - 12, y0 + 66, 24, 56, 4, brass(c, cx - 12, cx + 12), '#713f12', 1.5);
  c.strokeStyle = 'rgba(113,63,18,0.6)';
  c.lineWidth = 0.8;
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.arc(cx, y0 + 112, 6 + i * 3, Math.PI * 1.1, Math.PI * 1.9);
    c.stroke();
  }
  // hammer
  c.fillStyle = '#713f12';
  c.beginPath();
  c.moveTo(cx - 3, y0 + 120);
  c.lineTo(cx + 3, y0 + 120);
  c.lineTo(cx + 1, y0 + 132);
  c.closePath();
  c.fill();
  // ruby cylinder (rotates per shot)
  const k = Math.min(1, gunState.sinceShot / 0.12);
  const rot = (gunState.shots - 1 + k) * (TAU / 6);
  c.save();
  c.translate(cx, y0 + 88);
  c.beginPath();
  c.ellipse(0, 0, 17, 20, 0, 0, TAU);
  c.fillStyle = radial(c, 0, 0, 20, ['#fda4af', '#e11d48', '#4c0519']);
  c.shadowColor = '#f43f5e';
  c.shadowBlur = 12;
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = '#a16207';
  c.lineWidth = 2;
  c.stroke();
  for (let i = 0; i < 6; i++) {
    const a = rot + (i / 6) * TAU;
    const x = Math.cos(a) * 9;
    const z = Math.sin(a);
    if (z < -0.2) continue;
    c.fillStyle = `rgba(80,0,20,${0.4 + 0.4 * z})`;
    c.beginPath();
    c.ellipse(x, -2, 3 * (0.6 + 0.4 * z), 12, 0, 0, TAU);
    c.fill();
  }
  c.fillStyle = 'rgba(255,255,255,0.5)';
  c.beginPath();
  c.ellipse(-6, -8, 3, 6, -0.3, 0, TAU);
  c.fill();
  c.restore();
  // barrel
  rr(c, cx - 6, y0 + 4, 12, 66, 3, brass(c, cx - 6, cx + 6), '#713f12', 1.2);
  rr(c, cx - 3, y0 + 4, 6, 64, 2, 'rgba(0,0,0,0.25)');
  c.fillStyle = '#e11d48';
  for (let i = 0; i < 3; i++) gem(c, cx, y0 + 20 + i * 16, 3, '#fecdd3', '#e11d48', '#881337');
  rr(c, cx - 3, y0 - 1, 6, 8, 2, '#713f12');
  if (Math.sin(t * 3) > 0.7) star(c, cx - 8, y0 + 80, 4, '#ffffff', 4);
}

// ------------------------------------------------------------- EMERALD LASER
function emeraldLaser(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 108, '#064e3b', '#047857', 0.78);
  guard(c, cx, y0 + 100, '#022c22');
  rr(c, cx - 15, y0 + 50, 30, 80, 6, chrome(c, cx - 15, cx + 15), '#064e3b', 1.5);
  // emerald core (big rectangular step cut)
  c.save();
  c.translate(cx, y0 + 88);
  const pulse = 0.7 + 0.3 * Math.sin(t * 4);
  c.shadowColor = '#34d399';
  c.shadowBlur = 16 * pulse;
  c.beginPath();
  c.moveTo(-8, -22);
  c.lineTo(8, -22);
  c.lineTo(11, -18);
  c.lineTo(11, 18);
  c.lineTo(8, 22);
  c.lineTo(-8, 22);
  c.lineTo(-11, 18);
  c.lineTo(-11, -18);
  c.closePath();
  c.fillStyle = lin(c, -11, 11, ['#065f46', '#6ee7b7', '#10b981', '#064e3b']);
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = 'rgba(255,255,255,0.7)';
  c.lineWidth = 0.8;
  c.strokeRect(-6, -16, 12, 32);
  c.strokeRect(-3, -10, 6, 20);
  c.restore();
  // prongs + lens
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 6, y0 + 52);
    c.lineTo(cx + s * 14, y0 + 20);
    c.lineTo(cx + s * 9, y0 + 16);
    c.lineTo(cx + s * 3, y0 + 52);
    c.closePath();
    c.fillStyle = chrome(c, cx - 14, cx + 14);
    c.fill();
    c.strokeStyle = '#064e3b';
    c.lineWidth = 1;
    c.stroke();
  }
  gem(c, cx, y0 + 12, 9, '#d1fae5', '#10b981', '#064e3b');
  glow(c, cx, y0 + 8, 3, '#a7f3d0', 14);
}

// ------------------------------------------------------------- SAPPHIRE SHOTGUN
function sapphireShotgun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  // stock (dark blue lacquer)
  c.beginPath();
  c.moveTo(cx - 12, y0 + 170);
  c.lineTo(cx + 12, y0 + 170);
  c.lineTo(cx + 34, y0 + 236);
  c.lineTo(cx + 4, y0 + 240);
  c.closePath();
  c.fillStyle = lin(c, cx - 12, cx + 34, ['#0c1a3a', '#1e40af', '#0c1a3a']);
  c.fill();
  c.strokeStyle = '#a5b4fc';
  c.lineWidth = 1;
  c.stroke();
  gem(c, cx + 14, y0 + 208, 6, '#dbeafe', '#3b82f6', '#1e3a8a');
  guard(c, cx - 8, y0 + 160, '#c0c7d1', 12);
  // receiver (silver engraved)
  rr(c, cx - 13, y0 + 122, 26, 50, 4, chrome(c, cx - 13, cx + 13), '#334155', 1.5);
  c.strokeStyle = 'rgba(51,65,85,0.5)';
  c.lineWidth = 0.8;
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.arc(cx, y0 + 147, 5 + i * 4, 0, TAU);
    c.stroke();
  }
  gem(c, cx, y0 + 147, 5, '#dbeafe', '#2563eb', '#172554');
  // double barrels
  for (const s of [-1, 1]) {
    rr(c, cx + s * 6 - 5, y0, 10, 126, 3, lin(c, cx + s * 6 - 5, cx + s * 6 + 5, ['#0f172a', '#64748b', '#1e293b']), '#020617', 1);
    c.beginPath();
    c.ellipse(cx + s * 6, y0, 4, 1.6, 0, 0, TAU);
    c.fillStyle = ready ? '#1d4ed8' : '#000';
    c.fill();
  }
  // forend with sapphire inlays
  rr(c, cx - 13, y0 + 60, 26, 44, 5, lin(c, cx - 13, cx + 13, ['#0c1a3a', '#1e3a8a', '#0c1a3a']), '#020617');
  for (let i = 0; i < 3; i++) gem(c, cx, y0 + 70 + i * 13, 4, '#dbeafe', '#3b82f6', '#1e3a8a');
  // frost shimmer
  const sh = (t * 50) % 140;
  c.fillStyle = 'rgba(219,234,254,0.35)';
  c.fillRect(cx - 12, y0 + sh, 24, 3);
}

// ------------------------------------------------------------- CRYSTAL CANNON
function crystalCannon(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 120, '#4a044e', '#86198f', 0.8);
  guard(c, cx, y0 + 112, '#2e0230');
  // rock base
  c.beginPath();
  c.moveTo(cx - 26, y0 + 140);
  c.lineTo(cx - 22, y0 + 90);
  c.lineTo(cx + 22, y0 + 86);
  c.lineTo(cx + 26, y0 + 140);
  c.closePath();
  c.fillStyle = lin(c, cx - 26, cx + 26, ['#1c1917', '#57534e', '#292524']);
  c.fill();
  c.strokeStyle = '#000';
  c.lineWidth = 1.5;
  c.stroke();
  // crystal cluster
  const crys = (x: number, y: number, w: number, h: number, ang: number, a: string, b: string, d: string) => {
    c.save();
    c.translate(x, y);
    c.rotate(ang);
    c.beginPath();
    c.moveTo(-w, 0);
    c.lineTo(-w, -h * 0.75);
    c.lineTo(0, -h);
    c.lineTo(w, -h * 0.75);
    c.lineTo(w, 0);
    c.closePath();
    c.fillStyle = lin(c, -w, w, [a, b, d]);
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.7)';
    c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(0, -h);
    c.lineTo(0, 0);
    c.stroke();
    c.restore();
  };
  const p = 0.6 + 0.4 * Math.sin(t * 3);
  c.save();
  c.shadowColor = '#f0abfc';
  c.shadowBlur = 14 * p;
  crys(cx - 16, y0 + 96, 6, 34, -0.45, '#86198f', '#f5d0fe', '#a21caf');
  crys(cx + 16, y0 + 96, 6, 36, 0.45, '#5b21b6', '#ddd6fe', '#7c3aed');
  crys(cx - 7, y0 + 92, 6, 44, -0.15, '#a21caf', '#fae8ff', '#c026d3');
  crys(cx + 8, y0 + 92, 5, 40, 0.18, '#7e22ce', '#f3e8ff', '#9333ea');
  crys(cx, y0 + 90, 9, 88, 0, '#c026d3', '#fdf4ff', '#d946ef');
  c.restore();
  // inner glow core
  glow(c, cx, y0 + 40, 4 + p * 2, '#fdf4ff', 18);
  for (let i = 0; i < 3; i++) {
    const a = Math.sin(t * 2 + i * 2);
    if (a > 0.3) star(c, cx + [-14, 12, 2][i], y0 + [60, 50, 20][i], 5 * a, '#ffffff', 4);
  }
}

// ------------------------------------------------------------- BEE RIFLE
function beeRifle(c: C, cx: number, y0: number, t: number) {
  // honeycomb stock
  c.beginPath();
  c.moveTo(cx - 12, y0 + 232);
  c.lineTo(cx + 14, y0 + 232);
  c.lineTo(cx + 30, y0 + 300);
  c.lineTo(cx - 12, y0 + 300);
  c.closePath();
  c.fillStyle = lin(c, cx - 12, cx + 30, ['#a16207', '#fbbf24', '#b45309']);
  c.fill();
  c.save();
  c.clip();
  c.strokeStyle = 'rgba(120,53,15,0.5)';
  c.lineWidth = 1;
  for (let r2 = 0; r2 < 8; r2++) {
    for (let k = 0; k < 5; k++) {
      const hx = cx - 10 + k * 9 + (r2 % 2) * 4.5;
      const hy = y0 + 236 + r2 * 8;
      c.beginPath();
      for (let i = 0; i < 6; i++) c.lineTo(hx + Math.cos((i / 6) * TAU) * 4.5, hy + Math.sin((i / 6) * TAU) * 4.5);
      c.closePath();
      c.stroke();
    }
  }
  c.restore();
  c.strokeStyle = '#451a03';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(cx - 12, y0 + 232);
  c.lineTo(cx + 14, y0 + 232);
  c.lineTo(cx + 30, y0 + 300);
  c.lineTo(cx - 12, y0 + 300);
  c.closePath();
  c.stroke();
  // grip
  c.beginPath();
  c.moveTo(cx + 12, y0 + 214);
  c.lineTo(cx + 40, y0 + 240);
  c.lineTo(cx + 30, y0 + 250);
  c.lineTo(cx + 12, y0 + 232);
  c.closePath();
  c.fillStyle = '#111';
  c.fill();
  guard(c, cx - 8, y0 + 216, '#111', 11);
  // body stripes (yellow/black)
  c.save();
  c.beginPath();
  c.roundRect(cx - 11, y0 + 100, 22, 134, 5);
  c.clip();
  for (let i = 0; i < 12; i++) {
    c.fillStyle = i % 2 ? '#111111' : '#facc15';
    c.fillRect(cx - 11, y0 + 100 + i * 11.2, 22, 11.2);
  }
  c.fillStyle = 'rgba(255,255,255,0.25)';
  c.fillRect(cx - 7, y0 + 100, 3, 134);
  c.restore();
  // translucent wings on sides
  for (const s of [-1, 1]) {
    c.save();
    c.translate(cx + s * 12, y0 + 150);
    c.rotate(s * (0.5 + Math.sin(t * 30) * 0.08));
    c.beginPath();
    c.ellipse(s * 12, -6, 14, 7, 0, 0, TAU);
    c.fillStyle = 'rgba(224,242,254,0.55)';
    c.fill();
    c.strokeStyle = 'rgba(148,163,184,0.8)';
    c.lineWidth = 0.8;
    c.stroke();
    c.restore();
  }
  // barrel
  rr(c, cx - 3, y0 + 10, 6, 94, 1, steel(c, cx - 3, cx + 3));
  // stinger muzzle
  c.beginPath();
  c.moveTo(cx - 5, y0 + 14);
  c.lineTo(cx, y0 - 6);
  c.lineTo(cx + 5, y0 + 14);
  c.closePath();
  c.fillStyle = '#111';
  c.fill();
  // scope (bee shaped)
  rr(c, cx - 30, y0 + 150, 13, 70, 6, '#111', '#000', 1);
  for (let i = 0; i < 4; i++) {
    c.fillStyle = '#facc15';
    c.fillRect(cx - 30, y0 + 160 + i * 14, 13, 6);
  }
  c.beginPath();
  c.ellipse(cx - 23.5, y0 + 148, 8, 2.5, 0, 0, TAU);
  c.fillStyle = radial(c, cx - 23.5, y0 + 148, 8, ['#fef3c7', '#d97706', '#451a03']);
  c.fill();
}

// ------------------------------------------------------------- CHARGE BLASTER (arm cannon)
function chargeBlaster(c: C, cx: number, y0: number, t: number) {
  const ch = gunState.charge;
  // arm cylinder
  rr(c, cx - 22, y0 + 40, 44, 120, [14, 14, 18, 18], lin(c, cx - 22, cx + 22, ['#1e3a8a', '#60a5fa', '#3b82f6', '#1e3a8a']), '#172554', 2);
  // rings
  for (let i = 0; i < 3; i++) {
    rr(c, cx - 24, y0 + 64 + i * 30, 48, 10, 5, lin(c, cx - 24, cx + 24, ['#0c4a6e', '#7dd3fc', '#0c4a6e']), '#082f49', 1.2);
  }
  // highlight
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.fillRect(cx - 14, y0 + 46, 5, 108);
  // wrist cuff
  rr(c, cx - 26, y0 + 150, 52, 22, 8, lin(c, cx - 26, cx + 26, ['#0e7490', '#67e8f9', '#0891b2']), '#083344', 2);
  // energy meter on side
  for (let i = 0; i < 6; i++) {
    const on = i / 6 < ch;
    c.fillStyle = on ? (i > 4 ? '#fde047' : '#67e8f9') : 'rgba(8,47,73,0.8)';
    c.fillRect(cx + 16, y0 + 140 - i * 12, 5, 9);
  }
  // muzzle head
  c.beginPath();
  c.roundRect(cx - 18, y0 + 8, 36, 40, [10, 10, 6, 6]);
  c.fillStyle = lin(c, cx - 18, cx + 18, ['#1e3a8a', '#93c5fd', '#2563eb', '#1e3a8a']);
  c.fill();
  c.strokeStyle = '#172554';
  c.lineWidth = 2;
  c.stroke();
  c.beginPath();
  c.ellipse(cx, y0 + 10, 12, 4.5, 0, 0, TAU);
  c.fillStyle = '#020617';
  c.fill();
  // charge orb
  if (ch > 0.02) {
    const full = ch >= 1;
    const flick = full ? (Math.floor(t * 20) % 2 ? '#fde047' : '#67e8f9') : '#7dd3fc';
    const r = 3 + ch * 13 + (full ? Math.sin(t * 40) * 1.5 : 0);
    c.save();
    c.globalCompositeOperation = 'lighter';
    const g = c.createRadialGradient(cx, y0 + 6, 0, cx, y0 + 6, r * 2.4);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.3, flick);
    g.addColorStop(1, 'rgba(56,189,248,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(cx, y0 + 6, r * 2.4, 0, TAU);
    c.fill();
    // converging streaks
    c.strokeStyle = flick;
    c.lineWidth = 1.5;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU + t * 5;
      const d = 30 + ((t * 120 + i * 13) % 26);
      c.beginPath();
      c.moveTo(cx + Math.cos(a) * d, y0 + 6 + Math.sin(a) * d);
      c.lineTo(cx + Math.cos(a) * (d - 9), y0 + 6 + Math.sin(a) * (d - 9));
      c.stroke();
    }
    c.restore();
  } else glow(c, cx, y0 + 10, 2, '#7dd3fc', 8);
}

// ------------------------------------------------------------- HOLY LIGHT
function holyGun(c: C, cx: number, y0: number, t: number) {
  // wings
  for (const s of [-1, 1]) {
    c.save();
    c.translate(cx + s * 14, y0 + 80);
    c.rotate(s * (0.12 + Math.sin(t * 2.5) * 0.06));
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      c.ellipse(s * (14 + i * 6), -10 + i * 9, 16 - i * 1.5, 5.5, s * (-0.6 + i * 0.25), 0, TAU);
      c.fillStyle = i % 2 ? '#fefce8' : '#ffffff';
      c.fill();
      c.strokeStyle = 'rgba(202,138,4,0.5)';
      c.lineWidth = 0.8;
      c.stroke();
    }
    c.restore();
  }
  grip(c, cx, y0 + 112, '#fef3c7', '#fbbf24', 0.78);
  guard(c, cx, y0 + 104, '#a16207');
  // ivory+gold body
  rr(c, cx - 14, y0 + 44, 28, 88, 8, lin(c, cx - 14, cx + 14, ['#e7e0cf', '#ffffff', '#f5f0e1']), '#a16207', 2);
  for (const y of [y0 + 52, y0 + 120]) rr(c, cx - 15, y, 30, 5, 2, brass(c, cx - 15, cx + 15));
  // cross gem
  c.save();
  c.translate(cx, y0 + 86);
  c.shadowColor = '#fde047';
  c.shadowBlur = 14;
  c.fillStyle = brass(c, -10, 10);
  c.fillRect(-3, -14, 6, 28);
  c.fillRect(-10, -6, 20, 6);
  c.restore();
  gem(c, cx, y0 + 83, 3.5, '#ffffff', '#fde68a', '#ca8a04');
  // barrel
  rr(c, cx - 5, y0 + 16, 10, 32, 3, brass(c, cx - 5, cx + 5), '#713f12', 1);
  // halo
  c.save();
  c.translate(cx, y0 + 6);
  c.shadowColor = '#fde047';
  c.shadowBlur = 16;
  c.strokeStyle = '#fde047';
  c.lineWidth = 3;
  c.beginPath();
  c.ellipse(0, 0, 16, 5, 0, 0, TAU);
  c.stroke();
  c.restore();
  // god rays
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + t * 0.6;
    const l = 24 + Math.sin(t * 3 + i) * 6;
    const g = c.createLinearGradient(cx, y0 + 6, cx + Math.cos(a) * l, y0 + 6 + Math.sin(a) * l);
    g.addColorStop(0, 'rgba(255,240,180,0.55)');
    g.addColorStop(1, 'rgba(255,240,180,0)');
    c.strokeStyle = g;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(cx, y0 + 6);
    c.lineTo(cx + Math.cos(a) * l, y0 + 6 + Math.sin(a) * l);
    c.stroke();
  }
  c.restore();
  glow(c, cx, y0 + 6, 4, '#ffffff', 16);
}

// ------------------------------------------------------------- RAINBOW UNICORN
function unicornGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 124, '#f9a8d4', '#f0abfc', 0.78);
  guard(c, cx, y0 + 116, '#be185d');
  // rainbow mane flowing
  const RB = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc'];
  for (let i = 0; i < 6; i++) {
    c.strokeStyle = RB[i];
    c.lineWidth = 5;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(cx + 10, y0 + 46 + i * 7);
    c.bezierCurveTo(cx + 30 + Math.sin(t * 3 + i) * 4, y0 + 60 + i * 8, cx + 22, y0 + 100 + i * 6, cx + 34 + Math.sin(t * 2 + i) * 6, y0 + 124 + i * 4);
    c.stroke();
  }
  // head (white, facing up)
  c.beginPath();
  c.moveTo(cx - 16, y0 + 130);
  c.quadraticCurveTo(cx - 22, y0 + 80, cx - 12, y0 + 46);
  c.quadraticCurveTo(cx - 8, y0 + 28, cx, y0 + 26);
  c.quadraticCurveTo(cx + 10, y0 + 28, cx + 12, y0 + 46);
  c.quadraticCurveTo(cx + 18, y0 + 80, cx + 16, y0 + 130);
  c.closePath();
  c.fillStyle = lin(c, cx - 22, cx + 18, ['#e9d5ff', '#ffffff', '#fdf4ff', '#f5d0fe']);
  c.fill();
  c.strokeStyle = '#c084fc';
  c.lineWidth = 2;
  c.stroke();
  // snout
  c.beginPath();
  c.ellipse(cx, y0 + 36, 9, 8, 0, 0, TAU);
  c.fillStyle = '#fbcfe8';
  c.fill();
  c.fillStyle = '#9d174d';
  c.beginPath();
  c.ellipse(cx - 3.5, y0 + 34, 1.4, 2, 0, 0, TAU);
  c.ellipse(cx + 3.5, y0 + 34, 1.4, 2, 0, 0, TAU);
  c.fill();
  // eyes w/ lashes
  for (const s of [-1, 1]) {
    c.beginPath();
    c.ellipse(cx + s * 8, y0 + 64, 3.5, 4.5, 0, 0, TAU);
    c.fillStyle = '#1e1b4b';
    c.fill();
    c.fillStyle = '#fff';
    c.beginPath();
    c.arc(cx + s * 8 - 1, y0 + 62.5, 1.3, 0, TAU);
    c.fill();
    c.strokeStyle = '#1e1b4b';
    c.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo(cx + s * (8 + i * 1.5), y0 + 60);
      c.lineTo(cx + s * (10 + i * 2), y0 + 57);
      c.stroke();
    }
  }
  // blush
  c.fillStyle = 'rgba(244,114,182,0.5)';
  c.beginPath();
  c.ellipse(cx - 11, y0 + 74, 3.5, 2, 0, 0, TAU);
  c.ellipse(cx + 11, y0 + 74, 3.5, 2, 0, 0, TAU);
  c.fill();
  // ears
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 8, y0 + 96);
    c.lineTo(cx + s * 20, y0 + 104);
    c.lineTo(cx + s * 10, y0 + 108);
    c.closePath();
    c.fillStyle = '#fdf4ff';
    c.fill();
    c.strokeStyle = '#c084fc';
    c.lineWidth = 1;
    c.stroke();
  }
  // golden spiral horn (barrel)
  c.save();
  c.beginPath();
  c.moveTo(cx - 6, y0 + 30);
  c.lineTo(cx, y0 - 8);
  c.lineTo(cx + 6, y0 + 30);
  c.closePath();
  c.fillStyle = lin(c, cx - 6, cx + 6, ['#ca8a04', '#fef08a', '#eab308']);
  c.shadowColor = '#fde047';
  c.shadowBlur = 12;
  c.fill();
  c.shadowBlur = 0;
  c.clip();
  c.strokeStyle = '#a16207';
  c.lineWidth = 1.2;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.moveTo(cx - 6, y0 + 28 - i * 6.5);
    c.lineTo(cx + 6, y0 + 23 - i * 6.5);
    c.stroke();
  }
  c.restore();
  // sparkles
  for (let i = 0; i < 4; i++) {
    const a = Math.sin(t * 3 + i * 1.7);
    if (a > 0.2) star(c, cx + [-20, 20, -14, 16][i], y0 + [10, 20, 100, 40][i], 5 * a, RB[i + 1], 4);
  }
}

// ------------------------------------------------------------- OBLITERATOR 9000
function obliterator(c: C, cx: number, y0: number, t: number) {
  const p = 0.6 + 0.4 * Math.sin(t * 4);
  // rear handle + grip
  grip(c, cx, y0 + 168, '#1f2937', '#374151', 0.85);
  guard(c, cx, y0 + 160, '#030712');
  // massive body
  c.beginPath();
  c.moveTo(cx - 34, y0 + 186);
  c.lineTo(cx - 38, y0 + 70);
  c.lineTo(cx - 26, y0 + 40);
  c.lineTo(cx + 26, y0 + 40);
  c.lineTo(cx + 38, y0 + 70);
  c.lineTo(cx + 34, y0 + 186);
  c.closePath();
  c.fillStyle = lin(c, cx - 38, cx + 38, ['#111827', '#4b5563', '#374151', '#6b7280', '#111827']);
  c.fill();
  c.strokeStyle = '#000';
  c.lineWidth = 2.5;
  c.stroke();
  // hazard plates
  c.save();
  c.beginPath();
  c.rect(cx - 36, y0 + 170, 72, 12);
  c.clip();
  for (let i = -2; i < 14; i++) {
    c.fillStyle = i % 2 ? '#111' : '#facc15';
    c.beginPath();
    c.moveTo(cx - 36 + i * 8, y0 + 182);
    c.lineTo(cx - 28 + i * 8, y0 + 170);
    c.lineTo(cx - 20 + i * 8, y0 + 170);
    c.lineTo(cx - 28 + i * 8, y0 + 182);
    c.fill();
  }
  c.restore();
  // green core window
  rr(c, cx - 14, y0 + 74, 28, 88, 8, '#03140a', '#16a34a', 2);
  c.save();
  c.beginPath();
  c.roundRect(cx - 12, y0 + 76, 24, 84, 7);
  c.clip();
  c.shadowColor = '#4ade80';
  c.shadowBlur = 20 * p;
  const cg = c.createLinearGradient(0, y0 + 76, 0, y0 + 160);
  cg.addColorStop(0, '#bbf7d0');
  cg.addColorStop(0.5, '#22c55e');
  cg.addColorStop(1, '#14532d');
  c.fillStyle = cg;
  c.fillRect(cx - 9, y0 + 80 + (1 - p) * 10, 18, 80);
  c.strokeStyle = 'rgba(220,252,231,0.8)';
  c.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) jag(c, cx + rand(-6, 6), y0 + 82, cx + rand(-6, 6), y0 + 156, 4, 6);
  c.restore();
  // side vents
  for (const s of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      c.fillStyle = `rgba(74,222,128,${0.3 + 0.5 * p * ((i + 1) / 6)})`;
      c.fillRect(cx + s * 26 - 4, y0 + 84 + i * 13, 8, 5);
    }
  }
  // radiation emblem
  c.save();
  c.translate(cx, y0 + 56);
  c.fillStyle = '#facc15';
  c.beginPath();
  c.arc(0, 0, 9, 0, TAU);
  c.fill();
  c.fillStyle = '#111';
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.moveTo(0, 0);
    c.arc(0, 0, 8, (i / 3) * TAU - 0.5, (i / 3) * TAU + 0.5);
    c.closePath();
    c.fill();
  }
  c.fillStyle = '#facc15';
  c.beginPath();
  c.arc(0, 0, 2.5, 0, TAU);
  c.fill();
  c.restore();
  // huge muzzle
  rr(c, cx - 30, y0 + 2, 60, 42, [8, 8, 4, 4], lin(c, cx - 30, cx + 30, ['#030712', '#4b5563', '#030712']), '#000', 2);
  c.beginPath();
  c.ellipse(cx, y0 + 6, 24, 7, 0, 0, TAU);
  c.fillStyle = '#020a05';
  c.fill();
  // swirling green energy in muzzle
  c.save();
  c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(cx, y0 + 6, 0, cx, y0 + 6, 24);
  g.addColorStop(0, `rgba(220,252,231,${0.9 * p})`);
  g.addColorStop(0.4, `rgba(74,222,128,${0.6 * p})`);
  g.addColorStop(1, 'rgba(22,163,74,0)');
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(cx, y0 + 6, 24, 9, 0, 0, TAU);
  c.fill();
  c.strokeStyle = 'rgba(187,247,208,0.8)';
  c.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.ellipse(cx, y0 + 6, 8 + i * 5, 2.5 + i * 1.5, t * (2 + i), 0, Math.PI * 1.3);
    c.stroke();
  }
  c.restore();
  // "9000" stamp
  c.fillStyle = '#9ca3af';
  c.font = "bold 9px 'Russo One', sans-serif";
  c.textAlign = 'center';
  c.fillText('9000', cx, y0 + 34);
}

// ================================================================ dispatch
export function drawGunExtra3(c: C, id: WeaponId, cx: number, y0: number, t: number, ready: boolean) {
  switch (id) {
    case 'pencil': pencilGun(c, cx, y0, t, ready); break;
    case 'sandal': sandalGun(c, cx, y0, t, ready); break;
    case 'paintball': paintballGun(c, cx, y0, t); break;
    case 'wand': magicWand(c, cx, y0, t); break;
    case 'ruby': rubyRevolver(c, cx, y0, t); break;
    case 'emerald': emeraldLaser(c, cx, y0, t); break;
    case 'sapphire': sapphireShotgun(c, cx, y0, t, ready); break;
    case 'crystal': crystalCannon(c, cx, y0, t); break;
    case 'beerifle': beeRifle(c, cx, y0, t); break;
    case 'buster': chargeBlaster(c, cx, y0, t); break;
    case 'holy': holyGun(c, cx, y0, t); break;
    case 'unicorn': unicornGun(c, cx, y0, t); break;
    case 'obliterator': obliterator(c, cx, y0, t); break;
    case 'bit8': bit8Gun(c, cx, y0); break;
    case 'coingun': coinGun(c, cx, y0, t, ready); break;
    case 'kunai': kunaiGun(c, cx, y0, ready); break;
    case 'blaster': starWarsBlaster(c, cx, y0, t); break;
    default: drawGunExtra4(c, id, cx, y0, t, ready); break;
  }
  void wood;
}

export type Flash3 = { k: 'fire'; s: number } | { k: 'energy'; rgb: string; r: number } | { k: 'puff'; col: string; n: number };
export const FLASH3: Partial<Record<WeaponId, Flash3>> = {
  disc: { k: 'energy', rgb: '34,211,238', r: 36 },
  pencil: { k: 'puff', col: 'rgba(240,220,190,', n: 5 }, sandal: { k: 'puff', col: 'rgba(219,234,254,', n: 8 },
  paintball: { k: 'puff', col: 'rgba(255,255,255,', n: 6 }, wand: { k: 'energy', rgb: '233,213,255', r: 46 },
  ruby: { k: 'fire', s: 1.2 }, emerald: { k: 'energy', rgb: '52,211,153', r: 44 }, sapphire: { k: 'fire', s: 1.6 },
  crystal: { k: 'energy', rgb: '240,171,252', r: 56 }, beerifle: { k: 'fire', s: 1.3 }, buster: { k: 'energy', rgb: '125,211,252', r: 40 },
  holy: { k: 'energy', rgb: '255,240,180', r: 60 }, unicorn: { k: 'energy', rgb: '250,190,240', r: 50 }, obliterator: { k: 'energy', rgb: '74,222,128', r: 90 },
  bit8: { k: 'energy', rgb: '34,197,94', r: 32 }, coingun: { k: 'energy', rgb: '250,204,21', r: 36 },
  kunai: { k: 'puff', col: 'rgba(226,232,240,', n: 4 }, blaster: { k: 'energy', rgb: '239,68,68', r: 54 },
  ...FLASH4,
};
