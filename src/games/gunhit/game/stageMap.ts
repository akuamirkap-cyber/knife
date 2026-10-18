import type { BossType } from './bossRoster';

export const GUN_HIT_MAP_MAX_LEVEL = 100;

/** Mirror the existing SGA five-stage cycle; this only describes map nodes. */
export type GunHitMapStage = 'normal' | 'special' | 'boss';

export interface GunHitMapNodeTheme {
  kind: GunHitMapStage;
  label: string;
  symbol: string;
}

interface GunHitMapCycle {
  icons: readonly [GunHitMapNodeTheme, GunHitMapNodeTheme, GunHitMapNodeTheme];
  bossName: string;
}

/** Map-only artwork names supplied by the user; they do not add gameplay enemies. */
export const GUN_HIT_MAP_CYCLES: readonly GunHitMapCycle[] = [
  { icons: [{ kind: 'normal', label: 'Gentong', symbol: '🛢️' }, { kind: 'normal', label: 'Perisai', symbol: '🛡️' }, { kind: 'normal', label: 'Goblin', symbol: '👺' }], bossName: 'Dark Knight' },
  { icons: [{ kind: 'normal', label: 'Bijih besi', symbol: '⛏️' }, { kind: 'normal', label: 'Landasan', symbol: '🔨' }, { kind: 'normal', label: 'Prajurit', symbol: '🪖' }], bossName: 'Iron Knight' },
  { icons: [{ kind: 'normal', label: 'Lentera gelap', symbol: '🏮' }, { kind: 'normal', label: 'Perisai hitam', symbol: '🛡️' }, { kind: 'normal', label: 'Bayangan', symbol: '👤' }], bossName: 'Shadow Knight' },
  { icons: [{ kind: 'normal', label: 'Mahkota', symbol: '👑' }, { kind: 'normal', label: 'Perisai kerajaan', symbol: '🛡️' }, { kind: 'normal', label: 'Pengawal', symbol: '🪖' }], bossName: 'Royal Knight' },
  { icons: [{ kind: 'normal', label: 'Kristal void', symbol: '💠' }, { kind: 'normal', label: 'Perisai retak', symbol: '🛡️' }, { kind: 'normal', label: 'Penjaga gelap', symbol: '🗡️' }], bossName: 'Void Knight' },
  { icons: [{ kind: 'normal', label: 'Lentera Jepang', symbol: '🏮' }, { kind: 'normal', label: 'Topeng Oni', symbol: '👹' }, { kind: 'normal', label: 'Goblin samurai', symbol: '👺' }], bossName: 'Oni Demon' },
  { icons: [{ kind: 'normal', label: 'Arang', symbol: '⚫' }, { kind: 'normal', label: 'Perisai api', symbol: '🛡️' }, { kind: 'normal', label: 'Penjaga merah', symbol: '🥷' }], bossName: 'Flame Oni' },
  { icons: [{ kind: 'normal', label: 'Genderang', symbol: '🥁' }, { kind: 'normal', label: 'Tameng', symbol: '🛡️' }, { kind: 'normal', label: 'Prajurit Oni', symbol: '👹' }], bossName: 'War Oni' },
  { icons: [{ kind: 'normal', label: 'Mahkota iblis', symbol: '👑' }, { kind: 'normal', label: 'Segel', symbol: '🔏' }, { kind: 'normal', label: 'Pengawal iblis', symbol: '👿' }], bossName: 'Demon Emperor' },
  { icons: [{ kind: 'normal', label: 'Bendera', symbol: '🚩' }, { kind: 'normal', label: 'Katana', symbol: '🗡️' }, { kind: 'normal', label: 'Samurai', symbol: '🥷' }], bossName: 'Oni Shogun' },
  { icons: [{ kind: 'normal', label: 'Roda gigi', symbol: '⚙️' }, { kind: 'normal', label: 'Pelat baja', symbol: '🧱' }, { kind: 'normal', label: 'Robot penjaga', symbol: '🤖' }], bossName: 'Mecha Cyborg' },
  { icons: [{ kind: 'normal', label: 'Chip', symbol: '🔲' }, { kind: 'normal', label: 'Perisai energi', symbol: '🛡️' }, { kind: 'normal', label: 'Drone', symbol: '🚁' }], bossName: 'Cyber Warden' },
  { icons: [{ kind: 'normal', label: 'Inti reaktor', symbol: '☢️' }, { kind: 'normal', label: 'Armor berat', symbol: '🦾' }, { kind: 'normal', label: 'Robot tempur', symbol: '🤖' }], bossName: 'Omega Mecha' },
  { icons: [{ kind: 'normal', label: 'Kristal energi', symbol: '💎' }, { kind: 'normal', label: 'Kubah', symbol: '🔰' }, { kind: 'normal', label: 'Drone plasma', symbol: '🚁' }], bossName: 'Nova Cyborg' },
  { icons: [{ kind: 'normal', label: 'Baterai', symbol: '🔋' }, { kind: 'normal', label: 'Armor berat', symbol: '🦾' }, { kind: 'normal', label: 'Robot elit', symbol: '🤖' }], bossName: 'Final Mecha' },
  { icons: [{ kind: 'normal', label: 'Tong mesiu', symbol: '💣' }, { kind: 'normal', label: 'Jangkar', symbol: '⚓' }, { kind: 'normal', label: 'Bajak laut', symbol: '🏴‍☠️' }], bossName: 'Pirate Lord' },
  { icons: [{ kind: 'normal', label: 'Lentera hantu', symbol: '🏮' }, { kind: 'normal', label: 'Jangkar karat', symbol: '⚓' }, { kind: 'normal', label: 'Kerangka', symbol: '💀' }], bossName: 'Ghost Captain' },
  { icons: [{ kind: 'normal', label: 'Kompas', symbol: '🧭' }, { kind: 'normal', label: 'Meriam', symbol: '💥' }, { kind: 'normal', label: 'Penjaga kerangka', symbol: '💀' }], bossName: 'Cursed Admiral' },
  { icons: [{ kind: 'normal', label: 'Mutiara gelap', symbol: '⚫' }, { kind: 'normal', label: 'Karang', symbol: '🪸' }, { kind: 'normal', label: 'Penjaga laut', symbol: '🧜' }], bossName: 'Abyss Pirate' },
  { icons: [{ kind: 'normal', label: 'Peti harta', symbol: '🧰' }, { kind: 'normal', label: 'Pedang kerajaan', symbol: '⚔️' }, { kind: 'normal', label: 'Pengawal elite', symbol: '🛡️' }], bossName: 'Pirate King' },
];

export const GUN_HIT_MAP_BOSS_NAMES = GUN_HIT_MAP_CYCLES.map((cycle) => cycle.bossName);

export function getGunHitMapStage(level: number): GunHitMapStage {
  const stageInCycle = ((Math.floor(level) - 1) % 5 + 5) % 5;
  if (stageInCycle === 4) return 'boss';
  if (stageInCycle === 3) return 'special';
  return 'normal';
}

export function getGunHitMapNodeTheme(level: number): GunHitMapNodeTheme {
  const stage = Math.max(1, Math.floor(level));
  const cycleIndex = Math.max(0, Math.min(GUN_HIT_MAP_CYCLES.length - 1, Math.floor((stage - 1) / 5)));
  const stageInCycle = (stage - 1) % 5;
  if (stageInCycle < 3) return GUN_HIT_MAP_CYCLES[cycleIndex].icons[stageInCycle];
  if (stageInCycle === 3) return { kind: 'special', label: 'Spesial', symbol: '✨' };
  return { kind: 'boss', label: GUN_HIT_MAP_CYCLES[cycleIndex].bossName, symbol: '👑' };
}

/** Boss portraits on map follow the four SGA base silhouettes in five-boss factions. */
export function getGunHitMapBoss(level: number): BossType {
  const bossIndex = Math.max(0, Math.floor(level / 5) - 1);
  return (['knight', 'oni', 'cyborg', 'pirate'] as const)[Math.min(3, Math.floor(bossIndex / 5))];
}

export function getGunHitMapNodeCaption(level: number): string {
  const stage = Math.max(1, Math.floor(level));
  return `${getGunHitMapNodeTheme(stage).label.toUpperCase()} LV${stage}`;
}
