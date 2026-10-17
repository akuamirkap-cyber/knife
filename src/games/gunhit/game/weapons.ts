export type WeaponId =
  | 'pistol' | 'ak47' | 'plasma' | 'laser' | 'cricket' | 'electro' | 'nail'
  | 'fish' | 'crossbow' | 'bazooka' | 'rpg' | 'freeze' | 'golden' | 'blackhole'
  | 'shotgun' | 'sniper' | 'minigun' | 'railgun' | 'flamethrower' | 'disc'
  | 'slingshot' | 'blowgun' | 'bamboo' | 'banana' | 'portal' | 'magnet' | 'bubble'
  | 'chrono' | 'shrink' | 'grow' | 'harpoon' | 'soaker' | 'snowball' | 'pirate'
  | 'chicken' | 'card' | 'confetti' | 'sonic' | 'seed' | 'glitch' | 'dragon'
  | 'mirror' | 'gravity' | 'pizza'
  | 'honey' | 'coconut' | 'angklung' | 'bee' | 'ink' | 'yoyo' | 'sakura' | 'acid' | 'keris' | 'tornado'
  | 'firework' | 'anchor' | 'shark' | 'ghost' | 'ufo' | 'rainbow' | 'meteor' | 'diamond' | 'moonbeam' | 'storm'
  | 'obliterator' | 'buster' | 'paintball' | 'holy' | 'beerifle' | 'emerald' | 'ruby' | 'sapphire' | 'crystal'
  | 'unicorn' | 'pencil' | 'sandal' | 'wand'
  | 'bit8' | 'coingun' | 'kunai' | 'blaster'
  | 'lone_star' | 'photon_saber' | 'plasma_repeater' | 'warp_disruptor' | 'deflector_shield'
  | 'gauntlet_cannon' | 'alien_ray' | 'pulse_rifle' | 'cryo_blaster' | 'hyperdrive' | 'quantum_destabilizer';
export type ProjKind = WeaponId | 'old';
export type Rarity = 'UMUM' | 'LANGKA' | 'EPIC' | 'LEGENDARIS';
export type TrailFx = 'none' | 'glow' | 'smoke' | 'spark' | 'bubble' | 'frost' | 'gold' | 'void' | 'fire' | 'pixel' | 'confetti' | 'rainbow' | 'petal' | 'note';
export type SaveFx = 'return' | 'bubble' | 'portal' | 'glitch' | 'mirror';

export interface BurstFx { colors: string[]; n: number; glow?: boolean; g?: number; spd?: number; size?: number }

export interface Weapon {
  id: WeaponId;
  name: string;
  emoji: string;
  desc: string;
  perk: string;
  rarity: Rarity;
  speed: number;
  cooldown: number;
  auto: boolean;
  points: number;
  coinRadius: number;
  coinValue: number;
  recoil: number;
  shake: number;
  half: number;
  stick: number; // how far it protrudes when stuck
  energy: boolean;
  color: string;
  trail: string;
  trailFx: TrailFx;
  sparks: string[];
  casing?: string;
  ejectY?: number;
  explode?: boolean;
  explodeFx?: 'fire' | 'white' | 'firework';
  slowStyle?: 'ice' | 'water' | 'honey' | 'stun';
  charge?: boolean;
  paint?: boolean;
  meltEvery?: number;
  meltText?: string;
  meltColors?: string[];
  everyBonus?: { n: number; pts: number; text: string };
  randomMagic?: boolean;
  transmute?: number;
  obliterate?: number;
  spinFly?: boolean;
  burnText?: string;
  burnIcon?: string;
  spikeText?: string;
  jackpotText?: string;
  saveText?: string;
  notes?: boolean;
  phaseSpikes?: boolean;
  meltOld?: boolean;
  abductEvery?: number;
  chain?: boolean;
  slow?: boolean;
  slowFactor?: number;
  slowTime?: number;
  slowRgb?: string;
  slowText?: string;
  luckyCoin?: number;
  luckyText?: string;
  pullCoins?: boolean;
  comboWindow?: number;
  backblast?: boolean;
  noSmoke?: boolean;
  burstFx?: BurstFx;
  // new perks
  burst?: number;
  scope?: boolean;
  spinup?: boolean;
  pierceOld?: boolean;
  burn?: boolean;
  saves?: number;
  saveFx?: SaveFx;
  saveSpikeOnly?: boolean;
  reverseChance?: number;
  reverseEvery?: number;
  spikeOff?: number;
  pushSpikes?: boolean;
  chronoEvery?: number;
  shrink?: boolean;
  grow?: boolean;
  snowman?: boolean;
  breakSpike?: boolean;
  randomBonus?: number;
  jackpot?: number;
  confetti?: boolean;
  seed?: boolean;
  bossMult?: number;
  rope?: boolean;
  beam?: boolean;
  previewLen: number;
  previewScale: number;
  previewY: number;
  price?: number; // koin untuk beli
  unlockLevel?: number; // terbuka otomatis di level ini
  stats: { rate: number; speed: number; power: number };
}

const base = {
  coinRadius: 15, coinValue: 1, half: 4.75, stick: 30, energy: false, trailFx: 'none' as TrailFx,
  previewLen: 175, previewScale: 0.95, previewY: 30, auto: false, points: 1, recoil: 1, shake: 3,
};
const FIRE = ['#fff3b0', '#ffd23f', '#ff9f1c'];
const CONF = ['#f43f5e', '#facc15', '#22d3ee', '#a855f7', '#4ade80', '#fb923c'];

export const WEAPONS: Weapon[] = [
  // ======================== ORIGINAL 14 ========================
  { ...base, id: 'pistol', name: 'PISTOL', emoji: '🔫', rarity: 'UMUM', perk: 'SEIMBANG', desc: 'Pistol klasik, seimbang di semua hal.',
    speed: 2700, cooldown: 0.12, shake: 2.5, stick: 17, color: '#ff3030', trail: '255,230,150', sparks: FIRE, casing: '#e0ad40', ejectY: 48, stats: { rate: 3, speed: 3, power: 3 } },
  { ...base, id: 'ak47', name: 'AK-47', emoji: '🪖', rarity: 'UMUM', perk: 'AUTO-FIRE', desc: 'Senapan serbu legendaris. Tahan layar untuk tembak otomatis!',
    speed: 3200, cooldown: 0.085, auto: true, recoil: 1.3, shake: 4.5, stick: 17, color: '#ff3030', trail: '255,230,150', sparks: FIRE, casing: '#8f9a62', ejectY: 128,
    previewLen: 262, previewScale: 0.86, previewY: 38, stats: { rate: 5, speed: 4, power: 4 } },
  { ...base, id: 'nail', name: 'NAIL GUN', emoji: '🔩', rarity: 'UMUM', perk: 'TIPIS & AUTO', desc: 'Paku super tipis, muat di celah sempit. Tahan untuk tembak beruntun!',
    speed: 3000, cooldown: 0.07, auto: true, recoil: 0.6, shake: 1.5, half: 2.4, stick: 18, color: '#ffc400', trail: '220,225,230', sparks: ['#ffffff', '#d8dde3', '#ffd23f'],
    previewLen: 200, previewScale: 0.8, previewY: 50, stats: { rate: 5, speed: 3, power: 2 } },
  { ...base, id: 'crossbow', name: 'CROSSBOW', emoji: '🏹', rarity: 'UMUM', perk: 'PRESISI', desc: 'Panah baja yang cepat dan ramping. Hitbox kecil, cocok buat yang presisi.',
    speed: 3600, cooldown: 0.22, recoil: 0.7, shake: 2, half: 3.2, stick: 18, noSmoke: true, unlockLevel: 2, color: '#ff3030', trail: '255,255,255', sparks: ['#ffffff', '#ffd23f', '#d8a060'],
    previewLen: 220, previewScale: 0.85, previewY: 64, stats: { rate: 2, speed: 5, power: 3 } },
  { ...base, id: 'plasma', name: 'PLASMA GUN', emoji: '🟢', rarity: 'LANGKA', perk: '2X POIN', desc: 'Peluru plasma lebih lambat, tapi tiap kena dapat 2 poin & koin ikut tertarik.',
    speed: 1700, cooldown: 0.16, points: 2, coinRadius: 30, recoil: 0.8, half: 5, energy: true, unlockLevel: 6, color: '#39ff9c', trail: '57,255,156', trailFx: 'glow',
    sparks: ['#d6ffe9', '#39ff9c', '#00c26e'], stats: { rate: 2, speed: 2, power: 5 } },
  { ...base, id: 'laser', name: 'LASER BEAM', emoji: '🔴', rarity: 'LANGKA', perk: 'INSTAN', desc: 'Secepat cahaya, langsung kena saat ditembak tanpa jeda.',
    speed: 14000, cooldown: 0.14, recoil: 0.5, shake: 2, half: 4.5, energy: true, beam: true, unlockLevel: 8, color: '#ff2a55', trail: '255,42,85', sparks: ['#ffd6de', '#ff2a55', '#ff7a90'],
    stats: { rate: 3, speed: 5, power: 3 } },
  { ...base, id: 'fish', name: 'FISH GUN', emoji: '🐟', rarity: 'LANGKA', perk: 'IKAN HOKI', desc: 'Nembak ikan hidup! 35% kemungkinan dapat koin bonus tiap ikan nancep.',
    speed: 1500, cooldown: 0.2, coinRadius: 18, recoil: 0.9, half: 6.2, noSmoke: true, price: 50, color: '#3ec6ff', trail: '120,210,255', trailFx: 'bubble',
    sparks: ['#bfeaff', '#3ec6ff', '#ffffff'], luckyCoin: 0.35, burstFx: { colors: ['#7fd3ff', '#bfeaff', '#ffffff'], n: 10, g: 900 }, stats: { rate: 2, speed: 2, power: 2 } },
  { ...base, id: 'rpg', name: 'RPG-7', emoji: '🚀', rarity: 'LANGKA', perk: 'LEDAKAN 2X', desc: 'Roket anti-tank. Meledak saat kena dan dapat 2 poin!',
    speed: 2100, cooldown: 0.38, points: 2, coinRadius: 22, recoil: 1.6, shake: 8, half: 6.2, price: 80, color: '#ff6a00', trail: '255,170,80', trailFx: 'smoke',
    sparks: ['#fff3b0', '#ff9f1c', '#ff4500'], explode: true, backblast: true, previewLen: 280, previewScale: 0.85, previewY: 40, stats: { rate: 2, speed: 3, power: 5 } },
  { ...base, id: 'cricket', name: 'NOISY CRICKET', emoji: '🦗', rarity: 'EPIC', perk: 'MINI MONSTER', desc: 'Pistol mini ala Men in Black. Kecil tapi tendangannya brutal, 3 poin tiap kena!',
    speed: 5000, cooldown: 0.45, points: 3, recoil: 3.4, shake: 15, half: 5, energy: true, unlockLevel: 15, color: '#7cc8ff', trail: '90,170,255', trailFx: 'glow',
    sparks: ['#ffffff', '#9fd8ff', '#3b8bff'], previewLen: 80, previewScale: 1.7, previewY: 22, stats: { rate: 1, speed: 5, power: 5 } },
  { ...base, id: 'electro', name: 'ELECTRO GUN', emoji: '⚡', rarity: 'EPIC', perk: 'COMBO+', desc: 'Petir menyambar ke peluru lain. Waktu combo lebih panjang, jadi gampang combo!',
    speed: 2600, cooldown: 0.15, coinRadius: 22, recoil: 0.8, half: 4.5, energy: true, unlockLevel: 12, color: '#5ad1ff', trail: '90,209,255', trailFx: 'spark',
    sparks: ['#ffffff', '#bff1ff', '#5ad1ff'], chain: true, comboWindow: 0.9, stats: { rate: 3, speed: 3, power: 3 } },
  { ...base, id: 'bazooka', name: 'BAZOOKA', emoji: '💣', rarity: 'EPIC', perk: '3X POIN', desc: 'Roket raksasa yang lambat, tapi ledakannya dahsyat. 3 poin tiap kena!',
    speed: 1200, cooldown: 0.5, points: 3, coinRadius: 26, recoil: 2, shake: 10, half: 6.5, price: 120, color: '#ff6a00', trail: '255,150,60', trailFx: 'smoke',
    sparks: ['#fff3b0', '#ff9f1c', '#ff4500'], explode: true, backblast: true, previewLen: 270, previewScale: 0.9, previewY: 40, stats: { rate: 1, speed: 1, power: 5 } },
  { ...base, id: 'freeze', name: 'FREEZE RAY', emoji: '❄️', rarity: 'LEGENDARIS', perk: 'BEKUKAN', desc: 'Tiap tembakan membekukan target sehingga putarannya melambat sebentar.',
    speed: 2200, cooldown: 0.18, recoil: 0.7, shake: 2.5, energy: true, price: 180, color: '#9be7ff', trail: '155,231,255', trailFx: 'frost',
    sparks: ['#ffffff', '#d6f6ff', '#7fe3ff'], slow: true, slowFactor: 0.3, slowTime: 1.3, slowRgb: '170,230,255', slowText: '❄ BEKU!', previewY: 40, stats: { rate: 3, speed: 3, power: 4 } },
  { ...base, id: 'golden', name: 'GOLDEN GUN', emoji: '🌟', rarity: 'LEGENDARIS', perk: '3X KOIN', desc: 'Pistol emas legendaris ala film James Bond. Koin bernilai 3x dan 2 poin tiap kena.',
    speed: 3000, cooldown: 0.15, points: 2, coinRadius: 18, coinValue: 3, recoil: 1.1, unlockLevel: 20, color: '#ffd23f', trail: '255,215,90', trailFx: 'gold',
    sparks: ['#ffffff', '#fff1a8', '#ffd23f'], casing: '#ffd23f', ejectY: 90, previewScale: 1, previewY: 26, stats: { rate: 3, speed: 4, power: 4 } },
  { ...base, id: 'blackhole', name: 'BLACK HOLE', emoji: '🕳️', rarity: 'LEGENDARIS', perk: 'SEDOT KOIN', desc: 'Menembak lubang hitam mini. Tiap kena, semua koin di target langsung tersedot!',
    speed: 1600, cooldown: 0.25, recoil: 1, shake: 5, half: 5, energy: true, price: 250, color: '#a855f7', trail: '168,85,247', trailFx: 'void',
    sparks: ['#ffffff', '#d8b4fe', '#a855f7'], pullCoins: true, stats: { rate: 2, speed: 2, power: 4 } },

  // ======================== 30 NEW ========================
  { ...base, id: 'slingshot', name: 'KETAPEL', emoji: '🪨', rarity: 'UMUM', perk: 'KHAS NUSANTARA', desc: 'Ketapel kayu sawo dengan karet ban dalam. Tarik... lepas... CTAK! Batu kali melesat berputar dan hanya nancep sedikit.',
    speed: 2900, cooldown: 0.36, recoil: 0.2, shake: 3, half: 4, stick: 14, noSmoke: true, spinFly: true, color: '#c0803f', trail: '210,200,190', sparks: ['#ffffff', '#c8c0b0', '#8b7d6b'],
    previewLen: 150, previewScale: 1.05, previewY: 32, stats: { rate: 3, speed: 3, power: 2 } },
  { ...base, id: 'blowgun', name: 'SUMPIT DAYAK', emoji: '🎋', rarity: 'UMUM', perk: 'SENYAP & TIPIS', desc: 'Sumpitan tradisional Dayak lengkap dengan mata tombak. Jarumnya paling tipis di game!',
    speed: 3300, cooldown: 0.16, recoil: 0.3, shake: 0.8, half: 1.5, stick: 16, noSmoke: true, color: '#9ccc65', trail: '230,255,210', sparks: ['#ffffff', '#e8f5c8', '#9ccc65'],
    previewLen: 290, previewScale: 0.78, previewY: 28, stats: { rate: 4, speed: 4, power: 1 } },
  { ...base, id: 'shotgun', name: 'SHOTGUN', emoji: '💥', rarity: 'UMUM', perk: 'TIGA SEKALIGUS', desc: '3 peluru menyebar sekaligus. Cepat selesai, tapi berisiko kena peluru lain!',
    speed: 2700, cooldown: 0.55, recoil: 2, shake: 8, half: 4.5, burst: 3, stick: 17, color: '#ff4d2e', trail: '255,200,120', sparks: FIRE, casing: '#d62828', ejectY: 96,
    previewLen: 250, previewScale: 0.82, previewY: 46, stats: { rate: 2, speed: 3, power: 5 } },
  { ...base, id: 'soaker', name: 'SUPER SOAKER', emoji: '💦', rarity: 'UMUM', perk: 'BASAH', desc: 'Pistol air neon. Target yang basah berputar lebih lambat. Tahan untuk semprot!',
    speed: 2300, cooldown: 0.11, auto: true, recoil: 0.4, shake: 1.2, half: 4.5, stick: 17, noSmoke: true, color: '#3b82f6', trail: '120,190,255', trailFx: 'bubble',
    sparks: ['#ffffff', '#bfdbfe', '#60a5fa'], slow: true, slowFactor: 0.6, slowTime: 1.5, slowRgb: '80,160,255', slowText: '💦 BASAH!',
    burstFx: { colors: ['#93c5fd', '#dbeafe', '#ffffff'], n: 8, g: 700, spd: 180 }, previewLen: 190, previewY: 40, stats: { rate: 5, speed: 3, power: 2 } },
  { ...base, id: 'snowball', name: 'SNOWBALL CANNON', emoji: '⛄', rarity: 'UMUM', perk: 'MANUSIA SALJU', desc: 'Bola salju bertumpuk. Tiap 3 bola salju menempel, muncul manusia salju dan bonus +3 poin!',
    speed: 2000, cooldown: 0.2, recoil: 0.9, shake: 2.5, half: 13, stick: 16, noSmoke: true, color: '#e0f2fe', trail: '230,245,255', trailFx: 'frost',
    sparks: ['#ffffff', '#e0f2fe', '#bae6fd'], snowman: true, burstFx: { colors: ['#ffffff', '#e0f2fe'], n: 12, g: 500, spd: 160 }, previewLen: 200, previewY: 48, stats: { rate: 3, speed: 2, power: 3 } },
  { ...base, id: 'sniper', name: 'SNIPER AWP', emoji: '🎯', rarity: 'LANGKA', perk: 'SLOW-MO SCOPE', desc: 'TAHAN layar untuk membidik dalam slow-motion, LEPAS untuk menembak. 2 poin tiap kena!',
    speed: 7000, cooldown: 0.5, points: 2, recoil: 2.2, shake: 7, half: 3.6, scope: true, color: '#ff2020', trail: '255,240,200', sparks: FIRE, casing: '#e0ad40', ejectY: 150,
    previewLen: 300, previewScale: 0.76, previewY: 50, stats: { rate: 1, speed: 5, power: 4 } },
  { ...base, id: 'flamethrower', name: 'FLAMETHROWER', emoji: '🔥', rarity: 'LANGKA', perk: 'MEMBAKAR', desc: 'Bola api beruntun. Target terbakar dan memberi poin bonus selama api menyala!',
    speed: 1900, cooldown: 0.13, auto: true, recoil: 0.3, shake: 1.5, half: 5.5, noSmoke: true, burn: true, color: '#ff7a00', trail: '255,140,40', trailFx: 'fire',
    sparks: ['#fff3b0', '#ff9f1c', '#ff4500'], burstFx: { colors: ['255,200,80', '255,120,30', '255,60,20'], n: 8, glow: true, g: -100, spd: 140, size: 8 },
    previewLen: 200, previewY: 34, stats: { rate: 5, speed: 2, power: 3 } },
  { ...base, id: 'disc', name: 'DISC GUN', emoji: '🥏', rarity: 'LANGKA', perk: 'CAKRAM PANTUL', desc: 'Menembakkan cakram energi neon yang berputar kencang! 2 poin dan bisa memantul aman 1x per level.',
    speed: 2600, cooldown: 0.2, points: 2, half: 6.5, stick: 20, recoil: 0.7, noSmoke: true, saves: 1, saveFx: 'return', saveText: '🥏 CAKRAM PANTUL!', spinFly: true, color: '#06b6d4', trail: '34,211,238', trailFx: 'glow',
    sparks: ['#ffffff', '#a5f3fc', '#06b6d4'], previewLen: 180, previewY: 30, stats: { rate: 3, speed: 4, power: 4 } },
  { ...base, id: 'bubble', name: 'BUBBLE GUN', emoji: '🫧', rarity: 'LANGKA', perk: 'PERISAI AIR', desc: 'Pistol gelembung sabun warna-warni nan indah mengkilap! Tiap gelembung memberi perisai aman 1x per level.',
    speed: 1600, cooldown: 0.18, recoil: 0.5, shake: 1.5, half: 6.5, stick: 20, noSmoke: true, saves: 1, saveFx: 'bubble', saveText: '🫧 GELEMBUNG AMAN!', color: '#f472b6', trail: '255,200,240', trailFx: 'bubble',
    sparks: ['#ffffff', '#fbcfe8', '#a5f3fc'], burstFx: { colors: ['220,240,255', '255,200,240', '254,240,138'], n: 12, glow: true, g: -40, spd: 130, size: 4 }, previewY: 34, stats: { rate: 3, speed: 2, power: 2 } },
  { ...base, id: 'bamboo', name: 'MERIAM BAMBU', emoji: '🎍', rarity: 'LANGKA', perk: 'DUARR LEBARAN', desc: 'Meriam bambu khas Lebaran! Petasan meledak DUARR dengan asap putih tebal, 2 poin.',
    speed: 1600, cooldown: 0.5, points: 2, recoil: 1.7, shake: 10, half: 5, color: '#7cb342', trail: '240,240,240', trailFx: 'smoke',
    sparks: ['#ffffff', '#fde68a', '#f87171'], explode: true, explodeFx: 'white', previewLen: 230, previewScale: 0.86, previewY: 40, stats: { rate: 1, speed: 2, power: 5 } },
  { ...base, id: 'banana', name: 'BANANA GUN', emoji: '🍌', rarity: 'LANGKA', perk: 'TERPELESET', desc: 'Daging pisang melesat, tertancap separuh dan memercikkan sari buah. Kulit menutup kembali saat isi ulang; 45% peluang membalik putaran!',
    speed: 2000, cooldown: 0.2, recoil: 0.8, half: 5.5, noSmoke: true, reverseChance: 0.45, color: '#fff0b3', trail: '255,238,190',
    sparks: ['#fffbe0', '#ffe135', '#c8a000'], previewLen: 180, previewY: 30, stats: { rate: 3, speed: 2, power: 3 } },
  { ...base, id: 'harpoon', name: 'HARPOON GUN', emoji: '🔱', rarity: 'LANGKA', perk: 'TALI PENARIK', desc: 'Tombak bertali. Talinya ikut menarik koin di sekitar titik kena.',
    speed: 2600, cooldown: 0.3, recoil: 0.9, half: 3, noSmoke: true, rope: true, coinRadius: 44, color: '#22d3ee', trail: '200,240,255',
    sparks: ['#ffffff', '#a5f3fc', '#22d3ee'], previewLen: 270, previewScale: 0.8, previewY: 30, stats: { rate: 2, speed: 4, power: 3 } },
  { ...base, id: 'chicken', name: 'RUBBER CHICKEN', emoji: '🐔', rarity: 'LANGKA', perk: 'KWEK!', desc: 'Ayam karet 2× lebih besar melesat sambil berbunyi. Tiap kena dapat poin bonus acak 0 sampai 5!',
    speed: 1800, cooldown: 0.22, recoil: 0.8, half: 12, stick: 70, noSmoke: true, randomBonus: 5, color: '#fde047', trail: '255,240,150',
    sparks: ['#ffffff', '#fde047', '#ef4444'], burstFx: { colors: ['#ffffff', '#fef9c3'], n: 8, g: 200, spd: 120 }, previewLen: 190, previewY: 44, stats: { rate: 3, speed: 2, power: 3 } },
  { ...base, id: 'confetti', name: 'CONFETTI CANNON', emoji: '🎉', rarity: 'LANGKA', perk: 'PESTA COMBO', desc: 'Setiap tembakan pesta konfeti! Waktu combo jauh lebih panjang.',
    speed: 2200, cooldown: 0.18, recoil: 0.8, half: 5, noSmoke: true, confetti: true, comboWindow: 1.3, color: '#f472b6', trail: '255,180,220', trailFx: 'confetti',
    sparks: CONF, burstFx: { colors: CONF, n: 22, g: 400, spd: 260 }, previewLen: 190, previewY: 30, stats: { rate: 3, speed: 3, power: 3 } },
  { ...base, id: 'seed', name: 'SEED GUN', emoji: '🌱', rarity: 'LANGKA', perk: 'TANAM KOIN', desc: 'Biji yang nancep tumbuh jadi bunga, lalu bunganya menghasilkan koin!',
    speed: 2000, cooldown: 0.2, recoil: 0.5, half: 4, noSmoke: true, seed: true, color: '#84cc16', trail: '180,230,120',
    sparks: ['#ffffff', '#bef264', '#65a30d'], burstFx: { colors: ['#86efac', '#4ade80', '#a3e635'], n: 8, g: 300, spd: 140 }, previewY: 44, stats: { rate: 3, speed: 2, power: 2 } },
  { ...base, id: 'pizza', name: 'PIZZA LAUNCHER', emoji: '🍕', rarity: 'LANGKA', perk: 'IRISAN KOIN', desc: 'Menembak irisan pizza. 40% kemungkinan irisan berubah jadi koin!',
    speed: 2000, cooldown: 0.2, recoil: 0.8, half: 6.5, noSmoke: true, luckyCoin: 0.4, luckyText: '🍕 +1 IRISAN!', color: '#f97316', trail: '255,200,120',
    sparks: ['#fff7ed', '#fdba74', '#dc2626'], previewLen: 190, previewY: 30, stats: { rate: 3, speed: 2, power: 3 } },
  { ...base, id: 'minigun', name: 'MINIGUN', emoji: '🌀', rarity: 'EPIC', perk: 'SPIN-UP', desc: 'Tahan layar: laras berputar makin cepat sampai menembak tanpa henti!',
    speed: 3400, cooldown: 0.3, auto: true, spinup: true, recoil: 0.5, shake: 2.5, half: 3.5, color: '#ff3030', trail: '255,230,150', sparks: FIRE, casing: '#e0ad40', ejectY: 110,
    previewLen: 240, previewScale: 0.8, previewY: 60, stats: { rate: 5, speed: 4, power: 3 } },
  { ...base, id: 'railgun', name: 'RAILGUN', emoji: '🧲', rarity: 'EPIC', perk: 'TEMBUS', desc: 'Peluru elektromagnetik nyaris instan. Bisa menembus 1 peluru LAMA (berkarat) tanpa gagal!',
    speed: 9500, cooldown: 0.35, points: 2, recoil: 1.5, shake: 6, half: 3, energy: true, beam: true, pierceOld: true, color: '#38bdf8', trail: '120,200,255', trailFx: 'spark',
    sparks: ['#ffffff', '#bae6fd', '#38bdf8'], previewLen: 210, previewY: 30, stats: { rate: 2, speed: 5, power: 5 } },
  { ...base, id: 'magnet', name: 'MAGNET GUN', emoji: '🧲', rarity: 'EPIC', perk: 'TARIK & TOLAK', desc: 'Menarik koin dari jauh dan MENDORONG duri jebakan menjauh dari titik tembak.',
    speed: 2400, cooldown: 0.2, half: 5.5, energy: true, pushSpikes: true, coinRadius: 46, color: '#ef4444', trail: '255,100,100', trailFx: 'spark',
    sparks: ['#ffffff', '#fecaca', '#ef4444'], previewY: 28, stats: { rate: 3, speed: 3, power: 3 } },
  { ...base, id: 'shrink', name: 'SHRINK RAY', emoji: '🔬', rarity: 'EPIC', perk: 'MENGECILKAN', desc: 'Tiap kena, semua peluru yang menancap ikut MENGECIL, jadi celahnya makin lebar!',
    speed: 2400, cooldown: 0.2, half: 3.5, energy: true, shrink: true, color: '#4ade80', trail: '74,222,128', trailFx: 'glow',
    sparks: ['#ffffff', '#bbf7d0', '#22c55e'], previewY: 28, stats: { rate: 3, speed: 3, power: 3 } },
  { ...base, id: 'grow', name: 'GROW RAY', emoji: '🔭', rarity: 'EPIC', perk: 'MEMBESARKAN', desc: 'Tiap kena, target MEMBESAR sehingga ruang tembak makin luas.',
    speed: 2200, cooldown: 0.22, half: 6, energy: true, grow: true, color: '#fb923c', trail: '251,146,60', trailFx: 'glow',
    sparks: ['#ffffff', '#fed7aa', '#f97316'], previewY: 28, stats: { rate: 3, speed: 2, power: 4 } },
  { ...base, id: 'pirate', name: 'MERIAM BAJAK LAUT', emoji: '🏴‍☠️', rarity: 'EPIC', perk: 'PENGHANCUR', desc: 'Bola meriam besi yang menghancurkan 1 duri jebakan setiap kena! 2 poin.',
    speed: 1700, cooldown: 0.45, points: 2, recoil: 1.9, shake: 9, half: 7.5, stick: 18, breakSpike: true, color: '#9ca3af', trail: '180,180,180', trailFx: 'smoke',
    sparks: FIRE, previewLen: 200, previewY: 30, stats: { rate: 1, speed: 2, power: 5 } },
  { ...base, id: 'card', name: 'CARD GUN', emoji: '🃏', rarity: 'EPIC', perk: 'JACKPOT AS', desc: 'Kartu remi setajam silet. 15% kemungkinan keluar kartu As dan dapat JACKPOT +8 koin!',
    speed: 3200, cooldown: 0.14, recoil: 0.4, shake: 1.2, half: 3, noSmoke: true, jackpot: 0.15, color: '#dc2626', trail: '255,255,255',
    sparks: ['#ffffff', '#fecaca', '#111111'], previewY: 30, stats: { rate: 4, speed: 4, power: 2 } },
  { ...base, id: 'sonic', name: 'SONIC BLASTER', emoji: '🔊', rarity: 'EPIC', perk: 'GELOMBANG SUARA', desc: 'Gelombang suara bass yang membuat duri jebakan TERTARIK MASUK selama 2 detik!',
    speed: 2600, cooldown: 0.22, half: 5, energy: true, spikeOff: 2.2, color: '#a3e635', trail: '190,255,120', trailFx: 'glow',
    sparks: ['#ffffff', '#d9f99d', '#84cc16'], previewY: 30, stats: { rate: 3, speed: 3, power: 4 } },
  { ...base, id: 'mirror', name: 'MIRROR GUN', emoji: '🪞', rarity: 'EPIC', perk: 'MEMANTUL', desc: 'Pecahan cermin yang memantul dari DURI tanpa gagal (3x per level).',
    speed: 2800, cooldown: 0.18, half: 4, energy: true, saves: 3, saveFx: 'mirror', saveSpikeOnly: true, color: '#e2e8f0', trail: '230,240,255', trailFx: 'spark',
    sparks: ['#ffffff', '#e2e8f0', '#93c5fd'], previewY: 30, stats: { rate: 3, speed: 4, power: 3 } },
  { ...base, id: 'portal', name: 'PORTAL GUN', emoji: '🌌', rarity: 'LEGENDARIS', perk: 'TELEPORT', desc: 'Kalau akan menabrak, peluru masuk portal dan keluar di titik AMAN (2x per level).',
    speed: 2600, cooldown: 0.2, half: 4.5, energy: true, saves: 2, saveFx: 'portal', color: '#ff9a1f', trail: '80,170,255', trailFx: 'glow',
    sparks: ['#ffffff', '#93c5fd', '#fb923c'], previewY: 30, stats: { rate: 3, speed: 3, power: 4 } },
  { ...base, id: 'chrono', name: 'CHRONO GUN', emoji: '⏱️', rarity: 'LEGENDARIS', perk: 'STOP WAKTU', desc: 'Setiap 3 kali kena, waktu BERHENTI selama 1,2 detik!',
    speed: 2600, cooldown: 0.2, half: 3.5, energy: true, chronoEvery: 3, color: '#facc15', trail: '250,220,120', trailFx: 'gold',
    sparks: ['#ffffff', '#fef08a', '#ca8a04'], previewY: 34, stats: { rate: 3, speed: 3, power: 4 } },
  { ...base, id: 'glitch', name: 'GLITCH GUN', emoji: '👾', rarity: 'LEGENDARIS', perk: 'LAG SELAMAT', desc: 'Peluru pixel yang ngelag. 1x per level, kalau akan menabrak, peluru ter-teleport ke tempat aman. 2 poin.',
    speed: 2800, cooldown: 0.18, points: 2, half: 4.5, energy: true, saves: 1, saveFx: 'glitch', color: '#22ff88', trail: '0,255,140', trailFx: 'pixel',
    sparks: ['#ff0055', '#00ffee', '#22ff88'], previewY: 30, stats: { rate: 3, speed: 4, power: 4 } },
  { ...base, id: 'dragon', name: 'DRAGON BREATH', emoji: '🐉', rarity: 'LEGENDARIS', perk: 'PEMBURU BOS', desc: 'Naga api mini yang membakar target. Poin 2x lipat saat melawan BOSS!',
    speed: 2200, cooldown: 0.22, points: 2, recoil: 1, shake: 4, half: 6, noSmoke: true, burn: true, bossMult: 2, color: '#ef4444', trail: '255,120,40', trailFx: 'fire',
    sparks: ['#fff3b0', '#ff9f1c', '#ef4444'], burstFx: { colors: ['255,200,80', '255,120,30', '255,40,20'], n: 14, glow: true, g: -80, spd: 200, size: 9 },
    previewLen: 200, previewY: 50, stats: { rate: 3, speed: 3, power: 5 } },
  { ...base, id: 'gravity', name: 'GRAVITY GUN', emoji: '🌍', rarity: 'LEGENDARIS', perk: 'BALIK ARAH', desc: 'Setiap 4 kali kena, gravitasi membalik arah putaran target. Koin di dekatnya ikut tertarik.',
    speed: 2300, cooldown: 0.22, half: 5, energy: true, reverseEvery: 4, coinRadius: 32, color: '#818cf8', trail: '129,140,248', trailFx: 'void',
    sparks: ['#ffffff', '#c7d2fe', '#6366f1'], previewY: 34, stats: { rate: 3, speed: 3, power: 4 } },

  // ======================== 20 NEW (wave 3) ========================
  { ...base, id: 'honey', name: 'HONEY BLASTER', emoji: '🍯', rarity: 'UMUM', perk: 'LENGKET', desc: 'Madu kental memercik, menempel di papan, dan memperlambat putarannya!',
    speed: 1900, cooldown: 0.18, half: 5.5, stick: 22, recoil: 0.7, noSmoke: true, slow: true, slowFactor: 0.5, slowTime: 1.6, slowRgb: '245,158,11', slowText: '🍯 LENGKET!', slowStyle: 'honey',
    color: '#f59e0b', trail: '255,190,60', trailFx: 'glow', sparks: ['#fff7d6', '#fbbf24', '#b45309'],
    burstFx: { colors: ['#fbbf24', '#f59e0b', '#fde68a'], n: 8, g: 900, spd: 150 }, previewY: 34, stats: { rate: 3, speed: 2, power: 2 } },
  { ...base, id: 'coconut', name: 'MERIAM KELAPA', emoji: '🥥', rarity: 'UMUM', perk: 'KELAPA MUDA', desc: 'Peluncur kelapa muda khas pantai tropis! Kelapa pecah dan menyiram air segar, 2 poin.',
    speed: 1500, cooldown: 0.4, points: 2, recoil: 1.5, shake: 7, half: 7, stick: 18, noSmoke: true, color: '#65a30d', trail: '220,240,200',
    sparks: ['#ffffff', '#ecfccb', '#a16207'], burstFx: { colors: ['#d9f99d', '#ffffff'], n: 8, g: 800, spd: 140 }, previewLen: 220, previewY: 38, stats: { rate: 1, speed: 2, power: 4 } },
  { ...base, id: 'angklung', name: 'ANGKLUNG', emoji: '🎶', rarity: 'LANGKA', perk: 'NADA COMBO', desc: 'Alat musik bambu Sunda yang menembakkan not balok. Tiap kena memainkan nada pentatonik dan waktu combo lebih panjang!',
    speed: 2300, cooldown: 0.16, half: 4, noSmoke: true, notes: true, comboWindow: 1.2, color: '#d97706', trail: '255,220,150', trailFx: 'note',
    sparks: ['#ffffff', '#fde68a', '#d97706'], previewY: 36, stats: { rate: 4, speed: 3, power: 2 } },
  { ...base, id: 'bee', name: 'BEE HIVE GUN', emoji: '🐝', rarity: 'LANGKA', perk: 'SENGAT', desc: 'Hornet bersengat tajam menancap di papan. Tahan untuk tembak beruntun; sengatnya terus memberi poin!',
    speed: 2100, cooldown: 0.1, auto: true, half: 3.5, stick: 24, recoil: 0.4, shake: 1.2, noSmoke: true, burn: true, burnText: '🐝 DISENGAT!', burnIcon: '🐝',
    color: '#facc15', trail: '250,204,21', sparks: ['#ffffff', '#fde047', '#111111'], previewY: 36, stats: { rate: 5, speed: 3, power: 2 } },
  { ...base, id: 'ink', name: 'TINTA GURITA', emoji: '🐙', rarity: 'LANGKA', perk: 'SEMBUR TINTA', desc: 'Semburan tinta gurita menutupi duri jebakan selama 2 detik, jadi duri tidak berbahaya!',
    speed: 2000, cooldown: 0.2, half: 5.5, noSmoke: true, spikeOff: 2, spikeText: '🐙 DURI TERTUTUP!', color: '#7c3aed', trail: '70,40,110', trailFx: 'glow',
    sparks: ['#c4b5fd', '#4c1d95', '#111111'], burstFx: { colors: ['#1e1b4b', '#312e81', '#4c1d95'], n: 10, g: 600, spd: 160 }, previewY: 36, stats: { rate: 3, speed: 2, power: 3 } },
  { ...base, id: 'yoyo', name: 'YOYO SHOOTER', emoji: '🪀', rarity: 'LANGKA', perk: 'TALI AJAIB', desc: 'Yoyo bertali ajaib. Kalau akan menabrak, yoyo ditarik balik dan kamu selamat (2x per level).',
    speed: 2400, cooldown: 0.22, half: 5.5, stick: 22, noSmoke: true, saves: 2, saveFx: 'return', saveText: '🪀 TARIK BALIK!', rope: true,
    color: '#ef4444', trail: '255,140,140', sparks: ['#ffffff', '#fecaca', '#ef4444'], previewY: 34, stats: { rate: 3, speed: 3, power: 2 } },
  { ...base, id: 'sakura', name: 'SAKURA BLOSSOM', emoji: '🌸', rarity: 'LANGKA', perk: 'HUJAN SAKURA', desc: 'Kelopak sakura yang tajam dan indah. 30% kemungkinan bunganya berubah jadi koin!',
    speed: 2500, cooldown: 0.16, half: 3.5, noSmoke: true, luckyCoin: 0.3, luckyText: '🌸 +1 💰', color: '#f9a8d4', trail: '255,190,220', trailFx: 'petal',
    sparks: ['#ffffff', '#fbcfe8', '#f472b6'], burstFx: { colors: ['#fbcfe8', '#f9a8d4', '#ffffff'], n: 10, g: 120, spd: 140 }, previewY: 34, stats: { rate: 4, speed: 3, power: 2 } },
  { ...base, id: 'acid', name: 'ACID SPITTER', emoji: '🧪', rarity: 'LANGKA', perk: 'KOROSI', desc: 'Cairan asam beracun yang MELELEHKAN 1 peluru berkarat setiap kena!',
    speed: 2100, cooldown: 0.22, half: 5, noSmoke: true, meltOld: true, color: '#a3e635', trail: '163,230,53', trailFx: 'glow',
    sparks: ['#ffffff', '#d9f99d', '#65a30d'], burstFx: { colors: ['163,230,53', '190,242,100'], n: 8, glow: true, g: 300, spd: 140, size: 5 }, previewY: 34, stats: { rate: 3, speed: 2, power: 3 } },
  { ...base, id: 'keris', name: 'KERIS SAKTI', emoji: '🗡️', rarity: 'EPIC', perk: 'TEMBUS GAIB', desc: 'Keris pusaka Jawa berlekuk 7 yang ditembakkan dengan tenaga dalam. Tembus 1 peluru berkarat dan 2 poin!',
    speed: 3000, cooldown: 0.25, points: 2, half: 3, stick: 32, noSmoke: true, pierceOld: true, color: '#fbbf24', trail: '255,215,120', trailFx: 'gold',
    sparks: ['#ffffff', '#fde68a', '#b45309'], previewLen: 220, previewY: 36, stats: { rate: 2, speed: 4, power: 4 } },
  { ...base, id: 'tornado', name: 'TORNADO GUN', emoji: '🌪️', rarity: 'EPIC', perk: 'PUSARAN', desc: 'Menembak angin puting beliung yang menyedot semua koin dan mendorong duri menjauh!',
    speed: 1900, cooldown: 0.25, half: 5.5, noSmoke: true, pullCoins: true, pushSpikes: true, color: '#94a3b8', trail: '200,210,225', trailFx: 'frost',
    sparks: ['#ffffff', '#e2e8f0', '#94a3b8'], previewY: 34, stats: { rate: 2, speed: 2, power: 4 } },
  { ...base, id: 'firework', name: 'FIREWORK LAUNCHER', emoji: '🎆', rarity: 'EPIC', perk: 'KEMBANG API', desc: 'Roket kembang api yang meledak jadi bunga api warna-warni di langit! 2 poin.',
    speed: 1700, cooldown: 0.4, points: 2, recoil: 1.3, shake: 6, half: 5, explode: true, explodeFx: 'firework', color: '#f43f5e', trail: '255,200,120', trailFx: 'confetti',
    sparks: ['#f43f5e', '#facc15', '#22d3ee', '#a855f7', '#4ade80'], previewLen: 220, previewY: 36, stats: { rate: 2, speed: 2, power: 4 } },
  { ...base, id: 'anchor', name: 'ANCHOR CANNON', emoji: '⚓', rarity: 'EPIC', perk: 'JANGKAR KAPAL', desc: 'Jangkar kapal raksasa berantai yang menghancurkan 1 duri setiap kena! 2 poin.',
    speed: 1600, cooldown: 0.45, points: 2, recoil: 1.8, shake: 9, half: 7.5, stick: 22, noSmoke: true, breakSpike: true, rope: true,
    color: '#64748b', trail: '160,170,190', sparks: ['#ffffff', '#cbd5e1', '#475569'], previewLen: 220, previewY: 36, stats: { rate: 1, speed: 2, power: 5 } },
  { ...base, id: 'shark', name: 'SHARK LAUNCHER', emoji: '🦈', rarity: 'EPIC', perk: 'GIGITAN HIU', desc: 'Meluncurkan hiu kecil yang lapar. Gigitannya ganas, 3 poin tiap kena!',
    speed: 1700, cooldown: 0.3, points: 3, recoil: 1.2, shake: 5, half: 6.5, stick: 32, noSmoke: true, color: '#0ea5e9', trail: '120,200,255', trailFx: 'bubble',
    sparks: ['#ffffff', '#bae6fd', '#0284c7'], burstFx: { colors: ['#7dd3fc', '#e0f2fe', '#ffffff'], n: 12, g: 900, spd: 180 }, previewLen: 200, previewY: 38, stats: { rate: 2, speed: 2, power: 5 } },
  { ...base, id: 'ghost', name: 'GHOST GUN', emoji: '👻', rarity: 'EPIC', perk: 'TEMBUS DURI', desc: 'Peluru roh hantu yang menembus duri jebakan! Tapi tetap tidak boleh kena peluru lain.',
    speed: 2000, cooldown: 0.22, half: 4.5, energy: true, phaseSpikes: true, color: '#c7d2fe', trail: '220,225,255', trailFx: 'glow',
    sparks: ['#ffffff', '#e0e7ff', '#a5b4fc'], previewY: 34, stats: { rate: 3, speed: 2, power: 3 } },
  { ...base, id: 'ufo', name: 'UFO RAY', emoji: '🛸', rarity: 'EPIC', perk: 'CULIK', desc: 'Setiap 3 kali kena, UFO menculik 1 duri atau peluru berkarat dengan sinar traktor!',
    speed: 2300, cooldown: 0.2, half: 4.5, energy: true, abductEvery: 3, color: '#4ade80', trail: '134,239,172', trailFx: 'glow',
    sparks: ['#ffffff', '#bbf7d0', '#22c55e'], previewY: 34, stats: { rate: 3, speed: 3, power: 3 } },
  { ...base, id: 'rainbow', name: 'RAINBOW GUN', emoji: '🌈', rarity: 'LEGENDARIS', perk: 'PELANGI', desc: 'Peluru pelangi berkilau! 2 poin, koin bernilai 2x, dan waktu combo lebih panjang.',
    speed: 2500, cooldown: 0.17, points: 2, coinValue: 2, comboWindow: 0.8, half: 4.5, energy: true, color: '#f472b6', trail: '255,180,220', trailFx: 'rainbow',
    sparks: ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa'], previewY: 34, stats: { rate: 3, speed: 3, power: 4 } },
  { ...base, id: 'meteor', name: 'METEOR LAUNCHER', emoji: '☄️', rarity: 'LEGENDARIS', perk: 'HUJAN METEOR', desc: 'Memanggil meteor membara dari luar angkasa. Ledakan dahsyat, hancurkan duri, 4 poin!',
    speed: 1300, cooldown: 0.55, points: 4, recoil: 2.2, shake: 12, half: 7, stick: 20, explode: true, breakSpike: true, color: '#f97316', trail: '255,140,50', trailFx: 'fire',
    sparks: ['#fff3b0', '#fb923c', '#dc2626'], previewY: 38, stats: { rate: 1, speed: 1, power: 5 } },
  { ...base, id: 'diamond', name: 'DIAMOND GUN', emoji: '💎', rarity: 'LEGENDARIS', perk: 'BERLIAN', desc: 'Pistol kristal yang menembakkan berlian. Koin 2x dan 25% kemungkinan JACKPOT +8 koin!',
    speed: 3400, cooldown: 0.16, half: 3, coinValue: 2, jackpot: 0.25, jackpotText: '💎 BERLIAN! +8 💰', noSmoke: true, color: '#67e8f9', trail: '200,250,255', trailFx: 'gold',
    sparks: ['#ffffff', '#cffafe', '#67e8f9'], previewY: 30, stats: { rate: 3, speed: 4, power: 4 } },
  { ...base, id: 'moonbeam', name: 'MOONBEAM', emoji: '🌙', rarity: 'LEGENDARIS', perk: 'CAHAYA BULAN', desc: 'Tongkat bulan menembakkan bintang-bintang beraura kuat secepat kilat. 2 poin dan 30% peluang koin bulan!',
    speed: 14000, cooldown: 0.18, points: 2, half: 4, energy: true, beam: true, luckyCoin: 0.3, luckyText: '🌙 +1 💰', color: '#c4b5fd', trail: '210,200,255',
    sparks: ['#ffffff', '#ede9fe', '#a78bfa'], previewY: 34, stats: { rate: 3, speed: 5, power: 4 } },
  { ...base, id: 'storm', name: 'STORM CALLER', emoji: '🌩️', rarity: 'LEGENDARIS', perk: 'BADAI PETIR', desc: 'Memanggil badai! Petir menyambar ke peluru lain, menghancurkan 1 duri, dan combo lebih mudah.',
    speed: 2700, cooldown: 0.2, half: 4.5, energy: true, chain: true, breakSpike: true, comboWindow: 0.8, color: '#93c5fd', trail: '147,197,253', trailFx: 'spark',
    sparks: ['#ffffff', '#dbeafe', '#3b82f6'], previewY: 34, stats: { rate: 3, speed: 4, power: 5 } },

  // ======================== 13 NEW (wave 4) ========================
  { ...base, id: 'pencil', name: 'PENCIL GUN', emoji: '✏️', rarity: 'UMUM', perk: 'PENGHAPUS', desc: 'Pensil raksasa yang tajam dan tipis! Setiap 3 kali kena, penghapusnya MENGHAPUS 1 peluru berkarat.',
    speed: 2900, cooldown: 0.17, half: 2.6, stick: 20, recoil: 0.5, shake: 1.5, noSmoke: true, meltEvery: 3, meltText: '✏️ DIHAPUS!', meltColors: ['255,182,193', '255,228,225', '250,204,21'],
    color: '#facc15', trail: '255,240,180', sparks: ['#ffffff', '#fde047', '#374151'], previewLen: 210, previewY: 36, stats: { rate: 3, speed: 4, power: 2 } },
  { ...base, id: 'sandal', name: 'SANDAL JEPIT', emoji: '🩴', rarity: 'UMUM', perk: 'PLAK!', desc: 'Senjata legendaris emak-emak Indonesia! Sandal jepit berputar dan bikin target PUSING melambat, 2 poin.',
    speed: 2000, cooldown: 0.24, points: 2, half: 6, stick: 18, recoil: 0.8, shake: 3, noSmoke: true, spinFly: true,
    slow: true, slowFactor: 0.45, slowTime: 1.1, slowRgb: '255,240,150', slowText: '💫 PUSING!', slowStyle: 'stun',
    color: '#3b82f6', trail: '200,220,255', sparks: ['#ffffff', '#93c5fd', '#1d4ed8'], previewY: 38, stats: { rate: 3, speed: 2, power: 3 } },
  { ...base, id: 'paintball', name: 'PAINTBALL GUN', emoji: '🎨', rarity: 'UMUM', perk: 'WARNA SAMA', desc: 'Bola cat warna acak, tahan untuk tembak beruntun! Kena dengan warna yang SAMA berturut-turut dapat bonus +3.',
    speed: 2600, cooldown: 0.12, auto: true, half: 4.5, stick: 12, recoil: 0.5, shake: 1.5, noSmoke: true, paint: true,
    color: '#ec4899', trail: '255,255,255', sparks: ['#f43f5e', '#facc15', '#22d3ee', '#a855f7', '#4ade80'], previewLen: 210, previewY: 50, stats: { rate: 5, speed: 3, power: 2 } },
  { ...base, id: 'wand', name: 'MAGIC WAND', emoji: '🪄', rarity: 'LANGKA', perk: 'SIM SALABIM', desc: 'Tongkat sihir berbintang. 40% kemungkinan MENGUBAH duri atau peluru berkarat jadi KOIN!',
    speed: 2300, cooldown: 0.2, half: 4, stick: 28, energy: true, transmute: 0.4, color: '#c084fc', trail: '233,213,255', trailFx: 'gold',
    sparks: ['#ffffff', '#f5d0fe', '#fde047'], previewLen: 200, previewScale: 0.95, previewY: 30, stats: { rate: 3, speed: 3, power: 3 } },
  { ...base, id: 'ruby', name: 'RUBY REVOLVER', emoji: '♦️', rarity: 'LANGKA', perk: 'LUCKY SIX', desc: 'Revolver emas bertatah silinder rubi merah. Setiap kena ke-6: LUCKY SIX bonus +6 poin!',
    speed: 3300, cooldown: 0.16, half: 4, recoil: 1.4, shake: 4, everyBonus: { n: 6, pts: 6, text: '🎰 LUCKY SIX! +6' },
    color: '#e11d48', trail: '255,120,140', trailFx: 'gold', sparks: ['#ffffff', '#fecdd3', '#e11d48'], casing: '#fda4af', ejectY: 70, previewY: 30, stats: { rate: 3, speed: 4, power: 4 } },
  { ...base, id: 'emerald', name: 'EMERALD LASER', emoji: '💚', rarity: 'EPIC', perk: 'KILAU ZAMRUD', desc: 'Sinar laser zamrud yang instan. 2 poin dan 25% kemungkinan memunculkan koin zamrud!',
    speed: 14000, cooldown: 0.16, points: 2, half: 3.5, energy: true, beam: true, luckyCoin: 0.25, luckyText: '💚 +1 💰',
    color: '#10b981', trail: '52,211,153', sparks: ['#ffffff', '#a7f3d0', '#059669'], previewY: 30, stats: { rate: 3, speed: 5, power: 4 } },
  { ...base, id: 'sapphire', name: 'SAPPHIRE SHOTGUN', emoji: '💙', rarity: 'EPIC', perk: 'BEKU SAFIR', desc: 'Shotgun laras ganda bertatah safir. 3 pecahan safir menyebar dan membekukan target!',
    speed: 2800, cooldown: 0.55, half: 4, burst: 3, recoil: 1.9, shake: 7, slow: true, slowFactor: 0.45, slowTime: 1.2, slowRgb: '96,165,250', slowText: '💙 BEKU SAFIR!',
    color: '#3b82f6', trail: '147,197,253', trailFx: 'frost', sparks: ['#ffffff', '#bfdbfe', '#2563eb'], casing: '#1d4ed8', ejectY: 90, previewLen: 240, previewScale: 0.85, previewY: 46, stats: { rate: 2, speed: 3, power: 5 } },
  { ...base, id: 'crystal', name: 'CRYSTAL CANNON', emoji: '🔮', rarity: 'EPIC', perk: 'PECAH KRISTAL', desc: 'Meriam kristal kuarsa. Kristalnya pecah berkeping-keping, menghancurkan 1 duri, dan dapat 3 poin!',
    speed: 1800, cooldown: 0.42, points: 3, half: 6, stick: 26, recoil: 1.6, shake: 7, energy: true, breakSpike: true,
    color: '#e879f9', trail: '245,208,254', trailFx: 'glow', sparks: ['#ffffff', '#f5d0fe', '#c026d3'], previewLen: 200, previewY: 40, stats: { rate: 1, speed: 2, power: 5 } },
  { ...base, id: 'beerifle', name: 'BEE RIFLE', emoji: '🐝', rarity: 'EPIC', perk: 'SENGAT RATU', desc: 'Senapan runduk bergaris lebah. TAHAN untuk membidik, LEPAS untuk menembakkan sengat ratu. Target tersengat dan memberi poin terus, 2 poin!',
    speed: 6500, cooldown: 0.45, points: 2, half: 2.8, stick: 30, recoil: 1.8, shake: 5, scope: true, noSmoke: true, burn: true, burnText: '🐝 SENGAT RATU!', burnIcon: '🐝',
    color: '#facc15', trail: '250,204,21', trailFx: 'gold', sparks: ['#ffffff', '#fde047', '#111111'], previewLen: 300, previewScale: 0.76, previewY: 50, stats: { rate: 1, speed: 5, power: 4 } },
  { ...base, id: 'buster', name: 'CHARGE BLASTER', emoji: '🔋', rarity: 'EPIC', perk: 'TAHAN = CHARGE', desc: 'Lengan meriam robot biru! Tap untuk peluru kecil. TAHAN untuk mengisi energi lalu lepas: tembakan raksasa 4x poin yang menembus peluru berkarat!',
    speed: 3000, cooldown: 0.12, half: 4, stick: 22, recoil: 0.8, energy: true, charge: true, color: '#38bdf8', trail: '125,211,252', trailFx: 'glow',
    sparks: ['#ffffff', '#fef08a', '#38bdf8'], previewLen: 170, previewY: 34, stats: { rate: 4, speed: 4, power: 5 } },
  { ...base, id: 'holy', name: 'HOLY LIGHT GUN', emoji: '😇', rarity: 'LEGENDARIS', perk: 'CAHAYA SUCI', desc: 'Senjata bersayap malaikat. Sinar suci instan yang MENYUCIKAN 1 peluru berkarat setiap kena, plus 1 perisai suci per level.',
    speed: 14000, cooldown: 0.2, points: 2, half: 4, energy: true, beam: true, meltEvery: 1, meltText: '✨ DISUCIKAN!', meltColors: ['255,240,180', '255,255,255', '253,224,71'],
    saves: 1, saveFx: 'bubble', saveText: '😇 PERISAI SUCI!', color: '#fde68a', trail: '255,240,180', sparks: ['#ffffff', '#fef9c3', '#fbbf24'], previewY: 40, stats: { rate: 3, speed: 5, power: 5 } },
  { ...base, id: 'unicorn', name: 'RAINBOW UNICORN', emoji: '🦄', rarity: 'LEGENDARIS', perk: 'SIHIR ACAK', desc: 'Kepala unicorn yang menembakkan sihir pelangi! Setiap kena memicu SIHIR ACAK: beku, balik arah, koin, sembunyikan duri, atau ubah jadi koin.',
    speed: 2400, cooldown: 0.2, points: 2, half: 4.5, energy: true, randomMagic: true, comboWindow: 0.8, color: '#f0abfc', trail: '255,190,240', trailFx: 'rainbow',
    sparks: ['#f87171', '#facc15', '#4ade80', '#60a5fa', '#c084fc', '#ffffff'], previewLen: 190, previewY: 44, stats: { rate: 3, speed: 3, power: 5 } },
  { ...base, id: 'obliterator', name: 'OBLITERATOR 9000', emoji: '☢️', rarity: 'LEGENDARIS', perk: 'PEMUSNAH', desc: 'Meriam energi hijau raksasa. Bola plasmanya lambat, tapi tentakel energinya MEMUSNAHKAN 3 duri atau peluru berkarat sekaligus! 5 poin.',
    speed: 900, cooldown: 0.95, points: 5, half: 8, stick: 24, recoil: 3, shake: 14, energy: true, obliterate: 3, color: '#4ade80', trail: '74,222,128', trailFx: 'glow',
    sparks: ['#ffffff', '#bbf7d0', '#22c55e'], previewLen: 230, previewScale: 0.82, previewY: 40, stats: { rate: 1, speed: 1, power: 5 } },

  // ======================== NEW 4 REQUESTED WEAPONS ========================
  { ...base, id: 'bit8', name: '8-BIT RETRO GUN', emoji: '👾', rarity: 'LANGKA', perk: 'RETRO ARCADE', desc: 'Pistol pixel retro 8-bit klasik! Suara chiptune pew-pew khas ding-dong dengan 2x poin dan glitch pixel!',
    speed: 3100, cooldown: 0.14, points: 2, half: 4, stick: 24, noSmoke: true, color: '#22c55e', trail: '34,197,94', trailFx: 'pixel',
    sparks: ['#22c55e', '#3b82f6', '#facc15', '#ef4444'], previewLen: 180, previewY: 34, stats: { rate: 4, speed: 4, power: 3 } },
  { ...base, id: 'coingun', name: 'COIN GUN', emoji: '🪙', rarity: 'EPIC', perk: 'PABRIK KOIN', desc: 'Menembakkan koin emas berkilau murni! Tiap tembakan yang nancep memberi +1 Koin langsung dan koin bernilai 2x!',
    speed: 2800, cooldown: 0.16, half: 5.5, stick: 18, recoil: 0.7, noSmoke: true, luckyCoin: 1.0, coinValue: 2, luckyText: '🪙 +1 KOIN EMAS!',
    color: '#eab308', trail: '250,204,21', trailFx: 'gold', sparks: ['#ffffff', '#fef08a', '#eab308'], previewLen: 190, previewY: 34, stats: { rate: 4, speed: 3, power: 4 } },
  { ...base, id: 'lone_star', name: 'REVOLVER KELANA', emoji: '🤠', rarity: 'EPIC', perk: 'LONE STAR', desc: 'Revolver koboi paling ikonik! Drum peluru berputar, gagang kayu ukir, dan bunyi "BANG!" khas Far West.',
    speed: 3400, cooldown: 0.2, points: 2, recoil: 1.9, shake: 6, half: 3.6, color: '#d97706', trail: '255,220,150', sparks: ['#ffffff', '#fde68a', '#d97706'],
    casing: '#e0ad40', ejectY: 84, previewLen: 195, previewY: 36, stats: { rate: 4, speed: 4, power: 4 } },
  { ...base, id: 'photon_saber', name: 'PHOTON SABER', emoji: '🌟', rarity: 'LEGENDARIS', perk: 'PEDANG CAHAYA', desc: 'Pedang energi plasma bercahaya khas film galaksi! Menembakkan bilah cahaya mematikan. 3 poin!',
    speed: 5200, cooldown: 0.26, points: 3, half: 3, stick: 34, energy: true, recoil: 1, shake: 3, color: '#22d3ee', trail: '120,240,255', trailFx: 'glow',
    sparks: ['#ffffff', '#a5f3fc', '#22d3ee'], previewLen: 230, previewY: 40, stats: { rate: 3, speed: 5, power: 5 } },
  { ...base, id: 'plasma_repeater', name: 'PLASMA REPEATER', emoji: '🔫', rarity: 'EPIC', perk: 'BLASTER BERUNTUN', desc: 'Blaster plasma futuristik khas film luar angkasa! Tahan layar untuk menembakkan deret plasma.',
    speed: 3100, cooldown: 0.1, auto: true, half: 3.2, energy: true, recoil: 0.6, shake: 2, color: '#f43f5e', trail: '255,120,140', trailFx: 'glow',
    sparks: ['#ffffff', '#fecdd3', '#f43f5e'], previewLen: 200, previewY: 44, stats: { rate: 5, speed: 4, power: 3 } },
  { ...base, id: 'warp_disruptor', name: 'WARP DISRUPTOR', emoji: '🌀', rarity: 'LEGENDARIS', perk: 'SINAR SUPER', desc: 'Stasiun senjata superlaser raksasa! Sinar hijau menghancurkan total, 4 poin dan ledakan besar.',
    speed: 1500, cooldown: 0.75, points: 4, half: 6, energy: true, recoil: 3, shake: 13, coinRadius: 30, color: '#22c55e', trail: '74,222,128', trailFx: 'glow',
    sparks: ['#ffffff', '#bbf7d0', '#22c55e'], previewLen: 260, previewScale: 0.85, previewY: 44, stats: { rate: 1, speed: 2, power: 5 } },
  { ...base, id: 'deflector_shield', name: 'DEFLECTOR SHIELD', emoji: '🛡️', rarity: 'LANGKA', perk: 'PERISAI BADAI', desc: 'Peluncur perisai deflektor khas sci-fi! 2x per level kamu terlindung dari peluru lain.',
    speed: 2400, cooldown: 0.2, half: 4, energy: true, recoil: 0.6, shake: 2, saves: 2, saveFx: 'bubble', saveText: '🛡️ DEFLEKTOR!', color: '#818cf8', trail: '165,180,252', trailFx: 'spark',
    sparks: ['#ffffff', '#c7d2fe', '#818cf8'], previewLen: 180, previewY: 34, stats: { rate: 3, speed: 3, power: 3 } },
  { ...base, id: 'gauntlet_cannon', name: 'GAUNTLET CANNON', emoji: '🦾', rarity: 'LEGENDARIS', perk: 'TELAPAK BESI', desc: 'Meriam telapak tangan robotik raksasa! Menembakkan bola energi dari telapak bercahaya, 3 poin.',
    speed: 2100, cooldown: 0.3, points: 3, half: 6.5, energy: true, recoil: 1.6, shake: 7, color: '#ef4444', trail: '255,140,120', trailFx: 'glow',
    sparks: ['#ffffff', '#fecaca', '#ef4444'], previewLen: 190, previewY: 44, stats: { rate: 2, speed: 3, power: 5 } },
  { ...base, id: 'alien_ray', name: 'ALIEN RAY', emoji: '👽', rarity: 'LANGKA', perk: 'SINAR LUAR ANGKASA', desc: 'Pistol sinar alien hijau berkilau khas invasi! 35% kemungkinan menculik peluru berkarat.',
    speed: 2800, cooldown: 0.18, half: 3.5, energy: true, recoil: 0.6, shake: 2, luckyCoin: 0.35, luckyText: '👽 CULIK KOIN!', color: '#4ade80', trail: '134,239,172', trailFx: 'glow',
    sparks: ['#ffffff', '#bbf7d0', '#4ade80'], previewLen: 185, previewY: 36, stats: { rate: 4, speed: 4, power: 3 } },
  { ...base, id: 'pulse_rifle', name: 'PULSE RIFLE', emoji: '⚡', rarity: 'LANGKA', perk: 'TEMBAK LISTRIK', desc: 'Senapan pulsa listrik futuristik! Tembakan listrik cepat dengan kilatan biru elektrik.',
    speed: 3600, cooldown: 0.14, half: 3.2, energy: true, recoil: 0.7, shake: 2.5, color: '#38bdf8', trail: '125,211,252', trailFx: 'spark',
    sparks: ['#ffffff', '#bae6fd', '#38bdf8'], previewLen: 250, previewScale: 0.82, previewY: 46, stats: { rate: 4, speed: 5, power: 3 } },
  { ...base, id: 'cryo_blaster', name: 'CRYO BLASTER', emoji: '🧊', rarity: 'LANGKA', perk: 'BEKU ANTARIKSA', desc: 'Blaster pendingin kriogenik khas sci-fi! Membekukan target dan membuatnya sangat lambat.',
    speed: 2500, cooldown: 0.2, half: 4, energy: true, recoil: 0.7, shake: 2.5, slow: true, slowFactor: 0.28, slowTime: 1.5, slowRgb: '190,240,255', slowText: '🧊 BEKU!',
    color: '#22d3ee', trail: '103,232,249', trailFx: 'frost', sparks: ['#ffffff', '#cffafe', '#22d3ee'], previewLen: 200, previewY: 40, stats: { rate: 3, speed: 3, power: 4 } },
  { ...base, id: 'hyperdrive', name: 'HYPERDRIVE CANNON', emoji: '🌠', rarity: 'LANGKA', perk: 'KANON ANTARIKSA', desc: 'Meriam pesawat luar angkasa! Peluru energi biru cepat dengan jejak kilat antariksa.',
    speed: 6000, cooldown: 0.22, points: 2, half: 4, energy: true, beam: true, recoil: 1, shake: 4, color: '#60a5fa', trail: '147,197,253', trailFx: 'glow',
    sparks: ['#ffffff', '#dbeafe', '#60a5fa'], previewLen: 260, previewScale: 0.82, previewY: 40, stats: { rate: 3, speed: 5, power: 4 } },
  { ...base, id: 'quantum_destabilizer', name: 'QUANTUM DESTABILIZER', emoji: '🔮', rarity: 'EPIC', perk: 'KACAUKUANTUM', desc: 'Senjata destabilisasi kuantum! Peluru portal acak yang menembus peluru berkarat. 2 poin.',
    speed: 4200, cooldown: 0.24, points: 2, half: 3.4, energy: true, pierceOld: true, recoil: 1, shake: 4, color: '#a855f7', trail: '216,180,254', trailFx: 'void',
    sparks: ['#ffffff', '#e9d5ff', '#a855f7'], previewLen: 210, previewY: 38, stats: { rate: 3, speed: 5, power: 4 } },
  { ...base, id: 'kunai', name: 'KUNAI SHURIKEN', emoji: '🗡️', rarity: 'LANGKA', perk: 'NINJA CEPAT', desc: 'Senjata ninja legendaris! Kunai baja tipis dengan jangkauan presisi super ramping & kecepatan tinggi.',
    speed: 4200, cooldown: 0.15, half: 2.2, stick: 30, recoil: 0.4, noSmoke: true, color: '#e2e8f0', trail: '241,245,249',
    sparks: ['#ffffff', '#cbd5e1', '#94a3b8'], previewLen: 210, previewY: 30, stats: { rate: 4, speed: 5, power: 3 } },
  { ...base, id: 'blaster', name: 'WARS BLASTER', emoji: '⚡', rarity: 'LEGENDARIS', perk: 'LASER GALAXY', desc: 'Blaster energi galaksi ala Star Wars! Baut plasma merah terang dengan suara tembakan sci-fi otentik, 3 poin!',
    speed: 8500, cooldown: 0.18, points: 3, half: 3.8, stick: 26, energy: true, recoil: 1.2, shake: 4, color: '#ef4444', trail: '239,68,68', trailFx: 'glow',
    sparks: ['#ffffff', '#fca5a5', '#ef4444'], previewLen: 220, previewY: 34, stats: { rate: 4, speed: 5, power: 5 } },
];

export const RARITY_COLOR: Record<Rarity, string> = {
  UMUM: '#9ca3af',
  LANGKA: '#3b82f6',
  EPIC: '#a855f7',
  LEGENDARIS: '#f59e0b',
};

export const getWeapon = (id: string) => WEAPONS.find((w) => w.id === id) || WEAPONS[0];

export function isWeaponUnlocked(_w: Weapon, _ownedIds?: string[], _highestLevel?: number): boolean {
  // Semua senjata terbuka 100%!
  return true;
}

/** Peluang rarity untuk kotak hadiah boss (%). */
export const GIFT_RARITY_WEIGHT: Record<Rarity, number> = {
  UMUM: 45,
  LANGKA: 27,
  EPIC: 17,
  LEGENDARIS: 11,
};

/**
 * Roll satu senjata Gun Hit untuk kotak hadiah boss.
 * Senjata yang sedang dipakai (excludeId) dikecualikan supaya hadiah terasa baru.
 */
export function rollGiftWeapon(excludeId?: string): Weapon {
  const pool = WEAPONS.filter((w) => w.id !== excludeId);
  const source = pool.length > 0 ? pool : WEAPONS;
  const total = source.reduce((s, w) => s + GIFT_RARITY_WEIGHT[w.rarity], 0);
  let r = Math.random() * total;
  for (const w of source) {
    r -= GIFT_RARITY_WEIGHT[w.rarity];
    if (r <= 0) return w;
  }
  return source[source.length - 1];
}

export { drawGun } from './art/guns';
export { drawProjectile } from './art/projectiles';
