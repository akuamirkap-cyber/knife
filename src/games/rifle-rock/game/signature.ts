import type { WeaponDef } from './catalog';
import { GUN_LEN, type GunDraw } from './guns';

const TAU = Math.PI * 2;

export function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const pick = (h: number, shift: number, n: number) => (h >>> shift) % n;

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}
function glow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, a = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = a;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.restore();
}
function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, pts: number, inner: number, rot: number) {
  ctx.beginPath();
  for (let i = 0; i < pts * 2; i++) {
    const a = (i / (pts * 2)) * TAU + rot;
    const rad = i % 2 ? r * inner : r;
    const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
}

/* ---------- muzzle devices (at the front, y ~ 0..30) ---------- */
function muzzleDevice(ctx: CanvasRenderingContext2D, v: number, w: WeaponDef, d: GunDraw) {
  ctx.save();
  switch (v) {
    case 0: // triple-port brake
      ctx.fillStyle = '#15181d';
      rr(ctx, -9, -4, 18, 24, 3); ctx.fill();
      ctx.fillStyle = w.c2;
      for (let i = 0; i < 3; i++) { ctx.fillRect(-9, 0 + i * 7, 18, 2.4); }
      break;
    case 1: // long suppressor
      ctx.fillStyle = '#1d2228';
      rr(ctx, -8, -16, 16, 50, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1.4;
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-8, -10 + i * 9); ctx.lineTo(8, -10 + i * 9); ctx.stroke(); }
      ctx.fillStyle = w.c2; ctx.fillRect(-8, -16, 16, 3);
      break;
    case 2: // claw prongs
      ctx.strokeStyle = w.c2; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s * 5, 22); ctx.quadraticCurveTo(s * 15, 4, s * 7, -16);
        ctx.stroke();
      }
      glow(ctx, 0, 0, 20, w.glow, 0.45 + d.flash * 0.5);
      break;
    case 3: // energy ring
      ctx.strokeStyle = w.c2; ctx.lineWidth = 3.4;
      ctx.beginPath(); ctx.ellipse(0, 4, 15, 6, 0, 0, TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.ellipse(0, 4, 15, 6, 0, 0, TAU); ctx.stroke();
      glow(ctx, 0, 4, 24, w.glow, 0.5 + d.flash * 0.5);
      break;
    case 4: // flared funnel
      ctx.fillStyle = w.c2;
      ctx.beginPath();
      ctx.moveTo(-7, 26); ctx.lineTo(-17, -8); ctx.lineTo(17, -8); ctx.lineTo(7, 26);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath(); ctx.ellipse(0, -7, 16, 4.6, 0, 0, TAU); ctx.fill();
      break;
    case 5: // bayonet blade
      ctx.fillStyle = '#dbe3ec';
      ctx.beginPath();
      ctx.moveTo(-3, 16); ctx.lineTo(-6, -30); ctx.lineTo(0, -38); ctx.lineTo(6, -30); ctx.lineTo(3, 16);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.beginPath(); ctx.moveTo(0, -36); ctx.lineTo(5, -29); ctx.lineTo(3, 14); ctx.lineTo(0, 14); ctx.closePath(); ctx.fill();
      ctx.fillStyle = w.c2; ctx.fillRect(-7, 12, 14, 6);
      break;
    case 6: // dual mini barrels
      ctx.fillStyle = '#20252d';
      rr(ctx, -13, -6, 9, 30, 3); ctx.fill();
      rr(ctx, 4, -6, 9, 30, 3); ctx.fill();
      ctx.fillStyle = w.c2;
      ctx.fillRect(-13, -6, 9, 2.6); ctx.fillRect(4, -6, 9, 2.6);
      break;
    default: // crown spikes
      ctx.fillStyle = w.c2;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 6 - 2.4, 14); ctx.lineTo(i * 6, -10 - Math.abs(i) * -3); ctx.lineTo(i * 6 + 2.4, 14);
        ctx.closePath(); ctx.fill();
      }
  }
  ctx.restore();
}

/* ---------- top optics ---------- */
function optic(ctx: CanvasRenderingContext2D, v: number, y: number, w: WeaponDef, d: GunDraw) {
  ctx.save();
  switch (v) {
    case 0: // holo square
      ctx.fillStyle = '#15181d'; ctx.fillRect(-15, y + 4, 5, 20);
      ctx.fillStyle = '#242a33'; rr(ctx, -30, y, 16, 26, 3); ctx.fill();
      ctx.strokeStyle = w.c2; ctx.lineWidth = 1.6;
      ctx.strokeRect(-27, y + 4, 10, 18);
      glow(ctx, -22, y + 12, 14, w.glow, 0.7);
      break;
    case 1: // long tube scope
      ctx.fillStyle = '#15181d'; ctx.fillRect(-16, y + 2, 6, 7); ctx.fillRect(-16, y + 34, 6, 7);
      ctx.fillStyle = '#272d36'; rr(ctx, -30, y - 10, 14, 62, 6); ctx.fill();
      ctx.fillStyle = '#343c47'; rr(ctx, -34, y - 16, 20, 18, 4); ctx.fill();
      ctx.fillStyle = w.c2; ctx.fillRect(-33, y - 17, 18, 3.4);
      glow(ctx, -24, y - 12, 13, w.glow, 0.75);
      break;
    case 2: // iron sight ladder
      ctx.fillStyle = '#15181d';
      for (let i = 0; i < 3; i++) { rr(ctx, -19 - i * 2, y + 4 + i * 11, 8 + i * 2, 6, 2); ctx.fill(); }
      break;
    case 3: // floating holo prism
      ctx.save();
      ctx.translate(-22, y + 14); ctx.rotate(d.t * 1.5);
      ctx.fillStyle = w.c2;
      ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(7, 0); ctx.lineTo(0, 9); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
      glow(ctx, -22, y + 14, 18, w.glow, 0.8);
      ctx.fillStyle = '#20252d'; rr(ctx, -17, y + 22, 8, 12, 2); ctx.fill();
      break;
    case 4: // antenna / aerial
      ctx.strokeStyle = w.c2; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-12, y + 20); ctx.quadraticCurveTo(-30, y, -26, y - 26); ctx.stroke();
      ctx.fillStyle = w.c2;
      ctx.beginPath(); ctx.arc(-26, y - 28, 4, 0, TAU); ctx.fill();
      glow(ctx, -26, y - 28, 13, w.glow, 0.6 + Math.sin(d.t * 6) * 0.3);
      break;
    case 5: // crystal shard sight
      ctx.fillStyle = w.c2;
      ctx.beginPath();
      ctx.moveTo(-14, y + 24); ctx.lineTo(-22, y + 2); ctx.lineTo(-16, y - 10); ctx.lineTo(-10, y + 6);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 1; ctx.stroke();
      glow(ctx, -16, y + 6, 16, w.glow, 0.7);
      break;
    default: // reflex dot + rail
      ctx.fillStyle = '#15181d'; rr(ctx, -24, y, 11, 22, 3); ctx.fill();
      ctx.fillStyle = w.c2; ctx.beginPath(); ctx.arc(-19, y + 10, 3, 0, TAU); ctx.fill();
      glow(ctx, -19, y + 10, 12, w.glow, 0.8);
  }
  ctx.restore();
}

/* ---------- underbarrel ---------- */
function underbarrel(ctx: CanvasRenderingContext2D, v: number, y: number, w: WeaponDef, d: GunDraw) {
  ctx.save();
  switch (v) {
    case 0: // angled foregrip
      ctx.fillStyle = '#1b1f26';
      ctx.beginPath();
      ctx.moveTo(8, y); ctx.lineTo(24, y + 10); ctx.lineTo(20, y + 24); ctx.lineTo(7, y + 14);
      ctx.closePath(); ctx.fill();
      break;
    case 1: // bipod
      ctx.strokeStyle = '#1b1f25'; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(-20, y + 30); ctx.moveTo(0, y); ctx.lineTo(20, y + 30); ctx.stroke();
      break;
    case 2: // under launcher tube
      ctx.fillStyle = '#272d36';
      rr(ctx, 9, y - 2, 15, 40, 6); ctx.fill();
      ctx.fillStyle = w.c2; ctx.beginPath(); ctx.arc(16, y + 2, 4, 0, TAU); ctx.fill();
      break;
    case 3: // laser pointer
      ctx.fillStyle = '#20252d'; rr(ctx, 10, y + 4, 12, 18, 3); ctx.fill();
      ctx.fillStyle = w.c2; ctx.beginPath(); ctx.arc(16, y + 6, 2.6, 0, TAU); ctx.fill();
      glow(ctx, 16, y + 4, 12, w.glow, 0.7);
      break;
    case 4: // coolant coils
      ctx.strokeStyle = w.c2; ctx.lineWidth = 2.6;
      for (let i = 0; i < 4; i++) {
        ctx.globalAlpha = 0.5 + 0.4 * Math.sin(d.t * 4 - i);
        ctx.beginPath(); ctx.ellipse(0, y + i * 11, 13, 4.6, 0, 0, TAU); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    default: // none / small rail
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      for (let i = 0; i < 4; i++) ctx.fillRect(7, y + i * 7, 6, 3.4);
  }
  ctx.restore();
}

/* ---------- side pod (grip side, +x) ---------- */
function sidePod(ctx: CanvasRenderingContext2D, v: number, y: number, w: WeaponDef, d: GunDraw) {
  ctx.save();
  const drop = d.magDrop;
  ctx.translate(drop * 0.4, drop);
  ctx.globalAlpha = Math.max(0, 1 - drop / 90);
  switch (v) {
    case 0: // drum magazine
      ctx.fillStyle = '#20252d';
      ctx.beginPath(); ctx.arc(26, y + 18, 20, 0, TAU); ctx.fill();
      ctx.strokeStyle = w.c2; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.arc(26, y + 18, 12, d.spin, d.spin + 4.4); ctx.stroke();
      break;
    case 1: // fuel canister
      ctx.fillStyle = '#2a3038'; rr(ctx, 16, y, 16, 46, 7); ctx.fill();
      ctx.fillStyle = w.c2; rr(ctx, 20, y + 6, 8, 14, 3); ctx.fill();
      break;
    case 2: // glowing battery stack
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#1d232b'; rr(ctx, 14 + i * 2, y + i * 15, 14, 13, 3); ctx.fill();
        ctx.fillStyle = w.glow;
        ctx.globalAlpha = (0.5 + 0.4 * Math.sin(d.t * 5 - i)) * Math.max(0, 1 - drop / 90);
        rr(ctx, 17 + i * 2, y + 3 + i * 15, 8, 7, 2); ctx.fill();
        ctx.globalAlpha = Math.max(0, 1 - drop / 90);
      }
      break;
    case 3: // ammo belt
      ctx.fillStyle = '#d9b04a';
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.translate(14 + i * 5, y + 6 + i * 8 + Math.sin(d.t * 2 + i) * 2);
        ctx.rotate(0.5);
        ctx.fillRect(-3, -6, 6, 12);
        ctx.restore();
      }
      break;
    case 4: // totem charm cluster
      ctx.strokeStyle = 'rgba(220,220,230,0.5)'; ctx.lineWidth = 1.2;
      for (let i = 0; i < 2; i++) {
        const sx = 14 + i * 13, sy = y + 4;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.sin(d.t * 3 + i) * 3, sy + 14); ctx.stroke();
        ctx.font = '13px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(i ? '🔸' : w.emoji, sx + Math.sin(d.t * 3 + i) * 3, sy + 21);
      }
      break;
    default: // slim side plate
      ctx.fillStyle = '#242a32'; rr(ctx, 14, y + 4, 11, 34, 4); ctx.fill();
      ctx.fillStyle = w.c2; rr(ctx, 17, y + 10, 5, 20, 2); ctx.fill();
  }
  ctx.restore();
}

/* ---------- tail / stock accent ---------- */
function tailAccent(ctx: CanvasRenderingContext2D, v: number, y: number, w: WeaponDef, d: GunDraw) {
  ctx.save();
  switch (v) {
    case 0: // cheek riser
      ctx.fillStyle = '#2b3038'; rr(ctx, -19, y - 36, 10, 34, 4); ctx.fill();
      break;
    case 1: // sling strap
      ctx.strokeStyle = '#3a3f49'; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-10, y - 30);
      ctx.quadraticCurveTo(-30 + Math.sin(d.t * 2) * 3, y - 6, -8, y + 6);
      ctx.stroke();
      break;
    case 2: // glowing core vent
      ctx.fillStyle = '#15181d'; rr(ctx, -9, y - 30, 18, 24, 5); ctx.fill();
      ctx.fillStyle = w.glow;
      ctx.globalAlpha = 0.45 + 0.4 * Math.sin(d.t * 4);
      rr(ctx, -6, y - 26, 12, 16, 3); ctx.fill();
      ctx.globalAlpha = 1;
      break;
    case 3: // tassel / ribbon
      ctx.strokeStyle = w.c2; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(6 + i * 3, y - 8);
        ctx.quadraticCurveTo(16 + i * 4 + Math.sin(d.t * 3 + i) * 4, y + 8, 10 + i * 5, y + 26);
        ctx.stroke();
      }
      break;
    default: // counterweight
      ctx.fillStyle = '#1b1f26'; rr(ctx, -12, y - 14, 24, 12, 4); ctx.fill();
      ctx.fillStyle = w.c2; ctx.fillRect(-12, y - 11, 24, 2.4);
  }
  ctx.restore();
}

/* ---------- body decal ---------- */
function decal(ctx: CanvasRenderingContext2D, v: number, y: number, w: WeaponDef, d: GunDraw) {
  ctx.save();
  switch (v) {
    case 0: // emoji sticker
      ctx.font = '15px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.95;
      ctx.fillText(w.emoji, 0, y);
      break;
    case 1: // racing stripes
      ctx.fillStyle = w.c2; ctx.globalAlpha = 0.75;
      ctx.fillRect(-7, y - 24, 3.4, 48);
      ctx.fillRect(1, y - 24, 3.4, 48);
      break;
    case 2: // hazard chevrons
      ctx.fillStyle = w.c2; ctx.globalAlpha = 0.7;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(-9, y - 18 + i * 14); ctx.lineTo(0, y - 24 + i * 14); ctx.lineTo(9, y - 18 + i * 14);
        ctx.lineTo(9, y - 13 + i * 14); ctx.lineTo(0, y - 19 + i * 14); ctx.lineTo(-9, y - 13 + i * 14);
        ctx.closePath(); ctx.fill();
      }
      break;
    case 3: // runic glyphs
      ctx.strokeStyle = w.glow; ctx.lineWidth = 1.8;
      ctx.globalAlpha = 0.55 + 0.35 * Math.sin(d.t * 3);
      for (let i = 0; i < 3; i++) {
        const yy = y - 18 + i * 16;
        ctx.beginPath();
        ctx.moveTo(-6, yy); ctx.lineTo(0, yy + 7); ctx.lineTo(6, yy);
        ctx.moveTo(0, yy + 7); ctx.lineTo(0, yy - 5);
        ctx.stroke();
      }
      break;
    case 4: // serial number plate
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; rr(ctx, -9, y - 8, 18, 16, 2); ctx.fill();
      ctx.fillStyle = w.c2;
      ctx.font = '900 7px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(w.name.slice(0, 5).toUpperCase(), 0, y);
      break;
    default: // rivet row
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-6, y - 20 + i * 11, 1.8, 0, TAU); ctx.fill(); }
  }
  ctx.restore();
}

/* ---------- aura (rare+ only) ---------- */
function aura(ctx: CanvasRenderingContext2D, v: number, L: number, w: WeaponDef, d: GunDraw) {
  const legend = w.rarity === 'legend';
  const n = legend ? 5 : 3;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  switch (v) {
    case 0: // orbiting motes
      for (let i = 0; i < n; i++) {
        const a = d.t * 1.6 + (i / n) * TAU;
        const y = L * 0.45 + Math.sin(a) * L * 0.3;
        const x = Math.cos(a) * 26;
        ctx.globalAlpha = 0.35 + 0.3 * Math.sin(a * 2);
        ctx.fillStyle = w.glow;
        ctx.beginPath(); ctx.arc(x, y, 3.4, 0, TAU); ctx.fill();
      }
      break;
    case 1: // rising embers
      for (let i = 0; i < n + 2; i++) {
        const p = ((d.t * 0.5 + i / (n + 2)) % 1);
        const y = L * 0.6 - p * L * 0.55;
        ctx.globalAlpha = (1 - p) * 0.55;
        ctx.fillStyle = w.c2;
        ctx.fillRect(Math.sin(p * 7 + i) * 15 - 1.5, y, 3, 3);
      }
      break;
    case 2: // energy ribbon along body
      ctx.strokeStyle = w.glow; ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      for (let i = 0; i <= 18; i++) {
        const f = i / 18;
        const y = f * L * 0.8;
        const x = Math.sin(f * 7 + d.t * 4) * 16;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      break;
    case 3: // twinkling stars
      for (let i = 0; i < n; i++) {
        const ph = i * 2.1;
        const tw = Math.sin(d.t * 4 + ph);
        if (tw < 0.3) continue;
        ctx.globalAlpha = (tw - 0.3) * 1.2;
        ctx.fillStyle = '#fff';
        star(ctx, Math.sin(ph) * 22, L * (0.2 + (i / n) * 0.6), 4.5, 4, 0.3, d.t + ph);
        ctx.fill();
      }
      break;
    default: // pulsing halo at the core
      glow(ctx, 0, L * 0.4, 42 + Math.sin(d.t * 3) * 8, w.glow, 0.3);
  }
  ctx.restore();
}

/**
 * Adds a unique, deterministic attachment kit on top of the base form so that
 * every one of the 76 weapons reads as a distinct silhouette.
 */
export function decorate(ctx: CanvasRenderingContext2D, w: WeaponDef, d: GunDraw) {
  const h = hash(w.id);
  const L = GUN_LEN[w.form];
  const compact = w.form === 'pistol' || w.form === 'revolver' || w.form === 'novelty'
    || w.form === 'wand' || w.form === 'sling';

  ctx.save();
  ctx.lineJoin = 'round';

  if (w.rarity !== 'common') aura(ctx, pick(h, 19, 5), L, w, d);
  if (!compact) muzzleDevice(ctx, pick(h, 2, 8), w, d);
  optic(ctx, pick(h, 6, 7), L * (compact ? 0.3 : 0.38), w, d);
  if (!compact) underbarrel(ctx, pick(h, 10, 6), L * 0.52, w, d);
  sidePod(ctx, pick(h, 13, 6), L * (compact ? 0.52 : 0.62), w, d);
  if (!compact) tailAccent(ctx, pick(h, 16, 5), L * 0.95, w, d);
  decal(ctx, pick(h, 23, 6), L * (compact ? 0.62 : 0.72), w, d);

  ctx.restore();
}
