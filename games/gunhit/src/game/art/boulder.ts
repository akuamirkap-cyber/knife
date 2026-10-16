import { TAU } from './kit';

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Silhouette batuguntingan acak tapi stabil per-index (pakai seed) */
function rockOutline(c: CanvasRenderingContext2D, R: number, seed: number, jag: number) {
  const pts = 14;
  c.beginPath();
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * TAU;
    const n = Math.sin(seed + i * 2.3) * Math.cos(seed * 1.7 + i * 1.1);
    const r = R * (1 + n * jag);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r * 0.94;
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.closePath();
}

/**
 * Bongkahan batu besar dengan berlian besar di tengahnya.
 * hpRatio 0..1 (1 = utuh, 0 = hampir hancur) mengontrol retakan.
 */
export function drawBoulder(c: CanvasRenderingContext2D, R: number, hpRatio: number, time: number) {
  const seed = 3.7;

  // ══════════════ 1. BAYANGAN jatuh ke bawah ══════════════
  c.save();
  c.globalAlpha = 0.4;
  c.beginPath();
  c.ellipse(6, 18, R * 1.02, R * 0.96, 0, 0, TAU);
  c.fillStyle = '#000';
  c.fill();
  c.restore();

  // ══════════════ 2. BADAN BATU ══════════════
  c.save();
  rockOutline(c, R, seed, 0.09);
  const rg = c.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.15, 0, 0, R);
  rg.addColorStop(0, '#8a8579');
  rg.addColorStop(0.45, '#5c574d');
  rg.addColorStop(0.75, '#3d3931');
  rg.addColorStop(1, '#23211c');
  c.fillStyle = rg;
  c.fill();

  // Tekstur butiran batu di dalam clip
  c.save();
  c.clip();
  // bintik-bintik mineral
  for (let i = 0; i < 260; i++) {
    const a = rand(0, TAU);
    const r = Math.sqrt(Math.random()) * R * 0.97;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    const shade = Math.random();
    c.fillStyle = shade < 0.35
      ? `rgba(255,255,255,${rand(0.05, 0.16)})`
      : shade < 0.6
      ? `rgba(0,0,0,${rand(0.08, 0.22)})`
      : `rgba(140,125,95,${rand(0.06, 0.18)})`;
    c.fillRect(px, py, rand(1, 3), rand(1, 3));
  }
  // retakan acak statis (tetap sama tiap frame)
  c.strokeStyle = 'rgba(10,8,6,0.55)';
  c.lineWidth = 1.1;
  for (let i = 0; i < 7; i++) {
    const a0 = rand(0, TAU);
    const x0 = Math.cos(a0) * R * 0.85;
    const y0 = Math.sin(a0) * R * 0.8;
    c.beginPath();
    c.moveTo(x0, y0);
    let cx = x0;
    let cy = y0;
    for (let k = 0; k < 4; k++) {
      cx += Math.cos(a0 + rand(-0.8, 0.8)) * R * 0.16;
      cy += Math.sin(a0 + rand(-0.8, 0.8)) * R * 0.16;
      c.lineTo(cx, cy);
    }
    c.stroke();
  }
  // ambient occlusion tepi
  const ao = c.createRadialGradient(0, 0, R * 0.55, 0, 0, R);
  ao.addColorStop(0, 'rgba(0,0,0,0)');
  ao.addColorStop(1, 'rgba(0,0,0,0.6)');
  c.fillStyle = ao;
  c.fillRect(-R, -R, R * 2, R * 2);
  // rim light atas
  c.strokeStyle = 'rgba(255,245,220,0.35)';
  c.lineWidth = 2.5;
  c.beginPath();
  c.arc(0, 0, R * 0.93, Math.PI * 1.08, Math.PI * 1.92);
  c.stroke();
  c.restore();

  // outline
  c.strokeStyle = '#0b0a08';
  c.lineWidth = 3;
  c.stroke();
  c.restore();

  // ══════════════ 3. RETAKAN YANG MEMBESAR SAAT HP TURUN ══════════════
  const dmg = 1 - hpRatio;
  if (dmg > 0.12) {
    c.save();
    rockOutline(c, R, seed, 0.09);
    c.clip();
    const cracks = Math.min(14, Math.floor(dmg * 16));
    for (let i = 0; i < cracks; i++) {
      const a = rand(0, TAU);
      const x0 = Math.cos(a) * R * 0.9;
      const y0 = Math.sin(a) * R * 0.85;
      c.strokeStyle = 'rgba(8,6,4,0.85)';
      c.lineWidth = rand(1.2, 2.6);
      c.beginPath();
      c.moveTo(x0, y0);
      let cx = x0;
      let cy = y0;
      const len = rand(3, 6);
      for (let k = 0; k < len; k++) {
        cx += Math.cos(a + rand(-0.9, 0.9)) * R * 0.15;
        cy += Math.sin(a + rand(-0.9, 0.9)) * R * 0.15;
        c.lineTo(cx, cy);
      }
      c.stroke();
      // highlight sisi retakan
      c.strokeStyle = 'rgba(255,250,235,0.4)';
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(x0, y0);
      c.lineTo(cx, cy);
      c.stroke();
    }
    c.restore();
  }

  // ══════════════ 4. BERLIAN BESAR DI TENGAH (selalu bersih & terlihat) ══════════════
  c.save();
  c.translate(0, 4);
  const D = R * 0.52;
  const pulse = 0.75 + 0.25 * Math.sin(time * 3);

  // aura berkilau
  c.save();
  c.globalCompositeOperation = 'lighter';
  const aura = c.createRadialGradient(0, 0, D * 0.5, 0, 0, D * 2.6);
  aura.addColorStop(0, `rgba(186,230,253,${0.5 * pulse})`);
  aura.addColorStop(0.4, `rgba(125,211,252,${0.22 * pulse})`);
  aura.addColorStop(1, 'rgba(56,189,248,0)');
  c.fillStyle = aura;
  c.beginPath();
  c.arc(0, 0, D * 2.6, 0, TAU);
  c.fill();
  c.restore();

  // sinar-sinar cahaya
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU + time * 0.5;
    const l = D * (1.5 + 0.35 * Math.sin(time * 3 + i));
    const g = c.createLinearGradient(0, 0, Math.cos(a) * l, Math.sin(a) * l);
    g.addColorStop(0, `rgba(224,242,254,${0.4 * pulse})`);
    g.addColorStop(1, 'rgba(224,242,254,0)');
    c.strokeStyle = g;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(Math.cos(a) * l, Math.sin(a) * l);
    c.stroke();
  }
  c.restore();

  // bentuk intan brilliant-cut
  c.beginPath();
  c.moveTo(0, -D);              // titik atas
  c.lineTo(D * 0.55, -D * 0.3); // sisi kanan atas
  c.lineTo(D * 0.95, D * 0.35); // sisi kanan bawah
  c.lineTo(D * 0.35, D);        // dasar kanan
  c.lineTo(-D * 0.35, D);       // dasar kiri
  c.lineTo(-D * 0.95, D * 0.35);
  c.lineTo(-D * 0.55, -D * 0.3);
  c.closePath();
  const dg = c.createLinearGradient(-D, -D, D, D);
  dg.addColorStop(0, '#ffffff');
  dg.addColorStop(0.3, '#e0f2fe');
  dg.addColorStop(0.6, '#7dd3fc');
  dg.addColorStop(1, '#0369a1');
  c.fillStyle = dg;
  c.fill();
  c.strokeStyle = '#f0f9ff';
  c.lineWidth = 2;
  c.stroke();

  // faset dalam
  c.strokeStyle = 'rgba(255,255,255,0.85)';
  c.lineWidth = 1;
  c.beginPath();
  c.moveTo(-D * 0.55, -D * 0.3);
  c.lineTo(D * 0.55, -D * 0.3);
  c.moveTo(0, -D);
  c.lineTo(-D * 0.55, -D * 0.3);
  c.lineTo(-D * 0.35, D);
  c.lineTo(D * 0.35, D);
  c.lineTo(D * 0.55, -D * 0.3);
  c.lineTo(0, -D);
  c.moveTo(-D * 0.95, D * 0.35);
  c.lineTo(D * 0.95, D * 0.35);
  c.stroke();
  // kilauan inti
  c.fillStyle = 'rgba(255,255,255,0.9)';
  c.beginPath();
  c.ellipse(-D * 0.18, -D * 0.12, D * 0.16, D * 0.3, 0.4, 0, TAU);
  c.fill();
  c.restore();
}

/** Bintang power-up 3 pilihan */
export function drawStar(c: CanvasRenderingContext2D, x: number, y: number, r: number, time: number, rgb: string) {
  c.save();
  c.translate(x, y);
  const pulse = 0.85 + 0.15 * Math.sin(time * 6);

  // aura
  c.save();
  c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 3);
  g.addColorStop(0, `rgba(${rgb},${0.7 * pulse})`);
  g.addColorStop(0.4, `rgba(${rgb},${0.25 * pulse})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, r * 3, 0, TAU);
  c.fill();
  // sinar berputar
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + time * 1.5;
    const l = r * (2 + 0.3 * Math.sin(time * 5 + i));
    const lg = c.createLinearGradient(0, 0, Math.cos(a) * l, Math.sin(a) * l);
    lg.addColorStop(0, `rgba(255,255,255,${0.5 * pulse})`);
    lg.addColorStop(1, 'rgba(255,255,255,0)');
    c.strokeStyle = lg;
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(Math.cos(a) * l, Math.sin(a) * l);
    c.stroke();
  }
  c.restore();

  // bintang 5 sudut
  c.rotate(time * 1.2);
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = (i / 10) * TAU - Math.PI / 2;
    c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  c.closePath();
  const sg = c.createRadialGradient(-r * 0.2, -r * 0.3, r * 0.1, 0, 0, r);
  sg.addColorStop(0, '#ffffff');
  sg.addColorStop(0.5, `rgb(${rgb})`);
  sg.addColorStop(1, '#b45309');
  c.fillStyle = sg;
  c.shadowColor = `rgb(${rgb})`;
  c.shadowBlur = 18 * pulse;
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = '#ffffff';
  c.lineWidth = 1.5;
  c.stroke();
  c.restore();
}

/** Pecahan bongkahan batu (untuk efek hancur) */
export function drawRockFragment(c: CanvasRenderingContext2D, size: number, seed: number) {
  const pts = 7;
  c.beginPath();
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * TAU;
    const n = Math.sin(seed + i * 1.9);
    const r = size * (0.7 + n * 0.35);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) c.moveTo(x, y);
    else c.lineTo(x, y);
  }
  c.closePath();
  const g = c.createLinearGradient(-size, -size, size, size);
  g.addColorStop(0, '#8a8579');
  g.addColorStop(0.5, '#5c574d');
  g.addColorStop(1, '#2a2823');
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = 'rgba(10,8,6,0.8)';
  c.lineWidth = 1;
  c.stroke();
}
