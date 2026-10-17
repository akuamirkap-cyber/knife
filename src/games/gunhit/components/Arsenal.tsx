import { useEffect, useRef, useState } from 'react';
import { WEAPONS, getWeapon, RARITY_COLOR, type WeaponId, type Weapon } from '../game/weapons';
import { BOSS_ROSTER, type BossProfile } from '../game/bossRoster';
import { renderBossHead } from '../game/bossRenderer';
import { drawGunCentered } from '../game/art/drawCentered';
import { getGunMetrics } from '../game/art/metrics';
import { sfx } from '../game/audio';
import { sfx4 } from '../game/sfx4';
import { useSlideActive } from '../../shared/SlideActivity';
import { SunburstFX } from '../../knife-hit/components/Effects';
import { gunSunburstColor } from '../game/sunburstPalette';
import { EDITABLE_WEAPONS, GUN_VARIANTS, getGunVariant, setGunVariant, getGunEffect, setGunEffect, canChooseGunDesign, type GunVariant } from '../game/art/gunVariants';
import GunVariantPicker from './GunVariantPicker';

type Tab = 'ALL' | 'DESAIN' | 'EPIC' | 'LANGKA' | 'LEGENDARIS' | 'UMUM' | 'BOSS';

interface ArsenalProps {
  current: WeaponId;
  highestLevel: number;
  totalCoins: number;
  onPick: (id: WeaponId) => void;
  onClose: () => void;
}

// -------------------------------------------------------------
// Gun Render: 100% PERFECT CENTER PIVOT, 30% BIGGER & ZERO CROP!
// -------------------------------------------------------------
function GunItemCanvas({ weapon, isSelected, variant, size = 110 }: { weapon: Weapon; isSelected: boolean; variant: GunVariant; size?: number }) {
  const active = useSlideActive();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = size * dpr;
    cv.height = size * dpr;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const start = performance.now();
    let lastDraw = -Infinity;

    const loop = (now: number) => {
      if (now - lastDraw < 1000 / 30 - 1) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastDraw = now;
      const t = (now - start) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      ctx.save();
      // True geometric center pivot
      ctx.translate(size / 2, size / 2);

      // Alive dynamic sway animation (tidak diam saja!)
      const sway = Math.sin(t * 2.8 + (weapon.previewLen || 180)) * 0.045;
      const selectPulse = isSelected ? Math.sin(t * 5) * 0.03 : 0;
      ctx.rotate(Math.PI / 4 + sway + selectPulse);

      // 30% LEBIH BESAR + 100% ZERO CROP FORMULA:
      // Weapon span is the true diagonal length of the gun
      const m = getGunMetrics(weapon.id, variant);
      const span = Math.max(m.span, 130);
      // Scale: 30% bigger than standard while safely fitting inside the 110px canvas
      const scale = (size * 0.92) / span;
      ctx.scale(scale, scale);

      // drawGunCentered places the true mass center precisely at (0, 0)!
      drawGunCentered(ctx, weapon.id, t, 0, true, variant, true);

      ctx.restore();

      // Eleven static thumbnails and just one animated selection: no grid of
      // twelve simultaneous canvas loops while browsing the arsenal.
      if (active && isSelected) raf = requestAnimationFrame(loop);
    };

    loop(start);
    return () => cancelAnimationFrame(raf);
  }, [weapon.id, size, isSelected, active, variant]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="block pointer-events-none drop-shadow-[0_6px_14px_rgba(0,0,0,0.7)]"
    />
  );
}

// -------------------------------------------------------------
// Top Spotlight Preview with Sunburst Rays
// -------------------------------------------------------------
function SpotlightGun({ weapon, variant }: { weapon: Weapon; variant: GunVariant }) {
  const active = useSlideActive();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = 220;
    const h = 170;
    cv.width = w * dpr;
    cv.height = h * dpr;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const start = performance.now();
    let lastDraw = -Infinity;

    const loop = (now: number) => {
      if (now - lastDraw < 1000 / 30 - 1) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastDraw = now;
      const t = (now - start) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2 + 5);

      ctx.rotate(Math.PI / 4 + Math.sin(t * 2.2) * 0.05);

      const m = getGunMetrics(weapon.id, variant);
      const span = Math.max(m.span, 130);
      const scale = (h * 0.96) / span;
      ctx.scale(scale, scale);

      drawGunCentered(ctx, weapon.id, t, 0, true, variant, true);
      ctx.restore();

      if (active) raf = requestAnimationFrame(loop);
    };

    loop(start);
    return () => cancelAnimationFrame(raf);
  }, [weapon.id, active, variant]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 220, height: 170 }}
      className="block filter drop-shadow-[0_12px_28px_rgba(255,255,255,0.45)]"
    />
  );
}

export default function Arsenal({
  current,
  highestLevel,
  totalCoins,
  onPick,
  onClose,
}: ArsenalProps) {
  const [tab, setTab] = useState<Tab>('ALL');
  const [page, setPage] = useState(0);
  const [selectedGunId, setSelectedGunId] = useState<WeaponId>(current);
  const [useRandom, setUseRandom] = useState(false);
  const [editingDesign, setEditingDesign] = useState(false);
  const [, setDesignRevision] = useState(0);
  const [selectedBoss, setSelectedBoss] = useState<BossProfile>(BOSS_ROSTER[0]);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (gridRef.current) gridRef.current.scrollTop = 0; }, [page, tab]);

  const selectedGun = getWeapon(selectedGunId);
  const selectedVariant = getGunVariant(selectedGunId);

  // Filter weapons
  const filteredWeapons = WEAPONS.filter((w) => {
    if (tab === 'ALL') return true;
    if (tab === 'DESAIN') return canChooseGunDesign(w.id);
    if (tab === 'EPIC') return w.rarity === 'EPIC';
    if (tab === 'LANGKA') return w.rarity === 'LANGKA';
    if (tab === 'LEGENDARIS') return w.rarity === 'LEGENDARIS';
    if (tab === 'UMUM') return w.rarity === 'UMUM';
    return true;
  });

  // KOTAK DIBESARKAN 40%!
  // 12 item per halaman (grid 3 kolom x 4 baris), kotak berukuran 106px x 120px sangat lega dan mantap!
  const PAGE_SIZE = 12;
  const totalPages = Math.max(1, Math.ceil(filteredWeapons.length / PAGE_SIZE));
  const currentPageWeapons = filteredWeapons.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSelectGun = (w: Weapon) => {
    setSelectedGunId(w.id);
    onPick(w.id);
    sfx.unlock();
    sfx4.match();
  };

  const handleRandomToggle = () => {
    const next = !useRandom;
    setUseRandom(next);
    if (next) {
      const randW = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
      handleSelectGun(randW);
    }
  };

  return (
    <div className="pop-in absolute inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-[#140b2d] via-[#0d0620] to-[#080314] px-4 pb-3 pt-3 text-white font-game select-none backdrop-blur-md">
      {/* Background Starfield & Mountain Silhouettes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-35">
        <div className="absolute left-8 top-16 h-1 w-1 rounded-full bg-white shadow-[0_0_6px_#fff]" />
        <div className="absolute right-12 top-28 h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_8px_#38bdf8]" />
        <div className="absolute left-1/4 top-48 h-1 w-1 rounded-full bg-yellow-200" />
        <div className="absolute right-1/4 top-72 h-1.5 w-1.5 rounded-full bg-fuchsia-300" />
        <div className="absolute -bottom-16 -left-10 -right-10 h-48 rounded-t-[50%] bg-[#05010c]/90 border-t border-purple-900/30" />
      </div>

      {/* TOP BAR */}
      <div className="relative z-10 flex items-center justify-between">
        {/* Solid Yellow Knife Hit Back Arrow */}
        <button
          onClick={onClose}
          className="flex h-11 w-12 items-center justify-center transition active:scale-90 hover:brightness-110 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
          aria-label="Kembali"
        >
          <svg viewBox="0 0 32 32" className="h-9 w-9 fill-[#facc15] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <path d="M 12 6 L 2 16 L 12 26 L 12 21 L 28 21 L 28 11 L 12 11 Z" />
          </svg>
        </button>

        {/* Currency Pill with + */}
        <div className="flex items-center gap-2 rounded-full border border-purple-400/40 bg-[#1e1038] py-1 pl-3.5 pr-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
          <span className="text-xl filter drop-shadow">🍎</span>
          <span className="font-mono text-xl font-black text-white drop-shadow">{totalCoins}</span>
          <button
            onClick={() => sfx.coin()}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-[#6366f1] to-[#4338ca] text-base font-black text-white shadow transition hover:scale-105 active:scale-95"
          >
            +
          </button>
        </div>
      </div>

      {/* TOP SPOTLIGHT */}
      <div className="relative z-10 flex flex-col items-center -mt-1">
        {/* USE ALL & STATUS BADGE */}
        <div className="w-full flex items-center justify-between px-3 text-xs font-bold">
          <div className="flex flex-col items-start gap-1 cursor-pointer" onClick={handleRandomToggle}>
            <span className="text-[10px] tracking-wider text-white/90 font-bold">USE ALL</span>
            <div className={`flex h-6 w-11 items-center rounded-full p-1 transition-colors ${useRandom ? 'bg-[#7e22ce]' : 'bg-white/20'}`}>
              <div className={`h-4 w-4 rounded-full bg-white shadow-md transform transition-transform ${useRandom ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="rounded-full px-2.5 py-0.5 text-[9.5px] font-black text-black shadow-sm"
              style={{ background: RARITY_COLOR[selectedGun.rarity] }}
            >
              {selectedGun.rarity}
            </span>
            <div className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#9333ea] to-[#7e22ce] px-2.5 py-1 border border-purple-300/40 text-[10px] font-black text-white shadow-md">
              ✓ UNLOCKED
            </div>
          </div>
        </div>

        {/* The same layered FX Lab sunburst used by Knife Boss, recolored per rarity. */}
        <div className="relative -my-3 flex items-center justify-center">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <SunburstFX size={470} color={gunSunburstColor(selectedGun.rarity)} intensity={0.85} speed={30} stars={false} />
          </div>
          <div className="relative z-10"><SpotlightGun weapon={selectedGun} variant={selectedVariant} /></div>
        </div>

        {/* Active Gun Name & Perk */}
        <div className="flex items-center gap-2 -mt-1">
          <span className="text-xl font-black text-yellow-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] font-game">
            {selectedGun.name}
          </span>
          <span className="rounded-lg bg-yellow-400/20 px-2 py-0.5 text-[9px] font-bold text-yellow-300 border border-yellow-400/40">
            {selectedGun.perk}
          </span>
        </div>
        {canChooseGunDesign(selectedGunId) && (
          <button type="button" onClick={() => setEditingDesign(true)}
            aria-label={`Bandingkan desain ${selectedGun.name}`}
            className="relative mt-1.5 rounded-xl border border-amber-200/70 bg-[#342354] px-4 py-1 text-[11px] font-black text-amber-200 shadow-[0_0_12px_rgba(250,204,21,0.22)] transition hover:bg-[#4d3475] active:scale-95">
            ✦ PILIH DESAIN · {GUN_VARIANTS.find((v) => v.id === selectedVariant)?.label.toUpperCase()} ▸
          </button>
        )}
      </div>

      {/* TABS ROW */}
      <div className="relative z-10 flex flex-col">
        <div className="flex items-end justify-center gap-1.5 px-2">
          {[
            { id: 'ALL', icon: '👑', label: 'ALL' },
            { id: 'DESAIN', icon: '🎨', label: 'DESAIN' },
            { id: 'EPIC', icon: '🎬', label: 'EPIC' },
            { id: 'LANGKA', icon: '🎃', label: 'RARE' },
            { id: 'LEGENDARIS', icon: '🎩', label: 'LEGEND' },
            { id: 'UMUM', icon: '🎁', label: 'CLASSIC' },
            { id: 'BOSS', icon: '👹', label: 'BOSSES' },
          ].map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                aria-label={t.label}
                onClick={() => {
                  setTab(t.id as Tab);
                  setPage(0);
                  sfx.unlock();
                }}
                className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-t-xl transition-all ${
                  active
                    ? 'bg-[#7e22ce] text-white shadow-lg border-t-2 border-x-2 border-purple-300/60 pb-2.5 z-20'
                    : 'bg-[#2a174c]/70 text-white/50 hover:text-white/80 border-t border-x border-purple-500/20'
                }`}
              >
                <span className="text-xl leading-none filter drop-shadow">{t.icon}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-[#7e22ce] py-1 text-center text-xs font-black tracking-widest text-white shadow-md uppercase border-t border-purple-300/40">
          {tab === 'ALL'
            ? 'ALL WEAPONS'
            : tab === 'DESAIN'
            ? `${EDITABLE_WEAPONS.length} DESAIN · KETUK SENJATA UNTUK MEMILIH`
            : tab === 'EPIC'
            ? 'EPIC ARSENAL'
            : tab === 'LANGKA'
            ? 'RARE COLLECTION'
            : tab === 'LEGENDARIS'
            ? 'LEGENDARY WEAPONS'
            : tab === 'UMUM'
            ? 'CLASSIC WEAPONS'
            : 'CARTOON BOSS HEADS'}
        </div>
      </div>

      {/* -------------------------------------------------------------
          MAIN GRID: KOTAK DIBESARKAN 40% (106px x 122px)
          + TRUE CENTER PIVOT (SENJATA TEPAT DI TENGAH!)
          + VISUAL SENJATA DIBESARKAN 30% TANPA KECROP
          + LABEL RARITY DI ATAS KIRI KOTAK RAPI
          + LABEL NAMA SENJATA DI BAWAH KOTAK 100% TERBACA JELAS
         ------------------------------------------------------------- */}
      <div className="relative z-10 flex-1 min-h-0 bg-[#120726] p-2.5 border-x border-b border-purple-500/30 shadow-2xl flex flex-col rounded-b-2xl">
        {tab !== 'BOSS' ? (
          <>
            {/* Keep all twelve large thumbnails reachable on a 9:16 screen.
                Scroll only the grid; the spotlight and page controls stay put. */}
            <div ref={gridRef} aria-label="Senjata, gulir untuk melihat semua" className="grid grid-cols-3 auto-rows-[126px] content-start gap-2.5 flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-0.5 items-center justify-items-center">
              {currentPageWeapons.map((w) => {
                const isSelected = selectedGunId === w.id;
                const rc = RARITY_COLOR[w.rarity];
                const rarityLabel =
                  w.rarity === 'LEGENDARIS'
                    ? 'LEGEND'
                    : w.rarity === 'LANGKA'
                    ? 'RARE'
                    : w.rarity === 'EPIC'
                    ? 'EPIC'
                    : 'UMUM';

                return (
                  <button
                    key={w.id}
                    onClick={() => handleSelectGun(w)}
                    className={`relative flex h-[124px] w-[104px] flex-col items-center justify-between p-1.5 rounded-2xl transition-all active:scale-95 ${
                      isSelected
                        ? 'border-[3.5px] border-[#fef08a] bg-[#2d1656] shadow-[0_0_24px_rgba(253,224,71,0.95),inset_0_0_12px_rgba(253,224,71,0.35)] z-10 scale-[1.02]'
                        : 'border border-purple-500/30 bg-[#1e1038] hover:bg-[#27144a]'
                    }`}
                  >
                    {/* 1. LABEL RARITY DI ATAS KIRI KOTAK DENGAN BADGE TEGAS! */}
                    <div className="w-full flex items-center justify-between z-10">
                      <div
                        className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[8.5px] font-black text-black tracking-wider shadow-md"
                        style={{ background: rc }}
                      >
                        <span>{rarityLabel}</span>
                      </div>
                      {isSelected && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 text-[9px] font-black text-black shadow">
                          ✓
                        </span>
                      )}
                    </div>

                    {/* 2. VISUAL SENJATA: EXACT CENTER PIVOT, 30% LEBIH BESAR, 100% UTUH NO CROP! */}
                    <div className="flex-1 flex items-center justify-center w-full my-auto overflow-visible">
                      <GunItemCanvas weapon={w} isSelected={isSelected} variant={getGunVariant(w.id)} size={82} />
                    </div>

                    {/* 3. LABEL NAMA SENJATA DI BAWAH KOTAK (JELAS, TEBAL, TIDAK TERPOTONG!) */}
                    <div className="w-full text-[9px] font-black text-center text-white leading-tight bg-black/75 py-1 rounded-lg px-1 border border-white/10 shadow-inner z-10">
                      <span className="truncate block drop-shadow">{w.name}</span>
                    </div>
                  </button>
                );
              })}

              {/* Empty placeholder slots */}
              {Array.from({ length: Math.max(0, PAGE_SIZE - currentPageWeapons.length) }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex h-[124px] w-[104px] items-center justify-center rounded-2xl border border-purple-900/30 bg-[#140b28]/50 opacity-20"
                />
              ))}
            </div>

            {/* Pagination Controls & Dots */}
            <div className="flex items-center justify-between pt-1.5 px-2">
              <button
                disabled={page <= 0}
                onClick={() => {
                  setPage((p) => Math.max(0, p - 1));
                  sfx.unlock();
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-xl bg-purple-900/50 text-xl font-bold transition ${
                  page <= 0 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-purple-700 active:scale-90 text-white'
                }`}
              >
                ◀
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`h-2.5 rounded-full transition-all ${page === i ? 'w-6 bg-[#a855f7]' : 'w-2 bg-white/20'}`}
                  />
                ))}
              </div>

              <button
                disabled={page >= totalPages - 1}
                onClick={() => {
                  setPage((p) => Math.min(totalPages - 1, p + 1));
                  sfx.unlock();
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-xl bg-purple-900/50 text-xl font-bold transition ${
                  page >= totalPages - 1 ? 'opacity-20 cursor-not-allowed' : 'hover:bg-purple-700 active:scale-90 text-white'
                }`}
              >
                ▶
              </button>
            </div>
          </>
        ) : (
          /* Boss Heads Tab */
          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-1">
            <div className="flex items-center gap-4 rounded-2xl border border-purple-400/40 bg-[#1e1038] p-3 shadow-lg">
              <div
                className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border-2 overflow-hidden bg-black/50"
                style={{ borderColor: selectedBoss.accent }}
              >
                <canvas
                  ref={(cv) => {
                    if (!cv) return;
                    cv.width = cv.height = 160;
                    const ctx = cv.getContext('2d');
                    if (!ctx) return;
                    ctx.setTransform(2, 0, 0, 2, 0, 0);
                    ctx.clearRect(0, 0, 80, 80);
                    ctx.save();
                    ctx.translate(40, 40);
                    renderBossHead(ctx, selectedBoss.id, 35);
                    ctx.restore();
                  }}
                  style={{ width: 80, height: 80 }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg font-black text-white" style={{ color: selectedBoss.accent }}>
                  {selectedBoss.name}
                </div>
                <div className="text-xs font-bold text-white/70">{selectedBoss.title}</div>
                <div className="text-[10px] text-white/50 mt-0.5 leading-tight">{selectedBoss.desc}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {BOSS_ROSTER.map((b, idx) => {
                const beaten = highestLevel >= (idx + 1) * 5;
                const isSel = selectedBoss.id === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setSelectedBoss(b);
                      sfx.unlock();
                    }}
                    className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${
                      isSel ? 'border-amber-300 bg-[#2d1656]' : 'border-purple-500/20 bg-[#1e1038] hover:bg-[#27144a]'
                    }`}
                  >
                    <span className="text-2xl">{b.id === 'knight' ? '🛡️' : b.id === 'oni' ? '👺' : b.id === 'cyborg' ? '🤖' : '🏴‍☠️'}</span>
                    <div>
                      <div className="text-xs font-bold text-white leading-none">{b.name}</div>
                      <div className="text-[9px] text-white/50 mt-0.5">LEVEL {(idx + 1) * 5} {beaten ? '✓' : ''}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER BAR */}
      <div className="relative z-10 mt-2.5 flex h-11 w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#4c1d95] via-[#6d28d9] to-[#4c1d95] px-4 font-game text-xs font-black shadow-xl border border-purple-300/40">
        <span className="rounded-xl bg-black/40 px-3 py-1 font-mono text-sm text-yellow-300">
          {WEAPONS.length} / {WEAPONS.length}
        </span>
        <span className="tracking-widest text-white drop-shadow">GUNS UNLOCKED</span>
      </div>
      {editingDesign && canChooseGunDesign(selectedGunId) && (
        <GunVariantPicker
          weapon={selectedGun}
          variantId={selectedGunId}
          selected={selectedVariant}
          effect={getGunEffect(selectedGunId)}
          onSelect={(variant) => {
            setGunVariant(selectedGunId, variant);
            setDesignRevision((n) => n + 1);
            sfx.unlock();
          }}
          onEffectSelect={(effect) => {
            setGunEffect(selectedGunId, effect);
            setDesignRevision((n) => n + 1);
            sfx.unlock();
          }}
          onClose={() => setEditingDesign(false)}
        />
      )}
    </div>
  );
}
