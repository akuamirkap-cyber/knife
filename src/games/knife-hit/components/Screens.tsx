import { useCallback, useEffect, useRef, useState } from "react";
import { GiftBoxBody, GiftBoxLid, Knife } from "./Art";
import { BossTarget, WoodLog, getBoss, type BossId } from "./Bosses";
import { Burst, Confetti, Dust, Flare, GodRays, GreenButton, LetterPop, Shockwave, SparkleField } from "./Effects";
import { RARITY_STYLE, ShinyWeapon, WeaponArt, type Rarity, type WeaponDef } from "../weapons";
import { ACHIEVEMENTS, MILESTONES, type Stats } from "../achievements";
import { sfx, vibrate } from "../sfx";

const STAGE = 6;
const BOSS = "CHEESE";
type CSSVars = React.CSSProperties & Record<string, string | number>;

export const RARITY_RGB: Record<Rarity, string> = {
  COMMON: "200,205,215",
  RARE: "56,189,248",
  EPIC: "192,132,252",
  LEGEND: "251,191,36",
  MYTHIC: "251,113,133",
};

function shakeEl(el: HTMLElement | null, power = 3, duration = 200) {
  if (!el) return;
  const p = power;
  el.animate(
    [
      { transform: "translate(0,0)" },
      { transform: `translate(${-p}px,${p * 0.5}px)` },
      { transform: `translate(${p}px,${-p * 0.5}px)` },
      { transform: "translate(0,0)" },
    ],
    { duration, easing: "ease-out" }
  );
}

function StageDots({ boss = true, level }: { boss?: boolean; level?: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-full ${i === 0 ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]" : "bg-white/85"}`} />
        ))}
        {boss && (
          <svg viewBox="0 0 24 24" className="ml-1 h-5 w-5 drop-shadow-[0_0_6px_rgba(255,255,255,.5)]">
            <path d="M4 3 L14 13 M20 3 L10 13" stroke="#e5edf2" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M12 15 L6 21 M12 15 L18 21" stroke="#c98a3c" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <span className="txt-glow-gold mt-1 text-xl font-bold tracking-wider text-amber-400">STAGE {level ?? STAGE}</span>
    </div>
  );
}

export function Hud({ score, apples = 12, dim = false, level }: { score: number; apples?: number; dim?: boolean; level?: number }) {
  return (
    <div className={`absolute inset-x-0 top-0 z-10 px-5 pt-4 transition-opacity ${dim ? "opacity-40" : ""}`}>
      <div className="flex items-start justify-between">
        <span key={score} className="count-pulse txt-glow-gold w-12 text-3xl font-bold tabular-nums text-amber-400">{score}</span>
        <StageDots level={level} />
        <span className="flex w-12 items-center justify-end gap-1 text-lg font-semibold text-amber-300">{apples}<span className="text-xl">🍎</span></span>
      </div>
    </div>
  );
}

export function RarityBadge({ rarity, size = "md" }: { rarity: Rarity; size?: "sm" | "md" | "lg" }) {
  const st = RARITY_STYLE[rarity];
  const cls =
    size === "sm"
      ? "px-3 py-1 text-[13px]"
      : size === "lg"
        ? "px-5 py-2 text-[16px]"
        : "px-4 py-1.5 text-[14px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-black tracking-[0.14em] ${cls}`}
      style={{ background: st.bg, color: st.text, border: `2px solid ${st.color}`, boxShadow: `0 0 16px ${st.glow}, inset 0 1px 0 rgba(255,255,255,.25)` }}
    >
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: st.color, boxShadow: `0 0 8px ${st.color}` }} />
      {rarity}
    </span>
  );
}

export function PowerPill({ power }: { power: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-300/70 bg-black/45 px-3.5 py-1.5 text-[14px] font-black text-amber-300 shadow-[0_0_14px_rgba(251,191,36,.25)]">
      <span className="text-[15px]">⚡</span> {power}
    </span>
  );
}

/* ---------------- STAGE ---------------- */
const LOG_Y = 245;
const LOG_R = 90;
const KNIFE_Y = 570;

export const KNIFE_GAP_DEG = 15;

export function angDiff(a: number, b: number): number {
  let d = Math.abs(((a - b) % 360 + 540) % 360 - 180);
  return d;
}

export function StageScreen({
  onComplete, onThrow, onFail, onQuit, bossId = "cheese", mode = "boss",
  level = 1, coins = 0, initialStuck,
}: {
  onComplete: () => void; onThrow?: () => void; onFail?: (stuck: number[]) => void; onQuit?: () => void;
  bossId?: BossId; mode?: "boss" | "normal";
  level?: number; coins?: number; initialStuck?: number[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const bumpRef = useRef<HTMLDivElement>(null);
  const rot = useRef(Math.random() * 360);
  const breakRot = useRef(0);
  const boss = getBoss(bossId);
  const isNormal = mode === "normal";
  const need = isNormal ? 5 + Math.min(2, Math.floor((level - 1) / 25)) : boss.knives;
  const base = (isNormal ? 100 : boss.speed) * (0.9 + Math.min(0.45, Math.floor((Math.min(level, 100) - 1) / 25) * 0.15));
  const pattern = isNormal ? "steady" : boss.pattern;
  const [stuck, setStuck] = useState<number[]>(initialStuck ?? []);
  const [throwing, setThrowing] = useState(false);
  const [fx, setFx] = useState(0);
  const [broken, setBroken] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const stuckRef = useRef<number[]>(initialStuck ?? []);
  stuckRef.current = stuck;

  useEffect(() => {
    let raf = 0, last = performance.now(), t = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      let speed: number;
      switch (pattern) {
        case "steady": speed = base + Math.sin(t * 0.9) * 18; break;
        case "pulse": speed = base + Math.sin(t * 1.7) * 105; break;
        case "wobble": speed = base + Math.sin(t * 2.4) * 65 + Math.sin(t * 0.7) * 30; break;
        case "pause": { const ph = t % 4.2; speed = ph < 1.1 ? base * 0.22 : base + Math.sin(t * 1.4) * 60; break; }
        case "reverse": speed = base * 1.25 * Math.sin(t * 0.85); break;
        case "accel": speed = Math.min(base + t * 7, base + 170); break;
        default: {
          speed = base * 1.1 * Math.sin(t * 1.1) + Math.sin(t * 2.7) * 70;
          if (t % 5 < 0.9) speed *= 0.25;
          break;
        }
      }
      rot.current = (rot.current + speed * dt) % 360;
      if (logRef.current) logRef.current.style.transform = `rotate(${rot.current}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [base, pattern]);

  const throwKnife = () => {
    if (throwing || broken || crashed || stuckRef.current.length >= need) return;
    setThrowing(true);
    sfx.throw();
    onThrow?.();
    setTimeout(() => {
      const land = -rot.current;
      // TABRAKAN: cek jarak sudut ke semua pisau yang sudah nancap
      const hit = stuckRef.current.some((a) => angDiff(a, land) < KNIFE_GAP_DEG);
      if (hit) {
        setThrowing(false);
        setCrashed(true);
        sfx.break();
        vibrate([30, 40, 60]);
        shakeEl(wrapRef.current, 9, 420);
        bumpRef.current?.animate(
          [{ transform: "translateY(0)" }, { transform: "translateY(-14px)" }, { transform: "translateY(6px)" }],
          { duration: 300, easing: "ease-out" }
        );
        setTimeout(() => onFail?.([...stuckRef.current]), 1150);
        return;
      }
      const next = [...stuckRef.current, land];
      setStuck(next);
      setThrowing(false);
      setFx((k) => k + 1);
      sfx.hit();
      vibrate(10);
      shakeEl(wrapRef.current, 2, 150);
      bumpRef.current?.animate(
        [{ transform: "translateY(0) scale(1)" }, { transform: "translateY(-8px) scale(1.03)" }, { transform: "translateY(0) scale(1)" }],
        { duration: 160, easing: "ease-out" }
      );
      if (next.length >= need) {
        setTimeout(() => {
          breakRot.current = rot.current;
          setBroken(true);
          sfx.break();
          vibrate(18);
          shakeEl(wrapRef.current, 4, 300);
        }, 320);
        setTimeout(onComplete, 1100);
      }
    }, 85);
  };

  const remaining = need - stuck.length;
  const pieces = [
    { dx: "-180px", dy: "-150px", rot: "-160deg", clip: "polygon(50% 50%, 0 0, 100% 0)" },
    { dx: "190px", dy: "-80px", rot: "170deg", clip: "polygon(50% 50%, 100% 0, 100% 100%)" },
    { dx: "150px", dy: "260px", rot: "130deg", clip: "polygon(50% 50%, 100% 100%, 0 100%)" },
    { dx: "-180px", dy: "230px", rot: "-170deg", clip: "polygon(50% 50%, 0 100%, 0 0)" },
  ];

  return (
    <div ref={wrapRef} className="absolute inset-0 cursor-pointer" onPointerDown={throwKnife}>
      <Dust />
      {/* HUD level asli */}
      <div className="absolute inset-x-0 top-0 z-10 px-3 pt-3.5">
        <div className="flex items-center gap-2">
          {onQuit && (
            <button
              onPointerDown={(e) => { e.stopPropagation(); sfx.click(); onQuit(); }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black/50 text-[20px] font-black text-white active:scale-90"
              aria-label="Kembali ke peta"
            >
              ‹
            </button>
          )}
          <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 backdrop-blur">
            <span className="text-[18px]">🔪</span>
            <span className="text-[15px] font-black tabular-nums text-white">{remaining}/{need}</span>
          </span>
          <div className="flex min-w-0 flex-1 flex-col items-center">
            <span className="txt-glow-gold text-[19px] font-black leading-none tracking-wider text-amber-400">
              LEVEL {level} {isNormal ? "🪵" : "👑"}
            </span>
            <span className="mt-1 max-w-full truncate text-[12px] font-bold tracking-[0.14em] text-white/55">
              {isNormal ? "NORMAL · STABIL" : `${boss.name} · ${boss.world}`}
            </span>
          </div>
          <span className="flex items-center gap-1 rounded-full border border-amber-300/30 bg-black/55 px-2.5 py-1.5 backdrop-blur">
            <span className="text-[14px] font-black tabular-nums text-amber-300">{coins.toLocaleString("id-ID")}</span>
            <span className="text-[15px]">💵</span>
          </span>
        </div>
        {/* progress pisau */}
        <div className="mx-auto mt-2 flex max-w-[220px] justify-center gap-1.5">
          {Array.from({ length: need }).map((_, i) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${i < stuck.length ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.7)]" : "bg-white/15"}`}
            />
          ))}
        </div>
      </div>
      {/* crash overlay */}
      {crashed && (
        <>
          <div className="flash pointer-events-none absolute inset-0 bg-red-500/70" />
          <div className="absolute inset-x-0 top-[380px] z-10 text-center">
            <p className="pop-in text-[34px] font-black text-red-300" style={{ textShadow: "0 3px 0 #7f1d1d, 0 0 24px rgba(248,113,113,.6)" }}>
              BERTABRAKAN!
            </p>
            <p className="fade-up mt-1 text-[15px] font-bold text-white/85" style={{ animationDelay: ".25s" }}>
              {isNormal ? "Pisau kena pisau…" : `${boss.name} menertawakanmu…`}
            </p>
          </div>
        </>
      )}

      <div className="absolute left-1/2" style={{ top: LOG_Y, width: LOG_R * 2, height: LOG_R * 2, marginLeft: -LOG_R, marginTop: -LOG_R }}>
        {!broken ? (
          <div ref={bumpRef} className="absolute inset-0">
            <div ref={logRef} className="absolute inset-0">
              {stuck.map((a, i) => (
                <div key={i} className="absolute left-1/2 top-1/2 h-0 w-0" style={{ transform: `rotate(${a}deg)` }}>
                  <Knife className="absolute h-[80px] w-[20px]" style={{ left: -10, top: LOG_R - 28 }} />
                </div>
              ))}
              {isNormal ? <WoodLog /> : <BossTarget id={bossId} />}
            </div>
            {fx > 0 && <div key={`f${fx}`} className="white-flash pointer-events-none absolute inset-0 rounded-full bg-white mix-blend-overlay" />}
          </div>
        ) : (
          <>
            <div className="absolute inset-[-200px]"><GodRays size={560} intensity={1.1} /></div>
            {pieces.map((p, i) => (
              <div key={i} className="piece-fly absolute inset-0" style={{ clipPath: p.clip, "--dx": p.dx, "--dy": p.dy, "--rot": p.rot } as CSSVars}>
                {isNormal ? <WoodLog /> : <BossTarget id={bossId} />}
              </div>
            ))}
            {stuck.map((a, i) => (
              <div key={i} className="absolute left-1/2 top-1/2 h-0 w-0" style={{ transform: `rotate(${a + breakRot.current}deg)` }}>
                <div className="piece-fly absolute" style={{ left: -10, top: LOG_R - 28, "--dx": "0px", "--dy": "420px", "--rot": `${(i % 2 ? 1 : -1) * 400}deg` } as CSSVars}>
                  <Knife className="h-[80px] w-[20px]" />
                </div>
              </div>
            ))}
            <Shockwave size={440} color="rgba(255,220,120,.9)" />
            <Shockwave size={320} delay={0.12} />
            <Flare width={440} />
            <Burst count={20} distance={210} colors={["#ffe680", "#ffc22e", "#fff", "#f2a92e"]} />
            <Confetti count={28} />
          </>
        )}
      </div>

      {fx > 0 && !broken && (
        <div key={`c${fx}`} className="pointer-events-none absolute left-1/2" style={{ top: LOG_Y + LOG_R - 4 }}>
          <Burst count={8} distance={64} shape="chip" size={9} colors={["#ffd04d", "#f2a92e", "#fff0a0"]} duration={0.5} />
          <div className="score-pop absolute left-0 top-[-30px] text-2xl font-bold text-white txt-3d">+1</div>
        </div>
      )}

      {broken && (
        <>
          <div className="flash pointer-events-none absolute inset-0 bg-white" />
          <div className="absolute inset-x-0 top-[420px] text-center">
            <LetterPop text="STAGE CLEAR!" className="txt-glow-green text-4xl font-bold text-emerald-300" delay={0.25} />
          </div>
        </>
      )}

      {!broken && remaining > 0 && (
        <div
          className="absolute left-1/2"
          style={{
            top: KNIFE_Y, marginLeft: -11,
            transform: throwing ? `translateY(${-(KNIFE_Y - (LOG_Y + LOG_R - 28))}px)` : "translateY(0)",
            transition: throwing ? "transform 85ms linear" : "none",
          }}
        >
          <Knife key={stuck.length} className={`h-[84px] w-[22px] ${!throwing ? "fade-up" : ""}`} />
          {throwing && <div className="absolute left-1/2 top-full h-16 w-2 -translate-x-1/2 bg-gradient-to-b from-white/60 to-transparent blur-[2px]" />}
        </div>
      )}

      <div className="absolute bottom-6 left-5 flex flex-col-reverse gap-1.5">
        {Array.from({ length: need }).map((_, i) => (
          <Knife key={i} className={`h-7 w-3 rotate-45 transition-all duration-300 ${i < remaining ? "opacity-100" : "opacity-15 grayscale scale-75"}`} />
        ))}
      </div>

      {stuck.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-32 flex flex-col items-center gap-2">
          <div className="tap-hint text-3xl">👆</div>
          <p className="text-sm font-medium text-white/70">Tap untuk melempar · {need} pisau {isNormal ? "latihan" : `kalahkan ${boss.name}`}</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- GIFT BOX ---------------- */
type BoxState = "drop" | "ready" | "charging" | "open";
const TAPS = 3;

export function BoxScreen({ weapon, onDone, bossName = BOSS, level, score }: { weapon: WeaponDef; onDone: () => void; bossName?: string; level?: number; score?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const punchRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<BoxState>("drop");
  const [taps, setTaps] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const rayColor = RARITY_RGB[weapon.rarity];

  useEffect(() => {
    sfx.whoosh();
    const a = setTimeout(() => { sfx.thud(); vibrate(12); shakeEl(wrapRef.current, 3, 220); }, 560);
    const b = setTimeout(() => setState("ready"), 1000);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  const tap = () => {
    if (state !== "ready") return;
    const n = taps + 1;
    setTaps(n);
    sfx.tap(n);
    vibrate(8);
    shakeEl(wrapRef.current, 2 + n, 160);
    punchRef.current?.animate(
      [{ transform: "scale(1)" }, { transform: `scale(${1.1 + n * 0.03}, ${0.88 - n * 0.02})` }, { transform: "scale(.96,1.05)" }, { transform: "scale(1)" }],
      { duration: 280, easing: "cubic-bezier(.3,.8,.4,1.3)" }
    );
    if (n >= TAPS) {
      setState("charging");
      sfx.charge();
      setTimeout(() => {
        setState("open");
        sfx.open();
        vibrate(20);
        shakeEl(wrapRef.current, 5, 350);
      }, 900);
      setTimeout(() => { setShowInfo(true); sfx.reveal(); }, 2400);
    }
  };

  const isOpen = state === "open";
  const charging = state === "charging";
  const seam = charging ? 1 : [0, 0.35, 0.7, 1][taps];
  const anim = state === "drop" ? "drop-in" : charging ? "violent" : taps === 0 ? "idle-bob" : "wobble";

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden" onPointerDown={tap}>
      <Dust />
      <Hud score={score ?? 46} dim level={level} />
      <div className={`absolute inset-0 transition-colors duration-700 ${isOpen ? "bg-black/20" : "bg-black/45"}`} />

      <div className="absolute inset-x-0 top-[96px] text-center">
        {!showInfo ? (
          <div className={`transition-all duration-300 ${isOpen ? "scale-75 opacity-0" : ""}`}>
            <h2 className="txt-glow-gold text-[32px] font-bold leading-none text-amber-400"><LetterPop text={`${bossName} DEFEATED!`} delay={0.2} /></h2>
            <p className="fade-up mt-2 text-base text-white/80" style={{ animationDelay: ".8s" }}>🎁 Kotak hadiah boss didapat!</p>
          </div>
        ) : (
          <>
            <div className="pop-in flex justify-center"><RarityBadge rarity={weapon.rarity} /></div>
            <h2 className="txt-glow-green mt-1 text-[30px] font-bold leading-none text-emerald-300"><LetterPop text="SENJATA BARU!" /></h2>
            <div className="fade-up mt-2 flex justify-center gap-1" style={{ animationDelay: ".4s" }}>
              {[0, 1, 2].map((i) => <span key={i} className="pop-in text-2xl text-yellow-300 drop-shadow-[0_0_8px_#fde047]" style={{ animationDelay: `${0.5 + i * 0.12}s` }}>★</span>)}
            </div>
          </>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-1/2 top-[300px] h-0 w-0">
          <GodRays size={620} intensity={1.1} color={rayColor} />
          <Shockwave size={500} color={`rgba(${rayColor},.9)`} />
          <Shockwave size={360} delay={0.15} />
          <Flare width={500} color={rayColor} />
          <Burst count={18} distance={230} />
          <Burst count={12} distance={140} shape="dot" size={8} colors={["#a970ff", "#fff", "#7cf8ff"]} delay={0.05} />
          <Confetti count={40} />
        </div>
      )}

      {(taps >= 2 || charging) && !isOpen && (
        <div className="absolute left-1/2 top-[345px] h-0 w-0 transition-opacity" style={{ opacity: charging ? 0.9 : 0.45 }}>
          <GodRays size={charging ? 420 : 280} intensity={charging ? 1 : 0.6} color={rayColor} core={false} />
        </div>
      )}

      <div className="absolute left-1/2 top-[300px] w-[200px] -translate-x-1/2">
        {isOpen && <div className="beam-up pointer-events-none absolute bottom-[110px] left-1/2 h-[520px] w-[150px] bg-gradient-to-t from-white via-amber-100/60 to-transparent blur-md" />}

        {isOpen && (
          <div className="absolute left-1/2 top-[30px] z-20 h-[120px] w-[200px] -translate-x-1/2">
            <div className="weapon-rise h-full w-full">
              <div className="float relative h-full w-full">
                <WeaponArt id={weapon.id} silhouette className="h-full w-full" />
                <span className="absolute inset-0 flex items-center justify-center pl-4 text-4xl font-bold text-white/90 drop-shadow-[0_0_10px_#7cf8ff]" style={{ transform: "rotate(35deg)" }}>?</span>
              </div>
            </div>
            <SparkleField count={8} spread={1.6} delay={0.8} />
          </div>
        )}

        <div className={`relative z-10 ${anim}`} style={{ transformOrigin: "50% 100%", animationDuration: anim === "wobble" ? `${0.6 - taps * 0.1}s` : anim === "violent" ? ".3s" : undefined }}>
          <div ref={punchRef} style={{ transformOrigin: "50% 100%" }}>
            <div className={isOpen ? "box-sink" : ""} style={{ animationDelay: isOpen ? ".2s" : undefined }}>
              <div className={`relative z-20 h-[96px] w-[200px] ${isOpen ? "lid-fly" : ""}`}>
                <GiftBoxLid />
              </div>
              {!isOpen && (
                <div className={`pointer-events-none absolute left-1/2 top-[84px] z-30 h-[14px] w-[176px] -translate-x-1/2 rounded-full ${seam > 0 ? "seam-pulse" : ""}`}
                  style={{ opacity: seam, background: "linear-gradient(90deg, transparent, #fff8d0 15%, #ffffff 50%, #fff8d0 85%, transparent)", boxShadow: `0 0 ${16 + seam * 22}px ${6 + seam * 8}px rgba(${rayColor},${0.55 * seam})`, transition: "opacity .25s" }} />
              )}
              <div className="relative z-10 mx-auto -mt-2 h-[132px] w-[180px]">
                <GiftBoxBody />
                {seam > 0 && !isOpen && <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-amber-100/40 to-transparent mix-blend-screen" style={{ opacity: seam * 0.5 }} />}
              </div>
            </div>
          </div>
        </div>
        <div className={`mx-auto mt-2 h-4 w-40 rounded-full bg-black/45 blur-sm ${isOpen ? "box-sink" : ""}`} />
      </div>

      {taps > 0 && !isOpen && (
        <div key={`t${taps}`} className="pointer-events-none absolute left-1/2 top-[380px] h-0 w-0">
          <Burst count={7 + taps * 3} distance={100 + taps * 25} shape="star" size={11} />
        </div>
      )}

      {isOpen && <div className="flash pointer-events-none absolute inset-0 bg-white" />}

      <div className="absolute inset-x-0 bottom-[56px] flex flex-col items-center gap-3">
        {state === "ready" && (
          <>
            <div className="flex gap-2.5">
              {Array.from({ length: TAPS }).map((_, i) => (
                <span key={i} className={`h-3.5 w-3.5 rounded-full border-2 border-amber-300 transition-all duration-200 ${i < taps ? "scale-125 bg-amber-300 shadow-[0_0_10px_#fcd34d]" : "bg-transparent"}`} />
              ))}
            </div>
            <p key={taps} className="pop-in tap-hint txt-3d text-2xl font-bold text-white">
              {taps === 0 ? "TAP UNTUK MEMBUKA!" : taps === 1 ? "TAP LAGI!" : "SATU LAGI!!"}
            </p>
          </>
        )}
        {showInfo && (
          <div className="pop-in">
            <GreenButton onClick={() => { sfx.click(); onDone(); }}>LANJUT ➜</GreenButton>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- CONTINUE? ---------------- */
const COUNT = 10;
export function ContinueScreen({ weapon, onWatchAd, onTimeout }: { weapon: WeaponDef; onWatchAd: () => void; onTimeout: () => void }) {
  const [n, setN] = useState(COUNT);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    if (n <= 0) { onTimeout(); return; }
    if (n < COUNT) sfx.tick(n <= 3);
    if (n <= 3) vibrate(8);
    const t = setTimeout(() => setN((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [n, onTimeout]);

  useEffect(() => {
    const t = setTimeout(() => setShowSkip(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const R = 112, C = 2 * Math.PI * R;
  const urgent = n <= 3;
  const ringColor = urgent ? "#f87171" : "#fbbf24";

  return (
    <div className="fade-in absolute inset-0">
      <Dust />
      <div className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${urgent ? "opacity-100" : "opacity-0"}`} style={{ boxShadow: "inset 0 0 90px rgba(248,113,113,.3)" }} />
      <div className="absolute inset-x-0 top-4 flex justify-center"><StageDots /></div>

      <div className="absolute inset-x-0 top-[86px] text-center">
        <div key={n} className={`count-pulse text-[92px] font-bold leading-none tabular-nums ${urgent ? "text-red-400" : "text-amber-400"}`}
          style={{ textShadow: urgent ? "0 4px 0 #8b1d1d, 0 0 30px rgba(248,113,113,.6)" : "0 4px 0 #9a5b00, 0 0 30px rgba(255,190,60,.5)" }}>{n}</div>
        <div className="txt-3d mt-1 text-[38px] font-bold leading-none text-white">CONTINUE?</div>
      </div>

      <div className="absolute left-1/2 top-[405px] h-[270px] w-[270px] -translate-x-1/2 -translate-y-1/2">
        <div className="absolute left-1/2 top-1/2 h-0 w-0"><GodRays size={460} color={RARITY_RGB[weapon.rarity]} intensity={0.85} /></div>
        <svg viewBox="0 0 270 270" className="absolute inset-0 overflow-visible">
          <defs>
            <filter id="ringglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <g className="spin-cw" style={{ transformOrigin: "135px 135px" }}>
            <circle cx="135" cy="135" r="96" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeDasharray="12 10" strokeLinecap="round" opacity="0.85" />
          </g>
          <circle cx="135" cy="135" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
          <circle cx="135" cy="135" r={R} fill="none" stroke={ringColor} strokeWidth="7" strokeLinecap="round" filter="url(#ringglow)"
            strokeDasharray={C} strokeDashoffset={C * (1 - n / COUNT)} transform="rotate(-90 135 135)"
            style={{ transition: "stroke-dashoffset 1s linear, stroke .3s" }} />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center ${urgent ? "heartbeat" : ""}`}>
          <div className="float relative">
            <WeaponArt id={weapon.id} silhouette className="h-[120px] w-[190px] -rotate-[20deg]" />
            <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white drop-shadow-[0_0_10px_#7cf8ff]">?</span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-[26px] flex justify-center"><RarityBadge rarity={weapon.rarity} size="sm" /></div>
        <SparkleField count={6} spread={1.1} />
      </div>

      <div className="absolute inset-x-0 bottom-[52px] flex flex-col items-center gap-3">
        <GreenButton onClick={() => { sfx.click(); onWatchAd(); }} className="px-10 py-3.5">
          <span className="flex h-7 w-9 items-center justify-center rounded-md bg-yellow-300 shadow-inner">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-emerald-700"><path d="M7 4l13 8-13 8z" /></svg>
          </span>
          CONTINUE
        </GreenButton>
        <p className="text-sm text-white/60">Tonton iklan untuk membuka senjata boss</p>
        <button onClick={() => { sfx.click(); onTimeout(); }} className={`text-base font-medium text-white/50 transition-opacity duration-500 hover:text-white/80 ${showSkip ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          Tidak, terima kasih
        </button>
      </div>
    </div>
  );
}

/* ---------------- FAKE AD ---------------- */
const AD_LEN = 5;
export function AdScreen({ onDone }: { onDone: () => void }) {
  const [t, setT] = useState(AD_LEN);
  useEffect(() => {
    if (t <= 0) return;
    const id = setTimeout(() => setT((v) => v - 1), 1000);
    return () => clearTimeout(id);
  }, [t]);
  return (
    <div className="fade-in absolute inset-0 z-30 flex flex-col overflow-hidden bg-gradient-to-br from-fuchsia-600 via-purple-700 to-indigo-900">
      <div className="absolute left-1/2 top-[45%] h-0 w-0 opacity-60"><GodRays size={600} color="255,200,255" intensity={0.6} /></div>
      <div className="relative flex items-center justify-between p-4 text-sm text-white/90">
        <span className="rounded-md bg-black/30 px-2 py-0.5 font-bold">IKLAN</span>
        {t > 0 ? (
          <span className="rounded-full bg-black/30 px-3 py-1">Hadiah dalam {t}s</span>
        ) : (
          <button onClick={() => { sfx.click(); onDone(); }} className="pop-in flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl font-bold text-black shadow-lg">✕</button>
        )}
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center gap-4 text-center text-white">
        <div className="float text-8xl drop-shadow-2xl">🍕</div>
        <h3 className="txt-3d text-4xl font-bold">PIZZA RUSH 3D</h3>
        <p className="max-w-[240px] text-white/85">Game paling seru tahun ini! Download gratis sekarang.</p>
        <span className="btn-breathe rounded-full bg-yellow-300 px-8 py-2.5 text-lg font-bold text-purple-900 shadow-lg">INSTALL</span>
      </div>
      <div className="relative h-1.5 bg-black/30">
        <div className="h-full bg-yellow-300" style={{ width: `${((AD_LEN - t) / AD_LEN) * 100}%`, transition: "width 1s linear" }} />
      </div>
    </div>
  );
}

/* ---------------- REWARD POPUP — PREMIUM v2, teks besar semua ---------------- */
export function RewardScreen({ weapon, equipped, onEquip, onClose, onReplay, bossId = "cheese", bossName = BOSS, level, score }: { weapon: WeaponDef; equipped: boolean; onEquip: () => void; onClose: () => void; onReplay: () => void; bossId?: BossId; bossName?: string; level?: number; score?: number }) {
  const [revealed, setRevealed] = useState(false);
  const [equipFx, setEquipFx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const st = RARITY_STYLE[weapon.rarity];
  const ray = RARITY_RGB[weapon.rarity];

  useEffect(() => {
    sfx.whoosh();
    const t = setTimeout(() => {
      setRevealed(true);
      sfx.reveal();
      vibrate(15);
      shakeEl(wrapRef.current, 3, 250);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  const equip = useCallback(() => {
    if (equipped) return;
    onEquip();
    setEquipFx((k) => k + 1);
    sfx.equip();
    vibrate(15);
  }, [equipped, onEquip]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Hud score={score ?? 46} level={level} />
      <div className="absolute left-1/2 top-[205px] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 opacity-50">
        <BossTarget id={bossId} />
      </div>
      <div className="fade-in absolute inset-0 bg-black/70 backdrop-blur-[3px]" />

      <div className="panel-in absolute left-1/2 top-[104px] w-[92%] max-w-[350px]">
        {/* animated rarity frame */}
        <div className="anim-border-flow rounded-[28px] p-[3px] shadow-[0_24px_70px_rgba(0,0,0,.6)]" style={{ backgroundImage: `linear-gradient(135deg, ${st.color}, #ffffff88, ${st.color}, #0b1e22)` }}>
          <div className="premium-panel relative overflow-hidden rounded-[25px] px-4 pb-4 pt-4 text-center">
            {/* top gloss */}
            <div className="pointer-events-none absolute inset-x-6 top-1.5 h-10 rounded-full bg-white/15 blur-[1px]" />
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[25px]">
              <span className="shimmer-x pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>
            <div className="absolute left-1/2 top-[196px] h-0 w-0">
              {revealed && <GodRays size={500} intensity={1.15} color={ray} />}
            </div>

            {/* ribbon */}
            <div className="relative mb-1 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-4 py-1 text-[13px] font-black tracking-[0.22em] text-amber-200">
                ★ BOSS LOOT ★
              </span>
            </div>
            <h2 className="title-float relative text-[36px] font-black leading-[0.95] text-emerald-300" style={{ textShadow: "0 4px 0 #0a3d28, 0 0 28px rgba(74,222,128,.55)" }}>
              <LetterPop text={bossName} delay={0.25} /><br /><LetterPop text="DEFEATED!" delay={0.45} />
            </h2>

            {/* weapon stage */}
            <div className="relative mx-auto mt-1 h-[196px] w-full max-w-[300px]">
              {/* podium */}
              <div className="absolute bottom-[8px] left-1/2 h-[30px] w-[240px] -translate-x-1/2 rounded-[50%] bg-gradient-to-b from-[#bff0ff] via-[#4d9db3] to-[#17454f] shadow-[0_12px_28px_rgba(0,0,0,.55)]" />
              <div className="absolute bottom-[2px] left-1/2 h-[12px] w-[260px] -translate-x-1/2 rounded-[50%] bg-black/50 blur-[4px]" />
              <div className="absolute inset-0 flex items-start justify-center pt-2">
                <div className="float">
                  <div key={equipFx} className={equipFx ? "equip-spin" : ""}>
                    <div className="relative h-[132px] w-[236px] -rotate-[8deg]">
                      {!revealed ? (
                        <WeaponArt id={weapon.id} silhouette className="fade-in h-full w-full" />
                      ) : (
                        <div className="reveal-pop relative h-full w-full">
                          <ShinyWeapon id={weapon.id} className="h-full w-full" glow={st.glow} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {revealed && (
                <div className="absolute left-1/2 top-[46%] h-0 w-0">
                  <Shockwave size={360} color={`rgba(${ray},.95)`} />
                  <Shockwave size={260} delay={0.12} color="rgba(255,255,255,.85)" />
                  <Flare width={360} color={ray} />
                  <Burst count={18} distance={175} />
                  <Confetti count={30} />
                </div>
              )}
              {equipFx > 0 && (
                <div key={`e${equipFx}`} className="absolute left-1/2 top-[46%] h-0 w-0">
                  <Shockwave size={300} color="rgba(74,222,128,.95)" />
                  <Burst count={16} distance={150} colors={["#4ade80", "#bbf7d0", "#fff", "#fde047"]} />
                </div>
              )}
              {revealed && <SparkleField count={9} spread={1.25} />}
              {!revealed && (
                <p className="absolute inset-x-0 bottom-[34px] animate-pulse text-center text-[14px] font-bold text-white/70">Membuka segel...</p>
              )}
            </div>

            {/* info */}
            <div className="relative mt-1 min-h-[118px]">
              {revealed ? (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <RarityBadge rarity={weapon.rarity} size="md" />
                    <PowerPill power={weapon.power} />
                  </div>
                  <p className="txt-3d mt-2 text-[26px] font-black leading-none text-white">{weapon.name}</p>
                  <p className="mx-auto mt-1.5 max-w-[280px] text-[14px] font-medium leading-snug text-white/85">{weapon.desc}</p>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="h-[2px] w-10 rounded-full" style={{ background: st.color }} />
                    <p className="text-[16px] font-black tracking-[0.12em]" style={{ color: st.text, textShadow: `0 0 14px ${st.glow}` }}>BOSS WEAPON UNLOCKED!</p>
                    <span className="h-[2px] w-10 rounded-full" style={{ background: st.color }} />
                  </div>
                  {/* power bar */}
                  <div className="mx-auto mt-2 max-w-[260px]">
                    <div className="flex justify-between text-[12px] font-black tracking-widest text-white/60"><span>POWER</span><span className="text-amber-300">{weapon.power}/100</span></div>
                    <div className="mt-1 h-2.5 overflow-hidden rounded-full border border-white/20 bg-black/50">
                      <div className="progress-shine h-full rounded-full" style={{ width: `${weapon.power}%`, background: `linear-gradient(90deg, ${st.color}88, ${st.color})`, boxShadow: `0 0 10px ${st.glow}` }} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 pt-4">
                  <div className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="pop-in h-3 w-3 rounded-full bg-white/70" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
                  <p className="text-[14px] font-bold text-white/60">Siap-siap...</p>
                </div>
              )}
            </div>

            <div className="relative mt-2 flex min-h-[76px] flex-col items-center justify-start gap-2">
              {revealed && (!equipped ? (
                <div className="fade-up w-full" style={{ animationDelay: ".7s" }}>
                  <GreenButton onClick={equip} className="w-full px-10 py-3.5 text-[22px]">⚡ EQUIP SEKARANG</GreenButton>
                  <button onClick={() => { sfx.click(); onReplay(); }} className="mt-2 text-[14px] font-bold text-white/75 underline underline-offset-4">Main lagi</button>
                </div>
              ) : (
                <div className="flex w-full flex-col items-center gap-2">
                  <span className="pop-in flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-emerald-300 bg-emerald-900/60 px-6 py-3 text-[20px] font-black text-emerald-200 shadow-[0_0_28px_rgba(74,222,128,.45)]">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-[16px] font-black text-emerald-950">✓</span> EQUIPPED!
                  </span>
                  <div className="flex w-full gap-2">
                    <button onClick={() => { sfx.click(); onReplay(); }} className="flex-1 rounded-xl border-b-4 border-amber-800 bg-gradient-to-b from-[#ffe27a] to-[#e89b00] py-2.5 text-[16px] font-black text-[#4a2c00] active:translate-y-0.5">MAIN LAGI</button>
                    <button onClick={() => { sfx.click(); onClose(); }} className="flex-1 rounded-xl border-b-4 border-white/20 bg-white/10 py-2.5 text-[16px] font-black text-white active:translate-y-0.5">KOLEKSI</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NEW badge */}
        {revealed && (
          <div className="pop-in absolute -left-2 top-6 z-10 -rotate-[14deg] rounded-lg border-2 border-white bg-gradient-to-b from-[#ff6b6b] to-[#c81e1e] px-3 py-1 text-[14px] font-black tracking-widest text-white shadow-lg" style={{ animationDelay: ".6s" }}>NEW!</div>
        )}
        <button onClick={() => { sfx.click(); onClose(); }} className="pop-in absolute -right-2 -top-2 z-10 flex h-[52px] w-[52px] items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-b from-[#6ef59a] to-[#149a4a] text-[26px] font-black text-white shadow-[0_8px_20px_rgba(0,0,0,.5)] active:scale-90" style={{ animationDelay: ".4s" }}>✕</button>
      </div>
    </div>
  );
}

export { ArmoryScreen } from "./Armory";

/* ---------------- ACHIEVEMENT ---------------- */
export function AchievementScreen({
  stats, ownedCount, claimed, milestonesClaimed, onClaim, onClaimMilestone, onClose,
}: {
  stats: Stats; ownedCount: number; claimed: string[];
  milestonesClaimed: number[]; onClaim: (id: string) => void; onClaimMilestone: (count: number) => void; onClose: () => void;
}) {
  const [cat, setCat] = useState<"daily" | "skill">("daily");
  const completed = ACHIEVEMENTS.filter((a) => {
    const p = Math.min(a.progress(stats, ownedCount), a.target);
    return p >= a.target;
  }).length;
  const list = ACHIEVEMENTS.filter((a) => a.category === cat);

  return (
    <div className="fade-in absolute inset-0 z-20 flex flex-col bg-gradient-to-b from-[#163f47] via-[#0e2a30] to-[#070f12]">
      {/* header */}
      <div className="flex items-center gap-2.5 px-3 pt-3">
        <button onClick={() => { sfx.click(); onClose(); }} className="flex h-12 w-[52px] shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#9a4a00] bg-gradient-to-b from-[#ff9a3d] to-[#ef5f00] text-[26px] font-black text-white shadow-lg active:translate-y-0.5 active:border-b-2">↩</button>
        <div className="flex-1">
          <h2 className="txt-glow-gold text-[24px] font-black leading-none tracking-wide text-amber-300">🏆 ACHIEVEMENT</h2>
          <p className="mt-1 text-[13px] font-bold text-white/65">{completed}/{ACHIEVEMENTS.length} selesai · klaim semua bonus!</p>
        </div>
        <div className="rounded-2xl border-2 border-amber-300/40 bg-black/50 px-3.5 py-2 text-center shadow-[0_0_16px_rgba(251,191,36,.25)]">
          <p className="text-[22px] font-black leading-none text-amber-300">{completed}</p>
          <p className="mt-0.5 text-[12px] font-black tracking-[0.18em] text-white/60">SELESAI</p>
        </div>
      </div>

      {/* milestone premium */}
      <div className="anim-border-flow mx-3 mt-2.5 rounded-[20px] p-[2px]" style={{ backgroundImage: "linear-gradient(135deg,#9aa7b2,#38bdf8,#fbbf24,#fb7185)" }}>
        <div className="rounded-[18px] bg-[#0a1a1f]/95 p-2.5">
          <p className="mb-1.5 text-center text-[13px] font-black tracking-[0.2em] text-amber-200">🎁 BONUS MILESTONE WEAPON 🎁</p>
          <div className="relative mb-2 h-2.5 rounded-full border border-white/15 bg-black/60">
            <div className="progress-shine h-full rounded-full bg-gradient-to-r from-slate-300 via-sky-400 via-violet-400 to-amber-400 transition-all" style={{ width: `${Math.min(100, (completed / 20) * 100)}%`, boxShadow: "0 0 12px rgba(251,191,36,.5)" }} />
            <div className="absolute -top-[5px] flex w-full justify-between px-1">
              {[5, 10, 20].map((v) => (
                <span key={v} className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-[12px] font-black ${completed >= v ? "border-amber-300 bg-amber-400 text-black" : "border-white/25 bg-black text-white/50"}`}>✓</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MILESTONES.map((m) => {
              const reached = completed >= m.count;
              const taken = milestonesClaimed.includes(m.count);
              const st = RARITY_STYLE[m.rarity];
              return (
                <div key={m.count} className={`card-in rounded-2xl border-[2.5px] p-2 text-center ${reached && !taken ? "glow-breathe" : ""}`} style={{ borderColor: st.color, background: st.bg, boxShadow: reached ? `0 0 18px ${st.glow}` : undefined }}>
                  <p className="text-[26px] leading-none drop-shadow">{m.count === 5 ? "🎁" : m.count === 10 ? "💎" : "👑"}</p>
                  <p className="mt-1 text-[14px] font-black leading-none text-white">{m.label}</p>
                  <p className="mt-1 min-h-[30px] text-[12px] font-bold leading-tight" style={{ color: st.text }}>{m.desc}</p>
                  {taken ? (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-emerald-300/50 bg-emerald-500/20 px-3 py-1.5 text-[12px] font-black text-emerald-200">✓ DIKLAIM</span>
                  ) : reached ? (
                    <button onClick={() => onClaimMilestone(m.count)} className="btn-breathe mt-1.5 w-full rounded-xl border-b-4 border-[#7a4a00] bg-gradient-to-b from-[#ffe27a] to-[#dd8d00] px-2 py-2 text-[14px] font-black text-[#4a2c00] active:translate-y-0.5">🎉 KLAIM!</button>
                  ) : (
                    <span className="mt-1.5 inline-block rounded-full bg-black/45 px-3 py-1.5 text-[12px] font-black text-white/60">{completed}/{m.count}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* tabs besar */}
      <div className="mx-3 mt-2.5 flex gap-2">
        {(["daily", "skill"] as const).map((c) => (
          <button key={c} onClick={() => { sfx.click(); setCat(c); }}
            className={`flex-1 rounded-2xl border-b-[5px] py-3 text-[17px] font-black tracking-wider transition active:translate-y-0.5 ${cat === c ? "border-black/30 bg-gradient-to-b from-[#ffe27a] to-[#dd8d00] text-[#4a2c00] shadow-[0_8px_22px_rgba(251,191,36,.35)]" : "border-white/10 bg-white/10 text-white/60"}`}>
            {c === "daily" ? "📅 DAILY" : "⚔️ SKILL"}
          </button>
        ))}
      </div>

      {/* list lega */}
      <div className="thin-scroll mx-3 mb-3 mt-2 flex flex-1 flex-col gap-2.5 overflow-y-auto rounded-[20px] border border-white/10 bg-[#081417]/90 p-2.5">
        {list.map((a, idx) => {
          const raw = a.progress(stats, ownedCount);
          const prog = Math.min(raw, a.target);
          const done = prog >= a.target;
          const taken = claimed.includes(a.id);
          const pct = Math.round((prog / a.target) * 100);
          return (
            <div key={a.id} className={`card-in flex items-center gap-3 rounded-2xl border-[2px] p-2.5 ${done && !taken ? "border-amber-300 bg-gradient-to-r from-amber-400/15 to-amber-400/5 shadow-[0_0_18px_rgba(251,191,36,.25)]" : taken ? "border-emerald-400/30 bg-white/[.03]" : "glass-row"}`} style={{ animationDelay: `${Math.min(idx, 6) * 0.05}s` }}>
              <span className={`flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-2xl border-2 text-[30px] shadow-inner ${done ? "border-amber-300/50 bg-gradient-to-b from-amber-300/25 to-amber-600/20" : "border-white/15 bg-gradient-to-b from-white/15 to-white/5"}`}>{a.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-black leading-tight text-white">{a.title}</p>
                <p className="mt-0.5 text-[13px] font-medium leading-snug text-white/70">{a.desc}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-[10px] flex-1 overflow-hidden rounded-full border border-white/15 bg-black/55">
                    <div className={`h-full rounded-full ${done ? "bg-gradient-to-r from-emerald-500 to-emerald-300" : "bg-gradient-to-r from-sky-500 to-cyan-300"}`} style={{ width: `${pct}%`, boxShadow: done ? "0 0 10px rgba(52,211,153,.6)" : "0 0 10px rgba(56,189,248,.5)" }} />
                  </div>
                  <span className="min-w-[44px] text-right text-[12px] font-black tabular-nums text-white/70">{prog}/{a.target}</span>
                </div>
              </div>
              {taken ? (
                <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border-2 border-emerald-300/50 bg-emerald-500/15 text-[22px] font-black text-emerald-300">✓</span>
              ) : done ? (
                <button onClick={() => onClaim(a.id)} className="btn-breathe flex h-[62px] w-[74px] shrink-0 flex-col items-center justify-center rounded-2xl border-b-4 border-[#7a4a00] bg-gradient-to-b from-[#ffe27a] to-[#dd8d00] text-[#4a2c00] shadow-lg active:translate-y-0.5">
                  <span className="text-[14px] font-black leading-none">+{a.coins}</span>
                  <span className="text-[13px] leading-none">💵</span>
                  <span className="mt-0.5 rounded bg-black/20 px-2 py-0.5 text-[12px] font-black tracking-widest">KLAIM</span>
                </button>
              ) : (
                <span className="flex h-[52px] w-[60px] shrink-0 flex-col items-center justify-center rounded-2xl bg-black/40 text-white/55">
                  <span className="text-[13px] font-black">+{a.coins}</span>
                  <span className="text-[13px]">💵</span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- SKIPPED ---------------- */
export function SkippedScreen({ onReplay }: { onReplay: () => void }) {
  return (
    <div className="fade-in absolute inset-0 flex flex-col items-center justify-center gap-5 text-center">
      <Dust />
      <h2 className="txt-3d text-4xl font-bold text-white"><LetterPop text="WAKTU HABIS" /></h2>
      <p className="text-white/60">Senjata boss tidak berhasil dibuka.</p>
      <GreenButton color="gold" onClick={() => { sfx.click(); onReplay(); }}>COBA LAGI</GreenButton>
    </div>
  );
}
