import { TAU, rand, lin, vlin, steel, chrome, wood, rr, grip, guard, glow, star, radial, gunState } from './kit';
import { shotPulse } from './commonGunMotion';
import { drawFrostGrip, drawWaterGrip } from './gripSystem';

type C = CanvasRenderingContext2D;
export const SNOWBALL_MAG_SIZE = 5;

// ------------------------------------------------------------- KETAPEL PRO (animated draw / release)
const easeInOut = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

function slingshotPro(c: C, cx: number, y0: number, t: number, ready: boolean) {
  const s = gunState.sinceShot;
  const REST = 14;
  const DRAWN = 104;
  let py = REST;
  let px = 0;
  let stretch = 0;
  let loaded = true;
  let vib = 0;
  const RELEASE = 0.16;
  const DRAW_END = 0.36;
  if (!ready && s > DRAW_END) {
    loaded = false;
  } else if (s < RELEASE) {
    // CTAK! band snaps forward and vibrates around rest
    const k = s / RELEASE;
    vib = 1 - k;
    py = REST - 22 * Math.sin(k * Math.PI * 4.5) * (1 - k) * (1 - k);
    px = Math.sin(k * Math.PI * 7) * 5 * (1 - k);
    loaded = false;
  } else if (s < DRAW_END) {
    const k = easeInOut((s - RELEASE) / (DRAW_END - RELEASE));
    py = REST + (DRAWN - REST) * k;
    stretch = k;
  } else {
    py = DRAWN + Math.sin(t * 3.2) * 1.4;
    px = Math.sin(t * 2.4) * 0.9;
    stretch = 1;
  }
  const bend = stretch * 3.5; // fork tips bend inward under tension
  const tipL = { x: cx - 24 + bend, y: y0 + 4 + stretch * 1.5 };
  const tipR = { x: cx + 24 - bend, y: y0 + 4 + stretch * 1.5 };
  const pouch = { x: cx + px, y: y0 + py };

  // ---- back band (behind fork)
  const bandW = 4.6 - stretch * 2.3;
  const bandCol = stretch > 0.95 ? '#ef4444' : '#dc2626';
  c.lineCap = 'round';
  c.strokeStyle = '#7f1d1d';
  c.lineWidth = bandW + 1.4;
  c.beginPath();
  c.moveTo(tipR.x, tipR.y);
  c.lineTo(pouch.x + 7, pouch.y);
  c.stroke();
  c.strokeStyle = bandCol;
  c.lineWidth = bandW;
  c.stroke();

  // ---- handle (kayu sawo) with leather grip + rattan
  c.save();
  c.beginPath();
  c.moveTo(cx - 8, y0 + 58);
  c.quadraticCurveTo(cx - 10, y0 + 110, cx - 7, y0 + 160);
  c.quadraticCurveTo(cx, y0 + 168, cx + 7, y0 + 160);
  c.quadraticCurveTo(cx + 10, y0 + 110, cx + 8, y0 + 58);
  c.closePath();
  c.fillStyle = lin(c, cx - 10, cx + 10, ['#3b1a07', '#9c5a2a', '#c27a43', '#5a2d0c']);
  c.fill();
  c.strokeStyle = '#1c0a00';
  c.lineWidth = 1.5;
  c.stroke();
  // wood grain
  c.strokeStyle = 'rgba(40,15,0,0.35)';
  c.lineWidth = 0.8;
  for (let i = 0; i < 4; i++) {
    c.beginPath();
    c.moveTo(cx - 5 + i * 3, y0 + 62);
    c.quadraticCurveTo(cx - 6 + i * 3.5, y0 + 110, cx - 4 + i * 2.8, y0 + 156);
    c.stroke();
  }
  // leather wrap
  rr(c, cx - 10, y0 + 104, 20, 44, 4, lin(c, cx - 10, cx + 10, ['#3f2414', '#7a4a2a', '#3f2414']), '#1c0a00', 1.2);
  c.strokeStyle = '#d9b26a';
  c.lineWidth = 1.2;
  for (let i = 0; i < 8; i++) {
    c.beginPath();
    c.moveTo(cx - 10, y0 + 107 + i * 5);
    c.lineTo(cx + 10, y0 + 110 + i * 5);
    c.stroke();
  }
  c.restore();

  // ---- fork (Y)
  const forkArm = (tx: number, ty: number, side: number) => {
    c.strokeStyle = '#3b1a07';
    c.lineWidth = 13;
    c.beginPath();
    c.moveTo(cx, y0 + 66);
    c.quadraticCurveTo(cx + side * 3, y0 + 36, tx, ty);
    c.stroke();
    c.strokeStyle = lin(c, cx - 26, cx + 26, ['#7c3f16', '#c27a43', '#7c3f16']) as unknown as string;
    c.lineWidth = 9;
    c.stroke();
    c.strokeStyle = 'rgba(255,220,170,0.35)';
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(cx - side * 1, y0 + 62);
    c.quadraticCurveTo(cx + side * 1, y0 + 36, tx - side * 2, ty + 2);
    c.stroke();
    // band tie
    c.fillStyle = '#1c1917';
    c.beginPath();
    c.ellipse(tx, ty + 2, 6.5, 4, 0, 0, TAU);
    c.fill();
    c.strokeStyle = '#a16207';
    c.lineWidth = 1.2;
    for (let i = -1; i <= 1; i++) {
      c.beginPath();
      c.moveTo(tx - 6, ty + 2 + i * 2.2);
      c.lineTo(tx + 6, ty + 2 + i * 2.2);
      c.stroke();
    }
  };
  forkArm(tipL.x, tipL.y, -1);
  forkArm(tipR.x, tipR.y, 1);
  // carved emblem
  c.fillStyle = 'rgba(30,10,0,0.55)';
  c.font = 'bold 8px sans-serif';
  c.textAlign = 'center';
  c.fillText('★', cx, y0 + 86);

  // ---- tension glow / strain lines at full draw
  if (stretch > 0.9) {
    c.save();
    c.globalCompositeOperation = 'lighter';
    const a = 0.25 + 0.2 * Math.sin(s * 30);
    c.strokeStyle = `rgba(255,200,120,${a})`;
    c.lineWidth = 1;
    for (const side of [-1, 1]) {
      for (let i = 0; i < 2; i++) {
        c.beginPath();
        const tx = side < 0 ? tipL.x : tipR.x;
        c.moveTo(tx + side * (8 + i * 5), y0 - 2 - i * 4);
        c.lineTo(tx + side * (14 + i * 5), y0 - 8 - i * 4);
        c.stroke();
      }
    }
    c.restore();
  }

  // ---- stone in pouch
  if (loaded) {
    c.save();
    c.translate(pouch.x, pouch.y - 4);
    c.rotate(0.4);
    c.beginPath();
    c.ellipse(0, 0, 7.5, 6.2, 0, 0, TAU);
    c.fillStyle = radial(c, 0, 0, 8, ['#e7e5e4', '#8a817c', '#3f3a36']);
    c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.4)';
    c.lineWidth = 0.8;
    c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.5)';
    c.beginPath();
    c.ellipse(-2.5, -2, 2, 1.3, -0.4, 0, TAU);
    c.fill();
    c.restore();
  }

  // ---- leather pouch
  c.save();
  c.translate(pouch.x, pouch.y);
  c.beginPath();
  c.moveTo(-10, -3);
  c.quadraticCurveTo(0, 6 + stretch * 2, 10, -3);
  c.quadraticCurveTo(0, 2, -10, -3);
  c.fillStyle = '#5a3216';
  c.fill();
  c.beginPath();
  c.moveTo(-10, -3);
  c.quadraticCurveTo(0, 7 + stretch * 2, 10, -3);
  c.strokeStyle = '#2a1205';
  c.lineWidth = 3;
  c.stroke();
  c.restore();

  // ---- front band
  c.strokeStyle = '#7f1d1d';
  c.lineWidth = bandW + 1.4;
  c.beginPath();
  c.moveTo(tipL.x, tipL.y);
  c.lineTo(pouch.x - 7, pouch.y);
  c.stroke();
  c.strokeStyle = bandCol;
  c.lineWidth = bandW;
  c.stroke();
  // band highlight
  c.strokeStyle = 'rgba(255,200,200,0.5)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(tipL.x + 1, tipL.y - 1);
  c.lineTo(pouch.x - 6, pouch.y - 1.5);
  c.stroke();

  // ---- pinching fingers while drawing
  if (stretch > 0.02 && loaded) {
    c.save();
    c.translate(pouch.x, pouch.y + 6);
    c.fillStyle = '#e8b48a';
    c.strokeStyle = '#8a5a3a';
    c.lineWidth = 1.2;
    c.beginPath();
    c.ellipse(-4, 4, 6, 9, 0.3, 0, TAU);
    c.fill();
    c.stroke();
    c.beginPath();
    c.ellipse(5, 3, 5.5, 8.5, -0.3, 0, TAU);
    c.fill();
    c.stroke();
    c.fillStyle = '#f5d0b5';
    c.beginPath();
    c.ellipse(-4, -1, 3, 2.4, 0.3, 0, TAU);
    c.ellipse(5, -2, 2.8, 2.2, -0.3, 0, TAU);
    c.fill();
    c.restore();
  }

  // Warm moving highlight on the fork; during release the bands already
  // vibrate and the existing whoosh takes over.
  c.strokeStyle = `rgba(255,221,169,${0.24 + 0.22 * Math.sin(t * 2.6) ** 2})`;
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx - 3, y0 + 72);
  c.quadraticCurveTo(cx - 8, y0 + 41, tipL.x + 3, tipL.y + 8);
  c.stroke();

  // ---- release whoosh arcs
  if (vib > 0.3) {
    c.save();
    c.globalAlpha = (vib - 0.3) / 0.7;
    c.strokeStyle = '#ffffff';
    c.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.arc(cx, y0 + 4 - i * 9, 16 + i * 7, Math.PI * 1.15, Math.PI * 1.85);
      c.stroke();
    }
    c.restore();
  }
}

// ------------------------------------------------------------- KETAPEL
export function slingshot(c: C, cx: number, y0: number, t: number, ready: boolean) {
  slingshotPro(c, cx, y0, t, ready);
}
export const _legacySlingshot = (c: C, cx: number, y0: number, ready: boolean) => slingshotOld(c, cx, y0, ready);

function slingshotOld(c: C, cx: number, y0: number, ready: boolean) {
  // handle
  rr(c, cx - 6, y0 + 52, 12, 98, 5, wood(c, cx - 6, cx + 6), '#2a1205', 1.5);
  // rattan wraps
  c.strokeStyle = '#d9b26a';
  c.lineWidth = 2.5;
  for (let i = 0; i < 7; i++) {
    c.beginPath();
    c.moveTo(cx - 6, y0 + 92 + i * 6);
    c.lineTo(cx + 6, y0 + 95 + i * 6);
    c.stroke();
  }
  // fork
  c.lineCap = 'round';
  c.strokeStyle = '#5a2d0c';
  c.lineWidth = 11;
  c.beginPath();
  c.moveTo(cx, y0 + 60);
  c.quadraticCurveTo(cx - 4, y0 + 34, cx - 22, y0 + 6);
  c.moveTo(cx, y0 + 60);
  c.quadraticCurveTo(cx + 4, y0 + 34, cx + 22, y0 + 6);
  c.stroke();
  c.strokeStyle = '#b8743a';
  c.lineWidth = 4;
  c.beginPath();
  c.moveTo(cx - 2, y0 + 58);
  c.quadraticCurveTo(cx - 6, y0 + 34, cx - 23, y0 + 7);
  c.moveTo(cx + 2, y0 + 58);
  c.quadraticCurveTo(cx + 2, y0 + 34, cx + 20, y0 + 7);
  c.stroke();
  // bands
  const py = ready ? y0 + 78 : y0 + 12;
  c.strokeStyle = '#c2410c';
  c.lineWidth = 3.2;
  c.beginPath();
  c.moveTo(cx - 22, y0 + 6);
  c.lineTo(cx - 7, py);
  c.moveTo(cx + 22, y0 + 6);
  c.lineTo(cx + 7, py);
  c.stroke();
  // pouch
  c.beginPath();
  c.ellipse(cx, py, 9, 5, 0, 0, TAU);
  c.fillStyle = '#6b3d1f';
  c.fill();
  c.strokeStyle = '#3a1d08';
  c.lineWidth = 1.5;
  c.stroke();
  if (ready) {
    c.beginPath();
    c.ellipse(cx, py - 3, 6, 5, 0.3, 0, TAU);
    c.fillStyle = radial(c, cx, py - 3, 6, ['#d6d3d1', '#78716c', '#44403c']);
    c.fill();
  }
  // carved initial
  c.fillStyle = 'rgba(40,15,0,0.6)';
  c.font = 'bold 8px sans-serif';
  c.textAlign = 'center';
  c.fillText('ID', cx, y0 + 80);
}

// ------------------------------------------------------------- SUMPIT DAYAK
export function blowgun(c: C, cx: number, y0: number, t: number) {
  const breath = shotPulse(gunState.sinceShot, 0.32);
  // tube
  rr(c, cx - 5, y0, 10, 286, 4, lin(c, cx - 5, cx + 5, ['#2b1406', '#7a4420', '#3a1a08']), '#140800', 1.5);
  // motif bands (zigzag Dayak)
  for (const by of [y0 + 70, y0 + 150, y0 + 230]) {
    c.fillStyle = '#111';
    c.fillRect(cx - 5, by, 10, 16);
    c.strokeStyle = '#f5f5f4';
    c.lineWidth = 1.2;
    c.beginPath();
    for (let i = 0; i <= 4; i++) c.lineTo(cx - 5 + (i % 2) * 10, by + i * 4);
    c.stroke();
    c.fillStyle = '#dc2626';
    c.fillRect(cx - 5, by - 3, 10, 3);
    c.fillRect(cx - 5, by + 16, 10, 3);
  }
  // mouthpiece
  rr(c, cx - 6, y0 + 276, 12, 12, 3, '#1c1917');
  // spear blade (mata tombak)
  c.save();
  c.translate(cx + 7, y0 + 34);
  c.beginPath();
  c.moveTo(0, -46);
  c.quadraticCurveTo(7, -22, 4, 0);
  c.lineTo(-1, 0);
  c.quadraticCurveTo(-4, -22, 0, -46);
  c.closePath();
  c.fillStyle = lin(c, -4, 7, ['#6b7280', '#f3f4f6', '#9ca3af']);
  c.fill();
  c.strokeStyle = '#374151';
  c.lineWidth = 1;
  c.stroke();
  c.beginPath();
  c.moveTo(1, -42);
  c.lineTo(1.5, -4);
  c.strokeStyle = 'rgba(255,255,255,0.7)';
  c.stroke();
  c.restore();
  // rattan binding
  c.strokeStyle = '#d6a960';
  c.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.moveTo(cx - 6, y0 + 32 + i * 3.5);
    c.lineTo(cx + 12, y0 + 34 + i * 3.5);
    c.stroke();
  }
  // red hair tassel (rambut)
  c.strokeStyle = '#b91c1c';
  c.lineWidth = 1.2;
  for (let i = 0; i < 9; i++) {
    c.beginPath();
    c.moveTo(cx + 10, y0 + 52);
    c.quadraticCurveTo(cx + 16 + i + breath * 7, y0 + 62,
      cx + 12 + i * 1.6 + Math.sin(t * 5 + i * 0.6) * 3 + breath * 11,
      y0 + 78 + (i % 3) * 3);
    c.stroke();
  }
  rr(c, cx - 7, y0 - 2, 14, 6, 2, '#1c1917');
  if (breath > 0.02) {
    c.strokeStyle = `rgba(230,255,212,${breath * 0.72})`;
    c.lineWidth = 2;
    for (const side of [-1, 1]) {
      c.beginPath();
      c.moveTo(cx + side * 5, y0 - 3);
      c.quadraticCurveTo(cx + side * (10 + breath * 6), y0 - 13,
        cx + side * (13 + breath * 11), y0 - 25);
      c.stroke();
    }
  }
}

// ------------------------------------------------------------- SHOTGUN
export function shotgun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  const kick = shotPulse(gunState.sinceShot, 0.38);
  // stock
  c.beginPath();
  c.moveTo(cx - 10, y0 + 196);
  c.lineTo(cx + 12, y0 + 196);
  c.lineTo(cx + 34, y0 + 252);
  c.lineTo(cx + 2, y0 + 256);
  c.closePath();
  c.fillStyle = wood(c, cx - 10, cx + 34);
  c.fill();
  c.strokeStyle = '#2a1205';
  c.lineWidth = 2;
  c.stroke();
  rr(c, cx, y0 + 248, 34, 9, 3, '#111');
  // grip + guard
  c.beginPath();
  c.moveTo(cx + 10, y0 + 186);
  c.lineTo(cx + 40, y0 + 206);
  c.lineTo(cx + 32, y0 + 218);
  c.lineTo(cx + 10, y0 + 204);
  c.closePath();
  c.fillStyle = '#5a2d0c';
  c.fill();
  guard(c, cx - 8, y0 + 186, '#1b1d1f', 12);
  // receiver
  rr(c, cx - 11, y0 + 148, 24, 50, 3, steel(c, cx - 11, cx + 13), '#08090a');
  rr(c, cx + 3, y0 + 158, 9, 18, 1, '#050505');
  if (ready) rr(c, cx + 4, y0 + 160, 7, 14, 1, '#d62828');
  // magazine tube
  rr(c, cx + 3, y0 + 26, 9, 124, 3, steel(c, cx + 3, cx + 12), '#08090a', 1);
  // barrel
  rr(c, cx - 8, y0, 11, 150, 2, steel(c, cx - 8, cx + 3), '#08090a', 1.5);
  c.fillStyle = 'rgba(255,255,255,0.18)';
  c.fillRect(cx - 5, y0 + 4, 2, 140);
  // bead sight
  glow(c, cx - 2.5, y0 + 6, 2, '#fbbf24', 4);
  // Pump cycles on each shot and rocks through the actual reload period.
  const travel = gunState.reloadT > 0
    ? Math.min(1, gunState.reloadT / 0.18) * (10 + 10 * Math.sin(t * 11))
    : ready ? 20 * kick : 20 - 12 * kick;
  const py = y0 + 72 + travel + (ready ? Math.sin(t * 2.3) * 1.5 : 0);
  rr(c, cx - 11, py, 26, 46, 5, wood(c, cx - 11, cx + 15), '#2a1205');
  c.strokeStyle = 'rgba(0,0,0,0.35)';
  c.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.moveTo(cx - 9, py + 6 + i * 6.5);
    c.lineTo(cx + 13, py + 6 + i * 6.5);
    c.stroke();
  }
  // muzzle
  c.beginPath();
  c.ellipse(cx - 2.5, y0, 5.5, 2, 0, 0, TAU);
  c.fillStyle = '#000';
  c.fill();
  c.fillStyle = `rgba(255,234,184,${0.15 + 0.35 * Math.sin(t * 2.7) ** 2})`;
  c.fillRect(cx - 5, y0 + 148, 3, 24);
}

// ------------------------------------------------------------- SUPER SOAKER
export function soaker(c: C, cx: number, y0: number, t: number) {
  const pressure = shotPulse(gunState.sinceShot, 0.34);
  drawWaterGrip(c, cx, y0 + 98);
  guard(c, cx, y0 + 104, '#0f766e');
  // body
  c.beginPath();
  c.roundRect(cx - 20, y0 + 22, 42, 106, [18, 18, 10, 10]);
  c.fillStyle = lin(c, cx - 20, cx + 22, ['#4d7c0f', '#a3e635', '#84cc16', '#3f6212']);
  c.fill();
  c.strokeStyle = '#1a2e05';
  c.lineWidth = 2;
  c.stroke();
  // pressure gauge
  c.beginPath();
  c.arc(cx + 8, y0 + 46, 7, 0, TAU);
  c.fillStyle = '#fff';
  c.fill();
  c.strokeStyle = '#1a2e05';
  c.stroke();
  c.save();
  c.translate(cx + 8, y0 + 46);
  c.rotate(-1 + Math.sin(t * 3) * 0.6 + pressure * 1.2);
  c.strokeStyle = '#dc2626';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(0, -5.5);
  c.stroke();
  c.restore();
  // water tank
  c.save();
  c.beginPath();
  c.roundRect(cx - 40, y0 + 40, 22, 78, 10);
  c.clip();
  c.fillStyle = 'rgba(191,219,254,0.35)';
  c.fillRect(cx - 40, y0 + 40, 22, 78);
  const lvl = y0 + 62 + Math.sin(t * 4) * (2 + pressure * 3) + pressure * 7;
  c.beginPath();
  c.moveTo(cx - 40, lvl);
  for (let x = 0; x <= 22; x += 2) c.lineTo(cx - 40 + x, lvl + Math.sin(t * 6 + x * 0.5) * 1.5);
  c.lineTo(cx - 18, y0 + 118);
  c.lineTo(cx - 40, y0 + 118);
  c.closePath();
  c.fillStyle = vlin(c, lvl, y0 + 118, ['rgba(96,165,250,0.9)', 'rgba(37,99,235,0.95)']);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.arc(cx - 33 + i * 5, y0 + 112 - ((t * 25 + i * 15) % 46), 1.5, 0, TAU);
    c.fill();
  }
  c.restore();
  c.beginPath();
  c.roundRect(cx - 40, y0 + 40, 22, 78, 10);
  c.strokeStyle = '#1e3a8a';
  c.lineWidth = 2.5;
  c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.45)';
  c.fillRect(cx - 36, y0 + 46, 3, 64);
  // pump
  rr(c, cx - 14, y0 + 72 + pressure * 10, 30, 22, 8,
    lin(c, cx - 14, cx + 16, ['#c2410c', '#fb923c', '#c2410c']), '#431407');
  // nozzle
  rr(c, cx - 7, y0 + 2, 14, 24, [3, 3, 6, 6], lin(c, cx - 7, cx + 7, ['#1d4ed8', '#60a5fa', '#1e40af']), '#172554');
  rr(c, cx - 4, y0 - 3, 8, 7, 2, '#facc15', '#713f12', 1);
  c.fillStyle = 'rgba(255,255,255,0.3)';
  c.fillRect(cx - 14, y0 + 28, 4, 92);
  if (pressure > 0.02) {
    // A couple of clear droplets at the nozzle; projectile and splash FX
    // still come from the existing gameplay system.
    c.fillStyle = `rgba(215,247,255,${pressure * 0.8})`;
    for (const side of [-1, 1]) {
      c.beginPath();
      c.ellipse(cx + side * (7 + pressure * 7), y0 - 6 - pressure * 9,
        2.4, 3.8, side * 0.3, 0, TAU);
      c.fill();
    }
  }
}

// ------------------------------------------------------------- SNOWBALL CANNON
export function snowball(c: C, cx: number, y0: number, t: number, loaded = SNOWBALL_MAG_SIZE) {
  const thump = shotPulse(gunState.sinceShot, 0.34);
  drawFrostGrip(c, cx, y0 + 118);
  guard(c, cx, y0 + 110, '#0c4a6e');
  // Five visible chambers: each snowball disappears after a shot, then the
  // hopper refills together when the magazine's reload animation finishes.
  rr(c, cx - 47, y0 + 41, 28, 80, 7, 'rgba(8,47,73,0.82)', '#38bdf8', 2);
  c.fillStyle = 'rgba(191,239,255,0.18)';
  c.fillRect(cx - 43, y0 + 45, 3, 71);
  for (let i = 0; i < SNOWBALL_MAG_SIZE; i++) {
    const bx = cx - 33, by = y0 + 51 + i * 14.5;
    c.beginPath(); c.arc(bx, by, 6.5, 0, TAU);
    c.fillStyle = '#0b3047'; c.fill();
    c.strokeStyle = 'rgba(148,221,248,0.52)'; c.lineWidth = 1; c.stroke();
    if (i >= loaded) continue;
    c.beginPath(); c.arc(bx, by, 5.9, 0, TAU);
    c.fillStyle = radial(c, bx, by, 6, ['#ffffff', '#f3fbff', '#c7e8f5']); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.85)';
    c.beginPath(); c.arc(bx - 1.7 + Math.sin(t * 3 + i) * 0.8, by - 2, 1.1, 0, TAU); c.fill();
  }
  rr(c, cx - 22, y0 + 90, 8, 8, 2, '#0369a1');
  // tube
  rr(c, cx - 17, y0 + 6, 34, 140, [6, 6, 8, 8], lin(c, cx - 17, cx + 17, ['#075985', '#7dd3fc', '#38bdf8', '#0c4a6e']), '#082f49');
  // snowflakes
  c.strokeStyle = 'rgba(255,255,255,0.85)';
  c.lineWidth = 1.3;
  for (const [sx, sy, s] of [[cx - 4, y0 + 48, 7], [cx + 6, y0 + 92, 5], [cx - 6, y0 + 124, 4]]) {
    c.save();
    c.translate(sx, sy);
    c.rotate(t * 0.5);
    for (let i = 0; i < 3; i++) {
      c.rotate(Math.PI / 3);
      c.beginPath();
      c.moveTo(-s, 0);
      c.lineTo(s, 0);
      c.stroke();
    }
    c.restore();
  }
  // The frosted breech compresses, while the five-ball hopper remains intact.
  const capY = y0 + thump * 6;
  rr(c, cx - 21, capY, 42, 12, 5,
    lin(c, cx - 21, cx + 21, ['#0c4a6e', '#bae6fd', '#0c4a6e']), '#082f49');
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.moveTo(cx - 22, capY + 4);
  for (let i = 0; i <= 8; i++) {
    const x = cx - 22 + i * 5.5;
    c.quadraticCurveTo(x - 2.7, capY - 6 - (i % 2) * 3, x, capY + 2);
  }
  c.lineTo(cx + 22, capY + 6);
  c.lineTo(cx - 22, capY + 6);
  c.fill();
  c.fillStyle = 'rgba(224,242,254,0.95)';
  for (const ix of [-14, -3, 9]) {
    c.beginPath();
    c.moveTo(cx + ix - 3, capY + 11);
    c.lineTo(cx + ix + 3, capY + 11);
    c.lineTo(cx + ix, capY + 22 + Math.abs(ix) * 0.3);
    c.closePath();
    c.fill();
  }
  if (thump > 0.02) {
    c.fillStyle = `rgba(255,255,255,${thump * 0.85})`;
    for (const side of [-1, 1]) {
      c.beginPath();
      c.arc(cx + side * (17 + thump * 9), y0 - 5 - thump * 8, 2.4, 0, TAU);
      c.fill();
    }
  }
}

// ------------------------------------------------------------- SNIPER AWP
export function sniper(c: C, cx: number, y0: number) {
  const g1 = '#3f4a26';
  // stock w/ thumbhole
  c.beginPath();
  c.moveTo(cx - 12, y0 + 232);
  c.lineTo(cx + 14, y0 + 232);
  c.lineTo(cx + 30, y0 + 300);
  c.lineTo(cx - 12, y0 + 300);
  c.closePath();
  c.fillStyle = lin(c, cx - 12, cx + 30, ['#2a3318', '#6b7a3a', '#2a3318']);
  c.fill();
  c.strokeStyle = '#11150a';
  c.lineWidth = 2;
  c.stroke();
  c.beginPath();
  c.ellipse(cx + 6, y0 + 258, 6, 13, -0.2, 0, TAU);
  c.fillStyle = '#05070a';
  c.fill();
  rr(c, cx - 12, y0 + 294, 42, 8, 3, '#111');
  // grip
  c.beginPath();
  c.moveTo(cx + 12, y0 + 220);
  c.lineTo(cx + 40, y0 + 246);
  c.lineTo(cx + 30, y0 + 256);
  c.lineTo(cx + 12, y0 + 238);
  c.closePath();
  c.fillStyle = g1;
  c.fill();
  guard(c, cx - 8, y0 + 222, '#111', 11);
  // receiver
  rr(c, cx - 10, y0 + 182, 22, 52, 3, steel(c, cx - 10, cx + 12), '#050607');
  // bolt handle
  c.strokeStyle = '#9ca3af';
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(cx + 12, y0 + 214);
  c.lineTo(cx + 24, y0 + 220);
  c.stroke();
  glow(c, cx + 25, y0 + 221, 3.5, '#d1d5db', 0);
  // magazine
  rr(c, cx + 10, y0 + 194, 12, 22, 2, '#1f2937', '#000', 1);
  // handguard
  rr(c, cx - 11, y0 + 112, 24, 72, 5, lin(c, cx - 11, cx + 13, ['#2a3318', '#7c8b45', '#2a3318']), '#11150a');
  c.fillStyle = 'rgba(0,0,0,0.35)';
  for (let i = 0; i < 5; i++) c.fillRect(cx - 7, y0 + 122 + i * 12, 16, 4);
  // bipod folded
  c.strokeStyle = '#1f2937';
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(cx + 13, y0 + 116);
  c.lineTo(cx + 15, y0 + 60);
  c.stroke();
  // barrel
  rr(c, cx - 3.5, y0 + 12, 7, 102, 1, steel(c, cx - 3.5, cx + 3.5));
  // muzzle brake
  rr(c, cx - 6, y0 - 2, 12, 18, 2, steel(c, cx - 6, cx + 6), '#000', 1);
  c.fillStyle = '#000';
  for (let i = 0; i < 3; i++) c.fillRect(cx - 6, y0 + 2 + i * 4.5, 3, 2);
  // scope
  rr(c, cx - 30, y0 + 140, 13, 104, 5, lin(c, cx - 30, cx - 17, ['#050607', '#3f444c', '#050607']), '#000', 1);
  rr(c, cx - 33, y0 + 128, 19, 22, [8, 8, 3, 3], '#0b0c0e');
  rr(c, cx - 32, y0 + 234, 17, 18, [3, 3, 7, 7], '#0b0c0e');
  rr(c, cx - 36, y0 + 186, 8, 12, 2, '#111');
  c.beginPath();
  c.ellipse(cx - 23.5, y0 + 129, 8, 2.5, 0, 0, TAU);
  c.fillStyle = radial(c, cx - 23.5, y0 + 129, 8, ['#a5f3fc', '#0e7490', '#082f49']);
  c.fill();
  // mounts
  rr(c, cx - 18, y0 + 160, 8, 6, 1, '#111');
  rr(c, cx - 18, y0 + 222, 8, 6, 1, '#111');
}

// ------------------------------------------------------------- FLAMETHROWER
export function flamethrower(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 116, '#292524', '#57534e', 0.8);
  guard(c, cx, y0 + 108);
  // hose
  c.strokeStyle = '#1c1917';
  c.lineWidth = 6;
  c.beginPath();
  c.moveTo(cx + 34, y0 + 128);
  c.bezierCurveTo(cx + 46, y0 + 170, cx + 4, y0 + 176, cx - 2, y0 + 136);
  c.stroke();
  c.strokeStyle = '#44403c';
  c.lineWidth = 2;
  c.setLineDash([3, 3]);
  c.stroke();
  c.setLineDash([]);
  // fuel tank
  rr(c, cx + 20, y0 + 50, 22, 82, 10, lin(c, cx + 20, cx + 42, ['#7f1d1d', '#ef4444', '#b91c1c', '#450a0a']), '#290505');
  rr(c, cx + 23, y0 + 78, 16, 18, 2, '#facc15');
  c.fillStyle = '#111';
  c.font = 'bold 12px sans-serif';
  c.textAlign = 'center';
  c.fillText('🔥', cx + 31, y0 + 92);
  rr(c, cx + 27, y0 + 44, 8, 8, 2, '#9ca3af');
  // body
  rr(c, cx - 15, y0 + 56, 32, 82, 6, steel(c, cx - 15, cx + 17), '#000');
  // nozzle w/ heat shield
  rr(c, cx - 5, y0 + 4, 10, 56, 2, steel(c, cx - 5, cx + 5));
  rr(c, cx - 10, y0 + 18, 20, 40, 4, lin(c, cx - 10, cx + 10, ['#292524', '#78716c', '#292524']), '#000', 1);
  c.fillStyle = '#000';
  for (let i = 0; i < 6; i++) c.fillRect(cx - 7, y0 + 22 + i * 6, 14, 2.5);
  // pilot flame
  const f = 0.8 + 0.2 * Math.sin(t * 30);
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.fillStyle = `rgba(80,140,255,${0.8 * f})`;
  c.beginPath();
  c.ellipse(cx, y0 - 1, 3, 6 * f, 0, 0, TAU);
  c.fill();
  c.fillStyle = `rgba(255,170,60,${0.7 * f})`;
  c.beginPath();
  c.ellipse(cx + rand(-0.5, 0.5), y0 - 6, 2.5, 5 * f, 0, 0, TAU);
  c.fill();
  c.restore();
}

// ------------------------------------------------------------- BOOMERANG
export function boomerangGun(c: C, cx: number, y0: number, ready: boolean) {
  // woomera plank
  c.beginPath();
  c.moveTo(cx - 6, y0 + 20);
  c.quadraticCurveTo(cx - 12, y0 + 100, cx - 7, y0 + 176);
  c.lineTo(cx + 9, y0 + 176);
  c.quadraticCurveTo(cx + 14, y0 + 100, cx + 6, y0 + 20);
  c.closePath();
  c.fillStyle = lin(c, cx - 12, cx + 14, ['#5c2a0e', '#b45f2a', '#7c3a14']);
  c.fill();
  c.strokeStyle = '#2a1205';
  c.lineWidth = 2;
  c.stroke();
  // dot painting
  const cols = ['#fde68a', '#fff7ed', '#f97316', '#fef3c7'];
  for (let i = 0; i < 26; i++) {
    const yy = y0 + 32 + i * 5.3;
    c.fillStyle = cols[i % 4];
    c.beginPath();
    c.arc(cx + Math.sin(i * 0.9) * 5, yy, 1.4, 0, TAU);
    c.fill();
  }
  // leather grip
  rr(c, cx - 9, y0 + 140, 18, 34, 4, '#3f2a1c', '#140a04', 1.5);
  c.strokeStyle = '#7c5a40';
  c.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.moveTo(cx - 9, y0 + 144 + i * 5);
    c.lineTo(cx + 9, y0 + 147 + i * 5);
    c.stroke();
  }
  // hook
  c.beginPath();
  c.moveTo(cx - 3, y0 + 22);
  c.lineTo(cx, y0 + 12);
  c.lineTo(cx + 3, y0 + 22);
  c.fillStyle = '#e7e5e4';
  c.fill();
  if (ready) drawBoomerang(c, cx, y0 + 2, 1);
}

export function drawBoomerang(c: C, x: number, y: number, s: number) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(-18, 6, -30, 26);
  c.quadraticCurveTo(-26, 30, -21, 28);
  c.quadraticCurveTo(-12, 15, 0, 9);
  c.quadraticCurveTo(12, 15, 21, 28);
  c.quadraticCurveTo(26, 30, 30, 26);
  c.quadraticCurveTo(18, 6, 0, 0);
  c.closePath();
  c.fillStyle = lin(c, -30, 30, ['#7c3a14', '#e8a35a', '#b45f2a', '#7c3a14']);
  c.fill();
  c.strokeStyle = '#2a1205';
  c.lineWidth = 1.5;
  c.stroke();
  c.fillStyle = '#fff7ed';
  for (let i = 1; i < 6; i++) {
    c.beginPath();
    c.arc(-i * 4.6, 4 + i * 3.6, 1.1, 0, TAU);
    c.arc(i * 4.6, 4 + i * 3.6, 1.1, 0, TAU);
    c.fill();
  }
  c.restore();
}

// ------------------------------------------------------------- MERIAM BAMBU
export function bamboo(c: C, cx: number, y0: number, t: number) {
  // A real, hollow bamboo culm: warm green-gold fibres, swollen nodes,
  // rattan lashings and a burnt firing rim. The side wick supplies the bang.
  const pulse = 0.65 + 0.35 * Math.sin(t * 13);
  c.beginPath(); c.moveTo(cx - 15, y0 + 7);
  c.lineTo(cx + 15, y0 + 7); c.lineTo(cx + 21, y0 + 190);
  c.quadraticCurveTo(cx + 1, y0 + 206, cx - 20, y0 + 192);
  c.closePath();
  c.fillStyle = lin(c, cx - 22, cx + 22,
    ['#284910', '#628c21', '#d5e875', '#83a33a', '#2f4c16']);
  c.fill(); c.strokeStyle = '#20370f'; c.lineWidth = 2.5; c.stroke();
  // Hard glossy enamel highlights and age marks follow the grain.
  c.strokeStyle = 'rgba(243,255,188,0.63)'; c.lineWidth = 2.3;
  c.beginPath(); c.moveTo(cx - 9, y0 + 12);
  c.quadraticCurveTo(cx - 14, y0 + 89, cx - 9, y0 + 182); c.stroke();
  c.strokeStyle = 'rgba(48,84,15,0.51)'; c.lineWidth = 1.1;
  for (const dx of [-13, -3, 6, 14]) {
    c.beginPath(); c.moveTo(cx + dx, y0 + 13);
    c.quadraticCurveTo(cx + dx + 2, y0 + 90, cx + dx + 2, y0 + 187); c.stroke();
  }
  for (const [i, by] of [41, 85, 130, 175].entries()) {
    const swell = i % 2 ? 2 : 0;
    rr(c, cx - 21 - swell, y0 + by - 4, 42 + swell * 2, 9, 4,
      lin(c, cx - 22, cx + 22, ['#41651a', '#dbec82', '#819d31', '#395813']), '#33521a', 1.4);
    c.fillStyle = 'rgba(251,255,193,0.6)';
    c.fillRect(cx - 16, y0 + by - 1, 25, 1.4);
    c.strokeStyle = 'rgba(43,63,17,0.45)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(cx - 18, y0 + by + 8);
    c.quadraticCurveTo(cx - 5, y0 + by + 5, cx + 16, y0 + by + 8); c.stroke();
  }
  // Two crossed rattan belts prevent the hollow cannon from splitting.
  for (const by of [66, 150]) {
    rr(c, cx - 23, y0 + by, 46, 15, 4,
      lin(c, cx - 23, cx + 23, ['#5f3516', '#c68e4d', '#eac184', '#7a481e']), '#41280f', 1.4);
    c.strokeStyle = '#5e371b'; c.lineWidth = 1.25;
    for (let i = 0; i < 6; i++) {
      c.beginPath(); c.moveTo(cx - 21 + i * 8, y0 + by + 2);
      c.lineTo(cx - 15 + i * 8, y0 + by + 13); c.stroke();
    }
    c.fillStyle = '#ffdd8f'; c.beginPath(); c.arc(cx + 18, y0 + by + 7, 2, 0, TAU); c.fill();
  }
  // Carved red/gold firecracker crest instead of a generic gun badge.
  c.fillStyle = '#a52b21'; c.beginPath(); c.roundRect(cx - 10, y0 + 102, 20, 24, 3); c.fill();
  c.strokeStyle = '#f7ce68'; c.lineWidth = 1.8; c.stroke();
  c.fillStyle = '#ffe7a2'; star(c, cx, y0 + 114, 7, '#ffe7a2', 8);
  rr(c, cx - 23, y0 + 189, 46, 10, 4,
    lin(c, cx - 23, cx + 23, ['#244415', '#99b947', '#456e1d']), '#1d3910', 1.5);
  // Charring is confined to the rim, never a black circle on the target.
  const rim = c.createLinearGradient(cx - 19, y0 - 2, cx + 19, y0 + 14);
  rim.addColorStop(0, '#2e4518'); rim.addColorStop(0.45, '#f3de8d');
  rim.addColorStop(0.77, '#557624'); rim.addColorStop(1, '#253716');
  c.fillStyle = rim; c.beginPath();
  c.moveTo(cx - 23, y0 - 1); c.lineTo(cx + 23, y0 - 1);
  c.lineTo(cx + 18, y0 + 16); c.lineTo(cx - 18, y0 + 16); c.closePath(); c.fill();
  c.strokeStyle = '#243616'; c.lineWidth = 2; c.stroke();
  c.fillStyle = '#261f12'; c.beginPath(); c.ellipse(cx, y0, 20, 5, 0, 0, TAU); c.fill();
  c.strokeStyle = '#f0df94'; c.lineWidth = 2; c.stroke();
  c.fillStyle = 'rgba(255,203,93,0.36)'; c.beginPath();
  c.ellipse(cx, y0 + 1, 11, 2.4, 0, 0, TAU); c.fill();
  // Red-white Festival ribbon tied around the centre binding.
  const sway = Math.sin(t * 3) * 3;
  c.fillStyle = '#e53935'; c.beginPath(); c.moveTo(cx - 22, y0 + 69);
  c.quadraticCurveTo(cx - 34, y0 + 72 + sway, cx - 44, y0 + 68 + sway);
  c.lineTo(cx - 40, y0 + 78 + sway);
  c.quadraticCurveTo(cx - 31, y0 + 78 + sway, cx - 22, y0 + 76); c.fill();
  c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(cx - 22, y0 + 76);
  c.quadraticCurveTo(cx - 31, y0 + 78 + sway, cx - 40, y0 + 78 + sway);
  c.lineTo(cx - 37, y0 + 84 + sway);
  c.quadraticCurveTo(cx - 29, y0 + 83 + sway, cx - 22, y0 + 82); c.fill();
  // Side touchhole, fuse, and the separate glowing ignition stick.
  c.fillStyle = '#311d0a'; c.beginPath();
  c.ellipse(cx + 20, y0 + 168, 5, 4, 0, 0, TAU); c.fill();
  c.strokeStyle = '#c8ac79'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(cx + 21, y0 + 168);
  c.quadraticCurveTo(cx + 35, y0 + 163, cx + 40, y0 + 153); c.stroke();
  c.save(); c.translate(cx + 46, y0 + 172); c.rotate(-0.36);
  rr(c, -3, -58, 7, 72, 3, wood(c, -4, 4), '#603a19', 1);
  c.strokeStyle = '#ecd8b0'; c.lineWidth = 0.8;
  for (let i = 0; i < 4; i++) {
    c.beginPath(); c.moveTo(-3, -30 + i * 6); c.lineTo(4, -28 + i * 6); c.stroke();
  }
  c.fillStyle = '#3e3128'; c.fillRect(-4, -61, 9, 6);
  c.save(); c.shadowColor = '#ffac2b'; c.shadowBlur = 19;
  c.fillStyle = '#ff8c27'; c.beginPath();
  c.moveTo(-5, -60); c.quadraticCurveTo(-8, -72, Math.sin(t * 18) * 2, -84);
  c.quadraticCurveTo(9, -71, 5, -60); c.fill();
  c.fillStyle = '#fff7be'; c.beginPath(); c.ellipse(0, -65, 2.4, 6 * pulse, 0, 0, TAU); c.fill();
  c.restore(); c.restore();
  glow(c, cx + 20, y0 + 168, 2.5 * pulse, '#ffab46', 10);
}

// ------------------------------------------------------------- BANANA GUN
/** The peel opens at the shot, then folds shut by the next 0.2s shot/reload. */
export function bananaPeelOpen(sinceShot: number): number {
  if (sinceShot < 0 || sinceShot >= 0.2) return 0;
  return sinceShot < 0.065 ? sinceShot / 0.065 : (0.2 - sinceShot) / 0.135;
}

/** A shot empties the visible fruit; flesh grows back as the peel closes. */
export function bananaFleshFill(sinceShot: number): number {
  if (sinceShot < 0 || sinceShot >= 0.2) return 1;
  return Math.max(0, Math.min(1, (sinceShot - 0.06) / 0.14));
}

export function banana(c: C, cx: number, y0: number, t: number) {
  const open = bananaPeelOpen(gunState.sinceShot);
  const flesh = bananaFleshFill(gunState.sinceShot);
  // The curved fruit IS the launcher. No generic grip, barrel or googly eye.
  c.beginPath(); c.moveTo(cx - 4, y0 + 9);
  c.bezierCurveTo(cx - 26, y0 + 58, cx - 15, y0 + 123, cx + 32, y0 + 158);
  c.quadraticCurveTo(cx + 42, y0 + 161, cx + 42, y0 + 145);
  c.bezierCurveTo(cx + 11, y0 + 113, cx + 4, y0 + 64, cx + 9, y0 + 7);
  c.closePath();
  c.fillStyle = lin(c, cx - 26, cx + 40,
    ['#855017', '#e9ab18', '#fff094', '#ffcf27', '#c3830b']);
  c.fill(); c.strokeStyle = '#633b10'; c.lineWidth = 2.6; c.stroke();
  // Tapered chocolate-brown tip of a ripe banana.
  c.fillStyle = '#4b2d19'; c.beginPath();
  c.moveTo(cx + 32, y0 + 149); c.quadraticCurveTo(cx + 37, y0 + 160, cx + 42, y0 + 159);
  c.quadraticCurveTo(cx + 46, y0 + 160, cx + 45, y0 + 148); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,248,165,0.82)'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(cx - 15, y0 + 43);
  c.bezierCurveTo(cx - 25, y0 + 112, cx + 10, y0 + 149, cx + 28, y0 + 152); c.stroke();
  c.strokeStyle = 'rgba(122,75,18,0.6)'; c.lineWidth = 1.2;
  c.beginPath(); c.moveTo(cx + 5, y0 + 29);
  c.bezierCurveTo(cx - 3, y0 + 84, cx + 15, y0 + 129, cx + 36, y0 + 145); c.stroke();
  c.fillStyle = 'rgba(112,64,13,0.58)';
  for (const [x, y, r] of [[-16, 63, 2.2], [-11, 88, 1.5], [0, 116, 2], [17, 137, 1.8], [9, 51, 1.6]]) {
    c.beginPath(); c.ellipse(cx + x, y0 + y, r, r * 0.67, 0.35, 0, TAU); c.fill();
  }
  // The flesh visibly LEAVES with the shot. An empty brown cavity appears
  // between the opened skins, then cream refills from the bottom during the
  // closing peel. The actual launched projectile contains NO yellow skin.
  c.beginPath(); c.moveTo(cx - 4, y0 + 4);
  c.bezierCurveTo(cx - 11, y0 + 28, cx - 8, y0 + 79, cx, y0 + 106);
  c.quadraticCurveTo(cx + 9, y0 + 68, cx + 6, y0 + 5); c.closePath();
  c.save(); c.clip();
  c.fillStyle = '#6c421d'; c.fillRect(cx - 12, y0 + 2, 24, 106);
  c.fillStyle = lin(c, cx - 7, cx + 9, ['#f4d688', '#fffce8', '#f6e4a6']);
  c.fillRect(cx - 12, y0 + 4 + (1 - flesh) * 102, 24, 102 * flesh);
  if (flesh > 0.3) {
    c.globalAlpha = flesh * 0.7;
    c.fillStyle = '#fffefa';
    c.beginPath(); c.ellipse(cx - 2, y0 + 36, 1.6, 24, 0.08, 0, TAU); c.fill();
  }
  c.restore();
  c.beginPath(); c.moveTo(cx - 4, y0 + 4);
  c.bezierCurveTo(cx - 11, y0 + 28, cx - 8, y0 + 79, cx, y0 + 106);
  c.quadraticCurveTo(cx + 9, y0 + 68, cx + 6, y0 + 5); c.closePath();
  c.strokeStyle = flesh > 0.5 ? '#e2c482' : '#8e5c23';
  c.lineWidth = 1; c.stroke();
  // Hinge the two peels at the neck: opening launches the flesh, closing
  // reloads it. The animation follows shot time, not the scene clock.
  for (const side of [-1, 1]) {
    c.save(); c.translate(cx + side * 8, y0 + 44); c.rotate(side * open * 0.82);
    c.beginPath(); c.moveTo(0, 33);
    c.bezierCurveTo(side * 11, 11, side * 11, -27, side * 4, -39);
    c.quadraticCurveTo(side * -4, -15, side * -5, 25); c.closePath();
    c.fillStyle = lin(c, -11, 11, side < 0
      ? ['#ad7419', '#facc15', '#ffeb69', '#e8ae20']
      : ['#e8ae20', '#fff29a', '#facc15', '#ad7419']);
    c.fill(); c.strokeStyle = '#8d6015'; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = 'rgba(255,249,186,0.9)'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(side * 2, 20);
    c.quadraticCurveTo(side * 7, -8, side * 3, -31); c.stroke();
    c.fillStyle = '#74471a'; c.beginPath(); c.ellipse(side * 4, -38, 2.2, 3, 0, 0, TAU); c.fill();
    c.restore();
  }
  // Small organic stem/nozzle, not a metal firing tube.
  c.fillStyle = '#5d4020'; c.beginPath(); c.roundRect(cx - 4, y0 - 7, 8, 12, 2); c.fill();
  c.fillStyle = '#fbefbf'; c.beginPath(); c.ellipse(cx, y0 + 1, 3.4, 2, 0, 0, TAU); c.fill();
  const glowY = y0 + 35 + (t * 3 % 1) * 37;
  c.fillStyle = `rgba(255,253,210,${0.4 + 0.2 * Math.sin(t * 6)})`;
  c.beginPath(); c.arc(cx - 1, glowY, 1.6, 0, TAU); c.fill();
}

// ------------------------------------------------------------- BUBBLE GUN
export function bubbleGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 100, '#f472b6', '#f9a8d4', 0.75);
  guard(c, cx, y0 + 92, '#9d174d');
  // body
  c.beginPath();
  c.roundRect(cx - 18, y0 + 34, 36, 90, [14, 14, 8, 8]);
  c.fillStyle = lin(c, cx - 18, cx + 18, ['#0e7490', '#67e8f9', '#22d3ee', '#155e75']);
  c.fill();
  c.strokeStyle = '#083344';
  c.lineWidth = 2;
  c.stroke();
  // soap tank
  c.save();
  c.beginPath();
  c.roundRect(cx - 11, y0 + 54, 22, 52, 9);
  c.clip();
  c.fillStyle = 'rgba(253,242,248,0.5)';
  c.fillRect(cx - 11, y0 + 54, 22, 52);
  c.fillStyle = 'rgba(244,114,182,0.6)';
  c.fillRect(cx - 11, y0 + 78 + Math.sin(t * 3) * 2, 22, 30);
  c.strokeStyle = 'rgba(255,255,255,0.9)';
  c.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.arc(cx - 6 + (i % 3) * 6, y0 + 104 - ((t * 20 + i * 9) % 50), 1.5 + (i % 2), 0, TAU);
    c.stroke();
  }
  c.restore();
  c.beginPath();
  c.roundRect(cx - 11, y0 + 54, 22, 52, 9);
  c.strokeStyle = '#831843';
  c.lineWidth = 1.5;
  c.stroke();
  // stars
  star(c, cx + 11, y0 + 44, 4, '#fde047');
  star(c, cx - 12, y0 + 116, 3, '#fde047');
  // neck
  rr(c, cx - 4, y0 + 16, 8, 22, 2, '#be185d');
  // wand ring (iridescent)
  c.beginPath();
  c.ellipse(cx, y0 + 8, 16, 7, 0, 0, TAU);
  const ir = c.createLinearGradient(cx - 16, 0, cx + 16, 0);
  ir.addColorStop(0, 'rgba(255,150,220,0.45)');
  ir.addColorStop(0.5, 'rgba(150,240,255,0.45)');
  ir.addColorStop(1, 'rgba(255,250,150,0.45)');
  c.fillStyle = ir;
  c.fill();
  c.strokeStyle = '#ec4899';
  c.lineWidth = 3;
  c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.8)';
  c.lineWidth = 1;
  c.beginPath();
  c.ellipse(cx - 4, y0 + 6, 7, 2.5, 0, Math.PI, TAU);
  c.stroke();
}

// ------------------------------------------------------------- HARPOON
export function harpoon(c: C, cx: number, y0: number, ready: boolean) {
  // stock/rail
  rr(c, cx - 8, y0 + 22, 16, 236, [3, 3, 8, 8], lin(c, cx - 8, cx + 8, ['#3b1d0a', '#9a5b2c', '#5a2d0c']), '#1c0a00');
  rr(c, cx - 3, y0 + 22, 6, 236, 2, 'rgba(0,0,0,0.3)');
  // muzzle head
  rr(c, cx - 14, y0 + 14, 28, 14, 4, '#111827', '#000', 1);
  // grip
  c.beginPath();
  c.moveTo(cx + 8, y0 + 186);
  c.lineTo(cx + 42, y0 + 214);
  c.lineTo(cx + 32, y0 + 226);
  c.lineTo(cx + 8, y0 + 206);
  c.closePath();
  c.fillStyle = '#111827';
  c.fill();
  guard(c, cx - 8, y0 + 190, '#000', 11);
  // reel
  c.beginPath();
  c.arc(cx - 14, y0 + 210, 12, 0, TAU);
  c.fillStyle = '#0e7490';
  c.fill();
  c.strokeStyle = '#083344';
  c.lineWidth = 2;
  c.stroke();
  c.beginPath();
  c.arc(cx - 14, y0 + 210, 7, 0, TAU);
  c.strokeStyle = '#facc15';
  c.lineWidth = 3;
  c.stroke();
  // bands
  c.strokeStyle = '#1f2937';
  c.lineWidth = 5;
  c.lineCap = 'round';
  const ny = ready ? y0 + 120 : y0 + 30;
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 13, y0 + 20);
    c.lineTo(cx + s * 4, ny);
    c.stroke();
  }
  // spear
  if (ready) {
    c.fillStyle = chrome(c, cx - 1.5, cx + 1.5);
    c.fillRect(cx - 1.5, y0 + 6, 3, 240);
    c.beginPath();
    c.moveTo(cx, y0 - 8);
    c.lineTo(cx + 4.5, y0 + 6);
    c.lineTo(cx - 4.5, y0 + 6);
    c.closePath();
    c.fillStyle = '#e5e7eb';
    c.fill();
    // barbs
    c.strokeStyle = '#cbd5e1';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(cx + 1, y0 + 8);
    c.lineTo(cx + 6, y0 + 16);
    c.moveTo(cx - 1, y0 + 8);
    c.lineTo(cx - 6, y0 + 16);
    c.stroke();
  }
  // line
  c.strokeStyle = '#fef3c7';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(cx - 14, y0 + 198);
  c.quadraticCurveTo(cx - 22, y0 + 150, cx - 2, y0 + 240);
  c.stroke();
}

// ------------------------------------------------------------- RUBBER CHICKEN
export function chickenGun(c: C, cx: number, y0: number, t: number, ready: boolean) {
  // Inflatable chicken launcher: a squeezable rubber hen perches on its own
  // red pump. It compresses and springs back when a chick squeaks away.
  const shot = gunState.sinceShot;
  const squish = shot < 0.24 ? Math.sin(Math.PI * Math.max(0, shot) / 0.24) * 0.16 : 0;
  // Pump, air tube and fleshy hand-held base, not an unrelated striped gun.
  c.strokeStyle = '#8e3123'; c.lineWidth = 7; c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx + 13, y0 + 102);
  c.quadraticCurveTo(cx + 35, y0 + 98, cx + 30, y0 + 128); c.stroke();
  c.strokeStyle = '#ffbd6b'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(cx + 14, y0 + 101);
  c.quadraticCurveTo(cx + 30, y0 + 102, cx + 30, y0 + 122); c.stroke();
  rr(c, cx - 14, y0 + 104, 28, 68, 11,
    lin(c, cx - 14, cx + 14, ['#9a3225', '#f96942', '#cf3a2e', '#8a2e23']), '#692416', 2);
  for (let i = 0; i < 4; i++) {
    c.strokeStyle = 'rgba(255,217,147,0.74)'; c.lineWidth = 1.7;
    c.beginPath(); c.moveTo(cx - 10, y0 + 121 + i * 10);
    c.quadraticCurveTo(cx, y0 + 125 + i * 10, cx + 10, y0 + 121 + i * 10); c.stroke();
  }
  rr(c, cx - 20, y0 + 167, 40, 10, 5, '#a62e28', '#642018', 1.8);
  rr(c, cx - 24, y0 + 90, 48, 20, 9,
    lin(c, cx - 24, cx + 24, ['#d44c23', '#ffe082', '#e7782b', '#ae3029']), '#92330f', 2);
  c.save(); c.translate(cx, y0 + 48 + Math.sin(t * 6) * 0.6);
  c.scale(1 + squish, 1 - squish);
  // Broad chicken-shaped inflatable body and proud tail.
  c.fillStyle = '#f9c13f'; c.beginPath(); c.moveTo(9, 27);
  c.quadraticCurveTo(28, 19, 30, -8);
  c.quadraticCurveTo(39, 12, 33, 35);
  c.quadraticCurveTo(21, 47, 10, 37); c.closePath(); c.fill();
  c.strokeStyle = '#ab6419'; c.lineWidth = 1.5; c.stroke();
  const rubber = c.createLinearGradient(-25, 0, 25, 0);
  rubber.addColorStop(0, '#bc842a'); rubber.addColorStop(0.28, '#facc45');
  rubber.addColorStop(0.58, '#fff492'); rubber.addColorStop(1, '#e6a622');
  c.fillStyle = rubber; c.beginPath(); c.ellipse(0, 17, 23, 40, 0, 0, TAU);
  c.fill(); c.strokeStyle = '#a76418'; c.lineWidth = 1.7; c.stroke();
  c.fillStyle = 'rgba(255,255,213,0.65)';
  c.beginPath(); c.ellipse(-7, 13, 6, 25, -0.16, 0, TAU); c.fill();
  // Plump swept-back wings with embossed feather grooves.
  for (const side of [-1, 1]) {
    c.fillStyle = side < 0 ? '#ffe583' : '#e5a52b';
    c.beginPath(); c.moveTo(side * 15, -2);
    c.quadraticCurveTo(side * 34, 7, side * 26, 30);
    c.quadraticCurveTo(side * 15, 33, side * 12, 20); c.closePath(); c.fill();
    c.strokeStyle = '#a76818'; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = 'rgba(255,255,225,0.62)'; c.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      c.beginPath(); c.moveTo(side * 17, i * 5 + 7);
      c.quadraticCurveTo(side * 23, i * 5 + 9, side * 26, i * 5 + 13); c.stroke();
    }
  }
  // The large face, red comb and orange squeaky beak identify this as a hen.
  c.beginPath(); c.ellipse(0, -27, 19, 20, 0, 0, TAU);
  c.fillStyle = radial(c, -6, -33, 32, ['#fff8c2', '#ffe46b', '#e9ad28']);
  c.fill(); c.strokeStyle = '#a76418'; c.lineWidth = 1.6; c.stroke();
  c.fillStyle = '#e74538';
  for (let i = -1; i <= 1; i++) {
    c.beginPath(); c.arc(i * 7, -46 - (i === 0 ? 5 : 0), 6, 0, TAU); c.fill();
  }
  c.fillStyle = '#fce6bd';
  for (const side of [-1, 1]) {
    c.beginPath(); c.ellipse(side * 9, -38, 4, 2.5, 0.2, 0, TAU); c.fill();
    c.fillStyle = '#322020'; c.beginPath(); c.ellipse(side * 8.5, -31, 2.8, 3.4, 0, 0, TAU); c.fill();
    c.fillStyle = '#fffefa'; c.beginPath(); c.arc(side * 9.4, -32, 0.9, 0, TAU); c.fill();
    c.fillStyle = '#fce6bd';
  }
  c.fillStyle = '#f47b24'; c.beginPath();
  c.moveTo(-9, -21); c.quadraticCurveTo(0, -26, 9, -21);
  c.lineTo(0, -10); c.closePath(); c.fill();
  c.strokeStyle = '#b84b14'; c.lineWidth = 1.3; c.stroke();
  c.fillStyle = '#ed5c39'; c.beginPath(); c.ellipse(11, -17, 3.4, 5, 0.2, 0, TAU); c.fill();
  // Moulded squeaker valve at the top is the actual muzzle.
  c.fillStyle = '#fffbe3'; c.beginPath(); c.ellipse(0, -49, 3, 1.5, 0, 0, TAU); c.fill();
  c.restore();
  if (!ready || shot < 0.18) glow(c, cx, y0 - 8, 2.5, '#fff0ae', 8);
}

// ------------------------------------------------------------- CONFETTI CANNON
export function confettiGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 116, '#7c3aed', '#a78bfa', 0.8);
  guard(c, cx, y0 + 108, '#4c1d95');
  // pull string
  c.strokeStyle = '#fde047';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx - 8, y0 + 140);
  c.quadraticCurveTo(cx - 22, y0 + 160 + Math.sin(t * 3) * 3, cx - 14, y0 + 176);
  c.stroke();
  star(c, cx - 14, y0 + 178, 5, '#fde047');
  // cone
  c.save();
  c.beginPath();
  c.moveTo(cx - 23, y0 + 4);
  c.lineTo(cx + 23, y0 + 4);
  c.lineTo(cx + 11, y0 + 142);
  c.lineTo(cx - 11, y0 + 142);
  c.closePath();
  c.clip();
  c.fillStyle = '#ec4899';
  c.fillRect(cx - 24, y0, 48, 145);
  const cols = ['#facc15', '#22d3ee', '#a855f7'];
  for (let i = -3; i < 12; i++) {
    c.fillStyle = cols[((i % 3) + 3) % 3];
    c.beginPath();
    c.moveTo(cx - 24, y0 + i * 16);
    c.lineTo(cx + 24, y0 + i * 16 - 22);
    c.lineTo(cx + 24, y0 + i * 16 - 15);
    c.lineTo(cx - 24, y0 + i * 16 + 7);
    c.fill();
  }
  c.fillStyle = 'rgba(255,255,255,0.25)';
  c.fillRect(cx - 14, y0, 5, 145);
  c.restore();
  c.beginPath();
  c.moveTo(cx - 23, y0 + 4);
  c.lineTo(cx + 23, y0 + 4);
  c.lineTo(cx + 11, y0 + 142);
  c.lineTo(cx - 11, y0 + 142);
  c.closePath();
  c.strokeStyle = '#831843';
  c.lineWidth = 2;
  c.stroke();
  rr(c, cx - 14, y0 + 136, 28, 10, 4, '#fde047', '#713f12');
  // confetti peeking
  const cc = ['#f43f5e', '#facc15', '#22d3ee', '#4ade80', '#a855f7'];
  for (let i = 0; i < 9; i++) {
    c.save();
    c.translate(cx - 18 + i * 4.5, y0 + 2 + Math.sin(t * 5 + i) * 2);
    c.rotate(i + t);
    c.fillStyle = cc[i % 5];
    c.fillRect(-2, -1, 4, 2.5);
    c.restore();
  }
  c.beginPath();
  c.ellipse(cx, y0 + 4, 23, 4, 0, 0, TAU);
  c.strokeStyle = '#fde047';
  c.lineWidth = 2.5;
  c.stroke();
}

// ------------------------------------------------------------- SEED GUN
export function seedGun(c: C, cx: number, y0: number, t: number) {
  grip(c, cx, y0 + 110, '#78350f', '#a16207', 0.8);
  guard(c, cx, y0 + 102, '#422006');
  // body
  c.beginPath();
  c.roundRect(cx - 17, y0 + 34, 34, 92, [10, 10, 6, 6]);
  c.fillStyle = lin(c, cx - 17, cx + 17, ['#166534', '#4ade80', '#22c55e', '#14532d']);
  c.fill();
  c.strokeStyle = '#052e16';
  c.lineWidth = 2;
  c.stroke();
  // vine
  c.strokeStyle = '#15803d';
  c.lineWidth = 2;
  c.beginPath();
  for (let y = 0; y <= 90; y += 3) c.lineTo(cx + Math.sin(y * 0.12 + t) * 13, y0 + 36 + y);
  c.stroke();
  for (let i = 0; i < 5; i++) {
    const yy = y0 + 44 + i * 18;
    const xx = cx + Math.sin((yy - y0 - 36) * 0.12 + t) * 13;
    c.save();
    c.translate(xx, yy);
    c.rotate(i % 2 ? 0.8 : -0.8);
    c.beginPath();
    c.ellipse(0, -4, 3, 6, 0, 0, TAU);
    c.fillStyle = '#86efac';
    c.fill();
    c.restore();
  }
  // flower pot hopper
  c.beginPath();
  c.moveTo(cx - 38, y0 + 52);
  c.lineTo(cx - 18, y0 + 52);
  c.lineTo(cx - 21, y0 + 84);
  c.lineTo(cx - 35, y0 + 84);
  c.closePath();
  c.fillStyle = lin(c, cx - 38, cx - 18, ['#9a3412', '#ea580c', '#9a3412']);
  c.fill();
  rr(c, cx - 40, y0 + 48, 24, 7, 2, '#c2410c');
  // sprout
  const sw = Math.sin(t * 2) * 0.15;
  c.save();
  c.translate(cx - 28, y0 + 48);
  c.rotate(sw);
  c.strokeStyle = '#16a34a';
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(0, -16);
  c.stroke();
  c.fillStyle = '#4ade80';
  c.beginPath();
  c.ellipse(-5, -15, 5, 2.5, -0.5, 0, TAU);
  c.ellipse(5, -18, 5, 2.5, 0.5, 0, TAU);
  c.fill();
  c.restore();
  // watering rose nozzle
  rr(c, cx - 4, y0 + 14, 8, 22, 2, '#15803d');
  c.beginPath();
  c.moveTo(cx - 12, y0);
  c.lineTo(cx + 12, y0);
  c.lineTo(cx + 5, y0 + 15);
  c.lineTo(cx - 5, y0 + 15);
  c.closePath();
  c.fillStyle = lin(c, cx - 12, cx + 12, ['#a16207', '#facc15', '#a16207']);
  c.fill();
  c.beginPath();
  c.ellipse(cx, y0, 12, 3.5, 0, 0, TAU);
  c.fillStyle = '#ca8a04';
  c.fill();
  c.fillStyle = '#422006';
  for (let i = -2; i <= 2; i++) {
    c.beginPath();
    c.arc(cx + i * 4, y0, 0.9, 0, TAU);
    c.fill();
  }
}
