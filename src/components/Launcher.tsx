import React, { useState } from 'react';
import { 
  Gamepad2, 
  Sword, 
  Trophy, 
  Zap, 
  ShieldCheck, 
  Flame, 
  ChevronRight, 
  Play, 
  Layers,
  Crown
} from 'lucide-react';

export type GameKey = 'gunhit' | 'knife-hit';

interface GameItem {
  id: GameKey;
  zipName: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  badgeColor: string;
  themeColor: string;
  borderGlow: string;
  bgGradient: string;
  buttonGradient: string;
  stats: { label: string; value: string }[];
  tags: string[];
  icon: React.ElementType;
}

const GAMES: GameItem[] = [
  {
    id: 'gunhit',
    zipName: 'gunhit.zip',
    title: 'Gun Hit: Full Arcade',
    subtitle: 'The Complete Weapon Shooter',
    description: 'Game tembak sasaran terkomplit dengan puluhan senjata nyata (pistol, SMG, sniper, heavy rifles), decal peluru presisi, bos mecha & oni, serta quest reward.',
    badge: 'Full Action Edition',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    themeColor: 'amber',
    borderGlow: 'hover:border-amber-400/50 hover:shadow-amber-500/20',
    bgGradient: 'from-amber-950/40 via-stone-900/60 to-neutral-950/80',
    buttonGradient: 'from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950',
    stats: [
      { label: 'Tiers', value: '7 Kategori' },
      { label: 'Bos Besar', value: 'Mecha & Oni' },
      { label: 'Fitur', value: 'Quests & Buffs' }
    ],
    tags: ['Real Gun Art', 'Decal System', 'Boss Battles', 'Daily Quests'],
    icon: Flame,
  },
  {
    id: 'knife-hit',
    zipName: 'knife-hit-reward-animation-sequence.zip',
    title: 'Perfect Shot: Knife Boss',
    subtitle: '100 Level Snake Path & 20 Bosses',
    description: 'Petualangan lempar pisau legendaris! Jelajahi 100 level jalur ular, taklukkan 20 bos dengan rintangan & animasi unik, serta buka koleksi pisau langka di armory.',
    badge: '100 Levels & 20 Bosses',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    themeColor: 'emerald',
    borderGlow: 'hover:border-emerald-400/50 hover:shadow-emerald-500/20',
    bgGradient: 'from-emerald-950/40 via-teal-950/30 to-neutral-950/80',
    buttonGradient: 'from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-neutral-950',
    stats: [
      { label: 'Level', value: '100 Tahap' },
      { label: 'Boss Unik', value: '20 Karakter' },
      { label: 'Armory', value: '30+ Pisau' }
    ],
    tags: ['100 Snake Stages', '20 Unique Bosses', 'Gacha Box', 'Achievements'],
    icon: Sword,
  },
];

interface LauncherProps {
  onSelectGame: (gameId: GameKey) => void;
}

export default function Launcher({ onSelectGame }: LauncherProps) {
  const [selectedPreview, setSelectedPreview] = useState<GameKey>('knife-hit');

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white selection:bg-amber-400 selection:text-neutral-950 overflow-x-hidden font-sans">
      {/* Background ambient radial lighting */}
      <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-violet-600/20 via-sky-500/10 to-transparent rounded-full blur-3xl opacity-70" />
      <div className="pointer-events-none fixed -bottom-40 right-10 w-[600px] h-[500px] bg-gradient-to-t from-emerald-600/15 via-amber-500/10 to-transparent rounded-full blur-3xl opacity-60" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:44px_44px]" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Top Header */}
        <header className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-medium text-amber-300 mb-4 backdrop-blur-md">
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>2 Game Koleksi Lengkap Siap Dimainkan Langsung</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Pilih & Mainkan{' '}
            <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300 bg-clip-text text-transparent">
              Game Favoritmu
            </span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            Ketiga game terintegrasi dalam satu portal arcade. Pilih game mana saja untuk langsung bermain, dan kembali ke menu ini kapan saja!
          </p>
        </header>

        {/* 2 Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {GAMES.map((game, idx) => {
            const Icon = game.icon;
            const isHovered = selectedPreview === game.id;

            return (
              <div
                key={game.id}
                onMouseEnter={() => setSelectedPreview(game.id)}
                className={`group relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 border border-white/10 bg-gradient-to-b ${game.bgGradient} backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 shadow-2xl ${game.borderGlow}`}
              >
                {/* Top Badge & Number */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${game.badgeColor}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{game.badge}</span>
                    </span>

                    <span className="text-xs font-mono font-bold text-white/40 group-hover:text-white/80 transition-colors">
                      GAME 0{idx + 1}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white group-hover:text-amber-200 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-neutral-400 mb-3 font-mono">
                    {game.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                    {game.description}
                  </p>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-black/40 border border-white/5 mb-5 text-center">
                    {game.stats.map((st, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                          {st.label}
                        </span>
                        <span className="text-sm font-black text-white mt-0.5">
                          {st.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {game.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] font-medium text-neutral-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Bottom: File ref & Play Button */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] font-mono text-neutral-500 truncate max-w-[200px]" title={game.zipName}>
                    📦 {game.zipName}
                  </div>

                  <button
                    onClick={() => onSelectGame(game.id)}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r ${game.buttonGradient} shadow-lg shadow-black/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer`}
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Mainkan Game</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Instructions / Info Banner */}
        <div className="mt-12 rounded-3xl bg-neutral-900/60 border border-white/10 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 grid place-items-center flex-shrink-0 text-amber-300">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Bebas Berganti Game Kapan Saja</h4>
                <p className="text-sm text-neutral-400 mt-0.5">
                  Tombol <span className="text-amber-300 font-semibold">« Pilih Game Lain</span> selalu tersedia di pojok kiri atas setiap game agar Anda bisa langsung mencoba game lainnya.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-300">
                2/2 Game Ready
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-xs text-neutral-500">
          Game Arcade Hub • Gun Hit Arcade dan Knife Boss 100 Lv.
        </footer>
      </div>
    </div>
  );
}
