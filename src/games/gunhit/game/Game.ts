import { sfx } from './audio';
import { sfx2 } from './sfx2';
import { sfx3 } from './sfx3';
import { sfx4 } from './sfx4';
import { sfx6 } from './sfx6';
import { sfx5 } from './sfx5';
import { gunState } from './art/kit';
import { FX, spawnImpact, spawnMuzzle, spawnSpeedLines, drawFxParticle, type Particle, type FxSink } from './fx';
import { drawPreciseWeaponDecal } from './art/decalSystem';
import { SNOWBALL_MAG_SIZE } from './art/guns2';
import { drawMaterialTrail } from './art/projectileTrails';
import { drawClassicBeam, drawLaserBeam, drawVoidTether } from './art/beamEffects';
import { getGunEffect } from './art/gunVariants';
import { drawWetSurface } from './art/waterSurface';
import { drawFace, STYLE_COLORS, type Style } from './faces';
import { drawGun, drawProjectile, WEAPONS, getWeapon, type Weapon, type WeaponId, type ProjKind } from './weapons';
import { drawStar, drawRockFragment } from './art/boulder';
import { DiamondRock, drawRockDiamond, type BrokenRockCell } from './art/diamondRock';
import { drawBonusCoin, TreasureChest } from './art/bonusArt';
import { advanceTreasureCoins, throwTreasureCoins, type TreasureCoin } from './treasureShower';
import { drawBreakerCoin } from '../../shared/coinArt';
import { getBossDef, type BossType } from './bossRoster';
import { drawBossProjectile } from './bossProjectileArt';
import { getExactBossRadius, onBossAssetsLoaded } from './bossAssetProcessor';

export const W = 420;
export const H = 760;
const CX = W / 2;
const CY = 255;
const SPECIAL_CY = 282; // Give the full-size Diamond Breaker rock room below the HUD.
const ROCK_RADIUS = 166; // ~80% of the 420px screen, as on Diamond Breaker's 480px screen.
const TWIN_SPACING = 30; // dual lebih rapat: 60px antar laras (dulu 92px)
const SINGLE_BARREL = [0] as const;
const TWIN_BARRELS = [-TWIN_SPACING, TWIN_SPACING] as const;
const CLASSIC_COIN_RADIUS = 13.5 * 1.2; // compact original coin, enlarged only 20%
const CLASSIC_DIAMOND_SCALE = 1.2;
const TOTAL_LEN = 42; // total standard bullet length
const EMBED = 21; // tertancap setengah (50% masuk ke dalam)
const L = TOTAL_LEN - EMBED; // hanya terlihat setengah (50% di luar)
const BLEN = TOTAL_LEN;
// projectile speed depends on weapon
const GUN_Y = H - 185; // muzzle tip
const TAU = Math.PI * 2;
const SPIKE_LEN = 28;
export const BOARD_OBSTACLE_SCALE = 2;
export const SPIKE_SCALE = BOARD_OBSTACLE_SCALE;

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** Keep the sandal's chunky silhouette at full size even if a mini-shot buff is active. */
export function projectileSizeMultiplier(kind: WeaponId, mini: boolean, giant: boolean) {
  if (kind === 'sandal' && mini) return giant ? 1.8 : 1;
  return mini ? 0.65 : giant ? 1.8 : 1;
}

/** Preserve the normal Nail Gun size; only the weapon's existing charge buff enlarges shots. */
export function embeddedProjectileScale(big = 0) {
  return big ? 1 + big * 0.3 : 1;
}

/** Convert each weapon's visible shot width into the rock's local hit radius. */
export function diamondCoreProjectileRadius(weaponHalf: number, shotScale: number, rockScale: number) {
  return Math.max(6, weaponHalf * shotScale / Math.max(0.1, rockScale));
}

/** Bosses turn 20% faster while keeping the same readable reversal rhythms. */
export function bossRotationSpeed(type: BossType, levelTime: number) {
  switch (type) {
    case 'knight': return (Math.floor(levelTime / 7) % 2 === 0 ? 1.65 : -1.65) * 1.2;
    case 'oni': return (Math.floor(levelTime / 5) % 2 === 0 ? -2.05 : 2.05) * 1.2;
    case 'cyborg': return 1.9 * Math.cos(levelTime * 0.82) * 1.2;
    case 'pirate': return 2.1 * Math.cos(levelTime * 0.52 + 0.3) * 1.2;
  }
}

const BOSS_RISE_HEIGHT = 58;
const BOSS_MOVE_CYCLE = 10;
const smooth01 = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

/** Rises smoothly, pauses at the high position, then returns and rests for strategy time. */
export function bossRiseOffset(levelTime: number) {
  const phase = ((levelTime % BOSS_MOVE_CYCLE) + BOSS_MOVE_CYCLE) % BOSS_MOVE_CYCLE;
  if (phase < 2) return 0;
  if (phase < 3.3) return BOSS_RISE_HEIGHT * smooth01((phase - 2) / 1.3);
  if (phase < 4.6) return BOSS_RISE_HEIGHT;
  if (phase < 5.9) return BOSS_RISE_HEIGHT * (1 - smooth01((phase - 4.6) / 1.3));
  return 0;
}

/** Shorter intervals make bosses fire about 30% more often without bunching shots. */
export function bossFireInterval(baseInterval: number, jitter = 0) {
  return Math.max(1.05, baseInterval * 0.7 + jitter);
}

const norm = (a: number) => ((a % TAU) + TAU) % TAU;
const angDiff = (a: number, b: number) => {
  let d = norm(a - b);
  if (d > Math.PI) d = TAU - d;
  return d;
};
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const FIRE_SFX: Record<WeaponId, () => void> = {
  pistol: sfx.shoot, ak47: sfx.shootAk, plasma: sfx.shootPlasma, laser: sfx.shootLaser,
  cricket: sfx.shootCricket, electro: sfx.shootElectro, nail: sfx.shootNail, fish: sfx.shootFish,
  crossbow: sfx.shootCrossbow, bazooka: sfx.shootBazooka, rpg: sfx.shootRpg, freeze: sfx.shootFreeze,
  golden: sfx.shootGolden, blackhole: sfx.shootBlackHole,
  shotgun: sfx2.shotgun, sniper: sfx2.sniper, minigun: sfx2.minigun, railgun: sfx2.railgun,
  flamethrower: sfx2.flame, disc: sfx5.disc, slingshot: sfx2.slingshot, blowgun: sfx2.blowgun,
  bamboo: sfx2.bamboo, banana: sfx2.banana, portal: sfx2.portal, magnet: sfx2.magnet, bubble: sfx2.bubble,
  chrono: sfx2.chrono, shrink: sfx2.shrink, grow: sfx2.grow, harpoon: sfx2.harpoon, soaker: sfx2.soaker,
  snowball: sfx2.snowball, pirate: sfx2.pirate, chicken: sfx2.chicken, card: sfx2.card, confetti: sfx2.confetti,
  sonic: sfx2.sonic, seed: sfx2.seed, glitch: sfx2.glitch, dragon: sfx2.dragon, mirror: sfx2.mirror,
  gravity: sfx2.gravity, pizza: sfx2.pizza,
  honey: sfx3.honey, coconut: sfx3.coconut, angklung: sfx3.angklung, bee: sfx3.bee, ink: sfx3.ink, yoyo: sfx3.yoyo,
  sakura: sfx3.sakura, acid: sfx3.acid, keris: sfx3.keris, tornado: sfx3.tornado, firework: sfx3.firework, anchor: sfx3.anchor,
  shark: sfx3.shark, ghost: sfx3.ghost, ufo: sfx3.ufo, rainbow: sfx3.rainbow, meteor: sfx3.meteor, diamond: sfx3.diamond,
  moonbeam: sfx3.moonbeam, storm: sfx3.storm,
  obliterator: sfx4.obliterator, buster: sfx4.busterSmall, paintball: sfx4.paintball, holy: sfx4.holy, beerifle: sfx4.beeRifle,
  emerald: sfx4.emerald, ruby: sfx4.ruby, sapphire: sfx4.sapphire, crystal: sfx4.crystal, unicorn: sfx4.unicorn,
  pencil: sfx4.pencil, sandal: sfx4.sandal, wand: sfx4.wand,
  bit8: sfx5.bit8, coingun: sfx5.coinGun, kunai: sfx5.kunai, blaster: sfx5.blaster,
  lone_star: sfx6.revolver, photon_saber: sfx6.saberShoot, plasma_repeater: sfx6.blaster,
  warp_disruptor: sfx6.superlaser, deflector_shield: sfx6.shield, gauntlet_cannon: sfx6.gauntlet,
  alien_ray: sfx6.alien, pulse_rifle: sfx6.pulse, cryo_blaster: sfx6.cryo, hyperdrive: sfx6.hyper,
  quantum_destabilizer: sfx6.quantum,
};
const HIT_SFX: Partial<Record<WeaponId, () => void>> = {
  disc: sfx5.discHit, bit8: sfx5.bit8Hit, coingun: sfx.coin, kunai: sfx2.metal, blaster: sfx5.blasterHit,
  lone_star: sfx6.revolverHit, photon_saber: sfx6.saberHit, plasma_repeater: sfx6.blasterHit,
  warp_disruptor: sfx6.superlaserHit, deflector_shield: sfx6.shieldHit, gauntlet_cannon: sfx6.gauntletHit,
  alien_ray: sfx6.alienHit, pulse_rifle: sfx6.pulseHit, cryo_blaster: sfx6.cryoHit, hyperdrive: sfx6.hyperHit,
  quantum_destabilizer: sfx6.quantumHit,
  chicken: sfx2.squeak, bubble: sfx2.pop, card: sfx2.card, snowball: sfx2.thud, soaker: sfx2.splat,
  pizza: sfx2.splat, banana: sfx2.splat, seed: sfx2.seed, slingshot: sfx2.thud, pirate: sfx2.crash,
  mirror: sfx2.metal, portal: sfx2.warp, glitch: sfx2.glitch, chrono: sfx2.ding, magnet: sfx2.metal,
  shrink: sfx2.shrink, grow: sfx2.grow, sonic: sfx2.sonic, gravity: sfx2.gravity, railgun: sfx.zap,
  honey: sfx2.splat, coconut: sfx3.coconutHit, bee: sfx3.sting, ink: sfx2.splat, yoyo: sfx3.bloop, sakura: sfx3.chime,
  acid: sfx3.sizzle, keris: sfx2.metal, tornado: sfx2.boomerang, anchor: sfx3.clank, shark: sfx3.chomp, ghost: sfx3.wail,
  ufo: sfx.zap, rainbow: sfx3.chime, diamond: sfx3.chime, moonbeam: sfx3.chime, storm: sfx3.thunder,
  obliterator: sfx4.obliteratorHit, paintball: sfx4.paintSplat, holy: sfx4.purify, emerald: sfx3.chime, ruby: sfx2.metal,
  sapphire: sfx.ice, crystal: sfx4.shatter, unicorn: sfx4.magic, pencil: sfx4.scribble, sandal: sfx4.plak, wand: sfx4.magic,
};
const PAINT = ['244,63,94', '250,204,21', '34,211,238', '168,85,247', '74,222,128', '251,146,60'];

type ItemType = 'bullet' | 'old' | 'spike' | 'coin' | 'diamond_chest';
interface Item { angle: number; type: ItemType; age: number; w?: WeaponId; scale?: number; vel?: number; harvested?: boolean; tint?: string; big?: number; hits?: number }
interface Proj { x: number; y: number; vx: number; vy: number; originX?: number; pierced?: number; hist?: { x: number; y: number }[]; tint?: string; big?: number; mini?: boolean; giant?: boolean }
type StepRes = { res: 'none' | 'stick' | 'fail' | 'hit'; spike?: boolean; local?: number };
interface Light { x: number; y: number; r: number; rgb: string; life: number; max: number }
interface Fragment { x: number; y: number; vx: number; vy: number; rot: number; vr: number; a0: number; a1: number }
interface Flyer { x: number; y: number; vx: number; vy: number; rot: number; vr: number; kind: ItemType; w?: WeaponId }
interface Beam { x: number; y: number; life: number; max: number; rgb: string }
interface Portal { x: number; y: number; life: number; max: number; rgb: string }
interface BossProjectile { x: number; y: number; vx: number; vy: number; rot: number; type: BossType }

interface RockFragment { x: number; y: number; vx: number; vy: number; rot: number; vr: number; size: number; seed: number; life: number; max: number }
/** Coordinates and angle are local to a rock cell (or to the open chest). */
interface EmbeddedShot { x: number; y: number; angle: number; age: number; w: WeaponId; scale: number; big: number; tint?: string; cellId?: number }
interface FallingCell { id: number; cx: number; cy: number; x: number; y: number; vx: number; vy: number; rot: number; vr: number; life: number; bullets: EmbeddedShot[] }
interface Star { x: number; y: number; r: number; vx: number; baseY: number; age: number; life: number; max: number }
interface BonusCoin { angle: number; radius: number; phase: number; taken: boolean }
export type TreasureBuff = 'rapid' | 'double' | 'mini' | 'giant';
export type BuffKind = 'speed' | 'ammo' | 'power' | TreasureBuff;
export type SpecialMode = 'bonus' | 'treasure';
export type LevelMode = 'classic' | 'boulder' | 'double' | SpecialMode;

const STAGE_SECONDS: Record<'boulder' | SpecialMode, number> = { boulder: 65, bonus: 45, treasure: 10 };
const isSpecial = (mode: LevelMode): mode is 'boulder' | SpecialMode => mode === 'boulder' || mode === 'bonus' || mode === 'treasure';

/** Star power-ups are reserved for bosses and special/bonus stages. */
export function allowsStarPowerups(level: Pick<LevelCfg, 'boss' | 'mode'>) {
  return level.boss || isSpecial(level.mode);
}

type PatternName = 'constant' | 'wave' | 'pendulum' | 'stopgo' | 'jerk' | 'chaos';
const PATTERNS: Record<PatternName, (t: number, b: number, d: number) => number> = {
  constant: (_t, b, d) => b * d,
  wave: (t, b, d) => b * d * (0.3 + 1.4 * (0.5 + 0.5 * Math.sin(t * 1.5))),
  pendulum: (t, b, d) => b * 1.7 * d * Math.sin(t * 1.0),
  stopgo: (t, b, d) => {
    const p = (t % 2.0) / 2.0;
    const s = p < 0.55 ? 1.6 : p < 0.72 ? 1.6 * (1 - (p - 0.55) / 0.17) : 0.04;
    return b * d * s;
  },
  jerk: (t, b, d) => {
    const k = Math.floor(t / 1.7);
    const dd = k % 2 === 0 ? 1 : -1;
    const p = (t % 1.7) / 1.7;
    return b * d * dd * (0.5 + 1.5 * Math.pow(Math.sin(p * Math.PI), 2));
  },
  chaos: (t, b, d) => b * d * (Math.sin(t * 1.1) * 1.4 + Math.sin(t * 2.7 + 1) * 0.75 + 0.35),
};

export interface LevelCfg {
  mode: LevelMode; hp: number; maxHp: number;
  n: number; boss: boolean; ammo: number; base: number; pattern: PatternName; dir: number;
  radius: number; style: Style; name: string; old: number; spikes: number; coins: number;
}

const BOSS_NAMES = ['DARK KNIGHT', 'ONI DEMON', 'MECHA CYBORG', 'PIRATE LORD'];
const BOSS_STYLES: Style[] = ['knight', 'oni', 'cyborg', 'pirate'];
const WORLD_STYLES: Style[] = ['orange', 'wood', 'target'];
const PRAISE = ['MANTAP!', 'KEREN!', 'SEMPURNA!', 'GACOR!', 'JAGO!', 'LUAR BIASA!'];

export function makeLevel(n: number, forcedMode?: LevelMode): LevelCfg {
  const boss = n % 5 === 0;
  const world = Math.floor((n - 1) / 5);
  const base = Math.min(1.5 + n * 0.11, 4.3);
  let pattern: PatternName;
  if (n <= 2) pattern = 'constant';
  else if (boss) pattern = n === 5 ? 'wave' : n >= 15 ? pick<PatternName>(['chaos', 'jerk']) : pick<PatternName>(['jerk', 'stopgo', 'chaos']);
  else {
    const pool: PatternName[] = ['constant', 'wave', 'pendulum'];
    if (n >= 6) pool.push('stopgo');
    if (n >= 11) pool.push('jerk');
    if (n >= 16) pool.push('chaos');
    pattern = pick(pool);
  }
  const regularAmmo = Math.min(5 + Math.floor(n * 0.5), 13);
  // Double the boss shot quota so the fight can sustain exactly twice the HP without an early ammo clear.
  const ammo = boss ? (regularAmmo + 2) * 2 : regularAmmo;
  const bossIdx = Math.floor(n / 5) - 1;
  const style: Style = boss ? BOSS_STYLES[Math.max(0, bossIdx) % BOSS_STYLES.length] : WORLD_STYLES[world % WORLD_STYLES.length];
  // Boss DARK KNIGHT tampil bersih: tanpa duri jebakan & penghalang (peluru berkarat).
  const cleanKnight = boss && style === 'knight';
  const old = cleanKnight ? 0 : n < 2 ? 0 : Math.min(1 + Math.floor((n - 2) / 3), 5);
  // Boss selalu memiliki duri mematikan yang DILARANG DITEMBAK!
  const spikes = cleanKnight
    ? 0
    : boss
    ? Math.min(5, 2 + Math.floor(n / 5)) // 2 sampai 5 duri jebakan mematikan di kepala boss!
    : n < 4
    ? 0
    : Math.min(1 + Math.floor((n - 4) / 4), 4);
  const coins = (Math.random() < 0.65 ? 1 : 0) + (Math.random() < 0.3 ? 1 : 0);
  // Each five-stage boss cycle is three ordinary stages, one random special,
  // then a boss: stages 4, 9, 14... use exactly one of the three special modes.
  const mode: LevelMode = forcedMode ?? (boss ? 'classic'
    : n % 5 === 4 ? pick<LevelMode>(['boulder', 'bonus', 'treasure'])
    : 'classic');
  return {
    n, boss, ammo: isSpecial(mode) ? 12 : ammo, base, pattern, dir: Math.random() < 0.5 ? 1 : -1,
    radius: boss ? 122 : mode === 'boulder' || mode === 'bonus' ? ROCK_RADIUS : 106, style,
    name: boss ? BOSS_NAMES[Math.max(0, bossIdx) % BOSS_NAMES.length] : '',
    old: isSpecial(mode) ? 0 : old, spikes: isSpecial(mode) ? 0 : spikes, coins: isSpecial(mode) ? 0 : coins,
    mode, hp: 0, maxHp: 0, // populated from the actual number of breakable chunks
  };
}

export interface GameEvents {
  onGameOver: (score: number, level: number, coinsToBank: number, runCoins: number) => void;
  onBossDefeated?: (bossName: string, level: number, coinsEarned: number, bossType: BossType) => void;
  /** The treasure counter and saved balance both grow as each flying coin reaches the HUD. */
  onTreasureCoin?: (amount: number) => void;
  /** Bank any remaining special-stage reward at its end, exactly once. */
  onStageReward?: (mode: 'boulder' | SpecialMode, level: number, unbankedCoins: number, diamondReward: number) => void;
  /** Separate shop-diamond currency, awarded by the boulder core and small diamond pickups. */
  onDiamondCollected?: (amount: number, large: boolean, origin: { x: number; y: number }) => void;
  /** Called on successful standard-stage clears for the UI's short sunburst celebration. */
  onStageCleared?: (level: number, boss: boolean, origin: { x: number; y: number }) => void;
  /** Called whenever a new level begins so transient HUD modes can reset. */
  onStageChange?: () => void;
  onStarHit?: (treasure: boolean) => void;
  onShotFired?: (count: number) => void;
}

type State = 'idle' | 'intro' | 'play' | 'clear' | 'fail' | 'over';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private events: GameEvents;
  private scale = 1;
  private dpr = 1;
  private raf = 0;
  private last = 0;
  private active = false;
  private hasRendered = false;

  state: State = 'idle';
  level: LevelCfg;
  private rot = 0;
  private levelTime = 0;
  private items: Item[] = [];
  private projs: Proj[] = [];
  private particles: Particle[] = [];
  private frags: Fragment[] = [];
  private flyers: Flyer[] = [];
  private ammoLeft = 0;
  private stuck = 0;
  score = 0;
  coins = 0;
  private combo = 0;
  private comboPop = 0;
  private lastHit = -10;
  private shake = 0;
  private flashWhite = 0;
  private flashRed = 0;
  private timeScale = 1;
  private bump = 0;
  private hitFlash = 0;
  private introT = 0;
  private stateT = 0;
  private recoil = 0;
  private muzzle = 0;
  private cooldown = 0;
  private face!: HTMLCanvasElement;
  private faceCtx!: CanvasRenderingContext2D;
  private faceScale = 2;
  private time = 0;
  private bannerT = 0;
  private dust: { x: number; y: number; s: number; v: number; a: number }[] = [];
  private failProjAngle = 0;
  weapon: Weapon = WEAPONS[0];
  private holding = false;
  private beams: Beam[] = [];
  private slowT = 0;
  private slowF = 0.3;
  private slowRgb = '170,230,255';
  private slowKind: 'ice' | 'water' | 'honey' | 'time' = 'ice';
  private aiming = false;
  private aimT = 0;
  private spin = 0;
  private savesLeft = 0;
  private perkCount = 0;
  private burnT = 0;
  private burnTick = 0;
  private spikeOffT = 0;
  private targetR = 0;
  private faceR = 106;
  private portals: Portal[] = [];
  private glitchT = 0;
  private rockFragments: RockFragment[] = [];
  private rockBullets: EmbeddedShot[] = [];
  private fallenCells: FallingCell[] = [];
  private chestBullets: EmbeddedShot[] = [];
  private treasureCoins: TreasureCoin[] = [];
  private stageRewardPaid = false;
  private lastCoinSound = -10;
  private coinPulse = 0;
  private rock: DiamondRock | null = null;
  private bonusCoins: BonusCoin[] = [];
  private chest: TreasureChest | null = null;
  private stageTime = 0;
  private reloadT = 0;
  private snowLoaded = SNOWBALL_MAG_SIZE;
  private stageStartCoins = 0;
  private bankedCoins = 0;
  private diamondPing = 0;
  private centerDiamondCollected = false;
  private centerDiamondHits = 0;
  private diamondHoldUntil = 0;
  private choosingBuff = false;
  private buff: 'speed' | 'ammo' | 'power' | 'double' | null = null;
  private treasureBuff: TreasureBuff | null = null;
  private twinGuns = false;
  private star: Star | null = null;
  private starTimer = 6;
  private speedMult = 1;
  private dmgMult = 1;
  private maxAmmoMult = 1;
  private bossProjs: BossProjectile[] = [];
  private bossShootTimer = 1.6;
  private bossHp = 100;
  private bossMaxHp = 100;
  private bossHpRed = 100; // Tekken-style ghost damage gauge
  private lights: Light[] = [];
  private rt = 0;
  private lastShotRT = -9;
  private charging = false;
  private chargeT = 0;
  private chargeLevel = 0;
  private chargeStage = 0;
  private lastPaint = '';
  private stretchPlayed = true;
  private hitStop = 0;
  private camY = 0;
  private tintA = 0;
  private tintRgb = '255,255,255';
  private sink: FxSink = {
    push: (p: Particle) => {
      if (this.particles.length < 1100 || p.kind === 'text') this.particles.push(p);
    },
    light: (x, y, r, rgb, life) => {
      if (this.lights.length < 24) this.lights.push({ x, y, r, rgb, life, max: life });
    },
  };

  setWeapon(id: WeaponId) {
    this.weapon = getWeapon(id);
    this.aiming = false;
    this.spin = 0;
    // A newly equipped cannon starts with no more balls than the level's
    // remaining ammo; changing guns never grants additional stage shots.
    if (id === 'snowball') this.snowLoaded = this.state === 'idle'
      ? SNOWBALL_MAG_SIZE : Math.min(SNOWBALL_MAG_SIZE, this.ammoLeft);
  }

  private get targetY() {
    if (isSpecial(this.level.mode)) return SPECIAL_CY;
    return CY - (this.level.boss ? bossRiseOffset(this.levelTime) : 0);
  }
  private get hasTwinGuns() { return this.level.mode === 'double' || this.twinGuns; }
  private get gunOffsets(): readonly number[] { return this.hasTwinGuns ? TWIN_BARRELS : SINGLE_BARREL; }

  constructor(canvas: HTMLCanvasElement, events: GameEvents) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.events = events;
    this.level = makeLevel(1);
    this.events.onStageChange?.();
    this.level.style = 'orange';
    this.buildFace();
    this.placeObstacles();
    for (let i = 0; i < 45; i++) {
      this.dust.push({ x: Math.random() * W, y: Math.random() * H, s: rand(0.6, 2.2), v: rand(6, 22), a: rand(0.1, 0.5) });
    }
    this.resize();
    window.addEventListener('resize', this.resize);
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('pointerdown', this.onPointer);
    window.addEventListener('pointerup', this.onRelease);
    window.addEventListener('pointercancel', this.onRelease);
    window.addEventListener('blur', this.onRelease);
    // Paint a still frame for inactive slides; start the simulation only on focus.
    this.render();
    this.hasRendered = true;
    onBossAssetsLoaded(() => {
      if (this.level.boss) {
        this.buildFace();
      }
    });
  }

  setActive(active: boolean) {
    if (this.active === active) return;
    this.active = active;
    if (active) {
      // Discard elapsed time while unfocused; never fast-forward a level or timer.
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.loop);
    } else {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      // A held mouse/key must not resume firing when this slide is selected again.
      this.holding = false;
      this.aiming = false;
      this.charging = false;
    }
  }

  destroy() {
    this.setActive(false);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('keyup', this.onKeyUp);
    this.canvas.removeEventListener('pointerdown', this.onPointer);
    window.removeEventListener('pointerup', this.onRelease);
    window.removeEventListener('pointercancel', this.onRelease);
    window.removeEventListener('blur', this.onRelease);
  }

  private onRelease = () => {
    this.holding = false;
    this.releaseScope();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
      this.holding = false;
      this.releaseScope();
    }
  };

  private press() {
    if (this.choosingBuff) return;
    this.holding = true;
    if (this.weapon.scope) {
      if (this.state === 'play' && this.cooldown <= 0 && this.ammoLeft > 0 && !this.aiming) {
        this.aiming = true;
        this.aimT = 0;
        sfx2.scope();
      }
      return;
    }
    if (this.weapon.spinup) {
      if (this.state === 'play' && this.spin < 0.1) sfx2.spinUp();
      return;
    }
    if (this.weapon.charge) {
      if (this.state === 'play' && this.cooldown <= 0 && this.ammoLeft > 0 && !this.charging) {
        this.charging = true;
        this.chargeT = 0;
        this.chargeStage = 0;
      }
      return;
    }
    this.shoot();
  }

  private releaseScope() {
    if (this.charging) {
      this.charging = false;
      this.chargeLevel = this.chargeT >= 1 ? 2 : this.chargeT >= 0.35 ? 1 : 0;
      this.chargeT = 0;
      this.shoot();
      this.chargeLevel = 0;
      return;
    }
    if (!this.aiming) return;
    this.aiming = false;
    this.shoot();
  }

  private resize = () => {
    this.scale = 1;
    // Cap the backing store: a 420×760 game remains crisp at 2× without
    // rasterizing the costly canvas effects at 2.5–3× on mobile devices.
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.style.width = `${W}px`;
    this.canvas.style.height = `${H}px`;
    this.canvas.width = Math.round(W * this.dpr);
    this.canvas.height = Math.round(H * this.dpr);
    // Resizing clears the backing store. Restore a single still frame even
    // if the game is paused rather than leaving an empty thumbnail.
    if (this.hasRendered && !this.active) this.render();
  };

  private onKey = (e: KeyboardEvent) => {
    if (!this.active) return;
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'Enter') {
      if (this.state === 'play' || this.state === 'intro') {
        e.preventDefault();
        if (e.repeat) return;
        this.press();
      }
    }
  };

  private onPointer = (e: PointerEvent) => {
    e.preventDefault();
    // Cek tap pada bintang power-up lebih dulu
    if (this.star) {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * W;
      const y = (e.clientY - rect.top) / rect.height * H;
      if (this.tryTapStar(x, y)) return;
    }
    this.press();
  };

  private startRun(level: number, forcedMode?: LevelMode) {
    sfx.unlock();
    sfx.start();
    this.score = 0;
    this.coins = 0;
    this.bankedCoins = 0;
    this.particles = [];
    this.frags = [];
    this.flyers = [];
    this.loadLevel(level, forcedMode);
  }

  start() { this.startRun(1); }

  /** Start an existing SGA level directly from the level map without changing its stage rules. */
  startAtLevel(level: number) { this.startRun(Math.max(1, Math.floor(level))); }

  /** Menu shortcuts enter the same real, playable levels as the Arcade progression. */
  startSpecialStage(mode: 'boulder' | SpecialMode) { this.startRun(4, mode); }

  toIdle() {
    this.state = 'idle';
    this.snowLoaded = SNOWBALL_MAG_SIZE;
    this.level = makeLevel(1);
    this.events.onStageChange?.();
    this.level.style = 'orange';
    this.items = [];
    this.projs = [];
    this.bossProjs = [];
    this.rock = null;
    this.chest = null;
    this.bonusCoins = [];
    this.rockBullets = [];
    this.fallenCells = [];
    this.chestBullets = [];
    this.treasureCoins = [];
    this.stageRewardPaid = false;
    this.coinPulse = 0;
    this.rockFragments = [];
    this.choosingBuff = false;
    this.twinGuns = false;
    this.star = null;
    this.placeObstacles();
    this.buildFace();
  }

  continueAfterBoss() { this.loadLevel(this.level.n + 1); }

  startBossChallenge() { this.startRun(5); }

  applyBuff(kind: BuffKind) {
    if (!this.choosingBuff) return;
    if (!allowsStarPowerups(this.level)) {
      // Stale UI/input must never grant normal-stage star effects or leave play paused.
      this.choosingBuff = false;
      this.holding = false;
      this.aiming = false;
      this.aimT = 0;
      this.charging = false;
      this.chargeT = 0;
      this.chargeLevel = 0;
      gunState.charge = 0;
      return;
    }
    if (this.level.mode === 'treasure') {
      const treasureKinds: TreasureBuff[] = ['rapid', 'double', 'mini', 'giant'];
      this.treasureBuff = treasureKinds.includes(kind as TreasureBuff) ? kind as TreasureBuff : 'rapid';
    } else {
      const normalKinds = ['speed', 'ammo', 'power', 'double'] as const;
      const selected = normalKinds.includes(kind as typeof normalKinds[number])
        ? kind as typeof normalKinds[number] : 'speed';
      this.buff = selected;
      if (selected === 'ammo') {
        this.maxAmmoMult = 2;
        this.ammoLeft += this.level.ammo;
        if (this.weapon.id === 'snowball' && this.snowLoaded === 0 && this.reloadT === 0) this.reloadT = 0.85;
      }
      if (selected === 'power') this.dmgMult = 2;
    }
    if (kind === 'double') this.twinGuns = true;
    // Always release paused input state after a choice. This is particularly
    // important for boss fights and scoped/charged weapons interrupted by a star.
    this.choosingBuff = false;
    this.holding = false;
    this.aiming = false;
    this.aimT = 0;
    this.charging = false;
    this.chargeT = 0;
    this.chargeLevel = 0;
    gunState.charge = 0;
    sfx4.magic();
  }

  drawGunNowDirect(c: CanvasRenderingContext2D, id: WeaponId, cx: number, y0: number, t: number) {
    drawGun(c, id, cx, y0, t, 0, true);
  }

  /** Cek apakah tap mengenai bintang */
  tryTapStar(x: number, y: number): boolean {
    if (!this.star) return false;
    const s = this.star;
    if (Math.hypot(x - s.x, y - s.y) <= s.r * 1.35) {
      // The pickup moves; the weapon stays upright before and after selection.
      this.hitStar();
      return true;
    }
    return false;
  }

  private spawnFloatingStar() {
    if (!allowsStarPowerups(this.level)) return;
    const bottom = this.targetY + this.level.radius;
    const midGap = (bottom + GUN_Y) / 2;
    const baseY = Math.min(GUN_Y - 75, Math.max(bottom + 48, midGap + rand(-18, 18)));
    const fromLeft = Math.random() < 0.5;
    this.star = {
      x: fromLeft ? -40 : W + 40, y: baseY, baseY,
      vx: (fromLeft ? 1 : -1) * rand(125, 155), r: 26,
      age: 0, life: 6, max: 6,
    };
    sfx2.scope();
  }

  private hitStar() {
    if (!this.star || !allowsStarPowerups(this.level)) return;
    const s = this.star;
    this.star = null;
    this.holding = false;
    this.aiming = false;
    this.aimT = 0;
    this.charging = false;
    this.chargeT = 0;
    this.chargeLevel = 0;
    gunState.charge = 0;
    this.projs = [];
    this.choosingBuff = true;
    sfx4.magic();
    this.flashWhite = Math.max(this.flashWhite, 0.35);
    this.sink.light(s.x, s.y, 220, '250,204,21', 0.6);
    this.sink.push({ x: s.x, y: s.y, vx: 0, vy: 0, life: 0.45, max: 0.45, size: 90, color: '250,204,21', kind: 'shock', rot: 0, vr: 0, g: 0 });
    for (let i = 0; i < 30; i++) {
      const a = rand(0, TAU);
      const v = rand(150, 520);
      this.sink.push({ x: s.x, y: s.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.4, 0.9), max: 0.9, size: rand(3, 7), color: pick(['#fde047', '#ffffff', '#fbbf24']), kind: 'star', rot: 0, vr: 0, g: 0, drag: 2 });
    }
    this.addText('★ POWER UP!', s.x, s.y - 40, '#fde047', 26);
    this.events.onStarHit?.(this.level.mode === 'treasure');
  }

  private loadLevel(n: number, forcedMode?: LevelMode) {
    this.level = makeLevel(n, forcedMode);
    this.events.onStageChange?.();
    this.items = [];
    this.projs = [];
    this.rockFragments = [];
    this.rockBullets = [];
    this.fallenCells = [];
    this.chestBullets = [];
    this.treasureCoins = [];
    this.stageRewardPaid = false;
    this.coinPulse = 0;
    this.rock = this.level.mode === 'boulder' || this.level.mode === 'bonus' ? new DiamondRock() : null;
    this.chest = this.level.mode === 'treasure' ? new TreasureChest() : null;
    this.bonusCoins = this.level.mode === 'bonus' ? this.buildBonusCoins() : [];
    this.stageTime = isSpecial(this.level.mode) ? STAGE_SECONDS[this.level.mode] : 0;
    this.stageStartCoins = this.coins;
    this.reloadT = 0;
    this.diamondPing = 0;
    this.centerDiamondCollected = false;
    this.centerDiamondHits = 0;
    this.diamondHoldUntil = 0;
    this.choosingBuff = false;
    this.buff = null;
    this.treasureBuff = null;
    this.twinGuns = false;
    this.star = null;
    // Only bosses and special/bonus stages get a star; treasure gets it early.
    this.starTimer = !allowsStarPowerups(this.level) ? Infinity
      : this.level.mode === 'treasure' ? 2.2 : 5 + Math.random() * 3;
    this.speedMult = 1;
    this.dmgMult = 1;
    this.maxAmmoMult = 1;
    this.level.maxHp = this.rock?.total ?? 0;
    this.level.hp = this.rock?.remaining ?? 0;
    this.placeObstacles();
    this.ammoLeft = this.level.ammo;
    this.snowLoaded = Math.min(SNOWBALL_MAG_SIZE, this.ammoLeft);
    this.stuck = 0;
    this.combo = 0;
    // Boss (kepala bos) tampil tegak dan TIDAK berputar seperti papan target biasa.
    this.rot = this.level.boss ? 0 : rand(0, TAU);
    this.levelTime = 0;
    this.state = 'intro';
    this.introT = 0;
    this.bannerT = 1.8;
    this.timeScale = 1;
    this.slowT = 0;
    this.savesLeft = this.weapon.saves ?? 0;
    this.perkCount = 0;
    this.burnT = 0;
    this.spikeOffT = 0;
    this.targetR = 0;
    this.aiming = false;
    this.portals = [];
    this.bossProjs = [];
    this.bossShootTimer = 1.8;
    if (this.level.boss) {
      this.bossMaxHp = this.level.ammo * 10;
      this.bossHp = this.bossMaxHp;
      this.bossHpRed = this.bossMaxHp;
    }
    if (!isSpecial(this.level.mode)) this.buildFace();
    if (this.level.boss) sfx.boss();
    else if (n > 1) sfx.level();
  }

  private buildBonusCoins(): BonusCoin[] {
    const coins: BonusCoin[] = [];
    for (const { radius, count } of [
      { radius: 96, count: 12 }, { radius: 132, count: 16 }, { radius: 168, count: 20 },
    ]) {
      for (let i = 0; i < count; i++) {
        coins.push({ angle: i * TAU / count, radius, phase: rand(0, TAU), taken: false });
      }
    }
    return coins;
  }

  private placeObstacles() {
    if (isSpecial(this.level.mode)) return;
    const place = (type: ItemType, count: number, sep: number) => {
      for (let i = 0; i < count; i++) {
        for (let t = 0; t < 300; t++) {
          const a = rand(0, TAU);
          if (this.items.every((it) => angDiff(it.angle, a) > sep)) {
            this.items.push({ angle: a, type, age: 10,
              scale: type === 'old' ? BOARD_OBSTACLE_SCALE : undefined });
            break;
          }
        }
      }
    };
    place('spike', this.level.spikes, 0.45);
    place('old', this.level.old, 0.4);
    place('coin', this.level.coins, 0.32);
    // Berlian / Diamond tertancap di arena yang butuh 2x tembakan baru jatuh!
    // (Dark Knight: penghalang berlian juga dihilangkan.)
    const cleanKnight = this.level.boss && this.level.style === 'knight';
    if (!cleanKnight && this.level.n >= 2 && Math.random() < 0.6) {
      place('diamond_chest', 1, 0.42);
    }
  }

  private buildFace() {
    const R = this.level.radius;
    const S = this.faceScale;
    const pad = this.level.boss ? 40 : 4;
    const size = (R + pad) * 2;
    const cv = document.createElement('canvas');
    cv.width = cv.height = size * S;
    const c = cv.getContext('2d')!;
    c.scale(S, S);
    c.translate(R + pad, R + pad);
    drawFace(c, R, this.level.style);
    this.face = cv;
    this.faceCtx = c;
    this.faceR = R;
  }

  private crack(a: number, _tint?: string) {
    const c = this.faceCtx;
    c.save();
    drawPreciseWeaponDecal(c, this.faceR, a, this.weapon, this.level.style);
    c.restore();
  }

  // ---------- actions ----------
  shoot() {
    if (this.state !== 'play' || this.choosingBuff) return;
    if (this.cooldown > 0 || this.ammoLeft <= 0 || this.reloadT > 0) return;
    const w = this.weapon;
    if (w.id === 'snowball' && this.snowLoaded <= 0) return;
    const n = Math.min(w.burst ?? 1, this.ammoLeft);
    this.ammoLeft -= n;
    if (w.id === 'snowball') this.snowLoaded = Math.max(0, Math.min(this.snowLoaded - n, this.ammoLeft));
    this.lastShotRT = this.rt;
    this.stretchPlayed = false;
    gunState.shots++;
    this.events?.onShotFired?.(n);
    const big = w.charge ? this.chargeLevel : 0;
    const tint = w.paint ? pick(PAINT) : undefined;
    const vx = 0; // stars never steer the weapon or its shots
    const vy = -w.speed * this.speedMult;
    const offsets = this.gunOffsets;
    const sizeBuff = { mini: this.treasureBuff === 'mini', giant: this.treasureBuff === 'giant' };
    for (const ox of offsets) {
      if (n === 1) this.projs.push({ x: CX + ox, originX: CX + ox, y: GUN_Y - 4, vx, vy, big, tint, ...sizeBuff });
      else {
        const travel = GUN_Y - (this.targetY + this.level.radius);
        for (let i = 0; i < n; i++) {
          const off = (i - (n - 1) / 2) * 26;
          this.projs.push({ x: CX + ox, originX: CX + ox, y: GUN_Y - 4, vx: vx + (off * w.speed) / travel, vy, big, tint, ...sizeBuff });
        }
      }
    }
    this.recoil = w.recoil;
    this.muzzle = 0.07;
    const fxp = FX[w.id];
    for (const ox of offsets) spawnMuzzle(this.sink, fxp, w, CX + ox, GUN_Y - 6);
    this.camY += fxp.kick * 0.5;
    if (fxp.speedLines) for (const ox of offsets) {
      spawnSpeedLines(this.sink, CX + ox, this.targetY + this.level.radius + 20, GUN_Y - 30, w.trail);
    }
    this.cooldown = (w.spinup ? 0.3 - 0.235 * this.spin : w.cooldown)
      * (this.buff === 'speed' || this.treasureBuff === 'rapid' ? 0.5 : this.treasureBuff === 'mini' ? 0.6 : 1);
    if (isSpecial(this.level.mode) && this.ammoLeft === 0) this.reloadT = 0.65;
    else if (w.id === 'snowball' && this.snowLoaded === 0 && this.ammoLeft > 0) this.reloadT = 0.85;
    if (w.burstFx) {
      const b = w.burstFx;
      for (const ox of offsets) for (let i = 0; i < b.n; i++) {
        const a = rand(-Math.PI * 0.85, -Math.PI * 0.15);
        const v = rand(0.4, 1) * (b.spd ?? 200);
        this.particles.push({
          x: CX + ox + rand(-6, 6), y: GUN_Y - 4, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.35, 0.8), max: 0.8,
          size: b.glow ? rand(3, b.size ?? 6) : rand(2, 4.5), color: pick(b.colors),
          kind: w.id === 'soaker' ? 'waterDrop' : w.id === 'snowball' ? 'snowflake' : b.glow ? 'glow' : 'chip',
          rot: rand(0, TAU), vr: rand(-12, 12), g: b.g ?? 600,
        });
      }
    }
    this.shake = Math.max(this.shake, w.shake);
    if (w.charge && big > 0) {
      if (big === 2) sfx4.busterBig();
      else sfx4.busterMid();
      this.recoil = big === 2 ? 2.4 : 1.4;
      this.shake = Math.max(this.shake, big === 2 ? 9 : 4);
      this.camY += big * 3;
      for (const ox of offsets) {
        const paired = offsets.length > 1;
        this.sink.light(CX + ox, GUN_Y, big === 2 ? (paired ? 220 : 320) : (paired ? 130 : 180), big === 2 ? '254,240,138' : '125,211,252', 0.25);
        this.sink.push({ x: CX + ox, y: GUN_Y - 8, vx: 0, vy: 0, life: 0.4, max: 0.4, size: big === 2 ? (paired ? 105 : 150) : (paired ? 60 : 80), color: '125,211,252', kind: 'shock', rot: 0, vr: 0, g: 0 });
      }
      if (big === 2) for (const ox of offsets) {
        spawnSpeedLines(this.sink, CX + ox, this.targetY + this.level.radius + 20, GUN_Y - 30, '254,240,138');
      }
    } else FIRE_SFX[w.id]();
    if (w.id === 'slingshot') {
      sfx4.slingRelease();
      for (const ox of offsets) {
        for (const s of [-1, 1]) {
          for (let i = 0; i < 4; i++) {
            this.sink.push({ x: CX + ox + s * 24, y: GUN_Y + 6, vx: -s * rand(300, 600), vy: rand(-500, -200), life: 0.12, max: 0.12, size: rand(1, 2), color: 'rgba(255,220,200,0.9)', kind: 'streak', rot: 0, vr: 0, g: 0 });
          }
        }
        for (let i = 0; i < 6; i++) {
          this.sink.push({ x: CX + ox + rand(-10, 10), y: GUN_Y + 10, vx: rand(-80, 80), vy: rand(-60, 10), life: rand(0.4, 0.7), max: 0.7, size: rand(5, 10), color: 'rgba(210,190,160,', kind: 'smoke', rot: 0, vr: 0, g: -20, drag: 2 });
        }
        this.sink.push({ x: CX + ox, y: GUN_Y + 4, vx: 0, vy: 0, life: 0.25, max: 0.25, size: 70, color: '255,230,200', kind: 'shock', rot: 0, vr: 0, g: 0 });
      }
      this.addText('CTAK!', CX + rand(-50, 50), GUN_Y - 20, '#fde68a', 22);
    }
    if (w.id === 'obliterator') {
      this.flashWhite = Math.max(this.flashWhite, 0.2);
      this.tintA = Math.max(this.tintA, 0.25);
      this.tintRgb = '74,222,128';
    }
    if (w.casing) {
      for (const ox of offsets) {
        const side = ox < 0 ? -1 : 1; // cases eject outwards from mirrored guns
        this.particles.push({
          x: CX + ox + side * 16, y: GUN_Y + (w.ejectY ?? 48), vx: side * rand(180, 320), vy: rand(-520, -380), life: 1.1, max: 1.1,
          size: 1, color: w.casing, kind: 'shell', rot: rand(0, TAU), vr: side * rand(15, 28), g: 1600,
        });
      }
    }
    if (!w.energy && !w.noSmoke) {
      const ns = w.backblast || w.id === 'bamboo' || w.id === 'pirate' ? 10 : 4;
      for (const ox of offsets) for (let i = 0; i < ns; i++) {
        this.particles.push({
          x: CX + ox + rand(-6, 6), y: GUN_Y - 6, vx: rand(-50, 50), vy: rand(-90, -30), life: 0.5, max: 0.5,
          size: rand(6, w.backblast ? 18 : 12), color: 'rgba(200,200,200,', kind: 'smoke', rot: 0, vr: 0, g: -20,
        });
      }
    }
    if (w.backblast) {
      for (const ox of offsets) for (let i = 0; i < 14; i++) {
        this.particles.push({
          x: CX + ox + rand(-20, 20), y: H - rand(0, 30), vx: rand(-160, 160), vy: rand(-40, 80), life: rand(0.5, 1), max: 1,
          size: rand(14, 30), color: 'rgba(180,180,180,', kind: 'smoke', rot: 0, vr: 0, g: -40,
        });
        this.particles.push({
          x: CX + ox + rand(-14, 14), y: H - rand(0, 20), vx: rand(-120, 120), vy: rand(-30, 60), life: rand(0.2, 0.4), max: 0.4,
          size: rand(6, 12), color: '255,150,40', kind: 'glow', rot: 0, vr: 0, g: 0,
        });
      }
    }
    if (w.energy && w.id !== 'laser') {
      for (const ox of offsets) {
        this.particles.push({ x: CX + ox, y: GUN_Y + 10, vx: 0, vy: 0, life: 0.3, max: 0.3, size: w.id === 'cricket' ? 110 : 50, color: w.color, kind: 'ring', rot: 0, vr: 0, g: 0 });
        for (let i = 0; i < 10; i++) {
          const a = rand(0, TAU);
          const v = rand(60, 200);
          this.particles.push({
            x: CX + ox, y: GUN_Y + 6, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, life: rand(0.25, 0.5), max: 0.5,
            size: rand(3, 6), color: w.trail, kind: 'glow', rot: 0, vr: 0, g: 0,
          });
        }
      }
    }
    if (w.id === 'cricket') {
      this.flashWhite = Math.max(this.flashWhite, 0.25);
      this.addText('BOOM!', CX + rand(-40, 40), GUN_Y - 40, '#9fd8ff', 26);
    }
    if (w.beam) {
      const by = this.targetY + this.level.radius - 4;
      for (const ox of offsets) {
        this.beams.push({ x: CX + ox, y: by, life: 0.22, max: 0.22, rgb: w.trail });
        for (let i = 0; i < 14; i++) {
          const yy = rand(by, GUN_Y);
          this.sink.push({ x: CX + ox + rand(-3, 3), y: yy, vx: rand(-160, 160), vy: rand(-60, 60), life: rand(0.2, 0.45), max: 0.45, size: rand(2, 4.5), color: w.trail, kind: 'glow', rot: 0, vr: 0, g: 0, drag: 4 });
        }
        const starTrain = w.id === 'moonbeam' && getGunEffect(w.id) === 'new';
        for (let i = 0; i < (starTrain ? 16 : 6); i++) {
          this.sink.push({ x: CX + ox + (starTrain ? rand(-13, 13) : 0),
            y: rand(by, GUN_Y), vx: starTrain ? rand(-35, 35) : 0, vy: 0,
            life: starTrain ? 0.34 : 0.2, max: starTrain ? 0.34 : 0.2,
            size: rand(4, starTrain ? 10 : 7),
            color: starTrain ? pick(['#ffffff', '#e9ddff', '#ffeabb']) : '#ffffff',
            kind: 'star', rot: rand(0, TAU), vr: 0, g: 0 });
        }
      }
    }
  }

  /** find the local angle that is furthest from every obstacle */
  private safeAngle(): number {
    let best = 0;
    let bestD = -1;
    for (let i = 0; i < 72; i++) {
      const a = (i / 72) * TAU;
      let md = 99;
      for (const it of this.items) {
        if (it.type === 'coin') continue;
        md = Math.min(md, angDiff(a, it.angle));
      }
      if (md > bestD) {
        bestD = md;
        best = a;
      }
    }
    return best;
  }

  private worldPos(local: number, r: number) {
    const wa = local + this.rot;
    return { x: CX + Math.cos(wa) * r, y: this.targetY + Math.sin(wa) * r };
  }

  /** returns true if a save was consumed */
  private trySave(p: Proj, spike: boolean): boolean {
    const w = this.weapon;
    if (this.savesLeft <= 0 || !w.saveFx) return false;
    if (w.saveSpikeOnly && !spike) return false;
    this.savesLeft--;
    const R = this.level.radius;
    switch (w.saveFx) {
      case 'return':
      case 'mirror':
      case 'bubble': {
        this.ammoLeft++;
        if (w.saveFx === 'bubble') {
          sfx2.pop();
          this.addText('🫧 POP! AMAN', p.x, p.y + 50, '#fbcfe8', 24);
          for (let i = 0; i < 16; i++) {
            const a = rand(0, TAU);
            const v = rand(80, 260);
            this.particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.3, 0.6), max: 0.6, size: rand(2, 5), color: pick(['220,240,255', '255,200,240']), kind: 'glow', rot: 0, vr: 0, g: 0 });
          }
          this.particles.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.4, max: 0.4, size: 60, color: '#fbcfe8', kind: 'ring', rot: 0, vr: 0, g: 0 });
        } else {
          if (w.saveFx === 'mirror') sfx2.mirror();
          else sfx2.boomerang();
          this.addText(w.saveText ?? (w.saveFx === 'mirror' ? '🪞 MANTUL!' : '🪃 BALIK!'), p.x, p.y + 50, w.color, 24);
          this.flyers.push({ x: p.x, y: p.y + BLEN / 2, vx: rand(-120, 120), vy: 900, rot: Math.PI, vr: rand(14, 22), kind: 'bullet', w: w.id });
          for (let i = 0; i < 10; i++) {
            const a = rand(0, TAU);
            this.particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, life: 0.25, max: 0.25, size: 2, color: pick(w.sparks), kind: 'spark', rot: 0, vr: 0, g: 0 });
          }
        }
        return true;
      }
      case 'portal':
      case 'glitch': {
        const safe = this.safeAngle();
        const rgbA = w.saveFx === 'portal' ? '59,130,246' : '255,0,85';
        const rgbB = w.saveFx === 'portal' ? '251,146,60' : '0,255,238';
        const to = this.worldPos(safe, R + 20);
        this.portals.push({ x: p.x, y: p.y, life: 0.6, max: 0.6, rgb: rgbA });
        this.portals.push({ x: to.x, y: to.y, life: 0.6, max: 0.6, rgb: rgbB });
        if (w.saveFx === 'glitch') {
          this.glitchT = 0.35;
          sfx2.glitch();
        } else sfx2.warp();
        this.addText(w.saveFx === 'portal' ? '🌌 TELEPORT!' : '👾 LAG!', CX, CY + R + 70, w.color, 26);
        this.stickAt(safe);
        return true;
      }
    }
    return false;
  }

  private applyPerks(w: Weapon, hx: number, hy: number, R: number) {
    if (w.explode) this.explodeAt(hx, hy, w.id === 'bazooka' ? 1.3 : w.id === 'bamboo' ? 1.2 : 1, w.explodeFx ?? 'fire');
    if (w.id === 'cricket') {
      this.particles.push({ x: hx, y: hy, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 180, color: '#7cc8ff', kind: 'ring', rot: 0, vr: 0, g: 0 });
      this.shake = Math.max(this.shake, 12);
    }
    if (w.chain) {
      const others = this.items.filter((it) => it.type === 'bullet' || it.type === 'old').slice(0, -1);
      for (let i = others.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [others[i], others[j]] = [others[j], others[i]];
      }
      for (const it of others.slice(0, 4)) {
        const wa = it.angle + this.rot;
        this.particles.push({
          x: hx, y: hy, tx: CX + Math.cos(wa) * (R + 18), ty: this.targetY + Math.sin(wa) * (R + 18), vx: 0, vy: 0,
          life: 0.25, max: 0.25, size: 2, color: '#9be8ff', kind: 'bolt', rot: 0, vr: 0, g: 0,
        });
      }
      if (others.length) this.addText('⚡ SETRUM!', hx + rand(-50, 50), hy + 60, '#9be8ff', 20);
    }
    if (w.slow) {
      const water = w.id === 'soaker' || w.slowStyle === 'water';
      const honey = w.slowStyle === 'honey';
      if (water || honey) sfx2.splat();
      else sfx.ice();
      if (this.slowT <= 0) this.addText(w.slowText ?? '❄ BEKU!', hx + rand(-40, 40), hy + 60,
        honey ? '#ffd56c' : water ? '#93c5fd' : '#bff1ff', 24);
      this.applySlow(w.slowTime ?? 1.3, w.slowFactor ?? 0.3, w.slowRgb ?? '170,230,255',
        honey ? 'honey' : water ? 'water' : 'ice');
      // Both liquids already have their own splash and droplets in spawnImpact.
      if (w.id !== 'soaker' && w.id !== 'honey') for (let i = 0; i < 14; i++) {
        const a = rand(0, TAU);
        const v = rand(60, 260);
        this.particles.push({
          x: hx, y: hy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.4, 0.8), max: 0.8,
          size: rand(2, 4), color: pick(water ? ['#ffffff', '#93c5fd', '#3b82f6'] : ['#ffffff', '#d6f6ff', '#9be7ff']), kind: 'chip', rot: rand(0, TAU), vr: rand(-10, 10), g: water ? 900 : 300,
        });
      }
    }
    if (w.luckyCoin && Math.random() < w.luckyCoin) {
      this.coins++;
      sfx.coin();
      this.addText(w.luckyText ?? '+1 💰 HOKI!', hx + rand(-40, 40), hy + 50, '#ffd23f', 20);
    }
    this.applyNewPerks(w, hx, hy, R);
    if (w.id === 'fish') sfx.splash();
    if (w.pullCoins) {
      sfx.suck();
      const coins = this.items.filter((it) => it.type === 'coin');
      for (const it of coins) {
        const wa = it.angle + this.rot;
        const cx = CX + Math.cos(wa) * (R + 14);
        const cy = this.targetY + Math.sin(wa) * (R + 14);
        this.particles.push({
          x: cx, y: cy, tx: hx, ty: hy, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 3, color: '#d8b4fe', kind: 'bolt', rot: 0, vr: 0, g: 0,
        });
        this.collectCoin(it);
      }
      if (coins.length) this.addText('🕳 SEDOT!', hx, hy + 60, '#d8b4fe', 24);
      for (let i = 0; i < 16; i++) {
        const a = rand(0, TAU);
        const d = rand(40, 90);
        this.particles.push({
          x: hx + Math.cos(a) * d, y: hy + Math.sin(a) * d, vx: -Math.cos(a) * d * 3, vy: -Math.sin(a) * d * 3, life: 0.33, max: 0.33,
          size: rand(2, 5), color: '168,85,247', kind: 'glow', rot: 0, vr: 0, g: 0,
        });
      }
    }
  }

  private explodeAt(x: number, y: number, big: number, fx: 'fire' | 'white' | 'firework' = 'fire') {
    if (fx === 'firework') {
      this.fireworkAt(x, y);
      return;
    }
    const white = fx === 'white';
    sfx.explosion();
    this.shake = Math.max(this.shake, 12 * big);
    this.flashWhite = Math.max(this.flashWhite, white ? 0.5 : 0.3);
    for (let i = 0; i < 30 * big; i++) {
      const a = rand(0, TAU);
      const v = rand(60, 380) * big;
      this.particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.3, 0.7), max: 0.7,
        size: rand(6, 14), color: pick(white ? ['255,250,220', '255,230,150', '255,200,120'] : ['255,200,80', '255,120,30', '255,60,20']), kind: 'glow', rot: 0, vr: 0, g: -60,
      });
    }
    for (let i = 0; i < (white ? 22 : 12); i++) {
      this.particles.push({
        x: x + rand(-25, 25), y: y + rand(-20, 20), vx: rand(-110, 110), vy: rand(-130, 20), life: rand(0.8, 1.6), max: 1.6,
        size: rand(16, 34) * big, color: white ? 'rgba(245,245,245,' : 'rgba(70,70,70,', kind: 'smoke', rot: 0, vr: 0, g: -40,
      });
    }
    if (white) {
      for (let i = 0; i < 16; i++) {
        this.particles.push({ x, y, vx: rand(-300, 300), vy: rand(-350, 100), life: rand(0.5, 0.9), max: 0.9, size: rand(2, 4), color: pick(['#dc2626', '#fde047', '#ffffff']), kind: 'chip', rot: rand(0, TAU), vr: rand(-20, 20), g: 900 });
      }
    }
    this.particles.push({ x, y, vx: 0, vy: 0, life: 0.45, max: 0.45, size: 150 * big, color: white ? '#ffffff' : '#ffb347', kind: 'ring', rot: 0, vr: 0, g: 0 });
    this.addText(white ? 'DUARR!!' : 'DUAR!', x + rand(-30, 30), y + 50, white ? '#ffffff' : '#ff9f1c', white ? 36 : 30);
  }

  private fireworkAt(x: number, y: number) {
    sfx3.fireworkBoom();
    this.shake = Math.max(this.shake, 8);
    const palettes = [
      ['#f43f5e', '#fda4af', '#ffffff'], ['#facc15', '#fef08a', '#ffffff'], ['#22d3ee', '#a5f3fc', '#ffffff'],
      ['#a855f7', '#e9d5ff', '#ffffff'], ['#4ade80', '#bbf7d0', '#ffffff'],
    ];
    const bursts = [
      { bx: x, by: y + 20, n: 28, sp: 300 },
      { bx: x - 70, by: y + 80, n: 18, sp: 220 },
      { bx: x + 70, by: y + 70, n: 18, sp: 220 },
    ];
    // Grand floral chrysanthemum firework spectacle!
    bursts.forEach((b, bi) => {
      const pal = palettes[bi % palettes.length];
      this.sink.light(b.bx, b.by, 220, pal[0] === '#f43f5e' ? '244,63,94' : '255,230,160', 0.55);
      this.sink.push({ x: b.bx, y: b.by, vx: 0, vy: 0, life: 0.35, max: 0.35, size: 45, color: '255,240,220', kind: 'shock', rot: 0, vr: 0, g: 0 });
      for (let i = 0; i < b.n; i++) {
        const a = (i / b.n) * TAU + bi * 0.4;
        const v = b.sp * rand(0.85, 1.15);
        // Cascading sparkling willows
        this.sink.push({ x: b.bx, y: b.by, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(1.0, 1.6), max: 1.6, size: rand(4.5, 8), color: pick(pal), kind: 'star', rot: rand(0, TAU), vr: 0, g: 220, drag: 1.4 });
        this.sink.push({ x: b.bx, y: b.by, vx: Math.cos(a) * v * 0.75, vy: Math.sin(a) * v * 0.75, life: rand(0.7, 1.1), max: 1.1, size: 2.0, color: '#fef08a', kind: 'spark', rot: 0, vr: 0, g: 240, drag: 1.3 });
      }
      for (let k = 0; k < 6; k++) {
        const [vx, vy] = [rand(-120, 120), rand(-180, 40)];
        this.sink.push({ x: b.bx, y: b.by, vx, vy, life: rand(0.5, 0.9), max: 0.9, size: rand(5, 10), color: 'rgba(255,255,255,', kind: 'smoke', rot: 0, vr: 0, g: -30, drag: 2.2 });
      }
    });
    this.addText('DORR! 🎆', x + rand(-30, 30), y + 60, '#fde047', 30);
  }

  private applySlow(time: number, factor: number, rgb: string, kind: 'ice' | 'water' | 'honey' | 'time') {
    this.slowT = time;
    this.slowF = factor;
    this.slowRgb = rgb;
    this.slowKind = kind;
  }

  private reverseSpin(text: string, x: number, y: number) {
    this.level.dir *= -1;
    sfx2.reverse();
    this.addText(text, x, y, '#fde047', 24);
    this.particles.push({ x: CX, y: this.targetY, vx: 0, vy: 0, life: 0.5, max: 0.5, size: this.level.radius * 2.6, color: '#fde047', kind: 'ring', rot: 0, vr: 0, g: 0 });
  }

  private applyNewPerks(w: Weapon, hx: number, hy: number, R: number) {
    if (HIT_SFX[w.id]) HIT_SFX[w.id]!();
    const isPerk = (k: number) => this.perkCount > 0 && this.perkCount % k === 0;
    this.perkCount++;
    const ring = (color: string, size: number) =>
      this.particles.push({ x: hx, y: hy, vx: 0, vy: 0, life: 0.45, max: 0.45, size, color, kind: 'ring', rot: 0, vr: 0, g: 0 });

    if (w.burn) {
      if (this.burnT <= 0) this.addText(w.burnText ?? '🔥 TERBAKAR!', hx + rand(-40, 40), hy + 60, '#ff9f1c', 22);
      this.burnT = 2.6;
    }
    if (w.reverseChance && Math.random() < w.reverseChance) this.reverseSpin('🍌 TERPELESET!', hx + rand(-40, 40), hy + 70);
    if (w.reverseEvery && this.perkCount % w.reverseEvery === 0) this.reverseSpin('🌍 GRAVITASI BALIK!', hx, hy + 70);
    if (w.chronoEvery && this.perkCount % w.chronoEvery === 0) {
      sfx2.timestop();
      this.applySlow(1.2, 0, '250,220,120', 'time');
      this.addText('⏱ STOP WAKTU!', CX, this.targetY, '#fde047', 30);
      this.flashWhite = Math.max(this.flashWhite, 0.25);
    }
    if (w.spikeOff) {
      this.spikeOffT = w.spikeOff;
      for (let i = 0; i < 3; i++) {
        this.particles.push({ x: CX, y: this.targetY, vx: 0, vy: 0, life: 0.4 + i * 0.15, max: 0.4 + i * 0.15, size: R * (1.6 + i * 0.5), color: '#bef264', kind: 'ring', rot: 0, vr: 0, g: 0 });
      }
      if (this.items.some((it) => it.type === 'spike')) this.addText(w.spikeText ?? '🔊 DURI MASUK!', hx, hy + 70, w.color, 22);
    }
    if (w.pushSpikes) {
      const local = norm(Math.PI / 2 - this.rot);
      let pushed = false;
      for (const it of this.items) {
        if (it.type !== 'spike') continue;
        const d = norm(it.angle - local);
        const dd = d > Math.PI ? d - TAU : d;
        if (Math.abs(dd) < 1.3) {
          it.vel = (dd >= 0 ? 1 : -1) * 3.2;
          pushed = true;
        }
      }
      ring('#ef4444', 90);
      if (pushed) this.addText('🧲 TOLAK!', hx, hy + 70, '#fca5a5', 22);
    }
    if (w.shrink) {
      let any = false;
      for (const it of this.items) {
        if (it.type === 'bullet' || it.type === 'old') {
          if (it.w === 'sandal') continue; // keep the oversized sandal visibly chunky
          const before = it.scale ?? 1;
          it.scale = Math.max(0.45, before * 0.85);
          if (it.scale < before) any = true;
        }
      }
      for (let i = 0; i < 2; i++) this.particles.push({ x: CX, y: this.targetY, vx: 0, vy: 0, life: 0.5, max: 0.5, size: R * (2.8 - i * 0.6), color: '#4ade80', kind: 'ring', rot: 0, vr: 0, g: 0 });
      if (any) this.addText('🔬 MENGECIL!', hx, hy + 70, '#86efac', 22);
    }
    if (w.grow) {
      const base = this.level.boss ? 120 : 106;
      const before = this.targetR || this.level.radius;
      this.targetR = Math.min(base + 34, before + 6);
      if (this.targetR > before) this.addText('🔭 MEMBESAR!', hx, hy + 70, '#fdba74', 22);
      ring('#fb923c', R * 2.4);
    }
    if (w.snowman && isPerk(3)) {
      this.score += 3;
      sfx2.bloom();
      this.addText('⛄ MANUSIA SALJU +3', hx, hy + 70, '#e0f2fe', 24);
      for (let i = 0; i < 20; i++) {
        this.particles.push({ x: hx + rand(-30, 30), y: hy - rand(0, 40), vx: rand(-60, 60), vy: rand(-40, 40), life: rand(0.8, 1.4), max: 1.4, size: rand(2, 4), color: '#ffffff', kind: 'snowDust', rot: 0, vr: 0, g: 60 });
      }
    }
    if (w.breakSpike) {
      const local = norm(Math.PI / 2 - this.rot);
      const spikes = this.items.filter((it) => it.type === 'spike').sort((a, b) => angDiff(a.angle, local) - angDiff(b.angle, local));
      const sp = spikes[0];
      if (sp) {
        const p = this.worldPos(sp.angle, R + 10);
        this.items = this.items.filter((it) => it !== sp);
        this.flyers.push({ x: p.x, y: p.y, vx: rand(-200, 200), vy: -300, rot: sp.angle + this.rot - Math.PI / 2, vr: rand(-15, 15), kind: 'spike' });
        sfx2.crash();
        this.addText('🏴‍☠️ DURI HANCUR!', p.x, p.y - 20, '#e5e7eb', 22);
        for (let i = 0; i < 14; i++) {
          this.particles.push({ x: p.x, y: p.y, vx: rand(-250, 250), vy: rand(-250, 150), life: rand(0.4, 0.8), max: 0.8, size: rand(2, 5), color: pick(['#4b5563', '#9ca3af', '#ff3030']), kind: 'chip', rot: rand(0, TAU), vr: rand(-20, 20), g: 900 });
        }
      }
      for (let i = 0; i < 8; i++) {
        this.particles.push({ x: hx + rand(-15, 15), y: hy, vx: rand(-80, 80), vy: rand(-60, 40), life: rand(0.6, 1.1), max: 1.1, size: rand(12, 22), color: 'rgba(120,120,120,', kind: 'smoke', rot: 0, vr: 0, g: -30 });
      }
    }
    if (w.randomBonus !== undefined) {
      const b = Math.floor(Math.random() * (w.randomBonus + 1));
      this.score += b;
      this.addText(b > 0 ? `KWEK! +${b}` : 'kwek...', hx + rand(-40, 40), hy + 70, b >= 4 ? '#fde047' : '#ffffff', 18 + b * 2);
    }
    if (w.jackpot && Math.random() < w.jackpot) {
      this.coins += 8;
      sfx2.jackpot();
      this.addText(w.jackpotText ?? '🂡 AS! JACKPOT +8 💰', CX, this.targetY + 10, '#fde047', 26);
      this.flashWhite = Math.max(this.flashWhite, 0.3);
      for (let i = 0; i < 24; i++) {
        const a = rand(0, TAU);
        const v = rand(150, 400);
        this.particles.push({ x: hx, y: hy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.5, 0.9), max: 0.9, size: rand(2, 4), color: pick(['#ffd23f', '#fff1a8', '#f59e0b']), kind: 'spark', rot: 0, vr: 0, g: 300 });
      }
    }
    if (w.confetti) {
      const cc = ['#f43f5e', '#facc15', '#22d3ee', '#a855f7', '#4ade80', '#fb923c'];
      for (let i = 0; i < 30; i++) {
        const a = rand(-Math.PI * 0.95, -Math.PI * 0.05);
        const v = rand(150, 450);
        this.particles.push({ x: hx, y: hy, vx: Math.cos(a) * v * 0.8, vy: Math.sin(a) * v * -0.6 + rand(-100, 50), life: rand(0.8, 1.4), max: 1.4, size: rand(3, 6), color: pick(cc), kind: 'chip', rot: rand(0, TAU), vr: rand(-25, 25), g: 350 });
      }
    }
    if (w.bossMult && this.level.boss) {
      this.score += w.points * (w.bossMult - 1);
      this.addText(`🐉 BOSS x${w.bossMult}!`, hx + rand(-30, 30), hy + 90, '#f87171', 22);
    }
    if (w.burn || w.id === 'dragon') {
      for (let i = 0; i < 14; i++) {
        this.particles.push({ x: hx + rand(-10, 10), y: hy, vx: rand(-120, 120), vy: rand(-200, 40), life: rand(0.3, 0.6), max: 0.6, size: rand(5, 10), color: pick(['255,200,80', '255,120,30', '255,60,20']), kind: 'glow', rot: 0, vr: 0, g: -200 });
      }
    }
    if (w.rope) ring('#a5f3fc', 70);

    // ---------- wave 3 perks ----------
    if (w.notes) {
      const idx = Math.min(9, this.combo - 1);
      sfx3.note(idx);
      const noteCols = ['#fde68a', '#fca5a5', '#a5f3fc', '#bbf7d0', '#ddd6fe'];
      for (let i = 0; i < 3; i++) {
        this.particles.push({ x: hx + rand(-20, 20), y: hy, vx: rand(-60, 60), vy: rand(-160, -80), life: 1.1, max: 1.1, size: 18 + idx, color: pick(noteCols), kind: 'text', rot: 0, vr: 0, g: 0, text: pick(['♪', '♫', '♬']) });
      }
      const NAMES = ['da', 'mi', 'na', 'ti', 'la'];
      this.addText(NAMES[idx % 5].toUpperCase() + '♪', hx + rand(-40, 40), hy + 70, '#fde68a', 18 + idx * 1.5);
    }
    if (w.meltOld || (w.meltEvery && this.perkCount % w.meltEvery === 0)) {
      const local = norm(Math.PI / 2 - this.rot);
      const olds = this.items.filter((it) => it.type === 'old').sort((a, b) => angDiff(a.angle, local) - angDiff(b.angle, local));
      const o = olds[0];
      if (o) {
        const p = this.worldPos(o.angle, R + 14);
        this.items = this.items.filter((it) => it !== o);
        if (w.id === 'pencil') sfx4.erase();
        else if (w.id === 'holy') sfx4.purify();
        else sfx3.sizzle();
        const mc = w.meltColors ?? ['163,230,53', '190,242,100', '101,163,13'];
        this.addText(w.meltText ?? '🧪 MELELEH!', p.x, p.y - 20, `rgb(${mc[0]})`, 22);
        if (w.id === 'holy') {
          this.sink.push({ x: p.x, y: -20, tx: p.x, ty: p.y, vx: 0, vy: 0, life: 0.4, max: 0.4, size: 5, color: '#fef9c3', kind: 'bolt', rot: 0, vr: 0, g: 0 });
          this.sink.light(p.x, p.y, 180, '255,240,180', 0.6);
        }
        for (let i = 0; i < 18; i++) {
          this.sink.push({ x: p.x + rand(-6, 6), y: p.y + rand(-8, 8), vx: rand(-40, 40), vy: rand(-120, -30), life: rand(0.5, 1), max: 1, size: rand(3, 7), color: pick(mc), kind: 'glow', rot: 0, vr: 0, g: -60, drag: 1.5 });
        }
        for (let i = 0; i < 8; i++) {
          this.sink.push({ x: p.x, y: p.y, vx: rand(-30, 30), vy: rand(-80, -20), life: rand(0.8, 1.4), max: 1.4, size: rand(8, 16), color: `rgba(${mc[0]},`, kind: 'smoke', rot: 0, vr: 0, g: -40 });
        }
      }
    }
    if (w.abductEvery && this.perkCount % w.abductEvery === 0) {
      const targets = this.items.filter((it) => it.type === 'spike' || it.type === 'old');
      const tg = targets.length ? pick(targets) : null;
      if (tg) {
        const p = this.worldPos(tg.angle, R + 16);
        this.items = this.items.filter((it) => it !== tg);
        sfx3.abduct();
        this.addText('🛸 DICULIK!', p.x, p.y - 30, '#86efac', 24);
        this.sink.light(p.x, p.y, 180, '134,239,172', 0.8);
        for (let i = 0; i < 26; i++) {
          this.sink.push({ x: p.x + rand(-14, 14), y: p.y - rand(0, 300), vx: rand(-10, 10), vy: rand(-500, -250), life: rand(0.4, 0.9), max: 0.9, size: rand(2, 5), color: '134,239,172', kind: 'glow', rot: 0, vr: 0, g: 0 });
        }
        for (let i = 0; i < 10; i++) {
          this.sink.push({ x: p.x + rand(-16, 16), y: rand(0, p.y), vx: 0, vy: -1600, life: 0.15, max: 0.15, size: rand(1.5, 3), color: 'rgba(187,247,208,0.9)', kind: 'streak', rot: 0, vr: 0, g: 0 });
        }
        this.sink.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.6, max: 0.6, size: 90, color: '134,239,172', kind: 'shock', rot: 0, vr: 0, g: 0 });
        // item floats up as a shard
        this.sink.push({ x: p.x, y: p.y, vx: 0, vy: -200, life: 1, max: 1, size: 10, color: tg.type === 'spike' ? '#ff3030' : '#8b6a5a', kind: 'shard', rot: 0, vr: 8, g: -500 });
      }
    }
    if (w.trailFx === 'rainbow' && this.combo >= 3) {
      this.coins += 1;
      this.addText('🌈 COMBO PELANGI +1 💰', hx, hy + 90, '#f9a8d4', 18);
    }
    if (w.id === 'storm') {
      // lightning strike from sky
      this.sink.push({ x: hx + rand(-20, 20), y: -20, tx: hx, ty: hy, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 4, color: '#dbeafe', kind: 'bolt', rot: 0, vr: 0, g: 0 });
      this.flashWhite = Math.max(this.flashWhite, 0.35);
    }
    if (w.id === 'meteor') {
      this.sink.push({ x: hx - 160, y: -40, tx: hx, ty: hy, vx: 0, vy: 0, life: 0.15, max: 0.15, size: 5, color: '#fb923c', kind: 'bolt', rot: 0, vr: 0, g: 0 });
    }

    // ---------- wave 4 perks ----------
    if (w.everyBonus && this.perkCount % w.everyBonus.n === 0) {
      this.score += w.everyBonus.pts;
      sfx2.jackpot();
      this.addText(w.everyBonus.text, CX, this.targetY + 10, '#fda4af', 28);
      this.flashWhite = Math.max(this.flashWhite, 0.2);
      for (let i = 0; i < 18; i++) {
        const a = rand(0, TAU);
        this.sink.push({ x: hx, y: hy, vx: Math.cos(a) * rand(150, 380), vy: Math.sin(a) * rand(150, 380), life: rand(0.5, 0.9), max: 0.9, size: rand(4, 8), color: pick(['#fecdd3', '#e11d48', '#ffffff', '#fde047']), kind: 'star', rot: 0, vr: 0, g: 0, drag: 2.5 });
      }
    }
    if (w.transmute && Math.random() < w.transmute) this.transmuteOne(hx, hy, R, '✨ SIM SALABIM!');
    if (w.obliterate) this.obliterateAt(hx, hy, R, w.obliterate);
    if (w.randomMagic) {
      const roll = Math.floor(Math.random() * 5);
      sfx4.magic();
      if (roll === 0) {
        this.applySlow(1.3, 0.35, '250,190,240', 'ice');
        this.addText('🦄 BEKU AJAIB!', hx, hy + 70, '#f0abfc', 22);
      } else if (roll === 1) this.reverseSpin('🦄 PUTAR BALIK!', hx, hy + 70);
      else if (roll === 2) {
        this.coins += 2;
        sfx.coin();
        this.addText('🦄 +2 💰', hx, hy + 70, '#fde047', 24);
      } else if (roll === 3) {
        this.spikeOffT = 1.8;
        this.addText('🦄 DURI HILANG!', hx, hy + 70, '#c4b5fd', 22);
      } else this.transmuteOne(hx, hy, R, '🦄 JADI KOIN!');
      const RBC = ['248,113,113', '251,146,60', '250,204,21', '74,222,128', '96,165,250', '192,132,252'];
      for (let i = 0; i < 6; i++) this.sink.push({ x: CX, y: this.targetY, vx: 0, vy: 0, life: 0.5 + i * 0.06, max: 0.5 + i * 0.06, size: R * (1.4 + i * 0.25), color: RBC[i], kind: 'shock', rot: 0, vr: 0, g: 0 });
    }
  }

  private transmuteOne(hx: number, hy: number, R: number, text: string) {
    const local = norm(Math.PI / 2 - this.rot);
    const cands = this.items.filter((it) => it.type === 'old' || it.type === 'spike').sort((a, b) => angDiff(a.angle, local) - angDiff(b.angle, local));
    const tg = cands[0];
    if (!tg) return;
    const p = this.worldPos(tg.angle, R + 14);
    tg.type = 'coin';
    tg.age = 10;
    tg.w = undefined;
    tg.scale = undefined;
    sfx4.salabim();
    this.addText(text, p.x, p.y - 24, '#f5d0fe', 22);
    this.sink.light(p.x, p.y, 140, '233,213,255', 0.5);
    this.sink.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 70, color: '233,213,255', kind: 'shock', rot: 0, vr: 0, g: 0 });
    for (let i = 0; i < 16; i++) {
      const a = rand(0, TAU);
      this.sink.push({ x: p.x, y: p.y, vx: Math.cos(a) * rand(80, 260), vy: Math.sin(a) * rand(80, 260), life: rand(0.5, 0.9), max: 0.9, size: rand(3, 7), color: pick(['#ffffff', '#f5d0fe', '#fde047']), kind: 'star', rot: 0, vr: 0, g: 0, drag: 2.5 });
    }
    for (let i = 0; i < 8; i++) {
      this.sink.push({ x: p.x + rand(-6, 6), y: p.y + rand(-6, 6), vx: rand(-30, 30), vy: rand(-60, 0), life: rand(0.6, 1), max: 1, size: rand(8, 14), color: 'rgba(233,213,255,', kind: 'smoke', rot: 0, vr: 0, g: -30 });
    }
    void hx;
    void hy;
  }

  private obliterateAt(hx: number, hy: number, R: number, n: number) {
    const targets = this.items.filter((it) => it.type === 'spike' || it.type === 'old');
    for (let i = targets.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [targets[i], targets[j]] = [targets[j], targets[i]];
    }
    const kill = targets.slice(0, n);
    // tendrils to everything nearby (visual), destroy chosen
    for (const it of this.items) {
      if (it.type === 'coin') continue;
      const p = this.worldPos(it.angle, R + 16);
      this.sink.push({ x: hx, y: hy, tx: p.x, ty: p.y, vx: 0, vy: 0, life: 0.45, max: 0.45, size: kill.includes(it) ? 4 : 2, color: '#86efac', kind: 'bolt', rot: 0, vr: 0, g: 0 });
    }
    for (const it of kill) {
      const p = this.worldPos(it.angle, R + 14);
      this.items = this.items.filter((x) => x !== it);
      this.flyers.push({ x: p.x, y: p.y, vx: rand(-300, 300), vy: rand(-450, -200), rot: it.angle + this.rot - Math.PI / 2, vr: rand(-20, 20), kind: it.type, w: it.w });
      this.sink.light(p.x, p.y, 160, '74,222,128', 0.5);
      this.sink.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 80, color: '134,239,172', kind: 'shock', rot: 0, vr: 0, g: 0 });
      for (let i = 0; i < 12; i++) {
        const a = rand(0, TAU);
        this.sink.push({ x: p.x, y: p.y, vx: Math.cos(a) * rand(100, 320), vy: Math.sin(a) * rand(100, 320), life: rand(0.4, 0.8), max: 0.8, size: rand(3, 7), color: pick(['74,222,128', '187,247,208', '255,255,255']), kind: 'glow', rot: 0, vr: 0, g: 0, drag: 2 });
      }
    }
    this.flashWhite = Math.max(this.flashWhite, 0.45);
    this.tintA = Math.max(this.tintA, 0.5);
    this.tintRgb = '74,222,128';
    this.sink.light(CX, this.targetY, R * 4, '74,222,128', 0.8);
    this.sink.push({ x: CX, y: this.targetY, vx: 0, vy: 0, life: 0.8, max: 0.8, size: R * 3.6, color: '74,222,128', kind: 'shock', rot: 0, vr: 0, g: 0 });
    this.addText(kill.length ? `☢️ ${kill.length}x DIMUSNAHKAN!` : '☢️ OBLITERATE!', CX, this.targetY - 10, '#86efac', 30);
  }

  private stickAt(local: number, p?: Proj) {
    const R = this.level.radius;
    const w = this.weapon;
    const big = p?.big ?? 0;
    const tint = p?.tint;
    this.items.push({ angle: local, type: 'bullet', age: 0, w: w.id, big, tint, scale: big ? embeddedProjectileScale(big) : undefined });
    this.stuck++;
    if (this.time - this.lastHit < (w.comboWindow ?? 0.5)) this.combo++;
    else this.combo = 1;
    this.lastHit = this.time;
    let pts = w.points * (big === 2 ? 4 : big === 1 ? 2 : 1);
    if (big) {
      this.addText(big === 2 ? '⚡ FULL CHARGE x4!' : 'CHARGE x2', CX + rand(-40, 40), this.targetY + R + 60, big === 2 ? '#fde047' : '#7dd3fc', big === 2 ? 28 : 20);
      this.hitStop = Math.max(this.hitStop, big === 2 ? 0.12 : 0.04);
      if (big === 2) {
        const hp0 = this.worldPos(local, R);
        this.sink.light(hp0.x, hp0.y, 360, '254,240,138', 0.5);
        this.sink.push({ x: hp0.x, y: hp0.y, vx: 0, vy: 0, life: 0.6, max: 0.6, size: 220, color: '125,211,252', kind: 'shock', rot: 0, vr: 0, g: 0 });
        this.flashWhite = Math.max(this.flashWhite, 0.3);
      }
    }
    if (tint) {
      const hp0 = this.worldPos(local, R);
      for (let i = 0; i < 22; i++) {
        const a = rand(0, TAU);
        const v = rand(120, 520);
        this.sink.push({ x: hp0.x, y: hp0.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.4, 0.8), max: 0.8, size: rand(2, 5), color: `rgb(${tint})`, kind: 'drop', rot: 0, vr: 0, g: 1100 });
      }
      this.sink.push({ x: hp0.x, y: hp0.y, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 24, color: `rgb(${tint})`, kind: 'paintSplat', rot: rand(0, TAU), vr: 0, g: 0 });
      if (tint === this.lastPaint) {
        pts += 3;
        sfx4.match();
        this.addText('🎨 WARNA SAMA! +3', hp0.x, hp0.y + 60, `rgb(${tint})`, 22);
      }
      this.lastPaint = tint;
    }
    if (this.combo >= 2) {
      if (this.combo >= 3) pts *= 2;
      sfx.combo(this.combo);
      this.comboPop = 1;
    }
    pts *= this.dmgMult; // POWER also doubles classic points / boss damage, not only rock damage.
    this.score += pts;
    this.bump = 1;
    this.hitFlash = 1;
    this.shake = Math.max(this.shake, 6);
    this.crack(local, tint);
    sfx.hit();
    if (w.energy && !w.slow && !w.pullCoins && !HIT_SFX[w.id]) sfx.zap();
    const hp = this.worldPos(local, R);
    const hx = hp.x;
    const hy = hp.y;
    const cols = STYLE_COLORS[this.level.style].chips;
    this.applyPerks(w, hx, hy, R);
    const fxp = FX[w.id];
    spawnImpact(this.sink, fxp, w, hx, hy, (hx - CX) / R, (hy - this.targetY) / R, cols);
    this.hitStop = Math.max(this.hitStop, fxp.hitstop);
    this.camY -= fxp.kick;
    this.shake = Math.max(this.shake, 3 + fxp.kick * 0.8);
    if (fxp.tint) {
      this.tintA = Math.max(this.tintA, fxp.tint);
      this.tintRgb = fxp.light;
    }
    if (this.level.boss) {
      const dmg = pts * 10;
      this.bossHp = Math.max(0, this.bossHp - dmg);
      if (this.bossHp <= 0 || this.stuck >= this.level.ammo) {
        this.clearLevel();
      }
    } else {
      if (this.stuck >= this.level.ammo) this.clearLevel();
    }
  }

  private collectCoin(it: Item) {
    const R = this.level.radius;
    const wa = it.angle + this.rot;
    const x = CX + Math.cos(wa) * (R + 14);
    const y = this.targetY + Math.sin(wa) * (R + 14);
    this.items = this.items.filter((i) => i !== it);
    const v = this.weapon.coinValue;
    this.coins += v;
    sfx.coin();
    this.addText(`+${v} 💰`, x, y - 10, '#ffd23f', v > 1 ? 26 : 20);
    for (let i = 0; i < 14; i++) {
      const a = rand(0, TAU);
      const v = rand(100, 320);
      this.particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.3, 0.6), max: 0.6,
        size: rand(2, 4), color: pick(['#ffd23f', '#fff1a8', '#f59e0b']), kind: 'spark', rot: 0, vr: 0, g: 300,
      });
    }
  }

  private hitDiamond(it: Item) {
    it.hits = 1;
    const R = this.level.radius;
    const wa = it.angle + this.rot;
    const x = CX + Math.cos(wa) * (R + 18);
    const y = this.targetY + Math.sin(wa) * (R + 18);
    sfx4.shatter();
    this.shake = Math.max(this.shake, 6);
    this.addText('💎 1/2 RETAK!', x, y - 12, '#67e8f9', 18);
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x, y, vx: rand(-180, 180), vy: rand(-220, 100), life: rand(0.3, 0.6), max: 0.6,
        size: rand(2, 5), color: pick(['#67e8f9', '#ffffff', '#a5f3fc']), kind: 'spark', rot: 0, vr: 0, g: 600,
      });
    }
  }

  private collectDiamond(it: Item) {
    const R = this.level.radius;
    const wa = it.angle + this.rot;
    const x = CX + Math.cos(wa) * (R + 18);
    const y = this.targetY + Math.sin(wa) * (R + 18);
    this.items = this.items.filter((i) => i !== it);
    this.coins += 5;
    this.events.onDiamondCollected?.(10, false, { x, y });
    sfx3.chime();
    sfx2.jackpot();
    this.shake = Math.max(this.shake, 8);
    this.addText('BERLIAN +10! +5 APEL', x, y - 12, '#67e8f9', 22);
    for (let i = 0; i < 26; i++) {
      const a = rand(0, TAU);
      const v = rand(120, 440);
      this.particles.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.5, 0.9), max: 0.9,
        size: rand(2.5, 6), color: pick(['#67e8f9', '#a5f3fc', '#ffffff', '#fde047']), kind: 'star', rot: 0, vr: 0, g: 300,
      });
    }
  }

  private fail(p: Proj) {
    this.aiming = false;
    this.burnT = 0;
    this.state = 'fail';
    this.stateT = 0;
    this.projs = [];
    this.holding = false;
    this.beams = [];
    this.flyers.push({ x: p.x, y: p.y + BLEN / 2, vx: rand(-260, 260), vy: rand(380, 520), rot: 0, vr: rand(14, 24) * (Math.random() < 0.5 ? -1 : 1), kind: 'bullet', w: this.weapon.id });
    sfx.clang();
    this.shake = 16;
    this.flashRed = 1;
    this.timeScale = 0.12;
    this.hitStop = 0.14;
    this.camY -= 10;
    this.sink.light(p.x, p.y, 180, '255,70,50', 0.5);
    this.sink.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 45, color: '255,60,40', kind: 'shock', rot: 0, vr: 0, g: 0 });
    for (let i = 0; i < 10; i++) {
      this.sink.push({ x: p.x, y: p.y, vx: rand(-300, 300), vy: rand(-200, 300), life: rand(0.4, 0.8), max: 0.8, size: rand(4, 8), color: pick(['#ffffff', '#ffd23f', '#9ca3af']), kind: 'shard', rot: rand(0, TAU), vr: rand(-20, 20), g: 1200 });
    }
    this.combo = 0;
    for (let i = 0; i < 26; i++) {
      const a = rand(0, TAU);
      const v = rand(200, 800);
      this.particles.push({
        x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.2, 0.5), max: 0.5,
        size: rand(1.5, 3), color: pick(['#ffffff', '#ffd23f', '#ff6b35']), kind: 'spark', rot: 0, vr: 0, g: 500,
      });
    }
    this.particles.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.4, max: 0.4, size: 70, color: '#ff3b3b', kind: 'ring', rot: 0, vr: 0, g: 0 });
    this.addText('GAGAL!', CX, this.targetY + this.level.radius + 110, '#ff4d4d', 40);
  }

  private clearLevel() {
    this.state = 'clear';
    this.events.onStageCleared?.(this.level.n, this.level.boss, { x: CX, y: this.targetY });
    this.stateT = 0;
    this.projs = [];
    const R = this.level.radius;
    const k = 9;
    const offs = rand(0, TAU);
    for (let i = 0; i < k; i++) {
      const a0 = offs + (i / k) * TAU;
      const a1 = offs + ((i + 1) / k) * TAU;
      const mid = (a0 + a1) / 2 + this.rot;
      const v = rand(260, 520);
      this.frags.push({ x: CX, y: this.targetY, vx: Math.cos(mid) * v, vy: Math.sin(mid) * v - 220, rot: this.rot, vr: rand(-6, 6), a0, a1 });
    }
    for (const it of this.items) {
      const wa = it.angle + this.rot;
      const v = rand(350, 650);
      this.flyers.push({
        x: CX + Math.cos(wa) * R, y: this.targetY + Math.sin(wa) * R, vx: Math.cos(wa) * v, vy: Math.sin(wa) * v - 200,
        rot: wa - Math.PI / 2, vr: rand(-14, 14), kind: it.type, w: it.w,
      });
    }
    this.items = [];
    const cols = STYLE_COLORS[this.level.style].chips;
    for (let i = 0; i < 50; i++) {
      const a = rand(0, TAU);
      const v = rand(150, 750);
      this.particles.push({
        x: CX + Math.cos(a) * rand(0, R), y: this.targetY + Math.sin(a) * rand(0, R), vx: Math.cos(a) * v, vy: Math.sin(a) * v - 150,
        life: rand(0.6, 1.2), max: 1.2, size: rand(3, 7), color: pick(cols), kind: 'chip', rot: rand(0, TAU), vr: rand(-20, 20), g: 1300,
      });
    }
    for (let i = 0; i < 14; i++) {
      this.particles.push({
        x: CX + rand(-R, R) * 0.6, y: this.targetY + rand(-R, R) * 0.6, vx: rand(-60, 60), vy: rand(-60, 20), life: rand(0.6, 1.1), max: 1.1,
        size: rand(18, 34), color: 'rgba(220,220,220,', kind: 'smoke', rot: 0, vr: 0, g: -30,
      });
    }
    this.particles.push({ x: CX, y: this.targetY, vx: 0, vy: 0, life: 0.5, max: 0.5, size: R * 2.4, color: '#ffffff', kind: 'ring', rot: 0, vr: 0, g: 0 });
    sfx.shatter();
    this.shake = 18;
    this.flashWhite = 0.7;
    this.timeScale = 0.35;
    this.hitStop = 0.07;
    const lr = FX[this.weapon.id].light;
    this.sink.light(CX, this.targetY, R * 2.5, lr, 0.6);
    this.sink.push({ x: CX, y: this.targetY, vx: 0, vy: 0, life: 0.5, max: 0.5, size: R * 1.8, color: lr, kind: 'shock', rot: 0, vr: 0, g: 0 });
    const cc = STYLE_COLORS[this.level.style].chips;
    for (let i = 0; i < 18; i++) {
      const a = rand(0, TAU);
      const v = rand(250, 700);
      this.sink.push({ x: CX + Math.cos(a) * R * 0.5, y: this.targetY + Math.sin(a) * R * 0.5, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 200, life: rand(0.7, 1.2), max: 1.2, size: rand(6, 12), color: pick(cc), kind: 'shard', rot: rand(0, TAU), vr: rand(-20, 20), g: 1300 });
    }
    for (let i = 0; i < 14; i++) {
      const a = rand(0, TAU);
      this.sink.push({ x: CX, y: this.targetY, vx: Math.cos(a) * rand(100, 400), vy: Math.sin(a) * rand(100, 400), life: rand(0.5, 1), max: 1, size: rand(6, 11), color: '#ffffff', kind: 'star', rot: rand(0, TAU), vr: 0, g: 0, drag: 2.5 });
    }
    if (this.level.boss) {
      this.coins += 5;
      this.score += 5;
      this.addText('BOS KALAH! +5 💰', CX, this.targetY + 20, '#ffd23f', 28);
    } else {
      this.addText(pick(PRAISE), CX, this.targetY + 10, '#ffffff', 40);
    }
  }

  private addText(text: string, x: number, y: number, color: string, size: number) {
    // Jaga area target (Y: 120..420) agar selalu bersih dan tidak terhalang teks!
    let safeY = y;
    if (safeY < 430 && safeY > 110) {
      safeY = 440;
    }
    // Bergerak turun menjauh dari target dan memudar dengan cepat
    this.particles.push({ x, y: safeY, vx: 0, vy: 25, life: 0.65, max: 0.65, size: Math.min(size, 24), color, kind: 'text', rot: 0, vr: 0, g: 0, text });
  }

  // ---------- loop ----------
  private loop = (now: number) => {
    if (!this.active) return;
    // 60 FPS during play (also on 120 Hz displays); the covered menu needs
    // only a few frames. Never spend RAF time on an unfocused slide.
    const interval = this.state === 'idle' || this.state === 'over' ? 1000 / 15 : 1000 / 60;
    if (now - this.last >= interval - 1) {
      const dt = Math.min(0.033, (now - this.last) / 1000);
      this.last = now;
      this.update(dt);
      this.render();
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  private stepProj(p: Proj): StepRes {
    // A floating star can be collected by a straight shot before it reaches the target.
    if (this.state === 'play' && this.star
      && Math.hypot(p.x - this.star.x, p.y - this.star.y) < this.star.r + this.weapon.half * 0.5) {
      this.hitStar();
      return { res: 'hit' };
    }
    const isBoss = this.level.boss;
    const bType = isBoss ? (this.level.style as BossType) : null;
    const px = p.x - CX;
    const py = p.y - this.targetY;
    const worldA = Math.atan2(py, px);
    const local = norm(worldA - this.rot);
    // Exact pixel-perfect raycast radius matching the cutout silhouette of the generated boss head!
    const effectiveR = bType ? getExactBossRadius(bType, local, this.level.radius) : this.level.radius;
    const dist = Math.hypot(px, py);
    if (dist > effectiveR + L + 4) return { res: 'none' };
    if (isSpecial(this.level.mode)) return this.stepSpecialProjectile(p);
    const w = this.weapon;
    const R = effectiveR;

    // Check collision against other stuck items (bullets/spikes)
    // IMPORTANT: only check items that are sufficiently close in angle to avoid false collisions!
    // Precise, fair collision check:
    // Only triggers failure if projectile hits an existing bullet or spike near the surface
    for (const it of [...this.items]) {
      if (it.type === 'coin') continue;
      const d = angDiff(local, it.angle);
      // Tangential angular clearance threshold
      const itemR = bType ? getExactBossRadius(bType, it.angle, this.level.radius) : this.level.radius;

      if (it.type === 'bullet' || it.type === 'old') {
        const sc = it.scale ?? 1;
        const totalWeaponLen = it.type === 'old' ? BLEN : (getWeapon(it.w || 'pistol').stick + 12);
        const stickLen = (totalWeaponLen * 0.5) * sc; // hanya terlihat setengah peluru di luar target
        const otherHalf = (it.type === 'old' ? 4.5 : getWeapon(it.w || 'pistol').half) * sc;
        const myHalf = w.half * (1 + (p.big ?? 0) * 0.3);
        const contactArc = (myHalf + otherHalf) / Math.max(50, itemR);

        // Check if projectile is in the collision arc and depth of stuck bullet
        if (d < contactArc && dist <= itemR + stickLen && dist >= itemR - 8) {
          if (it.type === 'old' && (w.pierceOld || p.big === 2) && !p.pierced) {
            p.pierced = 1;
            this.items = this.items.filter((x) => x !== it);
            const wa = it.angle + this.rot;
            const pos = this.worldPos(it.angle, itemR + 15);
            this.flyers.push({ x: pos.x, y: pos.y, vx: rand(-250, 250), vy: -350, rot: wa - Math.PI / 2, vr: rand(-20, 20), kind: 'old' });
            this.addText('🧲 TEMBUS!', pos.x, pos.y - 20, '#7dd3fc', 22);
            sfx2.metal();
            continue;
          }
          return { res: 'fail', spike: false };
        }
      } else if (it.type === 'spike') {
        if (this.spikeOffT > 0 || w.phaseSpikes) continue;
        const myHalf = w.half * (1 + (p.big ?? 0) * 0.3);
        const spikeArc = (myHalf + 9 * SPIKE_SCALE) / Math.max(50, itemR);

        // Check if projectile hits the spike protruding from boss head
        if (d < spikeArc && dist <= itemR + SPIKE_LEN * SPIKE_SCALE && dist >= itemR - 4) {
          return { res: 'fail', spike: true };
        }
      }
    }
    if (dist <= R + 36) {
      for (const it of [...this.items]) {
        if (it.type !== 'coin' && it.type !== 'diamond_chest') continue;
        const targetR = bType ? getExactBossRadius(bType, it.angle, this.level.radius) : this.level.radius;
        const cp = this.worldPos(it.angle, it.type === 'coin' ? targetR + 18 : targetR + 4);
        const hitDistance = Math.hypot(p.x - cp.x, p.y - cp.y);

        if (it.type === 'coin') {
          if (hitDistance < w.coinRadius + 8) this.collectCoin(it);
        } else if (it.type === 'diamond_chest') {
          if (hitDistance < w.coinRadius + 12) {
            if ((it.hits || 0) < 1) {
              this.hitDiamond(it);
            } else {
              this.collectDiamond(it);
            }
          }
        }
      }
    }
    if (dist <= R) return { res: 'stick', local };
    return { res: 'none' };
  }

  /** Each projectile is consumed on its first rock/coin/chest collision. */
  private stepSpecialProjectile(p: Proj): StepRes {
    const mode = this.level.mode;
    const ty = this.targetY;
    if (mode === 'treasure') {
      // Same open, coin-filled chest as the 10-second Diamond Breaker round.
      if (!this.chest || Math.abs(p.x - CX) > 97 || p.y < ty - 90 || p.y > ty + 88) return { res: 'none' };
      const power = Math.max(1, this.weapon.stats.power + (p.big ?? 0) * 2);
      this.chest.hit(power);
      const reward = Math.max(1, Math.round(power * 0.48 + rand(0, 1))) * (this.treasureBuff === 'giant' ? 2 : 1);
      // The reward is not credited on impact: it physically erupts from the
      // chest, bounces on the floor, then reaches the counter in small steps.
      this.treasureCoins.push(...throwTreasureCoins(p.x, ty, reward));
      // Embedded rounds move with the rattling chest, not with the screen.
      const len = this.weapon.stick + EMBED;
      const embedded = this.makeEmbeddedShot(p, p.x - CX, 68 - len * 0.5, Math.PI / 2);
      // A new hit in the same spot knocks the previous round loose instead of
      // stacking dozens of identical sprites into one blinding column.
      for (let i = this.chestBullets.length - 1; i >= 0; i--) {
        if (Math.abs(this.chestBullets[i].x - embedded.x) < Math.max(14, this.weapon.half * 2.5)) {
          this.dislodgeChestShot(this.chestBullets.splice(i, 1)[0]);
        }
      }
      this.chestBullets.push(embedded);
      if (this.chestBullets.length > 18) this.dislodgeChestShot(this.chestBullets.shift()!);
      this.specialImpact(p.x, p.y, 'gold');
      this.burstSpecial(p.x, p.y, 'gold', 8);
      return { res: 'hit' };
    }

    const rock = this.rock;
    if (!rock) return { res: 'none' };
    const sc = this.level.radius / 196;
    const a = -this.rot;
    const dx = p.x - CX, dy = p.y - ty;
    const local = { x: (dx * Math.cos(a) - dy * Math.sin(a)) / sc, y: (dx * Math.sin(a) + dy * Math.cos(a)) / sc };

    if (mode === 'bonus') {
      // Gold rings rotate with the rock; collect a coin once, then consume the shot.
      const coin = this.bonusCoins.find(c => !c.taken && Math.hypot(local.x - Math.cos(c.angle) * c.radius, local.y - Math.sin(c.angle) * c.radius) < 16 + this.weapon.coinRadius * 0.35);
      if (coin) {
        coin.taken = true;
        const x = CX + Math.cos(coin.angle + this.rot) * coin.radius * sc;
        const y = ty + Math.sin(coin.angle + this.rot) * coin.radius * sc;
        this.coins += 2;
        this.score += 50;
        this.specialImpact(x, y, 'gold');
        this.burstSpecial(x, y, 'gold', 8);
        sfx.coin();
        if (this.bonusCoins.every(c => c.taken)) this.finishSpecialStage();
        return { res: 'hit' };
      }
    }

    const dmg = Math.round((4 + (this.weapon.points - 1) * 2 + (p.big ?? 0) * 2) * this.dmgMult);
    const splash = (mode === 'boulder' ? 43 : 32) + (this.weapon.explode ? 30 : 0);
    const projectileRadius = diamondCoreProjectileRadius(
      this.weapon.half * (1 + (p.big ?? 0) * 0.3),
      projectileSizeMultiplier(this.weapon.id, !!p.mini, !!p.giant), sc,
    );
    const hit = rock.hitAt(local, dmg, splash, projectileRadius);
    if (!hit) return { res: 'none' };
    if (hit.kind === 'diamond') {
      this.diamondPing = 1;
      // The core is collectible only in the designated boulder stage; the
      // bonus-rock round keeps its own ring-coin objective.
      if (mode !== 'boulder' || this.centerDiamondCollected) {
        this.specialImpact(p.x, p.y, 'diamond');
        this.burstSpecial(p.x, p.y, 'diamond', 8);
        sfx3.chime();
        return { res: 'hit' };
      }
      this.centerDiamondHits++;
      this.addText(`BERLIAN ${this.centerDiamondHits}/3`, p.x, p.y - 26, '#a5f3fc', 22);
      this.sink.light(p.x, p.y, 90 + this.centerDiamondHits * 20, '103,232,249', 0.35);
      this.specialImpact(p.x, p.y, 'diamond');
      this.burstSpecial(p.x, p.y, 'diamond', this.centerDiamondHits === 3 ? 28 : 10);
      sfx3.chime();
      if (this.centerDiamondHits >= 3) {
        this.centerDiamondCollected = true;
        this.diamondHoldUntil = this.time + 3.1; // let the flight + reward burst finish before the next stage
        this.events.onDiamondCollected?.(50, true, { x: p.x, y: p.y });
        this.addText('DIAMOND DIDAPAT! +50', p.x, p.y - 54, '#e0f7ff', 28);
        this.sink.light(p.x, p.y, 190, '210,240,255', 0.8);
        this.burstSpecial(p.x, p.y, 'diamond', 56);
        sfx4.shatter();
        sfx2.jackpot();
        const scattered = this.rock?.shatterAll() ?? [];
        if (scattered.length) this.detachRockCells(scattered);
        this.finishSpecialStage();
      }
      return { res: 'hit' };
    }
    this.level.hp = hit.remaining;
    this.score += 1 + hit.broken.length * 10;
    this.specialImpact(p.x, p.y, 'rock');
    this.hitStop = Math.max(this.hitStop, 0.018);
    this.shake = Math.max(this.shake, hit.broken.length ? 5 : 2);
    // Every round belongs to the exact cell it struck, including rounds that
    // break it immediately. Splash damage can knock off previously hit cells.
    const tip = 7 / sc;
    this.rockBullets.push(this.makeEmbeddedShot(p,
      local.x - Math.sin(this.rot) * tip, local.y - Math.cos(this.rot) * tip,
      Math.PI / 2 - this.rot, hit.struckId));
    if (hit.broken.length) {
      this.detachRockCells(hit.broken);
      for (const cell of hit.broken) {
        const x = CX + (cell.x * Math.cos(this.rot) - cell.y * Math.sin(this.rot)) * sc;
        const y = ty + (cell.x * Math.sin(this.rot) + cell.y * Math.cos(this.rot)) * sc;
        const outward = Math.atan2(y - ty, x - CX);
        for (let i = 0; i < 2; i++) {
          const speed = rand(130, 360);
          this.rockFragments.push({
            x, y, vx: Math.cos(outward) * speed + rand(-70, 70), vy: Math.sin(outward) * speed - rand(90, 170),
            rot: rand(0, TAU), vr: rand(-10, 10), size: rand(5, 12), seed: rand(0, 10), life: 1.3, max: 1.3,
          });
        }
        this.burstSpecial(x, y, 'rock', 3);
      }
      sfx4.shatter();
    } else sfx.hit();
    if (hit.remaining === 0 && mode === 'boulder') this.finishSpecialStage();
    return { res: 'hit' };
  }

  private dislodgeChestShot(shot: EmbeddedShot) {
    const side = shot.x < 0 ? -1 : 1;
    this.flyers.push({
      x: CX + shot.x, y: this.targetY + 15 + shot.y + BLEN / 2,
      vx: side * rand(100, 240), vy: rand(-160, 50), rot: 0, vr: side * rand(7, 14),
      kind: 'bullet', w: shot.w,
    });
  }

  private makeEmbeddedShot(p: Proj, x: number, y: number, angle: number, cellId?: number): EmbeddedShot {
    return {
      x, y, angle, cellId, age: 0, w: this.weapon.id, big: p.big ?? 0, tint: p.tint,
      scale: (1 + (p.big ?? 0) * 0.3) * projectileSizeMultiplier(this.weapon.id, !!p.mini, !!p.giant),
    };
  }

  private detachRockCells(cells: BrokenRockCell[]) {
    const ids = new Set(cells.map(cell => cell.id));
    const bullets = new Map<number, EmbeddedShot[]>();
    this.rockBullets = this.rockBullets.filter(shot => {
      if (shot.cellId === undefined || !ids.has(shot.cellId)) return true;
      const group = bullets.get(shot.cellId) ?? [];
      group.push(shot);
      bullets.set(shot.cellId, group);
      return false;
    });
    const sc = this.level.radius / 196;
    const rot = this.rot;
    for (const cell of cells) {
      const x = CX + (cell.x * Math.cos(rot) - cell.y * Math.sin(rot)) * sc;
      const y = this.targetY - this.bump * 9 + (cell.x * Math.sin(rot) + cell.y * Math.cos(rot)) * sc;
      const outward = Math.atan2(y - this.targetY, x - CX);
      const speed = rand(120, 290);
      this.fallenCells.push({
        id: cell.id, cx: cell.x, cy: cell.y, x, y,
        vx: Math.cos(outward) * speed + rand(-55, 55),
        vy: Math.sin(outward) * speed - rand(140, 230),
        rot, vr: rand(-7, 7), life: 1.5, bullets: bullets.get(cell.id) ?? [],
      });
    }
  }

  /** Keep the normal weapon's signature hit effect, with the correct material palette. */
  private specialImpact(x: number, y: number, material: 'rock' | 'diamond' | 'gold') {
    const w = this.weapon;
    const fx = FX[w.id];
    const dx = x - CX, dy = y - this.targetY;
    const dist = Math.hypot(dx, dy) || 1;
    const chips = material === 'rock' ? ['#aab6c6', '#627388', '#e1ebf7']
      : material === 'diamond' ? ['#a5f3fc', '#67e8f9', '#e0f2fe']
        : ['#fbbf24', '#fde68a', '#a16207'];
    spawnImpact(this.sink, fx, w, x, y, dx / dist, dy / dist, chips);
    this.hitStop = Math.max(this.hitStop, fx.hitstop);
    this.camY -= fx.kick;
    this.bump = Math.max(this.bump, material === 'rock' ? 0.55 : 0.2);
    this.shake = Math.max(this.shake, 3 + fx.kick * 0.8);
    if (fx.tint) {
      this.tintA = Math.max(this.tintA, fx.tint);
      this.tintRgb = fx.light;
    }
    if (HIT_SFX[w.id]) HIT_SFX[w.id]!();
    else if (w.energy && !w.slow && !w.pullCoins) sfx.zap();
    // Reuse the weapon's normal-stage signature effects without importing
    // classic-target perks (which would alter special-stage coin accounting).
    if (w.explode) this.explodeAt(x, y, w.id === 'bazooka' ? 1.3 : w.id === 'bamboo' ? 1.2 : 1, w.explodeFx ?? 'fire');
    if (w.id === 'cricket') {
      this.particles.push({ x, y, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 180, color: '#7cc8ff', kind: 'ring', rot: 0, vr: 0, g: 0 });
      this.shake = Math.max(this.shake, 12);
    }
    if (w.id === 'storm') this.sink.push({ x, y: -20, tx: x, ty: y, vx: 0, vy: 0, life: 0.3, max: 0.3, size: 4, color: '#dbeafe', kind: 'bolt', rot: 0, vr: 0, g: 0 });
    if (w.id === 'meteor') this.sink.push({ x: x - 160, y: -40, tx: x, ty: y, vx: 0, vy: 0, life: 0.15, max: 0.15, size: 5, color: '#fb923c', kind: 'bolt', rot: 0, vr: 0, g: 0 });
    // Match the normal stage's weapon-specific flourish as well as its shared
    // impact profile. Only visual effects go here: chest coins still need to
    // fly to the counter, and obstacle perks must not invent classic targets.
    if (w.burn || w.id === 'dragon') for (let i = 0; i < 14; i++) {
      this.sink.push({ x: x + rand(-10, 10), y, vx: rand(-120, 120), vy: rand(-200, 40), life: rand(0.3, 0.6), max: 0.6,
        size: rand(5, 10), color: pick(['255,200,80', '255,120,30', '255,60,20']), kind: 'glow', rot: 0, vr: 0, g: -200 });
    }
    if (w.confetti) for (let i = 0; i < 28; i++) {
      this.sink.push({ x, y, vx: rand(-340, 340), vy: rand(-370, -80), life: rand(0.8, 1.4), max: 1.4,
        size: rand(3, 6), color: pick(['#f43f5e', '#facc15', '#22d3ee', '#a855f7', '#4ade80', '#fb923c']),
        kind: 'chip', rot: rand(0, TAU), vr: rand(-25, 25), g: 350 });
    }
    if (w.rope) this.sink.push({ x, y, vx: 0, vy: 0, life: 0.45, max: 0.45, size: 70, color: '#a5f3fc', kind: 'ring', rot: 0, vr: 0, g: 0 });
    if (w.notes) {
      sfx3.note(this.perkCount++ % 10);
      for (let i = 0; i < 3; i++) this.sink.push({ x: x + rand(-20, 20), y, vx: rand(-60, 60), vy: rand(-160, -80),
        life: 1.1, max: 1.1, size: 18, color: pick(['#fde68a', '#fca5a5', '#a5f3fc', '#bbf7d0']), kind: 'text',
        rot: 0, vr: 0, g: 0, text: pick(['♪', '♫', '♬']) });
    }
    if (w.id === 'fish') sfx.splash();
    if (material === 'rock' && w.slow) {
      const water = w.slowStyle === 'water' || w.id === 'soaker';
      const honey = w.slowStyle === 'honey';
      if (this.slowT <= 0) this.addText(w.slowText ?? '❄ BEKU!', x, y + 50,
        honey ? '#ffd56c' : water ? '#93c5fd' : '#bff1ff', 22);
      this.applySlow(w.slowTime ?? 1.3, w.slowFactor ?? 0.3, w.slowRgb ?? '170,230,255',
        honey ? 'honey' : water ? 'water' : 'ice');
      if (w.id !== 'soaker' && w.id !== 'honey') for (let i = 0; i < 10; i++) {
        const a = rand(0, TAU), speed = rand(60, 260);
        this.particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: rand(0.4, 0.8), max: 0.8,
          size: rand(2, 4), color: pick(water ? ['#ffffff', '#93c5fd', '#3b82f6'] : ['#ffffff', '#d6f6ff', '#9be7ff']),
          kind: 'chip', rot: rand(0, TAU), vr: rand(-10, 10), g: water ? 900 : 300 });
      }
    }
  }

  private drawEmbeddedShot(c: CanvasRenderingContext2D, shot: EmbeddedShot, x: number, y: number, surfaceOffset = 0) {
    c.save();
    c.translate(x, y);
    c.rotate(shot.angle - Math.PI / 2);
    // The rock stores the impact 7px inside its cell; the chest stores it
    // half a bullet inside the lid. Align honey, peeled fruit, hornet,
    // energy orbs and celestial star art without moving the hitboxes.
    const surfaceAligned = shot.w === 'honey' || shot.w === 'banana'
      || shot.w === 'bee' || shot.w === 'moonbeam' || shot.w === 'plasma' || shot.w === 'blackhole';
    if (surfaceAligned) c.translate(0, surfaceOffset - (getWeapon(shot.w).stick + EMBED)
      * (shot.w === 'moonbeam' ? 0.53 : 0.5));
    if (shot.w === 'snowball') c.translate(0, surfaceOffset);
    c.scale(shot.scale, shot.scale);
    const oldBig = gunState.bigShot, oldTint = gunState.tint;
    gunState.bigShot = shot.big;
    if (shot.tint) gunState.tint = shot.tint;
    this.drawProj(c, shot.w, undefined, shot.age, shot.w === 'snowball' || surfaceAligned);
    gunState.bigShot = oldBig;
    gunState.tint = oldTint;
    c.restore();
  }

  private burstSpecial(x: number, y: number, type: 'rock' | 'diamond' | 'gold', count: number) {
    const palette = type === 'gold' ? ['#ffe99e', '#ffc83d', '#ffffff']
      : type === 'diamond' ? ['#a5f3fc', '#ffffff', '#67e8f9'] : ['#aab6c6', '#6a7b91', '#e1ebf7'];
    for (let i = 0; i < count; i++) {
      const a = rand(0, TAU), speed = rand(100, 320);
      this.particles.push({
        x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 80,
        life: rand(0.35, 0.7), max: 0.7, size: rand(2, 5), color: pick(palette),
        kind: type === 'rock' ? 'shard' : 'star', rot: rand(0, TAU), vr: rand(-12, 12), g: type === 'rock' ? 1000 : 280,
      });
    }
  }

  private payStageReward() {
    if (this.stageRewardPaid || this.state !== 'clear' || !isSpecial(this.level.mode)) return;
    // A chest hit isn't a payout until every coin has bounced and reached the HUD.
    if (this.level.mode === 'treasure' && this.treasureCoins.length) return;
    this.stageRewardPaid = true;
    const earned = this.coins - this.stageStartCoins;
    if (this.level.mode === 'treasure') {
      this.addText(`🧰 HARTA +${earned}!`, CX, this.targetY + 185, '#fde68a', 26);
      this.stateT = 0; // Show the final amount before loading the next level.
    }
    // Treasure coins were deposited one by one on arrival. Stage rewards for
    // stone/bonus (or a game without onTreasureCoin) are still paid here.
    const unbanked = this.level.mode === 'treasure' && this.events.onTreasureCoin ? 0 : earned;
    const diamondReward = this.level.mode === 'boulder' && this.centerDiamondCollected ? 50 : 0;
    if (this.events.onStageReward) {
      this.bankedCoins += unbanked;
      this.events.onStageReward(this.level.mode, this.level.n, unbanked, diamondReward);
    }
  }

  private finishSpecialStage() {
    if (this.state !== 'play' || !isSpecial(this.level.mode)) return;
    const mode = this.level.mode;
    this.state = 'clear';
    this.stateT = 0;
    this.projs = [];
    this.star = null;
    this.holding = false;
    this.choosingBuff = false;
    this.flashWhite = 0.42;
    this.shake = Math.max(this.shake, 8);
    if (mode === 'boulder') {
      this.coins += 3;
      this.score += 75;
      this.addText('BERLIAN BERSIH! +3 APEL', CX, this.targetY + 185, '#a5f3fc', 28);
    } else if (mode === 'bonus') {
      this.addText(`🪙 BONUS +${this.coins - this.stageStartCoins}!`, CX, this.targetY + 185, '#fde68a', 26);
    } else if (this.treasureCoins.length) {
      this.addText('🪙 KOIN BERTEBARAN!', CX, this.targetY + 185, '#fde68a', 26);
    }
    this.payStageReward();
    this.sink.light(CX, this.targetY, 250, mode === 'boulder' ? '125,230,255' : '255,213,74', 0.8);
    this.burstSpecial(CX, this.targetY, mode === 'boulder' ? 'diamond' : 'gold', 38);
    sfx4.match();
  }

  private updateTreasureShower(dt: number) {
    this.coinPulse = Math.max(0, this.coinPulse - dt * 5);
    if (!this.treasureCoins.length) return;
    const landed = advanceTreasureCoins(this.treasureCoins, dt, (x, y) => this.burstSpecial(x, y, 'gold', 3));
    if (landed > 0) {
      this.coins += landed;
      this.score += landed * 25;
      this.coinPulse = 1;
      this.sink.light(W - 28, 34, 58, '255,215,90', 0.18);
      this.burstSpecial(W - 28, 34, 'gold', Math.min(7, landed + 2));
      if (this.time - this.lastCoinSound > 0.08) {
        sfx.coin();
        this.lastCoinSound = this.time;
      }
      if (this.events.onTreasureCoin) {
        this.bankedCoins += landed;
        this.events.onTreasureCoin(landed);
      }
    }
    if (this.state === 'clear' && !this.treasureCoins.length) this.payStageReward();
  }

  private advanceReload(dt: number) {
    if (this.reloadT <= 0) return;
    this.reloadT = Math.max(0, this.reloadT - dt);
    if (this.reloadT > 0) return;
    // Special stages also refill their stage allowance; ordinary stages only
    // reload the snow hopper, never granting extra shots beyond their quota.
    if (isSpecial(this.level.mode) && this.ammoLeft === 0) this.ammoLeft = this.level.ammo * this.maxAmmoMult;
    if (this.weapon.id === 'snowball') this.snowLoaded = Math.min(SNOWBALL_MAG_SIZE, this.ammoLeft);
  }

  private update(dt: number) {
    // The stage clock and gun must stop while the player chooses a star upgrade.
    if (this.choosingBuff) return;
    this.rock?.update(dt);
    this.chest?.update(dt);
    this.diamondPing = Math.max(0, this.diamondPing - dt * 3);
    if (isSpecial(this.level.mode) && this.state === 'play') {
      this.stageTime = Math.max(0, this.stageTime - dt);
      if (this.stageTime === 0) {
        if (this.level.mode === 'boulder') {
          this.state = 'fail';
          this.stateT = 0;
          this.projs = [];
          this.holding = false;
          this.addText('WAKTU HABIS!', CX, this.targetY + 185, '#fb7185', 26);
          sfx.clang();
        } else this.finishSpecialStage();
      }
    }
    this.advanceReload(dt);
    this.timeScale += (1 - this.timeScale) * Math.min(1, dt * 2.5);
    let s = dt * this.timeScale;
    if (this.hitStop > 0) {
      this.hitStop -= dt;
      s *= 0.06;
    }
    this.camY *= Math.exp(-dt * 11);
    this.rt += dt;
    // ketapel: creak when starting to draw the band
    if (this.weapon.id === 'slingshot' && !this.stretchPlayed && this.rt - this.lastShotRT > 0.16) {
      this.stretchPlayed = true;
      if (this.state === 'play' && this.ammoLeft > 0) sfx4.stretch();
    }
    // charge blaster
    if (this.charging) {
      if (this.state !== 'play') this.charging = false;
      this.chargeT += dt;
      const stage = this.chargeT >= 1 ? 2 : this.chargeT >= 0.35 ? 1 : 0;
      if (stage > this.chargeStage) {
        this.chargeStage = stage;
        if (stage === 1) sfx4.chargeStart();
        else sfx4.chargeFull();
        for (const ox of this.gunOffsets) this.sink.push({ x: CX + ox, y: GUN_Y + 2, vx: 0, vy: 0, life: 0.3, max: 0.3, size: stage === 2 ? 90 : 50, color: stage === 2 ? '254,240,138' : '125,211,252', kind: 'shock', rot: 0, vr: 0, g: 0 });
      }
      for (const ox of this.gunOffsets) {
        if (Math.random() < 0.6) {
          const a = rand(0, TAU);
          const d = rand(40, 70);
          this.sink.push({ x: CX + ox + Math.cos(a) * d, y: GUN_Y + 2 + Math.sin(a) * d, vx: -Math.cos(a) * d * 4, vy: -Math.sin(a) * d * 4, life: 0.25, max: 0.25, size: rand(2, 4), color: stage === 2 ? '254,240,138' : '125,211,252', kind: 'glow', rot: 0, vr: 0, g: 0 });
        }
        this.sink.light(CX + ox, GUN_Y, 60 + Math.min(1, this.chargeT) * 120, stage === 2 ? '254,240,138' : '125,211,252', 0.05);
      }
      if (stage === 2 && Math.random() < 0.15) sfx4.chargeHum(2);
    }
    gunState.charge = this.charging ? Math.min(1, this.chargeT) : 0;
    this.tintA = Math.max(0, this.tintA - dt * 1.6);
    this.comboPop = Math.max(0, this.comboPop - dt * 4);
    // Tekken-style healthbar delayed red drain effect
    if (this.bossHpRed > this.bossHp) {
      this.bossHpRed = Math.max(this.bossHp, this.bossHpRed - dt * 35);
    }
    for (let i = this.lights.length - 1; i >= 0; i--) {
      this.lights[i].life -= dt;
      if (this.lights[i].life <= 0) this.lights.splice(i, 1);
    }
    this.time += s;
    // Real-time, staggered coin arrivals continue during the treasure-clear
    // celebration, but freeze while the star's choice modal is open.
    this.updateTreasureShower(dt);

    if (this.state !== 'clear') {
      this.levelTime += s;
      const v = this.state === 'idle' ? 1.1 : this.level.mode === 'bonus' ? this.level.dir * 1.05
        : this.level.mode === 'treasure' ? 0 : PATTERNS[this.level.pattern](this.levelTime, this.level.base, this.level.dir);
      const f0 = this.slowF;
      const slowF = this.slowT > 0 ? f0 + (1 - f0) * Math.max(0, (0.3 - this.slowT) / 0.3) : 1;
      const aimF = this.aiming ? 0.28 : 1;
      // Faster, readable boss rhythms: Knight reverses every 7s, Oni every 5s,
      // while Cyborg and Pirate reverse smoothly on their own distinct cycles.
      if (this.level.boss) this.rot += bossRotationSpeed(this.level.style as BossType, this.levelTime) * s * slowF * aimF;
      else this.rot += v * s * slowF * aimF;
      this.slowT = Math.max(0, this.slowT - s);
    }
    if (this.aiming) {
      this.aimT += dt;
      if (this.state !== 'play') this.aiming = false;
    }
    // minigun spin
    if (this.weapon.spinup) {
      if (this.holding && this.state === 'play') this.spin = Math.min(1, this.spin + dt * 1.1);
      else this.spin = Math.max(0, this.spin - dt * 1.6);
      if (this.holding && this.spin > 0.25 && this.state === 'play') this.shoot();
    } else this.spin = 0;
    gunState.spin = this.spin;
    gunState.spinAngle += dt * (2 + this.spin * 40);
    // burn
    if (this.burnT > 0 && this.state === 'play') {
      this.burnT -= s;
      this.burnTick -= s;
      if (this.burnTick <= 0) {
        this.burnTick = 0.5;
        this.score += 1;
        sfx2.burn();
        const a = rand(0, TAU);
        const p = this.worldPos(a, this.level.radius * rand(0.3, 0.95));
        this.addText(`+1${this.weapon.burnIcon ?? '🔥'}`, p.x, p.y, '#ffb347', 16);
      }
      const isBee = this.weapon.burnIcon === '🐝';
      for (let i = 0; i < (isBee ? 1 : 2); i++) {
        const a = rand(0, TAU);
        const p = { x: CX + Math.cos(a) * this.level.radius * rand(0.2, 1), y: CY + Math.sin(a) * this.level.radius * rand(0.2, 1) };
        if (isBee) this.particles.push({ x: p.x, y: p.y, vx: rand(-120, 120), vy: rand(-120, 120), life: 0.4, max: 0.4, size: 3, color: pick(['#facc15', '#111111']), kind: 'chip', rot: 0, vr: 30, g: 0 });
        else this.particles.push({ x: p.x, y: p.y, vx: rand(-20, 20), vy: rand(-90, -40), life: rand(0.3, 0.6), max: 0.6, size: rand(4, 8), color: pick(['255,200,80', '255,120,30', '255,60,20']), kind: 'glow', rot: 0, vr: 0, g: -60 });
      }
    }
    this.spikeOffT = Math.max(0, this.spikeOffT - s);
    this.glitchT = Math.max(0, this.glitchT - dt);
    // pushed spikes slide
    for (const it of this.items) {
      if (it.vel) {
        it.angle = norm(it.angle + it.vel * s);
        it.vel *= Math.exp(-s * 6);
        if (Math.abs(it.vel) < 0.02) it.vel = 0;
      }
      if (it.w === 'seed' && !it.harvested && it.age > 1.7 && this.state === 'play') {
        it.harvested = true;
        this.coins++;
        sfx2.bloom();
        const p = this.worldPos(it.angle, this.level.radius + 30);
        this.addText('🌸 +1 💰', p.x, p.y, '#f9a8d4', 18);
      }
    }
    // grow ray
    if (this.targetR && this.state !== 'clear') {
      this.level.radius += (this.targetR - this.level.radius) * Math.min(1, dt * 8);
    }
    for (let i = this.portals.length - 1; i >= 0; i--) {
      this.portals[i].life -= dt;
      if (this.portals[i].life <= 0) this.portals.splice(i, 1);
    }

    // Star flies across the open lane between the target and the upright gun.
    if (this.state === 'play' && allowsStarPowerups(this.level) && !this.star) {
      this.starTimer -= dt;
      if (this.starTimer <= 0) {
        this.starTimer = 14 + Math.random() * 8;
        this.spawnFloatingStar();
      }
    }
    if (this.star) {
      this.star.age += dt;
      this.star.life -= dt;
      this.star.x += this.star.vx * dt;
      this.star.y = this.star.baseY + Math.sin(this.star.age * 3.2) * 6;
      if (this.star.life <= 0 || this.star.x < -55 || this.star.x > W + 55) this.star = null;
    }

    // Rounds retain the local position/orientation of their exact rock cell;
    // detached cells and every round trapped in them share one rigid transform.
    for (const shot of this.rockBullets) shot.age += s;
    for (const shot of this.chestBullets) shot.age += s;
    for (let i = this.fallenCells.length - 1; i >= 0; i--) {
      const f = this.fallenCells[i];
      f.vy += 1500 * s;
      f.x += f.vx * s;
      f.y += f.vy * s;
      f.rot += f.vr * s;
      f.life -= dt;
      for (const shot of f.bullets) shot.age += s;
      if (f.life <= 0 || f.y > H + 90) this.fallenCells.splice(i, 1);
    }

    // ═══════ FRAGMEN BATU ═══════
    for (let i = this.rockFragments.length - 1; i >= 0; i--) {
      const f = this.rockFragments[i];
      f.vy += 1500 * s;
      f.x += f.vx * s;
      f.y += f.vy * s;
      f.rot += f.vr * s;
      f.life -= dt;
      if (f.life <= 0 || f.y > H + 200) this.rockFragments.splice(i, 1);
    }

    // ---------------- BOSS SHOOTING ATTACK MECHANIC ----------------
    if (this.level.boss && this.state === 'play') {
      this.bossShootTimer -= s;
      if (this.bossShootTimer <= 0) {
        const bDef = getBossDef(this.level.style);
        this.bossShootTimer = bossFireInterval(bDef.fireInterval, rand(-0.18, 0.22));
        const bType = this.level.style as BossType;
        // Boss launches projectile downward toward the player with aim spread
        const spawnY = this.targetY + this.level.radius * 0.8;
        const targetX = CX + rand(-60, 60);
        const dx = targetX - CX;
        const dy = (GUN_Y + 40) - spawnY;
        const dist = Math.hypot(dx, dy);
        // Boss shots travel 1.9x faster, but retain clear telegraphing and interceptable hitboxes.
        const spd = (160 + this.level.n * 3) * 1.9;
        this.bossProjs.push({
          x: CX,
          y: spawnY,
          vx: (dx / dist) * spd,
          vy: (dy / dist) * spd,
          rot: Math.atan2(dy, dx) - Math.PI / 2,
          type: bType,
        });
        // Attack SFX & alert cue
        if (bType === 'oni') sfx4.busterMid();
        else if (bType === 'cyborg') sfx2.railgun();
        else if (bType === 'pirate') sfx2.pirate();
        else sfx3.keris();
        // Crisp boss-specific firing flecks instead of a large halo around the boss.
        const bossRgb = bType === 'knight' ? '56,189,248' : bType === 'oni' ? '239,68,68' : bType === 'cyborg' ? '34,211,238' : '234,179,8';
        for (let k = 0; k < 5; k++) {
          this.particles.push({
            x: CX + rand(-12, 12), y: spawnY + rand(-8, 8),
            vx: rand(-95, 95), vy: rand(-70, 70), life: 0.16, max: 0.16,
            size: rand(2, 4), color: bossRgb, kind: bType === 'oni' ? 'glow' : 'spark',
            rot: 0, vr: 0, g: 0,
          });
        }
      }
    }

    // Update & step boss projectiles
    for (let i = this.bossProjs.length - 1; i >= 0; i--) {
      const bp = this.bossProjs[i];
      bp.x += bp.vx * s;
      bp.y += bp.vy * s;
      // Ujung proyektil selalu menghadap arah geraknya (ke arah pemain),
      // tidak berputar-putar di jalan.
      bp.rot = Math.atan2(bp.vy, bp.vx) - Math.PI / 2;

      // Api/jejak menyala mengekor di EKOR peluru (sisi berlawanan arah
      // gerak), bukan menempel di badan peluru.
      const spdH = Math.hypot(bp.vx, bp.vy) || 1;
      const dirx = bp.vx / spdH, diry = bp.vy / spdH;
      const tailX = bp.x - dirx * 44;
      const tailY = bp.y - diry * 44;
      if (Math.random() < 0.85) {
        // Tail material/color follows each boss rather than sharing orange fire.
        const trail = bp.type === 'knight'
          ? { color: '56,189,248', kind: 'spark' as const }
          : bp.type === 'oni'
          ? { color: '239,68,68', kind: 'glow' as const }
          : bp.type === 'cyborg'
          ? { color: '34,211,238', kind: 'spark' as const }
          : { color: '71,85,105', kind: 'smoke' as const };
        this.particles.push({
          x: tailX + rand(-7, 7),
          y: tailY + rand(-7, 7),
          vx: -dirx * rand(30, 90) + rand(-25, 25),
          vy: -diry * rand(30, 90) + rand(-25, 25),
          life: bp.type === 'pirate' ? 0.48 : 0.28,
          max: bp.type === 'pirate' ? 0.48 : 0.28,
          size: bp.type === 'pirate' ? rand(4, 7) : rand(2.5, 5),
          color: bp.type === 'pirate' ? 'rgba(71,85,105,' : trail.color,
          kind: trail.kind,
          rot: 0,
          vr: 0,
          g: 0,
        });
        if (bp.type === 'oni') {
          this.particles.push({
            x: tailX + rand(-5, 5),
            y: tailY + rand(-5, 5),
            vx: -dirx * rand(40, 110) + rand(-18, 18),
            vy: -diry * rand(40, 110) + rand(-18, 18),
            life: 0.22, max: 0.22, size: rand(4, 7.5),
            color: pick(['255,200,80', '255,120,30', '255,60,20']),
            kind: 'glow', rot: 0, vr: 0, g: 0,
          });
        } else if (bp.type === 'pirate' && Math.random() < 0.45) {
          this.particles.push({
            x: tailX + rand(-5, 5), y: tailY + rand(-5, 5),
            vx: -dirx * 35 + rand(-20, 20), vy: -diry * 35 + rand(-20, 20),
            life: 0.3, max: 0.3, size: rand(2, 3.5), color: '34,197,94',
            kind: 'spark', rot: 0, vr: 0, g: 0,
          });
        }
      }

      // 1. Collision with player's rising projectiles (Hitbox besar 40px karena ukuran proyektil 3x!)
      let intercepted = false;
      for (let j = this.projs.length - 1; j >= 0; j--) {
        const pp = this.projs[j];
        if (Math.hypot(pp.x - bp.x, pp.y - bp.y) < 42) {
          intercepted = true;
          this.projs.splice(j, 1);
          break;
        }
      }
      if (intercepted) {
        this.bossProjs.splice(i, 1);
        sfx.clang();
        sfx4.match();
        this.shake = Math.max(this.shake, 7);
        this.score += 2;
        // AMMO KEMBALI 1 KALO BERHASIL HANCURKAN SERANGAN BOS!
        this.ammoLeft = Math.min(this.level.ammo * this.maxAmmoMult, this.ammoLeft + 1);
        this.addText('💥 TANGKIS! +1 AMMO +2', bp.x, bp.y - 15, '#38bdf8', 22);
        this.sink.push({ x: bp.x, y: bp.y, vx: 0, vy: 0, life: 0.4, max: 0.4, size: 90, color: '#38bdf8', kind: 'shock', rot: 0, vr: 0, g: 0 });
        for (let k = 0; k < 12; k++) {
          this.particles.push({
            x: bp.x, y: bp.y, vx: rand(-200, 200), vy: rand(-200, 200), life: 0.3, max: 0.3, size: rand(2.5, 5), color: '#38bdf8', kind: 'spark', rot: 0, vr: 0, g: 300,
          });
        }
        continue;
      }

      // 2. Boss projectile damage: only knocks player weapon or grazes (no unfair sudden deaths!)
      if (bp.y >= GUN_Y - 15 && bp.y <= GUN_Y + 70 && this.gunOffsets.some(ox => Math.abs(bp.x - (CX + ox)) < 26)) {
        this.bossProjs.splice(i, 1);
        sfx.clang();
        this.shake = Math.max(this.shake, 8);
        this.recoil = 1.6;
        this.addText('SERANGAN BOS!', bp.x, GUN_Y - 20, '#ef4444', 20);
        this.sink.push({ x: bp.x, y: bp.y, vx: 0, vy: 0, life: 0.35, max: 0.35, size: 50, color: '#ef4444', kind: 'shock', rot: 0, vr: 0, g: 0 });
        break;
      }

      // Out of bounds
      if (bp.y > H + 50 || bp.x < -40 || bp.x > W + 40) {
        this.bossProjs.splice(i, 1);
      }
    }

    if (this.state === 'intro') {
      this.introT += dt;
      if (this.introT >= 0.5) this.state = 'play';
    }
    this.bannerT = Math.max(0, this.bannerT - dt);

    this.cooldown -= dt;
    if (this.weapon.auto && !this.weapon.spinup && this.holding && this.state === 'play') this.shoot();
    for (let i = this.beams.length - 1; i >= 0; i--) {
      this.beams[i].life -= dt;
      if (this.beams[i].life <= 0) this.beams.splice(i, 1);
    }
    const tw = this.weapon;
    for (const p of this.projs) {
      // The portal is a self-contained vortex. Even isolated glow motes in a
      // straight line make it read as a round head with a tadpole's tail.
      if (tw.id === 'portal') continue;
      const px = p.x + rand(-4, 4);
      const py = p.y + rand(20, 46);
      if (tw.id === 'snowball') {
        for (let k = 0; k < 6; k++) {
          this.sink.push({ x: p.x + rand(-16, 16), y: p.y + rand(29, 69),
            vx: rand(-60, 60), vy: rand(25, 90), life: rand(0.25, 0.49), max: 0.49,
            size: rand(1.5, 3.6), color: pick(['#ffffff', '#f8fdff', '#eaf6fb']), kind: 'snowDust',
            rot: 0, vr: 0, g: 110, drag: 1.4 });
        }
        for (let k = 0; k < 2; k++) {
          this.sink.push({ x: p.x + rand(-15, 15), y: p.y + rand(36, 64),
            vx: rand(-50, 50), vy: rand(20, 85), life: rand(0.3, 0.52), max: 0.52,
            size: rand(2.2, 4.2), color: '#ffffff', kind: 'snowflake',
            rot: rand(0, TAU), vr: rand(-5, 5), g: 75, drag: 1.7 });
        }
        continue;
      }
      if (tw.id === 'soaker') {
        for (let k = 0; k < 3; k++) {
          this.sink.push({ x: p.x + rand(-11, 11), y: p.y + rand(23, 67), vx: rand(-95, 95),
            vy: rand(45, 155), life: rand(0.23, 0.45), max: 0.45, size: rand(1.6, 4.1),
            color: pick(['#ddfaff', '#7dd3fc', '#bae6fd']), kind: 'waterDrop',
            rot: 0, vr: 0, g: 800, drag: 0.8 });
        }
        continue;
      }
      switch (tw.trailFx) {
        case 'glow':
        case 'void':
          this.particles.push({ x: px, y: py, vx: rand(-30, 30), vy: rand(20, 80), life: rand(0.2, 0.4), max: 0.4, size: rand(2.5, 5), color: tw.trail, kind: 'glow', rot: 0, vr: 0, g: 0 });
          break;
        case 'smoke':
          this.particles.push({ x: px, y: py + 6, vx: rand(-25, 25), vy: rand(30, 90), life: rand(0.5, 0.9), max: 0.9, size: rand(6, 12), color: 'rgba(170,170,170,', kind: 'smoke', rot: 0, vr: 0, g: -20 });
          this.particles.push({ x: p.x, y: p.y + 44, vx: rand(-20, 20), vy: rand(60, 140), life: 0.15, max: 0.15, size: rand(5, 9), color: '255,160,50', kind: 'glow', rot: 0, vr: 0, g: 0 });
          break;
        case 'spark':
          this.particles.push({ x: px, y: py, vx: rand(-200, 200), vy: rand(-50, 150), life: 0.15, max: 0.15, size: 1.5, color: pick(tw.sparks), kind: 'spark', rot: 0, vr: 0, g: 0 });
          break;
        case 'bubble':
          if (Math.random() < 0.6) this.particles.push({ x: px, y: py, vx: rand(-20, 20), vy: rand(-10, 30), life: rand(0.3, 0.5), max: 0.5, size: rand(1.5, 3), color: tw.trail, kind: 'glow', rot: 0, vr: 0, g: 0 });
          break;
        case 'frost':
          this.particles.push({ x: px, y: py, vx: rand(-40, 40), vy: rand(10, 60), life: rand(0.3, 0.5), max: 0.5, size: rand(2, 4), color: tw.trail, kind: 'glow', rot: 0, vr: 0, g: 0 });
          break;
        case 'gold':
          this.particles.push({ x: px, y: py, vx: rand(-60, 60), vy: rand(0, 80), life: 0.25, max: 0.25, size: 1.5, color: pick(tw.sparks), kind: 'spark', rot: 0, vr: 0, g: 200 });
          break;
        case 'fire':
          for (let k = 0; k < 2; k++) this.particles.push({ x: px, y: py, vx: rand(-40, 40), vy: rand(40, 120), life: rand(0.2, 0.4), max: 0.4, size: rand(4, 8), color: pick(['255,200,80', '255,120,30', '255,60,20']), kind: 'glow', rot: 0, vr: 0, g: -100 });
          break;
        case 'pixel':
          this.particles.push({ x: px, y: py, vx: 0, vy: rand(20, 60), life: 0.3, max: 0.3, size: rand(2, 4), color: pick(['#ff0055', '#00ffee', '#22ff88']), kind: 'chip', rot: 0, vr: 0, g: 0 });
          break;
        case 'confetti':
          this.particles.push({ x: px, y: py, vx: rand(-80, 80), vy: rand(0, 80), life: rand(0.4, 0.7), max: 0.7, size: rand(2, 4), color: pick(tw.sparks), kind: 'chip', rot: rand(0, TAU), vr: rand(-20, 20), g: 200 });
          break;
        case 'rainbow': {
          // Lush ribbon trail across all 6 pastel rainbow bands with trailing stardust
          const RBC = ['248,113,113', '251,146,60', '250,204,21', '74,222,128', '96,165,250', '192,132,252'];
          for (let k = 0; k < 6; k++) {
            const ox = (k - 2.5) * 3.2;
            this.sink.push({ x: p.x + ox, y: p.y + 18, vx: rand(-10, 10), vy: rand(50, 120), life: 0.45, max: 0.45, size: 3.5, color: RBC[k], kind: 'glow', rot: 0, vr: 0, g: 0 });
          }
          for (let k = 0; k < 2; k++) {
            this.sink.push({ x: px + rand(-12, 12), y: py + rand(10, 30), vx: rand(-40, 40), vy: rand(20, 60), life: rand(0.4, 0.7), max: 0.7, size: rand(4, 7), color: '#ffffff', kind: 'star', rot: 0, vr: 0, g: 0, drag: 2 });
          }
          break;
        }
        case 'petal':
          if (Math.random() < 0.7) this.sink.push({ x: px, y: py, vx: rand(-90, 90), vy: rand(-20, 60), life: rand(0.7, 1.2), max: 1.2, size: rand(2.5, 4.5), color: pick(['#fbcfe8', '#f9a8d4', '#fdf2f8']), kind: 'petal', rot: rand(0, TAU), vr: rand(-8, 8), g: 60, drag: 1.5 });
          break;
        case 'note':
          if (Math.random() < 0.25) this.particles.push({ x: px + rand(-14, 14), y: py, vx: rand(-40, 40), vy: rand(-30, 30), life: 0.7, max: 0.7, size: 14, color: pick(['#fde68a', '#fca5a5', '#a5f3fc']), kind: 'text', rot: 0, vr: 0, g: 0, text: pick(['♪', '♫']) });
          this.sink.push({ x: px, y: py, vx: 0, vy: 40, life: 0.3, max: 0.3, size: 3, color: tw.trail, kind: 'glow', rot: 0, vr: 0, g: 0 });
          break;
      }
    }
    this.recoil = Math.max(0, this.recoil - dt * 7);
    this.muzzle -= dt;
    this.bump *= Math.exp(-dt * 14);
    this.hitFlash = Math.max(0, this.hitFlash - dt * 7);
    this.shake *= Math.exp(-dt * 9);
    this.flashWhite = Math.max(0, this.flashWhite - dt * 2.5);
    this.flashRed = Math.max(0, this.flashRed - dt * 1.8);
    for (const it of this.items) it.age += s;

    // projectiles
    for (let i = this.projs.length - 1; i >= 0; i--) {
      const p = this.projs[i];
      const ghostN = FX[this.weapon.id].ghost;
      if (ghostN) {
        p.hist = p.hist ?? [];
        p.hist.push({ x: p.x, y: p.y });
        if (p.hist.length > ghostN) p.hist.shift();
      }
      const dist = Math.hypot(p.vx, p.vy) * s;
      const steps = Math.max(1, Math.ceil(dist / 7));
      let r: StepRes = { res: 'none' };
      for (let k = 0; k < steps; k++) {
        p.x += (p.vx * s) / steps;
        p.y += (p.vy * s) / steps;
        r = this.stepProj(p);
        if (r.res !== 'none') break;
      }
      if (r.res === 'stick') {
        this.projs.splice(i, 1);
        this.stickAt(r.local ?? norm(Math.PI / 2 - this.rot), p);
        if ((this.state as State) === 'clear') break;
      } else if (r.res === 'hit') {
        // Consume one projectile per stone/star hit; a star pauses further shots.
        const idx = this.projs.indexOf(p);
        if (idx >= 0) this.projs.splice(idx, 1);
        if (this.choosingBuff || (this.state as State) === 'clear') break;
      } else if (r.res === 'fail') {
        if (this.trySave(p, !!r.spike)) {
          const idx = this.projs.indexOf(p);
          if (idx >= 0) this.projs.splice(idx, 1);
          if ((this.state as State) === 'clear') break;
          continue;
        }
        this.failProjAngle = 0;
        this.fail(p);
        break;
      } else if (p.y < -80 || p.x < -80 || p.x > W + 80) {
        this.projs.splice(i, 1);
      }
    }

    // particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= s;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.vy += p.g * s;
      if (p.drag) {
        const k = Math.exp(-p.drag * s);
        p.vx *= k;
        p.vy *= k;
      }
      p.x += p.vx * s;
      p.y += p.vy * s;
      p.rot += p.vr * s;
      if (p.kind === 'text') p.vy *= Math.exp(-s * 3);
      if ((p.kind === 'chip' || p.kind === 'shard' || p.kind === 'drop' || p.kind === 'snowChunk' || p.kind === 'waterDrop')
        && p.y > H - 14 && p.vy > 0) {
        p.y = H - 14;
        p.vy *= -0.35;
        p.vx *= 0.7;
      }
      if (p.kind === 'shell' && p.y > H - 20 && p.vy > 0) {
        p.y = H - 20;
        p.vy *= -0.4;
        p.vx *= 0.6;
      }
    }
    for (let i = this.frags.length - 1; i >= 0; i--) {
      const f = this.frags[i];
      f.vy += 1300 * s;
      f.x += f.vx * s;
      f.y += f.vy * s;
      f.rot += f.vr * s;
      if (f.y > H + 200) this.frags.splice(i, 1);
    }
    for (let i = this.flyers.length - 1; i >= 0; i--) {
      const f = this.flyers[i];
      f.vy += 1400 * s;
      f.x += f.vx * s;
      f.y += f.vy * s;
      f.rot += f.vr * s;
      if (f.y > H + 150) this.flyers.splice(i, 1);
    }
    for (const d of this.dust) {
      d.y -= d.v * dt;
      d.x += Math.sin(this.time + d.y * 0.01) * 4 * dt;
      if (d.y < -5) {
        d.y = H + 5;
        d.x = Math.random() * W;
      }
    }

    if (this.state === 'clear') {
      this.stateT += dt;
      if (this.stateT > 1.3 && this.time >= this.diamondHoldUntil && (this.level.mode !== 'treasure' || this.stageRewardPaid)) {
        if (this.level.boss && this.events.onBossDefeated) {
          this.state = 'idle';
          this.bankedCoins += 5; // the boss reward was already included in this.coins
          this.events.onBossDefeated(this.level.name, this.level.n, 5, this.level.style as BossType);
        } else {
          this.loadLevel(this.level.n + 1);
        }
      }
    } else if (this.state === 'fail') {
      this.stateT += dt;
      if (this.stateT > 1.25) {
        this.state = 'over';
        this.events.onGameOver(this.score, this.level.n, Math.max(0, this.coins - this.bankedCoins), this.coins);
      }
    }
  }

  // ---------- drawing ----------
  private drawSpike(c: CanvasRenderingContext2D) {
    c.save();
    c.scale(SPIKE_SCALE, SPIKE_SCALE); // stage-board spikes are doubled; Nail Gun shots stay normal-sized
    const g = c.createLinearGradient(0, 0, 0, SPIKE_LEN + 6);
    g.addColorStop(0, '#2a2d33');
    g.addColorStop(0.6, '#5b616b');
    g.addColorStop(1, '#ff3030');
    c.beginPath();
    c.moveTo(-12, 0);
    c.lineTo(12, 0);
    c.lineTo(0, SPIKE_LEN + 6);
    c.closePath();
    c.fillStyle = g;
    c.fill();
    c.strokeStyle = '#111';
    c.lineWidth = 1.5;
    c.stroke();
    c.beginPath();
    c.moveTo(-3, 2);
    c.lineTo(0, SPIKE_LEN);
    c.strokeStyle = 'rgba(255,255,255,0.35)';
    c.lineWidth = 1.2;
    c.stroke();
    c.restore();
  }

  private drawCoin(c: CanvasRenderingContext2D, t: number, glowing = true) {
    // HUD and classic pickups share Diamond Breaker's reflective dollar coin.
    drawBreakerCoin(c, 0, 0, CLASSIC_COIN_RADIUS, t, 0, Math.abs(Math.cos(t * 3)) * 0.6 + 0.4, glowing);
  }

  // Berlian / Diamond tertancap ke papan arena:
  // Ujung lancip (kerucut / pavilion) menancap ke dalam papan (-Y mengarah ke pusat target),
  // bagian atas (mahkota/table crown) menonjol keluar ke arah +Y sehingga hanya terlihat setengah berlian!
  // Wajib ditembak 2 kali baru lepas dan jatuh!
  private drawEmbeddedDiamond(c: CanvasRenderingContext2D, t: number, hits = 0) {
    const shake = hits === 1 ? Math.sin(t * 34) * 1.6 : 0;
    c.save();
    c.translate(shake, 0);
    c.scale(CLASSIC_DIAMOND_SCALE, CLASSIC_DIAMOND_SCALE);

    const D_SIZE = 14; // Entire normal-stage diamond, including facets and badge, is 20% larger.

    // Pendaran kilau kristal (glow aura)
    c.shadowColor = hits === 1 ? '#fb7185' : '#38bdf8';
    c.shadowBlur = hits === 1 ? 16 : 14;

    // Retakan & serpihan tanah/kayu di sekitar titik tancap (y = 0)
    c.fillStyle = 'rgba(0,0,0,0.45)';
    c.beginPath();
    c.ellipse(0, 0, D_SIZE * 0.8, 3.5, 0, 0, TAU);
    c.fill();

    // 1. Bagian kerucut tajam (pavilion) yang MENANCAP KE DALAM PAPAN (-y direction)
    // Dibuat agak tembus pandang / tertancap di kayu/kulit target
    c.beginPath();
    c.moveTo(0, -D_SIZE * 1.15); // Ujung kerucut paling dalam menancap ke pusat papan!
    c.lineTo(-D_SIZE * 0.82, -1);
    c.lineTo(D_SIZE * 0.82, -1);
    c.closePath();
    const gDeep = c.createLinearGradient(0, -D_SIZE * 1.15, 0, 0);
    if (hits === 1) {
      gDeep.addColorStop(0, 'rgba(159,18,57,0.3)');
      gDeep.addColorStop(0.7, 'rgba(244,63,94,0.6)');
      gDeep.addColorStop(1, 'rgba(253,224,71,0.8)');
    } else {
      gDeep.addColorStop(0, 'rgba(12,74,110,0.35)');
      gDeep.addColorStop(0.65, 'rgba(14,165,233,0.65)');
      gDeep.addColorStop(1, 'rgba(56,189,248,0.85)');
    }
    c.fillStyle = gDeep;
    c.fill();
    c.strokeStyle = hits === 1 ? 'rgba(254,205,211,0.5)' : 'rgba(186,230,253,0.5)';
    c.lineWidth = 1;
    c.stroke();

    // 2. Bagian mahkota berlian (crown & table) yang MENONJOL KELUAR (+y direction)
    // Inilah setengah berlian yang terlihat mengkilap di permukaan papan!
    c.beginPath();
    c.moveTo(-D_SIZE * 0.85, 0);
    c.lineTo(-D_SIZE * 0.55, D_SIZE * 0.65); // Sisi mahkota kiri
    c.lineTo(D_SIZE * 0.55, D_SIZE * 0.65);  // Sisi mahkota kanan
    c.lineTo(D_SIZE * 0.85, 0);
    c.lineTo(0, -3); // Sedikit bevel ke dalam
    c.closePath();

    const gCrown = c.createLinearGradient(-D_SIZE, 0, D_SIZE, D_SIZE * 0.65);
    if (hits === 1) {
      // Retak kemerahan/kuning tanda tembakan 1 mengenai berlian!
      gCrown.addColorStop(0, '#fef08a');
      gCrown.addColorStop(0.35, '#fb7185');
      gCrown.addColorStop(0.7, '#e11d48');
      gCrown.addColorStop(1, '#9f1239');
    } else {
      // Berlian cyan cemerlang berkilauan
      gCrown.addColorStop(0, '#ffffff');
      gCrown.addColorStop(0.2, '#cffafe');
      gCrown.addColorStop(0.6, '#38bdf8');
      gCrown.addColorStop(1, '#0284c7');
    }
    c.fillStyle = gCrown;
    c.fill();
    c.shadowBlur = 0;
    c.strokeStyle = hits === 1 ? '#fecdd3' : '#e0f2fe';
    c.lineWidth = 1.6;
    c.stroke();

    // Garis faset kristal (facet cut) pada setengah berlian yang menonjol
    c.strokeStyle = 'rgba(255,255,255,0.85)';
    c.lineWidth = 1;
    c.beginPath();
    // Garis horizontal faset
    c.moveTo(-D_SIZE * 0.85, 0);
    c.lineTo(D_SIZE * 0.85, 0);
    // Garis segitiga faset
    c.moveTo(-D_SIZE * 0.55, D_SIZE * 0.65);
    c.lineTo(0, 0);
    c.lineTo(D_SIZE * 0.55, D_SIZE * 0.65);
    c.stroke();

    // Kilatan specular cahaya di sudut atas berlian
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(-D_SIZE * 0.35, D_SIZE * 0.45, 1.8, 0, TAU);
    c.fill();

    // Retakan visual saat hits === 1
    if (hits === 1) {
      c.strokeStyle = '#ffffff';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(-4, D_SIZE * 0.55);
      c.lineTo(1, D_SIZE * 0.2);
      c.lineTo(-2, -D_SIZE * 0.3);
      c.lineTo(3, -D_SIZE * 0.7);
      c.stroke();
    }

    // Badge hit indicator: "1x lagi!" atau "2x"
    c.fillStyle = hits === 1 ? '#ffe4e6' : '#ffffff';
    c.font = 'bold 8.5px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.shadowColor = 'rgba(0,0,0,0.8)';
    c.shadowBlur = 4;
    c.fillText(hits === 1 ? '1x!' : '2x', 0, D_SIZE * 0.3);

    c.restore();
  }

  private drawProj(c: CanvasRenderingContext2D, kind: ProjKind, len?: number, age = 99, embedded = false) {
    const l = len ?? (kind === 'old' ? BLEN : getWeapon(kind).stick + EMBED);
    drawProjectile(c, kind, l, this.time, age, embedded);
  }

  private drawGunNow(c: CanvasRenderingContext2D) {
    const ry = this.recoil * 22 - (this.state === 'idle' ? Math.sin(this.time * 2) * 3 : 0);
    const y0 = GUN_Y + ry;
    const R = this.level.radius;

    // Two upright barrels get two straight sights; a star never steers either.
    if (this.state === 'play' || this.state === 'intro') {
      const lg = c.createLinearGradient(0, y0, 0, this.targetY);
      lg.addColorStop(0, this.weapon.color + '66');
      lg.addColorStop(1, this.weapon.color + '00');
      c.fillStyle = lg;
      for (const ox of this.gunOffsets) {
        c.fillRect(CX + ox - 0.75, this.targetY + R, 1.5, y0 - this.targetY - R);
      }
    }

    // laser beams
    for (const b of this.beams) {
      const a = b.life / b.max;
      if ((this.weapon.id === 'laser' || this.weapon.id === 'moonbeam')
        && getGunEffect(this.weapon.id) === 'original') {
        drawClassicBeam(c, b.x, b.y, y0, a, b.rgb);
        continue;
      }
      if (this.weapon.id === 'laser') {
        drawLaserBeam(c, b.x, b.y, y0, a, this.time);
        continue;
      }
      c.save();
      c.globalCompositeOperation = 'lighter';
      const wdt = 14 * a + 2;
      const bg = c.createLinearGradient(b.x - wdt, 0, b.x + wdt, 0);
      bg.addColorStop(0, `rgba(${b.rgb},0)`);
      bg.addColorStop(0.5, `rgba(${b.rgb},${a * 0.9})`);
      bg.addColorStop(1, `rgba(${b.rgb},0)`);
      c.fillStyle = bg;
      c.fillRect(b.x - wdt, b.y, wdt * 2, y0 - b.y);
      if (this.weapon.id === 'moonbeam') {
        // Instant beam mechanics stay intact, but the beam reads as a stream
        // of bright stars released from the wand rather than a laser rifle.
        c.shadowColor = '#d9c5ff'; c.shadowBlur = 12;
        c.strokeStyle = `rgba(255,244,218,${a * 0.75})`;
        c.lineWidth = 2.5 * a; c.lineCap = 'round';
        c.beginPath(); c.moveTo(b.x, b.y);
        for (let i = 0; i < 6; i++) {
          const yy = b.y + (y0 - b.y) * ((i + 1) / 6);
          c.lineTo(b.x + Math.sin(i * 2.4 + this.time * 8) * 6, yy);
        }
        c.stroke(); c.shadowBlur = 0;
        for (let i = 0; i < 8; i++) {
          const yy = b.y + (y0 - b.y) * ((i + 0.5) / 8);
          const xx = b.x + Math.sin(i * 2.8 + this.time * 8) * 7;
          const r = (i % 3 === 0 ? 8 : 5) * a;
          c.fillStyle = i % 3 === 0 ? '#fff2c5' : '#f7eeff';
          c.beginPath();
          for (let n = 0; n < 12; n++) {
            const theta = n * TAU / 12 - Math.PI / 2;
            const rad = n % 2 ? r * 0.4 : r;
            c.lineTo(xx + Math.cos(theta) * rad, yy + Math.sin(theta) * rad);
          }
          c.closePath(); c.fill();
        }
      } else {
        c.fillStyle = `rgba(255,255,255,${a})`;
        c.fillRect(b.x - 1.5 * a - 0.5, b.y, 3 * a + 1, y0 - b.y);
      }
      const hg = c.createRadialGradient(b.x, b.y, 1, b.x, b.y, 30);
      hg.addColorStop(0, `rgba(255,255,255,${a})`);
      hg.addColorStop(1, `rgba(${b.rgb},0)`);
      c.fillStyle = hg;
      c.beginPath();
      c.arc(b.x, b.y, 30, 0, TAU);
      c.fill();
      c.restore();
    }

    const ready = this.state === 'idle' || this.state === 'intro'
      || (this.cooldown <= 0 && this.reloadT === 0 && this.ammoLeft > 0
        && (this.weapon.id !== 'snowball' || this.snowLoaded > 0));
    gunState.sinceShot = this.state === 'idle' ? 9 : this.rt - this.lastShotRT;
    gunState.reloadT = this.reloadT;
    const flash = Math.max(0, this.muzzle / 0.07);

    if (this.hasTwinGuns) {
      // Left gun mirrored and right gun normal: their grips/magazines face OUT,
      // matching the side-by-side AK-47 silhouette rather than overlapping.
      for (const ox of this.gunOffsets) {
        c.save();
        c.translate(CX + ox, y0);
        if (ox < 0) c.scale(-1, 1);
        drawGun(c, this.weapon.id, 0, 0, this.time, flash, ready, this.snowLoaded);
        c.restore();
      }
    } else {
      c.save();
      c.translate(CX, y0);
      drawGun(c, this.weapon.id, 0, 0, this.time, flash, ready, this.snowLoaded);
      c.restore();
    }

  }

  private forestBackdrop: HTMLCanvasElement | null = null;
  private forestBackdropKey = '';

  private drawForestBackground(c: CanvasRenderingContext2D, pal: (typeof STYLE_COLORS)[Style], R: number) {
    // Sky, silhouettes and target lighting do not change each frame. Cache
    // them at retina resolution; keep the drifting fireflies and grass live.
    const key = `${this.level.style}:${R}:${this.targetY}:${this.dpr}`;
    if (key !== this.forestBackdropKey || !this.forestBackdrop) {
      const backdrop = document.createElement('canvas');
      const density = Math.ceil(this.dpr);
      backdrop.width = W * density;
      backdrop.height = H * density;
      const bg = backdrop.getContext('2d')!;
      bg.setTransform(density, 0, 0, density, 0, 0);
      this.paintForestBackdrop(bg, pal, R);
      this.forestBackdrop = backdrop;
      this.forestBackdropKey = key;
    }
    c.drawImage(this.forestBackdrop, 0, 0, W, H);

    // 5. Kunang-Kunang Hutan Emas Melayang (Glowing Fireflies Sesuai Foto 1!)
    for (const d of this.dust) {
      const pulse = 0.4 + 0.6 * Math.sin(this.time * 2.5 + d.x);
      // Soft glow aura
      c.fillStyle = `rgba(250, 204, 21, ${0.28 * pulse})`;
      c.beginPath();
      c.arc(d.x, d.y, d.s * 2.8, 0, TAU);
      c.fill();
      // Bright core
      c.fillStyle = `rgba(254, 240, 138, ${0.9 * pulse})`;
      c.beginPath();
      c.arc(d.x, d.y, d.s * 0.9, 0, TAU);
      c.fill();
    }

    // 6. Rerumputan Liar 2D di Bagian Bawah Layar (Bottom Grass Blades Sesuai Foto 1!)
    c.fillStyle = '#020507';
    c.beginPath();
    c.moveTo(0, H);
    const blades = 28;
    for (let i = 0; i <= blades; i++) {
      const bx = (i / blades) * W;
      const wind = Math.sin(this.time * 2 + i * 0.5) * 4;
      const hBlade = 22 + (i % 3) * 12 + Math.sin(i * 1.5) * 8;
      c.lineTo(bx - 4, H);
      c.quadraticCurveTo(bx + wind * 0.5, H - hBlade * 0.6, bx + wind, H - hBlade);
      c.quadraticCurveTo(bx + 4 + wind * 0.5, H - hBlade * 0.6, bx + 6, H);
    }
    c.lineTo(W, H);
    c.closePath();
    c.fill();
  }

  private paintForestBackdrop(c: CanvasRenderingContext2D, pal: (typeof STYLE_COLORS)[Style], R: number) {
    // 1. Gradasi Langit Hutan 2D (+20% lebih cerah khas Knife Hit)
    const bg = c.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, pal.bgTop);
    bg.addColorStop(0.7, pal.bgBot);
    bg.addColorStop(1, '#0d252c');
    c.fillStyle = bg;
    c.fillRect(0, 0, W, H);

    // 2. Siluet Batang Pohon Lapisan Belakang (Far Background Trees - lebih terlihat jelas)
    c.fillStyle = 'rgba(24, 52, 60, 0.65)';
    // Batang pohon jauh 1
    c.beginPath();
    c.moveTo(50, 0); c.lineTo(84, 0); c.lineTo(74, H); c.lineTo(40, H); c.closePath();
    c.fill();
    // Cabang kecil
    c.beginPath();
    c.moveTo(65, 200); c.lineTo(118, 138); c.lineTo(112, 132); c.lineTo(63, 190); c.closePath();
    c.fill();

    // Batang pohon jauh 2
    c.beginPath();
    c.moveTo(330, 0); c.lineTo(370, 0); c.lineTo(354, H); c.lineTo(315, H); c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(345, 260); c.lineTo(286, 206); c.lineTo(292, 200); c.lineTo(348, 252); c.closePath();
    c.fill();

    // 3. Siluet Batang Pohon Lapisan Depan (Near Foreground Trees - Kiri & Kanan Sesuai Foto 1)
    const nearTree = (x0: number, x1: number, x2: number, x3: number) => {
      const tg = c.createLinearGradient(x0, 0, x1, 0);
      tg.addColorStop(0, 'rgba(14, 34, 40, 0.95)');
      tg.addColorStop(0.5, 'rgba(22, 50, 58, 0.92)');
      tg.addColorStop(1, 'rgba(12, 30, 36, 0.98)');
      c.fillStyle = tg;
      c.beginPath();
      c.moveTo(x0, 0); c.lineTo(x1, 0); c.lineTo(x2, H); c.lineTo(x3, H); c.closePath();
      c.fill();
    };

    // Pohon Kiri Utama
    nearTree(-15, 45, 35, -25);
    // Cabang pohon kiri menjorok ke target
    c.fillStyle = 'rgba(6, 15, 18, 0.95)';
    c.beginPath();
    c.moveTo(30, 120); c.quadraticCurveTo(80, 100, 130, 40); c.lineTo(120, 35); c.quadraticCurveTo(75, 90, 28, 105); c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(25, 420); c.quadraticCurveTo(70, 390, 115, 350); c.lineTo(110, 345); c.quadraticCurveTo(65, 382, 23, 405); c.closePath();
    c.fill();

    // Pohon Kanan Utama
    nearTree(375, 435, 445, 385);
    // Cabang pohon kanan menjorok ke target
    c.beginPath();
    c.moveTo(390, 150); c.quadraticCurveTo(340, 120, 290, 50); c.lineTo(298, 45); c.quadraticCurveTo(345, 112, 395, 135); c.closePath();
    c.fill();
    c.beginPath();
    c.moveTo(395, 440); c.quadraticCurveTo(350, 410, 300, 370); c.lineTo(306, 364); c.quadraticCurveTo(355, 402, 398, 425); c.closePath();
    c.fill();

    // 4. Ambient Target Glow (Cahaya lembut di sekitar buah / target)
    const targetGlow = c.createRadialGradient(CX, this.targetY, 20, CX, this.targetY, R * 2.5);
    targetGlow.addColorStop(0, pal.glow);
    targetGlow.addColorStop(0.6, pal.glow.replace(/[\d.]+\)$/, '0.06)'));
    targetGlow.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = targetGlow;
    c.fillRect(0, 0, W, H);

    // A restrained bottom vignette adds depth while keeping the lower forest readable.
    const lowerShade = c.createLinearGradient(0, H * 0.48, 0, H);
    lowerShade.addColorStop(0, 'rgba(2, 10, 18, 0)');
    lowerShade.addColorStop(0.58, 'rgba(2, 10, 18, 0.045)');
    lowerShade.addColorStop(1, 'rgba(2, 10, 18, 0.12)');
    c.fillStyle = lowerShade;
    c.fillRect(0, 0, W, H);
  }

  private drawBonusRing(c: CanvasRenderingContext2D, radius: number) {
    c.save();
    c.scale(radius / 196, radius / 196);
    for (const coin of this.bonusCoins) {
      if (coin.taken) continue;
      const x = Math.cos(coin.angle) * coin.radius, y = Math.sin(coin.angle) * coin.radius;
      drawBonusCoin(c, x, y, 11, this.time, coin.phase, true);
    }
    c.restore();
  }

  private render() {
    const c = this.ctx;
    const k = this.scale * this.dpr;
    c.setTransform(k, 0, 0, k, 0, 0);
    const pal = STYLE_COLORS[this.level.style];
    const R = this.level.radius;

    // Keep Gun Hit's forest, but give each Diamond Breaker round its own lighting.
    this.drawForestBackground(c, pal, R);
    if (isSpecial(this.level.mode)) {
      const tint = c.createLinearGradient(0, 0, 0, H);
      const gold = this.level.mode === 'treasure' || this.level.mode === 'bonus';
      tint.addColorStop(0, gold ? 'rgba(54,24,56,0.62)' : 'rgba(9,32,65,0.58)');
      tint.addColorStop(1, gold ? 'rgba(44,23,10,0.36)' : 'rgba(10,34,54,0.28)');
      c.fillStyle = tint; c.fillRect(0, 0, W, H);
      const halo = c.createRadialGradient(CX, this.targetY, 24, CX, this.targetY, 245);
      halo.addColorStop(0, gold ? 'rgba(251,191,36,0.26)' : 'rgba(103,232,249,0.24)');
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = halo; c.fillRect(0, 0, W, H);
    }

    c.save();
    if (this.shake > 0.1) c.translate(rand(-1, 1) * this.shake, rand(-1, 1) * this.shake);
    c.translate(0, this.camY);

    // Keep the clean diamond / chest visible through the special-stage celebration.
    if (this.state !== 'idle' && (this.state !== 'clear' || isSpecial(this.level.mode))) {
      let sc = 1;
      if (this.state === 'intro') {
        const t = Math.min(1, this.introT / 0.5);
        const c1 = 1.70158;
        const c3 = c1 + 1;
        sc = 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      }
      c.save();
      c.translate(CX, this.targetY - this.bump * 9);
      c.scale(sc, sc);
      // Ordinary round targets keep their drop shadow. The special rock and
      // treasure chest must NOT sit on a large black disk as chunks fall away.
      // Dark Knight juga tampil tanpa lingkaran hitam di belakangnya.
      if (!isSpecial(this.level.mode) && !this.level.boss) {
        c.beginPath();
        c.arc(0, 10, R + 6, 0, TAU);
        c.fillStyle = 'rgba(0,0,0,0.35)';
        c.fill();
      }
      // Idle "hidup" untuk bos: melayang pelan, napas, dan goyangan lembut —
      // bos TIDAK diem, tapi juga TIDAK muter/membalik. Transform visual murni;
      // this.rot tetap terkunci 0 untuk fisika proyektil & bidikan.
      if (this.level.boss) {
        const bt = this.time;
        c.translate(Math.sin(bt * 0.53) * 3.2, Math.sin(bt * 1.15) * 3.8);
        c.rotate(Math.sin(bt * 0.66 + 1.0) * 0.085);
        const breath = 1 + Math.sin(bt * 1.35) * 0.014;
        c.scale(breath, breath);
      }
      if (this.rock && !this.centerDiamondCollected) drawRockDiamond(c, R, this.time, this.diamondPing);
      // Lapisan target berputar — bos juga berputar pelan (this.rot di update),
      // bukan terkunci diam. Kecepatan boss konstan agar tidak muter liar.
      if (this.level.mode !== 'treasure') c.rotate(this.rot);
      for (const it of this.items) {
        if (it.type === 'bullet' || it.type === 'old') {
          c.save();
          c.rotate(it.angle - Math.PI / 2);
          const sink = it.type === 'bullet' ? Math.max(0, 1 - it.age * 12) * 6 : 0;
          const sc = it.scale ?? 1;
          const totalWeaponLen = it.type === 'old' ? BLEN : (getWeapon(it.w || 'pistol').stick + 12);
          const len = totalWeaponLen;
          // Masuk lebih dalam hingga hanya terlihat setengah (50% tertanam di dalam papan)
          const embedDepth = totalWeaponLen * 0.5;
          const pencilEmbedBonus = it.w === 'pencil' ? Math.sin(it.angle * 13) * 5 : 0;
          const itemR = this.level.boss ? getExactBossRadius(this.level.style as BossType, it.angle, R) : R;
          const snowball = it.type === 'bullet' && it.w === 'snowball';
          const portal = it.type === 'bullet' && it.w === 'portal';
          // Place the snowy hemisphere or portal ring at the hit surface. The
          // target hides their inner halves without any new portal physics.
          c.translate(0, snowball ? itemR + sink : portal ? itemR - 11 * sc + sink
            : itemR - (embedDepth + pencilEmbedBonus) * sc + sink);
          c.scale(sc, sc);
          gunState.bigShot = it.big ?? 0;
          if (it.tint) gunState.tint = it.tint;
          this.drawProj(c, it.type === 'old' ? 'old' : it.w || 'pistol', len, it.age,
            snowball || it.w === 'honey' || it.w === 'banana'
              || it.w === 'bee' || it.w === 'moonbeam' || it.w === 'plasma' || it.w === 'blackhole'
              || it.w === 'nail');
          gunState.bigShot = 0;
          c.restore();
        } else if (it.type === 'spike') {
          c.save();
          c.rotate(it.angle - Math.PI / 2);
          const k = this.spikeOffT > 0 ? Math.min(1, this.spikeOffT / 0.25) * (this.spikeOffT > 0.3 ? 1 : this.spikeOffT / 0.3) : 0;
          // Di boss, duri menempel pas pada permukaan kontur kepala organik boss!
          const itemR = this.level.boss ? getExactBossRadius(this.level.style as BossType, it.angle, R) : R;
          c.translate(0, itemR - 6 - (SPIKE_LEN + 4) * SPIKE_SCALE * Math.min(1, k * 1.5));
          this.drawSpike(c);
          c.restore();
        }
      }
      const facePad = this.level.boss ? 40 : 4;
      if (this.rock) {
        this.rock.draw(c, R, this.time);
        const sc = R / 196;
        for (const shot of this.rockBullets) this.drawEmbeddedShot(c, shot, shot.x * sc, shot.y * sc, 7);
        if (this.level.mode === 'bonus') this.drawBonusRing(c, R);
      } else if (this.chest) {
        c.save();
        c.translate(0, 15);
        this.chest.draw(c, this.time, cc => {
          for (const shot of this.chestBullets) this.drawEmbeddedShot(cc, shot, shot.x, shot.y,
            (getWeapon(shot.w).stick + EMBED) * 0.5);
        });
        c.restore();
      } else {
        c.drawImage(this.face, -R - facePad, -R - facePad, (R + facePad) * 2, (R + facePad) * 2);
      }
      if (this.hitFlash > 0 && !isSpecial(this.level.mode)) {
        c.beginPath();
        c.arc(0, 0, R, 0, TAU);
        // Brief surface flash: the whole circular board/boss lights up on impact.
        c.fillStyle = `rgba(255,255,255,${this.hitFlash * 0.28})`;
        c.fill();
      }
      if (this.slowT > 0) {
        const fa = Math.min(1, this.slowT / 0.3);
        if (this.slowKind === 'water') {
          drawWetSurface(c, R, this.time, fa);
        } else {
          c.beginPath();
          c.arc(0, 0, R, 0, TAU);
          c.fillStyle = `rgba(${this.slowRgb},${(this.slowKind === 'honey' ? 0.10 : 0.28) * fa})`;
          c.fill();
          c.strokeStyle = `rgba(${this.slowRgb},${(this.slowKind === 'honey' ? 0.48 : 0.9) * fa})`;
          c.lineWidth = 4;
          c.stroke();
          c.strokeStyle = `rgba(255,255,255,${0.5 * fa})`;
          c.lineWidth = 1.2;
          if (this.slowKind === 'honey') {
            // The honey film clings to the turning target instead of becoming
            // the Soaker's blue wet sheen or a field of icy glass cracks.
            c.strokeStyle = `rgba(255,232,143,${0.5 * fa})`;
            c.lineWidth = 2.4; c.lineCap = 'round';
            c.beginPath(); c.arc(0, 0, R - 6, 0.2, 1.85); c.stroke();
          } else if (this.slowKind === 'ice') {
            for (let i = 0; i < 8; i++) {
              const a = (i / 8) * TAU;
              c.beginPath();
              c.moveTo(Math.cos(a) * R * 0.3, Math.sin(a) * R * 0.3);
              c.lineTo(Math.cos(a + 0.15) * R * 0.95, Math.sin(a + 0.15) * R * 0.95);
              c.stroke();
            }
          } else {
            c.save();
            c.rotate(-this.rot);
            c.strokeStyle = `rgba(254,240,138,${0.9 * fa})`;
            c.lineWidth = 2;
            for (let i = 0; i < 12; i++) {
              const a = (i / 12) * TAU;
              c.beginPath();
              c.moveTo(Math.cos(a) * (R - 12), Math.sin(a) * (R - 12));
              c.lineTo(Math.cos(a) * (R - 3), Math.sin(a) * (R - 3));
              c.stroke();
            }
            c.lineWidth = 4;
            c.lineCap = 'round';
            c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(0, -R * 0.6);
            c.moveTo(0, 0);
            c.lineTo(R * 0.4, 0);
            c.stroke();
            c.restore();
          }
        }
      }
      if (this.burnT > 0) {
        const fa = Math.min(1, this.burnT / 0.4);
        c.beginPath();
        c.arc(0, 0, R, 0, TAU);
        c.fillStyle = `rgba(255,100,20,${0.15 * fa + 0.05 * Math.sin(this.time * 20)})`;
        c.fill();
      }
      for (const it of this.items) {
        if (it.type !== 'coin' && it.type !== 'diamond_chest') continue;
        c.save();
        c.rotate(it.angle - Math.PI / 2);
        const itemR = this.level.boss ? getExactBossRadius(this.level.style as BossType, it.angle, R) : R;
        if (it.type === 'coin') {
          c.translate(0, itemR + 18);
          this.drawCoin(c, this.time + it.angle);
        } else {
          // Diamond menancap di permukaan papan target (garis lingkaran R)
          // Bagian kerucut masuk ke dalam (< R), bagian mahkota muncul keluar (> R)
          c.translate(0, itemR + 2);
          this.drawEmbeddedDiamond(c, this.time + it.angle, it.hits || 0);
        }
      c.restore();
      }
      c.restore();
    }

    // fragments
    for (const f of this.frags) {
      c.save();
      c.translate(f.x, f.y);
      c.rotate(f.rot);
      c.beginPath();
      c.moveTo(0, 0);
      c.arc(0, 0, R + 1, f.a0, f.a1);
      c.closePath();
      c.clip();
      const fragPad = this.level.boss ? 40 : 4;
      c.drawImage(this.face, -R - fragPad, -R - fragPad, (R + fragPad) * 2, (R + fragPad) * 2);
      c.restore();
    }
    // Real, textured chunks keep their embedded rounds as they tumble away.
    for (const f of this.fallenCells) {
      c.save();
      c.globalAlpha = Math.min(1, f.life * 3);
      c.translate(f.x, f.y);
      c.rotate(f.rot);
      c.shadowColor = 'rgba(0,0,0,0.38)';
      c.shadowBlur = 5;
      c.shadowOffsetY = 3;
      this.rock?.drawFallenCell(c, f.id, R);
      c.shadowBlur = 0;
      c.shadowOffsetY = 0;
      const sc = R / 196;
      for (const shot of f.bullets) {
        this.drawEmbeddedShot(c, shot, (shot.x - f.cx) * sc, (shot.y - f.cy) * sc, 7);
      }
      c.restore();
    }
    // ═══ FRAGMEN BATU (boulder shatter) ═══
    for (const f of this.rockFragments) {
      const a = Math.max(0, Math.min(1, f.life / 0.6));
      c.save();
      c.globalAlpha = a;
      c.translate(f.x, f.y);
      c.rotate(f.rot);
      drawRockFragment(c, f.size, f.seed);
      c.restore();
    }

    // The star travels across the gap with a short glowing trail, not a gun-aim arrow.
    if (this.star) {
      const st = this.star;
      const blink = st.life < 0.8 ? (Math.floor(this.time * 8) % 2 ? 0.35 : 1) : 1;
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (let i = 1; i <= 3; i++) {
        c.globalAlpha = blink * (0.52 - i * 0.11);
        c.fillStyle = '#ffd54a';
        c.beginPath();
        c.ellipse(st.x - Math.sign(st.vx) * (st.r + i * 12), st.y + Math.sin(st.age * 4 - i) * 5, 6 - i, 4 - i * 0.5, 0, 0, TAU);
        c.fill();
      }
      c.restore();
      c.save();
      c.globalAlpha = blink;
      drawStar(c, st.x, st.y, st.r, this.time, '250,204,21');
      c.restore();
    }

    for (const f of this.flyers) {
      c.save();
      c.translate(f.x, f.y);
      c.rotate(f.rot);
      if (f.kind === 'spike') this.drawSpike(c);
      else if (f.kind === 'coin') this.drawCoin(c, this.time);
      else if (f.kind === 'diamond_chest') this.drawEmbeddedDiamond(c, this.time, 1);
      else {
        c.translate(0, -BLEN / 2);
        this.drawProj(c, f.kind === 'old' ? 'old' : f.w || 'pistol');
      }
      c.restore();
    }

    // projectiles
    for (const p of this.projs) {
      const wid = this.weapon.id;
      const trailCol = this.weapon.trail;
      const ang = Math.atan2(p.vx, this.weapon.speed);
      if (this.weapon.rope) {
        c.strokeStyle = 'rgba(254,243,199,0.9)';
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo((p.originX ?? CX) - 14, GUN_Y + 198 + this.recoil * 22);
        c.quadraticCurveTo((p.originX ?? CX) + 10, (p.y + GUN_Y) / 2 + 30, p.x, p.y + 40);
        c.stroke();
      }
      const fxp = FX[wid];
      // afterimages
      if (fxp.ghost && p.hist) {
        for (let gi = 0; gi < p.hist.length; gi++) {
          const h = p.hist[gi];
          c.save();
          c.globalAlpha = ((gi + 1) / (p.hist.length + 1)) * 0.32;
          c.translate(h.x, h.y);
          c.rotate(-ang);
          if (this.weapon.energy) c.globalCompositeOperation = 'lighter';
          this.drawProj(c, wid);
          c.restore();
        }
      }
      // The moving singularity pulls a helical light tether from its actual
      // muzzle (both muzzles when doubled). It still collides as a projectile.
      if (wid === 'blackhole' && getGunEffect(wid) === 'new') {
        drawVoidTether(c, p.x, p.y, p.originX ?? CX,
          GUN_Y + this.recoil * 22, this.time);
      }
      c.save();
      c.translate(p.x, p.y);
      c.rotate(-ang);
      // Water/snow have material trails, and a portal must remain a compact
      // ring; the usual white laser wedge made all three look like tadpoles.
      if (!drawMaterialTrail(c, wid)) {
        const tl = Math.min(260, 50 + this.weapon.speed * 0.045) * fxp.streak;
        const tw = Math.max(2, this.weapon.half) * 1.25
          * projectileSizeMultiplier(wid, !!p.mini, !!p.giant);
        c.globalCompositeOperation = 'lighter';
        const tg = c.createLinearGradient(0, 6, 0, 6 + tl);
        tg.addColorStop(0, `rgba(${trailCol},0.75)`);
        tg.addColorStop(0.35, `rgba(${trailCol},0.28)`);
        tg.addColorStop(1, `rgba(${trailCol},0)`);
        c.fillStyle = tg;
        c.beginPath();
        c.moveTo(-tw, 8);
        c.lineTo(tw, 8);
        c.lineTo(0.5, 8 + tl);
        c.lineTo(-0.5, 8 + tl);
        c.closePath();
        c.fill();
        const cg = c.createLinearGradient(0, 6, 0, 6 + tl * 0.55);
        cg.addColorStop(0, 'rgba(255,255,255,0.85)');
        cg.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = cg;
        c.fillRect(-0.9, 8, 1.8, tl * 0.55);
        const hr = tw * 4.5;
        const hg = c.createRadialGradient(0, 6, 0, 0, 6, hr);
        hg.addColorStop(0, `rgba(${trailCol},0.55)`);
        hg.addColorStop(1, `rgba(${trailCol},0)`);
        c.fillStyle = hg;
        c.beginPath();
        c.arc(0, 6, hr, 0, TAU);
        c.fill();
        c.globalCompositeOperation = 'source-over';
      }
      if (wid === 'disc') c.rotate(this.time * 30);
      gunState.bigShot = p.big ?? 0;
      if (p.tint) gunState.tint = p.tint;
      if (p.big) c.scale(1 + p.big * 0.3, 1 + p.big * 0.3);
      const sizeMultiplier = projectileSizeMultiplier(wid, !!p.mini, !!p.giant);
      if (sizeMultiplier !== 1) c.scale(sizeMultiplier, sizeMultiplier);
      if (this.weapon.spinFly) {
        const l2 = this.weapon.stick + EMBED;
        c.translate(0, l2 / 2);
        c.rotate(this.time * 28);
        c.translate(0, -l2 / 2);
      }
      this.drawProj(c, wid);
      c.restore();
    }
    void this.failProjAngle;

    // portals
    for (const pt of this.portals) {
      const a = pt.life / pt.max;
      const s = Math.sin(a * Math.PI);
      c.save();
      c.translate(pt.x, pt.y);
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(0, 0, 2, 0, 0, 30 * s);
      g.addColorStop(0, 'rgba(255,255,255,0.9)');
      g.addColorStop(0.5, `rgba(${pt.rgb},0.8)`);
      g.addColorStop(1, `rgba(${pt.rgb},0)`);
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(0, 0, 30 * s, 14 * s, 0, 0, TAU);
      c.fill();
      c.strokeStyle = `rgba(${pt.rgb},${a})`;
      c.lineWidth = 3;
      c.beginPath();
      c.ellipse(0, 0, 24 * s, 10 * s, 0, 0, TAU);
      c.stroke();
      c.restore();
    }

    // ---------------- Distinct, flat boss attack silhouettes ----------------
    for (const bp of this.bossProjs) drawBossProjectile(c, bp, this.time);

    if (this.state !== 'idle') {
      this.drawGunNow(c);
    }

    // Real gold pieces leap out of the chest, scatter, fall and bounce, then
    // sweep into the HUD. They render in front of the guns and behind the HUD.
    for (const coin of this.treasureCoins) {
      if (coin.delay > 0) continue;
      const scale = coin.state === 'collect' ? 1 - 0.45 * coin.collectT / coin.collectDuration : 1;
      drawBonusCoin(c, coin.x, coin.y, coin.r * scale, this.time, coin.phase, true);
    }

    // particles
    for (const p of this.particles) {
      const a = Math.max(0, p.life / p.max);
      switch (p.kind) {
        case 'spark':
          c.strokeStyle = p.color;
          c.globalAlpha = a;
          c.lineWidth = p.size;
          c.beginPath();
          c.moveTo(p.x, p.y);
          c.lineTo(p.x - p.vx * 0.025, p.y - p.vy * 0.025);
          c.stroke();
          c.globalAlpha = 1;
          break;
        case 'chip':
          c.save();
          c.globalAlpha = Math.min(1, a * 2);
          c.translate(p.x, p.y);
          c.rotate(p.rot);
          c.fillStyle = p.color;
          c.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
          c.restore();
          break;
        case 'smoke':
          c.fillStyle = `${p.color}${a * 0.25})`;
          c.beginPath();
          c.arc(p.x, p.y, p.size * (1.6 - a * 0.6), 0, TAU);
          c.fill();
          break;
        case 'shell':
          c.save();
          c.translate(p.x, p.y);
          c.rotate(p.rot);
          c.globalAlpha = Math.min(1, a * 3);
          c.fillStyle = p.color;
          c.fillRect(-3.5, -7, 7, 13);
          c.fillStyle = 'rgba(255,255,255,0.5)';
          c.fillRect(-1.5, -6, 1.5, 11);
          c.fillStyle = 'rgba(0,0,0,0.35)';
          c.fillRect(-4, 5, 8, 2.5);
          c.restore();
          break;
        case 'bolt': {
          c.save();
          c.globalCompositeOperation = 'lighter';
          c.shadowColor = p.color;
          c.shadowBlur = 12;
          c.lineJoin = 'round';
          for (const [lw, col] of [[p.size * 2.5 * a, p.color], [p.size * 0.8 * a, '#ffffff']] as const) {
            c.strokeStyle = col;
            c.lineWidth = lw;
            c.beginPath();
            c.moveTo(p.x, p.y);
            const tx = p.tx ?? p.x;
            const ty = p.ty ?? p.y;
            for (let k = 1; k < 7; k++) {
              const f = k / 7;
              c.lineTo(p.x + (tx - p.x) * f + rand(-7, 7), p.y + (ty - p.y) * f + rand(-7, 7));
            }
            c.lineTo(tx, ty);
            c.stroke();
          }
          c.restore();
          break;
        }
        case 'glow': {
          c.save();
          c.globalCompositeOperation = 'lighter';
          const r = p.size * (0.5 + a * 0.8);
          const gg = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 2);
          gg.addColorStop(0, `rgba(255,255,255,${a})`);
          gg.addColorStop(0.3, `rgba(${p.color},${a * 0.9})`);
          gg.addColorStop(1, `rgba(${p.color},0)`);
          c.fillStyle = gg;
          c.beginPath();
          c.arc(p.x, p.y, r * 2, 0, TAU);
          c.fill();
          c.restore();
          break;
        }
        case 'ring': {
          const t = 1 - a;
          c.strokeStyle = p.color;
          c.globalAlpha = a * 0.8;
          c.lineWidth = 4 * a + 1;
          c.beginPath();
          c.arc(p.x, p.y, p.size * (0.2 + t * 0.8), 0, TAU);
          c.stroke();
          c.globalAlpha = 1;
          break;
        }
        case 'text': {
          const t = 1 - a;
          const pop = t < 0.15 ? 0.5 + (t / 0.15) * 0.7 : 1.2 - Math.min(0.2, (t - 0.15) * 1.5);
          c.save();
          c.translate(p.x, p.y);
          c.scale(pop, pop);
          c.globalAlpha = Math.min(1, a * 2.5);
          c.font = `${p.size}px 'Russo One', sans-serif`;
          c.textAlign = 'center';
          c.textBaseline = 'middle';
          c.lineWidth = 6;
          c.strokeStyle = 'rgba(0,0,0,0.7)';
          c.strokeText(p.text || '', 0, 0);
          c.fillStyle = p.color;
          c.fillText(p.text || '', 0, 0);
          c.restore();
          break;
        }
        default:
          drawFxParticle(c, p, this.time);
          break;
      }
    }

    // dynamic lights (bloom-like)
    if (this.lights.length) {
      c.save();
      c.globalCompositeOperation = 'lighter';
      for (const l of this.lights) {
        const a = l.life / l.max;
        const g = c.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
        g.addColorStop(0, `rgba(${l.rgb},${0.42 * a})`);
        g.addColorStop(0.3, `rgba(${l.rgb},${0.16 * a})`);
        g.addColorStop(1, `rgba(${l.rgb},0)`);
        c.fillStyle = g;
        c.fillRect(l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
      }
      c.restore();
    }
    c.restore();

    // weapon-colored impact tint
    if (this.tintA > 0) {
      const tg2 = c.createRadialGradient(CX, H / 2, H * 0.2, CX, H / 2, H * 0.75);
      tg2.addColorStop(0, `rgba(${this.tintRgb},0)`);
      tg2.addColorStop(1, `rgba(${this.tintRgb},${this.tintA})`);
      c.save();
      c.globalCompositeOperation = 'lighter';
      c.fillStyle = tg2;
      c.fillRect(0, 0, W, H);
      c.restore();
    }

    // vignette
    const vg = c.createRadialGradient(CX, H / 2, H * 0.3, CX, H / 2, H * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.55)');
    c.fillStyle = vg;
    c.fillRect(0, 0, W, H);

    // sniper scope overlay
    if (this.aiming) {
      const k2 = Math.min(1, this.aimT / 0.15);
      const rr2 = 520 - (520 - (R + 80)) * k2;
      c.save();
      c.beginPath();
      c.rect(0, 0, W, H);
      c.arc(CX, this.targetY + R * 0.5, rr2, 0, TAU, true);
      c.fillStyle = `rgba(0,0,0,${0.75 * k2})`;
      c.fill('evenodd');
      c.strokeStyle = `rgba(0,0,0,${0.9 * k2})`;
      c.lineWidth = 6;
      c.beginPath();
      c.arc(CX, this.targetY + R * 0.5, rr2, 0, TAU);
      c.stroke();
      c.strokeStyle = `rgba(255,40,40,${0.85 * k2})`;
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(CX, this.targetY + R * 0.5 - rr2);
      c.lineTo(CX, this.targetY + R * 0.5 + rr2);
      c.moveTo(CX - rr2, this.targetY + R * 0.5);
      c.lineTo(CX + rr2, this.targetY + R * 0.5);
      c.stroke();
      c.beginPath();
      c.arc(CX, this.targetY + R, 6, 0, TAU);
      c.stroke();
      for (let i = 1; i < 5; i++) {
        c.beginPath();
        c.moveTo(CX - 5, this.targetY + R * 0.5 + i * 22);
        c.lineTo(CX + 5, this.targetY + R * 0.5 + i * 22);
        c.stroke();
      }
      c.fillStyle = `rgba(255,80,80,${k2})`;
      c.font = "13px 'Russo One', sans-serif";
      c.textAlign = 'center';
      c.fillText('LEPAS UNTUK MENEMBAK', CX, this.targetY + R + rr2 * 0.55);
      c.restore();
    }
    // glitch screen
    if (this.glitchT > 0) {
      for (let i = 0; i < 8; i++) {
        c.fillStyle = pick(['rgba(255,0,85,0.35)', 'rgba(0,255,238,0.35)', 'rgba(34,255,136,0.3)']);
        c.fillRect(0, rand(0, H), W, rand(2, 14));
      }
    }

    if (this.state !== 'idle') this.drawHUD(c);

    if (this.flashWhite > 0) {
      c.fillStyle = `rgba(255,255,255,${this.flashWhite * 0.6})`;
      c.fillRect(0, 0, W, H);
    }
    if (this.flashRed > 0) {
      c.fillStyle = `rgba(255,0,0,${this.flashRed * 0.3})`;
      c.fillRect(0, 0, W, H);
      const rg = c.createRadialGradient(CX, H / 2, H * 0.2, CX, H / 2, H * 0.7);
      rg.addColorStop(0, 'rgba(255,0,0,0)');
      rg.addColorStop(1, `rgba(255,0,0,${this.flashRed * 0.5})`);
      c.fillStyle = rg;
      c.fillRect(0, 0, W, H);
    }
  }

  private drawHUD(c: CanvasRenderingContext2D) {
    const font = (s: number) => `${s}px 'Russo One', sans-serif`;
    c.textBaseline = 'middle';
    // score
    c.textAlign = 'left';
    c.font = font(isSpecial(this.level.mode) ? 29 : 40);
    c.lineWidth = 5;
    c.strokeStyle = 'rgba(0,0,0,0.6)';
    c.strokeText(String(this.score), 22, isSpecial(this.level.mode) ? 34 : 46);
    c.fillStyle = '#ffffff';
    c.fillText(String(this.score), 22, isSpecial(this.level.mode) ? 34 : 46);

    // combo badge di HUD kiri atas (di bawah skor angka, tidak menutupi target!)
    const cWindow = this.weapon.comboWindow ?? 0.5;
    const timeSinceHit = this.time - this.lastHit;
    if (this.combo >= 2 && timeSinceHit < cWindow) {
      const leftFrac = Math.max(0, 1 - (timeSinceHit / cWindow));
      const popScale = 1 + this.comboPop * 0.28;
      c.save();
      c.translate(22, 74);
      c.scale(popScale, popScale);
      c.textAlign = 'left';
      c.font = font(13);
      c.lineWidth = 3;
      c.strokeStyle = 'rgba(0,0,0,0.85)';
      const comboText = `⚡ COMBO x${this.combo}`;
      c.strokeText(comboText, 0, 0);
      c.fillStyle = this.combo >= 5 ? '#f43f5e' : this.combo >= 3 ? '#ffd23f' : '#38bdf8';
      c.fillText(comboText, 0, 0);

      // Bar timer combo halus yang menyusut
      c.fillStyle = 'rgba(255,255,255,0.18)';
      c.fillRect(0, 9, 82, 3);
      c.fillStyle = this.combo >= 5 ? '#f43f5e' : this.combo >= 3 ? '#ffd23f' : '#38bdf8';
      c.fillRect(0, 9, 82 * leftFrac, 3);
      c.restore();
    }

    // coins
    c.textAlign = 'right';
    c.font = font(22);
    const coinY = isSpecial(this.level.mode) ? 34 : 44;
    c.strokeText(String(this.coins), W - 46, coinY);
    c.save();
    c.fillStyle = '#ffd23f';
    c.shadowColor = '#fbbf24';
    c.shadowBlur = 13 * this.coinPulse;
    c.fillText(String(this.coins), W - 46, coinY);
    c.restore();
    c.save();
    c.translate(W - 28, coinY);
    c.scale(1 + this.coinPulse * 0.16, 1 + this.coinPulse * 0.16);
    this.drawCoin(c, 0, false); // no oversized halo clipped by the HUD edge
    c.restore();

    // Stage identity and countdown are above the target, never over the diamond.
    const n = this.level.n;
    c.textAlign = 'center';
    const modeLabel = this.level.mode === 'boulder' ? `💎 DIAMOND BREAKER • LV ${n}`
      : this.level.mode === 'bonus' ? `🪙 BONUS STAGE • LV ${n}`
      : this.level.mode === 'treasure' ? `🧰 HARTA KARUN • LV ${n}`
      : this.level.mode === 'double' ? `🔫🔫 DOUBLE GUN • LEVEL ${n}`
      : this.level.boss ? `BOSS • ${this.level.name}` : `LEVEL ${n}`;
    c.font = font(isSpecial(this.level.mode) ? 13 : 16);
    c.fillStyle = this.level.mode === 'treasure' || this.level.mode === 'bonus' ? '#fde68a'
      : this.level.mode === 'boulder' ? '#a5f3fc' : this.level.boss ? '#ff5050' : '#ffffff';
    c.fillText(modeLabel, CX, isSpecial(this.level.mode) ? 20 : 30);

    if (isSpecial(this.level.mode)) {
      c.save();
      c.fillStyle = 'rgba(5,12,24,0.78)';
      c.strokeStyle = this.level.mode === 'boulder' ? 'rgba(103,232,249,0.7)' : 'rgba(252,211,77,0.7)';
      c.lineWidth = 1.5;
      c.beginPath(); c.roundRect(CX - 62, 39, 124, 31, 12); c.fill(); c.stroke();
      c.font = font(18);
      c.fillStyle = this.stageTime < 8 ? '#fb7185' : '#ffffff';
      c.fillText(`⏱ ${this.stageTime.toFixed(1)}s`, CX, 56);
      c.font = font(12);
      c.fillStyle = '#ffffff';
      if (this.level.mode === 'boulder') {
        const barX = CX - 105, barY = 102, ratio = 1 - this.level.hp / Math.max(1, this.level.maxHp);
        c.fillStyle = 'rgba(2,12,25,0.85)';
        c.beginPath(); c.roundRect(barX - 3, barY - 3, 216, 15, 7); c.fill();
        c.fillStyle = '#164e63'; c.fillRect(barX, barY, 210, 9);
        const g = c.createLinearGradient(barX, 0, barX + 210, 0);
        g.addColorStop(0, '#38bdf8'); g.addColorStop(1, '#a5f3fc');
        c.fillStyle = g; c.fillRect(barX, barY, 210 * ratio, 9);
        c.fillStyle = '#d9f9ff';
        c.fillText(`BATU TERKIKIS ${Math.round(ratio * 100)}%`, CX, 87);
      } else if (this.level.mode === 'bonus') {
        c.fillStyle = '#fde68a';
        c.fillText(`KOIN ${this.bonusCoins.filter(coin => coin.taken).length}/${this.bonusCoins.length} • TEMBAK YANG BERPUTAR`, CX, 88);
      } else {
        c.fillStyle = '#fde68a';
        c.fillText(this.treasureBuff === 'double' ? '2 SENJATA AKTIF'
          : this.treasureBuff ? `BONUS ${this.treasureBuff.toUpperCase()} AKTIF` : 'TEMBAK PETI SEBANYAK MUNGKIN!', CX, 88);
      }
      c.restore();
    }

    // TEKKEN-STYLE SATISFYING BOSS HEALTHBAR
    if (this.level.boss) {
      const barW = 200;
      const barH = 12;
      const barX = CX - barW / 2;
      const barY = 46;

      const hpFrac = Math.max(0, Math.min(1, this.bossHp / this.bossMaxHp));
      const hpRedFrac = Math.max(0, Math.min(1, this.bossHpRed / this.bossMaxHp));

      c.save();
      // Outer bevel metallic frame
      c.fillStyle = '#0a0d14';
      c.beginPath();
      c.roundRect(barX - 3, barY - 3, barW + 6, barH + 6, 6);
      c.fill();
      c.strokeStyle = '#eab308';
      c.lineWidth = 1.8;
      c.stroke();

      // Background empty bar
      c.fillStyle = '#261214';
      c.fillRect(barX, barY, barW, barH);

      // Delayed Red damage bar (Tekken ghost health drain)
      c.fillStyle = '#ef4444';
      c.fillRect(barX, barY, barW * hpRedFrac, barH);

      // Foreground yellow/green health gradient
      const hg = c.createLinearGradient(barX, barY, barX + barW, barY);
      hg.addColorStop(0, '#facc15');
      hg.addColorStop(0.5, '#4ade80');
      hg.addColorStop(1, '#22c55e');
      c.fillStyle = hg;
      c.fillRect(barX, barY, barW * hpFrac, barH);

      // Glass specular shine
      c.fillStyle = 'rgba(255,255,255,0.35)';
      c.fillRect(barX, barY, barW * hpFrac, barH * 0.45);

      // HP text
      c.font = 'bold 9px sans-serif';
      c.fillStyle = '#ffffff';
      c.textAlign = 'center';
      c.fillText(`${Math.round(this.bossHp)} / ${this.bossMaxHp} HP`, CX, barY + barH * 0.7);
      c.restore();
    } else if (!isSpecial(this.level.mode)) {
      const idx = (n - 1) % 5;
      for (let i = 0; i < 5; i++) {
        const x = CX - 52 + i * 26;
        const y = 56;
        const isBoss = i === 4;
        c.beginPath();
        if (isBoss) {
          c.save();
          c.translate(x, y);
          c.rotate(Math.PI / 4);
          c.rect(-6, -6, 12, 12);
          c.restore();
        } else {
          c.arc(x, y, i === idx ? 7 : 5.5, 0, TAU);
        }
        if (i < idx) c.fillStyle = '#ffd23f';
        else if (i === idx) c.fillStyle = isBoss ? '#ff3b3b' : '#ffffff';
        else c.fillStyle = isBoss ? 'rgba(255,60,60,0.35)' : 'rgba(255,255,255,0.22)';
        if (i === idx) {
          c.shadowColor = c.fillStyle as string;
          c.shadowBlur = 12;
        }
        c.fill();
        c.shadowBlur = 0;
      }
    }

    // Timed stages refill automatically; the regular ammo buff adds one finite magazine.
    const total = this.level.ammo * this.maxAmmoMult;
    const spacing = Math.min(26, (H * 0.48) / total);
    for (let i = 0; i < total; i++) {
      const x = 30;
      const y = H - 40 - i * spacing;
      c.save();
      c.translate(x, y - 14);
      c.scale(0.5, 0.5);
      if (i < this.ammoLeft) {
        this.drawProj(c, this.weapon.id);
      } else {
        c.globalAlpha = 0.25;
        c.fillStyle = '#000';
        c.fillRect(-6, 0, 12, BLEN);
      }
      c.restore();
    }
    c.textAlign = 'left';
    c.font = font(14);
    c.fillStyle = 'rgba(255,255,255,0.75)';
    c.fillText(this.reloadT > 0 ? 'ISI ULANG…' : `x${this.ammoLeft}`, 46, H - 30);

    // weapon label
    c.textAlign = 'right';
    c.font = font(12);
    c.fillStyle = this.weapon.energy ? this.weapon.color : 'rgba(255,255,255,0.6)';
    c.fillText(`${this.weapon.name}${this.hasTwinGuns ? ' ×2' : ''} • ${this.weapon.perk}`, W - 14, H - 16);
    const wq = this.weapon;
    let info = '';
    if (wq.saves) info = `${wq.emoji} NYAWA: ${'●'.repeat(this.savesLeft)}${'○'.repeat(Math.max(0, wq.saves - this.savesLeft))}`;
    else if (wq.chronoEvery) info = `⏱ ${wq.chronoEvery - (this.perkCount % wq.chronoEvery)} lagi`;
    else if (wq.reverseEvery) info = `🌍 ${wq.reverseEvery - (this.perkCount % wq.reverseEvery)} lagi`;
    else if (wq.snowman) info = `⛄ ${3 - (this.perkCount % 3)} lagi`;
    else if (wq.abductEvery) info = `🛸 culik ${wq.abductEvery - (this.perkCount % wq.abductEvery)} lagi`;
    else if (wq.everyBonus) info = `🎰 lucky ${wq.everyBonus.n - (this.perkCount % wq.everyBonus.n)} lagi`;
    else if (wq.meltEvery && wq.meltEvery > 1) info = `✏️ hapus ${wq.meltEvery - (this.perkCount % wq.meltEvery)} lagi`;
    else if (wq.paint && this.lastPaint) info = '🎨 warna terakhir ●';
    else if (wq.charge) info = this.charging ? `🔋 ${this.chargeT >= 1 ? 'FULL!' : Math.round(Math.min(1, this.chargeT) * 100) + '%'}` : '🔋 tahan untuk charge';
    else if (wq.phaseSpikes) info = '👻 kebal duri';
    else if (wq.notes) info = `🎶 nada ${Math.min(10, Math.max(1, this.combo))}/10`;
    if (info) {
      c.font = font(13);
      c.fillStyle = wq.color;
      c.fillText(info, W - 14, H - 36);
    }
    if (wq.spinup) {
      c.fillStyle = 'rgba(255,255,255,0.15)';
      c.fillRect(W - 114, H - 46, 100, 7);
      c.fillStyle = this.spin > 0.25 ? '#22c55e' : '#f59e0b';
      c.fillRect(W - 114, H - 46, 100 * this.spin, 7);
      c.font = font(10);
      c.fillStyle = 'rgba(255,255,255,0.7)';
      c.fillText('SPIN', W - 118, H - 40);
    }

    // banner
    if (this.bannerT > 0) {
      const t = this.bannerT;
      const a = Math.min(1, t * 2.5) * Math.min(1, (1.8 - t) * 5);
      c.save();
      c.globalAlpha = a;
      c.translate(CX, isSpecial(this.level.mode) ? this.targetY + this.level.radius + 46 : CY + this.level.radius + 115);
      const s = 1 + Math.max(0, (t - 1.5)) * 1.5;
      c.scale(s, s);
      c.textAlign = 'center';
      if (this.level.boss) {
        c.fillStyle = 'rgba(120,0,0,0.65)';
        c.fillRect(-W / 2, -38, W, 76);
        c.font = font(34);
        c.lineWidth = 6;
        c.strokeStyle = 'rgba(0,0,0,0.7)';
        c.strokeText('⚠ BOSS FIGHT ⚠', 0, -10);
        c.fillStyle = '#ff4040';
        c.fillText('⚠ BOSS FIGHT ⚠', 0, -10);
        c.font = font(16);
        c.fillStyle = '#ffd0d0';
        c.fillText(this.level.name, 0, 20);
      } else if (isSpecial(this.level.mode)) {
        const title = this.level.mode === 'boulder' ? '💎 DIAMOND BREAKER'
          : this.level.mode === 'bonus' ? '🪙 BONUS STAGE' : '🧰 HARTA KARUN';
        const hint = this.level.mode === 'boulder' ? 'Kikis batu hingga diamond bersih!'
          : this.level.mode === 'bonus' ? 'Bidik koin yang berputar!' : '10 detik! Berondong petinya!';
        c.font = font(27); c.lineWidth = 5; c.strokeStyle = 'rgba(0,0,0,0.9)';
        c.strokeText(title, 0, -9);
        c.fillStyle = this.level.mode === 'boulder' ? '#a5f3fc' : '#fde68a';
        c.fillText(title, 0, -9);
        c.font = font(13); c.fillStyle = '#ffffff'; c.fillText(hint, 0, 25);
      } else {
        c.font = font(38);
        c.lineWidth = 6;
        c.strokeStyle = 'rgba(0,0,0,0.7)';
        c.strokeText(`LEVEL ${n}`, 0, 0);
        c.fillStyle = '#ffffff';
        c.fillText(`LEVEL ${n}`, 0, 0);
      }
      if (n <= 2 && (this.weapon.auto || this.weapon.scope || this.weapon.charge)) {
        c.font = font(13);
        c.fillStyle = '#ffd23f';
        const hint = this.weapon.charge ? 'TAP = TEMBAK, TAHAN = CHARGE x4!' : this.weapon.scope ? 'TAHAN = BIDIK SLOW-MO, LEPAS = TEMBAK' : this.weapon.spinup ? 'TAHAN LAYAR UNTUK MEMUTAR LARAS!' : 'TAHAN LAYAR / SPASI = AUTO-FIRE';
        c.fillText(hint, 0, 40);
      }
      c.restore();
    }
  }
}
