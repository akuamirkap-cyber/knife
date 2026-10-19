import { useCallback, useState } from "react";
import { MAX_LEVEL } from "./stages";
import { WEAPONS } from "./weapons";
import { ACHIEVEMENTS, MILESTONES } from "./achievements";

export interface LevelResult {
  done: boolean;
  /** 1-3 bintang */
  stars: number;
  /** koin terbaik sekali main */
  best: number;
}

export interface SaveData {
  version: 1;
  coins: number;
  apples: number;
  score: number;
  highestUnlocked: number; // level tertinggi yang terbuka (1..100)
  completed: Record<string, LevelResult>;
  unlockedWeapons: string[];
  equippedId: string;
  claimedAch: string[];
  milestonesClaimed: number[];
  stats: {
    stagesWon: number;
    boxesOpened: number;
    adsWatched: number;
    equips: number;
    continuesDone: number;
    bossesDefeated: number;
    knivesThrown: number;
    coinsEarned: number;
    bestCombo: number;
  };
}

const KEY = "perfect-shot-save-v1";

export const DEFAULT_SAVE: SaveData = {
  version: 1,
  coins: 7597,
  apples: 562,
  score: 0,
  highestUnlocked: 1,
  completed: {},
  unlockedWeapons: ["revolver", "ak47"],
  equippedId: "revolver",
  claimedAch: [],
  milestonesClaimed: [],
  stats: {
    stagesWon: 0,
    boxesOpened: 0,
    adsWatched: 0,
    equips: 0,
    continuesDone: 0,
    bossesDefeated: 0,
    knivesThrown: 0,
    coinsEarned: 0,
    bestCombo: 0,
  },
};

function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_SAVE);
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      ...structuredClone(DEFAULT_SAVE),
      ...parsed,
      stats: { ...DEFAULT_SAVE.stats, ...(parsed.stats ?? {}) },
      completed: parsed.completed ?? {},
      unlockedWeapons: parsed.unlockedWeapons ?? [...DEFAULT_SAVE.unlockedWeapons],
    };
  } catch {
    return structuredClone(DEFAULT_SAVE);
  }
}

function persist(data: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* abaikan */
  }
}

export function useSave() {
  const [save, setSave] = useState<SaveData>(load);

  const update = useCallback((patch: Partial<SaveData> | ((s: SaveData) => Partial<SaveData>)) => {
    setSave((prev) => {
      const p = typeof patch === "function" ? patch(prev) : patch;
      const next: SaveData = { ...prev, ...p };
      persist(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    const fresh = structuredClone(DEFAULT_SAVE);
    persist(fresh);
    setSave(fresh);
  }, []);

  return { save, update, reset };
}

/* ---------- helpers ---------- */

export function isUnlocked(level: number, highestUnlocked: number) {
  return level >= 1 && level <= MAX_LEVEL && level <= highestUnlocked;
}

/** Bintang dari performa: pinned = semua pisau tanpa gagal */
export function starsFor(cleared: boolean, hitsTaken: number, isBoss: boolean): number {
  if (!cleared) return 0;
  if (isBoss) return hitsTaken <= 0 ? 3 : 2;
  return hitsTaken <= 0 ? 3 : 2;
}

/** Reward koin per jenis stage */
export function rewardFor(kind: "normal" | "bonus" | "treasure" | "boss", level: number, extra = 0): number {
  const tier = Math.floor((level - 1) / 25); // 0..3 chapter scaling
  switch (kind) {
    case "normal":
      return 40 + level * 2 + tier * 20;
    case "bonus":
      return extra; // = koin yang kena, 1 koin = 5 coin? keep 1:3 biar berasa
    case "treasure":
      return extra;
    case "boss":
      return 200 + tier * 150 + level * 2;
  }
}

export const BONUS_COIN_VALUE = 5;
export const NORMAL_COIN_VALUE = 1;

export function completionPct(completed: Record<string, LevelResult>): number {
  return Math.round((Object.keys(completed).length / MAX_LEVEL) * 100);
}

export function bossesDefeated(completed: Record<string, LevelResult>): number {
  return Object.keys(completed).filter((k) => Number(k) % 5 === 0).length;
}

/**
 * Cheat key "C": buka SEMUA gembok sekaligus — seluruh level (1..100),
 * seluruh senjata, seluruh achievement, dan seluruh milestone.
 */
export function unlockEverythingPatch(): Partial<SaveData> {
  return {
    highestUnlocked: MAX_LEVEL,
    unlockedWeapons: WEAPONS.map((w) => w.id),
    claimedAch: ACHIEVEMENTS.map((a) => a.id),
    milestonesClaimed: MILESTONES.map((m) => m.count),
  };
}
