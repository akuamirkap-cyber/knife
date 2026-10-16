export type Rarity = 'common' | 'rare' | 'epic' | 'legend';
export type GunForm =
  | 'pistol' | 'revolver' | 'rifle' | 'ak' | 'smg' | 'shotgun' | 'sniper' | 'minigun'
  | 'cannon' | 'launcher' | 'blaster' | 'beam' | 'wand' | 'bow' | 'sling'
  | 'blowgun' | 'novelty' | 'organic' | 'heavy' | 'orb' | 'tank';
export type Ammo =
  | 'tracer' | 'heavy' | 'pellet' | 'slug' | 'nail' | 'bolt' | 'stone' | 'dart'
  | 'water' | 'snow' | 'honey' | 'coconut' | 'pencil' | 'paint' | 'plasma'
  | 'laser' | 'rocket' | 'flame' | 'disc' | 'bubble' | 'boom' | 'emoji'
  | 'confetti' | 'seed' | 'note' | 'ink' | 'yoyo' | 'petal' | 'acid' | 'magic'
  | 'card' | 'sonic' | 'shard' | 'coin' | 'star' | 'meteor' | 'bolt_elec'
  | 'rainbow' | 'blackhole' | 'portal' | 'freeze' | 'holy' | 'beamgalaxy'
  | 'tornado' | 'firework' | 'anchor' | 'chain' | 'shrink' | 'pixel' | 'kunai';

export interface WeaponDef {
  id: string;
  name: string;
  emoji: string;
  perk: string;
  rarity: Rarity;
  form: GunForm;
  ammo: Ammo;
  c1: string;   // body
  c2: string;   // accent
  glow: string; // energy / trail
  dmg: number;
  rof: number;      // seconds between shots
  mag: number;
  reload: number;
  speed: number;
  pellets: number;
  spread: number;
  splash: number;
  splashDmg: number;
  pierce: number;
  shake: number;
  recoil: number;
  size: number;
  auto: boolean;
  projEmoji?: string;
}

type P = Partial<WeaponDef>;

const BASE: Record<Rarity, Partial<WeaponDef>> = {
  common: { dmg: 1, rof: 0.16, mag: 24, reload: 1.3, speed: 1600, pellets: 1, spread: 0, splash: 0, splashDmg: 0, pierce: 0, shake: 2.5, recoil: 13, size: 4, auto: true },
  rare: { dmg: 2, rof: 0.2, mag: 20, reload: 1.5, speed: 1700, pellets: 1, spread: 0, splash: 14, splashDmg: 1, pierce: 0, shake: 4, recoil: 16, size: 5, auto: true },
  epic: { dmg: 3, rof: 0.32, mag: 14, reload: 1.8, speed: 1700, pellets: 1, spread: 0, splash: 32, splashDmg: 1, pierce: 1, shake: 7, recoil: 22, size: 7, auto: true },
  legend: { dmg: 5, rof: 0.5, mag: 9, reload: 2.1, speed: 1700, pellets: 1, spread: 0, splash: 54, splashDmg: 2, pierce: 1, shake: 11, recoil: 28, size: 9, auto: true },
};

function W(
  rarity: Rarity, id: string, name: string, emoji: string, perk: string,
  form: GunForm, ammo: Ammo, c1: string, c2: string, glow: string, o: P = {},
): WeaponDef {
  return { ...(BASE[rarity] as WeaponDef), rarity, id, name, emoji, perk, form, ammo, c1, c2, glow, ...o };
}

export const CATALOG: WeaponDef[] = [
  /* ---------------- COMMON ---------------- */
  W('common', 'pistol', 'Pistol', '🔫', 'SEIMBANG', 'pistol', 'tracer', '#3a414c', '#9aa6b5', '#ffd27a', { rof: 0.22, mag: 12, dmg: 1, auto: false, reload: 1.0 }),
  W('common', 'ak47', 'AK-47', '🪖', 'AUTO-FIRE', 'ak', 'tracer', '#6b4a2a', '#2c3139', '#ffb347', { rof: 0.1, mag: 30, reload: 1.3 }),
  W('common', 'nailgun', 'Nail Gun', '🔩', 'TIPIS & AUTO', 'smg', 'nail', '#c9752a', '#d8d8dd', '#ffd9a0', { rof: 0.07, mag: 40, dmg: 1, speed: 1900, reload: 1.2 }),
  W('common', 'crossbow', 'Crossbow', '🏹', 'PRESISI', 'bow', 'bolt', '#5a3b22', '#8d9ba8', '#ffe9b0', { rof: 0.5, mag: 8, dmg: 3, pierce: 2, speed: 2200, auto: false, reload: 1.6 }),
  W('common', 'ketapel', 'Ketapel', '🪨', 'KHAS NUSANTARA', 'sling', 'stone', '#7a5330', '#b9433a', '#d8c5a0', { rof: 0.45, mag: 10, dmg: 2, splash: 16, splashDmg: 1, speed: 1200, auto: false }),
  W('common', 'sumpit', 'Sumpit Dayak', '🎋', 'SENYAP & TIPIS', 'blowgun', 'dart', '#4f7a3a', '#d9c89a', '#bff5a0', { rof: 0.3, mag: 14, dmg: 2, pierce: 3, speed: 2100 }),
  W('common', 'shotgun', 'Shotgun', '💥', 'TIGA SEKALIGUS', 'shotgun', 'pellet', '#6a4a2c', '#99a3b0', '#ff9f5a', { rof: 0.55, mag: 8, pellets: 9, spread: 0.32, dmg: 1, reload: 1.9, shake: 9, recoil: 30 }),
  W('common', 'soaker', 'Super Soaker', '💦', 'BASAH', 'blaster', 'water', '#1d8ad1', '#ffd93d', '#6ddcff', { rof: 0.06, mag: 60, dmg: 1, speed: 1200, spread: 0.05, reload: 1.6 }),
  W('common', 'snowball', 'Snowball Cannon', '⛄', 'MANUSIA SALJU', 'cannon', 'snow', '#cfe8f5', '#6aa9cf', '#eaffff', { rof: 0.4, mag: 12, dmg: 2, splash: 30, splashDmg: 1, speed: 1100 }),
  W('common', 'honey', 'Honey Blaster', '🍯', 'LENGKET', 'blaster', 'honey', '#d99a1c', '#7a4b12', '#ffcf4d', { rof: 0.28, mag: 16, dmg: 2, splash: 26, splashDmg: 1, speed: 1000 }),
  W('common', 'kelapa', 'Meriam Kelapa', '🥥', 'KELAPA MUDA', 'cannon', 'coconut', '#6b4a2a', '#3c2a16', '#c9a05a', { rof: 0.7, mag: 6, dmg: 4, splash: 44, splashDmg: 2, speed: 900, shake: 9, auto: false }),
  W('common', 'pencil', 'Pencil Gun', '✏️', 'PENGHAPUS', 'smg', 'pencil', '#f2c200', '#ff8da1', '#ffe680', { rof: 0.13, mag: 24, dmg: 1, pierce: 1, speed: 1800 }),
  W('common', 'sandal', 'Sandal Jepit', '🩴', 'PL AK!', 'novelty', 'emoji', '#2e5aa8', '#f5f5f5', '#8ab6ff', { rof: 0.42, mag: 10, dmg: 3, splash: 24, splashDmg: 1, speed: 1200, projEmoji: '🩴' }),
  W('common', 'paintball', 'Paintball Gun', '🎨', 'WARNA SAMA', 'blaster', 'paint', '#2b2f3a', '#ff4ecd', '#ffa6f0', { rof: 0.11, mag: 30, dmg: 1, splash: 18, splashDmg: 1, speed: 1400 }),

  /* ---------------- RARE ---------------- */
  W('rare', 'plasmagun', 'Plasma Gun', '🟢', '2X POIN', 'blaster', 'plasma', '#243a2c', '#6dff9a', '#39ff88', { rof: 0.4, mag: 12, dmg: 3, splash: 54, splashDmg: 2, speed: 950 }),
  W('rare', 'laserbeam', 'Laser Beam', '🔴', 'INSTAN', 'beam', 'laser', '#2a1620', '#ff5a5a', '#ff2e63', { rof: 0.2, mag: 22, dmg: 2, pierce: 99, speed: 4200, splash: 0 }),
  W('rare', 'fishgun', 'Fish Gun', '🐟', 'IKAN HOKI', 'novelty', 'emoji', '#1f7fa8', '#9fe8ff', '#67e8f9', { rof: 0.25, mag: 18, dmg: 2, speed: 1400, projEmoji: '🐟' }),
  W('rare', 'rpg7', 'RPG-7', '🚀', 'LEDAKAN 2X', 'launcher', 'rocket', '#5c6650', '#c0392b', '#ff6b3d', { rof: 1.0, mag: 4, dmg: 6, splash: 84, splashDmg: 3, speed: 820, shake: 15, recoil: 38, auto: false, reload: 2.3 }),
  W('rare', 'awp', 'Sniper AWP', '🎯', 'SLOW-MO SCOPE', 'sniper', 'slug', '#2c4f3a', '#9fe6ff', '#49c4ff', { rof: 0.85, mag: 5, dmg: 6, pierce: 3, splash: 40, splashDmg: 2, speed: 3200, shake: 12, recoil: 32, auto: false, reload: 2.0 }),
  W('rare', 'flamer', 'Flamethrower', '🔥', 'MEMBAKAR', 'tank', 'flame', '#7a2f1a', '#ffb13d', '#ff6a1a', { rof: 0.035, mag: 90, dmg: 1, speed: 850, spread: 0.1, splash: 12, splashDmg: 1, reload: 2.2, shake: 1.5, recoil: 6 }),
  W('rare', 'discgun', 'Disc Gun', '🥏', 'CAKRAM PANTUL', 'blaster', 'disc', '#2b3550', '#5ef1ff', '#38bdf8', { rof: 0.3, mag: 14, dmg: 3, pierce: 4, speed: 1500 }),
  W('rare', 'bubblegun', 'Bubble Gun', '🫧', 'PERISAI AIR', 'novelty', 'bubble', '#8ed8ff', '#ffffff', '#bdf0ff', { rof: 0.16, mag: 30, dmg: 1, splash: 20, splashDmg: 1, speed: 900 }),
  W('rare', 'bambu', 'Meriam Bambu', '🎍', 'DUARR LEBARAN', 'cannon', 'boom', '#8fae4a', '#e4d9a2', '#ffcf6b', { rof: 0.9, mag: 4, dmg: 6, splash: 78, splashDmg: 3, speed: 780, shake: 15, auto: false, reload: 2.2 }),
  W('rare', 'banana', 'Banana Gun', '🍌', 'TERPELESET', 'novelty', 'emoji', '#f7d32e', '#946f10', '#ffe873', { rof: 0.22, mag: 20, dmg: 2, speed: 1500, projEmoji: '🍌' }),
  W('rare', 'harpoon', 'Harpoon Gun', '🔱', 'TALI PENARIK', 'heavy', 'chain', '#37506b', '#cfd8e3', '#7fd4ff', { rof: 0.65, mag: 7, dmg: 5, pierce: 3, speed: 1900, auto: false }),
  W('rare', 'chicken', 'Rubber Chicken', '🐔', 'KWEK!', 'novelty', 'emoji', '#ffd166', '#ff7b6b', '#ffe6a8', { rof: 0.3, mag: 14, dmg: 3, splash: 22, splashDmg: 1, speed: 1200, projEmoji: '🐔' }),
  W('rare', 'confetti', 'Confetti Cannon', '🎉', 'PESTA COMBO', 'cannon', 'confetti', '#b93bd4', '#ffd93d', '#ff79e1', { rof: 0.45, mag: 10, pellets: 12, spread: 0.45, dmg: 1, speed: 1300, shake: 6 }),
  W('rare', 'seedgun', 'Seed Gun', '🌱', 'TANAM KOIN', 'blaster', 'seed', '#3f7a35', '#c8e6a0', '#9ef07a', { rof: 0.17, mag: 26, dmg: 2, speed: 1500 }),
  W('rare', 'pizza', 'Pizza Launcher', '🍕', 'IRISAN KOIN', 'launcher', 'emoji', '#c0562a', '#ffd166', '#ffb36b', { rof: 0.38, mag: 12, dmg: 3, splash: 36, splashDmg: 1, speed: 1250, projEmoji: '🍕' }),
  W('rare', 'angklung', 'Angklung', '🎶', 'NADA COMBO', 'novelty', 'note', '#a97a3c', '#f0d9a8', '#ffd6f5', { rof: 0.18, mag: 28, dmg: 2, speed: 1500, pierce: 1 }),
  W('rare', 'ink', 'Tinta Gurita', '🐙', 'SEMBUR TINTA', 'organic', 'ink', '#5b2a8c', '#c6a6ff', '#a855f7', { rof: 0.1, mag: 44, dmg: 1, spread: 0.08, splash: 18, splashDmg: 1, speed: 1200, reload: 1.7 }),
  W('rare', 'yoyo', 'Yoyo Shooter', '🪀', 'TALI AJAIB', 'novelty', 'yoyo', '#e63946', '#ffd166', '#ff8fa3', { rof: 0.33, mag: 12, dmg: 3, pierce: 2, speed: 1300 }),
  W('rare', 'sakura', 'Sakura Blossom', '🌸', 'HUJAN SAKURA', 'wand', 'petal', '#f7c6d9', '#b2456e', '#ffd3e6', { rof: 0.12, mag: 36, dmg: 1, pellets: 3, spread: 0.18, speed: 1200, reload: 1.5 }),
  W('rare', 'acid', 'Acid Spitter', '🧪', 'KOROSI', 'organic', 'acid', '#2f5c30', '#b6ff4a', '#8ef02a', { rof: 0.2, mag: 20, dmg: 3, splash: 34, splashDmg: 2, speed: 1100 }),
  W('rare', 'wand', 'Magic Wand', '🪄', 'SIM SALABIM', 'wand', 'magic', '#2a1b3d', '#ffe66d', '#c084fc', { rof: 0.15, mag: 30, dmg: 2, splash: 22, splashDmg: 1, speed: 1600 }),
  W('rare', 'ruby', 'Ruby Revolver', '♦️', 'LUCKY SIX', 'revolver', 'shard', '#7a1030', '#ff5577', '#ff2d55', { rof: 0.3, mag: 6, dmg: 4, splash: 26, splashDmg: 1, speed: 2000, auto: false, reload: 1.6 }),
  W('rare', 'retro', '8-Bit Retro Gun', '👾', 'RETRO ARCADE', 'blaster', 'pixel', '#2b2f6b', '#51ff51', '#51ff51', { rof: 0.13, mag: 32, dmg: 2, speed: 1500 }),
  W('rare', 'kunai', 'Kunai Shuriken', '🗡️', 'NINJA CEPAT', 'novelty', 'kunai', '#1d2228', '#b9c6d4', '#e2e8f0', { rof: 0.08, mag: 40, dmg: 1, pierce: 2, speed: 2200, spread: 0.04, reload: 1.1 }),

  /* ---------------- EPIC ---------------- */
  W('epic', 'cricket', 'Noisy Cricket', '🦗', 'MINI MONSTER', 'pistol', 'boom', '#2f3b2a', '#9effa0', '#5cff8f', { rof: 0.6, mag: 5, dmg: 8, splash: 80, splashDmg: 3, speed: 1500, shake: 18, recoil: 44, auto: false }),
  W('epic', 'electro', 'Electro Gun', '⚡', 'COMBO+', 'blaster', 'bolt_elec', '#1d2b4a', '#7dd3fc', '#38bdf8', { rof: 0.12, mag: 30, dmg: 2, pierce: 3, speed: 2600 }),
  W('epic', 'bazooka', 'Bazooka', '💣', '3X POIN', 'launcher', 'rocket', '#4f5a42', '#f59e0b', '#ff7a2f', { rof: 0.95, mag: 4, dmg: 7, splash: 92, splashDmg: 3, speed: 880, shake: 17, recoil: 40, auto: false, reload: 2.4 }),
  W('epic', 'minigun', 'Minigun', '🌀', 'SPIN-UP', 'minigun', 'heavy', '#39414d', '#ffd166', '#ff9e2c', { rof: 0.04, mag: 150, dmg: 1, splash: 10, splashDmg: 1, speed: 2100, reload: 2.6, shake: 2.6, recoil: 9 }),
  W('epic', 'railgun', 'Railgun', '🧲', 'TEMBUS', 'sniper', 'slug', '#2b3a4a', '#67e8f9', '#22d3ee', { rof: 0.8, mag: 5, dmg: 8, pierce: 99, splash: 30, splashDmg: 2, speed: 3600, shake: 13, auto: false }),
  W('epic', 'magnet', 'Magnet Gun', '🧲', 'TARIK & TOLAK', 'heavy', 'sonic', '#9b1c1c', '#cbd5e1', '#f87171', { rof: 0.35, mag: 14, dmg: 3, splash: 48, splashDmg: 2, speed: 1400 }),
  W('epic', 'shrink', 'Shrink Ray', '🔬', 'MENGECILKAN', 'beam', 'shrink', '#1f3b4d', '#a7f3d0', '#34d399', { rof: 0.25, mag: 18, dmg: 3, pierce: 2, speed: 2400 }),
  W('epic', 'grow', 'Grow Ray', '🔭', 'MEMBESARKAN', 'beam', 'magic', '#3b2a4d', '#fcd34d', '#f59e0b', { rof: 0.25, mag: 18, dmg: 3, splash: 44, splashDmg: 2, speed: 2000 }),
  W('epic', 'pirate', 'Meriam Bajak Laut', '🏴‍☠️', 'PENGHANCUR', 'cannon', 'boom', '#2b2b2b', '#c9a227', '#ff9a3c', { rof: 1.0, mag: 4, dmg: 9, splash: 96, splashDmg: 3, speed: 820, shake: 18, auto: false, reload: 2.5 }),
  W('epic', 'card', 'Card Gun', '🃏', 'JACKPOT AS', 'pistol', 'card', '#111827', '#f87171', '#fca5a5', { rof: 0.1, mag: 36, dmg: 2, pierce: 2, speed: 1900, spread: 0.06 }),
  W('epic', 'sonic', 'Sonic Blaster', '🔊', 'GELOMBANG SUARA', 'tank', 'sonic', '#2c2c3a', '#a78bfa', '#8b5cf6', { rof: 0.42, mag: 12, dmg: 4, splash: 70, splashDmg: 2, speed: 1300, shake: 9 }),
  W('epic', 'mirror', 'Mirror Gun', '🪞', 'MEMANTUL', 'beam', 'laser', '#dbeafe', '#93c5fd', '#60a5fa', { rof: 0.22, mag: 20, dmg: 3, pierce: 99, speed: 3800 }),
  W('epic', 'bee', 'Bee Rifle', '🐝', 'SENGAT RATU', 'organic', 'emoji', '#f6c445', '#1f2937', '#ffe066', { rof: 0.09, mag: 44, dmg: 2, speed: 1600, spread: 0.1, projEmoji: '🐝', reload: 1.9 }),
  W('epic', 'keris', 'Keris Sakti', '🗡️', 'TEMBUS GAIB', 'wand', 'magic', '#3c2a16', '#ffd166', '#a78bfa', { rof: 0.28, mag: 12, dmg: 5, pierce: 99, speed: 2200 }),
  W('epic', 'tornado', 'Tornado Gun', '🌪️', 'PUSARAN', 'tank', 'tornado', '#3c4a57', '#cbd5e1', '#93c5fd', { rof: 0.5, mag: 10, dmg: 4, splash: 76, splashDmg: 2, speed: 1000 }),
  W('epic', 'firework', 'Firework Launcher', '🎆', 'KEMBANG API', 'launcher', 'firework', '#4c1d95', '#fbbf24', '#f472b6', { rof: 0.6, mag: 8, dmg: 4, splash: 72, splashDmg: 2, speed: 1100, shake: 10 }),
  W('epic', 'anchor', 'Anchor Cannon', '⚓', 'JANGKAR KAPAL', 'cannon', 'anchor', '#374151', '#9ca3af', '#cbd5e1', { rof: 0.85, mag: 5, dmg: 8, splash: 70, splashDmg: 3, speed: 950, shake: 16, auto: false }),
  W('epic', 'shark', 'Shark Launcher', '🦈', 'GIGITAN HIU', 'launcher', 'emoji', '#1e3a5f', '#93c5fd', '#60a5fa', { rof: 0.55, mag: 8, dmg: 6, splash: 56, splashDmg: 2, speed: 1150, projEmoji: '🦈' }),
  W('epic', 'emerald', 'Emerald Laser', '💚', 'KILAU ZAMRUD', 'beam', 'laser', '#064e3b', '#6ee7b7', '#10b981', { rof: 0.18, mag: 24, dmg: 4, pierce: 99, speed: 4000 }),
  W('epic', 'sapphire', 'Sapphire Shotgun', '💙', 'BEKU SAFIR', 'shotgun', 'freeze', '#1e3a8a', '#bfdbfe', '#60a5fa', { rof: 0.5, mag: 8, pellets: 10, spread: 0.34, dmg: 2, speed: 1600, shake: 9, recoil: 30 }),
  W('epic', 'crystal', 'Crystal Cannon', '🔮', 'PECAH KRISTAL', 'cannon', 'shard', '#4c1d95', '#e9d5ff', '#c084fc', { rof: 0.45, mag: 10, dmg: 5, pellets: 3, spread: 0.16, splash: 40, splashDmg: 2, speed: 1700 }),
  W('epic', 'charge', 'Charge Blaster', '🔋', 'TAHAN = CHARGE', 'blaster', 'plasma', '#14532d', '#bef264', '#a3e635', { rof: 0.38, mag: 12, dmg: 5, splash: 66, splashDmg: 2, speed: 1200 }),
  W('epic', 'ufo', 'UFO Ray', '🛸', 'CULIK', 'orb', 'shrink', '#1f2937', '#5eead4', '#2dd4bf', { rof: 0.3, mag: 16, dmg: 4, splash: 48, splashDmg: 2, speed: 1800, pierce: 2 }),
  W('epic', 'coingun', 'Coin Gun', '🪙', 'PABRIK KOIN', 'smg', 'coin', '#b45309', '#fcd34d', '#fde68a', { rof: 0.08, mag: 50, dmg: 2, speed: 1800, reload: 1.6 }),

  /* ---------------- LEGEND ---------------- */
  W('legend', 'freeze', 'Freeze Ray', '❄️', 'BEKUKAN', 'beam', 'freeze', '#0c4a6e', '#bae6fd', '#38bdf8', { rof: 0.22, mag: 20, dmg: 4, pierce: 4, splash: 40, splashDmg: 2, speed: 2600 }),
  W('legend', 'golden', 'Golden Gun', '🌟', '3X KOIN', 'pistol', 'coin', '#a16207', '#fde047', '#fbbf24', { rof: 0.3, mag: 8, dmg: 9, splash: 48, splashDmg: 3, speed: 2600, auto: false, reload: 1.4 }),
  W('legend', 'blackhole', 'Black Hole', '🕳️', 'SEDOT KOIN', 'orb', 'blackhole', '#0b0b14', '#a78bfa', '#7c3aed', { rof: 0.9, mag: 4, dmg: 7, splash: 118, splashDmg: 4, speed: 700, shake: 16, reload: 2.4 }),
  W('legend', 'portal', 'Portal Gun', '🌌', 'TELEPORT', 'orb', 'portal', '#1e293b', '#fb923c', '#38bdf8', { rof: 0.45, mag: 10, dmg: 5, splash: 62, splashDmg: 2, speed: 1500, pierce: 2 }),
  W('legend', 'chrono', 'Chrono Gun', '⏱️', 'STOP WAKTU', 'beam', 'magic', '#164e63', '#67e8f9', '#22d3ee', { rof: 0.3, mag: 12, dmg: 6, splash: 56, splashDmg: 2, speed: 2200, pierce: 3 }),
  W('legend', 'rainbow', 'Rainbow Gun', '🌈', 'PELANGI', 'blaster', 'rainbow', '#312e81', '#f472b6', '#22d3ee', { rof: 0.09, mag: 60, dmg: 2, pellets: 2, spread: 0.1, speed: 2000, reload: 1.8 }),
  W('legend', 'meteor', 'Meteor Launcher', '☄️', 'HUJAN METEOR', 'launcher', 'meteor', '#4a2b1a', '#fb923c', '#f97316', { rof: 0.85, mag: 5, dmg: 9, splash: 104, splashDmg: 4, speed: 1000, shake: 18, reload: 2.4 }),
  W('legend', 'diamondgun', 'Diamond Gun', '💎', 'BERLIAN', 'revolver', 'shard', '#0e7490', '#a5f3fc', '#67e8f9', { rof: 0.26, mag: 8, dmg: 8, pellets: 2, spread: 0.08, splash: 44, splashDmg: 3, speed: 2600 }),
  W('legend', 'moonbeam', 'Moonbeam', '🌙', 'CAHAYA BULAN', 'beam', 'holy', '#1e1b4b', '#e2e8f0', '#c7d2fe', { rof: 0.25, mag: 16, dmg: 6, pierce: 99, speed: 3400 }),
  W('legend', 'storm', 'Storm Caller', '🌩️', 'BADAI PETIR', 'wand', 'bolt_elec', '#1e293b', '#fde047', '#60a5fa', { rof: 0.18, mag: 24, dmg: 5, pierce: 5, splash: 40, splashDmg: 2, speed: 3000 }),
  W('legend', 'holy', 'Holy Light Gun', '😇', 'CAHAYA SUCI', 'beam', 'holy', '#fef3c7', '#fbbf24', '#fde68a', { rof: 0.3, mag: 14, dmg: 7, pierce: 99, splash: 50, splashDmg: 2, speed: 3000 }),
  W('legend', 'unicorn', 'Rainbow Unicorn', '🦄', 'SIHIR ACAK', 'wand', 'rainbow', '#f9a8d4', '#a78bfa', '#f472b6', { rof: 0.11, mag: 50, dmg: 3, pellets: 3, spread: 0.22, speed: 1700, reload: 1.9 }),
  W('legend', 'obliterator', 'Obliterator 9000', '☢️', 'PEMUSNAH', 'tank', 'boom', '#3f3f46', '#a3e635', '#84cc16', { rof: 1.0, mag: 3, dmg: 12, splash: 140, splashDmg: 5, speed: 900, shake: 22, recoil: 46, reload: 2.8 }),
  W('legend', 'wars', 'Wars Blaster', '⚡', 'LASER GALAXY', 'beam', 'beamgalaxy', '#111827', '#f0abfc', '#a855f7', { rof: 0.16, mag: 30, dmg: 5, pierce: 99, speed: 4400, reload: 1.9 }),
];

export const BY_ID: Record<string, WeaponDef> = Object.fromEntries(CATALOG.map((w) => [w.id, w]));
export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'UMUM', rare: 'LANGKA', epic: 'EPIC', legend: 'LEGENDARIS',
};
export const RARITY_COLOR: Record<Rarity, string> = {
  common: '#cbd5e1', rare: '#60a5fa', epic: '#c084fc', legend: '#fbbf24',
};
