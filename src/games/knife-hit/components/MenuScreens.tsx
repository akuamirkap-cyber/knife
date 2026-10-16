import { useEffect, useMemo, useRef, useState } from "react";
import { BOSSES, BossTarget, type BossId, type BossPattern } from "./Bosses";
import { Knife } from "./Art";
import { Dust, GodRays, SparkleField } from "./Effects";
import { WeaponArt } from "../weapons";
import { MAX_LEVEL, STAGE_META, getStage } from "../stages";
import { sfx } from "../sfx";
import { SunburstToggle } from "../sunburstState";

/* ================= MAIN MENU — poles ringan ================= */
export function MainMenuScreen({
  apples = 562, stage = 25, score = 120, equippedWeaponId = "ak47", progressPct = 0, bossCount = 0,
  onPlay, onChallenges, onArmory, onAch, onGift,
  onBonus, onTreasure,
}: {
  apples?: number; stage?: number; score?: number; equippedWeaponId?: string; progressPct?: number; bossCount?: number;
  onPlay: () => void; onChallenges: () => void; onArmory: () => void; onAch: () => void; onGift: () => void;
  onBonus?: () => void; onTreasure?: () => void;
}) {
  return (
    <div className="fade-in absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_26%,#21505a_0%,#14333a_48%,#0a1c21_100%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.06) 1.2px, transparent 1.3px)", backgroundSize: "22px 22px" }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[220px] bg-[radial-gradient(60%_100%_at_50%_0%,rgba(140,255,190,.14),transparent)]" />
      <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 42px rgba(0,0,0,.38)" }} />
      <Dust count={14} />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/35 py-1.5 pl-1.5 pr-3 backdrop-blur">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-[#2c6b76] to-[#14333a] text-[20px]">🎯</span>
          <span className="leading-tight">
            <span className="block text-[14px] font-black text-white">Perfect Shot</span>
            <span className="block text-[12px] font-bold text-white/55">Stage {stage} · Skor {score}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-3 py-2 backdrop-blur">
            <span className="text-[16px] font-black tabular-nums text-amber-300">{apples}</span>
            <span className="text-[18px]">🍎</span>
          </span>
          <button onClick={() => { sfx.click(); onGift(); }} className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-200/30 bg-amber-400/15 text-[19px] active:scale-90" aria-label="Hadiah">🎁</button>
        </div>
      </div>

      <div className="absolute inset-x-0 top-[76px] flex flex-col items-center">
        <span className="rounded-full border border-lime-200/25 bg-lime-300/10 px-3 py-1 text-[12px] font-black tracking-[0.2em] text-lime-200">SEASON 6 · 100 LEVEL</span>
        <div className="relative mt-1 select-none text-center font-black leading-[.85]">
          <div className="title-float text-[60px] tracking-tight text-[#52ff7d]"
            style={{ textShadow: "0 4px 0 #0b5c26, 0 8px 0 rgba(0,0,0,.4), 0 0 30px rgba(82,255,125,.3)", transform: "rotate(-4deg)" }}>
            PERFECT
          </div>
          <div className="relative mx-auto -mt-1 w-[276px]">
            <svg viewBox="0 0 290 40" className="absolute -top-[15px] left-0 h-[40px] w-full overflow-visible">
              <path d="M8 30 Q150 26 250 8" stroke="#e8eef2" strokeWidth="10" strokeLinecap="round" fill="none" />
              <path d="M8 30 Q150 26 250 8" stroke="#8fa0ac" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".7" />
              <g transform="translate(232,2) rotate(18)">
                <rect x="0" y="4" width="44" height="12" rx="3" fill="#8a5a2b" stroke="#3f2a10" strokeWidth="2.5" />
                <rect x="42" y="2" width="12" height="16" rx="3" fill="#c47a3c" stroke="#3f2a10" strokeWidth="2.5" />
              </g>
            </svg>
            <div className="text-[60px] tracking-tight text-[#ffd21f]"
              style={{ textShadow: "0 4px 0 #8a5b00, 0 8px 0 rgba(0,0,0,.4), 0 0 30px rgba(255,210,31,.3)", transform: "rotate(-4deg)" }}>
              SHOT
            </div>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-4 py-1.5 backdrop-blur">
          <span className="text-[13px] font-black tracking-[0.14em] text-white/85">LV {stage}</span>
          <span className="h-1 w-1 rounded-full bg-white/40" />
          <span className="text-[13px] font-black tracking-[0.14em] text-white/85">{progressPct}%</span>
          <span className="h-1 w-1 rounded-full bg-white/40" />
          <span className="text-[13px] font-black tracking-[0.14em] text-lime-200">👑{bossCount}/20</span>
        </div>
        <div className="mt-2 h-2 w-[240px] overflow-hidden rounded-full border border-white/10 bg-black/45">
          <div className="h-full rounded-full bg-gradient-to-r from-lime-300 via-amber-300 to-amber-500 transition-all" style={{ width: `${Math.min(100, progressPct)}%` }} />
        </div>
      </div>

      <div className="absolute left-1/2 top-[392px] h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute left-1/2 top-1/2 h-0 w-0 opacity-90"><GodRays size={280} color="200,208,235" intensity={0.65} /></div>
        <svg viewBox="0 0 210 210" className="absolute inset-0 overflow-visible opacity-50">
          <g className="spin-cw" style={{ transformOrigin: "105px 105px" }}>
            <circle cx="105" cy="105" r="76" fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="8 10" />
          </g>
        </svg>
        <div className="absolute bottom-[18px] left-1/2 h-[16px] w-[120px] -translate-x-1/2 rounded-[50%] bg-black/45 blur-[5px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="float"><Knife className="h-[118px] w-[30px] drop-shadow-[0_14px_16px_rgba(0,0,0,.5)]" /></div>
        </div>
        <SparkleField count={4} spread={0.9} />
      </div>

      <div className="absolute inset-x-0 top-[496px] flex items-center justify-center gap-2 z-20">
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 backdrop-blur">
          <WeaponArt id={equippedWeaponId} className="h-7 w-[64px]" />
          <span className="flex items-center gap-1 text-[12px] font-black tracking-[0.18em] text-emerald-300"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />READY</span>
        </div>
        <SunburstToggle size="sm" />
      </div>

      <div className="absolute inset-x-0 bottom-[100px] flex flex-col items-center gap-2">
        <div className="btn-breathe">
          <button
            onPointerDown={(e) => { e.stopPropagation(); sfx.click(); onPlay(); }}
            className="relative flex items-center gap-2 overflow-hidden rounded-2xl border-b-[6px] border-[#0d6b30] bg-gradient-to-b from-[#6ef59a] via-[#2fd06a] to-[#14a04a] px-14 py-3 text-[28px] font-black tracking-wider text-white shadow-[0_14px_32px_rgba(34,197,94,.4)] active:translate-y-1 active:border-b-2"
            style={{ textShadow: "0 3px 0 rgba(0,0,0,.3)" }}
          >
            <span className="pointer-events-none absolute inset-x-3 top-1 h-[38%] rounded-xl bg-white/30" />
            <span className="shine-sweep pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
            PLAY <span className="text-[20px]">▶</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onPointerDown={(e) => { e.stopPropagation(); sfx.click(); onChallenges(); }}
            className="flex items-center gap-1.5 rounded-full border border-violet-300/40 bg-violet-500/20 px-5 py-1.5 text-[14px] font-black tracking-[0.14em] text-violet-200 active:scale-95"
          >
            🗺️ PETA 100 LEVEL
          </button>
        </div>
        {(onBonus || onTreasure) && (
          <div className="flex items-center gap-2">
            {onBonus && (
              <button
                onPointerDown={(e) => { e.stopPropagation(); sfx.click(); onBonus(); }}
                className="rounded-full border border-amber-300/50 bg-amber-400/20 px-4 py-1.5 text-[13px] font-black tracking-wider text-amber-200 active:scale-95"
              >
                🎡 BONUS
              </button>
            )}
            {onTreasure && (
              <button
                onPointerDown={(e) => { e.stopPropagation(); sfx.click(); onTreasure(); }}
                className="rounded-full border border-yellow-200/50 bg-yellow-400/20 px-4 py-1.5 text-[13px] font-black tracking-wider text-yellow-100 active:scale-95"
              >
                💰 HARTA
              </button>
            )}
          </div>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/40 px-5 pb-4 pt-2.5 backdrop-blur">
        <div className="flex items-center justify-between">
          {[
            { icon: "⭐", label: "Harian", fn: onAch },
            { icon: "🔫", label: "Armory", fn: onArmory },
            { icon: "🎯", label: "Boss", fn: onChallenges },
            { icon: "🎁", label: "Gift", fn: onGift },
            { icon: "⚙️", label: "Set", fn: () => sfx.click() },
          ].map((b, i) => (
            <button key={b.label} onClick={() => { sfx.click(); b.fn(); }} className="flex w-[56px] flex-col items-center gap-1 active:scale-90">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-[21px] ${i === 2 ? "border-lime-300/40 bg-lime-300/15 shadow-[0_0_14px_rgba(163,255,120,.3)]" : "border-white/10 bg-white/[.07] shadow-[inset_0_1px_0_rgba(255,255,255,.15)]"}`}>{b.icon}</span>
              <span className={`text-[12px] font-black tracking-wide ${i === 2 ? "text-lime-200" : "text-white/60"}`}>{b.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PETA LEVEL — snake path vertikal 100 node (khusus desain ini)
   🪵 normal · 🎡 bonus · 💰 harta(sampingan) · 👑 boss · FINAL lv100
   Warna & tema disesuaikan dengan teal yang sudah ada.
   ============================================================ */

const MAP_X = [50, 31, 19, 32, 50, 69, 81, 68];
const MAP_GAP = 106;
const MAP_TOP = 132;
const MAP_BOT = 84;
const MAP_H = MAP_TOP + 99 * MAP_GAP + MAP_BOT;
const nodeY = (i: number) => MAP_H - MAP_BOT - i * MAP_GAP;
const nodeX = (i: number) => MAP_X[i % 8];
const babOf = (level: number) => Math.ceil(level / 5);

const LEGEND: { symbol: string; label: string; color: string; bg: string }[] = [
  { symbol: "🔪", label: "NORMAL", color: "#34d399", bg: "rgba(52,211,153,.14)" },
  { symbol: "🪙", label: "BONUS", color: "#fcd34d", bg: "rgba(252,211,77,.14)" },
  { symbol: "🪨", label: "DESTROY", color: "#cbbfae", bg: "rgba(203,191,174,.14)" },
  { symbol: "💀", label: "BOSS", color: "#fb7185", bg: "rgba(251,113,133,.14)" },
  { symbol: "👑", label: "FINAL", color: "#fde047", bg: "rgba(253,224,71,.14)" },
];

const PATTERN_LABEL: Record<BossPattern, string> = {
  steady: "Stabil",
  pulse: "Berdenyut",
  wobble: "Bergoyang",
  pause: "Jeda palsu",
  reverse: "Putar balik",
  accel: "Makin cepat",
  chaos: "Acak brutal",
};

/* Koin 3D flip untuk node bonus */
function MapCoin() {
  return (
    <span className="coin-spin block h-[26px] w-[26px]">
      <span
        className="coin-blink block h-full w-full rounded-full border-2 border-[#8a5a00]"
        style={{
          background: "radial-gradient(circle at 35% 28%, #fff9c9 0%, #ffe36e 30%, #f5b301 58%, #c07c00 85%)",
          boxShadow: "0 0 10px rgba(255,210,60,.8), inset 0 -2px 4px rgba(140,80,0,.5)",
        }}
      />
    </span>
  );
}

export function ChallengesScreen({
  onBack, onPlayStage, onSkins, onLeague, completed = {}, highestUnlocked = 1, currentLevel = 1,
}: {
  onBack: () => void;
  onPlayStage: (phase: "stage" | "normal" | "bonus" | "destroy" | "treasure", boss: BossId, level?: number) => void;
  onSkins?: () => void; onLeague?: () => void;
  completed?: Record<string, { done: boolean; stars: number; best: number }>;
  highestUnlocked?: number;
  currentLevel?: number;
}) {
  const [selLevel, setSelLevel] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeLevel = Math.min(highestUnlocked, MAX_LEVEL);

  const totalStars = useMemo(
    () => Object.values(completed).reduce((a, r) => a + (r?.stars ?? 0), 0),
    [completed]
  );

  /* auto-scroll ke level aktif saat dibuka */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      const y = nodeY(activeLevel - 1);
      el.scrollTop = Math.max(0, y - el.clientHeight * 0.45);
    }, 120);
    return () => clearTimeout(t);
  }, [activeLevel]);

  const openNode = (lv: number) => {
    if (lv > highestUnlocked) {
      sfx.tick(true);
      return;
    }
    sfx.click();
    setSelLevel(lv);
  };

  const pathD = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i < MAX_LEVEL; i++) {
      pts.push(`${(nodeX(i) * 3.4).toFixed(1)},${nodeY(i)}`);
    }
    return `M${pts.join(" L")}`;
  }, []);

  const selInfo = selLevel != null ? getStage(selLevel) : null;
  const selMeta = selInfo ? STAGE_META[selInfo.kind] : null;
  const selBoss = selInfo?.kind === "boss" && selInfo.bossIndex != null ? BOSSES[selInfo.bossIndex] : null;
  const selDone = selLevel != null ? completed[String(selLevel)] : undefined;
  const selLocked = selLevel != null && selLevel > highestUnlocked;
  const selBab = selLevel != null ? babOf(selLevel) : 0;

  const startSel = () => {
    if (selLevel == null || selInfo == null) return;
    if (selLocked) {
      sfx.tick(true);
      return;
    }
    sfx.click();
    const bossForPhase = selBoss?.id ?? BOSSES[Math.max(0, Math.ceil(selLevel / 5) - 1)].id;
    onPlayStage(selMeta!.phase, bossForPhase, selLevel);
  };

  return (
    <div className="fade-in absolute inset-0 flex flex-col overflow-hidden">
      {/* latar teal yang sudah ada: bawah teal -> atas ungu malam */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#2a2350_0%,#173a44_45%,#0e2a30_75%,#081619_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[.6]"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.07) 1.2px, transparent 1.3px)", backgroundSize: "22px 22px" }} />
      <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 42px rgba(0,0,0,.38)" }} />
      <Dust count={8} />

      {/* header */}
      <div className="relative flex items-center gap-2.5 px-3 pt-3.5">
        <button onClick={() => { sfx.click(); onBack(); }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-b-4 border-[#0b3d34] bg-gradient-to-b from-[#34d399] to-[#059669] text-[20px] font-black text-white shadow-lg active:translate-y-0.5 active:border-b-2" aria-label="Kembali">‹</button>
        <div className="flex-1 text-center">
          <h2 className="bg-gradient-to-b from-white to-[#6ee7b7] bg-clip-text text-[24px] font-black leading-none tracking-[0.1em] text-transparent" style={{ filter: "drop-shadow(0 2px 0 rgba(0,0,0,.45))" }}>PETA LEVEL</h2>
          <p className="mt-1 text-[12px] font-bold text-white/60">Level {Math.min(currentLevel, MAX_LEVEL)}/{MAX_LEVEL} · 20 bab · 20 boss</p>
        </div>
        <span className="rounded-full border border-amber-300/50 bg-black/45 px-3 py-1.5 text-[13px] font-black tabular-nums text-amber-300">⭐ {totalStars}/300</span>
      </div>

      {/* legenda */}
      <div className="relative mx-3 mt-2 grid grid-cols-5 gap-1.5">
        {LEGEND.map((l) => (
          <div key={l.label} className="rounded-xl border bg-black/40 px-1 py-1.5 text-center" style={{ borderColor: `${l.color}66` }}>
            <p className="text-[18px] leading-none">{l.symbol}</p>
            <p className="mt-1 text-[12px] font-black tracking-widest" style={{ color: l.color }}>{l.label}</p>
          </div>
        ))}
      </div>

      {/* area peta scroll */}
      <div ref={scrollRef} className="thin-scroll relative mx-3 mb-1 mt-2 flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-black/20" style={{ scrollbarWidth: "none" }}>
        <div className="relative w-full" style={{ height: MAP_H }}>
          {/* jalur: rel + marka putus-putus */}
          <svg viewBox={`0 0 340 ${MAP_H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path d={pathD} fill="none" stroke="rgba(153,246,228,.22)" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
            <path d={pathD} fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 15" />
          </svg>

          {/* garis bab tiap 5 level */}
          {Array.from({ length: 19 }).map((_, b) => {
            const y = (nodeY(b * 5 + 4) + nodeY(b * 5 + 5)) / 2;
            return (
              <div key={b} className="absolute left-0 right-0 flex items-center gap-2 px-6" style={{ top: y - 10 }}>
                <span className="h-[2px] flex-1 rounded-full bg-white/20" />
                <span className="rounded-full border border-white/20 bg-black/55 px-2.5 py-0.5 text-[12px] font-black tracking-widest text-white/70">BAB {b + 2}</span>
                <span className="h-[2px] flex-1 rounded-full bg-white/20" />
              </div>
            );
          })}

          {/* awal */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center" style={{ top: MAP_H - 64 }}>
            <div className="text-[26px]">🚩</div>
            <div className="mt-0.5 whitespace-nowrap rounded-full border border-white/20 bg-black/55 px-2.5 py-0.5 text-[12px] font-black tracking-widest text-white/80">MULAI · LEVEL 1</div>
          </div>

          {/* puncak */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center" style={{ top: 8 }}>
            <div className="tap-hint text-[32px] drop-shadow-[0_4px_10px_rgba(0,0,0,.5)]">👑</div>
            <div className="mt-0.5 whitespace-nowrap rounded-full border border-amber-300/60 bg-black/60 px-2.5 py-0.5 text-[12px] font-black tracking-widest text-amber-300">LEVEL 100 · BOSS FINAL</div>
          </div>

          {/* 100 node */}
          {Array.from({ length: MAX_LEVEL }).map((_, idx) => {
            const lv = idx + 1;
            const st = getStage(lv);
            const isFinal = lv === MAX_LEVEL;
            const locked = lv > highestUnlocked;
            const done = !!completed[String(lv)]?.done;
            const stars = completed[String(lv)]?.stars ?? 0;
            const isActive = lv === activeLevel;
            const size = isFinal ? 66 : st.kind === "boss" ? 58 : 46;
            const boss = st.kind === "boss" && st.bossIndex != null ? BOSSES[st.bossIndex] : null;
            return (
              <div key={lv} className="fade-up absolute" style={{ left: `${nodeX(idx)}%`, top: nodeY(idx), transform: "translate(-50%,-50%)", animationDelay: `${Math.min(idx * 0.008, 0.4)}s` }}>
                <button
                  onClick={() => openNode(lv)}
                  className="relative block transition active:scale-95"
                  style={{ width: size, height: size }}
                  aria-label={`Level ${lv}${locked ? " terkunci" : ""}`}
                >
                  {isActive && !locked && <span className="ring-ping absolute -inset-2 rounded-full border-4 border-amber-300" />}
                  {isActive && !locked && (
                    <span className="tap-hint absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-2 py-0.5 text-[12px] font-black text-black shadow">▼ KAMU</span>
                  )}
                  <span
                    className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full"
                    style={
                      locked
                        ? { background: "linear-gradient(180deg,#6b7280,#374151)", borderBottom: "5px solid rgba(0,0,0,.45)", boxShadow: "0 8px 16px rgba(0,0,0,.4)", filter: "saturate(.4)" }
                        : st.kind === "boss"
                          ? { background: boss?.grad ?? "linear-gradient(135deg,#fb7185,#be123c)", borderBottom: "6px solid rgba(0,0,0,.35)", boxShadow: `0 10px 20px rgba(0,0,0,.45), 0 0 16px ${boss?.colors.glow ?? "rgba(251,113,133,.4)"}` }
                          : st.kind === "bonus"
                            ? { background: "linear-gradient(180deg,#fcd34d,#d97706)", borderBottom: "5px solid rgba(0,0,0,.35)", boxShadow: "0 8px 16px rgba(0,0,0,.4), 0 0 14px rgba(252,211,77,.35)" }
                            : st.kind === "destroy"
                              ? { background: "linear-gradient(180deg,#a8a29e,#57534e)", borderBottom: "5px solid rgba(0,0,0,.35)", boxShadow: "0 8px 16px rgba(0,0,0,.4), 0 0 14px rgba(203,191,174,.3)" }
                              : { background: "linear-gradient(180deg,#34d399,#059669)", borderBottom: "5px solid rgba(0,0,0,.35)", boxShadow: "0 8px 16px rgba(0,0,0,.4)" }
                    }
                  >
                    <span className="pointer-events-none absolute inset-x-2 top-1 h-3 rounded-full bg-white/35 blur-[1px]" />
                    {st.kind === "boss" && boss ? (
                      <span className="absolute inset-[5px] overflow-hidden rounded-full border-2 border-white/50" style={locked ? { filter: "grayscale(1) brightness(.7)" } : undefined}>
                        <BossTarget id={boss.id} />
                      </span>
                    ) : st.kind === "bonus" ? (
                      locked ? <span className="text-[20px] opacity-60">🪙</span> : <MapCoin />
                    ) : st.kind === "destroy" ? (
                      <span className="text-[22px] drop-shadow" style={locked ? { opacity: .55 } : undefined}>🪨</span>
                    ) : (
                      <span className="text-[22px] drop-shadow" style={locked ? { opacity: .55 } : undefined}>🔪</span>
                    )}
                    {locked && (
                      <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#1f2937] text-[13px]">🔒</span>
                    )}
                    {done && (
                      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[13px] font-black text-white">✓</span>
                    )}
                  </span>
                  {/* label bawah */}
                  {done && stars > 0 ? (
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[13px] font-black leading-none">
                      {[1, 2, 3].map((i) => (
                        <span key={i} className={i <= stars ? "text-yellow-300" : "text-white/25"}>★</span>
                      ))}
                    </span>
                  ) : (
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/15 bg-black/65 px-2 py-px text-[12px] font-black tabular-nums text-white">{lv}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* modal detail */}
      {selLevel != null && selInfo && selMeta && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]" onClick={() => setSelLevel(null)}>
          <div className="panel-in relative w-full max-w-[320px] overflow-hidden rounded-3xl border-2 border-white/20 bg-gradient-to-b from-[#1d4a54] to-[#0c2228] p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <span className="shine-sweep pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            {/* showcase */}
            <div className="relative mx-auto flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              <div className="absolute left-1/2 top-1/2 h-0 w-0"><GodRays size={260} intensity={0.7} color="255,220,140" /></div>
              <div className="float relative">
                {selInfo.kind === "boss" && selBoss ? (
                  <span className="relative block h-[86px] w-[86px] overflow-hidden rounded-full border-4 border-white/70" style={selLocked ? { filter: "grayscale(1) brightness(.6)" } : { boxShadow: `0 0 22px ${selBoss.colors.glow}` }}>
                    <BossTarget id={selBoss.id} />
                  </span>
                ) : selInfo.kind === "bonus" ? (
                  <span className="coin-spin block h-[72px] w-[72px]">
                    <span className="coin-blink block h-full w-full rounded-full border-[3px] border-[#8a5a00]" style={{ background: "radial-gradient(circle at 35% 28%, #fff9c9 0%, #ffe36e 30%, #f5b301 58%, #c07c00 85%)", boxShadow: "0 0 18px rgba(255,210,60,.9)" }} />
                  </span>
                ) : selInfo.kind === "destroy" ? (
                  <span className="relative block h-[86px] w-[86px]">
                    <span className="absolute inset-0 rounded-[30%] border-4 border-[#57534e] bg-gradient-to-b from-[#a8a29e] to-[#57534e] shadow-[0_10px_20px_rgba(0,0,0,.5)]" style={selLocked ? { filter: "grayscale(1) brightness(.6)" } : undefined}>
                      <span className="absolute left-[30%] top-[30%] h-3 w-3 rounded-full bg-[#44403c]" />
                      <span className="absolute bottom-[28%] right-[26%] h-4 w-4 rounded-full bg-[#44403c]" />
                    </span>
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[40px] drop-shadow-[0_0_14px_rgba(165,243,252,.9)]">💎</span>
                  </span>
                ) : (
                  <span className="text-[64px] drop-shadow-[0_8px_12px_rgba(0,0,0,.5)]">🔪</span>
                )}
              </div>
              <SparkleField count={5} spread={1.2} />
            </div>
            {/* chip info */}
            <div className="mt-2.5 flex justify-center">
              <span className="rounded-full px-3.5 py-1 text-[13px] font-black tracking-[0.14em]" style={{ background: selMeta.bg, color: selMeta.color, border: `2px solid ${selMeta.color}` }}>
                LEVEL {selLevel} · {selInfo.kind === "boss" ? "BOSS STAGE" : selInfo.kind === "bonus" ? "BONUS STAGE" : selInfo.kind === "destroy" ? "DESTROY STAGE" : "NORMAL STAGE"} · BAB {selBab}
              </span>
            </div>
            <h3 className="mt-2 text-center text-[22px] font-black leading-tight text-white">
              {selInfo.kind === "boss" && selBoss ? selBoss.name : selInfo.kind === "bonus" ? "PANEN KOIN EMAS" : selInfo.kind === "destroy" ? "HANCURKAN BATU!" : `TANTANGAN PISAU ${selLevel}`}
            </h3>
            {selInfo.kind === "boss" && selBoss ? (
              <>
                <p className="mt-0.5 text-center text-[14px] font-black" style={{ color: selBoss.colors.edge }}>“{selBoss.title}”</p>
                <p className="mx-auto mt-1 max-w-[270px] text-center text-[13px] font-medium leading-snug text-white/70">{selBoss.desc}</p>
                <div className="mt-2 rounded-2xl border border-amber-300/30 bg-black/40 p-2.5">
                  <p className="text-[13px] font-black tracking-[0.14em] text-amber-300">⚠️ RINTANGAN (BERTAHAP)</p>
                  <div className="mt-1.5 space-y-1.5">
                    <div className="rounded-xl bg-white/[.06] p-2">
                      <p className="text-[12px] font-black tracking-widest text-emerald-300">FASE 1</p>
                      <p className="text-[13px] font-bold text-white/85">Pola {PATTERN_LABEL[selBoss.pattern]} · 🔪 {selBoss.knives} pisau</p>
                    </div>
                    {selBoss.hazards.slice(0, 2).map((h, i) => (
                      <div key={h.name} className="rounded-xl bg-white/[.06] p-2">
                        <p className="text-[12px] font-black tracking-widest text-orange-300">FASE {i + 2}{i === 0 ? " · HP<70%" : " · HP<35%"}</p>
                        <p className="text-[13px] font-bold text-white/85">{h.icon} {h.name} — {h.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 flex justify-center gap-1.5">
                  <span className="rounded-full bg-black/50 px-2.5 py-1 text-[12px] font-black text-white/85">🔪 {selBoss.knives} pisau</span>
                  <span className="rounded-full bg-black/50 px-2.5 py-1 text-[12px] font-black text-amber-300">🎁 Peti boss</span>
                  <span className="rounded-full bg-black/50 px-2.5 py-1 text-[12px] font-black text-white/85">💀 {"★".repeat(Math.min(3, Math.ceil(selBoss.difficulty / 2)))}</span>
                </div>
              </>
            ) : (
              <>
                <p className="mx-auto mt-1.5 max-w-[270px] text-center text-[13px] font-medium leading-snug text-white/70">
                  {selInfo.kind === "bonus"
                    ? "Roda koin putar 1 arah. 6 pisau, kena koin = +5 💵. Hati-hati pisau bertabrakan!"
                    : selInfo.kind === "destroy"
                      ? "Tembak bongkahan batu terus sampai pecah berkeping-keping dan berlian besar bersih terlihat! Damage ikut kekuatan senjatamu."
                      : "Kayu polos putaran stabil. 5–7 pisau tanpa tabrakan untuk menang + auto-lanjut."}
                </p>
                {selInfo.kind === "destroy" && (
                  <div className="mt-2 flex justify-center gap-1.5">
                    <span className="rounded-full bg-black/50 px-2.5 py-1 text-[12px] font-black text-white/85">🔨 Damage = senjata dipakai</span>
                    <span className="rounded-full bg-black/50 px-2.5 py-1 text-[12px] font-black text-white/85">💎 Tanpa timer</span>
                  </div>
                )}
              </>
            )}
            <div className="mt-2 flex items-center justify-center gap-1.5">
              <span className="text-[13px] font-black tracking-widest text-white/60">BINTANGMU:</span>
              {selDone && selDone.stars > 0 ? (
                [1, 2, 3].map((i) => (
                  <span key={i} className={`text-[20px] ${i <= (selDone?.stars ?? 0) ? "text-yellow-300" : "text-white/20"}`}>★</span>
                ))
              ) : (
                <span className="text-[13px] font-bold text-white/45">belum dimainkan</span>
              )}
            </div>
            <p className="mt-1 text-center text-[12px] font-bold text-white/45">★1 tamat · ★2 tanpa tabrakan · ★3 cepat + sempurna</p>
            <div className="mt-2.5 flex gap-2">
              <button onClick={() => setSelLevel(null)} className="flex-1 rounded-2xl border border-white/20 bg-white/10 py-3 text-[15px] font-black text-white/80 active:scale-95">NANTI</button>
              {selLocked ? (
                <button className="flex-[2] rounded-2xl border-b-4 border-white/10 bg-white/10 py-3 text-[15px] font-black text-white/40">🔒 TERKUNCI</button>
              ) : (
                <button onClick={startSel} className="relative flex-[2] overflow-hidden rounded-2xl border-b-[5px] border-[#0d6b30] bg-gradient-to-b from-[#6ef59a] to-[#14a04a] py-3 text-[17px] font-black tracking-widest text-white active:translate-y-0.5">
                  <span className="pointer-events-none absolute inset-x-4 top-1 h-[34%] rounded-lg bg-white/25" />
                  MULAI ▶
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* nav bawah */}
      <div className="relative mx-3 mb-2 mt-1.5 flex items-end justify-center gap-5">
        {[
          { icon: "📍", label: "MAP", fn: onBack },
          { icon: "⚔️", label: "SKINS", fn: onSkins ?? (() => {}) },
          { icon: "🏆", label: "LEAGUE", fn: onLeague ?? (() => {}) },
        ].map((b) => (
          <span key={b.label} className="flex w-[64px] flex-col items-center gap-1">
            <button onClick={() => { sfx.click(); b.fn(); }}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-b-[5px] border-[#2f0f86] bg-gradient-to-b from-[#a86bff] to-[#6a25e0] text-[22px] text-white shadow active:translate-y-0.5 active:border-b-2">
              {b.icon}
            </button>
            <span className="text-[12px] font-black tracking-[0.16em] text-white/80">{b.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export { BOSSES };
