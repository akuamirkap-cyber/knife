import type { ProjKind } from '../weapons';
import { TAU, lin, radial, star } from './kit';

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

export function drawProjectileExtra4(c: C, kind: ProjKind, len: number, t: number) {
  switch (kind) {
    // ---------------------------------------------------------- REVOLVER KELANA
    case 'lone_star': {
      // Peluru revolver kuning bersayap
      c.beginPath();
      c.moveTo(-4, len * 0.4);
      c.lineTo(-4, 6);
      c.quadraticCurveTo(-4, -1, 0, -2);
      c.quadraticCurveTo(4, -1, 4, 6);
      c.lineTo(4, len * 0.4);
      c.closePath();
      c.fillStyle = lin(c, -4, 4, ['#7c4a12', '#ffe695', '#7c4a12']);
      c.fill();
      c.fillStyle = lin(c, -5, 5, ['#8a6a14', '#f5d77a', '#8a6a14']);
      c.fillRect(-5, len * 0.4, 10, len * 0.6 - 3);
      c.fillStyle = '#5a3a08';
      c.fillRect(-5, len * 0.4, 10, 1.5);
      c.fillRect(-5, len - 5.5, 10, 1.5);
      c.fillStyle = '#c08a24';
      c.fillRect(-6, len - 3, 12, 3);
      break;
    }
    // ---------------------------------------------------------- PHOTON SABER
    case 'photon_saber': {
      const pulse = 0.8 + 0.2 * Math.sin(t * 14);
      glowE(c, len / 2, 10, len * 0.6, '34,211,238', 0.6 * pulse);
      c.save();
      c.shadowColor = '#22d3ee';
      c.shadowBlur = 16 * pulse;
      c.beginPath();
      c.roundRect(-3.5, -1, 7, len, 3.5);
      c.fillStyle = lin(c, 0, 0, ['#ffffff', '#a5f3fc', '#22d3ee']);
      c.fill();
      c.restore();
      c.fillStyle = `rgba(255,255,255,${0.9 * pulse})`;
      c.beginPath();
      c.roundRect(-1.2, 1, 2.4, len - 2, 1.2);
      c.fill();
      break;
    }
    // ---------------------------------------------------------- PLASMA REPEATER
    case 'plasma_repeater': {
      const pulse = 0.75 + 0.25 * Math.sin(t * 12);
      glowE(c, len / 2, 9, len * 0.6, '244,63,94', 0.55 * pulse);
      c.beginPath();
      c.roundRect(-4, 0, 8, len, 4);
      c.fillStyle = '#f43f5e';
      c.shadowColor = '#f43f5e';
      c.shadowBlur = 12;
      c.fill();
      c.shadowBlur = 0;
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.roundRect(-1.4, 2, 2.8, len - 4, 1.4);
      c.fill();
      break;
    }
    // ---------------------------------------------------------- WARP DISRUPTOR
    case 'warp_disruptor': {
      const pulse = 0.8 + 0.2 * Math.sin(t * 10);
      glowE(c, len / 2, 16, len * 0.65, '34,197,94', 0.65 * pulse);
      // Silindrik hijau raksasa
      c.beginPath();
      c.roundRect(-7, 0, 14, len, 7);
      c.fillStyle = lin(c, -7, 7, ['#052e16', '#4ade80', '#bbf7d0', '#22c55e', '#052e16']);
      c.fill();
      // Core putih
      c.fillStyle = `rgba(255,255,255,${0.9 * pulse})`;
      c.beginPath();
      c.roundRect(-2.5, 3, 5, len - 6, 2.5);
      c.fill();
      // Ring putaran
      c.strokeStyle = `rgba(187,247,208,${0.8 * pulse})`;
      c.lineWidth = 1.4;
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        c.ellipse(0, (t * 60 + i * (len / 4)) % len, 7, 2, 0, 0, TAU);
        c.stroke();
      }
      break;
    }
    // ---------------------------------------------------------- DEFLECTOR SHIELD
    case 'deflector_shield': {
      const pulse = 0.8 + 0.2 * Math.sin(t * 9);
      glowE(c, len / 2, 11, len * 0.6, '129,140,248', 0.55 * pulse);
      // Peluru segi enam (hex)
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU + Math.PI / 6;
        c.lineTo(Math.cos(a) * 7, len / 2 + Math.sin(a) * (len / 2 - 1));
      }
      c.closePath();
      c.fillStyle = radial(c, 0, len / 2, len / 2, ['#ffffff', '#818cf8', '#312e81']);
      c.shadowColor = '#818cf8';
      c.shadowBlur = 14;
      c.fill();
      c.shadowBlur = 0;
      c.strokeStyle = '#c7d2fe';
      c.lineWidth = 1.4;
      c.stroke();
      break;
    }
    // ---------------------------------------------------------- GAUNTLET CANNON
    case 'gauntlet_cannon': {
      const pulse = 0.8 + 0.2 * Math.sin(t * 8);
      glowE(c, len / 2, 13, len * 0.6, '239,68,68', 0.65 * pulse);
      // Bola energi merah
      c.beginPath();
      c.arc(0, len / 2, Math.min(9, len * 0.45), 0, TAU);
      c.fillStyle = radial(c, 0, len / 2, Math.min(9, len * 0.45), ['#ffffff', '#fca5a5', '#dc2626', '#450a0a']);
      c.shadowColor = '#ef4444';
      c.shadowBlur = 16;
      c.fill();
      c.shadowBlur = 0;
      // Cincin api
      c.strokeStyle = `rgba(251,191,36,${0.8 * pulse})`;
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(0, len / 2, 12, 4, 0, 0, TAU);
      c.stroke();
      break;
    }
    // ---------------------------------------------------------- ALIEN RAY
    case 'alien_ray': {
      const pulse = 0.75 + 0.25 * Math.sin(t * 13);
      glowE(c, len / 2, 9, len * 0.6, '74,222,128', 0.6 * pulse);
      // Elips hijau alien
      c.beginPath();
      c.ellipse(0, len / 2, 6.5, len / 2, 0, 0, TAU);
      c.fillStyle = radial(c, 0, len / 2, len / 2, ['#ffffff', '#bbf7d0', '#4ade80', '#166534']);
      c.shadowColor = '#4ade80';
      c.shadowBlur = 14;
      c.fill();
      c.shadowBlur = 0;
      // Inti hitam kecil
      c.fillStyle = 'rgba(5,46,22,0.85)';
      c.beginPath();
      c.ellipse(0, len / 2, 2.2, len * 0.22, 0, 0, TAU);
      c.fill();
      break;
    }
    // ---------------------------------------------------------- PULSE RIFLE
    case 'pulse_rifle': {
      const pulse = 0.8 + 0.2 * Math.sin(t * 16);
      glowE(c, len / 2, 8, len * 0.55, '56,189,248', 0.55 * pulse);
      // Peluru listrik dart
      c.beginPath();
      c.moveTo(0, -3);
      c.lineTo(4, 8);
      c.lineTo(2, len - 4);
      c.lineTo(-2, len - 4);
      c.lineTo(-4, 8);
      c.closePath();
      c.fillStyle = lin(c, -4, 4, ['#0c4a6e', '#bae6fd', '#38bdf8', '#0c4a6e']);
      c.fill();
      // Kilatan listrik
      c.strokeStyle = `rgba(255,255,255,${0.85 * pulse})`;
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(-3, 4); c.lineTo(3, 10);
      c.moveTo(3, 12); c.lineTo(-3, 18);
      c.stroke();
      break;
    }
    // ---------------------------------------------------------- CRYO BLASTER
    case 'cryo_blaster': {
      const pulse = 0.8 + 0.2 * Math.sin(t * 9);
      glowE(c, len / 2, 10, len * 0.6, '103,232,249', 0.55 * pulse);
      // Kristal es tajam
      c.beginPath();
      c.moveTo(0, -4);
      c.lineTo(6, 8);
      c.lineTo(3, len - 3);
      c.lineTo(-3, len - 3);
      c.lineTo(-6, 8);
      c.closePath();
      c.fillStyle = lin(c, -6, 6, ['#ffffff', '#cffafe', '#22d3ee', '#0e7490']);
      c.fill();
      c.strokeStyle = `rgba(255,255,255,${0.9 * pulse})`;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(0, -4); c.lineTo(0, len - 4);
      c.moveTo(-6, 8); c.lineTo(6, 8);
      c.stroke();
      break;
    }
    // ---------------------------------------------------------- HYPERDRIVE
    case 'hyperdrive': {
      const pulse = 0.8 + 0.2 * Math.sin(t * 11);
      glowE(c, len / 2, 11, len * 0.6, '96,165,250', 0.6 * pulse);
      // Peluru berlubang (torus)
      c.beginPath();
      c.arc(0, len / 2, Math.min(8, len * 0.4), 0, TAU);
      c.fillStyle = radial(c, 0, len / 2, Math.min(8, len * 0.4), ['#ffffff', '#bfdbfe', '#3b82f6', '#1e3a8a']);
      c.shadowColor = '#60a5fa';
      c.shadowBlur = 14;
      c.fill();
      c.shadowBlur = 0;
      c.fillStyle = 'rgba(30,58,138,0.9)';
      c.beginPath();
      c.arc(0, len / 2, Math.min(3.5, len * 0.18), 0, TAU);
      c.fill();
      break;
    }
    // ---------------------------------------------------------- QUANTUM DESTABILIZER
    case 'quantum_destabilizer': {
      const pulse = 0.75 + 0.25 * Math.sin(t * 12);
      glowE(c, len / 2, 10, len * 0.6, '168,85,247', 0.6 * pulse);
      // Bola portal ungu dengan cincin
      c.beginPath();
      c.arc(0, len / 2, Math.min(8, len * 0.42), 0, TAU);
      c.fillStyle = radial(c, 0, len / 2, Math.min(8, len * 0.42), ['#ffffff', '#e9d5ff', '#a855f7', '#4c1d95']);
      c.shadowColor = '#a855f7';
      c.shadowBlur = 14;
      c.fill();
      c.shadowBlur = 0;
      // Cincin berputar
      c.save();
      c.translate(0, len / 2);
      c.rotate(t * 4);
      c.strokeStyle = `rgba(233,213,255,${0.9 * pulse})`;
      c.lineWidth = 1.4;
      c.beginPath();
      c.ellipse(0, 0, 11, 4, 0, 0, TAU);
      c.stroke();
      c.restore();
      // Pusat hitam
      c.fillStyle = '#000';
      c.beginPath();
      c.arc(0, len / 2, 3, 0, TAU);
      c.fill();
      break;
    }
    default:
      star(c, 0, len / 2, 6, '#fff');
  }
}
