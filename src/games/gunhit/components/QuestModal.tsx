import { useState } from 'react';
import { MILESTONES, QUESTS, type Quest, type QuestState } from '../game/quests';
import { sfx } from '../game/audio';
import { sfx4 } from '../game/sfx4';
import { getWeapon } from '../game/weapons';

interface QuestModalProps {
  state: QuestState;
  ownedCount: number;
  onClaim: (quest: Quest) => void;
  onClaimMilestone: (count: number) => void;
  onClose: () => void;
}

export default function QuestModal({ state, ownedCount, onClaim, onClaimMilestone, onClose }: QuestModalProps) {
  const [category, setCategory] = useState<'daily' | 'skill'>('daily');
  const completed = QUESTS.filter(q => Math.min(q.progress(state, ownedCount), q.target) >= q.target).length;
  const list = QUESTS.filter(q => q.category === category);

  const handleClaim = (q: Quest) => {
    sfx.coin();
    sfx4.match();
    onClaim(q);
  };

  return (
    <div className="fade-in absolute inset-0 z-40 flex flex-col bg-gradient-to-b from-[#163f47] via-[#0e2a30] to-[#070f12] text-white">
      {/* Header and completion summary */}
      <div className="flex items-center gap-2.5 px-3 pt-3">
        <button onClick={onClose} className="flex h-12 w-[52px] shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#9a4a00] bg-gradient-to-b from-[#ff9a3d] to-[#ef5f00] text-[26px] font-black text-white shadow-lg active:translate-y-0.5 active:border-b-2" aria-label="Kembali">↩</button>
        <div className="min-w-0 flex-1">
          <h2 className="text-[24px] font-black leading-none tracking-wide text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,.5)]">🏆 ACHIEVEMENT</h2>
          <p className="mt-1 text-[13px] font-bold text-white/65">{completed}/{QUESTS.length} selesai · klaim semua bonus!</p>
        </div>
        <div className="rounded-2xl border-2 border-amber-300/40 bg-black/50 px-3.5 py-2 text-center shadow-[0_0_16px_rgba(251,191,36,.25)]">
          <p className="text-[22px] font-black leading-none text-amber-300">{completed}</p>
          <p className="mt-0.5 text-[12px] font-black tracking-[0.18em] text-white/60">SELESAI</p>
        </div>
      </div>

      {/* Achievement milestone rewards */}
      <div className="mx-3 mt-2.5 rounded-[20px] bg-gradient-to-br from-slate-400 via-sky-400 to-amber-300 p-[2px]">
        <div className="rounded-[18px] bg-[#0a1a1f]/95 p-2.5">
          <p className="mb-1.5 text-center text-[13px] font-black tracking-[0.2em] text-amber-200">🎁 BONUS MILESTONE WEAPON 🎁</p>
          <div className="relative mb-2 h-2.5 rounded-full border border-white/15 bg-black/60">
            <div className="h-full rounded-full bg-gradient-to-r from-slate-300 via-sky-400 via-violet-400 to-amber-400 transition-all" style={{ width: `${Math.min(100, completed / 20 * 100)}%`, boxShadow: '0 0 12px rgba(251,191,36,.5)' }} />
            <div className="absolute -top-[5px] flex w-full justify-between px-1">
              {MILESTONES.map(m => <span key={m.count} className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[12px] font-black ${completed >= m.count ? 'border-amber-300 bg-amber-400 text-black' : 'border-white/25 bg-black text-white/50'}`}>✓</span>)}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MILESTONES.map(m => {
              const reached = completed >= m.count;
              const taken = state.milestonesClaimed.includes(m.count);
              const rarityStyle: Record<string, string> = {
                UMUM: 'border-slate-300/70 bg-slate-500/15 text-slate-200',
                EPIC: 'border-fuchsia-300/70 bg-fuchsia-500/15 text-fuchsia-200',
                LEGENDARIS: 'border-amber-300/70 bg-amber-500/15 text-amber-200',
              };
              return (
                <div key={m.count} className={`rounded-2xl border-2 p-2 text-center ${rarityStyle[m.rarity]} ${reached && !taken ? 'shadow-[0_0_18px_rgba(251,191,36,.3)]' : ''}`}>
                  <p className="text-[26px] leading-none">{m.count === 5 ? '🎁' : m.count === 10 ? '💎' : '👑'}</p>
                  <p className="mt-1 text-[14px] font-black leading-none text-white">{m.label}</p>
                  <p className="mt-1 min-h-[30px] text-[12px] font-bold leading-tight">{m.desc}</p>
                  {taken ? <span className="mt-1.5 inline-flex rounded-full border border-emerald-300/50 bg-emerald-500/20 px-3 py-1.5 text-[12px] font-black text-emerald-200">✓ DIKLAIM</span> : reached ? (
                    <button onClick={() => onClaimMilestone(m.count)} className="mt-1.5 w-full rounded-xl border-b-4 border-[#7a4a00] bg-gradient-to-b from-[#ffe27a] to-[#dd8d00] px-2 py-2 text-[14px] font-black text-[#4a2c00] active:translate-y-0.5">🎉 KLAIM!</button>
                  ) : <span className="mt-1.5 inline-block rounded-full bg-black/45 px-3 py-1.5 text-[12px] font-black text-white/60">{completed}/{m.count}</span>}
                </div>
              );
            })}
          </div>
          <p className="mt-1 text-center text-[10px] font-bold text-white/45">Hadiah milestone tidak termasuk senjata LANGKA.</p>
        </div>
      </div>

      {/* DAILY / SKILL category tabs */}
      <div className="mx-3 mt-2.5 flex gap-2">
        {(['daily', 'skill'] as const).map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`flex-1 rounded-2xl border-b-[5px] py-3 text-[17px] font-black tracking-wider transition active:translate-y-0.5 ${category === cat ? 'border-black/30 bg-gradient-to-b from-[#ffe27a] to-[#dd8d00] text-[#4a2c00] shadow-[0_8px_22px_rgba(251,191,36,.35)]' : 'border-white/10 bg-white/10 text-white/60'}`}>
            {cat === 'daily' ? '📅 DAILY' : '⚔️ SKILL'}
          </button>
        ))}
      </div>

      {/* Category achievement list */}
      <div className="mx-3 mb-3 mt-2 flex flex-1 flex-col gap-2.5 overflow-y-auto rounded-[20px] border border-white/10 bg-[#081417]/90 p-2.5 [scrollbar-width:thin]">
        {list.map((q, idx) => {
          const progress = Math.min(q.progress(state, ownedCount), q.target);
          const done = progress >= q.target;
          const taken = state.claimed.includes(q.id);
          const pct = Math.round(progress / q.target * 100);
          const rewardWeapon = q.rewardWeapon ? getWeapon(q.rewardWeapon) : null;
          return (
            <div key={q.id} className={`flex items-center gap-3 rounded-2xl border-2 p-2.5 transition ${done && !taken ? 'border-amber-300 bg-gradient-to-r from-amber-400/15 to-amber-400/5 shadow-[0_0_18px_rgba(251,191,36,.2)]' : taken ? 'border-emerald-400/30 bg-white/[.03]' : 'border-white/10 bg-white/[.04]'}`} style={{ animationDelay: `${Math.min(idx, 6) * 0.05}s` }}>
              <span className={`flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl border-2 text-[30px] shadow-inner ${done ? 'border-amber-300/50 bg-gradient-to-b from-amber-300/25 to-amber-600/20' : 'border-white/15 bg-gradient-to-b from-white/15 to-white/5'}`}>{q.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-black leading-tight text-white">{q.title}</p>
                <p className="mt-0.5 text-[13px] font-medium leading-snug text-white/70">{q.desc}</p>
                {rewardWeapon && <p className="mt-0.5 text-[11px] font-bold text-fuchsia-200">Bonus senjata: {rewardWeapon.name}</p>}
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-[10px] flex-1 overflow-hidden rounded-full border border-white/15 bg-black/55">
                    <div className={`h-full rounded-full transition-all ${done ? 'bg-gradient-to-r from-emerald-500 to-emerald-300' : 'bg-gradient-to-r from-sky-500 to-cyan-300'}`} style={{ width: `${pct}%`, boxShadow: done ? '0 0 10px rgba(52,211,153,.6)' : '0 0 10px rgba(56,189,248,.5)' }} />
                  </div>
                  <span className="min-w-[44px] text-right text-[12px] font-black tabular-nums text-white/70">{progress}/{q.target}</span>
                </div>
              </div>
              {taken ? <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border-2 border-emerald-300/50 bg-emerald-500/15 text-[22px] font-black text-emerald-300">✓</span> : done ? (
                <button onClick={() => handleClaim(q)} className="flex h-[62px] w-[74px] shrink-0 flex-col items-center justify-center rounded-2xl border-b-4 border-[#7a4a00] bg-gradient-to-b from-[#ffe27a] to-[#dd8d00] text-[#4a2c00] shadow-lg active:translate-y-0.5">
                  <span className="text-[14px] font-black leading-none">+{q.rewardCoins}</span><span className="text-[13px] leading-none">💵</span><span className="mt-0.5 rounded bg-black/20 px-2 py-0.5 text-[12px] font-black tracking-widest">KLAIM</span>
                </button>
              ) : <span className="flex h-[52px] w-[60px] shrink-0 flex-col items-center justify-center rounded-2xl bg-black/40 text-white/55"><span className="text-[13px] font-black">+{q.rewardCoins}</span><span className="text-[13px]">💵</span></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
