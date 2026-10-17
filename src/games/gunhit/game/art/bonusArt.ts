import { drawBreakerCoin } from '../../../shared/coinArt';

const TAU = Math.PI * 2;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** The very same reflective dollar coin and specular sweep as Diamond Breaker. */
export function drawBonusCoin(
  ctx: CanvasRenderingContext2D, x: number, y: number, r: number, time: number,
  phase = 0, glowing = false,
) {
  const flat = Math.abs(Math.cos(time * 2.2 + phase)) * 0.8 + 0.2;
  drawBreakerCoin(ctx, x, y, r, time, phase, flat, glowing);
}

export class TreasureChest {
  shake = 0;
  lid = 0;
  private coins: { x: number; y: number; r: number; phase: number }[];
  private coinPile: HTMLCanvasElement | null = null;

  constructor() {
    // Overlapping tiers form a low, rounded heap WITHIN the 168px-wide mouth.
    // Random independent positions used to leave coins suspended above the lid
    // and get their crowns cut off by the old rectangular clip.
    const tiers = [
      { count: 5, halfWidth: 31, y: -29, radius: 9 },
      { count: 7, halfWidth: 49, y: -17, radius: 9.5 },
      { count: 9, halfWidth: 61, y: -5, radius: 10 },
      { count: 11, halfWidth: 70, y: 7, radius: 10 },
    ];
    this.coins = tiers.flatMap(({ count, halfWidth, y, radius }, row) =>
      Array.from({ length: count }, (_, i) => ({
        // Keep neighboring rows in contact even at the edge of the random
        // jitter range: a coin should never look suspended above the pile.
        x: -halfWidth + (2 * halfWidth * i) / (count - 1) + rand(-1.2, 1.2) + (row % 2 ? 2 : -2),
        y: y + rand(-1, 1),
        r: radius + rand(-0.45, 0.45),
        phase: rand(0, TAU),
      })),
    ).sort((a, b) => a.y - b.y);
  }

  hit(power: number) {
    this.shake = Math.min(14, this.shake + 4 + power);
    this.lid = Math.min(1, this.lid + 0.04 + power * 0.01);
  }

  update(dt: number) {
    this.shake = Math.max(0, this.shake - dt * 30);
    this.lid = Math.max(0, this.lid - dt * 0.12);
  }

  private getCoinPile() {
    if (this.coinPile) return this.coinPile;
    const image = document.createElement('canvas');
    // Leave transparent breathing room around the WHOLE heap and its twinkles.
    // The chest's front wall occludes the bottom; a bitmap clip never cuts off
    // coin tops or leaves an artificial horizontal edge.
    image.width = 220; image.height = 144;
    const c = image.getContext('2d')!;
    c.translate(110, 74);
    const mound = c.createLinearGradient(0, -40, 0, 18);
    mound.addColorStop(0, '#f4cf6d');
    mound.addColorStop(0.4, '#d5a337');
    mound.addColorStop(1, '#764415');
    c.beginPath();
    c.moveTo(-80, 15);
    c.bezierCurveTo(-79, -13, -52, -26, -37, -27);
    c.bezierCurveTo(-27, -39, 17, -40, 37, -27);
    c.bezierCurveTo(61, -23, 79, -6, 80, 15);
    c.closePath();
    c.fillStyle = mound;
    c.fill();
    c.strokeStyle = 'rgba(81,45,12,0.6)';
    c.lineWidth = 1.5;
    c.stroke();
    for (const coin of this.coins) drawBonusCoin(c, coin.x, coin.y, coin.r, 0, coin.phase);
    this.coinPile = image;
    return image;
  }

  /** The source chest is drawn at (0,0), 184px across and 162px high. */
  draw(ctx: CanvasRenderingContext2D, time: number, drawEmbedded?: (ctx: CanvasRenderingContext2D) => void) {
    ctx.save();
    ctx.translate(this.shake ? rand(-1, 1) * this.shake * 0.5 : 0, this.shake ? rand(-1, 1) * this.shake * 0.3 : 0);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gl = ctx.createRadialGradient(0, -20, 10, 0, -20, 190);
    gl.addColorStop(0, `rgba(255,210,90,${0.28 + this.lid * 0.3})`);
    gl.addColorStop(1, 'rgba(255,170,0,0)');
    ctx.fillStyle = gl;
    ctx.beginPath(); ctx.arc(0, -20, 190, 0, TAU); ctx.fill();
    ctx.restore();

    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(0, 72, 108, 18, 0, 0, TAU); ctx.fill();

    // Open lid behind the overflowing pile of gold.
    ctx.save();
    ctx.translate(0, -34);
    ctx.rotate(-0.95 - this.lid * 0.25);
    const lg = ctx.createLinearGradient(0, -46, 0, 6);
    lg.addColorStop(0, '#8a5a2c'); lg.addColorStop(0.5, '#6b4420'); lg.addColorStop(1, '#4a2d14');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.moveTo(-92, 4); ctx.quadraticCurveTo(-92, -48, 0, -48); ctx.quadraticCurveTo(92, -48, 92, 4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c9972f'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-34, -42); ctx.lineTo(-34, 4); ctx.moveTo(34, -42); ctx.lineTo(34, 4); ctx.stroke();
    ctx.strokeStyle = '#8b6a1e'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-92, 2); ctx.quadraticCurveTo(0, -46, 92, 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,220,150,0.18)';
    ctx.beginPath(); ctx.moveTo(-84, 2); ctx.quadraticCurveTo(-84, -40, 0, -40); ctx.quadraticCurveTo(84, -40, 84, 2); ctx.closePath(); ctx.fill();
    ctx.restore();

    // A dark recessed cavity and rear rim put every coin INSIDE the box.
    ctx.fillStyle = '#633914';
    ctx.beginPath(); ctx.roundRect(-87, -8, 174, 29, 9); ctx.fill();
    const cavity = ctx.createRadialGradient(0, 2, 8, 0, 3, 92);
    cavity.addColorStop(0, '#47290d'); cavity.addColorStop(1, '#211207');
    ctx.fillStyle = cavity;
    ctx.beginPath(); ctx.ellipse(0, 3, 83, 17, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#a16d2d'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 3, 85, 17, 0, Math.PI, TAU); ctx.stroke();
    ctx.drawImage(this.getCoinPile(), -110, -74);

    // The front wall and raised lip naturally hide the lowest row; no crop,
    // detached top layer or extra line of coins pasted over the wood.
    const body = ctx.createLinearGradient(0, 7, 0, 70);
    body.addColorStop(0, '#825326'); body.addColorStop(0.45, '#60401e'); body.addColorStop(1, '#3a2310');
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.roundRect(-92, 10, 184, 58, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
    for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-92, 10 + i * 19); ctx.lineTo(92, 10 + i * 19); ctx.stroke(); }
    ctx.fillStyle = '#c9972f'; ctx.fillRect(-40, 10, 11, 58); ctx.fillRect(29, 10, 11, 58);
    ctx.fillStyle = 'rgba(255,240,180,0.45)'; ctx.fillRect(-40, 10, 3, 58); ctx.fillRect(29, 10, 3, 58);
    ctx.fillStyle = '#a87b1d'; ctx.beginPath(); ctx.roundRect(-92, 6, 184, 10, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,225,150,0.35)'; ctx.fillRect(-92, 6, 184, 2.5);
    ctx.fillStyle = '#d4a62c'; ctx.beginPath(); ctx.roundRect(-13, 17, 26, 24, 5); ctx.fill();
    ctx.fillStyle = '#5a3f0a'; ctx.beginPath(); ctx.arc(0, 27, 4.6, 0, TAU); ctx.fill(); ctx.fillRect(-1.8, 27, 3.6, 9);
    ctx.fillStyle = '#e6c25a';
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-80 + i * 32, 62, 2.8, 0, TAU); ctx.fill(); }
    // The impacts stay attached to the same shaking chest, rather than floating
    // at world coordinates while the treasure rattles under fire.
    drawEmbedded?.(ctx);

    // A few highlights travel across the actual heap instead of floating
    // above the chest (the coins ejected by gunfire animate separately).
    for (const [i, x, y] of [[0, -39, -21], [1, 5, -32], [2, 48, -12]]) {
      const glint = Math.max(0, Math.sin(time * 3 + i * 2.1)) ** 4;
      if (glint < 0.05) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = glint * 0.8;
      ctx.fillStyle = '#fff5c7';
      ctx.beginPath();
      ctx.moveTo(0, -4); ctx.lineTo(1, -1); ctx.lineTo(4, 0); ctx.lineTo(1, 1);
      ctx.lineTo(0, 4); ctx.lineTo(-1, 1); ctx.lineTo(-4, 0); ctx.lineTo(-1, -1);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}
