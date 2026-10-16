import type { WeaponDef } from './catalog';
import type { GunDraw } from './guns';

const TAU = Math.PI * 2;

/* ================= shared painting helpers ================= */
function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); c.roundRect(x, y, w, h, r);
}
/** vertical metal cylinder shading: left lit, right falloff */
function tube(c: CanvasRenderingContext2D, w: number, lo: string, mid: string, hi: string) {
  const g = c.createLinearGradient(-w, 0, w, 0);
  g.addColorStop(0, mid);
  g.addColorStop(0.22, hi);
  g.addColorStop(0.5, mid);
  g.addColorStop(0.82, lo);
  g.addColorStop(1, mid);
  return g;
}
function glow(c: CanvasRenderingContext2D, x: number, y: number, r: number, col: string, a = 1) {
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = a;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.restore();
}
function flash(c: CanvasRenderingContext2D, f: number, size: number, col: string, petals = 5) {
  if (f <= 0) return;
  const s = size * (0.5 + f * 0.75);
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = f;
  const g = c.createRadialGradient(0, -s * 0.3, 0, 0, -s * 0.3, s * 1.8);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.28, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  c.beginPath(); c.arc(0, -s * 0.3, s * 1.8, 0, TAU); c.fill();
  c.fillStyle = col;
  c.beginPath();
  for (let i = 0; i < petals * 2; i++) {
    const a = (i / (petals * 2)) * TAU - Math.PI / 2;
    const r = i % 2 ? s * 0.42 : s * 1.55;
    const px = Math.cos(a) * r * (i % 2 ? 1 : 0.5), py = Math.sin(a) * r - s * 0.25;
    i ? c.lineTo(px, py) : c.moveTo(px, py);
  }
  c.closePath(); c.fill();
  c.fillStyle = '#fff';
  c.beginPath(); c.ellipse(0, -s * 0.3, s * 0.16, s * 0.55, 0, 0, TAU); c.fill();
  c.restore();
}
function wood(c: CanvasRenderingContext2D, w: number, base: string, dark: string) {
  const g = c.createLinearGradient(-w, 0, w, 0);
  g.addColorStop(0, base); g.addColorStop(0.3, base); g.addColorStop(1, dark);
  return g;
}
function grain(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, n = 5) {
  c.save();
  c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    const yy = y + (h / n) * i + 3;
    c.beginPath();
    c.moveTo(x, yy);
    c.bezierCurveTo(x + w * 0.3, yy + 3, x + w * 0.6, yy - 3, x + w, yy + 1);
    c.stroke();
  }
  c.restore();
}
function screw(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
  c.fillStyle = '#4b535e';
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.strokeStyle = '#20252c'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(x - r * 0.6, y); c.lineTo(x + r * 0.6, y); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.3)';
  c.beginPath(); c.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, TAU); c.fill();
}
function gripPanel(c: CanvasRenderingContext2D, pts: [number, number][], fill: string, lines = 4) {
  c.save();
  c.beginPath();
  pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
  c.closePath();
  c.fillStyle = fill; c.fill();
  c.clip();
  c.strokeStyle = 'rgba(0,0,0,0.38)'; c.lineWidth = 1.4;
  for (let i = 0; i < lines * 2; i++) {
    c.beginPath(); c.moveTo(-10 + i * 6, -20); c.lineTo(-24 + i * 6, 60); c.stroke();
  }
  c.strokeStyle = 'rgba(255,255,255,0.12)';
  for (let i = 0; i < lines; i++) {
    c.beginPath(); c.moveTo(-8 + i * 12, -20); c.lineTo(-22 + i * 12, 60); c.stroke();
  }
  c.restore();
}
function trigger(c: CanvasRenderingContext2D, y: number, col = '#171b21') {
  c.strokeStyle = col; c.lineWidth = 3.4; c.lineCap = 'round';
  c.beginPath(); c.arc(13, y, 9.5, -Math.PI / 2, Math.PI / 2); c.stroke();
  c.strokeStyle = '#9aa4b2'; c.lineWidth = 2.6;
  c.beginPath(); c.moveTo(11, y - 4); c.quadraticCurveTo(19, y - 1, 16.5, y + 5); c.stroke();
}

export type HeroDrawer = (c: CanvasRenderingContext2D, w: WeaponDef, d: GunDraw) => void;

/* ================= 1. PISTOL — polished sidearm ================= */
const pistol: HeroDrawer = (c, w, d) => {
  flash(c, d.flash, 26, '#ffd9a0', 6);
  const back = d.flash * 11;

  // frame rail under slide
  c.fillStyle = '#20252c';
  rr(c, -9, 56, 18, 46, 3); c.fill();

  // slide
  c.save();
  c.translate(0, back);
  const sl = tube(c, 11, '#23282f', '#424a55', '#8d98a6');
  c.fillStyle = sl;
  c.beginPath();
  c.moveTo(-11, 2); c.lineTo(-11, 72);
  c.lineTo(11, 72); c.lineTo(11, 8);
  c.quadraticCurveTo(11, 2, 5, 1); c.lineTo(-5, 1);
  c.closePath(); c.fill();
  // top flat + front sight
  c.fillStyle = 'rgba(255,255,255,0.14)'; c.fillRect(-11, 2, 3, 70);
  c.fillStyle = '#15181d';
  c.beginPath(); c.moveTo(-11, 10); c.lineTo(-18, 13); c.lineTo(-18, 18); c.lineTo(-11, 19); c.closePath(); c.fill();
  c.fillStyle = w.c2; c.beginPath(); c.arc(-15, 14.5, 1.8, 0, TAU); c.fill();
  // rear sight
  c.fillStyle = '#15181d';
  rr(c, -17, 58, 7, 10, 1.5); c.fill();
  // ejection port
  c.fillStyle = '#0d1014';
  rr(c, -5, 24, 9, 22, 2); c.fill();
  c.fillStyle = '#c9a24a'; c.fillRect(-3, 30, 5, 11);
  // serrations
  c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 2;
  for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(-10, 50 + i * 3.2); c.lineTo(10, 50 + i * 3.2); c.stroke(); }
  c.strokeStyle = w.c2; c.lineWidth = 1.4; c.globalAlpha = 0.55;
  c.beginPath(); c.moveTo(9, 14); c.lineTo(9, 68); c.stroke();
  c.globalAlpha = 1;
  // muzzle crown
  c.fillStyle = '#0e1116';
  c.beginPath(); c.ellipse(0, 3, 5, 3.2, 0, 0, TAU); c.fill();
  c.strokeStyle = '#99a3b0'; c.lineWidth = 1.2; c.stroke();
  c.restore();

  // frame / dust cover with rail
  c.fillStyle = tube(c, 12, '#1a1e24', '#2e343d', '#5f6874');
  c.beginPath();
  c.moveTo(-12, 66); c.lineTo(12, 66); c.lineTo(12, 104);
  c.quadraticCurveTo(12, 110, 6, 110); c.lineTo(-12, 104);
  c.closePath(); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.5)';
  for (let i = 0; i < 3; i++) c.fillRect(-11, 70 + i * 7, 6, 4);
  screw(c, 8, 76, 2.4);

  // magazine
  c.save();
  c.translate(d.magDrop * 0.5, d.magDrop);
  c.globalAlpha = Math.max(0, 1 - d.magDrop / 70);
  c.fillStyle = '#171b21';
  c.beginPath();
  c.moveTo(11, 96); c.lineTo(34, 102); c.lineTo(31, 136); c.lineTo(9, 130);
  c.closePath(); c.fill();
  c.fillStyle = w.c2; c.globalAlpha *= 0.7; c.fillRect(16, 106, 12, 3.4);
  c.restore();

  trigger(c, 104);

  // grip with checkering
  gripPanel(c, [[9, 92], [36, 104], [41, 116], [34, 142], [10, 130]], '#2a3038', 4);
  c.strokeStyle = 'rgba(255,255,255,0.14)'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(9, 93); c.lineTo(35, 105); c.stroke();
  // backstrap glow logo
  glow(c, 20, 118, 12, w.glow, 0.35);
  c.fillStyle = w.c2; c.globalAlpha = 0.85;
  c.beginPath(); c.arc(20, 118, 3.4, 0, TAU); c.fill();
  c.globalAlpha = 1;

  glow(c, 0, 6 + back, 14, w.glow, 0.18 + d.flash * 0.7);
};

/* ================= 2. AK-47 — wood & steel classic ================= */
const ak47: HeroDrawer = (c, w, d) => {
  flash(c, d.flash, 32, '#ffbe6b', 6);
  // slant muzzle brake
  c.fillStyle = tube(c, 8, '#16191e', '#2b3139', '#616b78');
  c.beginPath();
  c.moveTo(-8, 4); c.lineTo(8, 0); c.lineTo(8, 22); c.lineTo(-8, 22);
  c.closePath(); c.fill();
  c.fillStyle = '#0c0e12';
  c.beginPath(); c.ellipse(0, 4, 5, 3, 0, 0, TAU); c.fill();
  // barrel
  c.fillStyle = tube(c, 4, '#1a1e23', '#333a43', '#737d8a');
  c.fillRect(-3.6, 20, 7.2, 34);
  // front sight post with ears
  c.fillStyle = '#1b1f26';
  c.beginPath(); c.moveTo(-9, 46); c.lineTo(-9, 56); c.lineTo(9, 56); c.lineTo(9, 46); c.lineTo(5, 44); c.lineTo(-5, 44); c.closePath(); c.fill();
  c.fillStyle = '#0f1216'; c.fillRect(-1.6, 36, 3.2, 10);
  // gas block + tube
  c.fillStyle = tube(c, 7, '#1d2127', '#39414b', '#78838f');
  rr(c, -7, 58, 14, 20, 2); c.fill();
  c.fillStyle = '#2b323b'; c.fillRect(-9, 76, 5, 40);
  // wooden handguard
  c.fillStyle = wood(c, 12, '#9a6527', '#4a2d0f');
  c.beginPath();
  c.moveTo(-12, 78); c.quadraticCurveTo(-14, 100, -12, 124);
  c.lineTo(12, 124); c.quadraticCurveTo(14, 100, 12, 78);
  c.closePath(); c.fill();
  grain(c, -12, 80, 24, 42, 6);
  c.fillStyle = 'rgba(255,220,160,0.2)'; c.fillRect(-11, 80, 3, 42);
  // upper handguard ridge
  c.fillStyle = 'rgba(0,0,0,0.28)';
  rr(c, -6, 86, 12, 30, 4); c.fill();

  // receiver
  c.fillStyle = tube(c, 13, '#191d22', '#313841', '#6e7884');
  rr(c, -13, 122, 26, 58, 3); c.fill();
  // rivets
  screw(c, -9, 132, 2.2); screw(c, -9, 168, 2.2); screw(c, 9, 150, 2.2);
  // dust cover ribs
  c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-12, 128 + i * 12); c.lineTo(12, 128 + i * 12); c.stroke(); }
  // charging handle (recoils)
  c.fillStyle = '#4c545f';
  c.fillRect(10, 134 + d.flash * 12, 16, 7);
  // ejection port
  c.fillStyle = '#0c0f13'; rr(c, -6, 136, 9, 20, 2); c.fill();
  // selector lever
  c.fillStyle = '#3d444e';
  c.beginPath(); c.moveTo(12, 150); c.lineTo(26, 146); c.lineTo(26, 154); c.lineTo(12, 157); c.closePath(); c.fill();

  // banana magazine
  c.save();
  c.translate(d.magDrop * 0.55, d.magDrop);
  c.globalAlpha = Math.max(0, 1 - d.magDrop / 75);
  const mg = c.createLinearGradient(0, 0, 50, 0);
  mg.addColorStop(0, '#2d3138'); mg.addColorStop(0.4, '#1d2127'); mg.addColorStop(1, '#0f1216');
  c.fillStyle = mg;
  c.beginPath();
  c.moveTo(11, 164); c.quadraticCurveTo(34, 160, 52, 144);
  c.lineTo(58, 168); c.quadraticCurveTo(36, 186, 11, 190);
  c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.16)'; c.lineWidth = 1.4; c.stroke();
  c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 1.2;
  for (let i = 0; i < 4; i++) {
    c.beginPath(); c.moveTo(16 + i * 10, 166 - i * 3); c.lineTo(20 + i * 10, 188 - i * 6); c.stroke();
  }
  c.restore();

  trigger(c, 190, '#1a1e24');
  // wooden pistol grip
  c.fillStyle = wood(c, 16, '#8a5a22', '#422a0d');
  c.beginPath();
  c.moveTo(9, 178); c.lineTo(34, 190); c.quadraticCurveTo(40, 198, 34, 212);
  c.lineTo(10, 198); c.closePath(); c.fill();
  grain(c, 10, 182, 24, 24, 3);
  // wooden stock
  c.fillStyle = wood(c, 16, '#9a6527', '#4a2d0f');
  c.beginPath();
  c.moveTo(-11, 180); c.lineTo(10, 184);
  c.quadraticCurveTo(22, 220, 20, 250); c.lineTo(-12, 246);
  c.closePath(); c.fill();
  grain(c, -10, 192, 28, 48, 6);
  c.fillStyle = '#15181d';
  c.beginPath(); c.moveTo(-12, 242); c.lineTo(20, 246); c.lineTo(19, 256); c.lineTo(-12, 252); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,225,170,0.18)'; c.fillRect(-11, 186, 3, 58);
  glow(c, 0, 8, 16, w.glow, 0.16 + d.flash * 0.7);
};

/* ================= 3. NAIL GUN — orange power tool ================= */
const nailgun: HeroDrawer = (c, w, d) => {
  flash(c, d.flash, 18, '#ffd9a0', 4);
  // nose piece
  c.fillStyle = tube(c, 7, '#4a5058', '#79838f', '#c2cad4');
  rr(c, -7, 0, 14, 34, 3); c.fill();
  c.fillStyle = '#20242a';
  c.beginPath(); c.moveTo(-5, 0); c.lineTo(5, 0); c.lineTo(3, 10); c.lineTo(-3, 10); c.closePath(); c.fill();
  // safety contact tip (compresses on fire)
  c.save();
  c.translate(0, d.flash * 5);
  c.strokeStyle = '#9aa4b0'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(-6, 6); c.lineTo(-10, 22); c.moveTo(6, 6); c.lineTo(10, 22); c.stroke();
  c.restore();
  // drive cylinder
  c.fillStyle = tube(c, 15, '#8a4a0c', '#cf7416', '#ffc06b');
  rr(c, -15, 28, 30, 62, 10); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.3)';
  for (let i = 0; i < 3; i++) { rr(c, -11, 36 + i * 16, 22, 7, 3); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,0.25)'; rr(c, -14, 34, 4, 50, 2); c.fill();
  // brand plate
  c.fillStyle = '#1b1f24'; rr(c, -8, 60, 16, 14, 2); c.fill();
  c.fillStyle = w.c2; c.font = '900 8px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('NG', 0, 67);
  // body shell
  c.fillStyle = tube(c, 14, '#7e4309', '#c06a12', '#ffb558');
  c.beginPath();
  c.moveTo(-14, 86); c.quadraticCurveTo(-17, 110, -13, 140);
  c.lineTo(13, 140); c.quadraticCurveTo(17, 110, 14, 86);
  c.closePath(); c.fill();
  // nail magazine (angled stick)
  c.save();
  c.translate(d.magDrop * 0.5, d.magDrop);
  c.globalAlpha = Math.max(0, 1 - d.magDrop / 70);
  c.fillStyle = '#2a2f36';
  c.beginPath();
  c.moveTo(10, 70); c.lineTo(48, 112); c.lineTo(40, 124); c.lineTo(6, 86);
  c.closePath(); c.fill();
  // nails inside
  c.strokeStyle = '#d7dee6'; c.lineWidth = 2;
  for (let i = 0; i < 7; i++) {
    const t = i / 7;
    c.beginPath();
    c.moveTo(14 + t * 30, 78 + t * 32); c.lineTo(20 + t * 30, 84 + t * 32);
    c.stroke();
  }
  c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(10, 72); c.lineTo(47, 113); c.stroke();
  c.restore();
  // air hose
  c.strokeStyle = '#2b3039'; c.lineWidth = 6; c.lineCap = 'round';
  c.beginPath();
  c.moveTo(-12, 130); c.quadraticCurveTo(-34 + Math.sin(d.t * 3) * 4, 158, -18, 186);
  c.stroke();
  c.strokeStyle = w.c2; c.lineWidth = 2;
  c.beginPath();
  c.moveTo(-12, 130); c.quadraticCurveTo(-34 + Math.sin(d.t * 3) * 4, 158, -18, 186);
  c.stroke();
  trigger(c, 150, '#1f242b');
  // rubber grip
  gripPanel(c, [[9, 132], [34, 146], [38, 160], [30, 184], [8, 168]], '#1f242b', 5);
  c.fillStyle = w.c2; c.globalAlpha = 0.5; c.fillRect(12, 140, 18, 3); c.globalAlpha = 1;
  glow(c, 0, 10, 14, w.glow, 0.15 + d.flash * 0.7);
};

/* ================= 4. CROSSBOW — tactical recurve ================= */
const crossbow: HeroDrawer = (c, w, d) => {
  const pull = 1 - Math.min(1, d.flash * 2.2);
  flash(c, d.flash, 16, '#ffeec0', 4);
  // limbs (recurve, carbon look)
  c.lineCap = 'round';
  for (const s of [-1, 1]) {
    c.save(); c.scale(s, 1);
    const lg = c.createLinearGradient(0, 0, 60, 40);
    lg.addColorStop(0, '#39414c'); lg.addColorStop(0.6, '#1d2228'); lg.addColorStop(1, '#4b545f');
    c.strokeStyle = lg; c.lineWidth = 9;
    c.beginPath(); c.moveTo(8, 36); c.quadraticCurveTo(34, 16, 54, 34); c.stroke();
    c.strokeStyle = w.c2; c.lineWidth = 2.4; c.globalAlpha = 0.6;
    c.beginPath(); c.moveTo(10, 34); c.quadraticCurveTo(34, 15, 52, 32); c.stroke();
    c.globalAlpha = 1;
    // cam wheel
    c.fillStyle = '#2b323b';
    c.beginPath(); c.arc(54, 34, 8, 0, TAU); c.fill();
    c.strokeStyle = '#6c7784'; c.lineWidth = 2;
    c.beginPath(); c.arc(54, 34, 5, 0, TAU); c.stroke();
    screw(c, 54, 34, 2);
    c.restore();
  }
  // riser
  c.fillStyle = tube(c, 14, '#161a1f', '#2d343d', '#707a86');
  c.beginPath();
  c.moveTo(-14, 28); c.lineTo(14, 28); c.lineTo(10, 54); c.lineTo(-10, 54);
  c.closePath(); c.fill();
  // string
  c.strokeStyle = '#d7dee6'; c.lineWidth = 2.2;
  c.beginPath();
  c.moveTo(-54, 34); c.lineTo(0, 46 + pull * 26); c.lineTo(54, 34);
  c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 4;
  c.beginPath(); c.moveTo(-6, 44 + pull * 26); c.lineTo(6, 44 + pull * 26); c.stroke();

  // loaded bolt
  c.globalAlpha = pull;
  c.fillStyle = '#c9d3dd';
  c.beginPath(); c.moveTo(0, 2); c.lineTo(5, 18); c.lineTo(-5, 18); c.closePath(); c.fill();
  c.fillStyle = '#2b3039'; c.fillRect(-2.2, 16, 4.4, 56);
  c.fillStyle = w.c2;
  c.beginPath(); c.moveTo(0, 62); c.lineTo(7, 76); c.lineTo(0, 72); c.lineTo(-7, 76); c.closePath(); c.fill();
  c.globalAlpha = 1;

  // rail / stock body
  c.fillStyle = tube(c, 13, '#1a1f25', '#333a44', '#78828f');
  rr(c, -13, 50, 26, 104, 5); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.42)'; rr(c, -4.5, 56, 9, 90, 3); c.fill();
  c.fillStyle = w.c2; c.globalAlpha = 0.5; c.fillRect(-13, 66, 3, 72); c.globalAlpha = 1;
  // rail teeth
  c.fillStyle = 'rgba(0,0,0,0.38)';
  for (let i = 0; i < 8; i++) c.fillRect(7, 62 + i * 10, 6, 4);
  // scope
  c.fillStyle = '#15181d'; c.fillRect(-18, 70, 6, 8); c.fillRect(-18, 104, 6, 8);
  c.fillStyle = tube(c, 8, '#14181d', '#272d35', '#5a646f');
  rr(c, -32, 58, 15, 62, 6); c.fill();
  c.fillStyle = '#343c47'; rr(c, -36, 52, 21, 18, 4); c.fill();
  c.fillStyle = '#9fd8ff'; c.fillRect(-35, 51, 19, 3.4);
  glow(c, -25, 55, 14, w.glow, 0.8);
  // quiver of spare bolts
  c.save();
  c.translate(d.magDrop * 0.4, d.magDrop);
  c.globalAlpha = Math.max(0, 1 - d.magDrop / 70);
  c.fillStyle = '#242a32'; rr(c, 13, 86, 16, 46, 4); c.fill();
  c.fillStyle = w.c2;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(17 + i * 5, 92, 2.4, 0, TAU); c.fill(); }
  c.restore();
  trigger(c, 142, '#171b21');
  gripPanel(c, [[9, 126], [34, 140], [38, 154], [30, 178], [8, 162]], '#242a32', 4);
  // butt stock
  c.fillStyle = tube(c, 14, '#1a1f25', '#333a44', '#6b7581');
  c.beginPath();
  c.moveTo(-12, 150); c.lineTo(8, 150); c.lineTo(16, 206); c.lineTo(2, 206);
  c.lineTo(-2, 172); c.lineTo(-12, 172); c.closePath(); c.fill();
  c.fillStyle = '#12161b'; c.fillRect(0, 200, 18, 9);
};

/* ================= 5. KETAPEL — handcrafted slingshot ================= */
const ketapel: HeroDrawer = (c, w, d) => {
  const pull = 1 - Math.min(1, d.flash * 2.2);
  // Y-shaped wooden fork
  const forkG = wood(c, 14, '#a87442', '#4e2f14');
  c.strokeStyle = forkG as unknown as string;
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.fillStyle = forkG;
  // left prong
  c.beginPath();
  c.moveTo(-6, 76); c.quadraticCurveTo(-24, 50, -30, 12);
  c.lineTo(-18, 10); c.quadraticCurveTo(-14, 46, 2, 72);
  c.closePath(); c.fill();
  // right prong
  c.beginPath();
  c.moveTo(6, 76); c.quadraticCurveTo(24, 50, 30, 12);
  c.lineTo(18, 10); c.quadraticCurveTo(14, 46, -2, 72);
  c.closePath(); c.fill();
  // handle
  c.beginPath();
  c.moveTo(-9, 70); c.quadraticCurveTo(-11, 110, -8, 140);
  c.lineTo(8, 140); c.quadraticCurveTo(11, 110, 9, 70);
  c.closePath(); c.fill();
  grain(c, -9, 78, 18, 56, 7);
  // prong tips wrapped in cord
  for (const s of [-1, 1]) {
    c.save(); c.scale(s, 1);
    c.strokeStyle = '#e0cfa6'; c.lineWidth = 2.2;
    for (let i = 0; i < 5; i++) {
      c.beginPath(); c.moveTo(16, 12 + i * 4); c.lineTo(31, 10 + i * 4); c.stroke();
    }
    c.restore();
  }
  // batik-style wrap on handle
  c.strokeStyle = w.c2; c.lineWidth = 3;
  for (let i = 0; i < 6; i++) {
    c.beginPath(); c.moveTo(-9, 92 + i * 8); c.lineTo(9, 96 + i * 8); c.stroke();
  }
  c.strokeStyle = 'rgba(255,245,220,0.5)'; c.lineWidth = 1.2;
  for (let i = 0; i < 6; i++) {
    c.beginPath(); c.moveTo(-9, 95 + i * 8); c.lineTo(9, 99 + i * 8); c.stroke();
  }
  // rubber bands
  const py = 30 + pull * 34;
  c.strokeStyle = '#2f3237'; c.lineWidth = 5;
  c.beginPath(); c.moveTo(-24, 11); c.quadraticCurveTo(-14, py * 0.7, -7, py); c.stroke();
  c.beginPath(); c.moveTo(24, 11); c.quadraticCurveTo(14, py * 0.7, 7, py); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(-24, 10); c.quadraticCurveTo(-14, py * 0.7 - 1, -7, py - 1); c.stroke();
  // leather pouch
  c.fillStyle = '#6b4a2a';
  c.beginPath();
  c.moveTo(-8, py - 7); c.quadraticCurveTo(0, py + 10, 8, py - 7);
  c.quadraticCurveTo(0, py - 2, -8, py - 7);
  c.closePath(); c.fill();
  // loaded stone
  c.globalAlpha = pull;
  const sg = c.createRadialGradient(-2, py - 6, 1, 0, py - 3, 9);
  sg.addColorStop(0, '#b9bfc6'); sg.addColorStop(1, '#5d646d');
  c.fillStyle = sg;
  c.beginPath();
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * TAU; const r = 8 + Math.sin(i * 3) * 1.6;
    i ? c.lineTo(Math.cos(a) * r, py - 3 + Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, py - 3 + Math.sin(a) * r);
  }
  c.closePath(); c.fill();
  c.globalAlpha = 1;
  // pouch of ammo stones hanging
  c.save();
  c.translate(d.magDrop * 0.3, d.magDrop);
  c.globalAlpha = Math.max(0, 1 - d.magDrop / 60);
  c.strokeStyle = '#8a7a5a'; c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(9, 104); c.lineTo(20, 110); c.stroke();
  c.fillStyle = '#7a6440';
  c.beginPath(); c.ellipse(24, 122, 12, 14, 0.2, 0, TAU); c.fill();
  c.fillStyle = '#5d646d';
  c.beginPath(); c.arc(21, 118, 3.4, 0, TAU); c.fill();
  c.beginPath(); c.arc(28, 124, 3, 0, TAU); c.fill();
  c.restore();
  // pommel
  c.fillStyle = '#4e2f14';
  rr(c, -10, 136, 20, 12, 5); c.fill();
  glow(c, 0, py - 3, 16, w.glow, 0.12 + d.flash * 0.5);
};

/* ================= 6. SUMPIT DAYAK — ornate blowpipe ================= */
const sumpit: HeroDrawer = (c, w, d) => {
  flash(c, d.flash, 13, '#d9ffb0', 4);
  // long bamboo pipe
  const bg = c.createLinearGradient(-8, 0, 8, 0);
  bg.addColorStop(0, '#9fcf6a'); bg.addColorStop(0.3, '#71a844'); bg.addColorStop(0.75, '#355c1f'); bg.addColorStop(1, '#4e7a2c');
  c.fillStyle = bg;
  rr(c, -7.5, 0, 15, 214, 7); c.fill();
  // bamboo nodes
  for (let i = 0; i < 5; i++) {
    const y = 26 + i * 40;
    c.fillStyle = '#2f5219';
    rr(c, -8.5, y, 17, 6, 3); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.18)';
    c.fillRect(-8, y + 1, 17, 1.6);
  }
  c.fillStyle = 'rgba(255,255,255,0.2)'; c.fillRect(-6.5, 8, 3, 200);
  // mouthpiece
  c.fillStyle = '#3c2a16';
  c.beginPath();
  c.moveTo(-11, 198); c.lineTo(11, 198); c.lineTo(9, 228); c.lineTo(-9, 228);
  c.closePath(); c.fill();
  c.strokeStyle = '#e0cfa6'; c.lineWidth = 2;
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-10, 202 + i * 7); c.lineTo(10, 202 + i * 7); c.stroke(); }
  // muzzle spear tip (traditional sumpit has a blade)
  c.fillStyle = '#c3ccd6';
  c.beginPath(); c.moveTo(0, -24); c.lineTo(5, -4); c.lineTo(-5, -4); c.closePath(); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.25)';
  c.beginPath(); c.moveTo(0, -22); c.lineTo(4, -5); c.lineTo(0, -5); c.closePath(); c.fill();
  c.strokeStyle = '#b9433a'; c.lineWidth = 2.4;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-6, -2 + i * 4); c.lineTo(6, -2 + i * 4); c.stroke(); }
  // carved dayak motifs
  c.strokeStyle = 'rgba(245,235,200,0.65)'; c.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) {
    const y = 50 + i * 40;
    c.beginPath();
    c.moveTo(-5, y); c.quadraticCurveTo(0, y + 6, 5, y);
    c.quadraticCurveTo(0, y + 12, -5, y + 18);
    c.stroke();
  }
  // hornbill feather charm
  c.save();
  c.translate(9, 96);
  c.rotate(Math.sin(d.t * 2.2) * 0.25);
  c.strokeStyle = 'rgba(230,220,200,0.6)'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 12); c.stroke();
  c.fillStyle = '#e8e3d6';
  c.beginPath(); c.ellipse(0, 22, 4.4, 11, 0, 0, TAU); c.fill();
  c.fillStyle = '#b9433a';
  c.beginPath(); c.ellipse(0, 26, 3, 6, 0, 0, TAU); c.fill();
  c.strokeStyle = '#6b6354'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(0, 12); c.lineTo(0, 32); c.stroke();
  c.restore();
  // dart quiver strapped on
  c.save();
  c.translate(d.magDrop * 0.35, d.magDrop);
  c.globalAlpha = Math.max(0, 1 - d.magDrop / 65);
  c.fillStyle = '#4e7a2c'; rr(c, 10, 130, 15, 52, 6); c.fill();
  c.strokeStyle = '#e0cfa6'; c.lineWidth = 1.8;
  c.beginPath(); c.moveTo(9, 140); c.lineTo(26, 140); c.moveTo(9, 172); c.lineTo(26, 172); c.stroke();
  c.strokeStyle = '#2f3237'; c.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(13 + i * 3, 126); c.lineTo(13 + i * 3, 134); c.stroke(); }
  c.restore();
  glow(c, 0, -6, 11, w.glow, 0.12 + d.flash * 0.6);
};

/* ================= 7. SHOTGUN — pump action ================= */
const shotgun: HeroDrawer = (c, w, d) => {
  flash(c, d.flash, 46, '#ffb066', 7);
  const slide = d.flash * 17;
  // barrel + mag tube
  c.fillStyle = tube(c, 9, '#15181d', '#2c323a', '#737d89');
  rr(c, -9, 0, 18, 96, 4); c.fill();
  c.fillStyle = tube(c, 6, '#13161a', '#262c33', '#5e6873');
  rr(c, 5, 10, 12, 80, 5); c.fill();
  c.fillStyle = '#0b0d10';
  c.beginPath(); c.ellipse(0, 3, 6, 3.6, 0, 0, TAU); c.fill();
  c.strokeStyle = '#8d98a4'; c.lineWidth = 1.4; c.stroke();
  // heat shield
  c.fillStyle = '#1d2229';
  rr(c, -11, 18, 9, 62, 3); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.5)';
  for (let i = 0; i < 6; i++) { rr(c, -10, 22 + i * 10, 7, 5, 2); c.fill(); }
  // bead sight
  c.fillStyle = w.c2; c.beginPath(); c.arc(-7, 9, 2.6, 0, TAU); c.fill();
  glow(c, -7, 9, 9, w.glow, 0.7);

  // pump fore-end (wood, slides)
  c.save();
  c.translate(0, 42 + slide);
  c.fillStyle = wood(c, 14, '#b07a35', '#5a3714');
  c.beginPath();
  c.moveTo(-14, 0); c.quadraticCurveTo(-16, 22, -13, 46);
  c.lineTo(13, 46); c.quadraticCurveTo(16, 22, 14, 0);
  c.closePath(); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1.8;
  for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(-13, 5 + i * 6); c.lineTo(13, 5 + i * 6); c.stroke(); }
  c.fillStyle = 'rgba(255,225,170,0.22)'; c.fillRect(-13, 4, 3.4, 38);
  c.restore();

  // receiver
  c.fillStyle = tube(c, 15, '#171b20', '#30373f', '#79838f');
  rr(c, -15, 98, 30, 56, 4); c.fill();
  c.fillStyle = '#0c0f13'; rr(c, -4, 110, 11, 22, 2); c.fill();
  c.fillStyle = '#c9a24a'; c.fillRect(-2, 116 + d.flash * 8, 6, 12);
  screw(c, -11, 106, 2.4); screw(c, -11, 146, 2.4);
  c.fillStyle = w.c2; c.globalAlpha = 0.55; c.fillRect(-15, 104, 3.4, 44); c.globalAlpha = 1;
  // shell side saddle
  c.save();
  c.translate(d.magDrop * 0.4, d.magDrop);
  c.globalAlpha = Math.max(0, 1 - d.magDrop / 70);
  c.fillStyle = '#20252c'; rr(c, 13, 96, 20, 58, 3); c.fill();
  for (let i = 0; i < 4; i++) {
    const yy = 100 + i * 14;
    c.fillStyle = '#b4302f'; rr(c, 15, yy, 17, 11, 2.5); c.fill();
    c.fillStyle = '#d9b04a'; rr(c, 15, yy, 6, 11, 2); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(15, yy, 17, 2);
  }
  c.restore();
  trigger(c, 134, '#171b21');
  // wooden grip + stock
  c.fillStyle = wood(c, 16, '#a9742f', '#4e2f11');
  c.beginPath();
  c.moveTo(9, 140); c.lineTo(32, 152); c.quadraticCurveTo(38, 160, 32, 174);
  c.lineTo(9, 160); c.closePath(); c.fill();
  grain(c, 10, 144, 22, 22, 3);
  c.fillStyle = wood(c, 16, '#b07a35', '#5a3714');
  c.beginPath();
  c.moveTo(-13, 150); c.lineTo(9, 154); c.quadraticCurveTo(22, 190, 20, 222);
  c.lineTo(-14, 218); c.closePath(); c.fill();
  grain(c, -12, 164, 30, 46, 6);
  c.fillStyle = '#15181d';
  c.beginPath(); c.moveTo(-14, 214); c.lineTo(20, 218); c.lineTo(19, 230); c.lineTo(-14, 226); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,230,180,0.2)'; c.fillRect(-12, 158, 3.4, 56);
};

/* ================= 8. SUPER SOAKER — water blaster ================= */
const soaker: HeroDrawer = (c, w, d) => {
  const pulse = 0.5 + 0.5 * Math.sin(d.t * 6);
  flash(c, d.flash, 20, '#8ee6ff', 5);
  // nozzle cluster
  c.fillStyle = tube(c, 12, '#0d5a8e', '#1d8ad1', '#7fd4ff');
  rr(c, -12, 0, 24, 26, 8); c.fill();
  c.fillStyle = '#073b60';
  c.beginPath(); c.arc(0, 10, 6, 0, TAU); c.fill();
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU + 0.4;
    c.beginPath(); c.arc(Math.cos(a) * 8, 10 + Math.sin(a) * 8, 2.2, 0, TAU); c.fill();
  }
  c.fillStyle = w.c2;
  c.beginPath(); c.arc(0, 10, 3, 0, TAU); c.fill();
  glow(c, 0, 10, 20, w.glow, 0.35 + d.flash * 0.6);
  // barrel
  c.fillStyle = tube(c, 9, '#0d5a8e', '#1f93dd', '#8fdcff');
  rr(c, -9, 22, 18, 50, 6); c.fill();
  c.fillStyle = w.c2; c.globalAlpha = 0.8;
  for (let i = 0; i < 3; i++) { rr(c, -9, 30 + i * 13, 18, 4, 2); c.fill(); }
  c.globalAlpha = 1;
  // water tank (transparent, sloshing)
  c.save();
  c.translate(0, 68);
  c.fillStyle = 'rgba(190,235,255,0.35)';
  rr(c, -20, 0, 40, 56, 14); c.fill();
  c.save();
  c.beginPath(); c.roundRect(-20, 0, 40, 56, 14); c.clip();
  const lvl = 20 + Math.sin(d.t * 2.4) * 3 + d.magDrop * 0.4;
  const wg = c.createLinearGradient(0, lvl, 0, 56);
  wg.addColorStop(0, '#5ec8ff'); wg.addColorStop(1, '#0e6fb5');
  c.fillStyle = wg;
  c.beginPath();
  c.moveTo(-20, lvl);
  c.quadraticCurveTo(-8, lvl - 4 + Math.sin(d.t * 5) * 3, 0, lvl);
  c.quadraticCurveTo(10, lvl + 4, 20, lvl - 1);
  c.lineTo(20, 56); c.lineTo(-20, 56); c.closePath(); c.fill();
  // bubbles
  for (let i = 0; i < 5; i++) {
    const by = 54 - ((d.t * 20 + i * 18) % (52 - lvl));
    c.fillStyle = 'rgba(255,255,255,0.5)';
    c.beginPath(); c.arc(-12 + i * 6, by, 1.8 + (i % 2), 0, TAU); c.fill();
  }
  c.restore();
  c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 2;
  rr(c, -20, 0, 40, 56, 14); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.5)';
  rr(c, -16, 6, 5, 40, 3); c.fill();
  // cap
  c.fillStyle = w.c2; rr(c, -9, -6, 18, 10, 4); c.fill();
  c.restore();
  // pressure pump handle
  c.save();
  c.translate(0, 126 - d.flash * 6);
  c.fillStyle = '#ffd93d'; rr(c, -14, 0, 28, 14, 7); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.2)'; rr(c, -9, 4, 18, 6, 3); c.fill();
  c.restore();
  // body
  c.fillStyle = tube(c, 15, '#0d5a8e', '#1d8ad1', '#79d1ff');
  c.beginPath();
  c.moveTo(-15, 138); c.quadraticCurveTo(-18, 160, -14, 184);
  c.lineTo(14, 184); c.quadraticCurveTo(18, 160, 15, 138);
  c.closePath(); c.fill();
  c.fillStyle = w.c2; c.globalAlpha = 0.5 + pulse * 0.3;
  rr(c, -8, 146, 16, 6, 3); c.fill();
  c.globalAlpha = 1;
  trigger(c, 178, '#0a4a76');
  gripPanel(c, [[9, 160], [33, 174], [37, 188], [29, 212], [8, 196]], '#ffd93d', 4);
};

/* ================= 9. SNOWBALL CANNON — frosty launcher ================= */
const snowball: HeroDrawer = (c, w, d) => {
  const pulse = 0.5 + 0.5 * Math.sin(d.t * 3);
  flash(c, d.flash, 36, '#dff6ff', 6);
  // icy muzzle with frost crystals
  c.fillStyle = tube(c, 22, '#7fb2cf', '#b9ddee', '#f2ffff');
  c.beginPath();
  c.moveTo(-22, 6); c.lineTo(22, 6); c.lineTo(16, 48); c.lineTo(-16, 48);
  c.closePath(); c.fill();
  c.fillStyle = '#2d5c78';
  c.beginPath(); c.ellipse(0, 7, 21, 6.5, 0, 0, TAU); c.fill();
  c.fillStyle = 'rgba(220,245,255,0.55)';
  c.beginPath(); c.ellipse(0, 7, 15, 4.4, 0, 0, TAU); c.fill();
  // frost spikes around the rim
  c.fillStyle = '#eaffff';
  for (let i = -3; i <= 3; i++) {
    const h = 10 + Math.abs(3 - Math.abs(i)) * 5;
    c.beginPath();
    c.moveTo(i * 6.2 - 2.6, 8); c.lineTo(i * 6.2, 8 - h); c.lineTo(i * 6.2 + 2.6, 8);
    c.closePath(); c.fill();
  }
  glow(c, 0, 12, 34, '#9fe4ff', 0.35 + d.flash * 0.5);
  // barrel with snow caking
  c.fillStyle = tube(c, 15, '#4f7f9c', '#86b7d1', '#d6f1ff');
  rr(c, -15, 44, 30, 56, 6); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.8)';
  c.beginPath();
  c.moveTo(-15, 58); c.quadraticCurveTo(-6, 50, 2, 58);
  c.quadraticCurveTo(9, 64, 15, 56); c.lineTo(15, 70);
  c.quadraticCurveTo(0, 76, -15, 70); c.closePath(); c.fill();
  // snow hopper (dome full of snowballs)
  c.save();
  c.translate(0, 96);
  c.fillStyle = 'rgba(210,240,255,0.42)';
  c.beginPath(); c.arc(0, 18, 24, Math.PI, 0); c.lineTo(24, 40); c.lineTo(-24, 40); c.closePath(); c.fill();
  c.save();
  c.beginPath(); c.arc(0, 18, 23, Math.PI, 0); c.lineTo(23, 40); c.lineTo(-23, 40); c.closePath(); c.clip();
  const balls: [number, number, number][] = [[-11, 28, 9], [3, 30, 10], [14, 27, 8], [-4, 14, 9], [9, 13, 7]];
  for (const [bx, by, br] of balls) {
    const g = c.createRadialGradient(bx - br * 0.3, by - br * 0.4, 1, bx, by, br);
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#a9cfe3');
    c.fillStyle = g;
    c.beginPath(); c.arc(bx, by + Math.sin(d.t * 2 + bx) * 1.2 + d.magDrop * 0.3, br, 0, TAU); c.fill();
  }
  c.restore();
  c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 2;
  c.beginPath(); c.arc(0, 18, 23, Math.PI, 0); c.stroke();
  c.restore();
  // body
  c.fillStyle = tube(c, 15, '#3c6782', '#6ba3c2', '#c2e9ff');
  rr(c, -15, 134, 30, 50, 8); c.fill();
  c.fillStyle = '#eaffff'; c.globalAlpha = 0.45 + pulse * 0.3;
  for (let i = 0; i < 3; i++) { rr(c, -10, 140 + i * 13, 20, 5, 2.5); c.fill(); }
  c.globalAlpha = 1;
  // snowman charm
  c.save();
  c.translate(-19, 120);
  c.rotate(Math.sin(d.t * 2) * 0.2);
  c.fillStyle = '#fff';
  c.beginPath(); c.arc(0, 6, 6, 0, TAU); c.fill();
  c.beginPath(); c.arc(0, -3, 4.4, 0, TAU); c.fill();
  c.fillStyle = '#e8873c';
  c.beginPath(); c.moveTo(-4, -3); c.lineTo(-9, -2); c.lineTo(-4, -1); c.closePath(); c.fill();
  c.fillStyle = '#243040';
  c.beginPath(); c.arc(-1.6, -4.4, 0.9, 0, TAU); c.fill();
  c.beginPath(); c.arc(1.4, -4.4, 0.9, 0, TAU); c.fill();
  c.fillRect(-5, -8.4, 10, 2.4);
  c.restore();
  trigger(c, 178, '#2d4a5e');
  gripPanel(c, [[9, 160], [33, 174], [37, 188], [29, 212], [8, 196]], '#2d4a5e', 4);
  // falling frost motes
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 5; i++) {
    const p = (d.t * 0.35 + i / 5) % 1;
    c.globalAlpha = (1 - p) * 0.6;
    c.fillStyle = i % 2 ? '#eaffff' : w.glow;
    c.fillRect(Math.sin(i * 2.3) * 22 - 1.3, 20 + p * 140, 2.6, 2.6);
  }
  c.restore();
};

/* ================= 10. HONEY BLASTER — sticky hive gun ================= */
const honey: HeroDrawer = (c, w, d) => {
  const pulse = 0.5 + 0.5 * Math.sin(d.t * 3);
  flash(c, d.flash, 26, '#ffd98a', 5);
  // dripping nozzle
  c.fillStyle = tube(c, 13, '#7a4b12', '#c98c1c', '#ffd77a');
  c.beginPath();
  c.moveTo(-13, 8); c.lineTo(13, 8); c.lineTo(9, 40); c.lineTo(-9, 40);
  c.closePath(); c.fill();
  c.fillStyle = '#5a360b';
  c.beginPath(); c.ellipse(0, 9, 12, 4.4, 0, 0, TAU); c.fill();
  // honey drip that stretches
  const drip = 6 + pulse * 9;
  const hg = c.createLinearGradient(0, 8, 0, 8 + drip + 8);
  hg.addColorStop(0, '#ffd24d'); hg.addColorStop(1, '#e09c12');
  c.fillStyle = hg;
  c.beginPath();
  c.moveTo(-4, 8);
  c.quadraticCurveTo(-3, 8 + drip, 0, 8 + drip + 7);
  c.quadraticCurveTo(3, 8 + drip, 4, 8);
  c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.45)';
  c.beginPath(); c.ellipse(-1.6, 8 + drip * 0.5, 1.1, drip * 0.3, 0, 0, TAU); c.fill();
  glow(c, 0, 14, 20, w.glow, 0.25 + d.flash * 0.6);

  // honeycomb barrel
  c.fillStyle = tube(c, 15, '#7a4b12', '#c4871a', '#ffcf5f');
  rr(c, -15, 36, 30, 58, 7); c.fill();
  c.save();
  c.beginPath(); c.roundRect(-15, 36, 30, 58, 7); c.clip();
  c.strokeStyle = 'rgba(90,54,11,0.55)'; c.lineWidth = 1.8;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      const hx = -11 + col * 11 + (row % 2) * 5.5;
      const hy = 42 + row * 11;
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + Math.PI / 6;
        const px = hx + Math.cos(a) * 6, py = hy + Math.sin(a) * 6;
        i ? c.lineTo(px, py) : c.moveTo(px, py);
      }
      c.closePath(); c.stroke();
    }
  }
  c.restore();

  // honey tank (gooey, with floating bubbles)
  c.save();
  c.translate(0, 92);
  c.fillStyle = 'rgba(255,220,150,0.35)';
  rr(c, -19, 0, 38, 54, 16); c.fill();
  c.save();
  c.beginPath(); c.roundRect(-19, 0, 38, 54, 16); c.clip();
  const lvl = 16 + Math.sin(d.t * 1.6) * 2.5 + d.magDrop * 0.35;
  const tg = c.createLinearGradient(0, lvl, 0, 54);
  tg.addColorStop(0, '#ffcf4d'); tg.addColorStop(1, '#b4700c');
  c.fillStyle = tg;
  c.beginPath();
  c.moveTo(-19, lvl);
  c.quadraticCurveTo(-7, lvl - 3 + Math.sin(d.t * 3) * 2.4, 0, lvl + 1);
  c.quadraticCurveTo(9, lvl + 4, 19, lvl);
  c.lineTo(19, 54); c.lineTo(-19, 54); c.closePath(); c.fill();
  for (let i = 0; i < 4; i++) {
    const by = 50 - ((d.t * 12 + i * 15) % (48 - lvl));
    c.fillStyle = 'rgba(255,245,200,0.55)';
    c.beginPath(); c.arc(-10 + i * 7, by, 2.2 + (i % 2) * 0.8, 0, TAU); c.fill();
  }
  c.restore();
  c.strokeStyle = 'rgba(255,240,200,0.6)'; c.lineWidth = 2;
  rr(c, -19, 0, 38, 54, 16); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.45)'; rr(c, -15, 6, 5, 38, 3); c.fill();
  c.fillStyle = '#7a4b12'; rr(c, -9, -7, 18, 10, 4); c.fill();
  c.restore();

  // bee buzzing around the gun
  const ba = d.t * 2.2;
  const bx = Math.cos(ba) * 30, by = 100 + Math.sin(ba * 1.7) * 26;
  c.save();
  c.translate(bx, by);
  c.rotate(Math.sin(ba * 3) * 0.4);
  c.fillStyle = 'rgba(255,255,255,0.55)';
  c.beginPath(); c.ellipse(-3, -3, 5, 2.6, -0.5, 0, TAU); c.fill();
  c.beginPath(); c.ellipse(3, -3, 5, 2.6, 0.5, 0, TAU); c.fill();
  c.fillStyle = '#f6c445';
  c.beginPath(); c.ellipse(0, 0, 5, 3.6, 0, 0, TAU); c.fill();
  c.fillStyle = '#1f2937';
  c.fillRect(-1.6, -3.4, 1.6, 7); c.fillRect(1.6, -3.4, 1.6, 7);
  c.restore();

  // body + grip
  c.fillStyle = tube(c, 14, '#6b4110', '#b67b16', '#ffc859');
  c.beginPath();
  c.moveTo(-14, 148); c.quadraticCurveTo(-17, 168, -13, 190);
  c.lineTo(13, 190); c.quadraticCurveTo(17, 168, 14, 148);
  c.closePath(); c.fill();
  c.fillStyle = w.c2; c.globalAlpha = 0.5;
  rr(c, -8, 154, 16, 6, 3); c.fill();
  c.globalAlpha = 1;
  trigger(c, 184, '#5a360b');
  gripPanel(c, [[9, 166], [33, 180], [37, 194], [29, 218], [8, 202]], '#5a360b', 4);
  // honey drips on the grip
  c.fillStyle = 'rgba(255,200,70,0.75)';
  for (let i = 0; i < 3; i++) {
    const dx = 14 + i * 8, dy = 186 + i * 5;
    c.beginPath();
    c.moveTo(dx - 2.6, dy); c.quadraticCurveTo(dx, dy + 11 + Math.sin(d.t * 2 + i) * 2.4, dx + 2.6, dy);
    c.closePath(); c.fill();
  }
};

export const HERO_GUNS: Record<string, HeroDrawer> = {
  pistol, ak47, nailgun, crossbow, ketapel, sumpit, shotgun, soaker, snowball, honey,
};

/** overridden barrel lengths so the muzzle lines up with the art */
export const HERO_LEN: Record<string, number> = {
  pistol: 150, ak47: 256, nailgun: 190, crossbow: 210, ketapel: 150,
  sumpit: 230, shotgun: 232, soaker: 214, snowball: 190, honey: 196,
};
