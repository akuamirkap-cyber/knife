import { useEffect, useState } from 'react';
import { sfx } from '../game/audio';
import { sfx4 } from '../game/sfx4';
import { useSlideActive } from '../../shared/SlideActivity';

interface BossDefeatedModalProps {
  bossName: string;
  stage: number;
  rewardCoins: number;
  onContinue: () => void;
}

export const BossDefeatedModal = ({
  bossName,
  stage,
  rewardCoins,
  onContinue,
}: BossDefeatedModalProps) => {
  const active = useSlideActive();
  const [xpProgress, setXpProgress] = useState(15);

  useEffect(() => {
    if (!active || xpProgress >= 92) return;
    sfx.boss();
    sfx4.match();
    // Animate XP bar gliding forward only when the slide is in focus.
    const t = setTimeout(() => {
      setXpProgress(92);
      sfx.coin();
    }, 450);
    return () => clearTimeout(t);
  }, [active, xpProgress]);

  return (
    <div className="pop-in absolute inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-b from-[#133038]/95 to-[#091a1f]/98 px-6 text-white backdrop-blur-md">
      {/* Top Stage & Coin Status bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-amber-300 font-game text-xl">
        <span className="text-white/80">STAGE {stage}</span>
        <span className="flex items-center gap-1">
          <span>+{rewardCoins}</span>
          <span className="text-xl">🍎</span>
        </span>
      </div>

      {/* Sunburst background rays */}
      <div
        className="pointer-events-none absolute h-72 w-72 rounded-full opacity-30 animate-spin"
        style={{
          background: 'radial-gradient(circle, rgba(74,222,128,0.5) 0%, rgba(34,197,94,0) 70%)',
          animationDuration: '18s',
        }}
      />

      {/* Embedded weapon triumphant emblem */}
      <div className="relative mb-6 flex h-28 w-28 items-center justify-center">
        {/* Glowing aura */}
        <div className="absolute h-24 w-24 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />
        {/* Slanted embedded sword icon */}
        <div className="text-7xl filter drop-shadow-[0_8px_16px_rgba(34,197,94,0.6)] transform -rotate-45">
          🗡️
        </div>
      </div>

      {/* BOSS DEFEATED Title (Exact matching Screenshot 2!) */}
      <div className="text-center font-game">
        <div className="text-4xl font-black tracking-wide text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
          BOSS DEFEATED!
        </div>
        <div className="mt-1 text-xs tracking-widest text-emerald-400 font-bold">
          {bossName} DITAKLUKKAN!
        </div>
      </div>

      {/* XP Level Up Progress Bar (Exact matching Screenshot 2!) */}
      <div className="mt-6 w-full max-w-xs">
        <div className="relative flex h-7 items-center rounded-full border-2 border-white/60 bg-black/40 px-1 shadow-inner">
          <span className="absolute left-2.5 z-10 text-[10px] font-black text-white/80 font-game">
            XP
          </span>
          <div
            className="h-4 rounded-full bg-gradient-to-r from-emerald-500 via-green-400 to-lime-300 shadow-[0_0_12px_#4ade80] transition-all duration-1000 ease-out"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
      </div>

      {/* Continue Action Button */}
      <button
        onClick={onContinue}
        className="pulse-btn mt-8 flex items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-800 bg-gradient-to-b from-emerald-400 to-green-600 px-8 py-3.5 text-lg font-black font-game text-black shadow-[0_10px_25px_rgba(34,197,94,0.4)] transition active:translate-y-1 active:border-b-0"
      >
        <span>LANJUT STAGE</span>
        <span>▶</span>
      </button>
    </div>
  );
};
