import type { WeaponId } from '../weapons';
import { TAU, lin, steel, rr, guard, glow, radial } from './kit';
import { drawModernGrip } from './gripSystem';

type C = CanvasRenderingContext2D;

// ------------------------------------------------------------- 1. REVOLVER KELANA (Cowboy)
function loneStar(c: C, cx: number, y0: number, t: number, ready: boolean) {
  drawModernGrip(c, cx, y0 + 54, '#b06a30', 'wood'); // nyambung ke frame y0+82
  guard(c, cx, y0 + 70, '#111', 12);
  // Frame
  rr(c, cx - 11, y0 + 42, 22, 40, 3, lin(c, cx - 11, cx + 11, ['#0a0a0a', '#3a3a3a', '#0a0a0a']), '#000', 1.5);
  // Barrel
  rr(c, cx - 5, y0 + 4, 10, 42, 2, lin(c, cx - 5, cx + 5, ['#111', '#64748b', '#111']), '#000', 1.2);
  // Muzzle ring
  rr(c, cx - 6, y0 - 2, 12, 8, 2, '#78350f', '#000', 1);
  // Drum peluru (berputar)
  const drum = cx;
  c.save();
  c.translate(drum, y0 + 62);
  c.beginPath();
  c.arc(0, 0, 17, 0, TAU);
  c.fillStyle = radial(c, 0, 0, 17, ['#a8a29e', '#44403c', '#1c1917']);
  c.fill();
  c.strokeStyle = '#fbbf24';
  c.lineWidth = 2;
  c.stroke();
  c.restore();
  // 6 chamber holes
  const rot = ready ? Math.sin(t) * 0.02 : 0;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + rot;
    c.beginPath();
    c.arc(cx + Math.cos(a) * 11, y0 + 62 + Math.sin(a) * 11, 3.2, 0, TAU);
    c.fillStyle = '#0c0a09';
    c.fill();
    c.strokeStyle = '#a8a29e';
    c.lineWidth = 0.8;
    c.stroke();
  }
  // Hammer
  c.beginPath();
  c.moveTo(cx + 4, y0 + 40);
  c.lineTo(cx + 12, y0 + 26);
  c.lineTo(cx + 16, y0 + 32);
  c.lineTo(cx + 8, y0 + 46);
  c.closePath();
  c.fillStyle = '#44403c';
  c.fill();
  c.strokeStyle = '#000';
  c.lineWidth = 1;
  c.stroke();
  // Ukiran emas "LONE STAR"
  c.fillStyle = '#fbbf24';
  c.beginPath();
  c.arc(cx - 6, y0 + 22, 3, 0, TAU);
  c.fill();
}

// ------------------------------------------------------------- 2. PHOTON SABER
function photonSaber(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.75 + 0.25 * Math.sin(t * 12);
  // Handle
  rr(c, cx - 5, y0 + 190, 10, 50, 3, steel(c, cx - 5, cx + 5), '#000', 1);
  for (let i = 0; i < 5; i++) rr(c, cx - 5, y0 + 200 + i * 7, 10, 3, 1, '#1f2937');
  // Emitter
  rr(c, cx - 7, y0 + 180, 14, 14, 2, '#334155', '#000', 1.2);
  // Bilah energi (photon blade) — gradient cyan
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.shadowColor = '#22d3ee';
  c.shadowBlur = 22 * pulse;
  const bg = c.createLinearGradient(0, y0, 0, y0 + 180);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(0.35, '#e0f2fe');
  bg.addColorStop(0.7, '#22d3ee');
  bg.addColorStop(1, 'rgba(34,211,238,0.2)');
  c.fillStyle = bg;
  c.beginPath();
  c.roundRect(cx - 3.5, y0, 7, 185, 4);
  c.fill();
  // Core putih
  c.fillStyle = `rgba(255,255,255,${0.85 * pulse})`;
  c.beginPath();
  c.roundRect(cx - 1.2, y0 + 4, 2.4, 178, 2);
  c.fill();
  c.restore();
  glow(c, cx, y0 + 2, 4, '#ffffff', 16);
}

// ------------------------------------------------------------- 3. PLASMA REPEATER
function plasmaRepeater(c: C, cx: number, y0: number) {
  drawModernGrip(c, cx, y0 + 84, '#f43f5e', 'g10'); // nyambung ke body y0+112
  guard(c, cx, y0 + 100, '#000', 13);
  // Body sci-fi
  rr(c, cx - 13, y0 + 72, 26, 40, 4, lin(c, cx - 13, cx + 13, ['#0f172a', '#475569', '#0f172a']), '#000', 1.5);
  // Cooling vents
  c.fillStyle = '#f43f5e';
  for (let i = 0; i < 4; i++) c.fillRect(cx - 9, y0 + 78 + i * 6, 18, 2);
  // Barrel dengan dua lubang
  rr(c, cx - 6, y0 + 4, 12, 70, 3, lin(c, cx - 6, cx + 6, ['#111', '#64748b', '#111']), '#000', 1);
  for (const s of [-1, 1]) {
    c.beginPath();
    c.arc(cx + s * 4, y0 + 4, 2, 0, TAU);
    c.fillStyle = '#000';
    c.fill();
    glow(c, cx + s * 4, y0 + 3, 1.8, '#f43f5e', 8);
  }
  // LED strip
  c.fillStyle = '#f43f5e';
  c.shadowColor = '#f43f5e';
  c.shadowBlur = 6;
  c.fillRect(cx - 4, y0 + 50, 8, 16);
  c.shadowBlur = 0;
  // Scope
  rr(c, cx - 20, y0 + 60, 9, 26, 3, '#1e293b', '#000', 1);
}

// ------------------------------------------------------------- 4. WARP DISRUPTOR
function warpDisruptor(c: C, cx: number, y0: number) {
  // Genggam belakang (nyambung ke badan y0+160)
  drawModernGrip(c, cx, y0 + 132, '#22c55e', 'g10');
  // Cakrawala superlaser
  c.beginPath();
  c.moveTo(cx - 40, y0 + 160);
  c.lineTo(cx + 40, y0 + 160);
  c.lineTo(cx + 26, y0 + 40);
  c.lineTo(cx - 26, y0 + 40);
  c.closePath();
  c.fillStyle = lin(c, cx - 40, cx + 40, ['#0a0f0a', '#2a3a2a', '#0a0f0a']);
  c.fill();
  c.strokeStyle = '#16a34a';
  c.lineWidth = 2;
  c.stroke();
  // Lensa hijau raksasa
  c.beginPath();
  c.arc(cx, y0 + 44, 20, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 44, 20, ['#dcfce7', '#22c55e', '#052e16']);
  c.shadowColor = '#22c55e';
  c.shadowBlur = 20;
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = '#166534';
  c.lineWidth = 3;
  c.stroke();
  // Ring lensa
  c.strokeStyle = '#4ade80';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(cx, y0 + 44, 26, 0, TAU);
  c.stroke();
  // Panel-panel detail
  c.fillStyle = '#22c55e';
  for (let i = 0; i < 5; i++) c.fillRect(cx - 30 + i * 15, y0 + 140, 8, 3);
  // Cahaya sinar hijau naik
  c.save();
  c.globalCompositeOperation = 'lighter';
  const g = c.createLinearGradient(0, y0 + 44, 0, y0 - 40);
  g.addColorStop(0, 'rgba(34,197,94,0.55)');
  g.addColorStop(1, 'rgba(34,197,94,0)');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(cx - 16, y0 + 44);
  c.lineTo(cx + 16, y0 + 44);
  c.lineTo(cx + 30, y0 - 40);
  c.lineTo(cx - 30, y0 - 40);
  c.closePath();
  c.fill();
  c.restore();
}

// ------------------------------------------------------------- 5. DEFLECTOR SHIELD
function deflectorShield(c: C, cx: number, y0: number, t: number) {
  drawModernGrip(c, cx, y0 + 80, '#818cf8', 'g10'); // nyambung ke body y0+108
  guard(c, cx, y0 + 96, '#000', 12);
  rr(c, cx - 14, y0 + 66, 28, 42, 5, lin(c, cx - 14, cx + 14, ['#0f172a', '#4338ca', '#0f172a']), '#000', 1.5);
  // Peluncur berbentuk sayap
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 8, y0 + 70);
    c.lineTo(cx + s * 28, y0 + 44);
    c.lineTo(cx + s * 26, y0 + 36);
    c.lineTo(cx + s * 6, y0 + 60);
    c.closePath();
    c.fillStyle = '#4f46e5';
    c.fill();
    c.strokeStyle = '#0f172a';
    c.lineWidth = 1;
    c.stroke();
  }
  // Emitter inti
  const pulse = 0.7 + 0.3 * Math.sin(t * 8);
  c.beginPath();
  c.arc(cx, y0 + 20, 11, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 20, 11, ['#ffffff', '#818cf8', '#312e81']);
  c.shadowColor = '#818cf8';
  c.shadowBlur = 16 * pulse;
  c.fill();
  c.shadowBlur = 0;
  // Cincin perisai
  c.strokeStyle = `rgba(199,210,254,${0.5 + 0.4 * pulse})`;
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(cx, y0 + 20, 18, 7, 0, 0, TAU);
  c.stroke();
}

// ------------------------------------------------------------- 6. GAUNTLET CANNON
function gauntletCannon(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.75 + 0.25 * Math.sin(t * 7);
  // Lengan pelindung
  c.beginPath();
  c.roundRect(cx - 20, y0 + 116, 40, 76, [10, 10, 12, 12]);
  c.fillStyle = lin(c, cx - 20, cx + 20, ['#1f2937', '#4b5563', '#1f2937']);
  c.fill();
  c.strokeStyle = '#000';
  c.lineWidth = 2;
  c.stroke();
  c.fillStyle = '#fbbf24';
  c.fillRect(cx - 20, y0 + 140, 40, 4);
  // Telapak tangan
  c.beginPath();
  c.roundRect(cx - 24, y0 + 40, 48, 80, [12, 12, 8, 8]);
  c.fillStyle = lin(c, cx - 24, cx + 24, ['#7f1d1d', '#dc2626', '#7f1d1d']);
  c.fill();
  c.strokeStyle = '#000';
  c.lineWidth = 2;
  c.stroke();
  // Jari mekanik
  for (let i = 0; i < 3; i++) {
    const y = y0 + 100 + i * 10;
    rr(c, cx - 22, y, 44, 8, 3, '#991b1b', '#000', 1);
  }
  // Inti energi di telapak
  c.beginPath();
  c.arc(cx, y0 + 62, 15, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 62, 15, ['#ffffff', '#fca5a5', '#7f1d1d']);
  c.shadowColor = '#ef4444';
  c.shadowBlur = 20 * pulse;
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = '#fbbf24';
  c.lineWidth = 3;
  c.stroke();
  glow(c, cx, y0 + 58, 4, '#ffffff', 16);
}

// ------------------------------------------------------------- 7. ALIEN RAY
function alienRay(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.7 + 0.3 * Math.sin(t * 10);
  // Grip hijau alien
  c.beginPath();
  c.moveTo(cx - 4, y0 + 130);
  c.quadraticCurveTo(cx + 16, y0 + 160, cx + 12, y0 + 190);
  c.lineTo(cx + 28, y0 + 182);
  c.quadraticCurveTo(cx + 32, y0 + 150, cx + 10, y0 + 124);
  c.closePath();
  c.fillStyle = '#166534';
  c.fill();
  c.strokeStyle = '#052e16';
  c.lineWidth = 1.5;
  c.stroke();
  // Badan silindris alien
  c.beginPath();
  c.roundRect(cx - 14, y0 + 40, 28, 92, 8);
  c.fillStyle = lin(c, cx - 14, cx + 14, ['#052e16', '#4ade80', '#052e16']);
  c.fill();
  c.strokeStyle = '#14532d';
  c.lineWidth = 2;
  c.stroke();
  // Tentakel
  c.strokeStyle = '#22c55e';
  c.lineWidth = 3;
  c.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.moveTo(cx - 12, y0 + 128);
    c.quadraticCurveTo(cx - 20 - i * 6, y0 + 150 + Math.sin(t * 5 + i) * 8, cx - 12 - i * 8, y0 + 170);
    c.stroke();
  }
  // Kepala alien kecil di atas
  c.beginPath();
  c.ellipse(cx, y0 + 30, 12, 11, 0, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 30, 12, ['#bbf7d0', '#4ade80', '#166534']);
  c.fill();
  c.strokeStyle = '#14532d';
  c.stroke();
  // Mata alien besar
  for (const s of [-1, 1]) {
    c.beginPath();
    c.ellipse(cx + s * 5, y0 + 28, 3.5, 4.5, s * 0.4, 0, TAU);
    c.fillStyle = '#0f172a';
    c.fill();
  }
  glow(c, cx + 5, y0 + 28, 1.5, '#4ade80', 6);
  // Muzzle hijau
  c.beginPath();
  c.arc(cx, y0 + 14, 7, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 14, 7, ['#ffffff', '#4ade80', '#166534']);
  c.shadowColor = '#4ade80';
  c.shadowBlur = 14 * pulse;
  c.fill();
  c.shadowBlur = 0;
}

// ------------------------------------------------------------- 8. PULSE RIFLE
function pulseRifle(c: C, cx: number, y0: number) {
  drawModernGrip(c, cx, y0 + 92, '#38bdf8', 'g10'); // nyambung ke receiver y0+120
  guard(c, cx, y0 + 108, '#000', 12);
  // Receiver
  rr(c, cx - 13, y0 + 78, 26, 42, 4, lin(c, cx - 13, cx + 13, ['#020617', '#334155', '#020617']), '#000', 1.5);
  // Scope kotak sci-fi
  rr(c, cx - 22, y0 + 60, 10, 30, 2, '#0f172a', '#000', 1);
  c.fillStyle = '#38bdf8';
  c.fillRect(cx - 20, y0 + 66, 6, 3);
  // Barrel panjang dengan coil
  rr(c, cx - 5, y0 + 6, 10, 76, 2, lin(c, cx - 5, cx + 5, ['#111', '#64748b', '#111']), '#000', 1.2);
  c.strokeStyle = '#38bdf8';
  c.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    c.beginPath();
    c.moveTo(cx - 8, y0 + 16 + i * 11);
    c.lineTo(cx + 8, y0 + 22 + i * 11);
    c.stroke();
  }
  // Muzzle
  rr(c, cx - 7, y0 - 2, 14, 10, 3, '#0f172a', '#000', 1);
  glow(c, cx, y0 - 1, 3, '#38bdf8', 12);
  // LED
  c.fillStyle = '#38bdf8';
  c.shadowColor = '#38bdf8';
  c.shadowBlur = 8;
  c.fillRect(cx - 8, y0 + 44, 16, 4);
  c.shadowBlur = 0;
}

// ------------------------------------------------------------- 9. CRYO BLASTER
function cryoBlaster(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.7 + 0.3 * Math.sin(t * 6);
  drawModernGrip(c, cx, y0 + 86, '#22d3ee', 'g10'); // nyambung ke badan y0+114
  // Tangki pendingin
  rr(c, cx - 32, y0 + 52, 20, 62, 9, lin(c, cx - 32, cx - 12, ['#0c1e4a', '#3b82f6', '#0c1e4a']), '#000', 1.5);
  c.save();
  c.shadowColor = '#22d3ee';
  c.shadowBlur = 8 * pulse;
  c.fillStyle = 'rgba(103,232,249,0.55)';
  c.fillRect(cx - 28, y0 + 68 + (1 - pulse) * 8, 12, 42);
  c.restore();
  // Badan
  rr(c, cx - 15, y0 + 58, 30, 56, 6, lin(c, cx - 15, cx + 15, ['#0c1e4a', '#2563eb', '#0c1e4a']), '#000', 1.5);
  // Muzzle pembeku berbentuk paruh
  c.beginPath();
  c.moveTo(cx - 14, y0 + 58);
  c.lineTo(cx + 14, y0 + 58);
  c.lineTo(cx + 7, y0 + 20);
  c.lineTo(cx - 7, y0 + 20);
  c.closePath();
  c.fillStyle = lin(c, cx - 14, cx + 14, ['#1e3a8a', '#93c5fd', '#1e3a8a']);
  c.fill();
  c.strokeStyle = '#0c1e4a';
  c.lineWidth = 2;
  c.stroke();
  // Kristal es di ujung
  c.save();
  c.translate(cx, y0 + 18);
  c.rotate(Math.sin(t * 3) * 0.1);
  c.strokeStyle = 'rgba(255,255,255,0.9)';
  c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(0, -8); c.lineTo(0, 6);
  c.moveTo(-5, -1); c.lineTo(5, -1);
  c.moveTo(-3, -4); c.lineTo(3, 2);
  c.moveTo(3, -4); c.lineTo(-3, 2);
  c.stroke();
  c.restore();
  glow(c, cx, y0 + 12, 3, '#a5f3fc', 14);
  // Uap dingin
  for (let i = 0; i < 3; i++) {
    c.fillStyle = `rgba(186,230,253,${0.35 - i * 0.08})`;
    c.beginPath();
    c.arc(cx - 12 + i * 4, y0 + 16 - i * 8 - Math.sin(t * 4 + i) * 3, 3 - i * 0.5, 0, TAU);
    c.fill();
  }
}

// ------------------------------------------------------------- 10. HYPERDRIVE CANNON
function hyperdrive(c: C, cx: number, y0: number, t: number) {
  const pulse = 0.7 + 0.3 * Math.sin(t * 9);
  drawModernGrip(c, cx, y0 + 94, '#60a5fa', 'g10'); // nyambung ke badan y0+122
  guard(c, cx, y0 + 110, '#000', 12);
  // Badan pesawat
  rr(c, cx - 16, y0 + 74, 32, 48, 6, lin(c, cx - 16, cx + 16, ['#0c1e4a', '#3b82f6', '#0c1e4a']), '#000', 1.5);
  // Sayap samping
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(cx + s * 14, y0 + 80);
    c.lineTo(cx + s * 30, y0 + 62);
    c.lineTo(cx + s * 28, y0 + 54);
    c.lineTo(cx + s * 12, y0 + 68);
    c.closePath();
    c.fillStyle = '#2563eb';
    c.fill();
    c.strokeStyle = '#0c1e4a';
    c.lineWidth = 1;
    c.stroke();
  }
  // Laras panjang
  rr(c, cx - 6, y0 + 8, 12, 70, 4, lin(c, cx - 6, cx + 6, ['#111', '#64748b', '#111']), '#000', 1.2);
  // Emitir berminyak
  c.beginPath();
  c.arc(cx, y0 + 10, 9, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 10, 9, ['#ffffff', '#60a5fa', '#1e3a8a']);
  c.shadowColor = '#60a5fa';
  c.shadowBlur = 16 * pulse;
  c.fill();
  c.shadowBlur = 0;
  // Kilat antariksa
  c.save();
  c.globalCompositeOperation = 'lighter';
  c.strokeStyle = `rgba(147,197,253,${0.6 + 0.4 * pulse})`;
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(cx - 8, y0 + 4);
  c.lineTo(cx - 2, y0 - 10);
  c.lineTo(cx + 3, y0 - 2);
  c.lineTo(cx + 9, y0 - 14);
  c.stroke();
  c.restore();
  // LED panel
  c.fillStyle = '#60a5fa';
  c.shadowColor = '#60a5fa';
  c.shadowBlur = 6;
  c.fillRect(cx - 8, y0 + 90, 16, 5);
  c.fillRect(cx - 8, y0 + 100, 16, 3);
  c.shadowBlur = 0;
}

// ------------------------------------------------------------- 11. QUANTUM DESTABILIZER
function quantumDestabilizer(c: C, cx: number, y0: number, t: number) {
  drawModernGrip(c, cx, y0 + 84, '#a855f7', 'g10'); // nyambung ke badan y0+112
  guard(c, cx, y0 + 100, '#000', 12);
  // Badan ungu
  rr(c, cx - 15, y0 + 68, 30, 44, 5, lin(c, cx - 15, cx + 15, ['#1a0533', '#7e22ce', '#1a0533']), '#000', 1.5);
  // Cincin kuantum
  for (let i = 0; i < 3; i++) {
    const yy = y0 + 74 + i * 12;
    c.strokeStyle = i === 1 ? '#e9d5ff' : '#a855f7';
    c.lineWidth = 2;
    c.beginPath();
    c.ellipse(cx, yy, 18, 4, Math.sin(t * 2 + i) * 0.2, 0, TAU);
    c.stroke();
  }
  // Laras
  rr(c, cx - 6, y0 + 4, 12, 68, 3, lin(c, cx - 6, cx + 6, ['#111', '#a855f7', '#111']), '#000', 1.2);
  // Mata portal
  const pulse = 0.7 + 0.3 * Math.sin(t * 8);
  c.beginPath();
  c.ellipse(cx, y0 + 8, 10, 8, 0, 0, TAU);
  c.fillStyle = radial(c, cx, y0 + 8, 10, ['#ffffff', '#d8b4fe', '#4c1d95']);
  c.shadowColor = '#a855f7';
  c.shadowBlur = 16 * pulse;
  c.fill();
  c.shadowBlur = 0;
  c.fillStyle = '#000';
  c.beginPath();
  c.ellipse(cx, y0 + 8, 3, 2.5, 0, 0, TAU);
  c.fill();
  // Partikel kuantum
  for (let i = 0; i < 3; i++) {
    const a = t * 2 + i * 2;
    glow(c, cx + Math.cos(a) * 18, y0 + 70 + Math.sin(a * 1.5) * 10, 1.5, '#e9d5ff', 8);
  }
}

// ================================================================ dispatch
export function drawGunExtra4(c: C, id: WeaponId, cx: number, y0: number, t: number, _ready: boolean) {
  switch (id) {
    case 'lone_star': loneStar(c, cx, y0, t, _ready); break;
    case 'photon_saber': photonSaber(c, cx, y0, t); break;
    case 'plasma_repeater': plasmaRepeater(c, cx, y0); break;
    case 'warp_disruptor': warpDisruptor(c, cx, y0); break;
    case 'deflector_shield': deflectorShield(c, cx, y0, t); break;
    case 'gauntlet_cannon': gauntletCannon(c, cx, y0, t); break;
    case 'alien_ray': alienRay(c, cx, y0, t); break;
    case 'pulse_rifle': pulseRifle(c, cx, y0); break;
    case 'cryo_blaster': cryoBlaster(c, cx, y0, t); break;
    case 'hyperdrive': hyperdrive(c, cx, y0, t); break;
    case 'quantum_destabilizer': quantumDestabilizer(c, cx, y0, t); break;
    default: break;
  }
}

// ================================================================ muzzle flashes
type Flash4 = { k: 'fire'; s: number } | { k: 'energy'; rgb: string; r: number };
export const FLASH4: Partial<Record<WeaponId, Flash4>> = {
  lone_star: { k: 'fire', s: 1.4 },
  photon_saber: { k: 'energy', rgb: '34,211,238', r: 50 },
  plasma_repeater: { k: 'energy', rgb: '244,63,94', r: 34 },
  warp_disruptor: { k: 'energy', rgb: '34,197,94', r: 80 },
  deflector_shield: { k: 'energy', rgb: '129,140,248', r: 38 },
  gauntlet_cannon: { k: 'energy', rgb: '239,68,68', r: 46 },
  alien_ray: { k: 'energy', rgb: '74,222,128', r: 40 },
  pulse_rifle: { k: 'energy', rgb: '56,189,248', r: 34 },
  cryo_blaster: { k: 'energy', rgb: '103,232,249', r: 44 },
  hyperdrive: { k: 'energy', rgb: '96,165,250', r: 48 },
  quantum_destabilizer: { k: 'energy', rgb: '168,85,247', r: 40 },
};
