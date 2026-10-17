import { TAU } from './kit';

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
  g.addColorStop(0, '#bfccdc');
  g.addColorStop(0.5, '#708092');
  g.addColorStop(1, '#303e52');
  c.fillStyle = g;
  c.fill();
  c.strokeStyle = 'rgba(6,11,18,0.8)';
  c.lineWidth = 1;
  c.stroke();
}
