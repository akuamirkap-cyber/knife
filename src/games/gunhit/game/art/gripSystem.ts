import { TAU, lin, radial } from './kit';

export type GripMat = 'polymer' | 'rubber' | 'wood' | 'metal' | 'g10';

interface Mat {
  base: string; mid: string; dark: string; edge: string; tex: string; texA: number;
}
const MATS: Record<GripMat, Mat> = {
  polymer: { base: '#2b3038', mid: '#1a1d22', dark: '#0a0c0f', edge: '#4a525c', tex: '#ffffff', texA: 0.07 },
  rubber:  { base: '#15171c', mid: '#0d0f12', dark: '#050608', edge: '#33383f', tex: '#ffffff', texA: 0.06 },
  wood:    { base: '#8b4a20', mid: '#5c2f10', dark: '#331808', edge: '#b06a30', tex: '#000000', texA: 0.13 },
  metal:   { base: '#5a626c', mid: '#333940', dark: '#171a1e', edge: '#8a939e', tex: '#ffffff', texA: 0.09 },
  g10:     { base: '#1f232b', mid: '#11141a', dark: '#07080b', edge: '#3d4450', tex: '#ffffff', texA: 0.05 },
};

function shade(c: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(0,0,0,${a})`);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
}

/** Prosedural wood grain that follows the grip's curvature */
function woodGrain(c: CanvasRenderingContext2D, cx: number, y: number) {
  c.save();
  c.clip();
  c.strokeStyle = 'rgba(45,18,4,0.5)';
  c.lineWidth = 1;
  for (let i = 0; i < 9; i++) {
    const o = (i - 4) * 4.2;
    c.beginPath();
    c.moveTo(cx + o * 0.6, y + 30);
    c.bezierCurveTo(cx + o + Math.sin(i) * 5, y + 55, cx + o - Math.sin(i) * 5, y + 78, cx + o * 1.4 + 6, y + 100);
    c.stroke();
  }
  c.strokeStyle = 'rgba(200,140,80,0.3)';
  c.lineWidth = 0.6;
  for (let i = 0; i < 4; i++) {
    const o = (i - 2) * 6;
    c.beginPath();
    c.moveTo(cx + o, y + 34);
    c.bezierCurveTo(cx + o + 3, y + 60, cx + o - 2, y + 84, cx + o + 4, y + 100);
    c.stroke();
  }
  c.restore();
}

/** True diamond checkering pattern clipped to the panel */
function checkering(c: CanvasRenderingContext2D, mat: Mat, cx: number, y: number, w: number, h: number) {
  c.save();
  c.beginPath();
  c.rect(cx, y, w, h);
  c.clip();
  const s = 4.2;
  c.strokeStyle = mat.tex;
  c.globalAlpha = mat.texA;
  c.lineWidth = 0.9;
  for (let row = 0; row * s < h + s; row++) {
    const ry = y + row * s;
    for (let col = -1; col * s < w + s; col++) {
      const rx = cx + col * s + (row % 2) * s * 0.5;
      c.beginPath();
      c.moveTo(rx, ry);
      c.lineTo(rx + s * 0.5, ry + s * 0.5);
      c.lineTo(rx, ry + s);
      c.moveTo(rx, ry + s);
      c.lineTo(rx + s * 0.5, ry + s * 1.5);
      c.stroke();
    }
  }
  c.globalAlpha = 1;
  c.restore();
}

/**
 * Pegangan senjata ultra-detail & ergonomis.
 * Memanjang ke bawah dari (cx, y). Lebar kira-kira 44px, panjang 100px.
 */
export function drawModernGrip(
  c: CanvasRenderingContext2D,
  cx: number,
  y: number,
  accent = '#5a626c',
  mat: GripMat = 'g10',
) {
  const M = MATS[mat] ?? MATS.g10;
  c.save();

  // ══════════════════ 1. SILHOUETTE (ergonomis: beavertail, backstrap, front strap, finger grooves) ══════════════════
  const P = [
    [cx - 11, y + 30], // tang kiri atas (biasa disambungkan ke frame)
    [cx + 7, y + 30],  // tang kanan atas
    [cx + 20, y + 31], // keluar ke beavertail
    [cx + 26, y + 44], // lekukan beavertail (sesuai sela ibu jari)
    [cx + 29, y + 72], // punggung grip melengkung
    [cx + 30, y + 98], // dasar belakang
    [cx + 13, y + 104],// bibir magwell kanan
    [cx + 6, y + 88],  // lekukan jari 3 (lekuk)
    [cx + 7, y + 76],
    [cx + 9, y + 66],  // lekukan jari 2
    [cx + 8, y + 56],
    [cx + 4, y + 48],  // lekukan jari 1
    [cx - 6, y + 42],  // pangkal pelatuk
    [cx - 13, y + 42],
  ] as [number, number][];

  c.beginPath();
  c.moveTo(P[0][0], P[0][1]);
  for (let i = 1; i < P.length; i++) {
    const [x, yy] = P[i];
    const [px, py] = P[i - 1];
    c.quadraticCurveTo(px, py, (px + x) / 2, (py + yy) / 2);
  }
  c.closePath();

  // ══════════════════ 2. BADAN UTAMA dengan gradasi material ══════════════════
  const bg = c.createLinearGradient(cx - 12, y + 30, cx + 30, y + 104);
  bg.addColorStop(0, M.edge);
  bg.addColorStop(0.28, M.base);
  bg.addColorStop(0.62, M.mid);
  bg.addColorStop(1, M.dark);
  c.fillStyle = bg;
  c.fill();

  // aksen warna senjata di sisi dalam (subtle)
  c.save();
  c.clip();
  const ag = c.createLinearGradient(cx - 12, y + 30, cx + 6, y + 104);
  ag.addColorStop(0, 'rgba(255,255,255,0.10)');
  ag.addColorStop(1, accent + '18');
  c.fillStyle = ag;
  c.fillRect(cx - 14, y + 28, 46, 80);
  // ambient occlusion di pinggir bawah
  shade(c, cx + 10, y + 104, 34, 0.4);
  // rim light tepi kiri
  c.strokeStyle = 'rgba(255,255,255,0.22)';
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(cx - 11, y + 32);
  c.quadraticCurveTo(cx - 6, y + 42, cx + 8, y + 56);
  c.quadraticCurveTo(cx + 7, y + 76, cx + 6, y + 88);
  c.stroke();
  c.restore();

  // outline tegas
  c.strokeStyle = '#050608';
  c.lineWidth = 2;
  c.stroke();

  // ══════════════════ 3. PANEL GRIP BER-TEXTSTUR (sisi kanan grip) ══════════════════
  c.save();
  c.beginPath();
  c.moveTo(cx + 8, y + 50);
  c.quadraticCurveTo(cx + 8, y + 78, cx + 13, y + 98);
  c.lineTo(cx + 27, y + 94);
  c.quadraticCurveTo(cx + 25, y + 70, cx + 24, y + 48);
  c.quadraticCurveTo(cx + 16, y + 44, cx + 8, y + 50);
  c.closePath();
  const pg = c.createLinearGradient(cx + 8, y + 46, cx + 27, y + 98);
  pg.addColorStop(0, M.base);
  pg.addColorStop(0.5, M.mid);
  pg.addColorStop(1, M.dark);
  c.fillStyle = pg;
  c.fill();
  c.strokeStyle = '#050608';
  c.lineWidth = 1.4;
  c.stroke();
  if (mat === 'wood') woodGrain(c, cx + 8, y + 44);
  else checkering(c, M, cx + 8, y + 44, 19, 56);
  // highlight sisi panel
  c.strokeStyle = 'rgba(255,255,255,0.16)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(cx + 11, y + 52);
  c.quadraticCurveTo(cx + 11, y + 80, cx + 14, y + 96);
  c.stroke();
  c.restore();

  // ══════════════════ 4. SEK GRIP BER-KILAU (atas & bawah) ══════════════════
  for (const [sy, sx, r] of [[y + 54, cx + 16, 2.6], [y + 90, cx + 20, 2.6]] as [number, number, number][]) {
    c.save();
    c.translate(sx, sy);
    c.beginPath();
    c.arc(0, 0, r, 0, TAU);
    c.fillStyle = radial(c, 0, 0, r, ['#f1f5f9', '#94a3b8', '#334155']);
    c.fill();
    c.strokeStyle = '#0b0e12';
    c.lineWidth = 0.9;
    c.stroke();
    // kait silang
    c.strokeStyle = 'rgba(15,23,42,0.85)';
    c.lineWidth = 0.9;
    c.beginPath();
    c.moveTo(-r * 0.6, 0);
    c.lineTo(r * 0.6, 0);
    c.stroke();
    c.restore();
  }

  // ══════════════════ 5. TRIGGER GUARD + PELATUK (terintegrasi) ══════════════════
  c.save();
  // guard melengkung
  c.beginPath();
  c.moveTo(cx - 15, y + 14);
  c.quadraticCurveTo(cx - 22, y + 36, cx - 14, y + 44);
  c.lineTo(cx - 2, y + 44);
  c.strokeStyle = '#050608';
  c.lineWidth = 3.4;
  c.lineCap = 'round';
  c.stroke();
  // highlight guard
  c.strokeStyle = 'rgba(255,255,255,0.2)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(cx - 16, y + 16);
  c.quadraticCurveTo(cx - 21, y + 34, cx - 14, y + 42);
  c.stroke();
  // pelatuk baja melengkung
  c.beginPath();
  c.moveTo(cx - 9, y + 20);
  c.quadraticCurveTo(cx - 4, y + 27, cx - 6, y + 37);
  c.strokeStyle = lin(c, cx - 8, cx - 5, ['#cbd5e1', '#f8fafc', '#64748b']);
  c.lineWidth = 2.2;
  c.stroke();
  c.restore();

  // ══════════════════ 6. MAGWELL / BASEPLATE melebar ══════════════════
  c.save();
  c.beginPath();
  c.moveTo(cx - 4, y + 96);
  c.lineTo(cx + 30, y + 94);
  c.quadraticCurveTo(cx + 33, y + 100, cx + 29, y + 104);
  c.lineTo(cx - 2, y + 106);
  c.quadraticCurveTo(cx - 6, y + 100, cx - 4, y + 96);
  c.closePath();
  const mw = c.createLinearGradient(cx - 6, y + 94, cx + 32, y + 106);
  mw.addColorStop(0, '#22262c');
  mw.addColorStop(0.5, '#0c0e11');
  mw.addColorStop(1, '#22262c');
  c.fillStyle = mw;
  c.fill();
  c.strokeStyle = '#050608';
  c.lineWidth = 1.6;
  c.stroke();
  // garis magwell
  c.strokeStyle = 'rgba(255,255,255,0.12)';
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(cx - 2, y + 99);
  c.lineTo(cx + 28, y + 97);
  c.stroke();
  c.restore();

  c.restore();
}

/** Pegangan kayu klasik dengan ukiran (untuk senjata klasik) */
export function drawWoodGrip(c: CanvasRenderingContext2D, cx: number, y: number) {
  drawModernGrip(c, cx, y, '#b06a30', 'wood');
}

/** Pegangan futuristik dengan garis LED (untuk senjata sci-fi) */
export function drawCyberGrip(c: CanvasRenderingContext2D, cx: number, y: number, color: string, t = 0) {
  drawModernGrip(c, cx, y, color, 'g10');
  c.save();
  const pulse = 0.55 + 0.45 * Math.sin(t * 6);
  c.shadowColor = color;
  c.shadowBlur = 8 * pulse;
  c.strokeStyle = color;
  c.lineWidth = 1.4;
  c.globalAlpha = 0.55 + 0.4 * pulse;
  // garis LED vertikal di sisi grip
  c.beginPath();
  c.moveTo(cx + 3, y + 50);
  c.quadraticCurveTo(cx + 4, y + 78, cx + 8, y + 96);
  c.stroke();
  c.restore();
}
