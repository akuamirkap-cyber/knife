import type { Rarity } from "./weapons";

export interface Stats {
  stagesWon: number;
  boxesOpened: number;
  adsWatched: number;
  equips: number;
  continuesDone: number;
  bossesDefeated: number;
  knivesThrown: number;
  coinsEarned: number;
  bestCombo: number;
}

export const EMPTY_STATS: Stats = {
  stagesWon: 0,
  boxesOpened: 0,
  adsWatched: 0,
  equips: 0,
  continuesDone: 0,
  bossesDefeated: 0,
  knivesThrown: 0,
  coinsEarned: 0,
  bestCombo: 0,
};

export type AchCategory = "daily" | "skill";

export interface AchievementDef {
  id: string;
  category: AchCategory;
  title: string;
  desc: string;
  icon: string;
  target: number;
  coins: number;
  progress: (s: Stats, ownedCount: number) => number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ---- DAILY ----
  { id: "d-stage", category: "daily", title: "Main 1 Stage", desc: "Selesaikan 1 stage apa saja", icon: "🎯", target: 1, coins: 100, progress: (s) => s.stagesWon },
  { id: "d-box", category: "daily", title: "Buka 1 Kotak", desc: "Buka 1 kotak hadiah boss", icon: "🎁", target: 1, coins: 150, progress: (s) => s.boxesOpened },
  { id: "d-ad", category: "daily", title: "Nonton 1 Iklan", desc: "Revive / continue 1x via iklan", icon: "📺", target: 1, coins: 100, progress: (s) => s.adsWatched },
  { id: "d-equip", category: "daily", title: "Ganti Senjata", desc: "Equip 1 senjata dari koleksi", icon: "🔫", target: 1, coins: 80, progress: (s) => s.equips },
  { id: "d-knives", category: "daily", title: "Lempar 14 Pisau", desc: "Lempar 14 pisau (semua stage)", icon: "🔪", target: 14, coins: 120, progress: (s) => s.knivesThrown },
  { id: "d-continue", category: "daily", title: "Bangkit Lagi!", desc: "Revive 1 kali setelah gagal", icon: "▶️", target: 1, coins: 120, progress: (s) => s.continuesDone },
  // ---- SKILL: progres 100 level ----
  { id: "s-stage5", category: "skill", title: "Penjelajah", desc: "Menangkan 5 stage", icon: "🧭", target: 5, coins: 300, progress: (s) => s.stagesWon },
  { id: "s-stage25", category: "skill", title: "Veteran Stage", desc: "Menangkan 25 stage", icon: "⚔️", target: 25, coins: 700, progress: (s) => s.stagesWon },
  { id: "s-stage50", category: "skill", title: "Master Stage", desc: "Menangkan 50 stage", icon: "🏅", target: 50, coins: 1200, progress: (s) => s.stagesWon },
  { id: "s-stage100", category: "skill", title: "Legenda 100", desc: "Menangkan 100 stage", icon: "👑", target: 100, coins: 2500, progress: (s) => s.stagesWon },
  { id: "s-boss1", category: "skill", title: "Pembunuh Pertama", desc: "Kalahkan 1 boss", icon: "🗡️", target: 1, coins: 300, progress: (s) => s.bossesDefeated },
  { id: "s-boss5", category: "skill", title: "Pemburu Boss", desc: "Kalahkan 5 boss", icon: "👑", target: 5, coins: 700, progress: (s) => s.bossesDefeated },
  { id: "s-boss10", category: "skill", title: "Mid Slayer", desc: "Kalahkan 10 boss (GOBBLOR!)", icon: "💜", target: 10, coins: 1200, progress: (s) => s.bossesDefeated },
  { id: "s-boss20", category: "skill", title: "MASTER SLAYER", desc: "Kalahkan semua 20 boss!", icon: "☀️", target: 20, coins: 3000, progress: (s) => s.bossesDefeated },
  { id: "s-box5", category: "skill", title: "Pembuka Kotak", desc: "Buka 5 kotak hadiah", icon: "📦", target: 5, coins: 500, progress: (s) => s.boxesOpened },
  { id: "s-box20", category: "skill", title: "Raja Kotak", desc: "Buka 20 kotak hadiah", icon: "🎁", target: 20, coins: 1500, progress: (s) => s.boxesOpened },
  { id: "s-col3", category: "skill", title: "Kolektor Junior", desc: "Miliki 3 senjata", icon: "🎒", target: 3, coins: 250, progress: (_s, owned) => owned },
  { id: "s-col10", category: "skill", title: "Kolektor Sejati", desc: "Miliki 10 senjata", icon: "💼", target: 10, coins: 600, progress: (_s, owned) => owned },
  { id: "s-col25", category: "skill", title: "Master Kolektor", desc: "Miliki 25 senjata", icon: "🏆", target: 25, coins: 1500, progress: (_s, owned) => owned },
  { id: "s-coin2k", category: "skill", title: "Tukang Koin", desc: "Kumpulkan 2.000 koin", icon: "🪙", target: 2000, coins: 400, progress: (s) => s.coinsEarned },
  { id: "s-coin10k", category: "skill", title: "Sultan Koin", desc: "Kumpulkan 10.000 koin", icon: "💎", target: 10000, coins: 1200, progress: (s) => s.coinsEarned },
  { id: "s-knife200", category: "skill", title: "Tangan Dewa", desc: "Lempar 200 pisau total", icon: "🌟", target: 200, coins: 800, progress: (s) => s.knivesThrown },
  { id: "s-revive3", category: "skill", title: "Pantang Menyerah", desc: "Revive 3 kali", icon: "❤️‍🔥", target: 3, coins: 350, progress: (s) => s.continuesDone },
];

export interface Milestone {
  count: number;
  rarity: Rarity;
  label: string;
  desc: string;
}

export const MILESTONES: Milestone[] = [
  { count: 5, rarity: "COMMON", label: "5 Achievement", desc: "Weapon UMUM random" },
  { count: 10, rarity: "RARE", label: "10 Achievement", desc: "Weapon RARE random" },
  { count: 20, rarity: "LEGEND", label: "20 Achievement", desc: "Weapon LEGEND random" },
];
