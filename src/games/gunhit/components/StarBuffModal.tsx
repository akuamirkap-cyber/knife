interface StarBuffModalProps {
  onPick: (kind: 'speed' | 'ammo' | 'power') => void;
}

const OPTIONS: { kind: 'speed' | 'ammo' | 'power'; emoji: string; title: string; sub: string; color: string }[] = [
  { kind: 'speed', emoji: '⚡', title: 'PELURU 2X', sub: 'Lebih cepat', color: '#facc15' },
  { kind: 'ammo', emoji: '📦', title: 'AMMO 2X', sub: 'Tambah peluru', color: '#4ade80' },
  { kind: 'power', emoji: '💥', title: 'DAYA 2X', sub: 'Hancurkan batu', color: '#f87171' },
];

export default function StarBuffModal({ onPick }: StarBuffModalProps) {
  return (
    <div className="pop-in absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/70 px-5 backdrop-blur-sm">
      <div className="mb-1 text-6xl drop-shadow-[0_0_20px_#facc15]">★</div>
      <div className="text-2xl font-black tracking-wide text-amber-300 drop-shadow-[0_3px_0_rgba(0,0,0,0.8)] font-game">
        POWER UP!
      </div>
      <div className="mb-5 text-xs text-white/70">Pilih satu kekuatan:</div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        {OPTIONS.map((o, i) => (
          <button
            key={o.kind}
            onClick={() => onPick(o.kind)}
            className="pop-in flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition active:scale-95 hover:brightness-110"
            style={{
              borderColor: o.color,
              background: `linear-gradient(135deg, ${o.color}33, ${o.color}11)`,
              boxShadow: `0 0 18px ${o.color}55`,
              animationDelay: `${i * 90}ms`,
            }}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/40 text-2xl">
              {o.emoji}
            </div>
            <div className="flex-1">
              <div className="text-lg font-black leading-none font-game" style={{ color: o.color }}>
                {o.title}
              </div>
              <div className="mt-0.5 text-[11px] text-white/70">{o.sub}</div>
            </div>
            <div className="text-xl text-white/40">▶</div>
          </button>
        ))}
      </div>
    </div>
  );
}
