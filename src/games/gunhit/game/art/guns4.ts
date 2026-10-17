import type { WeaponId } from '../weapons';
import { TAU, rand, lin, steel, chrome, wood, brass, rr, grip, guard, glow, jag, star, radial, gunState } from './kit';
import { shotPulse } from './commonGunMotion';

import { drawGunExtra3, FLASH3 } from './guns5';
export { FLASH3 };

type C = CanvasRenderingContext2D;

// ------------------------------------------------------------- HONEY
/** The visible hand-pump surges after a shot without modifying ammo/reload. */
export function honeyPumpPulse(sinceShot: number): number {
  return sinceShot >= 0 && sinceShot < 0.28
    ? Math.sin(Math.PI * sinceShot / 0.28) : 0;
}

function honey(c: C, cx: number, y0: number, t: number) {
  // A brass pump and a glass reservoir: the amber liquid is the ammunition.
  const pulse = Math.sin(t * 3);
  const pump = honeyPumpPulse(gunState.sinceShot);
  c.lineCap = 'round';
  c.strokeStyle = '#4b260c'; c.lineWidth = 9;
  c.beginPath(); c.moveTo(cx + 18, y0 + 107);
  c.bezierCurveTo(cx + 40, y0 + 107, cx + 37, y0 + 34, cx + 9, y0 + 30); c.stroke();
  c.strokeStyle = '#e3a945'; c.lineWidth = 4 + pump * 1.5;
  c.beginPath(); c.moveTo(cx + 18, y0 + 107);
  c.bezierCurveTo(cx + 40, y0 + 107, cx + 37, y0 + 34, cx + 9, y0 + 30); c.stroke();

  // Thin translucent bee wings stand BEHIND the armor. Their arched golden
  // veins make the honey tank read as a bee-themed blaster, not a plain jar.
  for (const side of [-1, 1]) {
    const wing = c.createLinearGradient(cx + side * 22, y0 + 40,
      cx + side * 58, y0 + 103);
    wing.addColorStop(0, 'rgba(255,250,197,0.8)');
    wing.addColorStop(0.5, 'rgba(247,186,67,0.43)');
    wing.addColorStop(1, 'rgba(153,77,17,0.69)');
    c.fillStyle = wing; c.beginPath(); c.moveTo(cx + side * 20, y0 + 51);
    c.quadraticCurveTo(cx + side * 38, y0 + 26, cx + side * 55, y0 + 26);
    c.quadraticCurveTo(cx + side * 64, y0 + 49, cx + side * 52, y0 + 76);
    c.quadraticCurveTo(cx + side * 65, y0 + 104, cx + side * 43, y0 + 116);
    c.quadraticCurveTo(cx + side * 28, y0 + 104, cx + side * 20, y0 + 51);
    c.closePath(); c.fill();
    c.strokeStyle = '#b97928'; c.lineWidth = 2; c.stroke();
    c.strokeStyle = 'rgba(255,251,219,0.81)'; c.lineWidth = 1.5;
    for (const [x, y] of [[55, 26], [52, 76], [43, 116]]) {
      c.beginPath(); c.moveTo(cx + side * 22, y0 + 56);
      c.quadraticCurveTo(cx + side * 40, y0 + (y + 56) * 0.5,
        cx + side * x, y0 + y); c.stroke();
    }
  }

  // Real angled stock, checkered grip and exposed trigger. The flask above
  // is ammunition; this bronze-and-cork assembly is what the player holds.
  c.beginPath(); c.moveTo(cx + 6, y0 + 115);
  c.quadraticCurveTo(cx + 31, y0 + 112, cx + 41, y0 + 127);
  c.lineTo(cx + 63, y0 + 174);
  c.quadraticCurveTo(cx + 56, y0 + 189, cx + 44, y0 + 182);
  c.lineTo(cx + 14, y0 + 150); c.lineTo(cx + 5, y0 + 137); c.closePath();
  c.fillStyle = lin(c, cx + 7, cx + 65,
    ['#462410', '#ad742c', '#ffdc83', '#945214', '#49250f']);
  c.fill(); c.strokeStyle = '#46260d'; c.lineWidth = 2.2; c.stroke();
  c.beginPath(); c.moveTo(cx + 21, y0 + 131);
  c.lineTo(cx + 37, y0 + 134); c.lineTo(cx + 55, y0 + 170);
  c.quadraticCurveTo(cx + 53, y0 + 178, cx + 46, y0 + 177);
  c.lineTo(cx + 19, y0 + 144); c.closePath();
  c.fillStyle = lin(c, cx + 18, cx + 56, ['#663719', '#d8a253', '#683718']);
  c.fill(); c.strokeStyle = '#f3cb78'; c.lineWidth = 1.2; c.stroke();
  c.strokeStyle = 'rgba(74,40,17,0.64)'; c.lineWidth = 1.1;
  for (let i = 0; i < 5; i++) {
    c.beginPath(); c.moveTo(cx + 23 + i * 6, y0 + 139 + i * 7);
    c.lineTo(cx + 31 + i * 6, y0 + 136 + i * 7); c.stroke();
  }
  rr(c, cx + 44, y0 + 175, 17, 7, 3, brass(c, cx + 44, cx + 61), '#603412', 1);
  c.strokeStyle = '#e1af53'; c.lineWidth = 3.2; c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx - 13, y0 + 113);
  c.quadraticCurveTo(cx - 17, y0 + 139, cx + 1, y0 + 146);
  c.quadraticCurveTo(cx + 17, y0 + 148, cx + 19, y0 + 126); c.stroke();
  c.strokeStyle = '#583017'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(cx + 2, y0 + 127);
  c.quadraticCurveTo(cx + 7, y0 + 134, cx + 5, y0 + 140); c.stroke();
  for (const side of [-1, 1]) {
    c.fillStyle = lin(c, cx - 39, cx + 39, ['#7e420f', '#f8d67c', '#9a530e']);
    c.beginPath();
    c.moveTo(cx + side * 21, y0 + 50);
    c.lineTo(cx + side * 33, y0 + 60);
    c.lineTo(cx + side * 30, y0 + 107);
    c.lineTo(cx + side * 21, y0 + 117);
    c.closePath(); c.fill();
    c.strokeStyle = '#663710'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#fef0b2';
    for (const yy of [68, 83, 98]) {
      c.beginPath(); c.arc(cx + side * 27, y0 + yy, 1.3, 0, TAU); c.fill();
    }
  }

  rr(c, cx - 24, y0 + 40, 48, 82, 11, '#683814', '#f4ca75', 2);
  c.save();
  c.beginPath(); c.roundRect(cx - 20, y0 + 44, 40, 74, 8); c.clip();
  c.fillStyle = '#40210f'; c.fillRect(cx - 20, y0 + 44, 40, 74);
  const level = y0 + 59 + pulse * 2;
  const liquid = c.createLinearGradient(cx - 18, level, cx + 22, y0 + 118);
  liquid.addColorStop(0, '#fff2a3'); liquid.addColorStop(0.3, '#fbc02d');
  liquid.addColorStop(0.73, '#d17b10'); liquid.addColorStop(1, '#85430e');
  c.fillStyle = liquid;
  c.beginPath(); c.moveTo(cx - 20, level);
  c.quadraticCurveTo(cx, level - 5, cx + 20, level + 2);
  c.lineTo(cx + 20, y0 + 119); c.lineTo(cx - 20, y0 + 119); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,248,188,0.86)'; c.lineWidth = 1.6;
  c.beginPath(); c.moveTo(cx - 17, level + 1); c.quadraticCurveTo(cx, level - 3, cx + 17, level + 2); c.stroke();
  // Honeycomb suspended inside the reservoir, rather than opaque stripes.
  c.strokeStyle = 'rgba(111,56,12,0.42)'; c.lineWidth = 1.2;
  for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
    const hx = cx - 12 + col * 12 + (row % 2) * 6, hy = y0 + 79 + row * 12;
    c.beginPath();
    for (let n = 0; n < 6; n++) {
      const angle = TAU * (n + 0.5) / 6;
      c.lineTo(hx + Math.cos(angle) * 6, hy + Math.sin(angle) * 6);
    }
    c.closePath(); c.stroke();
  }
  c.fillStyle = 'rgba(255,255,255,0.36)';
  c.beginPath(); c.ellipse(cx - 15, y0 + 70, 2.4, 22, 0.09, 0, TAU); c.fill();
  c.beginPath(); c.ellipse(cx + 13, y0 + 92, 1.4, 13, -0.1, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,250,210,0.78)';
  for (let i = 0; i < 2; i++) {
    const by = y0 + 110 - ((t * (9 + pump * 19) + i * 17) % 39);
    c.beginPath(); c.arc(cx - 11 + i * 16, by, 1.6 + pump, 0, TAU); c.fill();
  }
  c.restore();
  rr(c, cx - 23, y0 + 44, 46, 74, 9, 'rgba(255,223,139,0.10)', '#ffd885', 1.5);
  rr(c, cx - 28, y0 + 36, 56, 10, 3, brass(c, cx - 28, cx + 28), '#5c320f', 2);
  rr(c, cx - 28, y0 + 117, 56, 8, 3, brass(c, cx - 28, cx + 28), '#5c320f', 2);

  // Carved honeycomb seal and ribbed liquid nozzle.
  c.fillStyle = '#663213'; c.beginPath(); c.arc(cx, y0 + 92, 10, 0, TAU); c.fill();
  star(c, cx, y0 + 92, 7, '#ffe08b', 6);
  c.fillStyle = '#a4570d'; c.beginPath(); c.arc(cx, y0 + 92, 3.3, 0, TAU); c.fill();
  rr(c, cx - 9, y0 + 9, 18, 28, 4, brass(c, cx - 9, cx + 9), '#5c320f', 2);
  for (const yy of [14, 23, 32]) rr(c, cx - 11, y0 + yy, 22, 3, 1, '#693810', '#fcd77b', 0.7);
  rr(c, cx - 14, y0 + 2, 28, 9, 4, brass(c, cx - 14, cx + 14), '#5c320f', 1.5);
  c.fillStyle = '#7c3d0c'; c.beginPath(); c.ellipse(cx, y0 + 3, 7, 2.5, 0, 0, TAU); c.fill();
  const drop = (t * 0.7) % 1;
  c.fillStyle = '#ffd24f'; c.beginPath();
  c.ellipse(cx + 2, y0 - 4 - drop * 8, 2 + drop * 0.6, 3 + drop, 0, 0, TAU); c.fill();
  if (pump > 0.04) {
    c.save(); c.globalAlpha = pump; c.shadowColor = '#ffbe38'; c.shadowBlur = 15;
    c.fillStyle = '#ffe184'; c.beginPath();
    c.moveTo(cx - 5, y0 + 1); c.quadraticCurveTo(cx - 9, y0 - 8, cx, y0 - 19);
    c.quadraticCurveTo(cx + 9, y0 - 8, cx + 5, y0 + 1); c.fill();
    c.fillStyle = '#fff8cb'; c.beginPath(); c.ellipse(cx, y0 - 6, 2, 6, 0, 0, TAU); c.fill();
    c.restore();
  }
}

// ------------------------------------------------------------- COCONUT CANNON
function coconut(c: C, cx: number, y0: number, t: number, ready: boolean) {
  const recoil = shotPulse(gunState.sinceShot, 0.35);
  // palm-wood stock
  c.beginPath();
  c.moveTo(cx - 10, y0 + 150);
  c.lineTo(cx + 10, y0 + 150);
  c.lineTo(cx + 34, y0 + 218);
  c.lineTo(cx + 12, y0 + 222);
  c.closePath();
  c.fillStyle = lin(c, cx - 10, cx + 34, ['#57381b', '#a16a3a', '#57381b']);
  c.fill();
  c.strokeStyle = '#2b1a0a';
  c.lineWidth = 2;
  c.stroke();
  // bamboo tube
  rr(c, cx - 19, y0 + 20, 38, 140, 6, lin(c, cx - 19, cx + 19, ['#4d7c0f', '#bef264', '#84cc16', '#3f6212']), '#1a2e05');
  for (let i = 1; i < 4; i++) rr(c, cx - 20, y0 + 20 + i * 35, 40, 5, 2, '#3f6212');
  // palm leaves decor
  for (const s of [-1, 1]) {
    c.save();
    c.translate(cx + s * 18, y0 + 120);
    c.rotate(s * (0.8 + Math.sin(t * 2) * 0.05 + recoil * 0.32));
    c.fillStyle = '#16a34a';
    c.beginPath();
    c.moveTo(0, 0);
    c.quadraticCurveTo(s * 14, -18, s * 6, -40);
    c.quadraticCurveTo(s * 2, -18, 0, 0);
    c.fill();
    c.strokeStyle = '#14532d';
    c.lineWidth = 1;
    c.stroke();
    c.restore();
  }
  // hibiscus
  c.save();
  c.translate(cx + 16 + recoil * 4, y0 + 60 + recoil * 5);
  c.rotate(recoil * 0.22);
  for (let i = 0; i < 5; i++) {
    c.rotate(TAU / 5);
    c.fillStyle = '#ec4899';
    c.beginPath();
    c.ellipse(0, -5, 3.5, 5.5, 0, 0, TAU);
    c.fill();
  }
  c.fillStyle = '#fde047';
  c.beginPath();
  c.arc(0, 0, 2, 0, TAU);
  c.fill();
  c.restore();
  // mouth
  c.beginPath();
  c.ellipse(cx, y0 + 20, 17, 5, 0, 0, TAU);
  c.fillStyle = '#1a2e05';
  c.fill();
  if (ready) {
    c.beginPath();
    c.arc(cx, y0 + 10 + Math.sin(t * 2.8) * 1.2, 15, 0, TAU);
    c.fillStyle = radial(c, cx, y0 + 10, 15, ['#a3e635', '#65a30d', '#365314']);
    c.fill();
    c.strokeStyle = '#1a2e05';
    c.lineWidth = 1.5;
    c.stroke();
    c.fillStyle = '#f7fee7';
    c.beginPath();
    c.ellipse(cx, y0 - 1, 6, 3, 0, 0, TAU);
    c.fill();
    // straw
    c.strokeStyle = '#f43f5e';
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(cx + 2, y0);
    c.lineTo(cx + 10, y0 - 14);
    c.stroke();
  }
  if (recoil > 0.02) {
    c.strokeStyle = `rgba(217,249,157,${recoil * 0.72})`;
    c.lineWidth = 2;
    for (const side of [-1, 1]) {
      c.beginPath();
      c.arc(cx + side * 18, y0 + 12, 8 + recoil * 6,
        side < 0 ? 1.7 : -1.45, side < 0 ? 3.9 : 0.75);
      c.stroke();
    }
  }
}

// ------------------------------------------------------------- ANGKLUNG
function angklung(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 130, '#78350f', '#a16207', 0.75);
  guard(c, cx, y0 + 122, '#451a03');
  // frame
  const fr = (x: number, y: number, w: number, h: number) => rr(c, x, y, w, h, 2, lin(c, x, x + w, ['#78350f', '#d6a960', '#92400e']), '#422006', 1);
  fr(cx - 30, y0 + 10, 5, 140);
  fr(cx + 25, y0 + 10, 5, 140);
  fr(cx - 30, y0 + 140, 60, 8);
  fr(cx - 30, y0 + 78, 60, 5);
  fr(cx - 30, y0 + 10, 60, 5);
  // tubes (shaking)
  const shake = Math.sin(t * 22) * 1.2;
  const tubes = [
    { x: cx - 18, top: y0 + 18, h: 118, w: 12 },
    { x: cx + 2, top: y0 + 44, h: 92, w: 10 },
  ];
  for (const [i, tb] of tubes.entries()) {
    const ox = i === 0 ? shake : -shake;
    c.save();
    c.translate(ox, 0);
    rr(c, tb.x, tb.top, tb.w, tb.h, 3, lin(c, tb.x, tb.x + tb.w, ['#a16207', '#fde68a', '#ca8a04', '#713f12']), '#422006', 1.2);
    // tongue cut
    c.fillStyle = '#422006';
    c.beginPath();
    c.moveTo(tb.x + 1, tb.top + 4);
    c.lineTo(tb.x + tb.w - 1, tb.top + 4);
    c.lineTo(tb.x + tb.w - 1, tb.top + tb.h * 0.45);
    c.quadraticCurveTo(tb.x + tb.w / 2, tb.top + tb.h * 0.25, tb.x + 1, tb.top + tb.h * 0.45);
    c.closePath();
    c.globalAlpha = 0.5;
    c.fill();
    c.globalAlpha = 1;
    // nodes
    c.fillStyle = 'rgba(66,32,6,0.6)';
    c.fillRect(tb.x, tb.top + tb.h * 0.6, tb.w, 2);
    c.restore();
  }
  // floating notes
  for (let i = 0; i < 3; i++) {
    const k = (t * 0.6 + i / 3) % 1;
    c.save();
    c.globalAlpha = Math.sin(k * Math.PI);
    c.fillStyle = '#fde68a';
    c.font = 'bold 14px serif';
    c.textAlign = 'center';
    c.fillText(i % 2 ? '♪' : '♫', cx + Math.sin(k * 6 + i) * 18, y0 + 6 - k * 26);
    c.restore();
  }
  // muzzle
  rr(c, cx - 6, y0 - 2, 12, 14, 3, brass(c, cx - 6, cx + 6), '#451a03', 1);
}

// ------------------------------------------------------------- BEE HIVE
function beeGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 112, '#78350f', '#a16207', 0.8);
  guard(c, cx, y0 + 104, '#451a03');
  // hive (stacked rings)
  for (let i = 0; i < 6; i++) {
    const w = 22 + Math.sin((i / 5) * Math.PI) * 10;
    rr(c, cx - w, y0 + 30 + i * 16, w * 2, 18, 9, lin(c, cx - w, cx + w, ['#a16207', '#fcd34d', '#f59e0b', '#92400e']), '#713f12', 1.2);
  }
  // entrance
  c.beginPath();
  c.ellipse(cx, y0 + 72, 7, 5, 0, 0, TAU);
  c.fillStyle = '#1c0f02';
  c.fill();
  // drip
  c.fillStyle = '#f59e0b';
  c.beginPath();
  c.ellipse(cx + 14, y0 + 128 + Math.sin(t * 2) * 2, 2.5, 4, 0, 0, TAU);
  c.fill();
  // nozzle
  rr(c, cx - 6, y0 + 4, 12, 28, 4, wood(c, cx - 6, cx + 6), '#422006', 1);
  // buzzing bees
  for (let i = 0; i < 4; i++) {
    const a = t * (2 + i * 0.4) + i * 1.7;
    const bx = cx + Math.cos(a) * (26 + i * 3);
    const by = y0 + 50 + Math.sin(a * 1.3) * 26;
    c.fillStyle = '#facc15';
    c.beginPath();
    c.ellipse(bx, by, 3.5, 2.5, a, 0, TAU);
    c.fill();
    c.fillStyle = '#111';
    c.fillRect(bx - 0.7, by - 2.5, 1.4, 5);
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.beginPath();
    c.ellipse(bx, by - 3, 2, 1 + Math.abs(Math.sin(t * 50 + i)), 0, 0, TAU);
    c.fill();
  }
}

// ------------------------------------------------------------- INK (octopus)
function inkGun(c: C, cx: number, y0: number, t: number) {
  // tentacles as grip
  for (let i = 0; i < 4; i++) {
    c.strokeStyle = i % 2 ? '#7c3aed' : '#6d28d9';
    c.lineWidth = 7 - i;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(cx - 10 + i * 7, y0 + 110);
    c.bezierCurveTo(cx - 20 + i * 14 + Math.sin(t * 3 + i) * 6, y0 + 140, cx + i * 12, y0 + 160, cx - 6 + i * 16 + Math.sin(t * 2 + i) * 8, y0 + 180);
    c.stroke();
    c.fillStyle = '#ddd6fe';
    for (let k = 0; k < 3; k++) {
      c.beginPath();
      c.arc(cx - 12 + i * 10 + k * 2, y0 + 130 + k * 14, 1.6, 0, TAU);
      c.fill();
    }
  }
  // head/body
  c.beginPath();
  c.ellipse(cx, y0 + 76, 26, 40, 0, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 70, 40, ['#a78bfa', '#7c3aed', '#4c1d95']);
  c.fill();
  c.strokeStyle = '#2e1065';
  c.lineWidth = 2;
  c.stroke();
  // spots
  c.fillStyle = 'rgba(221,214,254,0.5)';
  for (const [sx, sy, sr] of [[-10, 56, 4], [9, 64, 3], [-4, 92, 3.5], [12, 96, 2.5]]) {
    c.beginPath();
    c.arc(cx + sx, y0 + sy, sr, 0, TAU);
    c.fill();
  }
  // eyes
  for (const s of [-1, 1]) {
    c.beginPath();
    c.arc(cx + s * 11, y0 + 76, 6, 0, TAU);
    c.fillStyle = '#fff';
    c.fill();
    c.beginPath();
    c.arc(cx + s * 11, y0 + 77 + Math.sin(t * 2) * 1, 3, 0, TAU);
    c.fillStyle = '#111';
    c.fill();
  }
  // siphon nozzle
  rr(c, cx - 6, y0 + 6, 12, 34, [6, 6, 3, 3], lin(c, cx - 6, cx + 6, ['#4c1d95', '#8b5cf6', '#4c1d95']), '#2e1065', 1.2);
  c.beginPath();
  c.ellipse(cx, y0 + 6, 6, 2.5, 0, 0, TAU);
  c.fillStyle = '#0f0a1e';
  c.fill();
}

// ------------------------------------------------------------- YOYO
function yoyoGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  grip(c, cx, y0 + 104, '#1d4ed8', '#3b82f6', 0.78);
  guard(c, cx, y0 + 96, '#1e3a8a');
  rr(c, cx - 15, y0 + 40, 30, 90, 8, lin(c, cx - 15, cx + 15, ['#1e3a8a', '#60a5fa', '#2563eb', '#1e3a8a']), '#172554');
  // reel window with string
  c.beginPath();
  c.arc(cx, y0 + 88, 11, 0, TAU);
  c.fillStyle = '#e0f2fe';
  c.fill();
  c.strokeStyle = '#172554';
  c.lineWidth = 2;
  c.stroke();
  c.save();
  c.translate(cx, y0 + 88);
  c.rotate(t * 6);
  c.strokeStyle = '#ef4444';
  c.lineWidth = 1;
  for (let i = 3; i < 9; i += 1.5) {
    c.beginPath();
    c.arc(0, 0, i, 0, TAU);
    c.stroke();
  }
  c.restore();
  rr(c, cx - 4, y0 + 18, 8, 24, 2, chrome(c, cx - 4, cx + 4));
  if (ready) {
    // yoyo at muzzle
    c.save();
    c.translate(cx, y0 + 6);
    c.scale(1, 0.55);
    c.beginPath();
    c.arc(0, 0, 14, 0, TAU);
    c.fillStyle = radial(c, 0, 0, 14, ['#fca5a5', '#ef4444', '#7f1d1d']);
    c.fill();
    c.rotate(t * 10);
    c.strokeStyle = 'rgba(255,255,255,0.7)';
    c.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      c.rotate(TAU / 3);
      c.beginPath();
      c.arc(0, 0, 9, 0, 0.8);
      c.stroke();
    }
    c.restore();
    star(c, cx, y0 + 6, 3.5, '#fde047');
  }
}

// ------------------------------------------------------------- SAKURA
function sakuraGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 108, '#3f1d0b', '#6b3a1e', 0.78);
  guard(c, cx, y0 + 100, '#1c0a00');
  // lacquered body
  rr(c, cx - 15, y0 + 34, 30, 96, 6, lin(c, cx - 15, cx + 15, ['#450a0a', '#b91c1c', '#7f1d1d']), '#1c0505');
  c.strokeStyle = '#fbbf24';
  c.lineWidth = 1;
  c.strokeRect(cx - 11, y0 + 40, 22, 84);
  // branch
  c.strokeStyle = '#3f1d0b';
  c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(cx - 10, y0 + 120);
  c.quadraticCurveTo(cx + 8, y0 + 90, cx - 4, y0 + 50);
  c.stroke();
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx + 2, y0 + 90);
  c.lineTo(cx + 10, y0 + 76);
  c.stroke();
  const flower = (x: number, y: number, s: number) => {
    c.save();
    c.translate(x, y);
    for (let i = 0; i < 5; i++) {
      c.rotate(TAU / 5);
      c.fillStyle = '#fbcfe8';
      c.beginPath();
      c.ellipse(0, -s, s * 0.6, s, 0, 0, TAU);
      c.fill();
    }
    c.fillStyle = '#f472b6';
    c.beginPath();
    c.arc(0, 0, s * 0.4, 0, TAU);
    c.fill();
    c.restore();
  };
  flower(cx - 4, y0 + 52, 4);
  flower(cx + 10, y0 + 76, 3.5);
  flower(cx + 4, y0 + 104, 3);
  // fan-shaped muzzle
  c.beginPath();
  c.moveTo(cx, y0 + 36);
  c.arc(cx, y0 + 36, 30, -Math.PI * 0.78, -Math.PI * 0.22);
  c.closePath();
  c.fillStyle = lin(c, cx - 30, cx + 30, ['#fbcfe8', '#fdf2f8', '#f9a8d4']);
  c.fill();
  c.strokeStyle = '#be185d';
  c.lineWidth = 1.5;
  c.stroke();
  c.strokeStyle = 'rgba(190,24,93,0.4)';
  c.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI * 0.78 + (i / 5) * Math.PI * 0.56;
    c.beginPath();
    c.moveTo(cx, y0 + 36);
    c.lineTo(cx + Math.cos(a) * 30, y0 + 36 + Math.sin(a) * 30);
    c.stroke();
  }
  // falling petals
  for (let i = 0; i < 4; i++) {
    const k = (t * 0.4 + i / 4) % 1;
    c.save();
    c.translate(cx - 28 + i * 18 + Math.sin(k * 8) * 6, y0 + k * 130);
    c.rotate(k * 8);
    c.globalAlpha = Math.sin(k * Math.PI);
    c.fillStyle = '#f9a8d4';
    c.beginPath();
    c.ellipse(0, 0, 3, 1.6, 0, 0, TAU);
    c.fill();
    c.restore();
  }
}

// ------------------------------------------------------------- ACID
function acidGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 112, '#1f2937', '#374151', 0.8);
  guard(c, cx, y0 + 104);
  rr(c, cx - 14, y0 + 40, 28, 92, 5, steel(c, cx - 14, cx + 14), '#000');
  // hazard stripes
  c.save();
  c.beginPath();
  c.rect(cx - 14, y0 + 120, 28, 10);
  c.clip();
  for (let i = -2; i < 8; i++) {
    c.fillStyle = i % 2 ? '#111' : '#facc15';
    c.beginPath();
    c.moveTo(cx - 14 + i * 6, y0 + 130);
    c.lineTo(cx - 8 + i * 6, y0 + 120);
    c.lineTo(cx - 2 + i * 6, y0 + 120);
    c.lineTo(cx - 8 + i * 6, y0 + 130);
    c.fill();
  }
  c.restore();
  // flask
  c.beginPath();
  c.moveTo(cx - 5, y0 + 48);
  c.lineTo(cx - 5, y0 + 64);
  c.lineTo(cx - 20, y0 + 104);
  c.quadraticCurveTo(cx, y0 + 114, cx + 20, y0 + 104);
  c.lineTo(cx + 5, y0 + 64);
  c.lineTo(cx + 5, y0 + 48);
  c.closePath();
  c.fillStyle = 'rgba(220,252,231,0.3)';
  c.fill();
  c.save();
  c.clip();
  const lv = y0 + 76 + Math.sin(t * 3) * 2;
  c.fillStyle = lin(c, cx - 20, cx + 20, ['#4d7c0f', '#a3e635', '#65a30d']);
  c.fillRect(cx - 22, lv, 44, 50);
  c.fillStyle = 'rgba(236,252,203,0.8)';
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.arc(cx - 10 + i * 5, y0 + 108 - ((t * 30 + i * 11) % 34), 1.5 + (i % 2), 0, TAU);
    c.fill();
  }
  c.restore();
  c.strokeStyle = '#d9f99d';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx - 5, y0 + 48);
  c.lineTo(cx - 5, y0 + 64);
  c.lineTo(cx - 20, y0 + 104);
  c.quadraticCurveTo(cx, y0 + 114, cx + 20, y0 + 104);
  c.lineTo(cx + 5, y0 + 64);
  c.lineTo(cx + 5, y0 + 48);
  c.stroke();
  // skull label
  c.fillStyle = '#111';
  c.font = 'bold 10px sans-serif';
  c.textAlign = 'center';
  c.fillText('☠', cx, y0 + 100);
  // nozzle
  rr(c, cx - 4, y0 + 2, 8, 46, 2, steel(c, cx - 4, cx + 4));
  glow(c, cx, y0 + 2, 3, '#a3e635', 10);
  // drip
  const dp = (t * 0.9) % 1;
  c.fillStyle = '#a3e635';
  c.beginPath();
  c.ellipse(cx + 3, y0 + 4 + dp * 14, 1.6, 2.5, 0, 0, TAU);
  c.fill();
}

// ------------------------------------------------------------- KERIS
function kerisGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  // wrangka (sheath-shaped stock) with ukiran
  c.beginPath();
  c.moveTo(cx - 34, y0 + 132);
  c.quadraticCurveTo(cx, y0 + 116, cx + 34, y0 + 132);
  c.lineTo(cx + 24, y0 + 146);
  c.quadraticCurveTo(cx, y0 + 138, cx - 24, y0 + 146);
  c.closePath();
  c.fillStyle = lin(c, cx - 34, cx + 34, ['#3f1d0b', '#92400e', '#3f1d0b']);
  c.fill();
  c.strokeStyle = '#fbbf24';
  c.lineWidth = 1;
  c.stroke();
  // hilt (deder) as grip
  c.beginPath();
  c.moveTo(cx - 7, y0 + 144);
  c.bezierCurveTo(cx - 14, y0 + 170, cx + 4, y0 + 186, cx + 16, y0 + 206);
  c.lineTo(cx + 26, y0 + 198);
  c.bezierCurveTo(cx + 12, y0 + 180, cx + 10, y0 + 162, cx + 7, y0 + 144);
  c.closePath();
  c.fillStyle = lin(c, cx - 14, cx + 26, ['#3f1d0b', '#a16207', '#57381b']);
  c.fill();
  c.strokeStyle = '#1c0a00';
  c.lineWidth = 1.5;
  c.stroke();
  // mendak gold ring
  rr(c, cx - 9, y0 + 138, 18, 7, 3, brass(c, cx - 9, cx + 9), '#713f12', 1);
  // blade (luk 7) with pamor
  const bl = ready ? 1 : 0.85;
  c.save();
  c.translate(cx, y0 + 136);
  c.scale(1, bl);
  c.beginPath();
  const pts: [number, number][] = [];
  for (let i = 0; i <= 14; i++) {
    const y = -i * 9.4;
    const wv = Math.sin(i * 0.9) * 4;
    const w = 8 * (1 - i / 16);
    pts.push([wv + w, y]);
  }
  c.moveTo(-10, 0);
  for (let i = 0; i <= 14; i++) {
    const y = -i * 9.4;
    const wv = Math.sin(i * 0.9) * 4;
    const w = 8 * (1 - i / 16);
    c.lineTo(wv - w, y);
  }
  c.lineTo(0, -138);
  for (let i = 14; i >= 0; i--) c.lineTo(pts[i][0], pts[i][1]);
  c.lineTo(10, 0);
  c.closePath();
  c.fillStyle = lin(c, -12, 12, ['#1f2937', '#9ca3af', '#4b5563', '#111827']);
  c.fill();
  c.strokeStyle = '#030712';
  c.lineWidth = 1;
  c.stroke();
  // pamor (nickel pattern)
  c.save();
  c.clip();
  c.strokeStyle = 'rgba(229,231,235,0.6)';
  c.lineWidth = 0.8;
  for (let k = 0; k < 6; k++) {
    c.beginPath();
    for (let i = 0; i <= 14; i++) c.lineTo(Math.sin(i * 0.9) * 4 + (k - 2.5) * 2.2 + Math.sin(i * 2 + k) * 0.8, -i * 9.4);
    c.stroke();
  }
  // shimmer
  const sy = -((t * 90) % 160);
  c.fillStyle = 'rgba(255,255,255,0.5)';
  c.fillRect(-12, sy, 24, 4);
  c.restore();
  // ganja (base guard)
  c.beginPath();
  c.moveTo(-14, 2);
  c.quadraticCurveTo(0, -6, 16, -2);
  c.lineTo(14, 4);
  c.lineTo(-14, 6);
  c.closePath();
  c.fillStyle = '#374151';
  c.fill();
  c.restore();
  // mystic aura
  glow(c, cx, y0 + 2, 2.5 + Math.sin(t * 6), '#fde68a', 14);
}

// ------------------------------------------------------------- TORNADO
function tornadoGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 112, '#334155', '#64748b', 0.8);
  guard(c, cx, y0 + 104, '#0f172a');
  rr(c, cx - 16, y0 + 70, 32, 62, 8, lin(c, cx - 16, cx + 16, ['#1e293b', '#94a3b8', '#475569']), '#0f172a');
  // fan vents
  c.save();
  c.translate(cx, y0 + 100);
  c.rotate(t * 12);
  c.fillStyle = '#cbd5e1';
  for (let i = 0; i < 4; i++) {
    c.rotate(TAU / 4);
    c.beginPath();
    c.ellipse(0, -6, 3, 7, 0.4, 0, TAU);
    c.fill();
  }
  c.restore();
  c.beginPath();
  c.arc(cx, y0 + 100, 12, 0, TAU);
  c.strokeStyle = '#0f172a';
  c.lineWidth = 2;
  c.stroke();
  // funnel (mini tornado)
  for (let i = 0; i < 9; i++) {
    const k = i / 8;
    const y = y0 + 66 - k * 62;
    const w = 6 + k * 18;
    const ox = Math.sin(t * 5 + i * 0.7) * (3 + k * 4);
    c.beginPath();
    c.ellipse(cx + ox, y, w, 3.5 + k * 2, 0, 0, TAU);
    c.strokeStyle = `rgba(226,232,240,${0.4 + 0.5 * (1 - k)})`;
    c.lineWidth = 2;
    c.stroke();
  }
  // debris
  for (let i = 0; i < 5; i++) {
    const a = t * 6 + i * 1.3;
    const k = ((t * 0.5 + i / 5) % 1);
    c.fillStyle = pickC(i);
    c.fillRect(cx + Math.cos(a) * (8 + k * 16), y0 + 60 - k * 56 + Math.sin(a) * 3, 2.5, 2.5);
  }
}
const pickC = (i: number) => ['#16a34a', '#a16207', '#94a3b8', '#fde047', '#e2e8f0'][i % 5];

// ------------------------------------------------------------- FIREWORK
function fireworkGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  grip(c, cx, y0 + 112, '#1e1b4b', '#4338ca', 0.8);
  guard(c, cx, y0 + 104, '#0f0a2e');
  // launcher tubes (3)
  const cols = [['#be123c', '#fb7185'], ['#1d4ed8', '#60a5fa'], ['#a16207', '#fde047']];
  for (let i = 0; i < 3; i++) {
    const x = cx - 18 + i * 12;
    rr(c, x, y0 + 30 + Math.abs(i - 1) * 8, 12, 100 - Math.abs(i - 1) * 8, 3, lin(c, x, x + 12, [cols[i][0], cols[i][1], cols[i][0]]), '#0f0a2e', 1.2);
    c.fillStyle = 'rgba(255,255,255,0.8)';
    for (let k = 0; k < 4; k++) star(c, x + 6, y0 + 50 + k * 20 + Math.abs(i - 1) * 4, 2.5, '#ffffff');
  }
  rr(c, cx - 22, y0 + 116, 44, 16, 4, '#111827', '#000', 1);
  // rocket in center
  if (ready) {
    c.save();
    c.translate(cx, y0 + 6);
    c.fillStyle = lin(c, -5, 5, ['#9f1239', '#fb7185', '#9f1239']);
    c.fillRect(-5, 6, 10, 26);
    c.beginPath();
    c.moveTo(-6, 7);
    c.lineTo(0, -8);
    c.lineTo(6, 7);
    c.closePath();
    c.fillStyle = '#fde047';
    c.fill();
    c.restore();
  }
  // sparkle fuse
  if (Math.sin(t * 20) > 0) glow(c, cx + 18, y0 + 26, 2, '#fde047', 10);
}

// ------------------------------------------------------------- ANCHOR CANNON
function anchorGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  // ship wheel grip
  c.save();
  c.translate(cx + 30, y0 + 180);
  c.rotate(t * 0.3);
  c.strokeStyle = '#78350f';
  c.lineWidth = 4;
  c.beginPath();
  c.arc(0, 0, 18, 0, TAU);
  c.stroke();
  for (let i = 0; i < 8; i++) {
    c.rotate(TAU / 8);
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(0, -25);
    c.stroke();
    c.fillStyle = '#a16207';
    c.beginPath();
    c.arc(0, -25, 3, 0, TAU);
    c.fill();
  }
  c.fillStyle = '#facc15';
  c.beginPath();
  c.arc(0, 0, 5, 0, TAU);
  c.fill();
  c.restore();
  // barrel (brass & navy)
  rr(c, cx - 18, y0 + 22, 36, 150, 6, lin(c, cx - 18, cx + 18, ['#0c1a3a', '#1e40af', '#172554', '#0c1a3a']), '#020617');
  for (const by of [y0 + 30, y0 + 90, y0 + 150]) rr(c, cx - 20, by, 40, 8, 3, brass(c, cx - 20, cx + 20), '#713f12', 1);
  // rope wrap
  c.strokeStyle = '#d6a960';
  c.lineWidth = 2.5;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.moveTo(cx - 18, y0 + 104 + i * 6);
    c.lineTo(cx + 18, y0 + 108 + i * 6);
    c.stroke();
  }
  // chain coming out
  c.strokeStyle = '#9ca3af';
  c.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    c.beginPath();
    c.ellipse(cx - 24, y0 + 120 + i * 9, 3, 5, 0, 0, TAU);
    c.stroke();
  }
  if (ready) {
    // anchor peeking
    c.save();
    c.translate(cx, y0 - 2);
    c.strokeStyle = lin(c, -14, 14, ['#334155', '#cbd5e1', '#334155']) as unknown as string;
    c.lineWidth = 5;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(0, 30);
    c.lineTo(0, 2);
    c.stroke();
    c.beginPath();
    c.arc(0, 14, 13, Math.PI * 0.15, Math.PI * 0.85, true);
    c.stroke();
    c.beginPath();
    c.moveTo(-8, 8);
    c.lineTo(8, 8);
    c.stroke();
    c.beginPath();
    c.arc(0, -2, 4, 0, TAU);
    c.lineWidth = 2.5;
    c.stroke();
    c.restore();
  }
}

// ------------------------------------------------------------- SHARK
function sharkGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 118, '#0c4a6e', '#0369a1', 0.8);
  guard(c, cx, y0 + 110, '#082f49');
  // tank tube
  c.beginPath();
  c.roundRect(cx - 20, y0 + 24, 40, 116, 10);
  c.fillStyle = 'rgba(14,165,233,0.25)';
  c.fill();
  c.save();
  c.clip();
  c.fillStyle = lin(c, cx - 20, cx + 20, ['#075985', '#38bdf8', '#0284c7']);
  c.fillRect(cx - 20, y0 + 24, 40, 116);
  // water lines
  c.strokeStyle = 'rgba(224,242,254,0.35)';
  c.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    for (let x = 0; x <= 40; x += 4) c.lineTo(cx - 20 + x, y0 + 34 + i * 18 + Math.sin(t * 3 + x * 0.3 + i) * 2);
    c.stroke();
  }
  // shark fin circling
  const fx = cx + Math.sin(t * 2) * 12;
  c.fillStyle = '#334155';
  c.beginPath();
  c.moveTo(fx - 7, y0 + 80);
  c.quadraticCurveTo(fx, y0 + 60, fx + 6, y0 + 58);
  c.lineTo(fx + 7, y0 + 80);
  c.closePath();
  c.fill();
  c.restore();
  c.beginPath();
  c.roundRect(cx - 20, y0 + 24, 40, 116, 10);
  c.strokeStyle = '#082f49';
  c.lineWidth = 3;
  c.stroke();
  // jaw muzzle
  c.beginPath();
  c.moveTo(cx - 20, y0 + 26);
  c.quadraticCurveTo(cx, y0 - 6, cx + 20, y0 + 26);
  c.closePath();
  c.fillStyle = '#475569';
  c.fill();
  c.strokeStyle = '#1e293b';
  c.lineWidth = 2;
  c.stroke();
  c.beginPath();
  c.ellipse(cx, y0 + 18, 11, 6, 0, 0, TAU);
  c.fillStyle = '#7f1d1d';
  c.fill();
  c.fillStyle = '#fff';
  for (let i = 0; i < 6; i++) {
    const x = cx - 10 + i * 4;
    c.beginPath();
    c.moveTo(x, y0 + 12);
    c.lineTo(x + 2, y0 + 17);
    c.lineTo(x + 4, y0 + 12);
    c.fill();
    c.beginPath();
    c.moveTo(x, y0 + 24);
    c.lineTo(x + 2, y0 + 19);
    c.lineTo(x + 4, y0 + 24);
    c.fill();
  }
  for (const s of [-1, 1]) {
    c.beginPath();
    c.arc(cx + s * 13, y0 + 10, 2, 0, TAU);
    c.fillStyle = '#000';
    c.fill();
  }
}

// ------------------------------------------------------------- GHOST
function ghostGun(c: C, cx: number, y0: number, t: number) {
  c.save();
  c.globalAlpha = 0.85 + 0.15 * Math.sin(t * 4);
  grip(c, cx, y0 + 108, '#312e81', '#4338ca', 0.78);
  guard(c, cx, y0 + 100, '#1e1b4b');
  // spectral body
  const bob = Math.sin(t * 3) * 2;
  c.beginPath();
  c.moveTo(cx - 20, y0 + 128);
  c.lineTo(cx - 20, y0 + 52 + bob);
  c.quadraticCurveTo(cx - 20, y0 + 28 + bob, cx, y0 + 28 + bob);
  c.quadraticCurveTo(cx + 20, y0 + 28 + bob, cx + 20, y0 + 52 + bob);
  c.lineTo(cx + 20, y0 + 128);
  for (let i = 0; i < 5; i++) c.quadraticCurveTo(cx + 16 - i * 8, y0 + 138 + (i % 2 ? -6 : 6), cx + 12 - i * 8, y0 + 128);
  c.closePath();
  c.fillStyle = lin(c, cx - 20, cx + 20, ['rgba(165,180,252,0.6)', 'rgba(238,242,255,0.95)', 'rgba(165,180,252,0.6)']);
  c.shadowColor = '#c7d2fe';
  c.shadowBlur = 16;
  c.fill();
  c.shadowBlur = 0;
  // face
  c.fillStyle = '#1e1b4b';
  for (const s of [-1, 1]) {
    c.beginPath();
    c.ellipse(cx + s * 7, y0 + 56 + bob, 3.5, 5, 0, 0, TAU);
    c.fill();
  }
  c.beginPath();
  c.ellipse(cx, y0 + 72 + bob, 4, 5 + Math.sin(t * 5), 0, 0, TAU);
  c.fill();
  // lantern muzzle
  rr(c, cx - 6, y0 + 4, 12, 22, 3, '#1e1b4b', '#000', 1);
  glow(c, cx, y0 + 14, 4 + Math.sin(t * 8), '#a5b4fc', 16);
  c.restore();
  // wisps
  for (let i = 0; i < 3; i++) {
    const k = (t * 0.5 + i / 3) % 1;
    glow(c, cx - 26 + i * 26, y0 + 130 - k * 120, 2 * (1 - k), 'rgba(199,210,254,0.8)', 10);
  }
}

// ------------------------------------------------------------- UFO
function ufoGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 104, '#334155', '#64748b', 0.78);
  guard(c, cx, y0 + 96, '#0f172a');
  rr(c, cx - 6, y0 + 50, 12, 70, 3, chrome(c, cx - 6, cx + 6), '#334155', 1);
  // saucer
  const hov = Math.sin(t * 3) * 2;
  c.save();
  c.translate(cx, y0 + 36 + hov);
  c.beginPath();
  c.ellipse(0, -8, 13, 12, 0, Math.PI, TAU);
  c.fillStyle = 'rgba(187,247,208,0.6)';
  c.fill();
  c.strokeStyle = '#86efac';
  c.lineWidth = 1;
  c.stroke();
  // alien
  c.fillStyle = '#4ade80';
  c.beginPath();
  c.ellipse(0, -10, 5, 6, 0, 0, TAU);
  c.fill();
  c.fillStyle = '#000';
  for (const s of [-1, 1]) {
    c.beginPath();
    c.ellipse(s * 2.2, -11, 1.6, 2.4, s * 0.4, 0, TAU);
    c.fill();
  }
  c.beginPath();
  c.ellipse(0, 0, 30, 9, 0, 0, TAU);
  c.fillStyle = lin(c, -30, 30, ['#475569', '#e2e8f0', '#94a3b8', '#334155']);
  c.fill();
  c.strokeStyle = '#1e293b';
  c.lineWidth = 1.5;
  c.stroke();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + t * 3;
    const on = Math.sin(t * 8 + i) > 0;
    glow(c, Math.cos(a) * 22, Math.sin(a) * 5 + 1, 2, on ? '#facc15' : '#4ade80', 6);
  }
  c.restore();
  // tractor beam
  c.save();
  c.globalCompositeOperation = 'lighter';
  const bg = c.createLinearGradient(0, y0 + 44, 0, y0 - 6);
  bg.addColorStop(0, 'rgba(134,239,172,0.5)');
  bg.addColorStop(1, 'rgba(134,239,172,0)');
  c.fillStyle = bg;
  c.beginPath();
  c.moveTo(cx - 8, y0 + 44 + hov);
  c.lineTo(cx + 8, y0 + 44 + hov);
  c.lineTo(cx + 4, y0 - 6);
  c.lineTo(cx - 4, y0 - 6);
  c.closePath();
  c.fill();
  c.restore();
}

// ------------------------------------------------------------- RAINBOW
function rainbowGun(c: C, cx: number, y0: number, t: number) {
  const bands = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc'];
  rr(c, cx - 12, y0 + 109, 24, 49, 7, lin(c, cx - 12, cx + 12,
    ['#454163', '#eeeaff', '#77738f', '#34304f']), '#fcf4ff', 1.6);
  for (let i = 0; i < 4; i++) {
    c.strokeStyle = bands[(i + 2) % 6]; c.lineWidth = 2;
    c.beginPath(); c.moveTo(cx - 9, y0 + 120 + i * 9); c.lineTo(cx + 9, y0 + 124 + i * 9); c.stroke();
  }
  rr(c, cx - 18, y0 + 151, 36, 8, 3, chrome(c, cx - 18, cx + 18), '#605b7e', 1);
  for (const side of [-1, 1]) {
    // Opalescent fins frame the glass prism rather than hiding its colors.
    c.beginPath(); c.moveTo(cx + side * 18, y0 + 49);
    c.lineTo(cx + side * 30, y0 + 34); c.lineTo(cx + side * 26, y0 + 103);
    c.lineTo(cx + side * 18, y0 + 120); c.closePath();
    c.fillStyle = lin(c, cx - 32, cx + 32, ['#9aa8c4', '#f8fafc', '#bdafe2', '#9aa8c4']);
    c.fill(); c.strokeStyle = '#5c517b'; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = bands[side === -1 ? 4 : 0]; c.lineWidth = 2.2;
    c.beginPath(); c.moveTo(cx + side * 24, y0 + 46); c.lineTo(cx + side * 21, y0 + 104); c.stroke();
  }
  rr(c, cx - 19, y0 + 39, 38, 90, 10, '#393357', '#fff3ff', 2);
  c.save(); c.beginPath(); c.roundRect(cx - 15, y0 + 43, 30, 82, 7); c.clip();
  for (let i = 0; i < 6; i++) {
    const g = c.createLinearGradient(cx - 15 + i * 5, 0, cx - 10 + i * 5, 0);
    g.addColorStop(0, bands[i]); g.addColorStop(0.5, '#fff9ff'); g.addColorStop(1, bands[i]);
    c.fillStyle = g; c.fillRect(cx - 15 + i * 5, y0 + 43, 5, 82);
  }
  c.fillStyle = 'rgba(255,255,255,0.42)';
  c.beginPath(); c.moveTo(cx - 12 + Math.sin(t * 2) * 3, y0 + 43);
  c.lineTo(cx - 7 + Math.sin(t * 2) * 3, y0 + 43);
  c.lineTo(cx + 5 + Math.sin(t * 2) * 3, y0 + 125);
  c.lineTo(cx, y0 + 125); c.closePath(); c.fill();
  c.restore();
  rr(c, cx - 21, y0 + 121, 42, 8, 3, chrome(c, cx - 21, cx + 21), '#66577c', 1.2);
  rr(c, cx - 23, y0 + 36, 46, 8, 3, chrome(c, cx - 23, cx + 23), '#66577c', 1.2);
  // Six nested, luminous refracted rays lead into a faceted muzzle prism.
  for (let i = 0; i < 6; i++) {
    c.strokeStyle = bands[i]; c.lineWidth = 2.2;
    c.beginPath(); c.arc(cx, y0 + 28, 28 - i * 2.5, Math.PI * 1.13, Math.PI * 1.87); c.stroke();
  }
  c.save(); c.translate(cx, y0 + 14); c.rotate(t * 0.6);
  c.shadowColor = '#f5d0fe'; c.shadowBlur = 16;
  star(c, 0, 0, 13, '#f8f5ff', 6);
  c.shadowBlur = 0; star(c, 0, 0, 7, '#fde68a', 6); c.restore();
  for (const side of [-1, 1]) {
    star(c, cx + side * 29, y0 + 33, 3.2, bands[side === -1 ? 4 : 0], 4);
  }
}

// ------------------------------------------------------------- METEOR
function meteorGun(c: C, cx: number, y0: number, t: number) {
  const heat = 0.75 + 0.25 * Math.sin(t * 6);
  rr(c, cx - 13, y0 + 110, 26, 53, 6, lin(c, cx - 13, cx + 13,
    ['#15181e', '#66636a', '#302a30', '#111318']), '#a67754', 1.5);
  for (let i = 0; i < 4; i++) {
    c.strokeStyle = '#f08e49'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(cx - 8, y0 + 121 + i * 10); c.lineTo(cx + 8, y0 + 126 + i * 10); c.stroke();
  }
  // Forged iron brackets and heat exhausts make the launcher legible at thumbnail size.
  for (const side of [-1, 1]) {
    c.beginPath(); c.moveTo(cx + side * 16, y0 + 45);
    c.lineTo(cx + side * 34, y0 + 59); c.lineTo(cx + side * 29, y0 + 123);
    c.lineTo(cx + side * 18, y0 + 138); c.closePath();
    c.fillStyle = lin(c, cx - 34, cx + 34, ['#282128', '#777077', '#221c22']);
    c.fill(); c.strokeStyle = '#141014'; c.lineWidth = 2; c.stroke();
    for (const yy of [65, 81, 97, 113]) {
      rr(c, cx + side * 22 - 3, y0 + yy, 6, 8, 2,
        `rgba(255,${140 + Math.round(40 * heat)},42,0.92)`, '#312027', 1);
    }
  }
  c.beginPath();
  c.moveTo(cx - 18, y0 + 130); c.lineTo(cx - 24, y0 + 91);
  c.lineTo(cx - 21, y0 + 38); c.lineTo(cx - 11, y0 + 29);
  c.lineTo(cx + 12, y0 + 29); c.lineTo(cx + 22, y0 + 40);
  c.lineTo(cx + 24, y0 + 91); c.lineTo(cx + 18, y0 + 130);
  c.closePath(); c.fillStyle = lin(c, cx - 24, cx + 24,
    ['#161419', '#575057', '#29272b', '#171518']); c.fill();
  c.strokeStyle = '#0d0b10'; c.lineWidth = 2.5; c.stroke();
  // The glowing fissures follow the cracked basalt, not random vertical stripes.
  c.save(); c.clip(); c.shadowColor = '#ff6a22'; c.shadowBlur = 9;
  c.strokeStyle = '#f97316'; c.lineWidth = 3;
  c.beginPath();
  c.moveTo(cx - 17, y0 + 42); c.lineTo(cx - 6, y0 + 64); c.lineTo(cx - 12, y0 + 83);
  c.lineTo(cx + 1, y0 + 95); c.lineTo(cx - 4, y0 + 124);
  c.moveTo(cx + 14, y0 + 39); c.lineTo(cx + 4, y0 + 57); c.lineTo(cx + 10, y0 + 75);
  c.lineTo(cx - 1, y0 + 95); c.moveTo(cx + 10, y0 + 75); c.lineTo(cx + 20, y0 + 102);
  c.stroke(); c.strokeStyle = '#ffd17c'; c.lineWidth = 1; c.stroke(); c.restore();
  for (const yy of [35, 126]) rr(c, cx - 25, y0 + yy, 50, 7, 3,
    lin(c, cx - 25, cx + 25, ['#111017', '#9a9092', '#3a343b']), '#0d0b10', 1.5);
  rr(c, cx - 17, y0 + 8, 34, 28, 5, lin(c, cx - 17, cx + 17,
    ['#111017', '#665960', '#232027']), '#0c090d', 2);
  c.fillStyle = '#1b1011'; c.beginPath(); c.ellipse(cx, y0 + 9, 15, 5, 0, 0, TAU); c.fill();
  c.save(); c.shadowColor = '#ff6a22'; c.shadowBlur = 17;
  c.fillStyle = radial(c, cx, y0 + 9, 10, ['#fff6c4', '#ff9e30', '#9a321a']);
  c.beginPath(); c.ellipse(cx, y0 + 9, 10, 3, 0, 0, TAU); c.fill(); c.restore();
  for (const side of [-1, 1]) {
    c.fillStyle = '#31272a'; c.beginPath();
    c.moveTo(cx + side * 20, y0 + 21); c.lineTo(cx + side * 30, y0 + 11);
    c.lineTo(cx + side * 25, y0 + 40); c.closePath(); c.fill();
  }
}

// ------------------------------------------------------------- DIAMOND
function diamondGun(c: C, cx: number, y0: number, t: number) {
  rr(c, cx - 12, y0 + 107, 24, 54, 7, lin(c, cx - 12, cx + 12,
    ['#14243f', '#507498', '#26395e', '#111c35']), '#c6e9f6', 1.7);
  for (let i = 0; i < 4; i++) {
    c.strokeStyle = 'rgba(206,247,255,0.6)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(cx - 9, y0 + 118 + i * 10); c.lineTo(cx + 8, y0 + 124 + i * 10); c.stroke();
  }
  rr(c, cx - 17, y0 + 152, 34, 8, 3, chrome(c, cx - 17, cx + 17), '#415976', 1);
  for (const side of [-1, 1]) {
    c.beginPath(); c.moveTo(cx + side * 12, y0 + 38);
    c.lineTo(cx + side * 27, y0 + 49); c.lineTo(cx + side * 24, y0 + 105);
    c.lineTo(cx + side * 12, y0 + 132); c.closePath();
    c.fillStyle = lin(c, cx - 29, cx + 29, ['#647a96', '#f7feff', '#9eb8ca', '#3f5577']);
    c.fill(); c.strokeStyle = '#334766'; c.lineWidth = 1.6; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.86)'; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(cx + side * 25, y0 + 50);
    c.lineTo(cx + side * 13, y0 + 96); c.lineTo(cx + side * 23, y0 + 104); c.stroke();
  }
  rr(c, cx - 16, y0 + 42, 32, 83, 5, lin(c, cx - 16, cx + 16,
    ['#0f2948', '#568ab0', '#255280', '#112743']), '#eefaff', 1.6);
  // Precision-cut inset gems with white facet lines and sapphire shadows.
  for (const [xx, yy, size] of [[0, 63, 8], [-6, 89, 5], [7, 91, 5], [0, 111, 6]]) {
    c.save(); c.translate(cx + xx, y0 + yy);
    c.beginPath(); c.moveTo(0, -size); c.lineTo(size * 0.85, -size * 0.25);
    c.lineTo(0, size); c.lineTo(-size * 0.85, -size * 0.25); c.closePath();
    c.fillStyle = lin(c, -size, size, ['#2789be', '#f7ffff', '#59d8f6', '#0a6296']);
    c.fill(); c.strokeStyle = '#e7fcff'; c.lineWidth = 0.9; c.stroke();
    c.beginPath(); c.moveTo(0, -size); c.lineTo(0, size);
    c.moveTo(-size * 0.85, -size * 0.25); c.lineTo(size * 0.85, -size * 0.25); c.stroke();
    c.restore();
  }
  rr(c, cx - 21, y0 + 119, 42, 8, 2, chrome(c, cx - 21, cx + 21), '#425d73', 1);
  // Crown-size faceted diamond emitter (its apex is the firing point).
  c.save(); c.translate(cx, y0 + 17);
  c.shadowColor = '#67e8f9'; c.shadowBlur = 19;
  c.beginPath(); c.moveTo(0, -22); c.lineTo(13, -13); c.lineTo(19, -2);
  c.lineTo(0, 23); c.lineTo(-19, -2); c.lineTo(-13, -13); c.closePath();
  c.fillStyle = lin(c, -19, 19, ['#279dc5', '#dcfaff', '#ffffff', '#67c8e9', '#257aa8']);
  c.fill(); c.shadowBlur = 0; c.strokeStyle = '#f0fdff'; c.lineWidth = 1.6; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.63)';
  c.beginPath(); c.moveTo(0, -22); c.lineTo(-6, -2); c.lineTo(0, 23);
  c.lineTo(6, -2); c.closePath(); c.fill();
  c.strokeStyle = '#518bb6'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(-19, -2); c.lineTo(19, -2);
  c.moveTo(-13, -13); c.lineTo(-6, -2); c.lineTo(0, 23);
  c.moveTo(13, -13); c.lineTo(6, -2); c.lineTo(0, 23); c.stroke();
  c.restore();
  if (Math.sin(t * 5) > 0) star(c, cx - 14, y0 + 8, 4, '#ffffff', 4);
  if (Math.cos(t * 4) > 0) star(c, cx + 17, y0 + 34, 3, '#ffffff', 4);
}

// ------------------------------------------------------------- MOONBEAM
function moonbeamGun(c: C, cx: number, y0: number, t: number) {
  // One continuous enchanted staff: NO pistol handle, trigger, magazine,
  // wrapped gun grip or barrel. The pointed pommel is part of the same wand.
  c.save(); c.shadowColor = '#a78bfa'; c.shadowBlur = 15;
  c.beginPath(); c.moveTo(cx - 7, y0 + 33);
  c.bezierCurveTo(cx - 10, y0 + 72, cx - 9, y0 + 123, cx - 6, y0 + 161);
  c.quadraticCurveTo(cx - 5, y0 + 178, cx, y0 + 188);
  c.quadraticCurveTo(cx + 5, y0 + 178, cx + 6, y0 + 161);
  c.bezierCurveTo(cx + 9, y0 + 123, cx + 10, y0 + 72, cx + 7, y0 + 33);
  c.closePath();
  c.fillStyle = lin(c, cx - 9, cx + 9,
    ['#181033', '#493574', '#856bbb', '#4b347c', '#150e34']);
  c.fill(); c.shadowBlur = 0; c.strokeStyle = '#d8b8f5'; c.lineWidth = 1.8; c.stroke();
  c.restore();
  // A silver-violet vine winds around the shaft, with tiny golden star maps.
  c.strokeStyle = '#e6cfaa'; c.lineWidth = 1.4; c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx - 6, y0 + 39);
  c.bezierCurveTo(cx + 13, y0 + 49, cx - 13, y0 + 62, cx + 5, y0 + 75);
  c.bezierCurveTo(cx + 14, y0 + 90, cx - 14, y0 + 106, cx + 5, y0 + 118);
  c.bezierCurveTo(cx + 12, y0 + 134, cx - 8, y0 + 152, cx + 1, y0 + 175); c.stroke();
  c.strokeStyle = 'rgba(245,232,209,0.74)'; c.lineWidth = 0.95;
  c.beginPath(); c.moveTo(cx + 6, y0 + 45);
  c.bezierCurveTo(cx - 10, y0 + 70, cx + 11, y0 + 103, cx - 4, y0 + 136); c.stroke();
  for (const [x, yy, r] of [[-2, 52, 3.3], [4, 78, 2.5], [-3, 110, 3.6], [3, 144, 2.5], [0, 178, 2.6]]) {
    star(c, cx + x, y0 + yy, r, '#fff1c3', 4);
  }
  // Central moonstone is an inlay, not an ergonomic gun grip.
  c.beginPath(); c.ellipse(cx, y0 + 101, 5.2, 8, 0, 0, TAU);
  c.fillStyle = radial(c, cx - 2, y0 + 97, 9, ['#ffffff', '#d9caff', '#7661b0']);
  c.fill(); c.strokeStyle = '#efd9a3'; c.lineWidth = 1.5; c.stroke();
  c.strokeStyle = 'rgba(252,238,190,0.71)'; c.lineWidth = 1;
  for (const side of [-1, 1]) {
    c.beginPath(); c.moveTo(cx + side * 3, y0 + 94);
    c.quadraticCurveTo(cx + side * 9, y0 + 77, cx + side * 5, y0 + 60); c.stroke();
  }
  // Tip rests in an open crescent of filigree silver, cradling a living star.
  const aura = c.createRadialGradient(cx, y0 + 10, 1, cx, y0 + 10, 50);
  aura.addColorStop(0, 'rgba(255,249,229,0.56)');
  aura.addColorStop(0.47, 'rgba(199,178,249,0.27)');
  aura.addColorStop(1, 'rgba(150,109,230,0)');
  c.fillStyle = aura; c.beginPath(); c.arc(cx, y0 + 10, 50, 0, TAU); c.fill();
  for (const side of [-1, 1]) {
    c.strokeStyle = '#f3e4fa'; c.lineWidth = 5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(cx + side * 6, y0 + 37);
    c.bezierCurveTo(cx + side * 27, y0 + 30, cx + side * 30, y0 + 6, cx + side * 15, y0 - 13);
    c.stroke();
    c.strokeStyle = '#bba1e6'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(cx + side * 8, y0 + 35);
    c.quadraticCurveTo(cx + side * 32, y0 + 15, cx + side * 15, y0 - 13); c.stroke();
    star(c, cx + side * 15, y0 - 14, 4, '#fff4c9', 4);
  }
  c.save(); c.translate(cx, y0 + 9); c.rotate(t * 0.21);
  c.shadowColor = '#e8dbff'; c.shadowBlur = 25;
  star(c, 0, 0, 18, '#d6c3fa', 6);
  c.shadowBlur = 0; star(c, 0, 0, 12, '#ffffff', 6);
  star(c, 0, 0, 5.5, '#fff1c1', 6); c.restore();
  for (let i = 0; i < 6; i++) {
    const angle = t * 1.4 + i * TAU / 6, r = 32 + Math.sin(t * 2 + i) * 3;
    star(c, cx + Math.cos(angle) * r, y0 + 9 + Math.sin(angle) * 25,
      1.6 + (i % 2), i % 2 ? '#ffe6b2' : '#ffffff', 4);
  }
}

// ------------------------------------------------------------- STORM CALLER
function stormGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 112, '#1e3a8a', '#1d4ed8', 0.8);
  guard(c, cx, y0 + 104, '#172554');
  rr(c, cx - 15, y0 + 52, 30, 80, 6, lin(c, cx - 15, cx + 15, ['#0f172a', '#334155', '#0f172a']), '#000');
  // lightning rune
  c.save();
  c.shadowColor = '#93c5fd';
  c.shadowBlur = 10;
  c.fillStyle = '#bfdbfe';
  c.beginPath();
  c.moveTo(cx + 3, y0 + 64);
  c.lineTo(cx - 7, y0 + 92);
  c.lineTo(cx, y0 + 92);
  c.lineTo(cx - 4, y0 + 120);
  c.lineTo(cx + 8, y0 + 86);
  c.lineTo(cx + 1, y0 + 86);
  c.closePath();
  c.fill();
  c.restore();
  // rod
  rr(c, cx - 3, y0 + 24, 6, 30, 2, brass(c, cx - 3, cx + 3));
  // storm cloud head
  const cloud = (x: number, y: number, r: number, col: string) => {
    c.fillStyle = col;
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.fill();
  };
  const drift = Math.sin(t * 1.5) * 2;
  cloud(cx - 14 + drift, y0 + 18, 11, '#334155');
  cloud(cx + 12 - drift, y0 + 18, 12, '#334155');
  cloud(cx, y0 + 10, 14, '#475569');
  cloud(cx - 6, y0 + 22, 10, '#1e293b');
  cloud(cx + 8, y0 + 24, 9, '#1e293b');
  // inner flicker
  if (Math.sin(t * 13) > 0.6) {
    c.save();
    c.globalCompositeOperation = 'lighter';
    c.fillStyle = 'rgba(147,197,253,0.35)';
    c.beginPath();
    c.arc(cx, y0 + 16, 18, 0, TAU);
    c.fill();
    c.restore();
  }
  c.strokeStyle = '#dbeafe';
  c.lineWidth = 1.5;
  if (Math.sin(t * 9) > 0.3) jag(c, cx + rand(-8, 8), y0 + 28, cx + rand(-14, 14), y0 + 46, 3, 4);
  glow(c, cx, y0 + 2, 2.5, '#dbeafe', 12);
}

// ================================================================ dispatch
export function drawGunExtra2(c: C, id: WeaponId, cx: number, y0: number, t: number, ready: boolean) {
  switch (id) {
    case 'honey': honey(c, cx, y0, t); break;
    case 'coconut': coconut(c, cx, y0, t, ready); break;
    case 'angklung': angklung(c, cx, y0, t); break;
    case 'bee': beeGun(c, cx, y0, t); break;
    case 'ink': inkGun(c, cx, y0, t); break;
    case 'yoyo': yoyoGun(c, cx, y0, t, ready); break;
    case 'sakura': sakuraGun(c, cx, y0, t); break;
    case 'acid': acidGun(c, cx, y0, t); break;
    case 'keris': kerisGun(c, cx, y0, t, ready); break;
    case 'tornado': tornadoGun(c, cx, y0, t); break;
    case 'firework': fireworkGun(c, cx, y0, t, ready); break;
    case 'anchor': anchorGun(c, cx, y0, t, ready); break;
    case 'shark': sharkGun(c, cx, y0, t); break;
    case 'ghost': ghostGun(c, cx, y0, t); break;
    case 'ufo': ufoGun(c, cx, y0, t); break;
    case 'rainbow': rainbowGun(c, cx, y0, t); break;
    case 'meteor': meteorGun(c, cx, y0, t); break;
    case 'diamond': diamondGun(c, cx, y0, t); break;
    case 'moonbeam': moonbeamGun(c, cx, y0, t); break;
    case 'storm': stormGun(c, cx, y0, t); break;
    default: drawGunExtra3(c, id, cx, y0, t, ready); break;
  }
}

export type Flash2 = { k: 'fire'; s: number } | { k: 'energy'; rgb: string; r: number } | { k: 'puff'; col: string; n: number };
export const FLASH2: Partial<Record<WeaponId, Flash2>> = {
  honey: { k: 'puff', col: 'rgba(251,191,36,', n: 8 }, coconut: { k: 'puff', col: 'rgba(236,252,203,', n: 10 },
  angklung: { k: 'energy', rgb: '253,230,138', r: 34 }, bee: { k: 'puff', col: 'rgba(250,204,21,', n: 5 },
  ink: { k: 'puff', col: 'rgba(30,20,60,', n: 12 }, yoyo: { k: 'puff', col: 'rgba(255,200,200,', n: 4 },
  sakura: { k: 'puff', col: 'rgba(251,207,232,', n: 8 }, acid: { k: 'puff', col: 'rgba(190,242,100,', n: 8 },
  keris: { k: 'energy', rgb: '255,215,120', r: 46 }, tornado: { k: 'puff', col: 'rgba(226,232,240,', n: 12 },
  firework: { k: 'fire', s: 1.2 }, anchor: { k: 'fire', s: 1.5 }, shark: { k: 'puff', col: 'rgba(186,230,253,', n: 12 },
  ghost: { k: 'energy', rgb: '199,210,254', r: 40 }, ufo: { k: 'energy', rgb: '134,239,172', r: 40 },
  rainbow: { k: 'energy', rgb: '255,190,230', r: 48 }, meteor: { k: 'fire', s: 2 }, diamond: { k: 'energy', rgb: '165,243,252', r: 36 },
  moonbeam: { k: 'energy', rgb: '196,181,253', r: 44 }, storm: { k: 'energy', rgb: '147,197,253', r: 50 },
};
