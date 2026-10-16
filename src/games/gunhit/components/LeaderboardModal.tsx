interface LeaderboardModalProps {
  bestScore: number;
  bestLevel: number;
  totalCoins: number;
  onClose: () => void;
}

export default function LeaderboardModal({
  bestScore,
  bestLevel,
  totalCoins,
  onClose,
}: LeaderboardModalProps) {
  const records = [
    { rank: '🥇 1st', title: 'Rekor Skor Tertinggi', val: bestScore, unit: 'PTS', color: '#fde047' },
    { rank: '🥈 2nd', title: 'Stage Tertinggi Dicapai', val: bestLevel, unit: 'STAGE', color: '#94a3b8' },
    { rank: '🥉 3rd', title: 'Koleksi Koin Emas', val: totalCoins, unit: 'COINS', color: '#fb923c' },
    { rank: '⭐ 4th', title: 'Boss Tertinggi Ditaklukkan', val: Math.floor(bestLevel / 5), unit: 'BOSS', color: '#38bdf8' },
  ];

  return (
    <div className="pop-in absolute inset-0 z-40 flex flex-col bg-[#071318]/95 px-5 pb-5 pt-6 text-white backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <div className="text-[10px] tracking-[0.3em] text-amber-300 font-bold">HALL OF FAME</div>
          <div className="text-2xl font-black font-game text-white drop-shadow">LEADERBOARD</div>
        </div>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white transition hover:bg-white/20 active:scale-90"
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {records.map((r) => (
          <div
            key={r.title}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 shadow-md"
            style={{ borderColor: `${r.color}33` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold font-game border border-white/10"
                style={{ background: `${r.color}22`, color: r.color }}
              >
                {r.rank.slice(0, 2)}
              </div>
              <div>
                <div className="text-xs font-bold text-white/70">{r.title}</div>
                <div className="text-xl font-black font-game text-white" style={{ color: r.color }}>
                  {r.val} <span className="text-xs font-normal text-white/50">{r.unit}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
