import type { BossType } from './bossRoster';

const TAU = Math.PI * 2;

export interface BossProjectile { x: number; y: number; vx: number; vy: number; rot: number; type: BossType }

/** Draw a distinct, flat projectile silhouette for each boss; no shared neon glow. */
export function drawBossProjectile(c: CanvasRenderingContext2D, bp: BossProjectile, time: number, visualScale = 1) {
  c.save();
  c.translate(bp.x, bp.y);
  c.scale(2.8 * visualScale, 2.8 * visualScale);
  c.rotate(bp.rot);

  // Individual trails sit behind the shot (local -Y) and are intentionally
  // graphic shapes rather than the same orange flame for every boss.
  if (bp.type === 'knight') {
    c.fillStyle = 'rgba(56,189,248,0.24)';
    c.beginPath(); c.moveTo(-2, -12); c.lineTo(0, -42); c.lineTo(2, -12); c.closePath(); c.fill();
    c.fillStyle = 'rgba(125,211,252,0.48)';
    c.beginPath(); c.moveTo(-6, -12); c.lineTo(-12, -28); c.lineTo(-3, -17); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(6, -12); c.lineTo(12, -28); c.lineTo(3, -17); c.closePath(); c.fill();
  } else if (bp.type === 'oni') {
    const flick = 1 + Math.sin(time * 26 + bp.x * 0.06) * 0.18;
    c.fillStyle = '#b91c1c';
    c.beginPath(); c.moveTo(-7, -10); c.quadraticCurveTo(-11 * flick, -27, -2, -39 * flick); c.lineTo(0, -13); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(7, -10); c.quadraticCurveTo(11 * flick, -27, 2, -39 * flick); c.lineTo(0, -13); c.closePath(); c.fill();
    c.fillStyle = '#f97316';
    c.beginPath(); c.moveTo(-3, -12); c.quadraticCurveTo(-5, -24, 0, -31 * flick); c.quadraticCurveTo(5, -22, 3, -12); c.closePath(); c.fill();
  } else if (bp.type === 'cyborg') {
    c.fillStyle = '#164e63';
    for (let i = 0; i < 3; i++) c.fillRect(-3, -18 - i * 8, 6, 4);
    c.fillStyle = '#f97316';
    c.beginPath(); c.moveTo(-3, -13); c.lineTo(0, -28); c.lineTo(3, -13); c.closePath(); c.fill();
    c.fillStyle = '#67e8f9';
    c.fillRect(-1, -18, 2, 4);
  } else if (bp.type === 'pirate') {
    c.fillStyle = 'rgba(71,85,105,0.62)';
    for (const puff of [{ x: -4, y: -18, r: 4 }, { x: 3, y: -27, r: 5 }, { x: -2, y: -37, r: 3 }]) {
      c.beginPath(); c.arc(puff.x, puff.y, puff.r, 0, TAU); c.fill();
    }
    c.fillStyle = 'rgba(34,197,94,0.72)';
    c.beginPath(); c.moveTo(0, -14); c.lineTo(-3, -23); c.lineTo(0, -20); c.lineTo(3, -25); c.closePath(); c.fill();
  }

  if (bp.type === 'knight') {
    // A clearly readable flying knight sword: blade points along +Y travel,
    // with a fuller, crossguard, wrapped grip, and pommel.
    c.fillStyle = '#7dd3fc';
    c.beginPath(); c.moveTo(-4, -9); c.lineTo(-4, 10); c.lineTo(0, 21); c.lineTo(4, 10); c.lineTo(4, -9); c.closePath(); c.fill();
    c.fillStyle = '#0c4a6e';
    c.beginPath(); c.moveTo(-1.4, -7); c.lineTo(-1.4, 11); c.lineTo(0, 16); c.lineTo(1.4, 11); c.lineTo(1.4, -7); c.closePath(); c.fill();
    c.fillStyle = '#e0f2fe'; c.fillRect(-0.8, -5, 1.6, 17);
    c.fillStyle = '#38bdf8';
    c.beginPath(); c.moveTo(-10, -10); c.lineTo(-7, -6); c.lineTo(7, -6); c.lineTo(10, -10); c.lineTo(8, -3); c.lineTo(-8, -3); c.closePath(); c.fill();
    c.fillStyle = '#082f49'; c.fillRect(-3, -18, 6, 11);
    c.fillStyle = '#7dd3fc';
    for (const gy of [-16, -12, -8]) c.fillRect(-3.5, gy, 7, 1.5);
    c.beginPath(); c.arc(0, -20, 3.5, 0, TAU); c.fill();
  } else if (bp.type === 'oni') {
    // Hot red fireball with two horn-shaped tongues, echoing the Oni silhouette.
    c.fillStyle = '#991b1b'; c.beginPath(); c.arc(0, 1, 14, 0, TAU); c.fill();
    c.fillStyle = '#ef4444'; c.beginPath(); c.arc(0, 1, 11, 0, TAU); c.fill();
    c.fillStyle = '#fde047'; c.beginPath(); c.arc(0, 2, 6, 0, TAU); c.fill();
    c.fillStyle = '#fff7ae'; c.beginPath(); c.arc(0, 3, 2.5, 0, TAU); c.fill();
    c.fillStyle = '#facc15';
    for (const side of [-1, 1]) {
      c.beginPath(); c.moveTo(side * 7, -8); c.lineTo(side * 13, -17); c.lineTo(side * 10, -5); c.closePath(); c.fill();
    }
  } else if (bp.type === 'cyborg') {
    // Hard-edged cyan micro-rocket, with red nose and visible stabilizer fins.
    c.fillStyle = '#0e7490';
    c.beginPath(); c.moveTo(-5, -6); c.lineTo(-11, 4); c.lineTo(-5, 3); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(5, -6); c.lineTo(11, 4); c.lineTo(5, 3); c.closePath(); c.fill();
    c.fillStyle = '#22d3ee'; c.fillRect(-5, -8, 10, 20);
    c.beginPath(); c.moveTo(-5, -8); c.lineTo(0, -15); c.lineTo(5, -8); c.closePath(); c.fill();
    c.fillStyle = '#ff1133'; c.fillRect(-2, 1, 4, 6);
    c.fillStyle = '#cffafe'; c.fillRect(-1, -6, 2, 8);
  } else {
    // Pirate iron shot: battered dark cannonball with a simple bone/skull mark.
    c.fillStyle = '#111827'; c.beginPath(); c.arc(0, 0, 13, 0, TAU); c.fill();
    c.strokeStyle = '#eab308'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#86efac'; c.beginPath(); c.arc(0, -1, 5, 0, TAU); c.fill();
    c.fillStyle = '#052e16';
    c.beginPath(); c.arc(-2, -2, 1, 0, TAU); c.arc(2, -2, 1, 0, TAU); c.fill();
    c.fillRect(-2.5, 1, 5, 1.5);
    c.fillStyle = '#eab308'; c.fillRect(-6, 7, 12, 2);
  }
  c.restore();
}
