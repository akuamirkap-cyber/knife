import type { BossType } from './bossRoster';

export type Style = 'orange' | 'wood' | 'target' | BossType;

const TAU = Math.PI * 2;

function shade(c: CanvasRenderingContext2D, R: number, strength = 0.35) {
  // Spherical gloss 3D
  const g = c.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.08, 0, 0, R);
  g.addColorStop(0, 'rgba(255,255,255,0.28)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.06)');
  g.addColorStop(0.7, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  c.beginPath();
  c.arc(0, 0, R, 0, TAU);
  c.fillStyle = g;
  c.fill();

  // Outer rim highlight
  c.beginPath();
  c.arc(0, 0, R - 2, 0, TAU);
  c.strokeStyle = 'rgba(255,255,255,0.3)';
  c.lineWidth = 1.8;
  c.stroke();
  c.beginPath();
  c.arc(0, 0, R - 1, Math.PI * 1.05, Math.PI * 1.95);
  c.strokeStyle = 'rgba(255,255,255,0.6)';
  c.lineWidth = 2.2;
  c.stroke();
}

import { renderBossHead } from './bossRenderer';

export function drawFace(c: CanvasRenderingContext2D, R: number, style: Style) {
  // ----------------- GENERATED 2D CARTOON VILLAIN HEADS (NO BLACK BG, NON-ROUND) -----------------
  if (style === 'knight' || style === 'oni' || style === 'cyborg' || style === 'pirate') {
    renderBossHead(c, style, R);
    return;
  }

  // ----------------- NORMAL ROUND TARGETS -----------------
  c.save();
  c.beginPath();
  c.arc(0, 0, R, 0, TAU);
  c.clip();

  switch (style) {
    // ------------------------------------------------------------- ORANGE (Gambar 1 Referensi!)
    case 'orange': {
      // Kulit Luar Oranye
      c.fillStyle = '#ff7a00';
      c.fillRect(-R, -R, R * 2, R * 2);
      // Kulit Putih Bagian Dalam (Pith)
      c.beginPath();
      c.arc(0, 0, R - 6, 0, TAU);
      c.fillStyle = '#fffae8';
      c.fill();
      // Daging Jeruk Kuning-Oranye
      c.beginPath();
      c.arc(0, 0, R - 13, 0, TAU);
      c.fillStyle = '#ffa700';
      c.fill();

      // 10 Segmen Bulir Jeruk Segar
      const segments = 10;
      for (let i = 0; i < segments; i++) {
        const a0 = (i / segments) * TAU + 0.04;
        const a1 = ((i + 1) / segments) * TAU - 0.04;
        c.beginPath();
        c.moveTo(Math.cos((a0 + a1) / 2) * 10, Math.sin((a0 + a1) / 2) * 10);
        c.arc(0, 0, R - 16, a0, a1);
        c.closePath();
        const sg = c.createRadialGradient(0, 0, 10, 0, 0, R - 16);
        sg.addColorStop(0, '#ffbe26');
        sg.addColorStop(0.7, '#ff9600');
        sg.addColorStop(1, '#ff8000');
        c.fillStyle = sg;
        c.fill();
        c.strokeStyle = '#fff8e1';
        c.lineWidth = 1.2;
        c.stroke();

        // Tekstur bulir-bulir jeruk
        for (let b = 0; b < 4; b++) {
          const ma = a0 + (a1 - a0) * (0.25 + b * 0.2);
          const mr = R * 0.45 + b * 11;
          c.fillStyle = 'rgba(255, 255, 255, 0.35)';
          c.beginPath();
          c.ellipse(Math.cos(ma) * mr, Math.sin(ma) * mr, 2.5, 5, ma, 0, TAU);
          c.fill();
        }
      }

      // Pusat Jeruk Putih
      c.beginPath();
      c.arc(0, 0, 11, 0, TAU);
      c.fillStyle = '#fff9e6';
      c.fill();
      c.beginPath();
      c.arc(0, 0, 6, 0, TAU);
      c.fillStyle = '#fed7aa';
      c.fill();

      shade(c, R, 0.3);
      break;
    }

    // ------------------------------------------------------------- WOOD (Hutan Klasik)
    case 'wood': {
      const g = c.createRadialGradient(0, 0, 4, 0, 0, R);
      g.addColorStop(0, '#d98b43');
      g.addColorStop(0.7, '#a55b23');
      g.addColorStop(1, '#683411');
      c.fillStyle = g;
      c.fillRect(-R, -R, R * 2, R * 2);

      // Cincin serat kayu
      for (let r = 8; r < R - 4; r += 7) {
        c.beginPath();
        c.arc(0, 0, r, 0, TAU);
        c.strokeStyle = 'rgba(74, 34, 10, 0.28)';
        c.lineWidth = 2;
        c.stroke();
      }

      // Kulit kayu luar
      c.beginPath();
      c.arc(0, 0, R - 4, 0, TAU);
      c.strokeStyle = '#421f08';
      c.lineWidth = 8;
      c.stroke();
      shade(c, R, 0.4);
      break;
    }

    // ------------------------------------------------------------- TARGET (Papan Sasaran Bersih)
    case 'target': {
      c.fillStyle = '#1e293b';
      c.fillRect(-R, -R, R * 2, R * 2);
      const rings = 7;
      for (let i = 0; i < rings; i++) {
        const r = (R - 4) * (1 - i / rings);
        c.beginPath();
        c.arc(0, 0, r, 0, TAU);
        c.fillStyle = i % 2 === 0 ? '#f8fafc' : '#ef4444';
        c.fill();
        c.strokeStyle = 'rgba(0,0,0,0.18)';
        c.lineWidth = 1;
        c.stroke();
      }
      // Titik tengah Bullseye emas
      c.beginPath();
      c.arc(0, 0, R * 0.16, 0, TAU);
      c.fillStyle = '#eab308';
      c.fill();
      c.beginPath();
      c.arc(0, 0, 4, 0, TAU);
      c.fillStyle = '#111';
      c.fill();
      shade(c, R, 0.35);
      break;
    }
  }
  c.restore();
}

export const STYLE_COLORS: Record<Style, { chips: string[]; bgTop: string; bgBot: string; glow: string; gridColor: string }> = {
  // Latar Hutan 2D (+20% lebih cerah, segar persis foto 1 & 2 referensi Knife Hit)
  orange: { chips: ['#fffae8', '#ffa700', '#ff7a00'], bgTop: '#1d424b', bgBot: '#132e36', glow: 'rgba(255,165,0,0.32)', gridColor: 'rgba(255,165,0,0.08)' },
  wood: { chips: ['#d98b43', '#a55b23', '#683411'], bgTop: '#223c42', bgBot: '#15292e', glow: 'rgba(245,158,11,0.3)', gridColor: 'rgba(245,158,11,0.08)' },
  target: { chips: ['#f8fafc', '#ef4444', '#eab308'], bgTop: '#203f47', bgBot: '#142c33', glow: 'rgba(239,68,68,0.3)', gridColor: 'rgba(239,68,68,0.08)' },

  // Boss Villain Khas (Latar Hutan Malam Tegas)
  knight: { chips: ['#38bdf8', '#0284c7', '#ff1133'], bgTop: '#1b384a', bgBot: '#102432', glow: 'rgba(56,189,248,0.42)', gridColor: 'rgba(56,189,248,0.1)' },
  oni: { chips: ['#ef4444', '#b91c1c', '#facc15'], bgTop: '#381c22', bgBot: '#220e13', glow: 'rgba(239,68,68,0.45)', gridColor: 'rgba(239,68,68,0.1)' },
  cyborg: { chips: ['#94a3b8', '#475569', '#ff1133'], bgTop: '#20364e', bgBot: '#122234', glow: 'rgba(34,211,238,0.42)', gridColor: 'rgba(34,211,238,0.1)' },
  pirate: { chips: ['#f1f5f9', '#0f172a', '#eab308'], bgTop: '#1e2c45', bgBot: '#111b2d', glow: 'rgba(234,179,8,0.42)', gridColor: 'rgba(234,179,8,0.1)' },
};
