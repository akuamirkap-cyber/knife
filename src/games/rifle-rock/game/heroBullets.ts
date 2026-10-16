import type { BulletView } from './bullets';

const TAU = Math.PI * 2;

type Draw = (c: CanvasRenderingContext2D, b: BulletView, t: number) => void;

function aimOf(b: BulletView) { return Math.atan2(b.vy, b.vx); }
function trailPts(b: BulletView, n: number) {
  const out: { x: number; y: number; f: number }[] = [];
  const len = b.trail.length;
  for (let i = Math.max(0, len - n); i < len; i++) {
    out.push({ ...b.trail[i], f: (i - (len - n)) / n });
  }
  return out;
}
function glowDot(c: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, a = 1) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, '#fff'); g.addColorStop(0.3, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.globalAlpha = a; c.fillStyle = g;
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.globalAlpha = 1;
}

/* 1. PISTOL — crisp copper tracer with smoke-ring wake */
const pistol: Draw = (c, b) => {
  const a = aimOf(b);
  const len = 46;
  const tx = b.x - Math.cos(a) * len, ty = b.y - Math.sin(a) * len;
  const g = c.createLinearGradient(b.x, b.y, tx, ty);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.18, '#ffe4a8');
  g.addColorStop(0.55, '#ff9f3c'); g.addColorStop(1, 'rgba(255,100,0,0)');
  c.strokeStyle = g; c.lineWidth = 3.6;
  c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(tx, ty); c.stroke();
  c.globalAlpha = 0.35; c.strokeStyle = '#ffb347'; c.lineWidth = 11;
  c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x * 0.6 + tx * 0.4, b.y * 0.6 + ty * 0.4); c.stroke();
  c.globalAlpha = 1;
  // spinning copper slug
  c.save();
  c.translate(b.x, b.y); c.rotate(a + Math.PI / 2);
  const bg = c.createLinearGradient(-4, 0, 4, 0);
  bg.addColorStop(0, '#ffe6b0'); bg.addColorStop(0.5, '#e0963a'); bg.addColorStop(1, '#8a5415');
  c.fillStyle = bg;
  c.beginPath();
  c.moveTo(0, -8); c.quadraticCurveTo(4, -4, 4, 3); c.lineTo(-4, 3); c.quadraticCurveTo(-4, -4, 0, -8);
  c.closePath(); c.fill();
  c.restore();
  // smoke rings
  for (let i = 1; i <= 2; i++) {
    const d = i * 18;
    const k = ((b.age * 4 + i * 0.4) % 1);
    c.strokeStyle = `rgba(255,220,170,${0.3 * (1 - k)})`;
    c.lineWidth = 1.6;
    c.save();
    c.translate(b.x - Math.cos(a) * d, b.y - Math.sin(a) * d);
    c.rotate(a);
    c.beginPath(); c.ellipse(0, 0, 3 + k * 5, 7 + k * 9, 0, 0, TAU); c.stroke();
    c.restore();
  }
  glowDot(c, b.x, b.y, 9, '#ffbe5c', 0.9);
};

/* 2. AK-47 — fiery full-auto tracer with ember shower */
const ak47: Draw = (c, b) => {
  const a = aimOf(b);
  const len = 60;
  const tx = b.x - Math.cos(a) * len, ty = b.y - Math.sin(a) * len;
  c.globalAlpha = 0.4; c.strokeStyle = '#ff7a18'; c.lineWidth = 15;
  c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(tx, ty); c.stroke();
  const g = c.createLinearGradient(b.x, b.y, tx, ty);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.2, '#ffd27a');
  g.addColorStop(0.6, '#ff6a1a'); g.addColorStop(1, 'rgba(180,40,0,0)');
  c.globalAlpha = 1; c.strokeStyle = g; c.lineWidth = 4.4;
  c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(tx, ty); c.stroke();
  // embers flaking off
  for (let i = 0; i < 4; i++) {
    const f = (i + 1) / 5;
    const off = Math.sin(b.age * 26 + i * 2) * 8 * f;
    const px = b.x - Math.cos(a) * len * f + Math.cos(a + 1.57) * off;
    const py = b.y - Math.sin(a) * len * f + Math.sin(a + 1.57) * off;
    c.fillStyle = `rgba(255,${160 - i * 25},40,${0.85 - f * 0.6})`;
    c.fillRect(px - 1.6, py - 1.6, 3.2, 3.2);
  }
  glowDot(c, b.x, b.y, 13, '#ffb347');
  c.fillStyle = '#fff';
  c.beginPath(); c.arc(b.x, b.y, 2.8, 0, TAU); c.fill();
};

/* 3. NAIL GUN — spinning steel nail with sharp glint */
const nailgun: Draw = (c, b) => {
  const a = aimOf(b);
  // motion blur streak
  c.globalAlpha = 0.5; c.strokeStyle = '#cfd8e3'; c.lineWidth = 2;
  c.beginPath();
  c.moveTo(b.x, b.y); c.lineTo(b.x - Math.cos(a) * 26, b.y - Math.sin(a) * 26);
  c.stroke();
  c.globalAlpha = 1;
  c.save();
  c.translate(b.x, b.y); c.rotate(a + Math.PI / 2);
  // shaft
  const sg = c.createLinearGradient(-2, 0, 2, 0);
  sg.addColorStop(0, '#ffffff'); sg.addColorStop(0.4, '#c3ccd6'); sg.addColorStop(1, '#6b7684');
  c.fillStyle = sg;
  c.fillRect(-1.6, -10, 3.2, 20);
  // point
  c.beginPath(); c.moveTo(0, -16); c.lineTo(2.2, -9); c.lineTo(-2.2, -9); c.closePath(); c.fill();
  // flat head
  c.fillStyle = '#e8eef5';
  c.beginPath(); c.ellipse(0, 10, 5.4, 2, 0, 0, TAU); c.fill();
  c.fillStyle = '#8d98a6';
  c.beginPath(); c.ellipse(0, 11.4, 5.4, 1.6, 0, 0, TAU); c.fill();
  c.restore();
  // metallic glint
  const tw = Math.sin(b.age * 26);
  if (tw > 0.4) {
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = (tw - 0.4) * 1.6;
    c.strokeStyle = '#fff'; c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(b.x - 9, b.y); c.lineTo(b.x + 9, b.y);
    c.moveTo(b.x, b.y - 9); c.lineTo(b.x, b.y + 9);
    c.stroke();
    c.restore();
  }
};

/* 4. CROSSBOW — heavy bolt with fletching + air-split wake */
const crossbow: Draw = (c, b) => {
  const a = aimOf(b);
  // air displacement
  c.strokeStyle = 'rgba(255,245,210,0.3)'; c.lineWidth = 1.6;
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(b.x + Math.cos(a + 1.57) * 5 * s, b.y + Math.sin(a + 1.57) * 5 * s);
    c.lineTo(b.x - Math.cos(a) * 44 + Math.cos(a + 1.57) * 13 * s,
      b.y - Math.sin(a) * 44 + Math.sin(a + 1.57) * 13 * s);
    c.stroke();
  }
  c.save();
  c.translate(b.x, b.y); c.rotate(a + Math.PI / 2);
  // broadhead
  const hg = c.createLinearGradient(-7, -24, 7, -8);
  hg.addColorStop(0, '#ffffff'); hg.addColorStop(0.5, '#c9d3dd'); hg.addColorStop(1, '#707b88');
  c.fillStyle = hg;
  c.beginPath(); c.moveTo(0, -26); c.lineTo(7, -8); c.lineTo(0, -12); c.lineTo(-7, -8); c.closePath(); c.fill();
  // shaft
  c.fillStyle = '#2b3039'; c.fillRect(-2.2, -12, 4.4, 34);
  c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(-2.2, -12, 1.4, 34);
  // fletching
  c.fillStyle = '#9fb7c9';
  c.beginPath(); c.moveTo(-2, 10); c.lineTo(-9, 24); c.lineTo(-2, 21); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(2, 10); c.lineTo(9, 24); c.lineTo(2, 21); c.closePath(); c.fill();
  c.fillStyle = '#ffe9b0';
  c.beginPath(); c.moveTo(-2, 14); c.lineTo(-6, 22); c.lineTo(-2, 20); c.closePath(); c.fill();
  c.restore();
  glowDot(c, b.x, b.y - 2, 10, 'rgba(255,233,176,0.9)', 0.6);
};

/* 5. KETAPEL — tumbling river stone with dust puff */
const ketapel: Draw = (c, b) => {
  const spin = b.age * 7;
  // dust trail
  for (const p of trailPts(b, 6)) {
    c.fillStyle = `rgba(190,180,160,${0.3 * p.f})`;
    c.beginPath(); c.arc(p.x, p.y, 3 + (1 - p.f) * 5, 0, TAU); c.fill();
  }
  c.save();
  c.translate(b.x, b.y); c.rotate(spin);
  const g = c.createRadialGradient(-3, -4, 1, 0, 0, 11);
  g.addColorStop(0, '#cfd4da'); g.addColorStop(0.55, '#8f969f'); g.addColorStop(1, '#4e555e');
  c.fillStyle = g;
  c.beginPath();
  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * TAU;
    const r = 10 + Math.sin(i * 2.7) * 2.4;
    i ? c.lineTo(Math.cos(ang) * r, Math.sin(ang) * r) : c.moveTo(Math.cos(ang) * r, Math.sin(ang) * r);
  }
  c.closePath(); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1.2; c.stroke();
  // speckles
  c.fillStyle = 'rgba(255,255,255,0.4)';
  c.beginPath(); c.arc(-3, -3, 2.4, 0, TAU); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.25)';
  c.beginPath(); c.arc(3, 2, 1.8, 0, TAU); c.fill();
  c.restore();
};

/* 6. SUMPIT — silent dart with feather tuft and faint toxin mist */
const sumpit: Draw = (c, b) => {
  const a = aimOf(b);
  for (const p of trailPts(b, 7)) {
    c.fillStyle = `rgba(150,230,120,${0.22 * p.f})`;
    c.beginPath(); c.arc(p.x, p.y, 2 + (1 - p.f) * 4, 0, TAU); c.fill();
  }
  c.save();
  c.translate(b.x, b.y); c.rotate(a + Math.PI / 2);
  // poison tip
  c.fillStyle = '#8ef02a';
  c.beginPath(); c.moveTo(0, -16); c.lineTo(2.6, -7); c.lineTo(-2.6, -7); c.closePath(); c.fill();
  c.fillStyle = 'rgba(220,255,180,0.9)';
  c.beginPath(); c.moveTo(0, -16); c.lineTo(1.2, -11); c.lineTo(-1.2, -11); c.closePath(); c.fill();
  // bamboo shaft
  const sg = c.createLinearGradient(-2, 0, 2, 0);
  sg.addColorStop(0, '#dfe6c8'); sg.addColorStop(1, '#6c7a46');
  c.fillStyle = sg; c.fillRect(-1.4, -8, 2.8, 20);
  // kapok tuft
  c.fillStyle = 'rgba(245,240,220,0.9)';
  c.beginPath(); c.ellipse(0, 15, 4.4, 7, 0, 0, TAU); c.fill();
  c.fillStyle = 'rgba(200,195,170,0.7)';
  c.beginPath(); c.ellipse(0, 17, 2.6, 4.4, 0, 0, TAU); c.fill();
  c.restore();
  glowDot(c, b.x, b.y - 4, 8, 'rgba(160,255,110,0.8)', 0.5);
};

/* 7. SHOTGUN — glowing buckshot pellet with scatter sparks */
const shotgun: Draw = (c, b) => {
  const a = aimOf(b);
  const len = 24;
  const g = c.createLinearGradient(b.x, b.y, b.x - Math.cos(a) * len, b.y - Math.sin(a) * len);
  g.addColorStop(0, '#fff3c4'); g.addColorStop(0.4, '#ff9f5a'); g.addColorStop(1, 'rgba(255,80,0,0)');
  c.strokeStyle = g; c.lineWidth = 3.4;
  c.beginPath();
  c.moveTo(b.x, b.y); c.lineTo(b.x - Math.cos(a) * len, b.y - Math.sin(a) * len);
  c.stroke();
  // lead ball
  const bg = c.createRadialGradient(b.x - 1.4, b.y - 1.4, 0.5, b.x, b.y, 4);
  bg.addColorStop(0, '#fff6d6'); bg.addColorStop(0.5, '#ffb765'); bg.addColorStop(1, '#a1521a');
  c.fillStyle = bg;
  c.beginPath(); c.arc(b.x, b.y, 3.6, 0, TAU); c.fill();
  glowDot(c, b.x, b.y, 10, '#ff8a3c', 0.7);
  // tiny sparks
  if (Math.random() < 0.5) {
    c.fillStyle = 'rgba(255,220,150,0.8)';
    c.fillRect(b.x - Math.cos(a) * 12 + Math.random() * 6 - 3, b.y - Math.sin(a) * 12 + Math.random() * 6 - 3, 1.8, 1.8);
  }
};

/* 8. SUPER SOAKER — wobbling water blob with droplets */
const soaker: Draw = (c, b) => {
  const a = aimOf(b);
  for (const p of trailPts(b, 6)) {
    c.fillStyle = `rgba(110,210,255,${0.3 * p.f})`;
    c.beginPath(); c.arc(p.x, p.y, 2 + p.f * 4, 0, TAU); c.fill();
  }
  c.save();
  c.translate(b.x, b.y); c.rotate(a + Math.PI / 2);
  const wob = Math.sin(b.age * 22) * 0.22;
  c.scale(1 - wob, 1 + wob);
  const g = c.createLinearGradient(0, -14, 0, 10);
  g.addColorStop(0, '#f0ffff'); g.addColorStop(0.4, '#7fd9ff'); g.addColorStop(1, '#1d8ad1');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(0, -15);
  c.quadraticCurveTo(9, 0, 0, 11);
  c.quadraticCurveTo(-9, 0, 0, -15);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.8)';
  c.beginPath(); c.ellipse(-2.4, -3, 1.8, 4, -0.3, 0, TAU); c.fill();
  c.restore();
  // flying droplets
  for (let i = 0; i < 3; i++) {
    const f = (i + 1) / 4;
    const off = Math.sin(b.age * 18 + i * 2.2) * 9;
    const px = b.x - Math.cos(a) * 20 * f + Math.cos(a + 1.57) * off;
    const py = b.y - Math.sin(a) * 20 * f + Math.sin(a + 1.57) * off;
    c.fillStyle = `rgba(160,230,255,${0.75 - f * 0.4})`;
    c.beginPath(); c.arc(px, py, 2.4 - f, 0, TAU); c.fill();
  }
};

/* 9. SNOWBALL — packed snowball with icy sparkles and flurry */
const snowball: Draw = (c, b) => {
  const spin = b.age * 5;
  for (const p of trailPts(b, 8)) {
    c.fillStyle = `rgba(235,250,255,${0.35 * p.f})`;
    c.beginPath(); c.arc(p.x, p.y, 2 + (1 - p.f) * 6, 0, TAU); c.fill();
  }
  // glow halo
  const hg = c.createRadialGradient(b.x, b.y, 2, b.x, b.y, 22);
  hg.addColorStop(0, 'rgba(200,240,255,0.55)'); hg.addColorStop(1, 'rgba(120,200,255,0)');
  c.fillStyle = hg;
  c.beginPath(); c.arc(b.x, b.y, 22, 0, TAU); c.fill();
  // ball
  const g = c.createRadialGradient(b.x - 4, b.y - 5, 1, b.x, b.y, 12);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#e4f5ff'); g.addColorStop(1, '#9cc7de');
  c.fillStyle = g;
  c.beginPath();
  for (let i = 0; i < 9; i++) {
    const ang = (i / 9) * TAU + spin * 0.2;
    const r = 11 + Math.sin(i * 2.4) * 1.3;
    i ? c.lineTo(b.x + Math.cos(ang) * r, b.y + Math.sin(ang) * r) : c.moveTo(b.x + Math.cos(ang) * r, b.y + Math.sin(ang) * r);
  }
  c.closePath(); c.fill();
  // compressed shadows
  c.fillStyle = 'rgba(140,185,210,0.4)';
  c.beginPath(); c.arc(b.x + 3.4, b.y + 3.4, 4.4, 0, TAU); c.fill();
  // orbiting snowflakes
  c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    const ang = spin + (i / 3) * TAU;
    const fx = b.x + Math.cos(ang) * 16, fy = b.y + Math.sin(ang) * 16;
    for (let k = 0; k < 3; k++) {
      const ka = (k / 3) * Math.PI + spin;
      c.beginPath();
      c.moveTo(fx - Math.cos(ka) * 3.4, fy - Math.sin(ka) * 3.4);
      c.lineTo(fx + Math.cos(ka) * 3.4, fy + Math.sin(ka) * 3.4);
      c.stroke();
    }
  }
};

/* 10. HONEY — gooey amber glob with stretchy strand */
const honey: Draw = (c, b) => {
  const a = aimOf(b);
  // sticky strand trailing behind
  const pts = trailPts(b, 8);
  if (pts.length > 1) {
    c.strokeStyle = 'rgba(224,156,18,0.6)';
    c.lineCap = 'round';
    c.beginPath();
    pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)));
    c.lineWidth = 5; c.stroke();
    c.strokeStyle = 'rgba(255,220,120,0.4)'; c.lineWidth = 2;
    c.stroke();
  }
  // drips falling off the strand
  for (let i = 0; i < 2; i++) {
    const p = pts[Math.max(0, pts.length - 2 - i * 3)];
    if (!p) continue;
    c.fillStyle = 'rgba(240,180,40,0.75)';
    c.beginPath(); c.ellipse(p.x, p.y + 5 + i * 3, 2.4, 3.6, 0, 0, TAU); c.fill();
  }
  c.save();
  c.translate(b.x, b.y); c.rotate(a + Math.PI / 2);
  const wob = Math.sin(b.age * 16) * 0.18;
  c.scale(1 + wob, 1 - wob);
  const g = c.createRadialGradient(-3, -4, 1, 0, 0, 13);
  g.addColorStop(0, '#fff2bd'); g.addColorStop(0.45, '#ffcf4d'); g.addColorStop(1, '#c47f0c');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(0, -13);
  c.bezierCurveTo(9, -9, 11, 4, 0, 12);
  c.bezierCurveTo(-11, 4, -9, -9, 0, -13);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.75)';
  c.beginPath(); c.ellipse(-3.4, -4.4, 2.2, 3.4, -0.5, 0, TAU); c.fill();
  c.restore();
  // sparkle on the goo
  const tw = Math.sin(b.age * 11);
  if (tw > 0.5) {
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = (tw - 0.5) * 2;
    c.fillStyle = '#fff6c2';
    c.translate(b.x + 5, b.y - 6); c.rotate(Math.PI / 4);
    c.fillRect(-3, -0.9, 6, 1.8); c.fillRect(-0.9, -3, 1.8, 6);
    c.restore();
  }
  const hg = c.createRadialGradient(b.x, b.y, 2, b.x, b.y, 20);
  hg.addColorStop(0, 'rgba(255,205,80,0.4)'); hg.addColorStop(1, 'rgba(255,170,0,0)');
  c.fillStyle = hg;
  c.beginPath(); c.arc(b.x, b.y, 20, 0, TAU); c.fill();
};

export const HERO_BULLETS: Record<string, Draw> = {
  pistol, ak47, nailgun, crossbow, ketapel, sumpit, shotgun, soaker, snowball, honey,
};
