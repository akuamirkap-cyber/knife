import type { ProjKind } from '../weapons';
import { TAU, rand, lin, radial, star } from './kit';

import { drawProjectileExtra3 } from './projectiles4';

type C = CanvasRenderingContext2D;

function glowE(c: C, y: number, rx: number, ry: number, rgb: string, a: number) {
  c.save();
  c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(0, y, 1, 0, y, Math.max(rx, ry));
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(0, y, rx, ry, 0, 0, TAU);
  c.fill();
  c.restore();
}

const RB = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa'];

export function drawProjectileExtra2(c: C, kind: ProjKind, len: number, t: number, age: number) {
  switch (kind) {
    case 'honey': {
      c.beginPath();
      c.moveTo(0, -2);
      c.bezierCurveTo(8, 2, 8, len * 0.6, 3, len * 0.8);
      c.quadraticCurveTo(0, len + 2, -3, len * 0.8);
      c.bezierCurveTo(-8, len * 0.6, -8, 2, 0, -2);
      c.fillStyle = radial(c, -2, len * 0.3, len * 0.7, ['#fef3c7', '#fbbf24', '#b45309']);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.65)';
      c.beginPath();
      c.ellipse(-2.5, len * 0.25, 1.5, 4, 0.2, 0, TAU);
      c.fill();
      // drip strands
      c.strokeStyle = 'rgba(245,158,11,0.8)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(-2, len * 0.8);
      c.quadraticCurveTo(-3, len + 4, -1, len + 6 + Math.sin(t * 8) * 2);
      c.stroke();
      break;
    }
    case 'coconut': {
      const r = Math.min(9, len * 0.4);
      c.beginPath();
      c.arc(0, r, r, 0, TAU);
      c.fillStyle = radial(c, 0, r, r, ['#bef264', '#65a30d', '#365314']);
      c.fill();
      c.strokeStyle = '#1a2e05';
      c.lineWidth = 1;
      c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.35)';
      c.beginPath();
      c.ellipse(-3, r - 3, 2, 3, 0.4, 0, TAU);
      c.fill();
      c.fillStyle = '#f7fee7';
      c.beginPath();
      c.ellipse(0, 2, 3.5, 1.8, 0, 0, TAU);
      c.fill();
      c.strokeStyle = '#f43f5e';
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(1, 2);
      c.lineTo(4, -6);
      c.stroke();
      if (len > r * 2) {
        c.fillStyle = 'rgba(217,249,157,0.45)';
        c.fillRect(-2, r * 2, 4, len - r * 2);
      }
      break;
    }
    case 'angklung': {
      glowE(c, len * 0.4, 9, len * 0.5, '253,230,138', 0.45);
      // eighth note ♪
      c.fillStyle = lin(c, -5, 5, ['#92400e', '#fde68a', '#b45309']);
      c.beginPath();
      c.ellipse(-1, len - 6, 5.5, 4, -0.4, 0, TAU);
      c.fill();
      c.fillRect(3, 2, 2, len - 8);
      c.beginPath();
      c.moveTo(5, 2);
      c.quadraticCurveTo(12, 8 + Math.sin(t * 10) * 2, 9, 16);
      c.quadraticCurveTo(10, 10, 5, 8);
      c.closePath();
      c.fill();
      c.strokeStyle = '#451a03';
      c.lineWidth = 0.8;
      c.stroke();
      break;
    }
    case 'bee': {
      const wig = Math.sin(t * 40) * 2;
      c.save();
      c.translate(wig * 0.3, 0);
      // wings
      c.fillStyle = 'rgba(224,242,254,0.75)';
      for (const s of [-1, 1]) {
        c.beginPath();
        c.ellipse(s * 5, len * 0.35, 4, 2.5 + Math.abs(wig), s * 0.5, 0, TAU);
        c.fill();
      }
      // body
      c.save();
      c.beginPath();
      c.ellipse(0, len * 0.5, 4.5, len * 0.4, 0, 0, TAU);
      c.clip();
      c.fillStyle = '#facc15';
      c.fillRect(-5, 0, 10, len);
      c.fillStyle = '#111';
      for (let i = 0; i < 3; i++) c.fillRect(-5, len * 0.35 + i * len * 0.15, 10, len * 0.07);
      c.restore();
      // head + stinger (stinger forward)
      c.fillStyle = '#111';
      c.beginPath();
      c.moveTo(0, -3);
      c.lineTo(1.5, 4);
      c.lineTo(-1.5, 4);
      c.fill();
      c.beginPath();
      c.arc(0, len * 0.92, 3, 0, TAU);
      c.fill();
      c.restore();
      break;
    }
    case 'ink': {
      glowE(c, len * 0.4, 9, len * 0.5, '124,58,237', 0.4);
      c.beginPath();
      c.moveTo(0, -2);
      c.bezierCurveTo(7, len * 0.15, 7, len * 0.55, 0, len * 0.7);
      c.bezierCurveTo(-7, len * 0.55, -7, len * 0.15, 0, -2);
      c.fillStyle = radial(c, -1, len * 0.3, 8, ['#6d28d9', '#1e1b4b', '#020617']);
      c.fill();
      c.fillStyle = 'rgba(196,181,253,0.6)';
      c.beginPath();
      c.ellipse(-2, len * 0.22, 1.2, 3, 0.2, 0, TAU);
      c.fill();
      c.fillStyle = 'rgba(30,27,75,0.7)';
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.arc(Math.sin(t * 9 + i) * 3, len * 0.8 + i * 5, 2 - i * 0.4, 0, TAU);
        c.fill();
      }
      break;
    }
    case 'yoyo': {
      c.save();
      c.translate(0, 9);
      c.rotate(t * 25);
      c.beginPath();
      c.arc(0, 0, 8, 0, TAU);
      c.fillStyle = radial(c, 0, 0, 8, ['#fecaca', '#ef4444', '#7f1d1d']);
      c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.8)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(0, 0, 5, 0, 1.2);
      c.stroke();
      c.beginPath();
      c.arc(0, 0, 5, Math.PI, Math.PI + 1.2);
      c.stroke();
      c.restore();
      c.strokeStyle = '#fef3c7';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, 17);
      c.lineTo(0, len + 4);
      c.stroke();
      break;
    }
    case 'sakura': {
      c.save();
      c.translate(0, len * 0.35);
      c.rotate(t * 6);
      for (let i = 0; i < 5; i++) {
        c.rotate(TAU / 5);
        c.beginPath();
        c.moveTo(0, 0);
        c.quadraticCurveTo(4, -4, 2, -8);
        c.lineTo(0, -6.5);
        c.lineTo(-2, -8);
        c.quadraticCurveTo(-4, -4, 0, 0);
        c.fillStyle = i % 2 ? '#fbcfe8' : '#f9a8d4';
        c.fill();
      }
      c.fillStyle = '#fde047';
      c.beginPath();
      c.arc(0, 0, 1.6, 0, TAU);
      c.fill();
      c.restore();
      c.strokeStyle = '#7c2d12';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(0, len * 0.5);
      c.quadraticCurveTo(2, len * 0.75, 0, len);
      c.stroke();
      c.fillStyle = '#4ade80';
      c.beginPath();
      c.ellipse(2.5, len * 0.72, 2.5, 1.2, 0.5, 0, TAU);
      c.fill();
      break;
    }
    case 'acid': {
      glowE(c, len * 0.4, 10, len * 0.55, '163,230,53', 0.5);
      c.beginPath();
      c.moveTo(0, -2);
      c.bezierCurveTo(7, len * 0.15, 6, len * 0.55, 0, len * 0.7);
      c.bezierCurveTo(-6, len * 0.55, -7, len * 0.15, 0, -2);
      c.fillStyle = radial(c, -1, len * 0.3, 8, ['#ecfccb', '#a3e635', '#3f6212']);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.8)';
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.arc(Math.sin(t * 7 + i * 2) * 3, len * 0.2 + i * 6, 1.1, 0, TAU);
        c.fill();
      }
      c.fillStyle = 'rgba(163,230,53,0.6)';
      c.beginPath();
      c.arc(1, len * 0.85, 1.6, 0, TAU);
      c.arc(-1.5, len * 0.95, 1.1, 0, TAU);
      c.fill();
      break;
    }
    case 'keris': {
      glowE(c, len * 0.4, 8, len * 0.6, '255,215,120', 0.35);
      const bl = len - 8;
      c.beginPath();
      c.moveTo(0, -3);
      for (let i = 0; i <= 7; i++) {
        const y = (i / 7) * bl;
        c.lineTo(Math.sin(i * 1.4) * 2 + 1 + (i / 7) * 2.5, y);
      }
      for (let i = 7; i >= 0; i--) {
        const y = (i / 7) * bl;
        c.lineTo(Math.sin(i * 1.4) * 2 - 1 - (i / 7) * 2.5, y);
      }
      c.closePath();
      c.fillStyle = lin(c, -4, 4, ['#1f2937', '#d1d5db', '#4b5563']);
      c.fill();
      c.strokeStyle = 'rgba(229,231,235,0.7)';
      c.lineWidth = 0.6;
      c.beginPath();
      for (let i = 0; i <= 7; i++) c.lineTo(Math.sin(i * 1.4) * 2, (i / 7) * bl);
      c.stroke();
      c.fillStyle = lin(c, -5, 5, ['#713f12', '#fde68a', '#a16207']);
      c.beginPath();
      c.roundRect(-5, bl - 1, 10, 3, 1);
      c.fill();
      c.fillStyle = lin(c, -3, 3, ['#3f1d0b', '#a16207', '#3f1d0b']);
      c.fillRect(-2.5, bl + 2, 5, 6);
      break;
    }
    case 'tornado': {
      for (let i = 0; i < 7; i++) {
        const k = i / 6;
        const w = 2 + (1 - k) * 8;
        const ox = Math.sin(t * 14 + i) * (1 + k * 2);
        c.beginPath();
        c.ellipse(ox, k * len, w, 2 + (1 - k), 0, 0, TAU);
        c.strokeStyle = `rgba(226,232,240,${0.9 - k * 0.4})`;
        c.lineWidth = 1.6;
        c.stroke();
      }
      c.fillStyle = 'rgba(148,163,184,0.25)';
      c.beginPath();
      c.moveTo(-10, 0);
      c.lineTo(10, 0);
      c.lineTo(1, len);
      c.lineTo(-1, len);
      c.closePath();
      c.fill();
      break;
    }
    case 'firework': {
      c.fillStyle = lin(c, -4.5, 4.5, ['#9f1239', '#fb7185', '#9f1239']);
      c.fillRect(-4.5, 6, 9, len - 12);
      c.fillStyle = '#facc15';
      c.fillRect(-4.5, 12, 9, 2);
      c.fillStyle = '#22d3ee';
      c.fillRect(-4.5, len * 0.6, 9, 2);
      c.beginPath();
      c.moveTo(-5, 7);
      c.lineTo(0, -4);
      c.lineTo(5, 7);
      c.closePath();
      c.fillStyle = '#fde047';
      c.fill();
      c.strokeStyle = '#a16207';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(0, len - 6);
      c.lineTo(0, len + 4);
      c.stroke();
      if (age > 50) {
        for (let i = 0; i < 3; i++) {
          c.fillStyle = ['#fde047', '#fb923c', '#ffffff'][i];
          c.beginPath();
          c.arc(rand(-2, 2), len + 4 + i * 3, 2 - i * 0.5, 0, TAU);
          c.fill();
        }
      }
      break;
    }
    case 'anchor': {
      c.save();
      c.strokeStyle = lin(c, -10, 10, ['#334155', '#e2e8f0', '#475569']) as unknown as string;
      c.lineCap = 'round';
      c.lineWidth = 3.5;
      // anchor pointing down-tip first (tip at 0): flukes at top
      c.beginPath();
      c.moveTo(0, 2);
      c.lineTo(0, len - 6);
      c.stroke();
      c.beginPath();
      c.arc(0, 4, 9, Math.PI * 1.15, Math.PI * 1.85, true);
      c.stroke();
      c.beginPath();
      c.moveTo(-5, len - 12);
      c.lineTo(5, len - 12);
      c.stroke();
      c.lineWidth = 2;
      c.beginPath();
      c.arc(0, len - 3, 3, 0, TAU);
      c.stroke();
      c.restore();
      c.fillStyle = '#cbd5e1';
      for (const s of [-1, 1]) {
        c.beginPath();
        c.moveTo(s * 9, 6);
        c.lineTo(s * 11, -1);
        c.lineTo(s * 5, 3);
        c.fill();
      }
      break;
    }
    case 'shark': {
      const wig = Math.sin(t * 16) * 2;
      c.beginPath();
      c.moveTo(0, -3);
      c.bezierCurveTo(8, 4, 8, len * 0.6, 2, len * 0.78);
      c.lineTo(-2, len * 0.78);
      c.bezierCurveTo(-8, len * 0.6, -8, 4, 0, -3);
      c.fillStyle = lin(c, -8, 8, ['#334155', '#94a3b8', '#e2e8f0']);
      c.fill();
      c.strokeStyle = '#1e293b';
      c.lineWidth = 1;
      c.stroke();
      // fins
      c.fillStyle = '#475569';
      c.beginPath();
      c.moveTo(-6, len * 0.4);
      c.lineTo(-12, len * 0.55);
      c.lineTo(-5, len * 0.5);
      c.moveTo(6, len * 0.4);
      c.lineTo(12, len * 0.55);
      c.lineTo(5, len * 0.5);
      c.fill();
      c.beginPath();
      c.moveTo(0, len * 0.75);
      c.lineTo(-7 + wig, len + 2);
      c.lineTo(0, len * 0.9);
      c.lineTo(7 + wig, len + 2);
      c.closePath();
      c.fill();
      // mouth + teeth + eyes
      c.fillStyle = '#7f1d1d';
      c.beginPath();
      c.ellipse(0, 5, 4, 2.5, 0, 0, TAU);
      c.fill();
      c.fillStyle = '#fff';
      for (let i = -1; i <= 1; i++) {
        c.beginPath();
        c.moveTo(i * 2.2 - 1, 3.5);
        c.lineTo(i * 2.2, 5.5);
        c.lineTo(i * 2.2 + 1, 3.5);
        c.fill();
      }
      c.fillStyle = '#000';
      c.beginPath();
      c.arc(-4, 9, 1.2, 0, TAU);
      c.arc(4, 9, 1.2, 0, TAU);
      c.fill();
      break;
    }
    case 'ghost': {
      c.save();
      c.globalAlpha = 0.75 + 0.2 * Math.sin(t * 8);
      glowE(c, len * 0.4, 12, len * 0.6, '199,210,254', 0.5);
      c.beginPath();
      c.moveTo(-7, len * 0.7);
      c.lineTo(-7, 8);
      c.quadraticCurveTo(-7, -2, 0, -2);
      c.quadraticCurveTo(7, -2, 7, 8);
      c.lineTo(7, len * 0.7);
      for (let i = 0; i < 4; i++) c.quadraticCurveTo(5 - i * 4, len * 0.85 + Math.sin(t * 10 + i) * 3, 3.5 - i * 3.5, len * 0.7);
      c.closePath();
      c.fillStyle = 'rgba(238,242,255,0.95)';
      c.fill();
      c.fillStyle = '#1e1b4b';
      c.beginPath();
      c.ellipse(-2.5, 8, 1.6, 2.4, 0, 0, TAU);
      c.ellipse(2.5, 8, 1.6, 2.4, 0, 0, TAU);
      c.fill();
      c.beginPath();
      c.ellipse(0, 14, 1.6, 2, 0, 0, TAU);
      c.fill();
      c.restore();
      break;
    }
    case 'ufo': {
      glowE(c, len * 0.5, 10, len * 0.6, '134,239,172', 0.5);
      c.fillStyle = 'rgba(134,239,172,0.35)';
      c.beginPath();
      c.moveTo(-3, 10);
      c.lineTo(3, 10);
      c.lineTo(6, len);
      c.lineTo(-6, len);
      c.closePath();
      c.fill();
      c.beginPath();
      c.ellipse(0, 4, 5, 4.5, 0, Math.PI, TAU);
      c.fillStyle = 'rgba(187,247,208,0.85)';
      c.fill();
      c.beginPath();
      c.ellipse(0, 6, 10, 3.5, 0, 0, TAU);
      c.fillStyle = lin(c, -10, 10, ['#475569', '#e2e8f0', '#64748b']);
      c.fill();
      for (let i = -1; i <= 1; i++) {
        c.fillStyle = Math.sin(t * 10 + i) > 0 ? '#facc15' : '#4ade80';
        c.beginPath();
        c.arc(i * 5, 7, 1, 0, TAU);
        c.fill();
      }
      break;
    }
    case 'rainbow': {
      glowE(c, len * 0.4, 12, len * 0.6, '255,200,230', 0.55);
      for (let i = 0; i < 6; i++) {
        c.fillStyle = RB[(i + Math.floor(t * 12)) % 6];
        c.fillRect(-6 + i * 2, 6, 2, len - 8);
      }
      c.fillStyle = 'rgba(255,255,255,0.45)';
      c.fillRect(-1, 6, 2, len - 8);
      c.save();
      c.translate(0, 4);
      c.rotate(t * 6);
      star(c, 0, 0, 7, '#fde047');
      c.restore();
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(0, 4, 2, 0, TAU);
      c.fill();
      break;
    }
    case 'meteor': {
      const r = Math.min(9, len * 0.4);
      glowE(c, r + 6, 16, len * 0.8, '255,140,50', 0.6);
      c.save();
      c.globalCompositeOperation = 'lighter';
      const fg = c.createLinearGradient(0, r, 0, len + 14);
      fg.addColorStop(0, 'rgba(255,240,200,0.9)');
      fg.addColorStop(0.4, 'rgba(251,146,60,0.7)');
      fg.addColorStop(1, 'rgba(220,38,38,0)');
      c.fillStyle = fg;
      c.beginPath();
      c.moveTo(-r, r);
      c.lineTo(r, r);
      c.lineTo(rand(-2, 2), len + 14);
      c.closePath();
      c.fill();
      c.restore();
      c.beginPath();
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU;
        const rr2 = r * (0.8 + Math.sin(i * 3.1) * 0.2);
        c.lineTo(Math.cos(a) * rr2, r + Math.sin(a) * rr2);
      }
      c.closePath();
      c.fillStyle = radial(c, 0, r, r, ['#78716c', '#44403c', '#1c1917']);
      c.fill();
      c.strokeStyle = '#fb923c';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(-r * 0.5, r - 2);
      c.lineTo(0, r + 1);
      c.lineTo(r * 0.4, r - 3);
      c.moveTo(-1, r + 3);
      c.lineTo(2, r + r * 0.6);
      c.stroke();
      break;
    }
    case 'diamond': {
      c.save();
      c.shadowColor = '#a5f3fc';
      c.shadowBlur = 10;
      c.beginPath();
      c.moveTo(0, -2);
      c.lineTo(6, len * 0.55);
      c.lineTo(4, len * 0.72);
      c.lineTo(-4, len * 0.72);
      c.lineTo(-6, len * 0.55);
      c.closePath();
      const g = c.createLinearGradient(-6, 0, 6, len);
      g.addColorStop(0, '#ecfeff');
      g.addColorStop(0.5, '#67e8f9');
      g.addColorStop(1, '#0891b2');
      c.fillStyle = g;
      c.fill();
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,0.9)';
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(-6, len * 0.55);
      c.lineTo(6, len * 0.55);
      c.moveTo(0, -2);
      c.lineTo(-2, len * 0.55);
      c.lineTo(0, len * 0.72);
      c.lineTo(2, len * 0.55);
      c.lineTo(0, -2);
      c.stroke();
      c.fillStyle = lin(c, -3, 3, ['#94a3b8', '#f8fafc', '#94a3b8']);
      c.fillRect(-2, len * 0.72, 4, len * 0.28);
      if (Math.sin(t * 6) > 0.3) star(c, 3, len * 0.3, 4, '#ffffff', 4);
      break;
    }
    case 'moonbeam': {
      glowE(c, len * 0.4, 10, len * 0.6, '196,181,253', 0.6);
      c.save();
      c.translate(0, 8);
      c.shadowColor = '#ede9fe';
      c.shadowBlur = 10;
      c.beginPath();
      c.arc(0, 0, 7, Math.PI * 0.2, Math.PI * 1.8);
      c.arc(3, 0, 5.5, Math.PI * 1.7, Math.PI * 0.3, true);
      c.closePath();
      c.fillStyle = '#f5f3ff';
      c.fill();
      c.restore();
      c.fillStyle = 'rgba(221,214,254,0.85)';
      c.fillRect(-1.2, 15, 2.4, len - 15);
      star(c, -4, len * 0.6, 2.5, '#ffffff', 4);
      star(c, 4, len * 0.8, 2, '#ffffff', 4);
      break;
    }
    case 'storm': {
      glowE(c, len * 0.4, 10, len * 0.6, '147,197,253', 0.55);
      c.save();
      c.shadowColor = '#93c5fd';
      c.shadowBlur = 12;
      c.fillStyle = '#eff6ff';
      c.beginPath();
      c.moveTo(1, -3);
      c.lineTo(-5, len * 0.45);
      c.lineTo(0, len * 0.45);
      c.lineTo(-3, len);
      c.lineTo(6, len * 0.38);
      c.lineTo(1, len * 0.38);
      c.lineTo(4, -3);
      c.closePath();
      c.fill();
      c.restore();
      c.strokeStyle = '#3b82f6';
      c.lineWidth = 0.8;
      c.stroke();
      break;
    }
    default:
      drawProjectileExtra3(c, kind, len, t);
  }
}
