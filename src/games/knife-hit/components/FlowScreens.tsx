import { useEffect, useState } from "react";
import { STAGE_META, type StageKind } from "../stages";
import { Dust, GodRays } from "./Effects";
import { GreenButton } from "./Effects";
import { sfx, vibrate } from "../sfx";
import { useSlideActive } from "../../shared/SlideActivity";

/* ============ LEVEL SELESAI — untuk normal / bonus / treasure ============ */
export function LevelCompleteScreen({
  level, kind, stars, coinsEarned, extra, hasNext, isNewBest,
  onNext, onReplay, onMap,
}: {
  level: number; kind: StageKind; stars: number; coinsEarned: number;
  extra?: string; hasNext: boolean; isNewBest?: boolean;
  onNext: () => void; onReplay: () => void; onMap: () => void;
}) {
  const meta = STAGE_META[kind];
  useEffect(() => {
    sfx.reveal();
    vibrate(18);
  }, []);
  return (
    <div className="fade-in absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/60 p-6 text-center backdrop-blur-[2px]">
      <div className="absolute left-1/2 top-[30%] h-0 w-0">
        <GodRays size={440} intensity={1} color="255,220,140" />
      </div>
      <div className="panel-in relative w-full max-w-[310px] overflow-hidden rounded-3xl border-[3px] border-amber-300/70 bg-gradient-to-b from-[#1d4a54] to-[#0c2228] px-5 pb-5 pt-5 shadow-[0_24px_60px_rgba(0,0,0,.6)]">
        <div className="pointer-events-none absolute inset-x-6 top-1.5 h-8 rounded-full bg-white/15 blur-[1px]" />
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[14px] font-black tracking-[0.18em]"
          style={{ background: meta.bg, color: meta.color, border: `2px solid ${meta.color}` }}
        >
          {meta.symbol} {meta.label}
        </span>
        <h2 className="txt-glow-gold mt-2 text-[30px] font-black leading-none text-amber-300">
          LEVEL {level} CLEAR!
        </h2>
        <div className="mt-2 flex justify-center gap-1.5">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className={`pop-in text-[34px] ${i <= stars ? "text-yellow-300" : "text-white/20"}`}
              style={{ animationDelay: `${0.3 + i * 0.18}s`, filter: i <= stars ? "drop-shadow(0 0 10px #fde047)" : undefined }}
            >
              ★
            </span>
          ))}
        </div>
        <div className="pop-in mt-2 inline-flex items-center gap-2 rounded-2xl border border-amber-300/40 bg-black/45 px-5 py-2" style={{ animationDelay: ".9s" }}>
          <span className="text-[26px]">🪙</span>
          <span className="text-[24px] font-black tabular-nums text-amber-300">+{coinsEarned}</span>
        </div>
        {extra && <p className="mt-2 text-[13px] font-bold text-white/70">{extra}</p>}
        {isNewBest && (
          <p className="pop-in mt-1.5 inline-block rounded-full bg-emerald-400/20 px-3 py-1 text-[12px] font-black tracking-widest text-emerald-300" style={{ animationDelay: "1.1s" }}>
            ✨ REKOR BARU!
          </p>
        )}
        <div className="mt-4 flex flex-col gap-2">
          {hasNext && (
            <div className="fade-up" style={{ animationDelay: "1s" }}>
              <GreenButton onClick={() => { sfx.click(); onNext(); }} className="w-full px-6 text-[20px]">
                NEXT LEVEL ➜
              </GreenButton>
            </div>
          )}
          <div className="fade-up flex gap-2" style={{ animationDelay: "1.15s" }}>
            <button onClick={() => { sfx.click(); onReplay(); }} className="flex-1 rounded-xl border-b-4 border-white/20 bg-white/10 py-2.5 text-[15px] font-black text-white active:translate-y-0.5">
              ↻ ULANGI
            </button>
            <button onClick={() => { sfx.click(); onMap(); }} className="flex-1 rounded-xl border-b-4 border-white/20 bg-white/10 py-2.5 text-[15px] font-black text-white active:translate-y-0.5">
              🗺 PETA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ GAGAL — revive countdown + iklan / retry / peta ============ */
const FAIL_COUNT = 10;

export function FailScreen({
  level, kind, progressText, onReviveAd, onRetry, onMap,
}: {
  level: number; kind: StageKind; progressText: string;
  onReviveAd: () => void; onRetry: () => void; onMap: () => void;
}) {
  const active = useSlideActive();
  const meta = STAGE_META[kind];
  const [n, setN] = useState(FAIL_COUNT);
  const [showGiveUp, setShowGiveUp] = useState(false);

  useEffect(() => {
    if (!active || n <= 0) return;
    if (n < FAIL_COUNT) sfx.tick(n <= 3);
    if (n <= 3) vibrate(8);
    const t = setTimeout(() => setN((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [n, active]);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setShowGiveUp(true), 2500);
    return () => clearTimeout(t);
  }, [active]);

  const R = 96;
  const C = 2 * Math.PI * R;
  const urgent = n <= 3;

  return (
    <div className="fade-in absolute inset-0 z-20">
      <Dust />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-x-0 top-[70px] text-center">
        <div
          key={n}
          className={`count-pulse text-[84px] font-black leading-none tabular-nums ${urgent ? "text-red-400" : "text-amber-400"}`}
          style={{ textShadow: urgent ? "0 4px 0 #8b1d1d, 0 0 28px rgba(248,113,113,.6)" : "0 4px 0 #9a5b00, 0 0 28px rgba(255,190,60,.5)" }}
        >
          {n}
        </div>
        <div className="txt-3d mt-1 text-[30px] font-black leading-none text-white">GAGAL — LANJUT?</div>
        <p className="mt-2 text-[14px] font-bold text-white/70">
          <span style={{ color: meta.color }}>{meta.symbol} LEVEL {level}</span> · {progressText}
        </p>
      </div>

      <div className="absolute left-1/2 top-[380px] h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2">
        <svg viewBox="0 0 210 210" className="absolute inset-0 overflow-visible">
          <circle cx="105" cy="105" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="7" />
          <circle
            cx="105" cy="105" r={R} fill="none" stroke={urgent ? "#f87171" : "#fbbf24"} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - n / FAIL_COUNT)}
            transform="rotate(-90 105 105)" style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[52px]">{meta.symbol}</span>
          <span className="mt-1 rounded-full bg-black/50 px-3 py-1 text-[13px] font-black tracking-widest" style={{ color: meta.color }}>
            REVIVE = LANJUTKAN
          </span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-[46px] flex flex-col items-center gap-2.5 px-8">
        <GreenButton onClick={() => { sfx.click(); onReviveAd(); }} className="w-full px-6 py-3 text-[19px]">
          <span className="flex h-7 w-9 items-center justify-center rounded-md bg-yellow-300 shadow-inner">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-emerald-700"><path d="M7 4l13 8-13 8z" /></svg>
          </span>
          REVIVE (IKLAN)
        </GreenButton>
        <div className="flex w-full gap-2">
          <button onClick={() => { sfx.click(); onRetry(); }} className="flex-1 rounded-xl border-b-4 border-white/20 bg-white/10 py-2.5 text-[15px] font-black text-white active:translate-y-0.5">
            ↻ ULANGI
          </button>
          <button
            onClick={() => { sfx.click(); onMap(); }}
            className={`flex-1 rounded-xl py-2.5 text-[15px] font-black text-white/60 transition-opacity ${showGiveUp ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            Peta
          </button>
        </div>
        <p className="text-[13px] font-bold text-white/50">Revive = lanjut dari posisi terakhir · Ulangi = mulai fresh</p>
      </div>
    </div>
  );
}
