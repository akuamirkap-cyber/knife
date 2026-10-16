import { BY_ID, CATALOG, type WeaponDef } from './catalog';
import { drawGun, gunLength, type GunDraw } from './guns';
import { drawBullet, type BulletView } from './bullets';

export { CATALOG, BY_ID, RARITY_COLOR, RARITY_LABEL } from './catalog';
export type { WeaponDef, Rarity } from './catalog';

export type GameState = 'menu' | 'playing' | 'won' | 'lost';
export type BuffId = 'speed' | 'ammo' | 'power';
export type TreasureBuff = 'rapid' | 'double' | 'mini' | 'giant';
export type StageId = 'classic' | 'bonus' | 'treasure';

export interface HudInfo {
  state: GameState;
  time: number;
  progress: number;
  score: number;
  ammo: number;
  mag: number;
  reloading: boolean;
  reloadPct: number;
  weapon: string;
  stars: number;
  shots: number;
  hits: number;
  combo: number;
  buffs: Record<BuffId, number>;
  choosing: boolean;
  starsHit: number;
  stage: StageId;
  coins: number;
  tBuff: TreasureBuff | null;
  chestHp: number;
  chestMax: number;
}

export const GAME_W = 480;
export const GAME_H = 880;
const RCX = 240;
const RCY = 300;
const TAU = Math.PI * 2;
const TIME_LIMIT = 95;
const ROOT_Y = GAME_H - 6;

type V = { x: number; y: number };

interface Cell {
  poly: V[]; c: V; rMin: number; rMax: number;
  hp: number; maxHp: number;
  type: 'rock' | 'hard' | 'ore' | 'crystal';
  alive: boolean; hue: number; sat: number; light: number;
  cracks: V[][]; flash: number;
  specks: { x: number; y: number; r: number }[];
  pits: { x: number; y: number; r: number; a: number }[];
  moss: { x: number; y: number; r: number }[];
  grain: { x: number; y: number; r: number; d: number }[];
  path?: Path2D;
  shardSeed: number;
}

interface Bullet extends BulletView {
  dmg: number; splash: number; splashDmg: number; pierce: number;
  explosive: boolean; big: boolean; life: number;
}

type PKind = 'chip' | 'spark' | 'shell' | 'coin' | 'frag' | 'ring' | 'glint' | 'smoke' | 'fire' | 'energy' | 'shock' | 'emoji';
interface Particle {
  kind: PKind; x: number; y: number; vx: number; vy: number;
  life: number; max: number; size: number; color: string;
  rot: number; vr: number; poly?: V[]; g: number; extra?: number; text?: string;
}
interface FText { x: number; y: number; text: string; life: number; color: string; size: number }

interface StarPickup {
  x: number; y: number; vx: number; vy: number; t: number; alive: boolean; hp: number;
}
interface CoinItem { a: number; r: number; alive: boolean; spin: number; pop: number; }
interface Chest { x: number; y: number; hp: number; max: number; shake: number; lid: number; coins: { x: number; y: number; r: number; s: number; ph: number }[]; }
interface FlyCoin { x: number; y: number; vx: number; vy: number; t: number; max: number; sx: number; sy: number; }

/* ---------------- Sound ---------------- */
class Sfx {
  ctx: AudioContext | null = null;
  noise: AudioBuffer | null = null;
  ensure() {
    if (!this.ctx) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      const len = Math.floor(this.ctx.sampleRate * 0.8);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.noise = buf;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  burst(dur: number, freq: number, type: BiquadFilterType, vol: number, q = 1, delay = 0, sweep = 0) {
    const c = this.ctx;
    if (!c || !this.noise) return;
    const s = c.createBufferSource(); s.buffer = this.noise;
    const f = c.createBiquadFilter(); f.type = type; f.Q.value = q;
    const t = c.currentTime + delay;
    f.frequency.setValueAtTime(freq, t);
    if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(60, freq * sweep), t + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f).connect(g).connect(c.destination);
    s.start(t, Math.random() * 0.1); s.stop(t + dur + 0.02);
  }
  tone(freq: number, dur: number, vol: number, type: OscillatorType = 'sine', slide = 0, delay = 0) {
    const c = this.ctx; if (!c) return;
    const o = c.createOscillator(); const g = c.createGain();
    const t = c.currentTime + delay;
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * (1 + slide)), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(c.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  shot(w: WeaponDef) {
    switch (w.ammo) {
      case 'laser': case 'beamgalaxy': case 'holy':
        this.tone(1800, 0.16, 0.14, 'sawtooth', -0.85);
        this.tone(2700, 0.09, 0.08, 'square', -0.8); break;
      case 'plasma': case 'magic': case 'portal': case 'shrink':
        this.tone(640, 0.28, 0.2, 'sawtooth', -0.75);
        this.tone(250, 0.3, 0.16, 'sine', -0.6);
        this.burst(0.2, 900, 'bandpass', 0.16, 3); break;
      case 'rocket': case 'meteor': case 'boom': case 'firework':
        this.burst(0.65, 700, 'lowpass', 0.85, 1, 0, 0.25);
        this.tone(72, 0.55, 0.45, 'sine', -0.5); break;
      case 'flame':
        this.burst(0.18, 700, 'lowpass', 0.22, 1, 0, 1.4); break;
      case 'water': case 'bubble': case 'honey': case 'acid': case 'ink':
        this.burst(0.12, 1400, 'bandpass', 0.2, 2, 0, 0.5);
        this.tone(420, 0.1, 0.1, 'sine', -0.5); break;
      case 'snow':
        this.burst(0.16, 2000, 'bandpass', 0.2, 1.5); break;
      case 'pellet':
        this.burst(0.36, 1500, 'lowpass', 0.85, 1, 0, 0.15);
        this.tone(95, 0.3, 0.4, 'sine', -0.7); break;
      case 'slug':
        this.burst(0.48, 1100, 'lowpass', 0.9, 1, 0, 0.2);
        this.tone(110, 0.38, 0.45, 'sine', -0.8); break;
      case 'bolt': case 'dart': case 'stone': case 'nail': case 'kunai':
        this.burst(0.09, 2600, 'bandpass', 0.22, 2.5, 0, 0.4);
        this.tone(700, 0.08, 0.1, 'triangle', -0.7); break;
      case 'note':
        this.tone([523, 587, 659, 784, 880][Math.floor(Math.random() * 5)], 0.3, 0.14, 'triangle'); break;
      case 'coin':
        this.tone(1400, 0.12, 0.1, 'square', -0.3);
        this.tone(2100, 0.1, 0.06, 'square', -0.2, 0.04); break;
      case 'confetti':
        this.burst(0.28, 2000, 'bandpass', 0.35, 1.2, 0, 0.3);
        this.tone(880, 0.2, 0.1, 'triangle', 0.5); break;
      case 'bolt_elec':
        this.burst(0.14, 3000, 'bandpass', 0.22, 5);
        this.tone(1200, 0.1, 0.1, 'sawtooth', -0.6); break;
      case 'blackhole':
        this.tone(80, 0.8, 0.3, 'sine', 1.2);
        this.burst(0.6, 400, 'lowpass', 0.3, 1, 0, 0.3); break;
      case 'sonic':
        this.tone(220, 0.3, 0.22, 'square', -0.4);
        this.tone(110, 0.35, 0.2, 'sine', -0.3); break;
      case 'emoji':
        this.burst(0.12, 1200, 'bandpass', 0.22, 2);
        this.tone(320, 0.12, 0.14, 'triangle', 0.6); break;
      case 'heavy':
        this.burst(0.07, 2600, 'bandpass', 0.3, 1.6);
        this.tone(170, 0.06, 0.2, 'square', -0.6); break;
      default:
        this.burst(0.1, 2300, 'lowpass', 0.32);
        this.tone(155, 0.08, 0.26, 'square', -0.6);
    }
  }
  hit() { this.burst(0.05, 2900, 'bandpass', 0.2, 2.2); }
  crack() { this.burst(0.3, 650, 'lowpass', 0.45, 1, 0, 0.3); this.tone(75, 0.22, 0.2, 'sine', -0.4); }
  boom(big: boolean) {
    this.burst(big ? 0.9 : 0.5, big ? 600 : 900, 'lowpass', 0.85, 1, 0, 0.15);
    this.tone(big ? 55 : 80, big ? 0.8 : 0.45, 0.5, 'sine', -0.6);
  }
  ding() { this.tone(1950, 0.4, 0.09); this.tone(2900, 0.3, 0.05); }
  coin() {
    const b = 1150 + Math.random() * 350;
    this.tone(b, 0.07, 0.07, 'square', 0.25);
    this.tone(b * 1.5, 0.12, 0.05, 'square', 0.2, 0.05);
  }
  chestHit() { this.burst(0.12, 1100, 'bandpass', 0.25, 2); this.tone(220, 0.1, 0.16, 'triangle', -0.4); }
  click() { this.tone(950, 0.04, 0.1, 'square'); }
  zap() { this.tone(900, 0.18, 0.12, 'triangle', -0.7); this.burst(0.13, 2200, 'bandpass', 0.13, 4); }
  starHit() {
    [784, 988, 1319, 1568].forEach((f, i) => this.tone(f, 0.3, 0.12, 'triangle', 0, i * 0.07));
    this.burst(0.3, 3000, 'bandpass', 0.2, 2);
  }
  buff() { [523, 784, 1046].forEach((f, i) => this.tone(f, 0.4, 0.14, 'sine', 0, i * 0.09)); }
  reloadSeq(dur: number, w: WeaponDef) {
    const energy = ['plasma', 'laser', 'magic', 'holy', 'beamgalaxy', 'shrink', 'portal', 'freeze', 'bolt_elec', 'rainbow', 'pixel'].includes(w.ammo);
    const shells = w.ammo === 'pellet' || w.ammo === 'boom';
    this.tone(1200, 0.04, 0.12, 'square', -0.3, 0);
    this.burst(0.05, 3000, 'highpass', 0.16, 1, 0.01);
    this.burst(0.12, 700, 'bandpass', 0.26, 2, dur * 0.22);
    this.tone(300, 0.1, 0.16, 'triangle', -0.4, dur * 0.22);
    this.burst(0.16, 420, 'lowpass', 0.45, 1, dur * 0.6);
    this.tone(160, 0.16, 0.3, 'sine', -0.45, dur * 0.6);
    this.tone(850, 0.05, 0.12, 'square', -0.4, dur * 0.63);
    if (energy) {
      this.tone(380, 0.42, 0.13, 'sawtooth', 2.6, dur * 0.72);
      this.tone(1500, 0.12, 0.07, 'triangle', 0.6, dur * 0.95);
    } else if (shells) {
      for (let i = 0; i < 3; i++) {
        this.burst(0.07, 1600, 'bandpass', 0.2, 3, dur * 0.3 + i * 0.09);
        this.tone(520 + i * 60, 0.05, 0.09, 'square', -0.3, dur * 0.3 + i * 0.09);
      }
      this.burst(0.14, 900, 'bandpass', 0.3, 2, dur * 0.88);
    } else {
      this.burst(0.14, 1800, 'bandpass', 0.26, 2.5, dur * 0.8, 0.4);
      this.tone(420, 0.09, 0.18, 'square', -0.5, dur * 0.82);
      this.tone(900, 0.06, 0.14, 'square', -0.3, dur * 0.93);
    }
  }
  spinUp() { this.tone(120, 0.5, 0.12, 'sawtooth', 1.8); }
  win() { [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => this.tone(f, 0.55, 0.12, 'triangle', 0, i * 0.1)); }
  lose() { [392, 330, 262].forEach((f, i) => this.tone(f, 0.45, 0.12, 'triangle', 0, i * 0.18)); }
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** pre-rendered radial sprites so particles never build gradients per frame */
function makeRadial(stops: [number, string][], px = 64) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = px;
  const c = cv.getContext('2d')!;
  const g = c.createRadialGradient(px / 2, px / 2, 0, px / 2, px / 2, px / 2);
  for (const [o, col] of stops) g.addColorStop(o, col);
  c.fillStyle = g;
  c.fillRect(0, 0, px, px);
  return cv;
}
let FIRE_SPR: HTMLCanvasElement | null = null;
let SMOKE_SPR: HTMLCanvasElement | null = null;
let GLOW_SPR: HTMLCanvasElement | null = null;
let SHADE_SPR: HTMLCanvasElement | null = null;
function sprites() {
  if (!FIRE_SPR) {
    FIRE_SPR = makeRadial([[0, 'rgba(255,255,220,1)'], [0.4, 'rgba(255,170,50,0.8)'], [1, 'rgba(255,40,0,0)']]);
    SMOKE_SPR = makeRadial([[0, 'rgba(255,255,255,0.85)'], [0.55, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']]);
    GLOW_SPR = makeRadial([[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.55)'], [1, 'rgba(255,255,255,0)']]);
    SHADE_SPR = makeRadial([[0, 'rgba(4,7,14,0.95)'], [0.5, 'rgba(4,7,14,0.5)'], [1, 'rgba(4,7,14,0)']]);
  }
  return { FIRE_SPR: FIRE_SPR!, SMOKE_SPR: SMOKE_SPR!, GLOW_SPR: GLOW_SPR!, SHADE_SPR: SHADE_SPR! };
}
function pointInPoly(p: V, poly: V[]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
    if ((yi > p.y) !== (yj > p.y) && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function drawDiamond(ctx: CanvasRenderingContext2D, t: number, scale: number) {
  ctx.save();
  ctx.translate(RCX, RCY); ctx.scale(scale, scale);
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

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  onHud: (h: HudInfo) => void;
  sfx = new Sfx();
  cells: Cell[] = [];
  bullets: Bullet[] = [];
  particles: Particle[] = [];
  texts: FText[] = [];
  motes: { x: number; y: number; s: number; v: number }[] = [];
  state: GameState = 'menu';
  weaponId = 'ak47';
  twin = false;
  ammo = 30;
  reloadT = 0; fireCd = 0; firing = false;
  timeLeft = TIME_LIMIT;
  score = 0; shots = 0; hits = 0; combo = 0; comboT = 0;
  shake = 0; rot = 0; rotSpeed = 1; targetSpeed = 1.2; phaseT = 2;
  recoil = [0, 0]; flash = [0, 0];
  aim = 0; aimTarget = 0;
  spin = 0; spinUpT = 0; heat = 0; charge = 0;
  switchT = 0; winT = 0; t = 0; hudT = 0;
  stars = 0; totalCells = 0; raf = 0; last = 0;
  diamondPing = 0; flashScreen = 0;
  star: StarPickup | null = null;
  starTimer = 9;
  stage: StageId = 'classic';
  coins = 0;
  coinItems: CoinItem[] = [];
  chest: Chest | null = null;
  tBuff: TreasureBuff | null = null;
  floatStar: StarPickup | null = null;
  floatUsed = false;
  floatTimer = 3;
  flyCoins: FlyCoin[] = [];
  rockCv: HTMLCanvasElement | null = null;
  rockDpr = 1;
  rockDirty = true;
  bgGrad: CanvasGradient | null = null;
  vigGrad: CanvasGradient | null = null;
  cavePath: Path2D | null = null;
  shimmer: Cell[] = [];
  flashing: Cell[] = [];
  cracked: Cell[] = [];
  starsHit = 0;
  choosing = false;
  buffs: Record<BuffId, number> = { speed: 0, ammo: 0, power: 0 };

  constructor(canvas: HTMLCanvasElement, onHud: (h: HudInfo) => void) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.onHud = onHud;
    for (let i = 0; i < 50; i++) this.motes.push({ x: rand(0, GAME_W), y: rand(0, GAME_H), s: rand(0.5, 2.2), v: rand(5, 22) });
    this.resize();
    this.generateRock();
    this.ammo = this.magSize();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }
  destroy() { cancelAnimationFrame(this.raf); }
  get w(): WeaponDef { return BY_ID[this.weaponId] ?? CATALOG[1]; }
  magSize() { return Math.round(this.w.mag * (this.buffs.ammo ? 2 : 1)); }
  rof() { return this.w.rof * (this.buffs.speed ? 0.5 : 1) * (this.tBuff === 'rapid' ? 0.5 : this.tBuff === 'mini' ? 0.6 : 1); }
  dmgMul() { return this.buffs.power ? 2 : 1; }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = GAME_W * dpr;
    this.canvas.height = GAME_H * dpr;
    this.bgGrad = null; this.vigGrad = null;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  generateRock() {
    const RINGS = [64, 90, 116, 142, 168, 196];
    const SECT = [8, 12, 16, 24, 32];
    const STEPS = 96;
    const seed = Math.random() * 1000;
    const h = (a: number, b: number, c = 0) => {
      const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7 + seed) * 43758.5453;
      return s - Math.floor(s);
    };
    const wrap = (k: number) => ((k % STEPS) + STEPS) % STEPS;
    const bp = (i: number, k: number): V => {
      k = wrap(k);
      const th = (k / STEPS) * TAU;
      let r = RINGS[i];
      if (i === 0) r += (h(i, k) - 0.5) * 3;
      else if (i === RINGS.length - 1) r += Math.sin(th * 3 + seed) * 9 + Math.sin(th * 7 + seed * 2) * 5 + (h(i, k) - 0.5) * 12;
      else r += (h(i, k) - 0.5) * 10;
      return { x: Math.cos(th) * r, y: Math.sin(th) * r };
    };
    const rm = (i: number, k: number): V => {
      k = wrap(k);
      const a = bp(i, k), b = bp(i + 1, k);
      const th = (k / STEPS) * TAU;
      const off = (h(i, k, 7) - 0.5) * 9;
      return { x: (a.x + b.x) / 2 - Math.sin(th) * off, y: (a.y + b.y) / 2 + Math.cos(th) * off };
    };
    this.cells = [];
    for (let i = 0; i < SECT.length; i++) {
      const n = SECT[i], per = STEPS / n;
      for (let j = 0; j < n; j++) {
        const k0 = j * per, k1 = k0 + per;
        const poly: V[] = [];
        for (let k = k0; k <= k1; k++) poly.push(bp(i, k));
        poly.push(rm(i, k1));
        for (let k = k1; k >= k0; k--) poly.push(bp(i + 1, k));
        poly.push(rm(i, k0));
        let cx = 0, cy = 0, rMin = 1e9, rMax = 0;
        for (const p of poly) {
          cx += p.x; cy += p.y;
          const r = Math.hypot(p.x, p.y);
          rMin = Math.min(rMin, r); rMax = Math.max(rMax, r);
        }
        cx /= poly.length; cy /= poly.length;
        const roll = Math.random();
        let type: Cell['type'] = 'rock';
        if (i > 0 && i < 4 && roll < 0.12) type = 'hard';
        else if (roll > 0.93) type = 'ore';
        else if (i < 3 && roll > 0.86) type = 'crystal';
        const baseHp = i === 0 ? 3 : i === 4 ? 2 : 2 + (Math.random() < 0.3 ? 1 : 0);
        const hp = type === 'hard' ? 6 : type === 'ore' ? 3 : type === 'crystal' ? 4 : baseHp;
        const inPoly = (f1: number, f2: number) => {
          const p = poly[Math.floor(Math.random() * poly.length)];
          const f = rand(f1, f2);
          return { x: cx + (p.x - cx) * f, y: cy + (p.y - cy) * f };
        };
        const specks: Cell['specks'] = [];
        if (type === 'ore') for (let s = 0; s < 9; s++) specks.push({ ...inPoly(0.1, 0.78), r: rand(1.5, 3.4) });
        const pits: Cell['pits'] = [];
        for (let s = 0; s < 5; s++) pits.push({ ...inPoly(0.1, 0.8), r: rand(2, 6.5), a: rand(0.05, 0.16) });
        const moss: Cell['moss'] = [];
        if (i >= 3 && Math.random() < 0.5) for (let s = 0; s < 4; s++) moss.push({ ...inPoly(0.5, 0.95), r: rand(3, 8) });
        const grain: Cell['grain'] = [];
        for (let s = 0; s < 22; s++) grain.push({ ...inPoly(0.05, 0.95), r: rand(1, 2.4), d: Math.random() < 0.5 ? 1 : -1 });
        this.cells.push({
          poly, c: { x: cx, y: cy }, rMin, rMax, hp, maxHp: hp, type, alive: true,
          hue: type === 'hard' ? 222 : type === 'crystal' ? 268 : type === 'ore' ? 200 : rand(205, 228),
          sat: type === 'hard' ? 16 : type === 'crystal' ? 30 : type === 'ore' ? 14 : rand(8, 16),
          light: type === 'hard' ? rand(22, 28) : type === 'crystal' ? rand(34, 42)
            : type === 'ore' ? rand(40, 47) : rand(42, 54) - i * 2.4,
          cracks: [], flash: 0, specks, pits, moss, grain, shardSeed: Math.random() * 10,
        });
      }
    }
    this.totalCells = this.cells.length;
    this.shimmer = this.cells.filter((c) => c.type === 'crystal' || c.type === 'ore');
    this.flashing = []; this.cracked = [];
    this.rockDirty = true;
  }

  buildCoinRing() {
    this.coinItems = [];
    const rings = [
      { r: 96, n: 14 }, { r: 132, n: 18 }, { r: 168, n: 22 },
    ];
    for (const ring of rings) {
      for (let i = 0; i < ring.n; i++) {
        this.coinItems.push({ a: (i / ring.n) * TAU, r: ring.r, alive: true, spin: Math.random() * TAU, pop: 0 });
      }
    }
  }

  buildChest() {
    const coins: Chest['coins'] = [];
    // natural looking heap of coins inside the open chest
    for (let i = 0; i < 46; i++) {
      const u = Math.random();
      const x = (Math.random() * 2 - 1) * 74 * (1 - u * 0.25);
      const maxY = 18 - Math.abs(x) * 0.16;
      const y = -10 - u * 30 + Math.random() * 10;
      coins.push({ x, y: Math.min(maxY, y), r: rand(8, 13), s: rand(0.8, 1), ph: Math.random() * TAU });
    }
    coins.sort((a, b) => a.y - b.y);
    this.chest = { x: RCX, y: RCY + 20, hp: 400, max: 400, shake: 0, lid: 0, coins };
  }

  reset() {
    this.bullets = []; this.particles = []; this.texts = []; this.flyCoins = [];
    this.score = 0; this.shots = 0; this.hits = 0; this.combo = 0; this.comboT = 0;
    this.winT = 0; this.stars = 0; this.starsHit = 0; this.coins = 0;
    this.buffs = { speed: 0, ammo: 0, power: 0 };
    this.star = null; this.choosing = false;
    this.tBuff = null; this.floatStar = null; this.floatUsed = false;
    this.chest = null; this.coinItems = [];
    this.cells = []; this.totalCells = 0;
    this.ammo = this.magSize();
    this.reloadT = 0; this.fireCd = 0; this.switchT = 0.4;
    this.aim = 0; this.aimTarget = 0;
    if (this.stage === 'treasure') {
      this.timeLeft = 10;
      this.buildChest();
      this.floatTimer = rand(2.2, 4);
    } else if (this.stage === 'bonus') {
      this.timeLeft = 45;
      this.generateRock();
      this.buildCoinRing();
      this.targetSpeed = (Math.random() < 0.5 ? -1 : 1) * 1.1;
      this.rotSpeed = this.targetSpeed;
      this.starTimer = 10;
    } else {
      this.timeLeft = TIME_LIMIT;
      this.generateRock();
      this.starTimer = 8;
    }
  }
  setStage(s: StageId) { this.stage = s; this.reset(); this.state = 'menu'; this.pushHud(); }
  start() { this.sfx.ensure(); this.reset(); this.state = 'playing'; this.pushHud(); }
  toMenu() { this.reset(); this.state = 'menu'; this.pushHud(); }

  setWeapon(id: string, twin = false) {
    this.sfx.ensure();
    if (this.weaponId === id && this.twin === twin) return;
    this.weaponId = id; this.twin = twin;
    this.ammo = this.magSize();
    this.reloadT = 0; this.fireCd = 0.2; this.switchT = 0.4; this.spinUpT = 0;
    this.sfx.click();
    this.pushHud();
  }
  setTwin(v: boolean) { this.twin = v; this.switchT = 0.3; this.pushHud(); }
  setFiring(f: boolean) { if (f) this.sfx.ensure(); this.firing = f && !this.choosing; }

  reload() {
    const need = this.magSize();
    if (this.reloadT > 0 || this.ammo === need || this.state !== 'playing') return;
    this.reloadT = this.w.reload;
    this.sfx.reloadSeq(this.w.reload, this.w);
  }

  spawnFloatStar() {
    const fromLeft = Math.random() < 0.5;
    this.floatStar = {
      x: fromLeft ? -30 : GAME_W + 30, y: rand(150, 330),
      vx: (fromLeft ? 1 : -1) * rand(52, 72), vy: 0, t: 0, alive: true, hp: 1,
    };
  }

  hitFloatStar() {
    const f = this.floatStar;
    if (!f || !f.alive) return;
    f.alive = false;
    this.floatStar = null;
    this.choosing = true;
    this.firing = false;
    this.flashScreen = 0.5;
    this.sfx.starHit();
    for (let i = 0; i < 20; i++) {
      const a = rand(0, TAU);
      this.particles.push({
        kind: 'glint', x: f.x, y: f.y, vx: Math.cos(a) * rand(90, 320), vy: Math.sin(a) * rand(90, 320),
        life: rand(0.3, 0.9), max: 0.9, size: rand(3, 8), color: '#ffe066', rot: 0, vr: 0, g: 180,
      });
    }
    this.particles.push({ kind: 'shock', x: f.x, y: f.y, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 130, color: '#ffe066', rot: 0, vr: 0, g: 0 });
    this.pushHud();
  }

  chooseTreasure(b: TreasureBuff) {
    this.tBuff = b;
    this.choosing = false;
    this.sfx.buff();
    const label = b === 'rapid' ? '⚡ TEMBAK 2X CEPAT'
      : b === 'double' ? '🔱 DOUBLE SHOT'
        : b === 'mini' ? '✨ PELURU MINI RAPAT'
          : '🔆 PELURU 2X BESAR';
    this.texts.push({ x: RCX, y: RCY - 140, text: label, life: 2, color: '#ffe066', size: 21 });
    this.pushHud();
  }

  chooseBuff(b: BuffId) {
    this.buffs[b]++;
    this.choosing = false;
    this.sfx.buff();
    if (b === 'ammo') this.ammo = this.magSize();
    this.texts.push({
      x: RCX, y: RCY - 150,
      text: b === 'speed' ? '⚡ TEMBAK 2X CEPAT' : b === 'ammo' ? '🧰 AMMO 2X' : '💥 DAYA HANCUR 2X',
      life: 2, color: '#ffe066', size: 22,
    });
    this.pushHud();
  }

  roots() {
    const L = gunLength(this.w);
    const off = this.switchT > 0 ? (this.switchT / 0.4) * 200 : 0;
    const relOff = this.reloadT > 0 ? 22 : 0;
    if (this.twin) {
      return [
        { x: RCX - 58, y: ROOT_Y + off + relOff, side: -1, len: L },
        { x: RCX + 58, y: ROOT_Y + off + relOff, side: 1, len: L },
      ];
    }
    return [{ x: RCX, y: ROOT_Y + off + relOff, side: 1, len: L }];
  }
  muzzleOf(r: { x: number; y: number; len: number }, i: number) {
    const a = this.aim;
    const len = r.len - this.recoil[i];
    return { x: r.x + Math.sin(a) * len, y: r.y - Math.cos(a) * len };
  }

  fire() {
    const w = this.w;
    const rs = this.roots();
    if (this.ammo < rs.length) { this.reload(); return; }
    this.ammo -= rs.length;
    this.shots += rs.length;
    const dmg = w.dmg * this.dmgMul();
    const tb = this.tBuff;
    let wVariant = 0;
    for (let i = 0; i < w.id.length; i++) wVariant = (wVariant * 31 + w.id.charCodeAt(i)) >>> 0;
    const sizeMul = tb === 'giant' ? 2 : tb === 'mini' ? 0.55 : 1;
    const shots = tb === 'double' ? 2 : 1;
    rs.forEach((r, i) => {
      const m = this.muzzleOf(r, i);
      for (let dup = 0; dup < shots; dup++)
      for (let p = 0; p < w.pellets; p++) {
        const off = w.pellets > 1
          ? (p / (w.pellets - 1) - 0.5) * w.spread + rand(-0.03, 0.03)
          : rand(-w.spread, w.spread);
        const a = this.aim + off + (shots > 1 ? (dup - 0.5) * 0.09 : 0);
        const sp = w.speed * (tb === 'mini' ? 1.35 : 1);
        this.bullets.push({
          kind: w.ammo, variant: wVariant, wid: w.id, x: m.x + (shots > 1 ? (dup - 0.5) * 16 : 0), y: m.y,
          vx: Math.sin(a) * sp, vy: -Math.cos(a) * sp,
          age: 0, size: w.size * sizeMul, c1: w.c1, c2: w.c2, glow: w.glow, emoji: w.projEmoji || w.emoji,
          trail: [], dmg: dmg * (tb === 'giant' ? 1.5 : 1), splash: w.splash * (tb === 'giant' ? 1.6 : 1), splashDmg: w.splashDmg * this.dmgMul(),
          pierce: w.pierce, life: 3,
          explosive: ['rocket', 'meteor', 'boom', 'firework', 'plasma', 'blackhole', 'anchor'].includes(w.ammo),
          big: ['rocket', 'meteor', 'boom', 'blackhole'].includes(w.ammo),
        });
      }
      this.recoil[i] = w.recoil;
      this.flash[i] = 1;
      const ca = Math.cos(this.aim), sa = Math.sin(this.aim);
      if (!['laser', 'plasma', 'magic', 'holy', 'beamgalaxy', 'flame', 'water', 'bubble', 'sonic', 'shrink', 'portal', 'blackhole', 'rainbow', 'note', 'petal'].includes(w.ammo)) {
        this.particles.push({
          kind: 'shell', x: m.x - r.side * 6 * ca, y: m.y + 28 * ca,
          vx: -r.side * rand(140, 250) + sa * 100, vy: rand(-330, -200),
          life: 1.2, max: 1.2, size: 3.4, color: '#d9b04a', rot: rand(0, TAU), vr: rand(-20, 20), g: 900,
        });
      }
      // muzzle signature per ammo family
      const fwd = (n: number) => ({ x: m.x + sa * n, y: m.y - ca * n });
      const push = (p: Partial<Particle> & { kind: PKind }) => this.particles.push({
        x: m.x, y: m.y, vx: 0, vy: 0, life: 0.6, max: 0.6, size: 6,
        color: w.glow, rot: 0, vr: 0, g: 0, ...p,
      } as Particle);
      switch (w.ammo) {
        case 'laser': case 'beamgalaxy': case 'holy': case 'bolt_elec':
          push({ kind: 'shock', size: 30, life: 0.22, max: 0.22, color: w.c2 });
          for (let s = 0; s < 6; s++) {
            const a2 = rand(0, TAU);
            push({ kind: 'energy', vx: Math.cos(a2) * rand(60, 200), vy: Math.sin(a2) * rand(60, 200),
              life: rand(0.15, 0.35), max: 0.35, size: rand(2, 4), color: w.c2 });
          }
          break;
        case 'plasma': case 'magic': case 'portal': case 'shrink': case 'rainbow':
          push({ kind: 'shock', size: 40, life: 0.3, max: 0.3, color: w.glow });
          for (let s = 0; s < 8; s++) {
            const a2 = rand(0, TAU);
            push({ kind: 'energy', vx: Math.cos(a2) * rand(70, 230), vy: Math.sin(a2) * rand(70, 230) - 50,
              life: rand(0.2, 0.5), max: 0.5, size: rand(2, 5), color: w.c2 });
          }
          break;
        case 'flame':
          for (let s = 0; s < 4; s++) {
            const p2 = fwd(rand(6, 26));
            push({ kind: 'fire', x: p2.x, y: p2.y, vx: sa * rand(80, 220) + rand(-40, 40),
              vy: -ca * rand(80, 220), life: rand(0.15, 0.35), max: 0.35, size: rand(7, 15), color: '#ff9a3c', g: -60 });
          }
          break;
        case 'water': case 'bubble': case 'honey': case 'acid': case 'ink':
          for (let s = 0; s < 5; s++) {
            push({ kind: 'energy', vx: sa * 160 + rand(-90, 90), vy: -ca * 160 + rand(-60, 60),
              life: rand(0.2, 0.5), max: 0.5, size: rand(2, 5), color: w.glow, g: 420 });
          }
          break;
        case 'snow': case 'freeze':
          for (let s = 0; s < 7; s++) {
            push({ kind: 'glint', vx: rand(-120, 120) + sa * 90, vy: rand(-120, 20) - ca * 60,
              life: rand(0.3, 0.7), max: 0.7, size: rand(2, 5), color: '#eaffff', g: 160 });
          }
          push({ kind: 'smoke', size: 12, life: 0.6, max: 0.6, color: '215,243,255', g: -40 });
          break;
        case 'confetti': case 'note': case 'petal': case 'emoji': case 'coin':
          for (let s = 0; s < 6; s++) {
            push({ kind: 'glint', vx: rand(-180, 180), vy: rand(-200, -20),
              life: rand(0.3, 0.8), max: 0.8, size: rand(2, 5),
              color: `hsl(${Math.floor(rand(0, 360))},95%,68%)`, g: 400 });
          }
          break;
        case 'rocket': case 'meteor': case 'boom': case 'firework': {
          for (let s = 0; s < 9; s++) {
            push({ kind: 'smoke', x: m.x + rand(-6, 6), y: m.y + rand(-6, 6),
              vx: rand(-110, 110), vy: rand(-130, -10),
              life: rand(0.5, 1.2), max: 1.2, size: rand(8, 18), color: '160,150,145', g: -30 });
          }
          for (let s = 0; s < 5; s++) {
            push({ kind: 'fire', vx: rand(-90, 90) + sa * 80, vy: rand(-90, 10) - ca * 80,
              life: rand(0.15, 0.3), max: 0.3, size: rand(8, 16), color: '#ffab3c', g: -40 });
          }
          break;
        }
        case 'stone': case 'coconut': case 'dart': case 'bolt':
          for (let s = 0; s < 2; s++) {
            push({ kind: 'smoke', x: m.x + rand(-4, 4), y: m.y,
              vx: rand(-30, 30), vy: rand(-50, -10),
              life: rand(0.3, 0.6), max: 0.6, size: rand(4, 8), color: '200,195,180', g: -20 });
          }
          break;
        default:
          for (let s = 0; s < 4; s++) {
            push({ kind: 'smoke', x: m.x + rand(-5, 5), y: m.y + rand(-5, 5),
              vx: rand(-50, 50) + sa * 120, vy: rand(-110, -30) - ca * 60,
              life: rand(0.4, 0.9), max: 0.9, size: rand(5, 12), color: '190,185,180', g: -25 });
          }
          for (let s = 0; s < 3; s++) {
            push({ kind: 'spark', vx: rand(-200, 200) + sa * 120, vy: rand(-160, 40) - ca * 120,
              life: rand(0.1, 0.25), max: 0.25, size: 2, color: w.c2, g: 220 });
          }
      }
    });
    this.shake = Math.min(22, this.shake + w.shake);
    this.flashScreen = Math.max(this.flashScreen, w.shake > 12 ? 0.4 : w.shake > 6 ? 0.2 : 0.07);
    this.heat = Math.min(1, this.heat + 0.25);
    this.sfx.shot(w);
    if (this.ammo <= 0) { this.reloadT = w.reload; this.sfx.reloadSeq(w.reload, w); }
  }

  toLocal(x: number, y: number): V {
    const dx = x - RCX, dy = y - RCY;
    const c = Math.cos(-this.rot), s = Math.sin(-this.rot);
    return { x: dx * c - dy * s, y: dx * s + dy * c };
  }
  toWorld(p: V): V {
    const c = Math.cos(this.rot), s = Math.sin(this.rot);
    return { x: RCX + p.x * c - p.y * s, y: RCY + p.x * s + p.y * c };
  }

  addCrack(cell: Cell, p: V) {
    if (cell.cracks.length > 10) return;
    for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
      const line: V[] = [{ ...p }];
      let a = rand(0, TAU); let cur = { ...p };
      for (let s = 0; s < 3 + Math.floor(Math.random() * 2); s++) {
        a += rand(-0.7, 0.7);
        const len = rand(5, 11);
        cur = { x: cur.x + Math.cos(a) * len, y: cur.y + Math.sin(a) * len };
        line.push(cur);
      }
      cell.cracks.push(line);
    }
  }
  damageCell(cell: Cell, dmg: number, local: V) {
    cell.hp -= dmg; cell.flash = 1;
    if (this.flashing.indexOf(cell) < 0) this.flashing.push(cell);
    if (this.cracked.indexOf(cell) < 0) this.cracked.push(cell);
    this.addCrack(cell, local);
    if (cell.hp <= 0) this.breakCell(cell);
  }

  explode(x: number, y: number, radius: number, dmg: number, big: boolean, color: string) {
    const lp = this.toLocal(x, y);
    for (const c of this.cells) {
      if (!c.alive) continue;
      const d = Math.hypot(c.c.x - lp.x, c.c.y - lp.y);
      if (d < radius) this.damageCell(c, dmg, { x: c.c.x + (lp.x - c.c.x) * 0.4, y: c.c.y + (lp.y - c.c.y) * 0.4 });
    }
    this.particles.push({ kind: 'shock', x, y, vx: 0, vy: 0, life: big ? 0.5 : 0.35, max: big ? 0.5 : 0.35, size: radius * 1.5, color, rot: 0, vr: 0, g: 0 });
    this.particles.push({ kind: 'ring', x, y, vx: 0, vy: 0, life: 0.45, max: 0.45, size: radius, color: '#fff', rot: 0, vr: 0, g: 0 });
    for (let i = 0; i < (big ? 26 : 15); i++) {
      const a = rand(0, TAU), sp = rand(60, big ? 420 : 280);
      this.particles.push({
        kind: 'fire', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: rand(0.25, 0.7), max: 0.7, size: rand(6, big ? 26 : 16), color, rot: 0, vr: 0, g: -40,
      });
    }
    for (let i = 0; i < (big ? 14 : 8); i++) {
      const a = rand(0, TAU), sp = rand(20, 140);
      this.particles.push({
        kind: 'smoke', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: rand(0.7, 1.4), max: 1.4, size: rand(12, 30), color: '120,110,105', rot: 0, vr: 0, g: -30,
      });
    }
    this.shake = Math.min(26, this.shake + (big ? 14 : 7));
    this.flashScreen = Math.max(this.flashScreen, big ? 0.5 : 0.28);
    this.sfx.boom(big);
  }

  breakCell(cell: Cell) {
    cell.alive = false;
    this.rockDirty = true;
    this.shimmer = this.shimmer.filter((c) => c !== cell);
    this.cracked = this.cracked.filter((c) => c !== cell);
    const wc = this.toWorld(cell.c);
    const out = { x: wc.x - RCX, y: wc.y - RCY };
    const ol = Math.hypot(out.x, out.y) || 1;
    out.x /= ol; out.y /= ol;
    const tan = { x: -out.y * this.rotSpeed * ol, y: out.x * this.rotSpeed * ol };
    const col = (dl: number) => `hsl(${cell.hue},${cell.sat}%,${cell.light + dl}%)`;
    for (let i = 0; i < 4 + Math.floor(Math.random() * 3); i++) {
      const vtx = cell.poly[Math.floor(Math.random() * cell.poly.length)];
      const f = rand(0.1, 0.6);
      const wp = this.toWorld({ x: cell.c.x + (vtx.x - cell.c.x) * f, y: cell.c.y + (vtx.y - cell.c.y) * f });
      const sz = rand(5, 13);
      const pts = 5 + Math.floor(Math.random() * 3);
      const poly: V[] = [];
      for (let k = 0; k < pts; k++) {
        const a = (k / pts) * TAU + rand(-0.3, 0.3);
        const r = sz * rand(0.55, 1);
        poly.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }
      const sp = rand(140, 380);
      this.particles.push({
        kind: 'frag', x: wp.x, y: wp.y,
        vx: out.x * sp + tan.x * 0.6 + rand(-60, 60), vy: out.y * sp + tan.y * 0.6 + rand(-130, 30),
        life: rand(1.2, 2), max: 2, size: sz, color: col(rand(-6, 6)),
        rot: rand(0, TAU), vr: rand(-10, 10), poly, g: 1100, extra: cell.type === 'crystal' ? 1 : 0,
      });
    }
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        kind: 'chip', x: wc.x + rand(-8, 8), y: wc.y + rand(-8, 8),
        vx: out.x * rand(80, 300) + rand(-100, 100), vy: out.y * rand(80, 300) + rand(-150, 50),
        life: rand(0.6, 1.2), max: 1.2, size: rand(1.5, 3.5), color: col(rand(-10, 10)), rot: 0, vr: 0, g: 900,
      });
    }
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        kind: 'smoke', x: wc.x + rand(-12, 12), y: wc.y + rand(-12, 12),
        vx: out.x * rand(20, 80), vy: out.y * rand(20, 80),
        life: rand(0.6, 1.2), max: 1.2, size: rand(8, 18), color: '170,150,130', rot: 0, vr: 0, g: -15,
      });
    }
    this.combo++; this.comboT = 1.6;
    const mult = 1 + Math.min(1.5, (this.combo - 1) * 0.05);
    let pts = 10;
    if (cell.type === 'hard') pts = 30;
    if (cell.type === 'crystal') {
      pts = 40;
      for (let i = 0; i < 8; i++) {
        this.particles.push({
          kind: 'glint', x: wc.x, y: wc.y, vx: rand(-200, 200), vy: rand(-260, 120),
          life: rand(0.4, 0.8), max: 0.8, size: rand(3, 7), color: '#d8b4fe', rot: 0, vr: 0, g: 400,
        });
      }
    }
    if (cell.type === 'ore') {
      pts = 60;
      for (let i = 0; i < 11; i++) {
        this.particles.push({
          kind: 'glint', x: wc.x, y: wc.y, vx: rand(-220, 220), vy: rand(-340, 60),
          life: rand(0.4, 0.9), max: 0.9, size: rand(3, 7), color: '#cfeeff', rot: 0, vr: 0, g: 520,
        });
      }
    }
    pts = Math.round(pts * mult);
    this.score += pts;
    this.texts.push({
      x: wc.x, y: wc.y, text: cell.type === 'ore' ? `+${pts} ORE` : `+${pts}`,
      life: cell.type === 'ore' ? 1.1 : 0.72,
      color: cell.type === 'ore' ? '#bfe9ff' : cell.type === 'crystal' ? '#d8b4fe' : '#fff',
      size: cell.type === 'ore' ? 22 : 16,
    });
    this.shake = Math.min(22, this.shake + 3);
    this.sfx.crack();
    if (this.stage !== 'bonus' && this.cells.every((c) => !c.alive) && this.state === 'playing') this.win();
  }

  win() {
    this.state = 'won'; this.winT = 0;
    if (this.stage === 'treasure') {
      this.stars = this.coins >= 90 ? 3 : this.coins >= 45 ? 2 : 1;
      this.texts.push({ x: RCX, y: RCY - 150, text: `${this.coins} KOIN!`, life: 2.4, color: '#ffd23f', size: 32 });
    } else if (this.stage === 'bonus') {
      const got = this.coinItems.filter((c) => !c.alive).length;
      this.stars = got >= this.coinItems.length ? 3 : got > this.coinItems.length * 0.7 ? 2 : 1;
      this.texts.push({ x: RCX, y: RCY - 150, text: `${this.coins} KOIN!`, life: 2.4, color: '#ffd23f', size: 32 });
    } else {
      const used = TIME_LIMIT - this.timeLeft;
      this.stars = used < 40 ? 3 : used < 65 ? 2 : 1;
      this.score += Math.round(this.timeLeft) * 20;
      this.texts.push({ x: RCX, y: RCY - 130, text: 'DIAMOND BERSIH!', life: 2.4, color: '#7df9ff', size: 30 });
    }
    this.firing = false; this.bullets = []; this.star = null; this.choosing = false;
    this.flashScreen = 0.8;
    this.sfx.win(); this.pushHud();
  }
  lose() { this.state = 'lost'; this.firing = false; this.choosing = false; this.sfx.lose(); this.pushHud(); }

  spawnStar() {
    const fromLeft = Math.random() < 0.5;
    this.star = {
      x: fromLeft ? -30 : GAME_W + 30,
      y: rand(120, 430),
      vx: (fromLeft ? 1 : -1) * rand(45, 85),
      vy: rand(-12, 12), t: 0, alive: true, hp: 3,
    };
  }

  hitStar(x: number, y: number) {
    const s = this.star;
    if (!s || !s.alive) return false;
    if (Math.hypot(s.x - x, s.y - y) > 36) return false;
    s.hp--;
    this.sfx.starHit();
    for (let i = 0; i < 14; i++) {
      const a = rand(0, TAU);
      this.particles.push({
        kind: 'glint', x: s.x, y: s.y, vx: Math.cos(a) * rand(80, 300), vy: Math.sin(a) * rand(80, 300),
        life: rand(0.3, 0.8), max: 0.8, size: rand(3, 8), color: '#ffe066', rot: 0, vr: 0, g: 240,
      });
    }
    if (s.hp <= 0) {
      s.alive = false;
      this.starsHit++;
      this.score += 150;
      this.choosing = true;
      this.firing = false;
      this.flashScreen = 0.5;
      this.particles.push({ kind: 'shock', x: s.x, y: s.y, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 120, color: '#ffe066', rot: 0, vr: 0, g: 0 });
      this.texts.push({ x: s.x, y: s.y - 20, text: '+150 ⭐', life: 1.4, color: '#ffe066', size: 22 });
      this.star = null;
      this.starTimer = rand(16, 24);
    }
    this.pushHud();
    return true;
  }

  /** returns true if the tap was consumed (star hit) */
  pointerDown(x: number, y: number) {
    if (this.state !== 'playing' || this.choosing) return false;
    const f = this.floatStar;
    if (f?.alive && Math.hypot(f.x - x, f.y - y) < 46) { this.hitFloatStar(); return true; }
    return this.hitStar(x, y);
  }

  /** every ammo family leaves a different mark on the rock */
  impactFx(b: Bullet, cellCol: string) {
    const P = (p: Partial<Particle> & { kind: PKind }) => this.particles.push({
      x: b.x, y: b.y, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 4,
      color: b.glow, rot: 0, vr: 0, g: 0, ...p,
    } as Particle);
    const chips = (n: number, spd = 200, g = 850) => {
      for (let i = 0; i < n; i++) {
        P({ kind: 'chip', vx: rand(-spd, spd), vy: rand(40, spd * 1.3),
          life: rand(0.35, 0.8), max: 0.8, size: rand(1.4, 3), color: cellCol, g });
      }
    };
    const sparks = (n: number, col: string, spd = 240) => {
      for (let i = 0; i < n; i++) {
        P({ kind: 'spark', vx: rand(-spd, spd), vy: rand(-spd * 0.4, spd),
          life: rand(0.1, 0.3), max: 0.3, size: 2, color: col, g: 200 });
      }
    };
    const energy = (n: number, col: string, spd = 200) => {
      for (let i = 0; i < n; i++) {
        const a = rand(0, TAU);
        P({ kind: 'energy', vx: Math.cos(a) * rand(40, spd), vy: Math.sin(a) * rand(40, spd),
          life: rand(0.18, 0.5), max: 0.5, size: rand(2, 5), color: col });
      }
    };
    const puff = (size: number, col: string, n = 1) => {
      for (let i = 0; i < n; i++) {
        P({ kind: 'smoke', vx: rand(-40, 40), vy: rand(-30, 40),
          life: rand(0.4, 0.8), max: 0.8, size, color: col, g: -20 });
      }
    };
    const shock = (size: number, col: string, life = 0.3) =>
      P({ kind: 'shock', life, max: life, size, color: col });
    const ring = (size: number, col: string) =>
      P({ kind: 'ring', life: 0.35, max: 0.35, size, color: col });
    const bits = (n: number, text: string, size = 15, spd = 180) => {
      for (let i = 0; i < n; i++) {
        P({ kind: 'emoji', text, vx: rand(-spd, spd), vy: rand(-spd, spd * 0.6),
          life: rand(0.5, 1), max: 1, size, rot: rand(0, TAU), vr: rand(-8, 8), g: 500 });
      }
    };

    switch (b.kind) {
      /* --- kinetic / ballistic --- */
      case 'tracer':
        chips(5); sparks(4, b.glow); puff(8, '185,170,150');
        break;
      case 'heavy':
        chips(9, 240); sparks(7, b.glow, 300); puff(13, '180,165,145'); ring(20, b.glow);
        break;
      case 'pellet':
        chips(3, 150); sparks(2, '#ffd27a', 160);
        break;
      case 'slug':
        chips(16, 300); sparks(10, b.glow, 340); puff(22, '170,160,150', 2);
        ring(34, b.glow); shock(46, b.glow, 0.26);
        this.shake = Math.min(22, this.shake + 5);
        break;
      case 'nail':
        chips(4, 120); sparks(6, '#e8eef5', 200);
        P({ kind: 'glint', vx: 0, vy: 0, life: 0.2, max: 0.2, size: 7, color: '#fff' });
        break;
      case 'bolt': case 'kunai':
        chips(6, 170); sparks(4, '#dbe3ec', 260); ring(16, '#dbe3ec');
        break;
      case 'dart':
        chips(2, 90); energy(5, '#9ef07a', 110); puff(7, '150,200,130');
        break;
      case 'stone': case 'coconut':
        chips(12, 210); puff(16, '190,175,150', 3); ring(22, 'rgba(210,195,170,1)');
        this.shake = Math.min(20, this.shake + 3);
        break;
      case 'anchor': case 'chain':
        chips(10, 200); sparks(8, '#cbd5e1', 280); ring(26, '#cbd5e1');
        this.shake = Math.min(22, this.shake + 4);
        break;
      case 'pencil':
        chips(4, 140); bits(2, '✏️', 13, 140); puff(7, '240,220,160');
        break;

      /* --- liquid / goo --- */
      case 'water':
        for (let i = 0; i < 10; i++) {
          P({ kind: 'energy', vx: rand(-180, 180), vy: rand(-200, 60),
            life: rand(0.3, 0.7), max: 0.7, size: rand(2, 5), color: '#8fdcff', g: 700 });
        }
        puff(14, '180,225,245', 2); ring(24, '#8fdcff');
        break;
      case 'bubble':
        for (let i = 0; i < 7; i++) {
          P({ kind: 'energy', vx: rand(-120, 120), vy: rand(-140, -20),
            life: rand(0.5, 1), max: 1, size: rand(3, 7), color: '#bdf0ff', g: -60 });
        }
        ring(28, '#ffffff');
        break;
      case 'honey':
        for (let i = 0; i < 6; i++) {
          P({ kind: 'energy', vx: rand(-90, 90), vy: rand(-60, 40),
            life: rand(0.8, 1.4), max: 1.4, size: rand(4, 8), color: '#ffcf4d', g: 240 });
        }
        puff(16, '220,180,90'); shock(26, '#ffcf4d', 0.45);
        break;
      case 'acid':
        energy(10, '#b6ff4a', 170); puff(15, '150,200,70', 2);
        shock(34, '#8ef02a', 0.4); chips(4, 120);
        break;
      case 'ink':
        for (let i = 0; i < 12; i++) {
          P({ kind: 'smoke', vx: rand(-150, 150), vy: rand(-150, 150),
            life: rand(0.6, 1.2), max: 1.2, size: rand(8, 18), color: '70,30,110', g: 0 });
        }
        break;
      case 'paint': {
        const hue = Math.floor(rand(0, 360));
        for (let i = 0; i < 10; i++) {
          P({ kind: 'energy', vx: rand(-200, 200), vy: rand(-180, 120),
            life: rand(0.4, 0.9), max: 0.9, size: rand(3, 7), color: `hsl(${hue},95%,62%)`, g: 500 });
        }
        shock(30, `hsl(${hue},95%,65%)`, 0.3);
        break;
      }

      /* --- cold --- */
      case 'snow': case 'freeze':
        for (let i = 0; i < 12; i++) {
          P({ kind: 'glint', vx: rand(-180, 180), vy: rand(-180, 100),
            life: rand(0.4, 0.9), max: 0.9, size: rand(2, 6), color: '#eaffff', g: 260 });
        }
        puff(18, '210,240,255', 2); shock(38, '#9fe4ff', 0.4); ring(24, '#eaffff');
        break;

      /* --- fire / blast --- */
      case 'flame':
        for (let i = 0; i < 7; i++) {
          P({ kind: 'fire', vx: rand(-110, 110), vy: rand(-140, 20),
            life: rand(0.2, 0.5), max: 0.5, size: rand(7, 16), color: '#ff8a2c', g: -70 });
        }
        puff(12, '90,70,60');
        break;
      case 'firework':
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * TAU;
          P({ kind: 'spark', vx: Math.cos(a) * rand(160, 330), vy: Math.sin(a) * rand(160, 330),
            life: rand(0.3, 0.7), max: 0.7, size: 2.4,
            color: `hsl(${(i * 37) % 360},95%,65%)`, g: 180 });
        }
        shock(60, '#f472b6', 0.4);
        break;

      /* --- energy beams --- */
      case 'laser':
        energy(5, b.glow, 150); shock(26, b.glow, 0.22); this.sfx.zap();
        break;
      case 'beamgalaxy':
        energy(9, b.c2, 230);
        for (let i = 0; i < 4; i++) {
          P({ kind: 'glint', vx: rand(-220, 220), vy: rand(-220, 220),
            life: rand(0.3, 0.6), max: 0.6, size: rand(3, 7), color: '#fff' });
        }
        shock(44, b.glow, 0.3); shock(70, b.c2, 0.45);
        break;
      case 'holy':
        for (let i = 0; i < 10; i++) {
          P({ kind: 'glint', vx: rand(-150, 150), vy: rand(-250, -40),
            life: rand(0.5, 1), max: 1, size: rand(3, 8), color: '#fff8dc', g: -60 });
        }
        shock(56, '#fde68a', 0.5); ring(30, '#ffffff');
        break;
      case 'bolt_elec':
        sparks(12, '#fff', 340); energy(6, b.glow, 200);
        shock(40, b.glow, 0.24); shock(22, '#ffffff', 0.16);
        break;
      case 'sonic':
        shock(50, b.glow, 0.34); shock(74, b.c2, 0.5); shock(30, '#ffffff', 0.22);
        puff(14, '160,150,190');
        break;
      case 'shrink':
        for (let i = 0; i < 3; i++) shock(16 + i * 12, b.glow, 0.22 + i * 0.07);
        energy(5, b.c2, 120);
        break;
      case 'magic':
        for (let i = 0; i < 8; i++) {
          P({ kind: 'glint', vx: rand(-200, 200), vy: rand(-220, 120),
            life: rand(0.4, 0.9), max: 0.9, size: rand(3, 7), color: b.c2, g: 160 });
        }
        bits(1, '✨', 18, 90); shock(34, b.glow, 0.35);
        break;
      case 'rainbow': {
        const cols = ['#ff4d4d', '#ffa64d', '#ffe74d', '#6bff8f', '#4dd2ff', '#9b6bff'];
        cols.forEach((col, i) => {
          P({ kind: 'shock', life: 0.3 + i * 0.05, max: 0.3 + i * 0.05, size: 20 + i * 9, color: col });
        });
        break;
      }
      case 'portal':
        for (let i = 0; i < 3; i++) shock(24 + i * 16, i % 2 ? b.c2 : b.glow, 0.3 + i * 0.08);
        energy(7, b.glow, 180);
        break;
      case 'blackhole':
        for (let i = 0; i < 14; i++) {
          const a = rand(0, TAU), r = rand(40, 110);
          P({ kind: 'energy', x: b.x + Math.cos(a) * r, y: b.y + Math.sin(a) * r,
            vx: -Math.cos(a) * 260, vy: -Math.sin(a) * 260,
            life: rand(0.3, 0.6), max: 0.6, size: rand(2, 5), color: b.c2 });
        }
        shock(96, b.glow, 0.55);
        break;

      /* --- crystal / treasure --- */
      case 'shard':
        for (let i = 0; i < 9; i++) {
          P({ kind: 'glint', vx: rand(-230, 230), vy: rand(-240, 120),
            life: rand(0.35, 0.8), max: 0.8, size: rand(3, 8), color: b.c2, g: 420 });
        }
        chips(5, 180); ring(24, b.glow); shock(32, b.c2, 0.26);
        break;
      case 'coin':
        for (let i = 0; i < 6; i++) {
          P({ kind: 'coin', vx: rand(-200, 200), vy: rand(-280, -60),
            life: 1.1, max: 1.1, size: rand(3, 5), color: '#ffd23f', rot: rand(0, TAU), vr: rand(-14, 14), g: 820 });
        }
        sparks(4, '#fde68a');
        break;
      case 'star':
        for (let i = 0; i < 7; i++) {
          P({ kind: 'glint', vx: rand(-200, 200), vy: rand(-220, 100),
            life: rand(0.4, 0.8), max: 0.8, size: rand(4, 9), color: '#fff3b0', g: 200 });
        }
        shock(36, b.glow, 0.32);
        break;

      /* --- quirky / organic --- */
      case 'seed':
        bits(2, '🌱', 15, 140); chips(3, 120); puff(9, '150,200,120');
        break;
      case 'petal':
        for (let i = 0; i < 8; i++) {
          P({ kind: 'glint', vx: rand(-130, 130), vy: rand(-120, 60),
            life: rand(0.7, 1.3), max: 1.3, size: rand(3, 6), color: '#ffd3e6', g: 90 });
        }
        bits(1, '🌸', 17, 70);
        break;
      case 'note':
        bits(3, ['🎵', '🎶', '🎼'][Math.floor(Math.random() * 3)], 17, 150);
        for (let i = 0; i < 3; i++) shock(18 + i * 14, b.glow, 0.3 + i * 0.07);
        break;
      case 'confetti':
        for (let i = 0; i < 14; i++) {
          P({ kind: 'chip', vx: rand(-260, 260), vy: rand(-300, -40),
            life: rand(0.6, 1.3), max: 1.3, size: rand(3, 6),
            color: `hsl(${Math.floor(rand(0, 360))},95%,65%)`, rot: rand(0, TAU), vr: rand(-16, 16), g: 620 });
        }
        break;
      case 'disc':
        sparks(8, b.c2, 300); chips(4, 160);
        P({ kind: 'ring', life: 0.3, max: 0.3, size: 22, color: b.c2 });
        break;
      case 'yoyo':
        chips(6, 170); ring(20, b.c2); sparks(3, '#fff', 160);
        break;
      case 'card':
        bits(2, '🃏', 14, 170); sparks(4, b.glow, 200);
        break;
      case 'pixel':
        for (let i = 0; i < 9; i++) {
          P({ kind: 'chip', vx: rand(-200, 200), vy: rand(-200, 100),
            life: rand(0.3, 0.6), max: 0.6, size: 4, color: i % 2 ? b.c2 : '#ffffff', g: 0 });
        }
        break;
      case 'tornado':
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * TAU;
          P({ kind: 'smoke', vx: Math.cos(a) * 180, vy: Math.sin(a) * 180,
            life: rand(0.4, 0.8), max: 0.8, size: rand(8, 16), color: '190,200,215', g: -40 });
        }
        shock(48, b.glow, 0.36);
        break;
      case 'emoji':
        bits(2, b.emoji || '💥', 18, 160); chips(4, 150); puff(10, '190,180,170');
        break;

      default:
        chips(6); sparks(4, b.glow); puff(9, '180,165,145');
    }

    if (b.size > 8) {
      ring(30, b.glow);
      this.shake = Math.min(22, this.shake + 3);
    }
  }

  addFlyCoin(x: number, y: number, value = 1) {
    this.coins += value;
    this.score += value * 25;
    this.flyCoins.push({ x, y, vx: rand(-150, 150), vy: rand(-320, -140), t: 0, max: 1.05, sx: x, sy: y });
    this.sfx.coin();
  }

  hitChest(b: Bullet): boolean {
    const ch = this.chest;
    if (!ch) return false;
    if (Math.abs(b.x - ch.x) > 104 || b.y > ch.y + 70 || b.y < ch.y - 92) return false;
    this.hits++;
    ch.shake = Math.min(14, ch.shake + 4 + b.dmg);
    ch.lid = Math.min(1, ch.lid + 0.04 + b.dmg * 0.01);
    // bigger / slower weapons spill more coins per hit
    const n = Math.max(1, Math.round(b.dmg * 0.42 + (b.big ? 1.2 : 0) + rand(0, 0.9)));
    for (let i = 0; i < n; i++) {
      const cx = ch.x + rand(-60, 60), cy = ch.y - rand(0, 40);
      this.addFlyCoin(cx, cy);
      for (let k = 0; k < 2; k++) {
        this.particles.push({
          kind: 'glint', x: cx, y: cy, vx: rand(-120, 120), vy: rand(-180, -40),
          life: rand(0.3, 0.6), max: 0.6, size: rand(2, 5), color: '#ffe9a8', rot: 0, vr: 0, g: 400,
        });
      }
    }
    this.texts.push({ x: b.x, y: ch.y - 60, text: `+${n}🪙`, life: 0.7, color: '#ffd23f', size: 17 });
    this.combo++; this.comboT = 1.4;
    this.shake = Math.min(16, this.shake + 2 + b.dmg * 0.3);
    if (b.explosive) this.explode(b.x, b.y, b.splash, 0, b.big, b.glow);
    return true;
  }

  hitCoinItem(b: Bullet): boolean {
    for (const c of this.coinItems) {
      if (!c.alive) continue;
      const a = c.a + this.rot;
      const x = RCX + Math.cos(a) * c.r, y = RCY + Math.sin(a) * c.r;
      if (Math.hypot(x - b.x, y - b.y) > 15) continue;
      c.alive = false; c.pop = 1;
      this.addFlyCoin(x, y, 2);
      for (let i = 0; i < 7; i++) {
        this.particles.push({
          kind: 'glint', x, y, vx: rand(-200, 200), vy: rand(-220, 120),
          life: rand(0.3, 0.7), max: 0.7, size: rand(3, 7), color: '#ffe066', rot: 0, vr: 0, g: 350,
        });
      }
      this.combo++; this.comboT = 1.5;
      return true;
    }
    return false;
  }

  hitBullet(b: Bullet): boolean {
    if (this.stage === 'treasure') return this.hitChest(b);
    if (this.stage === 'bonus' && this.hitCoinItem(b)) return b.pierce-- <= 0;
    const lp = this.toLocal(b.x, b.y);
    const r = Math.hypot(lp.x, lp.y);
    if (r > 215) return false;
    for (const c of this.cells) {
      if (!c.alive || r < c.rMin - 1 || r > c.rMax + 1) continue;
      if (!pointInPoly(lp, c.poly)) continue;
      this.hits++;
      this.sfx.hit();
      const cellCol = `hsl(${c.hue},${c.sat}%,${c.light + 10}%)`;
      if (b.explosive) {
        this.explode(b.x, b.y, b.splash, b.dmg, b.big, b.glow);
        this.damageCell(c, b.dmg, lp);
        return true;
      }
      this.damageCell(c, b.dmg, lp);
      if (b.splash > 0) {
        for (const o of this.cells) {
          if (o === c || !o.alive) continue;
          if (Math.hypot(o.c.x - lp.x, o.c.y - lp.y) < b.splash) {
            this.damageCell(o, b.splashDmg, { x: o.c.x + (lp.x - o.c.x) * 0.4, y: o.c.y + (lp.y - o.c.y) * 0.4 });
          }
        }
      }
      this.impactFx(b, cellCol);
      if (b.pierce > 0) { b.pierce--; return false; }
      return true;
    }
    if (r < 56) {
      this.diamondPing = 1;
      this.sfx.ding();
      for (let i = 0; i < 9; i++) {
        this.particles.push({
          kind: 'glint', x: b.x, y: b.y, vx: rand(-220, 220), vy: rand(-60, 260),
          life: rand(0.3, 0.6), max: 0.6, size: rand(2, 5), color: '#bff8ff', rot: 0, vr: 0, g: 300,
        });
      }
      if (b.explosive) this.explode(b.x, b.y, b.splash, b.dmg, b.big, b.glow);
      return true;
    }
    return false;
  }

  pushHud() {
    const alive = this.cells.filter((c) => c.alive).length;
    this.onHud({
      state: this.state, time: this.timeLeft,
      progress: 1 - alive / Math.max(1, this.totalCells),
      score: this.score, ammo: this.ammo, mag: this.magSize(),
      reloading: this.reloadT > 0,
      reloadPct: this.reloadT > 0 ? 1 - this.reloadT / this.w.reload : 0,
      weapon: this.weaponId, stars: this.stars, shots: this.shots, hits: this.hits,
      combo: this.comboT > 0 ? this.combo : 0,
      buffs: { ...this.buffs }, choosing: this.choosing, starsHit: this.starsHit,
      stage: this.stage, coins: this.coins, tBuff: this.tBuff,
      chestHp: this.chest ? this.chest.hp : 0, chestMax: this.chest ? this.chest.max : 0,
    });
  }

  loop = (now: number) => {
    const dt = Math.min(0.033, (now - this.last) / 1000);
    this.last = now;
    this.update(dt);
    this.render();
    this.raf = requestAnimationFrame(this.loop);
  };

  update(dt: number) {
    this.t += dt;
    const w = this.w;
    const frozen = this.choosing;

    if (this.stage === 'classic') {
      this.phaseT -= dt;
      if (this.phaseT <= 0) {
        this.phaseT = rand(1.4, 3.6);
        const cur = Math.sign(this.targetSpeed) || 1;
        const dir = Math.random() < 0.38 ? -cur : cur;
        this.targetSpeed = dir * rand(0.7, 2.6);
      }
    } else if (this.stage === 'bonus') {
      // smooth, comfortable single-direction spin
      this.targetSpeed = Math.sign(this.targetSpeed || 1) * 1.05;
    } else {
      this.targetSpeed = 0;
    }
    const tgt = this.state === 'won' ? 0.4 : frozen ? 0.15 : this.targetSpeed;
    this.rotSpeed += (tgt - this.rotSpeed) * Math.min(1, dt * 2.2);
    this.rot += this.rotSpeed * dt;

    // treasure floating bonus star (only one per run)
    if (this.state === 'playing' && this.stage === 'treasure' && !this.choosing) {
      if (!this.floatStar && !this.floatUsed) {
        this.floatTimer -= dt;
        if (this.floatTimer <= 0) { this.spawnFloatStar(); this.floatUsed = true; }
      } else if (this.floatStar) {
        const f = this.floatStar;
        f.t += dt;
        f.x += f.vx * dt;
        f.y += Math.sin(f.t * 1.8) * 22 * dt;
        if (f.x < -70 || f.x > GAME_W + 70) this.floatStar = null;
      }
    }
    // chest decay
    if (this.chest) {
      this.chest.shake = Math.max(0, this.chest.shake - dt * 30);
      this.chest.lid = Math.max(0, this.chest.lid - dt * 0.12);
    }
    for (const c of this.coinItems) if (c.pop > 0) c.pop = Math.max(0, c.pop - dt * 2);
    for (let i = this.flyCoins.length - 1; i >= 0; i--) {
      const f = this.flyCoins[i];
      f.t += dt;
      if (f.t >= f.max) { this.flyCoins.splice(i, 1); continue; }
    }
    // star pickup
    if (this.state === 'playing' && !this.choosing && this.stage !== 'treasure') {
      if (!this.star) {
        this.starTimer -= dt;
        if (this.starTimer <= 0) { this.spawnStar(); this.starTimer = rand(18, 26); }
      } else {
        const s = this.star;
        s.t += dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt + Math.sin(s.t * 2) * 14 * dt;
        if (s.x < -60 || s.x > GAME_W + 60) this.star = null;
      }
    }

    // aim toward star
    this.aimTarget = 0;
    const aimAt = this.star?.alive ? this.star : this.floatStar?.alive ? this.floatStar : null;
    if (aimAt) {
      const r = this.roots()[0];
      const a = Math.atan2(aimAt.x - r.x, r.y - aimAt.y);
      this.aimTarget = Math.max(-0.95, Math.min(0.95, a));
    }
    this.aim += (this.aimTarget - this.aim) * Math.min(1, dt * 7);

    if (this.switchT > 0) this.switchT = Math.max(0, this.switchT - dt);
    for (let i = 0; i < 2; i++) {
      this.recoil[i] += (0 - this.recoil[i]) * Math.min(1, dt * 14);
      this.flash[i] = Math.max(0, this.flash[i] - dt * 14);
    }
    this.shake = Math.max(0, this.shake - dt * 42);
    this.flashScreen = Math.max(0, this.flashScreen - dt * 2.6);
    this.diamondPing = Math.max(0, this.diamondPing - dt * 3);
    this.heat = Math.max(0, this.heat - dt * 0.8);
    if (this.comboT > 0) { this.comboT -= dt; if (this.comboT <= 0) this.combo = 0; }

    const wantSpin = this.firing && this.state === 'playing' && this.reloadT <= 0 && !frozen;
    if (w.form === 'minigun') {
      if (wantSpin && this.spinUpT === 0) this.sfx.spinUp();
      this.spinUpT = Math.max(0, Math.min(1, this.spinUpT + (wantSpin ? 1.6 : -1.2) * dt));
      this.spin += this.spinUpT * dt * 26;
    } else { this.spinUpT = 0; this.spin += dt * 0.8; }
    const wantCharge = wantSpin && ['blaster', 'beam', 'orb', 'wand'].includes(w.form);
    this.charge += ((wantCharge ? 1 : 0) - this.charge) * Math.min(1, dt * 6);

    if (this.state === 'playing' && !frozen) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        if (this.stage === 'classic') this.lose(); else this.win();
      }
      if (this.reloadT > 0) {
        this.reloadT -= dt;
        if (this.reloadT <= 0) { this.reloadT = 0; this.ammo = this.magSize(); }
      }
      this.fireCd -= dt;
      const spinReady = w.form !== 'minigun' || this.spinUpT > 0.55;
      if (this.firing && this.fireCd <= 0 && this.reloadT <= 0 && this.switchT <= 0.05 && spinReady) {
        this.fire();
        this.fireCd = this.rof();
        if (!w.auto) this.firing = false;
      }
    }
    if (this.state === 'won') {
      this.winT += dt;
      if (Math.random() < 0.5) {
        const a = rand(0, TAU), r = rand(40, 130);
        this.particles.push({
          kind: 'glint', x: RCX + Math.cos(a) * r, y: RCY + Math.sin(a) * r, vx: 0, vy: -20,
          life: 0.8, max: 0.8, size: rand(2, 5), color: '#ffffff', rot: 0, vr: 0, g: 0,
        });
      }
    }

    // bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.age += dt; b.life -= dt;
      b.trail.push({ x: b.x, y: b.y });
      const maxTrail = b.big ? 14 : 8;
      if (b.trail.length > maxTrail) b.trail.shift();
      const dist = Math.hypot(b.vx, b.vy) * dt;
      const steps = Math.max(1, Math.ceil(dist / 5));
      let dead = false;
      for (let s = 0; s < steps; s++) {
        b.x += (b.vx * dt) / steps;
        b.y += (b.vy * dt) / steps;
        if (this.star?.alive && Math.hypot(this.star.x - b.x, this.star.y - b.y) < 32) {
          this.hitStar(b.x, b.y); dead = true; break;
        }
        if (this.floatStar?.alive && Math.hypot(this.floatStar.x - b.x, this.floatStar.y - b.y) < 34) {
          this.hitFloatStar(); dead = true; break;
        }
        if (this.hitBullet(b)) { dead = true; break; }
      }
      if (b.kind === 'rocket' || b.kind === 'meteor' || b.kind === 'firework') {
        for (let k = 0; k < 2; k++) {
          this.particles.push({
            kind: 'smoke', x: b.x + rand(-3, 3), y: b.y + 8, vx: rand(-25, 25), vy: rand(10, 70),
            life: rand(0.4, 1), max: 1, size: rand(5, 11), color: '200,195,190', rot: 0, vr: 0, g: -20,
          });
        }
      } else if (['plasma', 'magic', 'blackhole', 'portal', 'acid', 'ink'].includes(b.kind) && Math.random() < 0.8) {
        this.particles.push({
          kind: 'energy', x: b.x + rand(-6, 6), y: b.y + rand(-6, 6), vx: rand(-50, 50), vy: rand(-20, 90),
          life: rand(0.2, 0.45), max: 0.45, size: rand(2, 5), color: b.glow, rot: 0, vr: 0, g: 0,
        });
      }
      if (dead || b.life <= 0 || b.y < -80 || b.x < -60 || b.x > GAME_W + 60) this.bullets.splice(i, 1);
    }

    if (this.flashing.length) {
      for (let i = this.flashing.length - 1; i >= 0; i--) {
        const c = this.flashing[i];
        c.flash = Math.max(0, c.flash - dt * 8);
        if (c.flash <= 0) this.flashing.splice(i, 1);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      p.vy += p.g * dt;
      if (p.kind === 'smoke') { p.vx *= 0.95; p.vy *= 0.95; }
      if (p.kind === 'fire') { p.vx *= 0.92; p.vy *= 0.92; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if ((p.kind === 'frag' || p.kind === 'chip' || p.kind === 'shell' || p.kind === 'coin') && p.y > GAME_H - 8) {
        p.y = GAME_H - 8; p.vy *= -0.35; p.vx *= 0.6; p.vr *= 0.6;
      }
    }
    if (this.particles.length > 620) this.particles.splice(0, this.particles.length - 620);

    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt; t.y -= 42 * dt;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
    for (const m of this.motes) {
      m.y += m.v * dt;
      if (m.y > GAME_H) { m.y = -5; m.x = rand(0, GAME_W); }
    }

    this.hudT -= dt;
    if (this.hudT <= 0) { this.hudT = 0.08; this.pushHud(); }
  }

  /** Bakes every live cell into an offscreen bitmap once; the frame loop then
   *  only has to blit + rotate that single image. */
  bakeRock() {
    const R = 230;
    const size = R * 2;
    if (!this.rockCv) {
      this.rockCv = document.createElement('canvas');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.rockCv.width = size * dpr;
      this.rockCv.height = size * dpr;
      this.rockDpr = dpr;
    }
    const ctx = this.rockCv.getContext('2d')!;
    ctx.setTransform(this.rockDpr, 0, 0, this.rockDpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(R, R);
    ctx.lineJoin = 'round';

    // light comes from a fixed direction in *rock local space* while baked;
    // the spotlight sweep is re-applied per frame as a cheap overlay.
    const lightDir = -Math.PI * 0.72;
    const gx = Math.cos(lightDir), gy = Math.sin(lightDir);

    for (const c of this.cells) {
      if (!c.alive) continue;
      if (!c.path) {
        const p = new Path2D();
        p.moveTo(c.poly[0].x, c.poly[0].y);
        for (let k = 1; k < c.poly.length; k++) p.lineTo(c.poly[k].x, c.poly[k].y);
        p.closePath();
        c.path = p;
      }
      const path = c.path;
      const lit = Math.cos(Math.atan2(c.c.y, c.c.x) - lightDir);
      const rf = Math.hypot(c.c.x, c.c.y) / 196;
      const dmg = 1 - c.hp / c.maxHp;
      const L = c.light + lit * 11 * rf - dmg * 9;
      const span = (c.rMax - c.rMin) + 26;

      const g = ctx.createLinearGradient(c.c.x + gx * span, c.c.y + gy * span, c.c.x - gx * span, c.c.y - gy * span);
      g.addColorStop(0, `hsl(${c.hue - 6},${c.sat + 4}%,${L + 15}%)`);
      g.addColorStop(0.32, `hsl(${c.hue},${c.sat}%,${L + 4}%)`);
      g.addColorStop(0.66, `hsl(${c.hue + 4},${c.sat + 2}%,${L - 5}%)`);
      g.addColorStop(1, `hsl(${c.hue + 10},${c.sat + 8}%,${Math.max(5, L - 17)}%)`);
      ctx.fillStyle = g; ctx.fill(path);

      ctx.save();
      ctx.clip(path);
      for (let f = 0; f < 4; f++) {
        const a0 = c.shardSeed + f * 1.7;
        ctx.globalAlpha = f % 2 ? 0.2 : 0.26;
        ctx.fillStyle = f % 2 ? `hsl(${c.hue - 4},${c.sat}%,${L + 16}%)` : `hsl(${c.hue + 8},${c.sat + 4}%,${L - 13}%)`;
        ctx.beginPath();
        ctx.moveTo(c.c.x + Math.cos(a0) * 44, c.c.y + Math.sin(a0) * 44);
        ctx.lineTo(c.c.x + Math.cos(a0 + 1.0) * 50, c.c.y + Math.sin(a0 + 1.0) * 50);
        ctx.lineTo(c.c.x + Math.cos(a0 + 2.3) * 28, c.c.y + Math.sin(a0 + 2.3) * 28);
        ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 0.5;
      for (const sp2 of c.grain) {
        ctx.fillStyle = sp2.d > 0
          ? `hsla(${c.hue - 10},${c.sat + 10}%,${L + 30}%,0.5)`
          : `hsla(${c.hue + 14},${c.sat}%,${Math.max(4, L - 24)}%,0.55)`;
        ctx.fillRect(sp2.x, sp2.y, sp2.r, sp2.r);
      }
      ctx.globalAlpha = 1;
      for (const p of c.pits) {
        ctx.fillStyle = `rgba(0,0,0,${p.a})`;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * 0.72, p.r, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.beginPath(); ctx.ellipse(p.x - p.r * 0.25, p.y - p.r * 0.35, p.r * 0.55, p.r * 0.4, 0, 0, TAU); ctx.fill();
      }
      for (const m of c.moss) {
        ctx.fillStyle = 'rgba(120,165,180,0.16)';
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, TAU); ctx.fill();
      }
      if (c.type === 'hard') {
        ctx.strokeStyle = 'rgba(165,190,225,0.35)'; ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(c.poly[0].x, c.poly[0].y); ctx.lineTo(c.c.x, c.c.y);
        ctx.lineTo(c.poly[(c.poly.length / 2) | 0].x, c.poly[(c.poly.length / 2) | 0].y);
        ctx.stroke();
        ctx.fillStyle = 'rgba(190,215,255,0.1)'; ctx.fill(path);
      } else if (c.type === 'crystal') {
        ctx.fillStyle = 'rgba(190,140,255,0.18)'; ctx.fill(path);
        ctx.strokeStyle = 'rgba(226,190,255,0.55)'; ctx.lineWidth = 1.8;
        for (let v = 0; v < 2; v++) {
          const a0 = c.shardSeed * 2 + v * 2;
          ctx.beginPath();
          ctx.moveTo(c.c.x + Math.cos(a0) * 26, c.c.y + Math.sin(a0) * 26);
          ctx.quadraticCurveTo(c.c.x, c.c.y, c.c.x + Math.cos(a0 + 2.6) * 24, c.c.y + Math.sin(a0 + 2.6) * 24);
          ctx.stroke();
        }
      } else if (c.type === 'ore') {
        ctx.strokeStyle = 'rgba(190,225,245,0.3)';
        ctx.lineWidth = 2.6; ctx.lineCap = 'round';
        ctx.beginPath();
        c.specks.forEach((sp3, k) => (k ? ctx.lineTo(sp3.x, sp3.y) : ctx.moveTo(sp3.x, sp3.y)));
        ctx.stroke();
        for (const sp3 of c.specks) {
          ctx.fillStyle = 'rgba(205,235,255,0.85)';
          ctx.beginPath(); ctx.arc(sp3.x, sp3.y, sp3.r, 0, TAU); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.8)';
          ctx.beginPath(); ctx.arc(sp3.x - sp3.r * 0.3, sp3.y - sp3.r * 0.3, sp3.r * 0.35, 0, TAU); ctx.fill();
        }
      }
      // bevels
      ctx.save();
      ctx.translate(-gx * 3, -gy * 3);
      ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 9; ctx.stroke(path);
      ctx.restore();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 5; ctx.stroke(path);
      ctx.save();
      ctx.translate(gx * 2.6, gy * 2.6);
      ctx.strokeStyle = `hsla(${c.hue - 8},${c.sat + 16}%,${Math.min(94, L + 32)}%,0.7)`;
      ctx.lineWidth = 3; ctx.stroke(path);
      ctx.translate(gx * 1.2, gy * 1.2);
      ctx.strokeStyle = `hsla(${c.hue - 12},${c.sat + 20}%,${Math.min(98, L + 44)}%,0.4)`;
      ctx.lineWidth = 1.2; ctx.stroke(path);
      ctx.restore();
      ctx.restore();
      ctx.strokeStyle = 'rgba(6,11,18,0.8)'; ctx.lineWidth = 1.7; ctx.stroke(path);
    }
    ctx.restore();
    this.rockDirty = false;
  }

  drawRock(ctx: CanvasRenderingContext2D) {
    if (this.rockDirty || !this.rockCv) this.bakeRock();
    const cv = this.rockCv!;
    const R = 230;
    ctx.save();
    ctx.translate(RCX, RCY);
    ctx.rotate(this.rot);
    ctx.drawImage(cv, -R, -R, R * 2, R * 2);

    // animated extras only for the handful of cells that need them
    if (this.shimmer.length) {
      ctx.globalCompositeOperation = 'lighter';
      for (const c of this.shimmer) {
        if (!c.alive) continue;
        const pulse = 0.5 + 0.5 * Math.sin(this.t * 3 + c.shardSeed);
        if (c.type === 'crystal') {
          ctx.globalAlpha = 0.1 + pulse * 0.14;
          ctx.fillStyle = '#c084fc';
          ctx.fill(c.path!);
        } else {
          ctx.globalAlpha = 0.25 + pulse * 0.45;
          ctx.fillStyle = '#e6f6ff';
          for (const sp of c.specks) {
            ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.r * 0.75, 0, TAU); ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();

    // world-fixed key light + shadow so the baked rock still reads as lit
    // from a single direction while it spins
    const SPR0 = sprites();
    ctx.save();
    ctx.beginPath(); ctx.arc(RCX, RCY, 214, 0, TAU); ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.16;
    const lr = 250;
    ctx.drawImage(SPR0.GLOW_SPR, RCX - 112 - lr / 2, RCY - 128 - lr / 2, lr, lr);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.42;
    ctx.drawImage(SPR0.SHADE_SPR, RCX + 40 - 160, RCY + 56 - 160, 320, 320);
    ctx.restore();

    ctx.save();
    ctx.translate(RCX, RCY);
    ctx.rotate(this.rot);
    // live crack overlay for damaged-but-alive chunks
    if (this.cracked.length) {
      ctx.lineCap = 'round';
      for (const c of this.cracked) {
        if (!c.alive) continue;
        ctx.save();
        ctx.clip(c.path!);
        for (const line of c.cracks) {
          ctx.strokeStyle = 'rgba(8,14,22,0.92)'; ctx.lineWidth = 2.2;
          ctx.beginPath(); ctx.moveTo(line[0].x, line[0].y);
          for (let k = 1; k < line.length; k++) ctx.lineTo(line[k].x, line[k].y);
          ctx.stroke();
          ctx.strokeStyle = 'rgba(225,240,255,0.22)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(line[0].x + 1.2, line[0].y + 1.2);
          for (let k = 1; k < line.length; k++) ctx.lineTo(line[k].x + 1.2, line[k].y + 1.2);
          ctx.stroke();
        }
        const dmg = 1 - c.hp / c.maxHp;
        if (dmg > 0.6) {
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = `rgba(130,215,255,${(dmg - 0.6) * 1.7})`; ctx.lineWidth = 2.6;
          for (const line of c.cracks) {
            ctx.beginPath(); ctx.moveTo(line[0].x, line[0].y);
            for (let k = 1; k < line.length; k++) ctx.lineTo(line[k].x, line[k].y);
            ctx.stroke();
          }
        }
        ctx.restore();
      }
    }
    // hit flash
    for (const c of this.flashing) {
      if (!c.alive || c.flash <= 0) continue;
      ctx.fillStyle = `rgba(255,255,255,${c.flash * 0.5})`;
      ctx.fill(c.path!);
    }
    ctx.restore();
  }

  drawCoinSprite(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, phase: number, flat = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(flat, 1);
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
    g.addColorStop(0, '#fff8d0');
    g.addColorStop(0.45, '#ffd54a');
    g.addColorStop(0.8, '#e8a317');
    g.addColorStop(1, '#a86a08');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,245,190,0.85)'; ctx.lineWidth = Math.max(1, r * 0.12);
    ctx.beginPath(); ctx.arc(0, 0, r * 0.76, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(180,110,10,0.55)';
    ctx.font = `900 ${r * 1.05}px system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, r * 0.06);
    // moving specular sweep = blink blink
    const sweep = (Math.sin(this.t * 3.4 + phase) + 1) / 2;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.35 + sweep * 0.6;
    ctx.rotate(-0.6);
    const lg = ctx.createLinearGradient(-r, 0, r, 0);
    lg.addColorStop(0, 'rgba(255,255,255,0)');
    lg.addColorStop(0.5, 'rgba(255,255,255,0.9)');
    lg.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.ellipse((sweep - 0.5) * r * 1.9, 0, r * 0.32, r, 0, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.ellipse(-r * 0.34, -r * 0.4, r * 0.2, r * 0.13, -0.6, 0, TAU); ctx.fill();
    ctx.restore();
    // twinkle star
    const tw = Math.sin(this.t * 5 + phase * 2);
    if (tw > 0.72) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = (tw - 0.72) * 3.4;
      ctx.fillStyle = '#fffbe0';
      const s = r * 1.5;
      ctx.beginPath();
      ctx.moveTo(x + r * 0.5, y - r * 0.5 - s); ctx.lineTo(x + r * 0.5 + s * 0.18, y - r * 0.5 - s * 0.18);
      ctx.lineTo(x + r * 0.5 + s, y - r * 0.5); ctx.lineTo(x + r * 0.5 + s * 0.18, y - r * 0.5 + s * 0.18);
      ctx.lineTo(x + r * 0.5, y - r * 0.5 + s); ctx.lineTo(x + r * 0.5 - s * 0.18, y - r * 0.5 + s * 0.18);
      ctx.lineTo(x + r * 0.5 - s, y - r * 0.5); ctx.lineTo(x + r * 0.5 - s * 0.18, y - r * 0.5 - s * 0.18);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }

  drawCoinRing(ctx: CanvasRenderingContext2D) {
    for (const c of this.coinItems) {
      if (!c.alive) continue;
      const a = c.a + this.rot;
      const x = RCX + Math.cos(a) * c.r, y = RCY + Math.sin(a) * c.r;
      const flat = Math.abs(Math.cos(this.t * 2.2 + c.spin)) * 0.8 + 0.2;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const gl = ctx.createRadialGradient(x, y, 0, x, y, 22);
      gl.addColorStop(0, 'rgba(255,215,90,0.4)'); gl.addColorStop(1, 'rgba(255,180,0,0)');
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(x, y, 22, 0, TAU); ctx.fill();
      ctx.restore();
      this.drawCoinSprite(ctx, x, y, 11, c.spin, flat);
    }
  }

  drawChest(ctx: CanvasRenderingContext2D) {
    const ch = this.chest;
    if (!ch) return;
    const sx = ch.shake ? rand(-1, 1) * ch.shake * 0.5 : 0;
    const sy = ch.shake ? rand(-1, 1) * ch.shake * 0.3 : 0;
    ctx.save();
    ctx.translate(ch.x + sx, ch.y + sy);

    // ground glow
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gl = ctx.createRadialGradient(0, -20, 10, 0, -20, 190);
    gl.addColorStop(0, `rgba(255,210,90,${0.28 + ch.lid * 0.3})`);
    gl.addColorStop(1, 'rgba(255,170,0,0)');
    ctx.fillStyle = gl;
    ctx.beginPath(); ctx.arc(0, -20, 190, 0, TAU); ctx.fill();
    ctx.restore();

    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath(); ctx.ellipse(0, 72, 108, 18, 0, 0, TAU); ctx.fill();

    const lidAng = -0.95 - ch.lid * 0.25;
    // open lid (behind)
    ctx.save();
    ctx.translate(0, -34);
    ctx.rotate(lidAng);
    const lg = ctx.createLinearGradient(0, -46, 0, 6);
    lg.addColorStop(0, '#8a5a2c'); lg.addColorStop(0.5, '#6b4420'); lg.addColorStop(1, '#4a2d14');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(-92, 4);
    ctx.quadraticCurveTo(-92, -48, 0, -48);
    ctx.quadraticCurveTo(92, -48, 92, 4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c9972f'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-34, -42); ctx.lineTo(-34, 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(34, -42); ctx.lineTo(34, 4); ctx.stroke();
    ctx.strokeStyle = '#8b6a1e'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-92, 2); ctx.quadraticCurveTo(0, -46, 92, 2); ctx.stroke();
    // inner lid (lighter)
    ctx.fillStyle = 'rgba(255,220,150,0.18)';
    ctx.beginPath();
    ctx.moveTo(-84, 2); ctx.quadraticCurveTo(-84, -40, 0, -40);
    ctx.quadraticCurveTo(84, -40, 84, 2);
    ctx.closePath(); ctx.fill();
    ctx.restore();

    // coin heap
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-88, 34); ctx.lineTo(88, 34); ctx.lineTo(88, -40); ctx.lineTo(-88, -40); ctx.closePath();
    ctx.clip();
    for (const c of ch.coins) {
      const bob = Math.sin(this.t * 2 + c.ph) * 1.4;
      this.drawCoinSprite(ctx, c.x, c.y + bob - 4, c.r * c.s, c.ph, 1);
    }
    ctx.restore();

    // chest body (front)
    const bg = ctx.createLinearGradient(0, -24, 0, 72);
    bg.addColorStop(0, '#7b4f26'); bg.addColorStop(0.45, '#5d3a1b'); bg.addColorStop(1, '#3a2310');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.roundRect(-92, 6, 184, 62, 7); ctx.fill();
    // planks
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 2;
    for (let i = 1; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-92, 6 + i * 20); ctx.lineTo(92, 6 + i * 20); ctx.stroke(); }
    // metal bands
    ctx.fillStyle = '#c9972f';
    ctx.fillRect(-40, 6, 11, 62); ctx.fillRect(29, 6, 11, 62);
    ctx.fillStyle = 'rgba(255,240,180,0.45)';
    ctx.fillRect(-40, 6, 3, 62); ctx.fillRect(29, 6, 3, 62);
    ctx.fillStyle = '#a87b1d';
    ctx.beginPath(); ctx.roundRect(-92, 2, 184, 9, 3); ctx.fill();
    // rim highlight
    ctx.fillStyle = 'rgba(255,225,150,0.35)';
    ctx.fillRect(-92, 6, 184, 2.5);
    // lock
    ctx.fillStyle = '#d4a62c';
    ctx.beginPath(); ctx.roundRect(-13, 14, 26, 24, 5); ctx.fill();
    ctx.fillStyle = '#5a3f0a';
    ctx.beginPath(); ctx.arc(0, 24, 4.6, 0, TAU); ctx.fill();
    ctx.fillRect(-1.8, 24, 3.6, 9);
    // studs
    ctx.fillStyle = '#e6c25a';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath(); ctx.arc(-80 + i * 32, 62, 2.8, 0, TAU); ctx.fill();
    }
    // coins spilling over the front edge
    for (let i = 0; i < 7; i++) {
      const cx = -74 + i * 24 + Math.sin(this.t * 1.4 + i) * 2;
      this.drawCoinSprite(ctx, cx, 6 + Math.sin(i * 2.1) * 2, 9, i * 1.7, 1);
    }
    ctx.restore();

    // floating sparkles above the chest
    for (let i = 0; i < 5; i++) {
      const ph = i * 1.9;
      const fy = ch.y - 70 - ((this.t * 26 + i * 30) % 90);
      const fx = ch.x + Math.sin(this.t * 1.2 + ph) * 70;
      const al = 0.35 + 0.45 * Math.sin(this.t * 4 + ph);
      if (al <= 0) continue;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = al;
      ctx.fillStyle = '#ffe9a8';
      ctx.translate(fx, fy); ctx.rotate(Math.PI / 4);
      ctx.fillRect(-2.5, -2.5, 5, 5);
      ctx.restore();
    }
  }

  drawFlyCoins(ctx: CanvasRenderingContext2D) {
    const tx = GAME_W - 54, ty = 42;
    for (const f of this.flyCoins) {
      const k = f.t / f.max;
      const e = k * k;
      // arc toward the counter
      const px = f.sx + (tx - f.sx) * e + f.vx * (1 - k) * 0.18;
      const py = f.sy + (ty - f.sy) * e + f.vy * (1 - k) * 0.18 * (1 - e);
      const r = 11 * (1 - e * 0.55);
      ctx.save();
      ctx.globalAlpha = k > 0.9 ? (1 - k) * 10 : 1;
      this.drawCoinSprite(ctx, px, py, r, f.sx, Math.abs(Math.cos(f.t * 10)) * 0.85 + 0.15);
      ctx.restore();
    }
  }

  drawFloatStar(ctx: CanvasRenderingContext2D) {
    const f = this.floatStar;
    if (!f || !f.alive) return;
    const pulse = 0.5 + 0.5 * Math.sin(this.t * 5);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 76 + pulse * 18);
    g.addColorStop(0, 'rgba(255,240,170,0.8)'); g.addColorStop(1, 'rgba(255,200,40,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(f.x, f.y, 76 + pulse * 18, 0, TAU); ctx.fill();
    ctx.restore();
    // sparkle trail
    for (let i = 0; i < 6; i++) {
      const tx2 = f.x - f.vx * 0.012 * i * 3;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.4 - i * 0.055;
      ctx.fillStyle = '#ffe9a8';
      ctx.translate(tx2, f.y + Math.sin(this.t * 4 + i) * 5); ctx.rotate(Math.PI / 4);
      ctx.fillRect(-3, -3, 6, 6);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(f.x, f.y + Math.sin(this.t * 2.4) * 4);
    ctx.rotate(Math.sin(this.t * 1.5) * 0.3);
    const R = 28 + pulse * 4;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU - Math.PI / 2;
      const r = i % 2 ? R * 0.44 : R;
      const px = Math.cos(a) * r, py = Math.sin(a) * r;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    const sg = ctx.createLinearGradient(0, -R, 0, R);
    sg.addColorStop(0, '#fffbe0'); sg.addColorStop(0.5, '#ffd93d'); sg.addColorStop(1, '#f59e0b');
    ctx.fillStyle = sg; ctx.fill();
    ctx.lineWidth = 2.6; ctx.strokeStyle = '#fff7cc'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(-7, -8, 5, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '900 11px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,245,200,0.95)';
    ctx.fillText('ITEM BONUS!', f.x, f.y - 44);
    ctx.restore();
  }

  drawStar(ctx: CanvasRenderingContext2D) {
    const s = this.star;
    if (!s || !s.alive) return;
    const pulse = 0.5 + 0.5 * Math.sin(this.t * 5);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 60 + pulse * 14);
    g.addColorStop(0, 'rgba(255,240,170,0.75)');
    g.addColorStop(1, 'rgba(255,200,40,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(s.x, s.y, 60 + pulse * 14, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(Math.sin(this.t * 2) * 0.25);
    const R = 24 + pulse * 3;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * TAU - Math.PI / 2;
      const r = i % 2 ? R * 0.44 : R;
      const px = Math.cos(a) * r, py = Math.sin(a) * r;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    const sg = ctx.createLinearGradient(0, -R, 0, R);
    sg.addColorStop(0, '#fffbe0'); sg.addColorStop(0.5, '#ffd93d'); sg.addColorStop(1, '#f59e0b');
    ctx.fillStyle = sg; ctx.fill();
    ctx.lineWidth = 2.4; ctx.strokeStyle = '#fff7cc'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath(); ctx.arc(-6, -7, 4, 0, TAU); ctx.fill();
    // hp pips
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < s.hp ? '#fff' : 'rgba(255,255,255,0.25)';
      ctx.beginPath(); ctx.arc(-8 + i * 8, R + 10, 2.6, 0, TAU); ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '900 11px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,245,200,0.9)';
    ctx.fillText('TEMBAK / TAP!', s.x, s.y - 38);
    ctx.restore();
  }

  drawParticles(ctx: CanvasRenderingContext2D) {
    const SPR = sprites();
    for (const p of this.particles) {
      const a = Math.min(1, (p.life / p.max) * 1.5);
      switch (p.kind) {
        case 'frag':
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = a;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          p.poly!.forEach((v, k) => (k ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)));
          ctx.closePath(); ctx.fill();
          if (p.extra) { ctx.fillStyle = 'rgba(216,180,254,0.45)'; ctx.fill(); }
          ctx.fillStyle = 'rgba(255,255,255,0.22)';
          ctx.beginPath(); ctx.moveTo(p.poly![0].x, p.poly![0].y); ctx.lineTo(p.poly![1].x, p.poly![1].y); ctx.lineTo(0, 0);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1; ctx.stroke();
          ctx.restore();
          break;
        case 'chip':
          ctx.globalAlpha = a; ctx.fillStyle = p.color;
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          ctx.globalAlpha = 1; break;
        case 'smoke': {
          const k = 1 - p.life / p.max;
          const r = p.size * (0.6 + k * 1.3);
          ctx.fillStyle = `rgba(${p.color},${0.3 * (1 - k)})`;
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
          break;
        }
        case 'fire': {
          const k = p.life / p.max;
          const r = p.size * (1.6 - k * 0.5);
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = k;
          ctx.drawImage(SPR.FIRE_SPR, p.x - r, p.y - r, r * 2, r * 2);
          ctx.restore(); break;
        }
        case 'energy': {
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
          ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill();
          const gr = p.size * 2.4;
          ctx.globalAlpha = a * 0.5;
          ctx.drawImage(SPR.GLOW_SPR, p.x - gr, p.y - gr, gr * 2, gr * 2);
          ctx.restore(); break;
        }
        case 'spark':
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = p.color; ctx.globalAlpha = a; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03); ctx.stroke();
          ctx.restore(); break;
        case 'glint':
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
          ctx.fillStyle = p.color; ctx.translate(p.x, p.y); ctx.rotate(Math.PI / 4);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore(); break;
        case 'shell':
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = a;
          ctx.fillStyle = p.color; ctx.fillRect(-p.size, -p.size * 2.2, p.size * 2, p.size * 4.4);
          ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(-p.size, -p.size * 2.2, p.size * 0.6, p.size * 4.4);
          ctx.restore(); break;
        case 'coin':
          ctx.save(); ctx.translate(p.x, p.y); ctx.globalAlpha = a;
          ctx.scale(Math.abs(Math.cos(p.rot)) + 0.2, 1);
          ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(0, 0, p.size, 0, TAU); ctx.fill();
          ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 1; ctx.stroke();
          ctx.restore(); break;
        case 'ring': {
          const k = 1 - p.life / p.max;
          ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - k)})`;
          ctx.lineWidth = 4 * (1 - k) + 1;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.3 + k), 0, TAU); ctx.stroke();
          break;
        }
        case 'shock': {
          const k = 1 - p.life / p.max;
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = p.color; ctx.globalAlpha = (1 - k) * 0.85;
          ctx.lineWidth = 6 * (1 - k) + 1.5;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.15 + k * 0.95), 0, TAU); ctx.stroke();
          ctx.restore(); break;
        }
        case 'emoji':
          ctx.save(); ctx.globalAlpha = a; ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.font = `${p.size}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(p.text || '✨', 0, 0);
          ctx.restore(); break;
      }
    }
    ctx.globalAlpha = 1;
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    if (!this.bgGrad) {
      const bg = ctx.createLinearGradient(0, 0, 0, GAME_H);
      bg.addColorStop(0, '#1b1333'); bg.addColorStop(0.55, '#0e1425'); bg.addColorStop(1, '#06080e');
      this.bgGrad = bg;
      const vg = ctx.createRadialGradient(GAME_W / 2, GAME_H / 2, GAME_H * 0.3, GAME_W / 2, GAME_H / 2, GAME_H * 0.78);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
      this.vigGrad = vg;
    }
    ctx.fillStyle = this.bgGrad; ctx.fillRect(0, 0, GAME_W, GAME_H);
    if (this.shake > 0) ctx.translate(rand(-1, 1) * this.shake * 0.6, rand(-1, 1) * this.shake * 0.6);

    if (!this.cavePath) {
      const p = new Path2D();
      p.moveTo(0, 0);
      for (let x = 0; x <= GAME_W; x += 40) p.lineTo(x, 30 + Math.sin(x * 0.05) * 18 + (x % 80 === 0 ? 20 : 0));
      p.lineTo(GAME_W, 0); p.closePath();
      this.cavePath = p;
    }
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fill(this.cavePath);

    for (const m of this.motes) {
      ctx.fillStyle = `rgba(200,190,255,${0.14 + m.s * 0.1})`;
      ctx.fillRect(m.x, m.y, m.s, m.s);
    }

    const alive = this.cells.reduce((n, c) => n + (c.alive ? 1 : 0), 0);
    const progress = 1 - alive / Math.max(1, this.totalCells);
    const sp = ctx.createRadialGradient(RCX, RCY, 20, RCX, RCY, 320);
    sp.addColorStop(0, `rgba(90,200,255,${0.07 + progress * 0.24})`);
    sp.addColorStop(1, 'rgba(90,200,255,0)');
    ctx.fillStyle = sp; ctx.fillRect(0, 0, GAME_W, GAME_H);

    if (this.state === 'won') {
      ctx.save(); ctx.translate(RCX, RCY); ctx.rotate(this.t * 0.4);
      const a = Math.min(1, this.winT);
      for (let i = 0; i < 12; i++) {
        ctx.rotate(TAU / 12);
        ctx.fillStyle = `rgba(150,240,255,${0.08 * a})`;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, -500); ctx.lineTo(30, -500); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }

    const showDiamond = this.stage !== 'treasure';
    const glowR = 92 + progress * 42 + (this.state === 'won' ? 44 + Math.sin(this.t * 4) * 10 : 0);
    const dg = ctx.createRadialGradient(RCX, RCY, 10, RCX, RCY, glowR);
    dg.addColorStop(0, `rgba(160,245,255,${0.33 + this.diamondPing * 0.4})`);
    dg.addColorStop(1, 'rgba(160,245,255,0)');
    if (showDiamond) { ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(RCX, RCY, glowR, 0, TAU); ctx.fill(); }

    const ds = this.state === 'won'
      ? 1 + Math.min(1, this.winT * 1.5) * 0.45 + Math.sin(this.t * 3) * 0.03
      : 1 + this.diamondPing * 0.05;
    if (showDiamond) drawDiamond(ctx, this.t, ds);

    if (this.stage === 'treasure') this.drawChest(ctx);
    else this.drawRock(ctx);
    if (this.stage === 'bonus') this.drawCoinRing(ctx);
    this.drawStar(ctx);
    this.drawFloatStar(ctx);
    this.drawParticles(ctx);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const b of this.bullets) drawBullet(ctx, b, this.t);
    ctx.restore();

    // guns
    const w = this.w;
    const rs = this.roots();
    const relK = this.reloadT > 0 ? 1 - this.reloadT / w.reload : 0;
    const tilt = this.reloadT > 0 ? Math.sin(relK * Math.PI) * 0.2 : 0;
    const magDrop = this.reloadT > 0 ? (relK < 0.5 ? relK * 2 * 62 : (1 - relK) * 2 * 62) : 0;
    rs.forEach((r, i) => {
      if (this.state === 'playing' && this.reloadT <= 0) {
        const m = this.muzzleOf(r, i);
        const far = 520;
        ctx.strokeStyle = this.star?.alive ? 'rgba(255,220,120,0.3)' : 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1; ctx.setLineDash([4, 9]);
        ctx.beginPath(); ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x + Math.sin(this.aim) * far, m.y - Math.cos(this.aim) * far);
        ctx.stroke(); ctx.setLineDash([]);
      }
      const d: GunDraw = {
        flash: this.flash[i], tilt, magDrop, spin: this.spin,
        charge: this.charge, heat: this.spinUpT || this.heat, t: this.t,
      };
      const m2 = this.muzzleOf(r, i);
      drawGun(ctx, m2.x, m2.y, this.aim, r.side, w, d);
    });

    this.drawFlyCoins(ctx);

    ctx.textAlign = 'center';
    for (const t of this.texts) {
      ctx.globalAlpha = Math.min(1, t.life * 2);
      ctx.font = `900 ${t.size}px system-ui, sans-serif`;
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.7)';
      ctx.strokeText(t.text, t.x, t.y);
      ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = this.vigGrad!; ctx.fillRect(-30, -30, GAME_W + 60, GAME_H + 60);
    if (this.flashScreen > 0.01) {
      ctx.fillStyle = `rgba(255,240,210,${this.flashScreen * 0.35})`;
      ctx.fillRect(-30, -30, GAME_W + 60, GAME_H + 60);
    }
    ctx.restore();
  }
}
