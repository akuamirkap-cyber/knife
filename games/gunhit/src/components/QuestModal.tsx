import { QUESTS, type Quest, type QuestState } from '../game/quests';
import { sfx } from '../game/audio';
import { sfx4 } from '../game/sfx4';
import { getWeapon } from '../game/weapons';

interface QuestModalProps {
  state: QuestState;
  onClaim: (quest: Quest) => void;
  onClose: () => void;
}

export default function QuestModal({ state, onClaim, onClose }: QuestModalProps) {
  const getProgress = (q: Quest) => {
    switch (q.type) {
      case 'level':
        return Math.min(q.target, state.highestLevel);
      case 'score':
        return Math.min(q.target, state.highestScore);
      case 'combo':
        return Math.min(q.target, state.maxCombo);
      case 'coins':
        return Math.min(q.target, state.totalCoinsCollected);
      default:
        return 0;
    }
  };

  const handleClaim = (q: Quest) => {
    sfx.coin();
    sfx4.match();
    onClaim(q);
  };

  return (
    <div className="pop-in absolute inset-0 z-40 flex flex-col bg-[#07080f]/95 px-4 pb-4 pt-5 text-white backdrop-blur-md">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <div className="text-[10px] tracking-[0.35em] text-amber-300">TUGAS & PENCAPAIAN</div>
          <div className="text-2xl leading-none text-white font-game drop-shadow">MISI HADIAH</div>
        </div>
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20 active:scale-90"
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>

      <div className="mb-2 text-xs text-white/60">
        Selesaikan misi untuk mendapatkan koin dan membuka senjata rahasia!
      </div>

      {/* Quest List */}
      <div className="-mr-1 flex-1 space-y-2.5 overflow-y-auto pr-1 [scrollbar-width:thin]">
        {QUESTS.map((q) => {
          const current = getProgress(q);
          const isDone = current >= q.target;
          const isClaimed = state.claimed.includes(q.id);
          const percent = Math.min(100, Math.round((current / q.target) * 100));
          const rewardWeapon = q.rewardWeapon ? getWeapon(q.rewardWeapon) : null;

          return (
            <div
              key={q.id}
              className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
                isClaimed
                  ? 'border-white/5 bg-white/[0.02] opacity-60'
                  : isDone
                  ? 'border-amber-400/50 bg-gradient-to-r from-amber-500/10 to-yellow-500/5 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/40 text-2xl border border-white/10">
                {rewardWeapon ? rewardWeapon.emoji : '🎯'}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="truncate text-sm font-bold text-white">{q.title}</div>
                  <div className="text-xs font-mono font-bold text-white/70">
                    {current}/{q.target}
                  </div>
                </div>

                <div className="text-[11px] text-white/60">{q.desc}</div>

                {/* Progress bar */}
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/50 border border-white/10">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isDone ? 'bg-gradient-to-r from-amber-400 to-yellow-300' : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Reward preview */}
                <div className="mt-1 flex items-center gap-2 text-[10px] text-amber-300">
                  <span>Hadiah: +{q.rewardCoins} 💰</span>
                  {rewardWeapon && (
                    <span className="rounded bg-fuchsia-500/20 px-1.5 py-0.5 text-fuchsia-300 border border-fuchsia-500/30">
                      🎁 Buka {rewardWeapon.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Claim Button */}
              <div className="shrink-0">
                {isClaimed ? (
                  <span className="text-xs font-bold text-emerald-400">SELESAI ✓</span>
                ) : isDone ? (
                  <button
                    onClick={() => handleClaim(q)}
                    className="pulse-btn rounded-xl border border-amber-300 bg-gradient-to-b from-yellow-300 to-amber-500 px-3.5 py-2 text-xs font-bold text-black shadow-lg transition active:scale-95"
                  >
                    KLAIM!
                  </button>
                ) : (
                  <span className="text-xs font-bold text-white/30">{percent}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
