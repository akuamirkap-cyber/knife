import { useEffect, useRef, useState } from "react";
import { Knife } from "./Art";
import { BOSSES, BossTarget, type BossId } from "./Bosses";
import { Burst, Confetti, Dust, GodRays, Shockwave, SparkleField } from "./Effects";
import { WeaponArt, getWeaponStats, type WeaponDef } from "../weapons";
import { destroyHP } from "../stages";
import { sfx, vibrate } from "../sfx";
import { useSlideActive } from "../../shared/SlideActivity";

type CSSVars = React.CSSProperties & Record<string, string | number>;

/* Auto-lanjut mulus tanpa panel/tombol: langsung panggil onComplete setelah delay singkat */
function AutoNext({ onComplete, delay = 800 }: { onComplete: () => void; delay?: number }) {
  const active = useSlideActive();
  const ref = useRef(onComplete);
  ref.current = onComplete;
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => ref.current(), delay);
    return () => clearTimeout(t);
  }, [delay, active]);
  return null;
}

/* ================= KOIN MENGKILAP (blink + kilau jalan) ================= */
export function Coin({ size = 30 }: { size?: number }) {
  return (
    <div className="coin-spin" style={{ width: size, height: size }}>
      <div
        className="coin-blink relative h-full w-full overflow-hidden rounded-full border-2 border-[#8a5a00]"
        style={{
          background: "radial-gradient(circle at 35% 28%, #fff9c9 0%, #ffe36e 30%, #f5b301 58%, #c07c00 82%, #8a5200 100%)",
          boxShadow: "0 0 12px rgba(255,210,60,.85), inset 0 -3px 6px rgba(140,80,0,.55), inset 0 2px 3px rgba(255,255,255,.75)",
        }}
      >
        <span className="absolute inset-0 flex items-center justify-center text-[60%] font-black text-[#8a5200]" style={{ fontSize: size * 0.52 }}>
          $
        </span>
        <span className="coin-shine-move absolute inset-y-[-20%] left-0 w-1/3 bg-gradient-to-r from-transparent via-white/90 to-transparent" />
        <span className="absolute left-[18%] top-[10%] h-[22%] w-[22%] rounded-full bg-white/90 blur-[1px]" />
      </div>
    </div>
  );
}

/* ================= STAGE BONUS — putar SATU ARAH, koin merata ================= */
const BONUS_COINS = 10;
const BONUS_KNIVES = 6;
const BONUS_SPEED = 105; // derajat/detik, nyaman

export function BonusStageScreen({
  direction = "cw",
  onComplete,
  onThrow,
  onFail,
  onQuit,
  level = 3,
  coins = 0,
  initialStuck,
}: {
  direction?: "cw" | "ccw";
  onComplete: (coins: number) => void;
  onThrow?: () => void;
  onFail?: (stuck: number[]) => void;
  onQuit?: () => void;
  level?: number;
  coins?: number;
  initialStuck?: number[];
}) {
  const active = useSlideActive();
  const wrapRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const rot = useRef(Math.random() * 360);
  const dirRef = useRef(direction === "ccw" ? -1 : 1);
  const [dir, setDir] = useState<"cw" | "ccw">(direction);
  const [taken, setTaken] = useState<boolean[]>(Array(BONUS_COINS).fill(false));
  const [stuck, setStuck] = useState<number[]>(initialStuck ?? []);
  const [throwing, setThrowing] = useState(false);
  const [earned, setEarned] = useState(0);
  const [done, setDone] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const doneRef = useRef(false);
  const stuckRef = useRef<number[]>(initialStuck ?? []);
  stuckRef.current = stuck;

  const LOG_R = 88;
  const WHEEL_Y = 262;
  const KNIFE_Y = 566;

  useEffect(() => {
    dirRef.current = dir === "ccw" ? -1 : 1;
  }, [dir ]);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      rot.current = (rot.current + dirRef.current * BONUS_SPEED * dt) % 360;
      if (wheelRef.current) wheelRef.current.style.transform = `rotate(${rot.current}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const norm = (a: number) => {
    let x = a % 360;
    if (x > 180) x -= 360;
    if (x < -180) x += 360;
    return x;
  };

  const angDiff = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180);

  const throwKnife = () => {
    if (throwing || done || crashed || stuckRef.current.length >= BONUS_KNIVES) return;
    setThrowing(true);
    sfx.throw();
    onThrow?.();
    setTimeout(() => {
      const land = -rot.current;
      // Pisau kena pisau = gagal (koin bukan penghalang)
      if (stuckRef.current.some((a) => angDiff(a, land) < 17)) {
        setThrowing(false);
        setCrashed(true);
        sfx.break();
        vibrate([30, 40, 60]);
        wrapRef.current?.animate(
          [{ transform: "translate(0,0)" }, { transform: "translate(-9px,4px)" }, { transform: "translate(9px,-4px)" }, { transform: "translate(0,0)" }],
          { duration: 420, easing: "ease-out" }
        );
        setTimeout(() => onFail?.([...stuckRef.current]), 1150);
        return;
      }
      const next = [...stuckRef.current, land];
      setStuck(next);
      setThrowing(false);
      // cek koin terdekat dari titik atas (sudut dunia 0)
      let best = -1;
      let bestDiff = 999;
      for (let i = 0; i < BONUS_COINS; i++) {
        if (taken[i]) continue;
        const world = rot.current + i * (360 / BONUS_COINS);
        const d = Math.abs(norm(world));
        if (d < bestDiff) {
          bestDiff = d;
          best = i;
        }
      }
      if (best >= 0 && bestDiff <= 19) {
        const nt = [...taken];
        nt[best] = true;
        setTaken(nt);
        setEarned((e) => e + 1);
        sfx.coin();
        vibrate(12);
      } else {
        sfx.hit();
        vibrate(8);
      }
      if (next.length >= BONUS_KNIVES && !doneRef.current) {
        doneRef.current = true;
        setDone(true);
        sfx.reveal();
      }
    }, 85);
  };

  const remaining = BONUS_KNIVES - stuck.length;

  return (
    <div ref={wrapRef} className="absolute inset-0 cursor-pointer overflow-hidden" onPointerDown={throwKnife}>
      <Dust />
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
          <span className="rounded-full border border-amber-300/40 bg-black/50 px-3 py-1.5 text-[15px] font-black tabular-nums text-amber-300">
            🪙 {earned}
          </span>
          <div className="flex min-w-0 flex-1 flex-col items-center">
            <span className="txt-glow-gold text-[19px] font-black leading-none tracking-wider text-amber-400">
              LEVEL {level} 🎡
            </span>
            <span className="mt-1 text-[12px] font-bold tracking-[0.16em] text-white/55">BONUS · 1 ARAH</span>
          </div>
          <span className="rounded-full border border-white/15 bg-black/55 px-2.5 py-1.5 text-[14px] font-black tabular-nums text-white">
            💵 {coins.toLocaleString("id-ID")}
          </span>
        </div>
      </div>
      {crashed && (
        <>
          <div className="flash pointer-events-none absolute inset-0 bg-red-500/70" />
          <div className="absolute inset-x-0 top-[360px] z-10 text-center">
            <p className="pop-in text-[32px] font-black text-red-300" style={{ textShadow: "0 3px 0 #7f1d1d" }}>
              BERTABRAKAN!
            </p>
            <p className="mt-1 text-[14px] font-bold text-white/85">Pisau kena pisau…</p>
          </div>
        </>
      )}

      {/* toggle arah */}
      <div className="absolute inset-x-0 top-[104px] z-10 flex justify-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
        {(["ccw", "cw"] as const).map((d) => (
          <button
            key={d}
            onClick={() => {
              sfx.click();
              setDir(d);
            }}
            className={`rounded-full px-4 py-1.5 text-[13px] font-black tracking-wider transition ${
              dir === d ? "bg-amber-400 text-black shadow-[0_0_14px_rgba(251,191,36,.55)]" : "bg-white/10 text-white/70"
            }`}
          >
            {d === "ccw" ? "◀ KIRI" : "KANAN ▶"}
          </button>
        ))}
      </div>

      <div className="absolute left-1/2" style={{ top: WHEEL_Y, width: LOG_R * 2, height: LOG_R * 2, marginLeft: -LOG_R, marginTop: -LOG_R }}>
        <div className="absolute inset-[-120px]">
          <GodRays size={420} intensity={0.7} color="255,220,140" />
        </div>
        <div ref={wheelRef} className="absolute inset-0">
          {/* lingkaran emas */}
          <div className="absolute inset-0 rounded-full border-[6px] border-[#c98a1c] bg-[radial-gradient(circle_at_35%_30%,#fff3c0_0%,#ffd75e_40%,#e8a51f_75%,#a86a00_100%)] shadow-[0_0_44px_rgba(255,200,60,.4),inset_0_-8px_18px_rgba(140,80,0,.4)]" />
          {stuck.map((a, i) => (
            <div key={i} className="absolute left-1/2 top-1/2 h-0 w-0" style={{ transform: `rotate(${a}deg)` }}>
              <Knife className="absolute h-[76px] w-[19px]" style={{ left: -9.5, top: LOG_R - 26 }} />
            </div>
          ))}
          {/* koin merata di semua sisi */}
          {Array.from({ length: BONUS_COINS }).map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 h-0 w-0 transition-all duration-300"
              style={{ transform: `rotate(${i * (360 / BONUS_COINS)}deg)`, opacity: taken[i] ? 0 : 1 }}
            >
              <div className="absolute" style={{ left: -14, top: -LOG_R - 2 }}>
                <Coin size={28} />
              </div>
            </div>
          ))}
        </div>
        {/* penanda arah putar */}
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/45 px-3 py-1 text-[12px] font-black tracking-widest text-white/75">
          {dir === "cw" ? "PUTAR KE KANAN ↻" : "PUTAR KE KIRI ↺"}
        </div>
      </div>

      {done && <AutoNext onComplete={() => onComplete(earned)} delay={850} />}

      {!done && remaining > 0 && (
        <div
          className="absolute left-1/2"
          style={{
            top: KNIFE_Y,
            marginLeft: -11,
            transform: throwing ? `translateY(${-(KNIFE_Y - (WHEEL_Y + LOG_R - 26))}px)` : "translateY(0)",
            transition: throwing ? "transform 85ms linear" : "none",
          }}
        >
          <Knife key={stuck.length} className="h-[84px] w-[22px]" />
        </div>
      )}

      <div className="absolute bottom-6 left-5 flex flex-col-reverse gap-1.5">
        {Array.from({ length: BONUS_KNIVES }).map((_, i) => (
          <Knife key={i} className={`h-7 w-3 rotate-45 transition-all duration-300 ${i < remaining ? "opacity-100" : "opacity-15 grayscale"}`} />
        ))}
      </div>
      {stuck.length === 0 && !done && (
        <p className="pointer-events-none absolute inset-x-0 bottom-32 animate-pulse text-center text-[14px] font-bold text-white/70">
          Tap untuk melempar · kena koin = +1 🪙
        </p>
      )}
    </div>
  );
}

/* ================= STAGE HARTA KARUN — 10 DETIK, PETI TERBUKA, 1 BINTANG BONUS ================= */
interface FlyCoin {
  id: number;
  dx: number;
  dy: number;
  tx: number;
  ty: number;
  collecting: boolean;
  size: number;
}
interface Bullet {
  id: number;
  off: number;
  scale: number;
}

const TREASURE_TIME = 10;

type BuffKind = "rapid" | "double" | "mini" | "big";
const BUFF_DEFS: Record<BuffKind, { icon: string; name: string; desc: string; color: string }> = {
  rapid: { icon: "⚡", name: "TEMBAK 2X CEPAT", desc: "Jeda tembak separuh!", color: "#4ade80" },
  double: { icon: "🔱", name: "DUO GUN KIRI-KANAN", desc: "2 senjata bergantian nembak!", color: "#7dd3fc" },
  mini: { icon: "🌧️", name: "MINI RAPID", desc: "Peluru mini, jeda super cepat!", color: "#d8b4fe" },
  big: { icon: "💥", name: "PELURU RAKSASA 2X", desc: "Ukuran 2x + damage +2!", color: "#fbbf24" },
};

/* ---- Peti TERBUKA penuh tumpukan koin natural ---- */
const COIN_MOUND: { x: number; y: number; s: number }[] = [
  { x: -62, y: 58, s: 30 }, { x: -32, y: 60, s: 32 }, { x: 0, y: 61, s: 34 },
  { x: 32, y: 60, s: 32 }, { x: 62, y: 58, s: 30 },
  { x: -48, y: 41, s: 30 }, { x: -16, y: 42, s: 32 }, { x: 16, y: 42, s: 32 },
  { x: 48, y: 41, s: 30 },
  { x: -32, y: 23, s: 28 }, { x: 0, y: 22, s: 30 }, { x: 32, y: 23, s: 28 },
  { x: -14, y: 6, s: 27 }, { x: 14, y: 6, s: 27 },
];

function OpenTreasureChest({ hitKey }: { hitKey: number }) {
  return (
    <div className="relative h-[150px] w-[190px]">
      {/* semburat cahaya dari dalam */}
      <div className="chest-glow-pulse absolute -top-14 left-1/2 h-[120px] w-[130px] -translate-x-1/2 bg-gradient-to-t from-amber-200 via-amber-100/60 to-transparent blur-lg" />
      <div key={hitKey} className={hitKey > 0 ? "chest-hit" : ""} style={{ transformOrigin: "50% 100%" }}>
        {/* tutup TERBUKA ke belakang */}
        <div
          className="absolute left-1/2 top-[-30px] z-0 h-[46px] w-[184px]"
          style={{ transform: "translateX(-50%) rotateX(52deg)", transformOrigin: "50% 100%" }}
        >
          <div className="h-full w-full rounded-t-[20px] border-4 border-[#5a3200] bg-gradient-to-b from-[#c98d2b] via-[#8a5200] to-[#5f3600] shadow-[inset_0_3px_0_rgba(255,255,255,.35)]" />
          <div className="absolute inset-x-0 top-1.5 mx-auto h-2 w-[78%] rounded-full bg-white/25" />
        </div>
        {/* dinding belakang + rongga gelap */}
        <div className="absolute left-1/2 top-[22px] z-0 h-[56px] w-[168px] -translate-x-1/2 rounded-t-[14px] bg-[#3a2000] shadow-[inset_0_10px_18px_rgba(0,0,0,.8)]" />
        {/* tumpukan koin natural di mulut peti */}
        <div className="absolute bottom-[38px] left-1/2 z-10 h-0 w-0">
          {COIN_MOUND.map((c, i) => (
            <span key={i} className="absolute block" style={{ left: c.x - c.s / 2, top: c.y - 78 }}>
              <Coin size={c.s} />
            </span>
          ))}
        </div>
        {/* badan depan */}
        <div className="absolute bottom-0 left-1/2 z-20 h-[64px] w-[190px] -translate-x-1/2 overflow-hidden rounded-b-[18px] rounded-t-[8px] border-4 border-[#5a3200] bg-gradient-to-b from-[#c07f1d] to-[#6f4200] shadow-[0_16px_30px_rgba(0,0,0,.55),inset_0_2px_0_rgba(255,255,255,.3)]">
          <div className="absolute inset-y-0 left-5 w-2.5 rounded bg-black/25" />
          <div className="absolute inset-y-0 right-5 w-2.5 rounded bg-black/25" />
          <div className="absolute inset-y-0 left-1/2 w-[26px] -translate-x-1/2 border-x-2 border-[#8a5a00] bg-gradient-to-b from-[#ffe27a] to-[#b06f00]" />
          <div className="absolute inset-x-8 top-1 h-3 rounded-full bg-white/25" />
          {/* koin nyelip di depan */}
          <span className="absolute -bottom-1 left-6 block"><Coin size={24} /></span>
          <span className="absolute -bottom-1.5 right-8 block"><Coin size={26} /></span>
        </div>
      </div>
      <div className="absolute -bottom-3 left-1/2 h-3.5 w-40 -translate-x-1/2 rounded-[50%] bg-black/50 blur-[4px]" />
      <SparkleField count={5} spread={1.4} />
    </div>
  );
}

/* ---- Bintang bonus melayang ---- */
function BonusStar({ kind }: { kind: BuffKind }) {
  const b = BUFF_DEFS[kind];
  return (
    <span className="relative block h-[60px] w-[60px]">
      <span className="star-trail absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200/60 blur-[3px]" />
      <span className="star-twinkle absolute inset-0 flex items-center justify-center text-[46px] drop-shadow-[0_0_14px_rgba(255,210,60,.95)]">
        ⭐
      </span>
      <span
        className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-black text-[#3a2000]"
        style={{ background: b.color, boxShadow: `0 0 12px ${b.color}` }}
      >
        {b.icon} BONUS!
      </span>
    </span>
  );
}

export function TreasureStageScreen({
  weapon,
  onComplete,
  onQuit,
  level = 4,
  coins = 0,
}: {
  weapon: WeaponDef;
  onComplete: (coins: number) => void;
  onQuit?: () => void;
  level?: number;
  coins?: number;
}) {
  const active = useSlideActive();
  const stats = getWeaponStats(weapon);
  const heavy = stats.damage >= 4;
  const [timeLeft, setTimeLeft] = useState(TREASURE_TIME);
  const [earned, setEarned] = useState(0);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [flyCoins, setFlyCoins] = useState<FlyCoin[]>([]);
  const [hitKey, setHitKey] = useState(0);
  const [pops, setPops] = useState<{ id: number; n: number; big?: boolean }[]>([]);
  const [cooling, setCooling] = useState(false);
  const [finished, setFinished] = useState(false);
  const [combo, setCombo] = useState(0);
  const [buff, setBuff] = useState<BuffKind | null>(null);
  const [buffLeft, setBuffLeft] = useState(0);
  const [starActive, setStarActive] = useState(false);
  const [starBurst, setStarBurst] = useState(false);
  const [dualSide, setDualSide] = useState<0 | 1>(0);
  const dualSideRef = useRef<0 | 1>(0);

  const wrapRef = useRef<HTMLDivElement>(null);
  const starEl = useRef<HTMLButtonElement>(null);
  const idRef = useRef(1);
  const lastShot = useRef(0);
  const holdTimer = useRef<number | null>(null);
  const earnedRef = useRef(0);
  const comboRef = useRef(0);
  const comboTimer = useRef<number | null>(null);
  const maxComboRef = useRef(0);
  const buffUsedRef = useRef(false);
  const starSpawned = useRef(false);
  const starX = useRef(-60);
  const starPhase = useRef(0);
  const starKind = useRef<BuffKind>("double");

  const buffRef = useRef<BuffKind | null>(null);
  const finishedRef = useRef(false);
  const starOnRef = useRef(false);
  buffRef.current = buff;
  finishedRef.current = finished;
  starOnRef.current = starActive;

  const CHEST_Y = 262;
  const GUN_Y = 556;

  /* timer 10 detik: only ticks while this game is selected */
  useEffect(() => {
    if (!active) return;
    if (timeLeft <= 0) {
      if (!finishedRef.current) {
        setFinished(true);
        stopHold();
        sfx.reveal();
        vibrate(20);
      }
      return;
    }
    if (timeLeft <= 3) sfx.tick(true);
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, active]);

  /* bintang bonus: HANYA 1x lewat per run */
  useEffect(() => {
    if (!active || starSpawned.current) return;
    const t = setTimeout(() => {
      if (starSpawned.current) return;
      starSpawned.current = true;
      const kinds: BuffKind[] = ["rapid", "double", "mini", "big"];
      starKind.current = kinds[Math.floor(Math.random() * kinds.length)];
      starX.current = -60;
      setStarActive(true);
      sfx.whoosh();
    }, 2300);
    return () => clearTimeout(t);
  }, [active]);

  /* gerak bintang: nyebrang kiri -> kanan + floating naik-turun */
  useEffect(() => {
    if (!active || !starActive) return;
    let raf = 0;
    let last = performance.now();
    const SPEED = 100;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      starPhase.current += dt;
      starX.current += SPEED * dt;
      const y = 398 + Math.sin(starPhase.current * 3.4) * 15;
      if (starEl.current) {
        starEl.current.style.left = `${starX.current - 30}px`;
        starEl.current.style.top = `${y - 30}px`;
      }
      if (starX.current > 430) {
        setStarActive(false);
      } else {
        raf = requestAnimationFrame(loop);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [starActive, active]);

  /* countdown buff: don't reset the two barrels on focus changes */
  useEffect(() => {
    if (buff === "double") {
      dualSideRef.current = 0;
      setDualSide(0);
    }
  }, [buff]);
  useEffect(() => {
    if (!active || !buff) return;
    const iv = setInterval(() => {
      setBuffLeft((l) => {
        if (l <= 0.25) {
          clearInterval(iv);
          setBuff(null);
          return 0;
        }
        return +(l - 0.25).toFixed(2);
      });
    }, 250);
    return () => clearInterval(iv);
  }, [buff, active]);

  const shake = (p: number) => {
    wrapRef.current?.animate(
      [{ transform: "translate(0,0)" }, { transform: `translate(${-p}px,${p * 0.5}px)` }, { transform: `translate(${p}px,${-p * 0.5}px)` }, { transform: "translate(0,0)" }],
      { duration: 170, easing: "ease-out" }
    );
  };

  const collectStar = () => {
    if (!starOnRef.current) return;
    setStarActive(false);
    const kind = starKind.current;
    setBuff(kind);
    setBuffLeft(6);
    buffUsedRef.current = true;
    setStarBurst(true);
    setTimeout(() => setStarBurst(false), 900);
    sfx.reveal();
    sfx.equip();
    vibrate([15, 30, 25]);
    shake(4);
  };

  const spawnHitCoins = (n: number) => {
    const base = idRef.current;
    idRef.current += n + 4;
    const coins: FlyCoin[] = Array.from({ length: n }).map((_, i) => {
      const spread = n <= 1 ? 0 : (i / (n - 1) - 0.5) * 2.1;
      const ang = -Math.PI / 2 + spread + (Math.random() - 0.5) * 0.5;
      const dist = 46 + Math.random() * 68;
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist * 0.9 - 18;
      return { id: base + i, dx, dy, tx: 128 - dx * 0.2, ty: -200 - dy * 0.2, collecting: false, size: 26 + Math.random() * 9 };
    });
    setFlyCoins((c) => [...c.slice(-24), ...coins]);
    coins.forEach((cn, k) => {
      setTimeout(() => {
        setFlyCoins((c) => c.map((x) => (x.id === cn.id ? { ...x, collecting: true } : x)));
      }, 700 + k * 80);
      setTimeout(() => {
        setFlyCoins((c) => c.filter((x) => x.id !== cn.id));
        earnedRef.current += 1;
        setEarned(earnedRef.current);
        sfx.coin();
      }, 700 + k * 80 + 580);
    });
    const pid = base + 9999;
    setPops((p) => [...p.slice(-3), { id: pid, n, big: n >= 4 }]);
    setTimeout(() => setPops((p) => p.filter((x) => x.id !== pid)), 780);
  };

  const onChestHit = () => {
    setHitKey((k) => k + 1);
    sfx.hit();
    shake(heavy ? 5 : 3);
    vibrate(heavy ? 16 : 8);
    let dmg = stats.damage + (buffRef.current === "big" ? 2 : 0);
    if (Math.random() < 0.25) dmg += 1;
    spawnHitCoins(dmg);
    /* kombo */
    comboRef.current += 1;
    const nc = comboRef.current;
    setCombo(nc);
    if (nc > maxComboRef.current) maxComboRef.current = nc;
    if (comboTimer.current) window.clearTimeout(comboTimer.current);
    comboTimer.current = window.setTimeout(() => {
      comboRef.current = 0;
      setCombo(0);
    }, 1200);
    if (nc > 0 && nc % 10 === 0) {
      spawnHitCoins(3);
      const pid = idRef.current + 5000;
      idRef.current += 1;
      setPops((p) => [...p, { id: pid, n: 3, big: true }]);
      setTimeout(() => setPops((p) => p.filter((x) => x.id !== pid)), 900);
      sfx.equip();
    }
  };

  const fire = () => {
    if (finishedRef.current) return;
    const b = buffRef.current;
    let cd = stats.cooldownMs;
    if (b === "rapid") cd *= 0.5;
    if (b === "mini") cd *= 0.45;
    if (b === "double") cd *= 0.8;
    const now = Date.now();
    if (now - lastShot.current < cd) return;
    /* peluru mencegat bintang bonus — sesuai moncong senjata aktif */
    const gunX = b === "double" ? (dualSideRef.current === 0 ? 128 : 252) : 190;
    if (starOnRef.current && Math.abs(starX.current - gunX) < 48) {
      lastShot.current = now;
      if (b === "double") {
        const side = dualSideRef.current;
        dualSideRef.current = (side === 0 ? 1 : 0) as 0 | 1;
        setDualSide(side);
      }
      collectStar();
      return;
    }
    lastShot.current = now;
    setCooling(true);
    setTimeout(() => setCooling(false), Math.min(cd, 400));
    const scale = b === "mini" ? 0.55 : b === "big" ? 2 : 1;
    let shots: Bullet[];
    if (b === "double") {
      // duo gun: kiri-kanan bergantian, tiap tembakan 1 peluru dari sisi aktif
      const side = dualSideRef.current;
      dualSideRef.current = (side === 0 ? 1 : 0) as 0 | 1;
      setDualSide(side);
      shots = [{ id: idRef.current++, off: side === 0 ? -62 : 62, scale }];
    } else {
      shots = [{ id: idRef.current++, off: 0, scale }];
    }
    setBullets((bl) => [...bl.slice(-6), ...shots]);
    sfx.shoot(heavy || b === "big");
    vibrate(b === "big" ? 16 : 8);
    setTimeout(() => {
      setBullets((bl) => bl.filter((x) => !shots.some((s) => s.id === x.id)));
      if (finishedRef.current) return;
      onChestHit();
    }, 190);
  };
  const fireRef = useRef(fire);
  fireRef.current = fire;

  const startHold = () => {
    fireRef.current();
    if (holdTimer.current) window.clearInterval(holdTimer.current);
    holdTimer.current = window.setInterval(() => fireRef.current(), 70);
  };
  const stopHold = () => {
    if (holdTimer.current) {
      window.clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
  };
  useEffect(() => () => { stopHold(); if (comboTimer.current) window.clearTimeout(comboTimer.current); }, []);
  useEffect(() => { if (!active) stopHold(); }, [active]);

  const buffDef = buff ? BUFF_DEFS[buff] : null;

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 overflow-hidden"
      onPointerDown={startHold}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
    >
      <Dust />
      {/* header */}
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
          <span className={`rounded-full px-3 py-1.5 text-[16px] font-black tabular-nums ${timeLeft <= 3 ? "bg-red-500/90 text-white" : "bg-black/55 text-amber-300"} border border-white/15`}>
            ⏱ {timeLeft}s
          </span>
          <div className="flex min-w-0 flex-1 flex-col items-center">
            <span className="text-[17px] font-black leading-none tracking-widest text-amber-300">LEVEL {level} 💰</span>
            <span className="mt-1 text-[12px] font-bold tracking-[0.16em] text-white/55">HARTA KARUN</span>
          </div>
          <span className="rounded-full border border-white/15 bg-black/55 px-2.5 py-1.5 text-[14px] font-black tabular-nums text-white">
            💵 {coins.toLocaleString("id-ID")}
          </span>
        </div>
        <div className="mt-2 flex justify-center">
          <span key={earned} className="count-pulse rounded-full border border-amber-300/40 bg-black/55 px-3 py-1 text-[14px] font-black text-amber-300">
            🪙 {earned} terkumpul
          </span>
        </div>
        {/* bar waktu */}
        <div className="mt-2 h-2 overflow-hidden rounded-full border border-white/15 bg-black/50">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 3 ? "bg-gradient-to-r from-red-500 to-orange-400" : "bg-gradient-to-r from-amber-300 to-yellow-500"}`}
            style={{ width: `${(timeLeft / TREASURE_TIME) * 100}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-center gap-1.5">
          <span className="rounded-full bg-black/50 px-2.5 py-1 text-[12px] font-black text-white/85">💥 DMG {stats.damage}</span>
          <span className="rounded-full bg-black/50 px-2.5 py-1 text-[12px] font-black text-white/85">{stats.speedIcon} {stats.speedLabel}</span>
          {buffDef && (
            <span className="rounded-full px-2.5 py-1 text-[12px] font-black" style={{ background: `${buffDef.color}33`, color: buffDef.color, border: `1px solid ${buffDef.color}` }}>
              {buffDef.icon} {buffLeft.toFixed(1)}s
            </span>
          )}
        </div>
      </div>

      {/* kombo */}
      {combo >= 3 && !finished && (
        <div key={combo} className="combo-pop absolute left-4 top-[132px] z-10 rounded-2xl border-2 border-orange-300 bg-black/60 px-3 py-1.5 text-center">
          <p className="text-[20px] font-black leading-none text-orange-300">🔥 x{combo}</p>
          <p className="text-[12px] font-black tracking-widest text-white/70">KOMBO</p>
        </div>
      )}

      {/* peti terbuka */}
      <div className="absolute left-1/2" style={{ top: CHEST_Y, transform: "translate(-50%,-50%)" }}>
        <div className="absolute left-1/2 top-1/2 h-0 w-0">
          <GodRays size={430} intensity={0.85} color="255,220,140" />
        </div>
        <div className="relative">
          <OpenTreasureChest hitKey={hitKey} />
          <div className="pointer-events-none absolute left-1/2 top-[10px] h-0 w-0">
            {flyCoins.map((c) =>
              c.collecting ? (
                <span key={c.id} className="coin-collect absolute block" style={{ left: -15, top: -15, "--dx": `${c.dx}px`, "--dy": `${c.dy}px`, "--cx": `${c.tx}px`, "--cy": `${c.ty}px` } as CSSVars}>
                  <Coin size={c.size} />
                </span>
              ) : (
                <span key={c.id} className="coin-pop absolute block" style={{ left: -15, top: -15, "--dx": `${c.dx}px`, "--dy": `${c.dy}px` } as CSSVars}>
                  <Coin size={c.size} />
                </span>
              ),
            )}
          </div>
          {pops.map((p) => (
            <span key={p.id} className={`dmg-pop pointer-events-none absolute left-1/2 top-[-14px] font-black text-amber-300 ${p.big ? "text-[28px]" : "text-[22px]"}`} style={{ textShadow: "0 2px 0 #7a4a00, 0 0 14px rgba(255,210,60,.9)" }}>
              +{p.n}{p.big ? "!" : ""}
            </span>
          ))}
        </div>
      </div>

      {/* bintang bonus melayang (HANYA 1x) */}
      {starActive && (
        <button
          ref={starEl}
          onPointerDown={(e) => { e.stopPropagation(); collectStar(); }}
          className="absolute z-20"
          style={{ left: -30, top: 368 }}
          aria-label="Ambil bonus"
        >
          <BonusStar kind={starKind.current} />
        </button>
      )}
      {starBurst && buffDef && (
        <div className="buff-flash pointer-events-none absolute inset-0 z-10" style={{ background: `radial-gradient(circle, ${buffDef.color}55, transparent 70%)` }} />
      )}

      {/* peluru */}
      {bullets.map((b) => (
        <span key={b.id} className="bullet-fly pointer-events-none absolute left-1/2" style={{ top: GUN_Y - 66, marginLeft: -7 + b.off, "--travel": `${-(GUN_Y - 66 - (CHEST_Y + 30))}px` } as CSSVars}>
          <span
            className="block rounded-full"
            style={{
              width: 14 * b.scale, height: 26 * b.scale,
              background: stats.bullet, boxShadow: `0 0 12px ${stats.bulletGlow}, 0 0 26px ${stats.bulletGlow}`,
            }}
          />
          <span className="muzzle absolute -bottom-1 left-1/2 h-4 w-8 -translate-x-1/2 rounded-[50%] bg-white/80 blur-[2px]" />
        </span>
      ))}

      {/* senjata + buff — mode duo: 2 senjata kiri-kanan bergantian */}
      <div className="absolute left-1/2" style={{ top: GUN_Y, transform: "translate(-50%,-50%)" }}>
        {buff === "double" && buffDef ? (
          <div className="relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-black" style={{ background: `${buffDef.color}2e`, color: buffDef.color, border: `1.5px solid ${buffDef.color}` }}>
              {buffDef.icon} {buffDef.name} · {buffLeft.toFixed(0)}s
            </div>
            <div className="flex items-end justify-center gap-[26px]">
              {([0, 1] as const).map((side) => {
                const active = dualSide === side && cooling;
                const idle = dualSide !== side;
                return (
                  <div key={side} className="relative flex flex-col items-center">
                    <span
                      className={`mb-1 rounded-full px-2 py-0.5 text-[12px] font-black tracking-widest transition-all ${
                        dualSide === side ? "text-[#0a2228]" : "text-white/50"
                      }`}
                      style={
                        dualSide === side
                          ? { background: buffDef.color, boxShadow: `0 0 12px ${buffDef.color}` }
                          : { background: "rgba(255,255,255,.12)" }
                      }
                    >
                      {side === 0 ? "◀ KIRI" : "KANAN ▶"}
                    </span>
                    <div
                      className="transition-all duration-150"
                      style={{
                        transform: `rotate(-90deg) translateY(${active ? -5 : 0}px) scale(${active ? 1.06 : idle ? 0.94 : 1})`,
                        transformOrigin: "50% 50%",
                        filter: active
                          ? `drop-shadow(0 0 14px ${buffDef.color}) brightness(1.25)`
                          : `drop-shadow(0 0 7px ${stats.bulletGlow})`,
                        opacity: idle && cooling ? 0.75 : 1,
                      }}
                    >
                      <div className="h-[54px] w-[118px]">
                        <WeaponArt id={weapon.id} className="h-full w-full" style={{}} />
                      </div>
                    </div>
                    {active && (
                      <span className="muzzle absolute top-[6px] h-5 w-10 rounded-[50%] bg-white/85 blur-[3px]" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mx-auto mt-1.5 h-1.5 w-40 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-sky-300 to-cyan-400" style={{ opacity: cooling ? 0.45 : 1 }} />
            </div>
            <p className="mt-1 text-center text-[12px] font-black tracking-widest text-white/70">
              {weapon.name.toUpperCase()} · KIRI ⇄ KANAN · DMG {stats.damage}
            </p>
          </div>
        ) : (
          <div className={`relative transition-opacity ${cooling ? "opacity-70" : "opacity-100"}`}>
            {buffDef && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-black" style={{ background: `${buffDef.color}2e`, color: buffDef.color, border: `1.5px solid ${buffDef.color}` }}>
                {buffDef.icon} {buffDef.name} · {buffLeft.toFixed(0)}s
              </div>
            )}
            <div style={{ transform: "rotate(-90deg)" }} className="h-[64px] w-[150px]">
              <WeaponArt id={weapon.id} className="h-full w-full" style={{ filter: `drop-shadow(0 0 10px ${buffDef ? buffDef.color : stats.bulletGlow})` }} />
            </div>
            <div className="mx-auto mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-lime-300 to-emerald-400" style={{ opacity: cooling ? 0.45 : 1 }} />
            </div>
            <p className="mt-1 text-center text-[12px] font-black tracking-widest text-white/70">
              {weapon.name.toUpperCase()} · DMG {stats.damage + (buff === "big" ? 2 : 0)}
            </p>
          </div>
        )}
      </div>

      {!finished && (
        <p className="pointer-events-none absolute inset-x-0 bottom-[132px] animate-pulse text-center text-[14px] font-black text-white/75">
          TAHAN untuk menembak! Tangkap ⭐ yang lewat!
        </p>
      )}

      {finished && <AutoNext onComplete={() => onComplete(earned)} delay={900} />}
    </div>
  );
}

/* ================= STAGE DESTROY — tembak bongkahan batu sampai berlian bersih ================= */
interface RockChunk {
  x: number;
  y: number;
  s: number;
  clip: string;
  dx: string;
  dy: string;
  rot: string;
}

const ROCK_CHUNKS: RockChunk[] = [
  { x: -72, y: -58, s: 74, clip: "polygon(18% 8%, 82% 0%, 100% 62%, 55% 100%, 6% 78%)", dx: "-150px", dy: "-130px", rot: "-220deg" },
  { x: 6, y: -78, s: 70, clip: "polygon(8% 30%, 45% 0%, 95% 22%, 80% 90%, 20% 100%)", dx: "30px", dy: "-170px", rot: "160deg" },
  { x: 66, y: -46, s: 66, clip: "polygon(0% 18%, 60% 0%, 100% 40%, 78% 100%, 12% 82%)", dx: "160px", dy: "-110px", rot: "240deg" },
  { x: -84, y: 12, s: 66, clip: "polygon(20% 0%, 100% 18%, 82% 88%, 10% 100%, 0% 40%)", dx: "-170px", dy: "10px", rot: "-180deg" },
  { x: 74, y: 26, s: 64, clip: "polygon(0% 30%, 55% 5%, 100% 45%, 70% 100%, 8% 80%)", dx: "170px", dy: "40px", rot: "200deg" },
  { x: -58, y: 62, s: 68, clip: "polygon(12% 10%, 85% 0%, 100% 70%, 45% 100%, 0% 60%)", dx: "-130px", dy: "150px", rot: "-140deg" },
  { x: 18, y: 66, s: 66, clip: "polygon(0% 25%, 50% 0%, 100% 35%, 85% 100%, 15% 90%)", dx: "20px", dy: "165px", rot: "120deg" },
  { x: -16, y: -8, s: 60, clip: "polygon(25% 0%, 90% 15%, 100% 80%, 40% 100%, 5% 55%)", dx: "-60px", dy: "-60px", rot: "-300deg" },
  { x: 30, y: -2, s: 56, clip: "polygon(10% 20%, 70% 0%, 100% 60%, 55% 100%, 0% 75%)", dx: "90px", dy: "-30px", rot: "280deg" },
];

function Diamond({ size = 96 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size }} className="drop-shadow-[0_0_22px_rgba(165,243,252,.9)]">
      <polygon points="50,4 92,36 50,96 8,36" fill="#a5f3fc" stroke="#e0f7ff" strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points="50,4 74,36 50,96 26,36" fill="#67e8f9" opacity=".85" />
      <polygon points="50,4 92,36 74,36" fill="#ecfeff" />
      <polygon points="50,4 26,36 8,36" fill="#cffafe" />
      <path d="M8 36 H92 M26 36 L50 96 M74 36 L50 96 M50 4 L38 36 M50 4 L62 36" stroke="#ffffff" strokeWidth="1.6" opacity=".85" />
      <path d="M28 22 L40 14" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function DestroyStageScreen({
  weapon,
  onComplete,
  onQuit,
  level = 4,
  coins = 0,
}: {
  weapon: WeaponDef;
  onComplete: (shots: number) => void;
  onQuit?: () => void;
  level?: number;
  coins?: number;
}) {
  const active = useSlideActive();
  const stats = getWeaponStats(weapon);
  const heavy = stats.damage >= 4;
  const hp = destroyHP(level);
  const [dealt, setDealt] = useState(0);
  const [bullets, setBullets] = useState<number[]>([]);
  const [hitKey, setHitKey] = useState(0);
  const [debris, setDebris] = useState<{ id: number; n: number }[]>([]);
  const [cooling, setCooling] = useState(false);
  const [finished, setFinished] = useState(false);
  const dealtRef = useRef(0);
  const shotsRef = useRef(0);
  const finishedRef = useRef(false);
  const idRef = useRef(1);
  const lastShot = useRef(0);
  const holdTimer = useRef<number | null>(null);

  const ROCK_Y = 268;
  const GUN_Y = 556;
  const broken = Math.min(ROCK_CHUNKS.length, Math.floor((dealtRef.current / hp) * ROCK_CHUNKS.length));
  const integrity = Math.max(0, 1 - dealt / hp);

  const fire = () => {
    if (finishedRef.current) return;
    const now = Date.now();
    if (now - lastShot.current < stats.cooldownMs) return;
    lastShot.current = now;
    setCooling(true);
    setTimeout(() => setCooling(false), Math.min(stats.cooldownMs, 400));
    const bid = idRef.current++;
    setBullets((b) => [...b.slice(-6), bid]);
    sfx.shoot(heavy);
    vibrate(heavy ? 16 : 8);
    setTimeout(() => {
      setBullets((b) => b.filter((x) => x !== bid));
      if (finishedRef.current) return;
      shotsRef.current += 1;
      dealtRef.current += stats.damage;
      setDealt(dealtRef.current);
      setHitKey((k) => k + 1);
      sfx.hit();
      const pid = idRef.current++;
      setDebris((d) => [...d.slice(-3), { id: pid, n: stats.damage }]);
      setTimeout(() => setDebris((d) => d.filter((x) => x.id !== pid)), 800);
      if (dealtRef.current >= hp) {
        finishedRef.current = true;
        setFinished(true);
        sfx.reveal();
        vibrate([20, 40, 60]);
      }
    }, 190);
  };
  const fireRef = useRef(fire);
  fireRef.current = fire;

  const startHold = () => {
    fireRef.current();
    if (holdTimer.current) window.clearInterval(holdTimer.current);
    holdTimer.current = window.setInterval(() => fireRef.current(), 70);
  };
  const stopHold = () => {
    if (holdTimer.current) {
      window.clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
  };
  useEffect(() => () => stopHold(), []);
  useEffect(() => { if (!active) stopHold(); }, [active]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      onPointerDown={startHold}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
    >
      <Dust />
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
          <div className="flex min-w-0 flex-1 flex-col items-center">
            <span className="text-[17px] font-black leading-none tracking-widest text-stone-200">LEVEL {level} 🪨</span>
            <span className="mt-1 text-[12px] font-bold tracking-[0.16em] text-white/55">DESTROY · HANCURKAN BATU</span>
          </div>
          <span className="rounded-full border border-white/15 bg-black/55 px-2.5 py-1.5 text-[14px] font-black tabular-nums text-white">
            💵 {coins.toLocaleString("id-ID")}
          </span>
        </div>
        {/* integritas batu */}
        <div className="mx-auto mt-2 max-w-[250px]">
          <div className="flex justify-between text-[12px] font-black tracking-widest text-white/60">
            <span>🪨 BATU</span>
            <span className="tabular-nums">{Math.ceil(integrity * 100)}%</span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full border border-white/20 bg-black/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-stone-300 to-amber-500 transition-all duration-200"
              style={{ width: `${integrity * 100}%` }}
            />
          </div>
        </div>
        <div className="mt-1.5 flex justify-center gap-1.5">
          <span className="rounded-full bg-black/50 px-2.5 py-1 text-[12px] font-black text-white/85">💥 DMG {stats.damage}</span>
          <span className="rounded-full bg-black/50 px-2.5 py-1 text-[12px] font-black text-white/85">{stats.speedIcon} {stats.speedLabel}</span>
        </div>
      </div>

      {/* bongkahan + berlian */}
      <div className="absolute left-1/2" style={{ top: ROCK_Y, transform: "translate(-50%,-50%)" }}>
        <div className="absolute left-1/2 top-1/2 h-0 w-0">
          <GodRays size={finished ? 480 : 360} intensity={finished ? 1.1 : 0.6} color="190,230,255" />
        </div>
        <div className="relative h-[190px] w-[190px]">
          {/* berlian di tengah (selalu ada, ketutup kepingan) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className={finished ? "pop-in" : ""}>
              <Diamond size={finished ? 104 : 88} />
            </div>
            {finished && <SparkleField count={9} spread={1.4} />}
          </div>
          {/* kepingan batu menutupi */}
          <div key={hitKey} className={hitKey > 0 && !finished ? "chest-hit" : ""} style={{ transformOrigin: "50% 50%" }}>
            {ROCK_CHUNKS.map((c, i) =>
              i < broken ? (
                <span
                  key={i}
                  className="piece-fly pointer-events-none absolute block"
                  style={{ left: c.x, top: c.y, width: c.s, height: c.s, clipPath: c.clip, ["--dx" as string]: c.dx, ["--dy" as string]: c.dy, ["--rot" as string]: c.rot } as CSSVars}
                >
                  <span className="block h-full w-full bg-gradient-to-b from-[#a8a29e] to-[#57534e]" />
                </span>
              ) : (
                <span
                  key={i}
                  className="absolute block border-2 border-[#292524]/60 bg-gradient-to-b from-[#b8b0a6] via-[#8a8178] to-[#57534e] shadow-[0_8px_16px_rgba(0,0,0,.45),inset_0_2px_3px_rgba(255,255,255,.35)]"
                  style={{ left: c.x, top: c.y, width: c.s, height: c.s, clipPath: c.clip }}
                />
              )
            )}
          </div>
          {/* debris per tembakan */}
          {debris.map((d) => (
            <span key={d.id} className="dmg-pop pointer-events-none absolute left-1/2 top-[8px] text-[20px] font-black text-stone-200" style={{ textShadow: "0 2px 0 #292524" }}>
              -{d.n}
            </span>
          ))}
          {finished && (
            <div className="absolute left-1/2 top-1/2 h-0 w-0">
              <Shockwave size={400} color="rgba(165,243,252,.9)" />
              <Confetti count={30} />
              <Burst count={16} distance={170} colors={["#a5f3fc", "#fff", "#67e8f9"]} />
            </div>
          )}
        </div>
        <p className="mt-1 text-center text-[13px] font-black tracking-widest text-white/70">
          {finished ? "💎 BERLIAN BERSIH!" : `${ROCK_CHUNKS.length - broken} KEPING TERSISA`}
        </p>
      </div>

      {/* peluru */}
      {bullets.map((b) => (
        <span key={b} className="bullet-fly pointer-events-none absolute left-1/2" style={{ top: GUN_Y - 66, marginLeft: -7, "--travel": `${-(GUN_Y - 66 - (ROCK_Y + 10))}px` } as CSSVars}>
          <span
            className="block h-[26px] w-[14px] rounded-full"
            style={{ background: stats.bullet, boxShadow: `0 0 12px ${stats.bulletGlow}, 0 0 26px ${stats.bulletGlow}` }}
          />
          <span className="muzzle absolute -bottom-1 left-1/2 h-4 w-8 -translate-x-1/2 rounded-[50%] bg-white/80 blur-[2px]" />
        </span>
      ))}

      {/* senjata */}
      <div className="absolute left-1/2" style={{ top: GUN_Y, transform: "translate(-50%,-50%)" }}>
        <div className={`relative transition-opacity ${cooling ? "opacity-70" : "opacity-100"}`}>
          <div style={{ transform: "rotate(-90deg)" }} className="h-[64px] w-[150px]">
            <WeaponArt id={weapon.id} className="h-full w-full" style={{ filter: `drop-shadow(0 0 10px ${stats.bulletGlow})` }} />
          </div>
          <div className="mx-auto mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-stone-200 to-amber-400" style={{ opacity: cooling ? 0.45 : 1 }} />
          </div>
          <p className="mt-1 text-center text-[12px] font-black tracking-widest text-white/70">
            {weapon.name.toUpperCase()} · DMG {stats.damage}
          </p>
        </div>
      </div>

      {!finished && (
        <p className="pointer-events-none absolute inset-x-0 bottom-[132px] animate-pulse text-center text-[14px] font-black text-white/75">
          TAHAN untuk menembak batunya sampai pecah!
        </p>
      )}

      {finished && <AutoNext onComplete={() => onComplete(shotsRef.current)} delay={1100} />}
    </div>
  );
}

/* ================= PILIH STAGE ================= */
export function StageSelectScreen({
  bossId,
  onBoss,
  onGo,
  onClose,
}: {
  bossId: BossId;
  onBoss: (id: BossId) => void;
  onGo: (phase: "stage" | "normal" | "bonus" | "destroy" | "treasure") => void;
  onClose: () => void;
}) {
  const cards: { phase: "stage" | "normal" | "bonus" | "destroy" | "treasure"; icon: string; title: string; desc: string; grad: string; time: string }[] = [
    { phase: "stage", icon: "👑", title: "STAGE BOSS", desc: "Kalahkan boss pilihanmu", grad: "linear-gradient(135deg,#059669,#065f46)", time: "boss" },
    { phase: "normal", icon: "🪵", title: "STAGE NORMAL", desc: "Kayu polos, putaran stabil", grad: "linear-gradient(135deg,#57534e,#292524)", time: "6 pisau" },
    { phase: "bonus", icon: "🎡", title: "STAGE BONUS", desc: "Putaran nyaman satu arah", grad: "linear-gradient(135deg,#d97706,#92400e)", time: "6 pisau" },
    { phase: "destroy", icon: "🪨", title: "STAGE DESTROY", desc: "Hancurkan batu, rebut berlian!", grad: "linear-gradient(135deg,#78716c,#292524)", time: "tembak" },
    { phase: "treasure", icon: "💰", title: "HARTA KARUN", desc: "10 detik tembak sepuasnya!", grad: "linear-gradient(135deg,#ca8a04,#854d0e)", time: "10 dtk" },
  ];
  return (
    <div className="fade-in absolute inset-0 z-30 flex flex-col bg-black/70 p-4 backdrop-blur-[3px]">
      <div className="panel-in relative overflow-hidden rounded-3xl border-2 border-white/15 bg-gradient-to-b from-[#17444d] to-[#0c2228] p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-[24px] font-black tracking-wide text-white">🗺️ PILIH STAGE</h2>
          <button onClick={() => { sfx.click(); onClose(); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[18px] font-black text-white active:scale-90">✕</button>
        </div>
        <p className="mt-0.5 text-[13px] font-bold text-white/60">Bebas main stage apa saja kapan saja!</p>
        <div className="mt-3 flex flex-col gap-2">
          {cards.map((c, i) => (
            <button
              key={c.phase}
              onClick={() => { sfx.click(); onGo(c.phase); }}
              className="card-in flex items-center gap-3 rounded-2xl border border-white/15 p-3 text-left active:scale-[.98]"
              style={{ background: c.grad, animationDelay: `${i * 0.07}s` }}
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black/30 text-[30px]">{c.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[19px] font-black leading-none text-white">{c.title}</span>
                <span className="mt-1 block text-[13px] font-bold text-white/75">{c.desc}</span>
              </span>
              <span className="shrink-0 rounded-full bg-black/40 px-3 py-1.5 text-[13px] font-black text-white">▶ {c.time}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[13px] font-black tracking-[0.18em] text-white/55">🎯 BOSS UNTUK STAGE BOSS</p>
        <div className="no-scrollbar mt-1.5 flex gap-2 overflow-x-auto pb-1">
          {BOSSES.map((b) => (
            <button
              key={b.id}
              onClick={() => { sfx.click(); onBoss(b.id); }}
              className={`flex w-[76px] shrink-0 flex-col items-center gap-1 rounded-2xl border-2 p-1.5 transition active:scale-95 ${bossId === b.id ? "border-amber-300 shadow-[0_0_14px_rgba(251,191,36,.5)]" : "border-white/15 bg-white/[.05]"}`}
              style={bossId === b.id ? { background: b.grad } : undefined}
            >
              <span className="relative block h-[52px] w-[52px] overflow-hidden rounded-full border-2 border-white/60">
                <BossTarget id={b.id} />
              </span>
              <span className="w-full truncate text-center text-[12px] font-black text-white">{b.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
