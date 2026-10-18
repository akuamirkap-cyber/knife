const TAU = Math.PI * 2;
const UNIT_RADIUS = 12;
const SPRITE_DPR = 2;
const SPRITE_SIZE = 128; // Room for a true 25px halo at 2x, without clipping.

interface CoinSprites {
  face: HTMLCanvasElement;
  sheen: HTMLCanvasElement;
  glow: HTMLCanvasElement;
}

let sprites: CoinSprites | null = null;

function makeSprite() {
  const image = document.createElement('canvas');
  image.width = image.height = SPRITE_SIZE;
  const c = image.getContext('2d')!;
  c.setTransform(SPRITE_DPR, 0, 0, SPRITE_DPR, SPRITE_SIZE / 2, SPRITE_SIZE / 2);
  return { image, c };
}

/** Diamond Breaker's gold dollar coin, cached at 2x for both game slides. */
function coinSprites(): CoinSprites {
  if (sprites) return sprites;
  const { image: face, c } = makeSprite();
  const r = UNIT_RADIUS;
  const g = c.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#fff8d0');
  g.addColorStop(0.45, '#ffd54a');
  g.addColorStop(0.8, '#e8a317');
  g.addColorStop(1, '#a86a08');
  c.fillStyle = g;
  c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(255,245,190,0.85)'; c.lineWidth = r * 0.12;
  c.beginPath(); c.arc(0, 0, r * 0.76, 0, TAU); c.stroke();
  c.fillStyle = 'rgba(180,110,10,0.55)';
  c.font = `900 ${r * 1.05}px system-ui, sans-serif`;
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText('$', 0, r * 0.06);
  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.beginPath(); c.ellipse(-r * 0.34, -r * 0.4, r * 0.2, r * 0.13, -0.6, 0, TAU); c.fill();

  const { image: sheen, c: shine } = makeSprite();
  shine.rotate(-0.6);
  const stripe = shine.createLinearGradient(-r, 0, r, 0);
  stripe.addColorStop(0, 'rgba(255,255,255,0)');
  stripe.addColorStop(0.5, 'rgba(255,255,255,0.9)');
  stripe.addColorStop(1, 'rgba(255,255,255,0)');
  shine.fillStyle = stripe;
  shine.beginPath(); shine.ellipse(0, 0, r * 0.32, r, 0, 0, TAU); shine.fill();

  const { image: glow, c: light } = makeSprite();
  const halo = light.createRadialGradient(0, 0, 0, 0, 0, 25);
  halo.addColorStop(0, 'rgba(255,215,90,0.4)');
  halo.addColorStop(1, 'rgba(255,180,0,0)');
  light.fillStyle = halo;
  light.beginPath(); light.arc(0, 0, 25, 0, TAU); light.fill();
  sprites = { face, sheen, glow };
  return sprites;
}

/** The same reflective dollar sign, moving specular sweep and sparkle in both games. */
export function drawBreakerCoin(
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number, time: number,
  phase = 0, flat = 1, glowing = false, sparkle = true,
) {
  const { face, sheen, glow } = coinSprites();
  // Canvas artwork is cached at 2x. Account for its actual pixel radius when
  // placing it, otherwise a requested 11px coin is accidentally 22px wide.
  const imageScale = r / (UNIT_RADIUS * SPRITE_DPR);
  ctx.save();
  ctx.translate(x, y);
  if (glowing) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(glow, -SPRITE_SIZE / 2 * imageScale, -SPRITE_SIZE / 2 * imageScale,
      SPRITE_SIZE * imageScale, SPRITE_SIZE * imageScale);
    ctx.restore();
  }
  ctx.scale(flat * imageScale, imageScale);
  ctx.drawImage(face, -SPRITE_SIZE / 2, -SPRITE_SIZE / 2);
  const sweep = (Math.sin(time * 3.4 + phase) + 1) / 2;
  ctx.save();
  ctx.beginPath(); ctx.arc(0, 0, UNIT_RADIUS, 0, TAU); ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.35 + sweep * 0.6;
  ctx.drawImage(sheen, -SPRITE_SIZE / 2 + (sweep - 0.5) * UNIT_RADIUS * 1.9, -SPRITE_SIZE / 2);
  ctx.restore();
  ctx.restore();

  if (!sparkle) return;
  const twinkle = Math.sin(time * 5 + phase * 2);
  if (twinkle <= 0.72) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = Math.min(1, (twinkle - 0.72) * 3.4);
  ctx.fillStyle = '#fffbe0';
  const sx = x + r * 0.5, sy = y - r * 0.5, size = r * 1.5;
  ctx.beginPath();
  ctx.moveTo(sx, sy - size); ctx.lineTo(sx + size * 0.18, sy - size * 0.18);
  ctx.lineTo(sx + size, sy); ctx.lineTo(sx + size * 0.18, sy + size * 0.18);
  ctx.lineTo(sx, sy + size); ctx.lineTo(sx - size * 0.18, sy + size * 0.18);
  ctx.lineTo(sx - size, sy); ctx.lineTo(sx - size * 0.18, sy - size * 0.18);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
