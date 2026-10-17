/** The faceted diamond used by Diamond Breaker, shared with Gun Hit Arcade. */
export function drawBreakerDiamond(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, scale: number) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(scale, scale);
  const G = [-54, -27, 0, 27, 54].map((x) => ({ x, y: -6 }));
  const T = [-28, -9, 9, 28].map((x) => ({ x, y: -29 }));
  const P = { x: 0, y: 52 };
  const strip = [G[0], T[0], G[1], T[1], G[2], T[2], G[3], T[3], G[4]];
  const crownL = [78, 92, 70, 88, 64, 84, 72, 90, 76];
  for (let i = 0; i < strip.length - 2; i++) {
    const a = strip[i], b = strip[i + 1], c = strip[i + 2];
    ctx.fillStyle = `hsl(${188 + i * 3},92%,${crownL[i] + Math.sin(t * 2 + i) * 6}%)`;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = `hsl(195,100%,${90 + Math.sin(t * 3) * 5}%)`;
  ctx.beginPath(); ctx.moveTo(T[0].x, T[0].y); ctx.lineTo(T[3].x, T[3].y); ctx.lineTo(T[2].x, -21); ctx.lineTo(T[1].x, -21); ctx.closePath(); ctx.fill();
  const pavL = [55, 72, 48, 66];
  for (let i = 0; i < 4; i++) {
    const a = G[i], b = G[i + 1];
    const mid = { x: ((a.x + b.x) / 2) * 0.5, y: 22 };
    const l = pavL[i] + Math.sin(t * 2.4 + i * 1.7) * 7;
    ctx.fillStyle = `hsl(${200 + i * 4},85%,${l}%)`;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(mid.x, mid.y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = `hsl(${205 + i * 4},85%,${l - 12}%)`;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mid.x, mid.y); ctx.lineTo(P.x, P.y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = `hsl(${195 + i * 4},85%,${l + 8}%)`;
    ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(mid.x, mid.y); ctx.lineTo(P.x, P.y); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(T[0].x, T[0].y); ctx.lineTo(T[3].x, T[3].y); ctx.lineTo(G[4].x, G[4].y); ctx.lineTo(P.x, P.y); ctx.lineTo(G[0].x, G[0].y);
  ctx.closePath(); ctx.stroke();
  const sp = (Math.sin(t * 2.2) + 1) / 2;
  const sx = -20 + Math.sin(t * 0.7) * 10, sy = -18, s = 6 + sp * 8;
  ctx.fillStyle = `rgba(255,255,255,${0.4 + sp * 0.6})`;
  ctx.beginPath();
  ctx.moveTo(sx, sy - s); ctx.lineTo(sx + s * 0.18, sy - s * 0.18); ctx.lineTo(sx + s, sy); ctx.lineTo(sx + s * 0.18, sy + s * 0.18);
  ctx.lineTo(sx, sy + s); ctx.lineTo(sx - s * 0.18, sy + s * 0.18); ctx.lineTo(sx - s, sy); ctx.lineTo(sx - s * 0.18, sy - s * 0.18);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}
