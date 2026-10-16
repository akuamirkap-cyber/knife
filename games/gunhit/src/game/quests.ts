export interface Quest {
  id: string;
  title: string;
  desc: string;
  target: number;
  rewardCoins: number;
  rewardWeapon?: string;
  type: 'level' | 'score' | 'combo' | 'coins' | 'boss' | 'shots';
}

export const QUESTS: Quest[] = [
  { id: 'first_blood', title: 'Pemula Handal', desc: 'Capai Level 3', target: 3, rewardCoins: 15, type: 'level' },
  { id: 'coin_hunter_1', title: 'Pengumpul Koin', desc: 'Kumpulkan total 20 koin', target: 20, rewardCoins: 25, type: 'coins' },
  { id: 'combo_master_1', title: 'Jari Kilat', desc: 'Capai Combo x4', target: 4, rewardCoins: 30, type: 'combo' },
  { id: 'boss_slayer_1', title: 'Penakluk Bos Pertama', desc: 'Kalahkan Boss Level 5', target: 5, rewardCoins: 50, rewardWeapon: 'shotgun', type: 'level' },
  { id: 'score_streak_1', title: 'Skor Fantastis', desc: 'Raih Skor 25 dalam satu permainan', target: 25, rewardCoins: 35, type: 'score' },
  { id: 'marksman', title: 'Tembakan Presisi', desc: 'Capai Level 10', target: 10, rewardCoins: 60, rewardWeapon: 'sniper', type: 'level' },
  { id: 'coin_collector_2', title: 'Sultan Koin', desc: 'Kumpulkan total 60 koin', target: 60, rewardCoins: 80, type: 'coins' },
  { id: 'combo_god', title: 'Dewa Combo', desc: 'Capai Combo x6', target: 6, rewardCoins: 100, rewardWeapon: 'buster', type: 'combo' },
  { id: 'veteran', title: 'Penjelajah Galaksi', desc: 'Capai Level 15', target: 15, rewardCoins: 150, rewardWeapon: 'obliterator', type: 'level' },
  { id: 'legendary_score', title: 'Pemain Legendaris', desc: 'Raih Skor 60 dalam satu permainan', target: 60, rewardCoins: 200, rewardWeapon: 'holy', type: 'score' },
];

export interface QuestState {
  claimed: string[];
  maxCombo: number;
  totalCoinsCollected: number;
  highestScore: number;
  highestLevel: number;
}
