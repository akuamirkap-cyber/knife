// Sistem 100 level: NORMAL 🪵 / BONUS 🎡 / DESTROY 🪨 / BOSS 👑 (+ HARTA 💰 mode sampingan)
// Pola tiap 5 level: 1 normal, 2 normal, 3 bonus, 4 destroy, 5 boss.
// => 40 Normal + 20 Bonus + 20 Destroy + 20 Boss = 100 level.
// HARTA tetap ada sebagai mode sampingan (bukan jalur utama).
// Detail: docs/rencana-100-level.txt

export type StageKind = "normal" | "bonus" | "destroy" | "treasure" | "boss";
export type StagePhase = "normal" | "bonus" | "destroy" | "treasure" | "stage";

export const MAX_LEVEL = 100;

export const STAGE_META: Record<
  StageKind,
  { symbol: string; label: string; color: string; bg: string; desc: string; phase: StagePhase }
> = {
  normal: { symbol: "🪵", label: "NORMAL", color: "#d6a35c", bg: "rgba(214,163,92,.15)", desc: "Kayu polos, putaran stabil", phase: "normal" },
  bonus: { symbol: "🎡", label: "BONUS", color: "#fbbf24", bg: "rgba(251,191,36,.15)", desc: "Roda koin 1 arah", phase: "bonus" },
  destroy: { symbol: "🪨", label: "DESTROY", color: "#cbbfae", bg: "rgba(203,191,174,.15)", desc: "Hancurkan batu, ambil berlian", phase: "destroy" },
  treasure: { symbol: "💰", label: "HARTA", color: "#fde047", bg: "rgba(253,224,71,.15)", desc: "Tembak peti 10 detik", phase: "treasure" },
  boss: { symbol: "👑", label: "BOSS", color: "#fb7185", bg: "rgba(251,113,133,.15)", desc: "Boss dengan pola unik", phase: "stage" },
};

export interface StageInfo {
  level: number;
  kind: StageKind;
  /** index boss 0-19, hanya untuk kind === "boss" */
  bossIndex: number | null;
}

export function getStage(level: number): StageInfo {
  const lv = Math.min(MAX_LEVEL, Math.max(1, level));
  const m = lv % 5;
  if (m === 0) return { level: lv, kind: "boss", bossIndex: lv / 5 - 1 };
  if (m === 3) return { level: lv, kind: "bonus", bossIndex: null };
  if (m === 4) return { level: lv, kind: "destroy", bossIndex: null };
  return { level: lv, kind: "normal", bossIndex: null };
}

export interface Chapter {
  name: string;
  from: number;
  to: number;
  color: string;
  desc: string;
}

export const CHAPTERS: Chapter[] = [
  { name: "LEMBANG TUNAS", from: 1, to: 25, color: "#4ade80", desc: "Belajar timing & bidikan" },
  { name: "TELUK KARAT", from: 26, to: 50, color: "#38bdf8", desc: "Putaran balik & jeda" },
  { name: "NGARAI GLOOM", from: 51, to: 75, color: "#a855f7", desc: "Akselerasi & kekacauan" },
  { name: "PUNCAK EMAS", from: 76, to: 100, color: "#fbbf24", desc: "Ujian akhir + FINAL" },
];

export function chapterOf(level: number): Chapter {
  return CHAPTERS.find((c) => level >= c.from && level <= c.to) ?? CHAPTERS[0];
}

/** Pisau yang dibutuhkan tiap level (normal naik pelan per chapter) */
export function knivesFor(level: number): number {
  const info = getStage(level);
  if (info.kind === "boss") return 5 + Math.min(7, Math.floor(level / 12)); // lv5->5 ... lv100->12
  if (info.kind === "bonus") return 6;
  const tier = Math.floor((level - 1) / 25);
  return 5 + Math.min(2, tier); // 5..7
}

/** Pengali kecepatan putar per chapter (0.9x -> 1.35x) */
export function speedScale(level: number): number {
  const tier = Math.floor((Math.min(level, MAX_LEVEL) - 1) / 25);
  return [0.9, 1.0, 1.18, 1.35][tier] ?? 1;
}

/** Koin dasar menang normal */
export function normalReward(level: number): number {
  const tier = Math.floor((level - 1) / 25);
  return 40 + level * 2 + tier * 20;
}

/** Koin dasar menang boss (di luar gacha senjata) */
export function bossReward(level: number): number {
  const tier = Math.floor((level - 1) / 25);
  return 200 + tier * 150 + level * 2;
}

/** HP bongkahan batu stage DESTROY (naik per chapter) */
export function destroyHP(level: number): number {
  const tier = Math.floor((level - 1) / 25);
  return 22 + tier * 6;
}

/** Koin dasar menang destroy */
export function destroyReward(level: number): number {
  const tier = Math.floor((level - 1) / 25);
  return 50 + level * 2 + tier * 25;
}

/** 5 level dalam satu blok boss (contoh blok boss idx 0 -> level 1..5) */
export function blockLevels(bossIndex: number): number[] {
  const base = bossIndex * 5;
  return [base + 1, base + 2, base + 3, base + 4, base + 5];
}
