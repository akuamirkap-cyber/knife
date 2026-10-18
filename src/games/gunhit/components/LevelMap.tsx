import { useEffect, useMemo, useRef, useState } from 'react';
import { drawVectorBossHead, getBossDef, type BossType } from '../game/bossRoster';
import {
  GUN_HIT_MAP_MAX_LEVEL,
  getGunHitMapBoss,
  getGunHitMapNodeCaption,
  getGunHitMapNodeTheme,
  getGunHitMapStage,
} from '../game/stageMap';

const MAP_X = [50, 31, 19, 32, 50, 69, 81, 68];
const MAP_GAP = 96;
const MAP_TOP = 112;
const MAP_BOTTOM = 140;
const MAP_HEIGHT = MAP_TOP + (GUN_HIT_MAP_MAX_LEVEL - 1) * MAP_GAP + MAP_BOTTOM;
const nodeY = (index: number) => MAP_HEIGHT - MAP_BOTTOM - index * MAP_GAP;
const nodeX = (index: number) => MAP_X[index % MAP_X.length];

function BossIcon({ type, size = 38 }: { type: BossType; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = 2;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.translate(size / 2, size / 2);
    drawVectorBossHead(ctx, type, size * 0.38);
  }, [size, type]);
  return <canvas ref={canvasRef} className="block" style={{ width: size, height: size }} aria-hidden="true" />;
}

const MAP_STAGE = {
  normal: { label: 'NORMAL', color: '#6ee7b7', symbol: '🎯' },
  special: { label: 'STAGE SPESIAL', color: '#fcd34d', symbol: '✨' },
  boss: { label: 'BOSS', color: '#fb7185', symbol: '👹' },
} as const;

export default function LevelMap({
  bestLevel,
  onBack,
  onStart,
}: {
  bestLevel: number;
  onBack: () => void;
  onStart: (level: number) => void;
}) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const highestUnlocked = Math.min(GUN_HIT_MAP_MAX_LEVEL, Math.max(1, bestLevel));
  const activeLevel = highestUnlocked;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const timer = window.setTimeout(() => {
      const y = nodeY(activeLevel - 1);
      el.scrollTop = Math.max(0, y - el.clientHeight * 0.46);
    }, 100);
    return () => window.clearTimeout(timer);
  }, [activeLevel]);

  const pathD = useMemo(() => {
    const points = Array.from({ length: GUN_HIT_MAP_MAX_LEVEL }, (_, index) =>
      `${(nodeX(index) * 3.4).toFixed(1)},${nodeY(index)}`);
    return `M${points.join(' L')}`;
  }, []);

  const startSelected = () => {
    if (selectedLevel === null || selectedLevel > highestUnlocked) return;
    onStart(selectedLevel);
  };

  const selectedType = selectedLevel === null ? null : getGunHitMapStage(selectedLevel);
  const selectedBoss = selectedType === 'boss' && selectedLevel !== null
    ? getBossDef(getGunHitMapBoss(selectedLevel))
    : null;

  return (
    <div className="fade-in absolute inset-0 z-30 flex flex-col overflow-hidden text-white" data-testid="gunhit-level-map">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#172b3b_0%,#12353b_42%,#0a252c_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.08) 1px, transparent 1.5px)', backgroundSize: '22px 22px' }} />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_48px_rgba(0,0,0,.5)]" />

      <header className="relative z-10 flex items-center gap-2 px-3 pt-3">
        <button onClick={onBack} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-b-4 border-[#07534b] bg-gradient-to-b from-[#34d399] to-[#059669] text-2xl font-black shadow-lg active:translate-y-0.5" aria-label="Kembali ke menu">‹</button>
        <div className="min-w-0 flex-1 text-center">
          <h2 className="bg-gradient-to-b from-white to-cyan-200 bg-clip-text text-[22px] font-black leading-none tracking-[.12em] text-transparent drop-shadow">QUEST</h2>
          <p className="mt-1 text-[10px] font-bold tracking-wider text-white/60">GUN HIT SGA · 100 STAGE · 20 BOSS</p>
        </div>
        <div className="shrink-0 rounded-full border border-cyan-200/40 bg-black/40 px-2.5 py-1.5 text-[11px] font-black tabular-nums text-cyan-100">{highestUnlocked}/100</div>
      </header>

      <div className="relative z-10 mx-3 mt-2 grid grid-cols-3 gap-1.5">
        {(['normal', 'special', 'boss'] as const).map((kind) => (
          <div key={kind} className="rounded-xl border bg-black/35 px-1 py-1.5 text-center" style={{ borderColor: `${MAP_STAGE[kind].color}66` }}>
            <div className="text-[17px] leading-none">{MAP_STAGE[kind].symbol}</div>
            <div className="mt-1 text-[9px] font-black tracking-wider" style={{ color: MAP_STAGE[kind].color }}>{MAP_STAGE[kind].label}</div>
          </div>
        ))}
      </div>

      <div ref={scrollRef} className="thin-scroll relative z-10 mx-3 mb-3 mt-2 flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-black/20" style={{ scrollbarWidth: 'none' }}>
        <div className="relative w-full" style={{ height: MAP_HEIGHT }}>
          <svg viewBox={`0 0 340 ${MAP_HEIGHT}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <path d={pathD} fill="none" stroke="rgba(103,232,249,.2)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
            <path d={pathD} fill="none" stroke="rgba(255,255,255,.48)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 14" />
          </svg>

          {Array.from({ length: 19 }, (_, index) => {
            const y = (nodeY(index * 5 + 4) + nodeY(index * 5 + 5)) / 2;
            return (
              <div key={index} className="absolute left-0 right-0 flex items-center gap-2 px-5" style={{ top: y - 8 }}>
                <span className="h-px flex-1 bg-white/15" />
                <span className="rounded-full border border-cyan-100/15 bg-[#071b23]/80 px-2 py-0.5 text-[9px] font-black tracking-[.18em] text-white/50">SIKLUS {index + 2}</span>
                <span className="h-px flex-1 bg-white/15" />
              </div>
            );
          })}

          <div className="absolute left-1/2 -translate-x-1/2 text-center" style={{ top: MAP_HEIGHT - 63 }}>
            <div className="text-2xl">🚩</div>
            <div className="whitespace-nowrap rounded-full border border-white/20 bg-black/55 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-white/75">MULAI · STAGE 1</div>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 text-center" style={{ top: 7 }}>
            <div className="tap-hint text-[30px] drop-shadow-[0_4px_10px_rgba(0,0,0,.6)]">🏆</div>
            <div className="whitespace-nowrap rounded-full border border-amber-300/50 bg-black/60 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-amber-200">STAGE 100 · FINAL BOSS</div>
          </div>

          {Array.from({ length: GUN_HIT_MAP_MAX_LEVEL }, (_, index) => {
            const level = index + 1;
            const kind = getGunHitMapStage(level);
            const theme = getGunHitMapNodeTheme(level);
            const locked = level > highestUnlocked;
            const isActive = level === activeLevel;
            const isFinal = level === GUN_HIT_MAP_MAX_LEVEL;
            const size = isFinal ? 62 : kind === 'boss' ? 56 : 44;
            const bossType = kind === 'boss' ? getGunHitMapBoss(level) : null;
            const boss = bossType ? getBossDef(bossType) : null;
            const stageColors = {
              normal: ['#34d399', '#047857'],
              special: ['#fcd34d', '#b45309'],
              boss: [boss?.accent ?? '#fb7185', '#881337'],
            }[kind];
            return (
              <div key={level} className="absolute" style={{ left: `${nodeX(index)}%`, top: nodeY(index), transform: 'translate(-50%,-50%)' }}>
                <div className="fade-up relative" style={{ animationDelay: `${Math.min(index * 0.008, 0.4)}s` }}>
                <button
                  type="button"
                  onClick={() => setSelectedLevel(level)}
                  aria-label={`Stage ${level}${locked ? ' terkunci' : ''}`}
                  className="relative block transition active:scale-95"
                  style={{ width: size, height: size }}
                >
                  {isActive && !locked && <span className="ring-ping absolute -inset-2 rounded-full border-2 border-amber-300/70" />}
                  {isActive && !locked && <span className="tap-hint absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-300 px-2 py-0.5 text-[9px] font-black text-slate-950 shadow">KAMU DI SINI</span>}
                  <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-white/30" style={{ background: `linear-gradient(180deg,${stageColors[0]},${stageColors[1]})`, borderBottom: '5px solid rgba(0,0,0,.42)', boxShadow: `0 8px 16px rgba(0,0,0,.4), 0 0 13px ${kind === 'boss' ? boss?.glow ?? 'rgba(251,113,133,.4)' : kind === 'special' ? 'rgba(252,211,77,.25)' : 'rgba(52,211,153,.18)'}`, filter: locked ? 'grayscale(.8) brightness(.58)' : undefined }}>
                    <span className="pointer-events-none absolute inset-x-2 top-1 h-2 rounded-full bg-white/40 blur-[1px]" />
                    {kind === 'boss' && bossType ? (
                      <span className="relative z-10 overflow-hidden rounded-full" style={{ width: size - 12, height: size - 12 }}><BossIcon type={bossType} size={size - 12} /></span>
                    ) : <span className={`relative z-10 text-[20px] ${kind === 'special' ? 'tap-hint' : ''}`}>{theme.symbol}</span>}
                    {locked && <span className="absolute -bottom-1 -right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-slate-900 text-[10px]">🔒</span>}
                    {level < activeLevel && <span className="absolute -right-1 -top-1 z-20 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-emerald-500 text-[10px] font-black">✓</span>}
                  </span>
                </button>
                <span className="absolute left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/25 bg-[#06151ddd] px-1.5 py-px text-[8px] font-black tracking-wide text-white shadow-md" style={{ top: size + 3 }}>
                  {getGunHitMapNodeCaption(level)}
                </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedLevel !== null && (
        <div className="absolute inset-0 z-30 flex items-end justify-center bg-black/65 p-3 backdrop-blur-[2px]">
          <section role="dialog" aria-modal="true" aria-labelledby="gunhit-stage-title" className="w-full rounded-3xl border border-cyan-100/20 bg-gradient-to-b from-[#15353f] to-[#07151d] p-4 shadow-[0_24px_80px_rgba(0,0,0,.8)]">
            {(() => {
              const kind = getGunHitMapStage(selectedLevel);
              const theme = getGunHitMapNodeTheme(selectedLevel);
              const meta = MAP_STAGE[kind];
              const boss = kind === 'boss' ? getBossDef(getGunHitMapBoss(selectedLevel)) : null;
              const locked = selectedLevel > highestUnlocked;
              return <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black tracking-[.24em] text-cyan-100/60">STAGE SGA</p>
                    <h3 id="gunhit-stage-title" className="mt-1 text-2xl font-black leading-none text-white">LEVEL {selectedLevel}</h3>
                    <p className="mt-2 text-[12px] font-black tracking-[.16em]" style={{ color: meta.color }}>{theme.symbol} {theme.label}</p>
                  </div>
                  {boss ? <div className="rounded-full border border-white/15 bg-black/30 p-1"><BossIcon type={boss.id} size={58} /></div> : <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-black/25 text-4xl">{theme.symbol}</div>}
                </div>
                <p className="mt-3 text-[12px] leading-relaxed text-white/65">
                  {kind === 'boss'
                    ? `${boss?.title} · Nama boss peta: ${theme.label}. Pertarungan tetap memakai sistem boss SGA.`
                    : kind === 'special'
                      ? 'Stage spesial SGA: sistem tetap memilih Batu, Bonus, atau Harta Karun sesuai aturan stage yang sudah ada.'
                      : `Tema ikon peta: ${theme.label}. Musuh dan aturan stage tetap memakai sistem SGA.`}
                </p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setSelectedLevel(null)} className="flex-1 rounded-2xl border border-white/15 bg-white/10 py-3 text-sm font-black text-white/80 active:scale-95">KEMBALI</button>
                  <button onClick={startSelected} disabled={locked} className={`flex-[1.5] rounded-2xl border-b-4 py-3 text-sm font-black tracking-wider text-white active:translate-y-0.5 ${locked ? 'border-white/10 bg-white/10 text-white/40' : 'border-[#064324] bg-gradient-to-b from-[#75f5a2] to-[#079447]'}`}>
                    {locked ? '🔒 TERKUNCI' : `MULAI LEVEL ${selectedLevel} ▶`}
                  </button>
                </div>
              </>;
            })()}
          </section>
        </div>
      )}
    </div>
  );
}
