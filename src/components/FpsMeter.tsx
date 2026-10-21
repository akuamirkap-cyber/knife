import { useEffect, useRef } from 'react';

const BARS = 40;
const CW = 44;
const CH = 20;

/**
 * Meter FPS ringan yang menempel di kiri bawah layar.
 *
 * Kenapa ditulis begini:
 * - Angka & grafik ditulis langsung ke DOM/canvas, BUKAN lewat setState.
 *   Jadi meter ini tidak memicu render ulang React (0 re-render / 0.5 detik).
 * - Sampel diambil tiap 500ms supaya angkanya stabil dan tidak "gemetar".
 * - Warna: hijau >= 55 FPS, kuning >= 40, merah < 40.
 * - Menghormati safe-area iPhone (home indicator) supaya tidak ketutupan.
 */
export default function FpsMeter() {
  const numRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const numEl = numRef.current;
    const canvas = canvasRef.current;
    if (!numEl || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CW * dpr;
    canvas.height = CH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const history: number[] = new Array(BARS).fill(60);
    const colorFor = (fps: number) => (fps >= 55 ? '#4ade80' : fps >= 40 ? '#fbbf24' : '#f87171');

    let raf = 0;
    let frames = 0;
    let windowStart = performance.now();
    let lastPaint = 0;

    const tick = (now: number) => {
      frames += 1;

      if (now - windowStart >= 500) {
        const elapsed = now - windowStart;
        const fps = Math.round((frames * 1000) / elapsed);
        frames = 0;
        windowStart = now;

        numEl.textContent = String(fps);
        numEl.style.color = colorFor(fps);

        history.push(Math.min(60, fps));
        history.shift();

        // Grafik cukup digambar 4x/detik — tidak perlu tiap frame.
        if (now - lastPaint >= 250) {
          lastPaint = now;
          ctx.clearRect(0, 0, CW, CH);
          for (let i = 0; i < history.length; i++) {
            const h = Math.max(1, (history[i] / 60) * CH);
            ctx.fillStyle = colorFor(history[i]);
            ctx.globalAlpha = 0.28 + (i / history.length) * 0.72;
            ctx.fillRect(i * (CW / BARS), CH - h, Math.max(1, CW / BARS - 0.4), h);
          }
          ctx.globalAlpha = 1;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-1.5 z-[9999] flex select-none items-center gap-1.5 rounded-md border border-white/10 bg-black/60 px-1.5 py-1 backdrop-blur-[2px]"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 6px)' }}
    >
      <span
        ref={numRef}
        className="w-[18px] text-right font-mono text-[10px] font-bold leading-none tabular-nums text-emerald-400"
      >
        60
      </span>
      <span className="font-mono text-[8px] leading-none text-white/45">FPS</span>
      <canvas ref={canvasRef} style={{ width: CW, height: CH }} className="block" />
    </div>
  );
}
