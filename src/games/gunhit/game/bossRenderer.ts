import type { BossType } from './bossRoster';
import { getBossAsset } from './bossAssetProcessor';
import { drawVectorBossHead } from './bossRoster';

export function renderBossHead(c: CanvasRenderingContext2D, type: BossType, R: number) {
  const asset = getBossAsset(type);

  c.save();

  if (asset && asset.canvas) {
    const pad = R * 1.05;
    const size = pad * 2;

    const glowColor =
      type === 'knight'
        ? '#38bdf8'
        : type === 'oni'
        ? '#ef4444'
        : type === 'cyborg'
        ? '#22d3ee'
        : '#eab308';

    // 1. Organic Silhouette Clip to guarantee NO SQUARE/DIAMOND CORNERS EVER SHOW!
    c.save();
    c.beginPath();
    // Trace the exact 360-degree contour of the head
    for (let deg = 0; deg <= 360; deg += 4) {
      const rad = (deg * Math.PI) / 180;
      const idx = deg % 360;
      const r = (asset.radii[idx] || 0.72) * pad * 1.02;
      const x = Math.cos(rad) * r;
      const y = Math.sin(rad) * r;
      if (deg === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.closePath();
    c.clip(); // Clips out any square sticker border completely!

    // Draw the cutout
    c.drawImage(asset.canvas, -pad, -pad, size, size);
    c.restore();

    // 2. Add lush neon cartoon villain outline following the character contour
    // (Dark Knight tampil polos: glow outline dihilangkan sesuai permintaan.)
    if (type !== 'knight') {
      c.save();
      c.shadowColor = glowColor;
      c.shadowBlur = 14;
      c.strokeStyle = glowColor;
      c.lineWidth = 3.5;
      c.beginPath();
      for (let deg = 0; deg <= 360; deg += 4) {
        const rad = (deg * Math.PI) / 180;
        const idx = deg % 360;
        const r = (asset.radii[idx] || 0.72) * pad * 1.01;
        const x = Math.cos(rad) * r;
        const y = Math.sin(rad) * r;
        if (deg === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();
      c.stroke();
      c.restore();
    }

    c.restore();
    return;
  }

  // Fallback vector flat-cartoon head (guaranteed 100% transparent background)
  drawVectorBossHead(c, type, R);
  c.restore();
}
