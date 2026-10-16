import { useEffect, useRef } from 'react';
import { drawGun, drawProjectile, getWeapon, RARITY_COLOR, WEAPONS, type WeaponId } from '../game/weapons';
import { gunState } from '../game/art/kit';

const PW = 300;
const PH = 115;

function Preview({ id }: { id: WeaponId }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const w = getWeapon(id);
    const cv = ref.current!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    cv.width = PW * dpr;
    cv.height = PH * dpr;
    const c = cv.getContext('2d')!;
    let raf = 0;
    let fireT = 0;
    const start = performance.now();
    let last = start;
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      fireT -= dt;
      if (fireT < -1.4) fireT = 0.07;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.clearRect(0, 0, PW, PH);
      const kick = Math.max(0, fireT + 0.15) * Math.min(3, w.recoil) * 60;
      const sc = w.previewScale;
      const since = Math.max(0, 0.07 - fireT);
      gunState.sinceShot = since;
      gunState.charge = w.charge ? Math.max(0, Math.min(1, (since - 0.25) / 0.9)) : 0;
      if (fireT > 0.069) gunState.shots++;
      c.save();
      c.translate(PW / 2 + (w.previewLen * sc) / 2 + 10 - kick, w.previewY);
      c.rotate(Math.PI / 2);
      c.scale(sc, sc);
      drawGun(c, id, 0, 0, t, Math.max(0, fireT / 0.07), fireT < -0.3 || fireT > 0.07);
      c.restore();
      for (let i = 0; i < 2; i++) {
        c.save();
        c.translate(30 + i * 0, PH - 20 - i * 14);
        c.rotate(Math.PI / 2);
        c.scale(0.6, 0.6);
        drawProjectile(c, id, 42, t + i);
        c.restore();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [id]);

  return <canvas ref={ref} style={{ width: PW, height: PH }} className="max-w-full" />;
}

function Bar({ label, v, color }: { label: string; v: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 text-[9px] font-bold tracking-wider text-white/50">{label}</div>
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all"
            style={{
              background: i <= v ? color : 'rgba(255,255,255,0.08)',
              boxShadow: i <= v ? `0 0 6px ${color}` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface WeaponPickerProps {
  value: WeaponId;
  onChange: (id: WeaponId) => void;
}

export default function WeaponPicker({
  value,
  onChange,
}: WeaponPickerProps) {
  const idx = WEAPONS.findIndex((w) => w.id === value);
  const w = WEAPONS[idx];
  const go = (d: number) => onChange(WEAPONS[(idx + d + WEAPONS.length) % WEAPONS.length].id);
  const accent = w.color;
  const rc = RARITY_COLOR[w.rarity];
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    const el = row?.querySelector<HTMLElement>(`[data-id="${value}"]`);
    if (row && el) {
      row.scrollTo({ left: el.offsetLeft - row.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
    }
  }, [value]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-black/65 p-3 backdrop-blur-md border"
      style={{
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${rc}33`,
        borderColor: `${rc}55`,
      }}
    >
      {/* Glow accent in background */}
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl"
        style={{ background: rc }}
      />

      {/* Top Header Selector */}
      <div className="relative flex items-center justify-between">
        <button
          onClick={() => go(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 active:scale-90 border border-white/10"
          aria-label="Sebelumnya"
        >
          ◀
        </button>

        <div className="text-center">
          <div
            className="mx-auto mb-1 inline-block rounded-full px-2 py-[1px] text-[9px] font-bold tracking-widest text-black"
            style={{ background: rc }}
          >
            {w.rarity === 'LEGENDARIS' ? '★ ' : ''}
            {w.rarity}
          </div>
          <div className="text-lg font-bold leading-tight drop-shadow font-game text-white flex items-center justify-center gap-1.5">
            <span>{w.emoji}</span>
            <span>{w.name}</span>
          </div>
        </div>

        <button
          onClick={() => go(1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 active:scale-90 border border-white/10"
          aria-label="Berikutnya"
        >
          ▶
        </button>
      </div>

      {/* Gun Live 2D Animated Canvas */}
      <div className="relative flex justify-center my-0.5">
        <Preview id={w.id} />
        <div className="absolute right-1 top-0 text-[10px] font-mono text-white/40">
          {idx + 1}/{WEAPONS.length}
        </div>
      </div>

      {/* Horizontal Emoji Scroller */}
      <div ref={rowRef} className="relative -mx-1 mb-2 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {WEAPONS.map((x) => {
          const sel = x.id === value;
          const c = RARITY_COLOR[x.rarity];
          return (
            <button
              key={x.id}
              data-id={x.id}
              onClick={() => onChange(x.id)}
              className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-lg text-base transition active:scale-90 border"
              style={{
                background: sel ? `${c}40` : 'rgba(255,255,255,0.05)',
                borderColor: sel ? c : 'rgba(255,255,255,0.08)',
                boxShadow: sel ? `0 0 10px ${c}` : undefined,
              }}
              title={x.name}
              aria-label={x.name}
            >
              {x.emoji}
            </button>
          );
        })}
      </div>

      {/* Quick Unlocked Status Tag */}
      <div className="mb-2 flex items-center justify-between rounded-xl bg-white/5 px-2.5 py-1.5 border border-white/10 text-[10px]">
        <span className="text-emerald-400 font-bold flex items-center gap-1">
          <span>✓</span>
          <span>TERBUKA & SIAP PAKAI</span>
        </span>
        <span className="text-amber-300 font-bold">{w.perk}</span>
      </div>

      {/* Stats */}
      <div className="relative space-y-1">
        <Bar label="KECEPATAN" v={w.stats.speed} color={accent} />
        <Bar label="RATE" v={w.stats.rate} color={accent} />
        <Bar label="POWER" v={w.stats.power} color={accent} />
      </div>

      {/* Perk Description */}
      <div className="relative mt-2 flex items-start gap-2 text-[10px] leading-snug text-white/75 bg-black/40 p-2 rounded-xl border border-white/5">
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold text-black"
          style={{ background: accent }}
        >
          {w.perk}
        </span>
        <span className="truncate">{w.desc}</span>
      </div>
    </div>
  );
}
