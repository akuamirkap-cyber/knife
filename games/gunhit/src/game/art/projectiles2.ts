import type { ProjKind } from '../weapons';
import { TAU, rand, lin, radial } from './kit';

import { drawProjectileExtra2 } from './projectiles3';

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

function bullet(c: C, len: number, w: number, tip: string[], body: string[], rim: string) {
  const head = len * 0.36;
  c.beginPath();
  c.moveTo(-w / 2, head);
  c.lineTo(-w / 2, 6);
  c.quadraticCurveTo(-w / 2, -1, 0, -2);
  c.quadraticCurveTo(w / 2, -1, w / 2, 6);
  c.lineTo(w / 2, head);
  c.closePath();
  c.fillStyle = lin(c, -w / 2, w / 2, tip);
  c.fill();
  c.fillStyle = lin(c, -w / 2, w / 2, body);
  c.fillRect(-w / 2 - 0.5, head, w + 1, len - head - 3);
  c.fillStyle = rim;
  c.fillRect(-w / 2 - 1.2, len - 3, w + 2.4, 3);
}

export function drawProjectileExtra(c: C, kind: ProjKind, len: number, t: number, age: number) {
  if ((kind as string) === 'slingshot' && len < 999) {
    drawProjectileExtra2(c, kind, len, t, age);
    return;
  }
  switch (kind) {
    case 'slingshot': {
      c.beginPath();
      c.moveTo(0, -1);
      c.bezierCurveTo(8, 0, 9, len * 0.7, 3, len);
      c.lineTo(-3, len);
      c.bezierCurveTo(-9, len * 0.7, -8, 0, 0, -1);
      c.fillStyle = radial(c, -2, len * 0.3, len * 0.8, ['#e7e5e4', '#a8a29e', '#57534e']);
      c.fill();
      c.strokeStyle = '#44403c';
      c.lineWidth = 1;
      c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.35)';
      c.beginPath();
      c.ellipse(-2.5, len * 0.3, 1.5, 3, 0.3, 0, TAU);
      c.fill();
      break;
    }
    case 'blowgun': {
      c.fillStyle = lin(c, -1, 1, ['#525252', '#f5f5f5', '#525252']);
      c.beginPath();
      c.moveTo(0, -3);
      c.lineTo(1, 4);
      c.lineTo(0.8, len - 12);
      c.lineTo(-0.8, len - 12);
      c.lineTo(-1, 4);
      c.closePath();
      c.fill();
      c.fillStyle = 'rgba(132,204,22,0.8)';
      c.fillRect(-1, 0, 2, 7);
      // kapok tuft
      c.beginPath();
      c.moveTo(0, len - 14);
      c.quadraticCurveTo(6, len - 6, 3, len);
      c.lineTo(-3, len);
      c.quadraticCurveTo(-6, len - 6, 0, len - 14);
      c.fillStyle = radial(c, 0, len - 6, 7, ['#ffffff', '#fef3c7', '#dc2626']);
      c.fill();
      break;
    }
    case 'shotgun': {
      // 12-gauge shell
      c.fillStyle = lin(c, -5, 5, ['#7f1d1d', '#ef4444', '#991b1b']);
      c.beginPath();
      c.roundRect(-5, 0, 10, len - 10, [3, 3, 0, 0]);
      c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.3)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-2, 1);
      c.lineTo(0, 4);
      c.lineTo(2, 1);
      c.stroke();
      c.fillStyle = lin(c, -5.5, 5.5, ['#8c5e10', '#ffe695', '#8c5e10']);
      c.fillRect(-5.5, len - 11, 11, 8);
      c.fillStyle = '#c08a24';
      c.fillRect(-6.5, len - 3, 13, 3);
      c.fillStyle = 'rgba(255,255,255,0.3)';
      c.fillRect(-3, 2, 1.2, len - 14);
      break;
    }
    case 'sniper':
      bullet(c, len, 7, ['#7a3212', '#f6b07a', '#7a3212'], ['#8c5e10', '#ffe695', '#8c5e10'], '#c08a24');
      c.fillStyle = '#111';
      c.fillRect(-3.5, len * 0.36, 7, 1.5);
      break;
    case 'minigun':
      bullet(c, len, 6.5, ['#6e300e', '#e89a5a', '#6e300e'], ['#8c5e10', '#f5d77a', '#8c5e10'], '#a87818');
      c.fillStyle = '#374151';
      c.fillRect(-4.5, len - 9, 9, 2.5);
      break;
    case 'railgun': {
      glowE(c, len / 2, 8, len * 0.6, '56,189,248', 0.55);
      c.fillStyle = lin(c, -2.5, 2.5, ['#334155', '#f1f5f9', '#475569']);
      c.fillRect(-2.5, 0, 5, len);
      c.save();
      c.shadowColor = '#38bdf8';
      c.shadowBlur = 10;
      c.strokeStyle = '#7dd3fc';
      c.lineWidth = 1.3;
      for (let i = 0; i < 4; i++) {
        const y = ((t * 60 + i * (len / 4)) % len);
        c.beginPath();
        c.ellipse(0, y, 5, 1.6, 0, 0, TAU);
        c.stroke();
      }
      c.restore();
      c.fillStyle = '#fff';
      c.beginPath();
      c.moveTo(-2.5, 2);
      c.lineTo(0, -3);
      c.lineTo(2.5, 2);
      c.fill();
      break;
    }
    case 'flamethrower':
    case 'dragon': {
      const isD = kind === 'dragon';
      glowE(c, len * 0.4, 12, len * 0.6, '255,120,30', 0.6);
      const fl = 1 + 0.1 * Math.sin(t * 30);
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.beginPath();
      c.moveTo(0, -2);
      c.bezierCurveTo(8 * fl, len * 0.2, 7, len * 0.7, 0, len * fl);
      c.bezierCurveTo(-7, len * 0.7, -8 * fl, len * 0.2, 0, -2);
      const g = c.createLinearGradient(0, 0, 0, len);
      g.addColorStop(0, '#fffbe0');
      g.addColorStop(0.3, '#fbbf24');
      g.addColorStop(0.7, '#f97316');
      g.addColorStop(1, 'rgba(220,38,38,0)');
      c.fillStyle = g;
      c.fill();
      c.beginPath();
      c.ellipse(0, len * 0.25, 2.5, len * 0.2, 0, 0, TAU);
      c.fillStyle = '#ffffff';
      c.fill();
      c.restore();
      if (isD) {
        // tiny dragon horns + eyes on the fireball
        c.fillStyle = '#fef3c7';
        c.beginPath();
        c.moveTo(-4, 6);
        c.lineTo(-7, -2);
        c.lineTo(-2, 4);
        c.moveTo(4, 6);
        c.lineTo(7, -2);
        c.lineTo(2, 4);
        c.fill();
        c.fillStyle = '#7f1d1d';
        c.beginPath();
        c.arc(-2.2, 9, 1.2, 0, TAU);
        c.arc(2.2, 9, 1.2, 0, TAU);
        c.fill();
      }
      break;
    }
    case 'disc': {
      // Spinning glowing neon Frisbee disc
      c.save();
      c.translate(0, len * 0.4);
      c.scale(1, 0.42);
      c.beginPath();
      c.arc(0, 0, 12, 0, TAU);
      c.fillStyle = '#06b6d4';
      c.shadowColor = '#22d3ee';
      c.shadowBlur = 10;
      c.fill();
      c.shadowBlur = 0;
      c.strokeStyle = '#cffafe';
      c.lineWidth = 1.8;
      c.stroke();
      c.fillStyle = '#164e63';
      c.beginPath();
      c.arc(0, 0, 5, 0, TAU);
      c.fill();
      c.restore();
      c.fillStyle = 'rgba(6,182,212,0.45)';
      c.fillRect(-1.5, len * 0.4, 3, len * 0.6);
      break;
    }
    case 'bamboo': {
      // petasan (firecracker)
      c.fillStyle = lin(c, -5, 5, ['#7f1d1d', '#ef4444', '#991b1b']);
      c.fillRect(-5, 4, 10, len - 4);
      c.fillStyle = '#facc15';
      c.fillRect(-5, 9, 10, 3);
      c.fillRect(-5, len - 9, 10, 3);
      c.fillStyle = '#fef3c7';
      c.font = 'bold 6px serif';
      c.textAlign = 'center';
      c.fillText('福', 0, len * 0.55);
      c.fillStyle = '#e7e5e4';
      c.fillRect(-5, 1, 10, 4);
      c.strokeStyle = '#78716c';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(0, 1);
      c.quadraticCurveTo(3, -3, 1, -6);
      c.stroke();
      if (age < 0.05 || Math.sin(t * 40) > 0) {
        c.fillStyle = '#fde047';
        c.beginPath();
        c.arc(1, -6, 1.6, 0, TAU);
        c.fill();
      }
      break;
    }
    case 'banana': {
      c.beginPath();
      c.moveTo(-1, 0);
      c.bezierCurveTo(9, len * 0.25, 9, len * 0.7, 1, len);
      c.lineTo(-4, len - 2);
      c.bezierCurveTo(2, len * 0.65, 2, len * 0.3, -4, 3);
      c.closePath();
      c.fillStyle = lin(c, -4, 9, ['#ca8a04', '#fde047', '#facc15']);
      c.fill();
      c.strokeStyle = '#854d0e';
      c.lineWidth = 1;
      c.stroke();
      c.fillStyle = '#3f2a0a';
      c.fillRect(-3, -1, 3, 4);
      c.fillStyle = '#78350f';
      c.beginPath();
      c.arc(4, len * 0.5, 1, 0, TAU);
      c.arc(2.5, len * 0.75, 0.8, 0, TAU);
      c.fill();
      break;
    }
    case 'portal': {
      const blue = Math.floor(t * 0.7) % 2 === 0;
      const rgb = blue ? '59,130,246' : '251,146,60';
      glowE(c, len * 0.4, 12, len * 0.6, rgb, 0.6);
      c.save();
      c.translate(0, 8);
      c.beginPath();
      c.ellipse(0, 0, 7, 9, 0, 0, TAU);
      c.fillStyle = '#0b1020';
      c.fill();
      c.strokeStyle = `rgb(${rgb})`;
      c.lineWidth = 2.5;
      c.shadowColor = `rgb(${rgb})`;
      c.shadowBlur = 10;
      c.stroke();
      c.rotate(t * 6);
      c.strokeStyle = 'rgba(255,255,255,0.7)';
      c.lineWidth = 1;
      c.beginPath();
      c.arc(0, 0, 4, 0, Math.PI * 1.3);
      c.stroke();
      c.restore();
      c.fillStyle = `rgba(${rgb},0.8)`;
      c.fillRect(-1.5, 17, 3, len - 18);
      break;
    }
    case 'magnet': {
      c.save();
      c.lineCap = 'butt';
      c.strokeStyle = lin(c, -7, 7, ['#7f1d1d', '#ef4444', '#991b1b']);
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(-5, 0);
      c.lineTo(-5, len - 12);
      c.arc(0, len - 12, 5, Math.PI, 0, true);
      c.lineTo(5, 0);
      c.stroke();
      c.fillStyle = '#e5e7eb';
      c.fillRect(-7.5, -2, 5, 6);
      c.fillRect(2.5, -2, 5, 6);
      c.restore();
      break;
    }
    case 'bubble': {
      c.save();
      c.translate(0, len * 0.42);
      const r = Math.min(10, len * 0.42);
      const wob = 1 + 0.05 * Math.sin(t * 9);
      c.scale(wob, 2 - wob);
      const g = c.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r);
      g.addColorStop(0, 'rgba(255,255,255,0.7)');
      g.addColorStop(0.6, 'rgba(200,230,255,0.15)');
      g.addColorStop(0.85, 'rgba(255,170,230,0.45)');
      g.addColorStop(1, 'rgba(150,240,255,0.7)');
      c.fillStyle = g;
      c.beginPath();
      c.arc(0, 0, r, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(255,255,255,0.8)';
      c.lineWidth = 1;
      c.beginPath();
      c.arc(-r * 0.3, -r * 0.3, r * 0.45, Math.PI, Math.PI * 1.6);
      c.stroke();
      c.restore();
      break;
    }
    case 'chrono': {
      // ornate clock hand
      c.fillStyle = lin(c, -3, 3, ['#713f12', '#fde047', '#a16207']);
      c.beginPath();
      c.moveTo(0, -3);
      c.lineTo(5, 9);
      c.lineTo(1.2, 8);
      c.lineTo(1.2, len - 6);
      c.lineTo(-1.2, len - 6);
      c.lineTo(-1.2, 8);
      c.lineTo(-5, 9);
      c.closePath();
      c.fill();
      c.beginPath();
      c.arc(0, 16, 3, 0, TAU);
      c.fill();
      c.beginPath();
      c.arc(0, 16, 1.4, 0, TAU);
      c.fillStyle = '#451a03';
      c.fill();
      c.beginPath();
      c.arc(0, len - 3, 3.5, 0, TAU);
      c.fillStyle = '#ca8a04';
      c.fill();
      break;
    }
    case 'shrink':
    case 'grow': {
      const isG = kind === 'grow';
      const rgb = isG ? '251,146,60' : '74,222,128';
      const w = isG ? 6.5 : 3.5;
      glowE(c, len / 2, w + 6, len * 0.6, rgb, 0.55);
      c.save();
      c.shadowColor = `rgb(${rgb})`;
      c.shadowBlur = 10;
      c.fillStyle = `rgb(${rgb})`;
      c.beginPath();
      c.roundRect(-w, -1, w * 2, len, w);
      c.fill();
      c.restore();
      c.fillStyle = '#fff';
      c.beginPath();
      c.roundRect(-w * 0.4, 2, w * 0.8, len - 6, w * 0.4);
      c.fill();
      c.strokeStyle = `rgba(${rgb},0.9)`;
      c.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const k = ((t * 2 + i / 3) % 1);
        const s = isG ? 0.5 + k : 1.5 - k;
        c.beginPath();
        c.ellipse(0, len * 0.4, (w + 3) * s, 2 * s, 0, 0, TAU);
        c.stroke();
      }
      break;
    }
    case 'harpoon': {
      c.fillStyle = lin(c, -1.5, 1.5, ['#64748b', '#f8fafc', '#64748b']);
      c.fillRect(-1.5, 6, 3, len - 6);
      c.beginPath();
      c.moveTo(0, -4);
      c.lineTo(4, 7);
      c.lineTo(-4, 7);
      c.closePath();
      c.fillStyle = '#e2e8f0';
      c.fill();
      c.strokeStyle = '#cbd5e1';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(1, 8);
      c.lineTo(5, 15);
      c.moveTo(-1, 8);
      c.lineTo(-5, 15);
      c.stroke();
      c.beginPath();
      c.arc(0, len - 2, 2.5, 0, TAU);
      c.strokeStyle = '#94a3b8';
      c.stroke();
      break;
    }
    case 'soaker': {
      glowE(c, len * 0.4, 8, len * 0.5, '96,165,250', 0.4);
      c.beginPath();
      c.moveTo(0, -2);
      c.bezierCurveTo(6, len * 0.2, 6, len * 0.55, 0, len * 0.7);
      c.bezierCurveTo(-6, len * 0.55, -6, len * 0.2, 0, -2);
      c.fillStyle = radial(c, 0, len * 0.3, 8, ['#ffffff', '#93c5fd', '#2563eb']);
      c.fill();
      c.fillStyle = 'rgba(147,197,253,0.8)';
      for (let i = 0; i < 3; i++) {
        c.beginPath();
        c.arc(Math.sin(t * 10 + i) * 2, len * 0.78 + i * 4, 1.6 - i * 0.3, 0, TAU);
        c.fill();
      }
      break;
    }
    case 'snowball': {
      const r = Math.min(8, len * 0.38);
      c.beginPath();
      c.arc(0, r, r, 0, TAU);
      c.fillStyle = radial(c, 0, r, r, ['#ffffff', '#f0f9ff', '#bae6fd']);
      c.fill();
      c.fillStyle = 'rgba(186,230,253,0.8)';
      c.beginPath();
      c.arc(2, r + 3, 1.5, 0, TAU);
      c.arc(-3, r - 2, 1.2, 0, TAU);
      c.fill();
      if (len > r * 2 + 4) {
        c.beginPath();
        c.arc(0, r * 2 + (len - r * 2) / 2, Math.min(r * 1.1, (len - r * 2) / 2 + 1), 0, TAU);
        c.fillStyle = radial(c, 0, r * 2 + 6, r, ['#ffffff', '#e0f2fe', '#bae6fd']);
        c.fill();
      }
      break;
    }
    case 'pirate': {
      const r = Math.min(8, len * 0.4);
      c.beginPath();
      c.arc(0, r, r, 0, TAU);
      c.fillStyle = radial(c, 0, r, r, ['#9ca3af', '#374151', '#030712']);
      c.fill();
      c.fillStyle = 'rgba(255,255,255,0.4)';
      c.beginPath();
      c.arc(-2.5, r - 2.5, 2, 0, TAU);
      c.fill();
      if (len > 2 * r) {
        c.fillStyle = 'rgba(120,120,120,0.35)';
        c.fillRect(-r * 0.6, r * 2 - 1, r * 1.2, len - r * 2);
      }
      break;
    }
    case 'chicken': {
      // body (rubber chicken, head first)
      c.save();
      c.fillStyle = lin(c, -6, 6, ['#ca8a04', '#fde047', '#eab308']);
      c.beginPath();
      c.ellipse(0, len * 0.68, 6, len * 0.3, 0, 0, TAU);
      c.fill();
      c.fillRect(-2.2, 8, 4.4, len * 0.45);
      c.beginPath();
      c.arc(0, 6, 5, 0, TAU);
      c.fill();
      c.strokeStyle = '#a16207';
      c.lineWidth = 1;
      c.stroke();
      // comb
      c.fillStyle = '#ef4444';
      c.beginPath();
      c.arc(-2.5, 2, 2, 0, TAU);
      c.arc(0, 0.5, 2, 0, TAU);
      c.arc(2.5, 2, 2, 0, TAU);
      c.fill();
      // beak
      c.fillStyle = '#f97316';
      c.beginPath();
      c.moveTo(-2, 9);
      c.lineTo(2, 9);
      c.lineTo(0, 13);
      c.fill();
      // X eyes
      c.strokeStyle = '#111';
      c.lineWidth = 0.9;
      for (const s of [-1, 1]) {
        c.beginPath();
        c.moveTo(s * 2.2 - 1, 4.5);
        c.lineTo(s * 2.2 + 1, 6.5);
        c.moveTo(s * 2.2 + 1, 4.5);
        c.lineTo(s * 2.2 - 1, 6.5);
        c.stroke();
      }
      // feet
      c.strokeStyle = '#f97316';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(-2, len * 0.95);
      c.lineTo(-4, len + 2);
      c.moveTo(2, len * 0.95);
      c.lineTo(4, len + 2);
      c.stroke();
      c.restore();
      break;
    }
    case 'card': {
      // CARD 1.8X BIGGER!
      c.save();
      c.scale(1.8, 1.8);
      c.beginPath();
      c.roundRect(-4.5, 0, 9, len / 1.8 - 2, 1.5);
      c.fillStyle = '#ffffff';
      c.fill();
      c.strokeStyle = '#a1a1aa';
      c.lineWidth = 0.8;
      c.stroke();
      c.fillStyle = '#dc2626';
      c.font = 'bold 8px serif';
      c.textAlign = 'center';
      c.fillText('A', 0, 8);
      c.fillText('♥', 0, (len / 1.8) * 0.62);
      c.fillStyle = 'rgba(0,0,0,0.08)';
      c.fillRect(1.5, 0, 3, len / 1.8 - 2);
      c.restore();
      break;
    }
    case 'confetti': {
      // party popper
      c.beginPath();
      c.moveTo(-6, 4);
      c.lineTo(6, 4);
      c.lineTo(1.5, len);
      c.lineTo(-1.5, len);
      c.closePath();
      c.fillStyle = lin(c, -6, 6, ['#be185d', '#f472b6', '#db2777']);
      c.fill();
      c.fillStyle = '#facc15';
      c.fillRect(-4.5, 12, 9, 2.5);
      c.fillRect(-3, 22, 6, 2.5);
      const cc = ['#f43f5e', '#facc15', '#22d3ee', '#4ade80', '#a855f7'];
      for (let i = 0; i < 6; i++) {
        c.save();
        c.translate(-5 + i * 2, 2 + Math.sin(t * 8 + i) * 2 - (i % 2) * 3);
        c.rotate(t * 3 + i);
        c.fillStyle = cc[i % 5];
        c.fillRect(-1.5, -1, 3, 2);
        c.restore();
      }
      break;
    }
    case 'sonic': {
      glowE(c, len * 0.3, 12, len * 0.5, '163,230,53', 0.45);
      c.strokeStyle = '#bef264';
      c.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        c.lineWidth = 2.5 - i * 0.4;
        c.globalAlpha = 1 - i * 0.2;
        c.beginPath();
        c.arc(0, 8 + i * 7, 7 - i * 0.8, Math.PI * 1.15, Math.PI * 1.85);
        c.stroke();
      }
      c.globalAlpha = 1;
      c.fillStyle = 'rgba(190,255,120,0.6)';
      c.fillRect(-1, 10, 2, len - 12);
      break;
    }
    case 'seed': {
      const grow = Math.min(1, Math.max(0, (age - 0.2) / 1.4));
      // seed
      c.beginPath();
      c.moveTo(0, len - 18);
      c.bezierCurveTo(5, len - 12, 5, len - 4, 0, len);
      c.bezierCurveTo(-5, len - 4, -5, len - 12, 0, len - 18);
      c.fillStyle = lin(c, -5, 5, ['#451a03', '#a16207', '#78350f']);
      c.fill();
      c.strokeStyle = 'rgba(254,243,199,0.5)';
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(0, len - 16);
      c.lineTo(0, len - 2);
      c.stroke();
      if (age > 50 || grow <= 0) {
        // flying: show little sprout tip
        c.fillStyle = '#4ade80';
        c.beginPath();
        c.ellipse(0, len - 21, 2, 4, 0, 0, TAU);
        c.fill();
        c.fillStyle = 'rgba(132,204,22,0.4)';
        c.fillRect(-0.8, 0, 1.6, len - 22);
        break;
      }
      // stem
      const top = len - 18 - (len - 22) * grow;
      c.strokeStyle = '#16a34a';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(0, len - 18);
      c.quadraticCurveTo(Math.sin(t * 2) * 3, (top + len - 18) / 2, 0, top);
      c.stroke();
      c.fillStyle = '#4ade80';
      c.beginPath();
      c.ellipse(-4, (top + len) / 2, 4 * grow, 2 * grow, -0.6, 0, TAU);
      c.ellipse(4, (top + len) / 2 + 5, 4 * grow, 2 * grow, 0.6, 0, TAU);
      c.fill();
      if (grow >= 1) {
        const bloom = Math.min(1, (age - 1.6) * 3);
        if (bloom > 0) {
          c.save();
          c.translate(0, top);
          c.rotate(t);
          for (let i = 0; i < 6; i++) {
            c.rotate(TAU / 6);
            c.beginPath();
            c.ellipse(0, -4.5 * bloom, 2.6 * bloom, 4.5 * bloom, 0, 0, TAU);
            c.fillStyle = i % 2 ? '#f472b6' : '#fb7185';
            c.fill();
          }
          c.beginPath();
          c.arc(0, 0, 2.6 * bloom, 0, TAU);
          c.fillStyle = '#facc15';
          c.fill();
          c.restore();
        }
      }
      break;
    }
    case 'glitch': {
      const P = 3;
      const shape = ['.#.', '###', '#@#', '###', '###', '.#.', '.#.', '.#.', '###', '#.#'];
      const jitter = Math.sin(t * 17) > 0.6 ? rand(-2, 2) : 0;
      const draw = (ox: number, col: string, colB: string) => {
        for (let r = 0; r < shape.length; r++) {
          for (let k = 0; k < 3; k++) {
            const ch = shape[r][k];
            if (ch === '.') continue;
            c.fillStyle = ch === '@' ? colB : col;
            c.fillRect(-4.5 + k * P + ox, r * (len / shape.length), P, len / shape.length + 0.5);
          }
        }
      };
      c.save();
      c.globalCompositeOperation = 'lighter';
      draw(-1.5 + jitter, 'rgba(255,0,85,0.6)', 'rgba(255,0,85,0.6)');
      draw(1.5 - jitter, 'rgba(0,255,238,0.6)', 'rgba(0,255,238,0.6)');
      c.restore();
      draw(0, '#16a34a', '#bbf7d0');
      break;
    }
    case 'mirror': {
      c.save();
      c.beginPath();
      c.moveTo(0, -3);
      c.lineTo(5, 8);
      c.lineTo(3, len - 4);
      c.lineTo(-1, len);
      c.lineTo(-5, len - 10);
      c.lineTo(-4, 6);
      c.closePath();
      c.fillStyle = lin(c, -5, 5, ['#94a3b8', '#f8fafc', '#cbd5e1', '#ffffff', '#64748b']);
      c.shadowColor = '#e0f2fe';
      c.shadowBlur = 8;
      c.fill();
      c.shadowBlur = 0;
      c.strokeStyle = '#475569';
      c.lineWidth = 0.8;
      c.stroke();
      const gy = (t * 40) % len;
      c.clip();
      c.fillStyle = 'rgba(255,255,255,0.9)';
      c.fillRect(-6, gy, 12, 2);
      c.restore();
      break;
    }
    case 'gravity': {
      glowE(c, 9, 12, 14, '129,140,248', 0.5);
      c.beginPath();
      c.arc(0, 9, 6, 0, TAU);
      c.fillStyle = radial(c, 0, 9, 6, ['#e0e7ff', '#6366f1', '#1e1b4b']);
      c.fill();
      c.save();
      c.translate(0, 9);
      c.rotate(-0.4);
      c.strokeStyle = 'rgba(199,210,254,0.9)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.ellipse(0, 0, 10, 3, 0, 0, TAU);
      c.stroke();
      c.restore();
      const ma = t * 5;
      c.fillStyle = '#e0e7ff';
      c.beginPath();
      c.arc(Math.cos(ma) * 10, 9 + Math.sin(ma) * 3, 1.3, 0, TAU);
      c.fill();
      c.fillStyle = 'rgba(129,140,248,0.6)';
      c.fillRect(-1, 16, 2, len - 16);
      break;
    }
    case 'pizza': {
      c.beginPath();
      c.moveTo(0, -2);
      c.lineTo(9, len - 6);
      c.quadraticCurveTo(0, len + 1, -9, len - 6);
      c.closePath();
      c.fillStyle = '#fbbf24';
      c.fill();
      c.strokeStyle = '#b45309';
      c.lineWidth = 1;
      c.stroke();
      c.beginPath();
      c.moveTo(9, len - 6);
      c.quadraticCurveTo(0, len + 1, -9, len - 6);
      c.quadraticCurveTo(0, len - 3, 9, len - 6);
      c.lineWidth = 4;
      c.strokeStyle = '#d97706';
      c.stroke();
      c.fillStyle = '#b91c1c';
      for (const [px, py] of [[0, len * 0.35], [-3, len * 0.62], [3.5, len * 0.7]]) {
        c.beginPath();
        c.arc(px, py, 2.3, 0, TAU);
        c.fill();
      }
      c.fillStyle = '#16a34a';
      c.fillRect(2, len * 0.45, 2, 1.5);
      c.fillRect(-4, len * 0.48, 2, 1.5);
      break;
    }
    default: {
      drawProjectileExtra2(c, kind, len, t, age);
    }
  }
}
