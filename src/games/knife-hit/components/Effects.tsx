import { useMemo } from "react";

type CSSVars = React.CSSProperties & Record<string, string | number>;

/** Starburst rapi — 12 sinar tipis, pendek, terpusat di tengah. */
export function GodRays({
  size = 520, color = "215,220,255", intensity = 1, className = "", style, core = true,
}: { size?: number; color?: string; intensity?: number; className?: string; style?: React.CSSProperties; core?: boolean }) {
  const a1 = Math.min(0.3, 0.21 * intensity);
  const a2 = Math.min(0.22, 0.15 * intensity);
  // mask pendek — sinar hanya di sekitar pusat, cepat memudar ke tepi
  const mask = "radial-gradient(circle, #000 0%, #000 38%, rgba(0,0,0,.6) 55%, transparent 68%)";
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      style={{ width: size, height: size, left: "50%", top: "50%", marginLeft: -size / 2, marginTop: -size / 2, ...style }}
    >
      <div className="rays-in absolute inset-0">
        {/* lapisan utama: 12 sinar tipis */}
        <div
          className="spin-khas absolute inset-0 rounded-full"
          style={{
            background: `repeating-conic-gradient(from -6deg, rgba(${color},${a1}) 0deg 8deg, rgba(${color},0) 8deg 30deg)`,
            WebkitMaskImage: mask, maskImage: mask,
          }}
        />
        {/* lapisan offset: kilau halus di celah */}
        <div
          className="spin-khas-rev absolute inset-0 rounded-full"
          style={{
            background: `repeating-conic-gradient(from 9deg, rgba(255,255,255,${a2}) 0deg 5deg, rgba(255,255,255,0) 5deg 30deg)`,
            WebkitMaskImage: mask, maskImage: mask,
          }}
        />
        {core && (
          <div
            className="absolute inset-[38%] rounded-full"
            style={{ background: `radial-gradient(circle, rgba(255,255,255,${Math.min(0.7, 0.5 * intensity)}) 0%, rgba(${color},${Math.min(0.35, 0.28 * intensity)}) 45%, rgba(${color},0) 70%)` }}
          />
        )}
      </div>
    </div>
  );
}

export function Shockwave({ size = 420, color = "rgba(255,255,255,.9)", delay = 0, duration = 0.8 }: { size?: number; color?: string; delay?: number; duration?: number }) {
  return (
    <div
      className="shockwave pointer-events-none absolute left-1/2 top-1/2 rounded-full border-solid"
      style={{ width: size, height: size, borderColor: color, animationDelay: `${delay}s`, animationDuration: `${duration}s`, boxShadow: `0 0 30px ${color}, inset 0 0 30px ${color}` }}
    />
  );
}

export function Flare({ width = 420, delay = 0, color = "255,240,190" }: { width?: number; delay?: number; color?: string }) {
  return (
    <div
      className="flare pointer-events-none absolute left-1/2 top-1/2"
      style={{ width, height: 10, animationDelay: `${delay}s`, borderRadius: 99, background: `radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(${color},.7) 30%, rgba(${color},0) 70%)`, filter: "blur(1px)" }}
    />
  );
}

const STAR = "M0 -10 L2.6 -3.2 L9.5 -3.1 L4 1.2 L5.9 8.1 L0 4 L-5.9 8.1 L-4 1.2 L-9.5 -3.1 L-2.6 -3.2 Z";

export function Burst({
  count = 16, distance = 170, colors = ["#fff6b0", "#ffd54a", "#ffffff", "#7cf8ff"], delay = 0, size = 14, shape = "star", duration = 0.9,
}: { count?: number; distance?: number; colors?: string[]; delay?: number; size?: number; shape?: "star" | "dot" | "chip"; duration?: number }) {
  const parts = useMemo(
    () => Array.from({ length: count }).map((_, i) => {
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const d = distance * (0.55 + Math.random() * 0.6);
      return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, c: colors[i % colors.length], s: size * (0.5 + Math.random() * 0.8), dl: Math.random() * 0.08 };
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count, distance, size]
  );
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0">
      {parts.map((p, i) => {
        const st: CSSVars = { width: p.s, height: p.s, "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, animationDelay: `${delay + p.dl}s`, animationDuration: `${duration}s` };
        if (shape === "star")
          return (
            <svg key={i} viewBox="-10 -10 20 20" className="burst absolute left-0 top-0" style={{ ...st, filter: `drop-shadow(0 0 4px ${p.c})` }}>
              <path d={STAR} fill={p.c} />
            </svg>
          );
        return (
          <span
            key={i}
            className={`burst absolute left-0 top-0 block ${shape === "dot" ? "rounded-full" : "rounded-[2px]"}`}
            style={{ ...st, background: p.c, boxShadow: shape === "dot" ? `0 0 8px ${p.c}` : undefined, height: shape === "chip" ? p.s * 0.6 : p.s }}
          />
        );
      })}
    </div>
  );
}

export function Confetti({ count = 36, delay = 0 }: { count?: number; delay?: number }) {
  const pieces = useMemo(
    () => Array.from({ length: count }).map((_, i) => ({
      dx: (Math.random() - 0.5) * 420,
      dy: -120 - Math.random() * 280,
      rot: Math.random() * 900 - 450,
      color: ["#ffc83d", "#7cf8ff", "#ff5d8f", "#a970ff", "#4ade80", "#ffffff"][i % 6],
      dl: Math.random() * 0.15,
      w: 7 + Math.random() * 7,
      round: Math.random() > 0.7,
    })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0">
      {pieces.map((p, i) => (
        <span
          key={i}
          className={`confetti absolute block ${p.round ? "rounded-full" : "rounded-[2px]"}`}
          style={{ width: p.w, height: p.round ? p.w : p.w * 0.45, background: p.color, animationDelay: `${delay + p.dl}s`, "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--rot": `${p.rot}deg` } as CSSVars}
        />
      ))}
    </div>
  );
}

export function Sparkle({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="-10 -10 20 20" className={className} style={{ filter: "drop-shadow(0 0 4px #fff)", ...style }}>
      <path d="M0 -10 Q1.2 -1.2 10 0 Q1.2 1.2 0 10 Q-1.2 1.2 -10 0 Q-1.2 -1.2 0 -10 Z" fill="#fff" />
    </svg>
  );
}

export function SparkleField({ count = 8, spread = 1, delay = 0 }: { count?: number; spread?: number; delay?: number }) {
  const s = useMemo(
    () => Array.from({ length: count }).map(() => ({
      l: 50 + (Math.random() - 0.5) * 90 * spread, t: 50 + (Math.random() - 0.5) * 80 * spread,
      d: Math.random() * 1.8, z: 10 + Math.random() * 14,
    })),
    [count, spread]
  );
  return (
    <>
      {s.map((p, i) => (
        <Sparkle key={i} className="twinkle pointer-events-none absolute" style={{ left: `${p.l}%`, top: `${p.t}%`, width: p.z, height: p.z, animationDelay: `${delay + p.d}s` }} />
      ))}
    </>
  );
}

export function Dust({ count = 22 }: { count?: number }) {
  const d = useMemo(
    () => Array.from({ length: count }).map(() => ({
      l: Math.random() * 100, s: 2 + Math.random() * 3, dur: 8 + Math.random() * 10, dl: -Math.random() * 18,
      o: 0.15 + Math.random() * 0.35, sx: (Math.random() - 0.5) * 80,
    })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {d.map((p, i) => (
        <span
          key={i}
          className="dust absolute block rounded-full bg-cyan-100"
          style={{ left: `${p.l}%`, bottom: -10, width: p.s, height: p.s, animationDuration: `${p.dur}s`, animationDelay: `${p.dl}s`, "--o": p.o, "--sx": `${p.sx}px`, boxShadow: "0 0 6px rgba(200,255,255,.8)" } as CSSVars}
        />
      ))}
    </div>
  );
}

export function LetterPop({ text, delay = 0, step = 0.04, className = "" }: { text: string; delay?: number; step?: number; className?: string }) {
  return (
    <span className={className}>
      {text.split("").map((ch, i) =>
        ch === " " ? <span key={i}>&nbsp;</span> : (
          <span key={i} className="letter-pop" style={{ animationDelay: `${delay + i * step}s` }}>{ch}</span>
        )
      )}
    </span>
  );
}

export function GreenButton({
  children, onClick, className = "", style, breathe = true, color = "green",
}: { children: React.ReactNode; onClick?: (e: React.PointerEvent) => void; className?: string; style?: React.CSSProperties; breathe?: boolean; color?: "green" | "gold" }) {
  const pal = color === "green"
    ? "from-[#6ef59a] via-[#2fd06a] to-[#17a34a] border-[#0d6b30] shadow-[0_10px_28px_rgba(34,197,94,.45)]"
    : "from-[#ffe27a] via-[#ffbf2e] to-[#e88c00] border-[#9a5b00] shadow-[0_10px_28px_rgba(255,180,40,.45)]";
  return (
    <div className={breathe ? "btn-breathe" : ""}>
      <button
        onPointerDown={(e) => { e.stopPropagation(); onClick?.(e); }}
        className={`relative overflow-hidden rounded-2xl border-b-[5px] bg-gradient-to-b px-9 py-3 text-2xl font-bold text-white transition-transform active:translate-y-1 active:border-b-[2px] ${pal} ${className}`}
        style={{ textShadow: "0 2px 0 rgba(0,0,0,.25)", ...style }}
      >
        <span className="pointer-events-none absolute inset-x-2 top-1 h-[40%] rounded-xl bg-white/30" />
        <span className="shine-sweep pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        <span className="relative flex items-center justify-center gap-3">{children}</span>
      </button>
    </div>
  );
}
