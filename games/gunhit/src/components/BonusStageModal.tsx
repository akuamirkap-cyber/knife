import { useState } from 'react';
import { sfx } from '../game/audio';
import { sfx4 } from '../game/sfx4';

interface BonusStageModalProps {
  currentStage: number;
  onClaimAndContinue: (bonusCoins: number) => void;
}

export const BonusStageModal = ({
  currentStage,
  onClaimAndContinue,
}: BonusStageModalProps) => {
  const [chestOpened, setChestOpened] = useState<number[]>([]);
  const [rewards, setRewards] = useState<number[]>([]);
  const [totalWon, setTotalWon] = useState(0);

  const CHESTS = [
    { id: 0, title: 'PETI EMAS I', base: 10 },
    { id: 1, title: 'PETI BERLIAN II', base: 25 },
    { id: 2, title: 'PETI SULTAN III', base: 50 },
  ];

  const handleOpenChest = (id: number) => {
    if (chestOpened.includes(id)) return;
    const pool = [15, 20, 35, 50, 75, 100];
    const won = pool[Math.floor(Math.random() * pool.length)];

    setChestOpened((prev) => [...prev, id]);
    setRewards((prev) => [...prev, won]);
    setTotalWon((prev) => prev + won);

    sfx.coin();
    sfx4.salabim();
  };

  const handleFinish = () => {
    sfx.start();
    onClaimAndContinue(totalWon > 0 ? totalWon : 30);
  };

  return (
    <div className="pop-in absolute inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-[#1c0836]/98 via-[#0e0320]/98 to-[#050010]/98 px-5 py-8 text-white font-game select-none backdrop-blur-md">
      {/* Top Banner */}
      <div className="text-center">
        <div className="inline-block rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-black tracking-widest text-black shadow-md">
          ★ SPECIAL EVENT ★
        </div>
        <div className="text-4xl font-black tracking-wider text-yellow-300 drop-shadow-[0_4px_8px_rgba(234,179,8,0.6)] mt-2">
          BONUS REWARD STAGE!
        </div>
        <div className="text-xs text-white/70 mt-1">
          Selamat! Kamu berhasil menaklukkan Stage {currentStage}! Buka Peti Hadiah Keberuntunganmu:
        </div>
      </div>

      {/* 3 Interactive Bouncing Treasure Chests */}
      <div className="flex w-full items-center justify-around gap-2 my-auto">
        {CHESTS.map((c) => {
          const isOpen = chestOpened.includes(c.id);
          const rewardIdx = chestOpened.indexOf(c.id);
          const wonCoins = rewardIdx >= 0 ? rewards[rewardIdx] : 0;

          return (
            <div
              key={c.id}
              onClick={() => handleOpenChest(c.id)}
              className={`flex flex-col items-center justify-center rounded-3xl border-2 p-3.5 transition-all cursor-pointer ${
                isOpen
                  ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.5)] scale-105'
                  : 'border-yellow-400/60 bg-gradient-to-b from-[#3b1b68] to-[#200d3d] hover:border-yellow-300 hover:scale-105 shadow-xl animate-bounce'
              }`}
            >
              <div className="text-6xl filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)]">
                {isOpen ? '👑' : '🎁'}
              </div>

              <div className="mt-2 text-center">
                {isOpen ? (
                  <div className="text-lg font-black text-amber-300 animate-pulse">
                    +{wonCoins} 💰
                  </div>
                ) : (
                  <button className="rounded-xl bg-yellow-400 px-2.5 py-1 text-[11px] font-black text-black shadow">
                    BUKA!
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Won Summary & Continue */}
      <div className="w-full flex flex-col items-center gap-3">
        {totalWon > 0 && (
          <div className="text-xl font-black text-emerald-400 drop-shadow">
            TOTAL DIDAPAT: +{totalWon} KOIN 💰
          </div>
        )}

        <button
          onClick={handleFinish}
          className="pulse-btn w-full max-w-xs rounded-2xl border-b-4 border-emerald-800 bg-gradient-to-b from-emerald-400 via-green-500 to-emerald-600 py-4 text-xl font-black text-black shadow-[0_10px_25px_rgba(34,197,94,0.4)] transition active:translate-y-1 active:border-b-0"
        >
          {chestOpened.length > 0 ? 'KLAIM & LANJUT ▶' : 'LEWATI & LANJUT ▶'}
        </button>
      </div>
    </div>
  );
};
