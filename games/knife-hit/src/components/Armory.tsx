import { useEffect, useState } from "react";
import {
  RARITY_STYLE,
  WEAPONS,
  WEAPON_PRICE,
  ShinyWeapon,
  WeaponArt,
  getWeaponStats,
  type Rarity,
  type WeaponDef,
} from "../weapons";
import { sfx } from "../sfx";

const PAGE_SIZE = 9;

const ARM_TABS: { id: Rarity | "ALL"; icon: string; label: string }[] = [
  { id: "ALL", icon: "👑", label: "SEMUA" },
  { id: "COMMON", icon: "🪙", label: "UMUM" },
  { id: "RARE", icon: "💎", label: "RARE" },
  { id: "EPIC", icon: "🔮", label: "EPIC" },
  { id: "LEGEND", icon: "🔥", label: "LEGEND" },
  { id: "MYTHIC", icon: "🌈", label: "MYTHIC" },
];

const RAR_SHORT: Record<Rarity, string> = {
  COMMON: "UMUM",
  RARE: "RARE",
  EPIC: "EPIC",
  LEGEND: "LEGEND",
  MYTHIC: "MYTHIC",
};

export function ArmoryScreen({
  coins,
  unlocked,
  equippedId,
  onEquip,
  onBuy,
  onWatchAd,
  onClose,
}: {
  coins: number;
  unlocked: string[];
  equippedId: string;
  onEquip: (id: string) => void;
  onBuy: (id: string) => void;
  onWatchAd: (id: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Rarity | "ALL">("ALL");
  const [selId, setSelId] = useState<string>(equippedId);
  const [page, setPage] = useState(0);
  const [quickEquip, setQuickEquip] = useState(false);

  const list = WEAPONS.filter((w) => tab === "ALL" || w.rarity === tab);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const visible = list.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const sel: WeaponDef = WEAPONS.find((w) => w.id === selId) ?? list[0] ?? WEAPONS[0];
  const selSt = RARITY_STYLE[sel.rarity];
  const hasSel = unlocked.includes(sel.id);
  const isEq = equippedId === sel.id;
  const price = WEAPON_PRICE[sel.rarity];
  const afford = coins >= price;

  useEffect(() => {
    setPage(0);
    if (list.length > 0 && !list.some((w) => w.id === selId)) setSelId(list[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const pick = (w: WeaponDef) => {
    if (quickEquip && unlocked.includes(w.id) && w.id !== equippedId) {
      sfx.equip();
      onEquip(w.id);
    } else {
      sfx.click();
    }
    setSelId(w.id);
  };

  const changeTab = (t: Rarity | "ALL") => {
    sfx.click();
    setTab(t);
  };

  return (
    <div
      className="fade-in absolute inset-0 z-20 flex flex-col overflow-hidden"
      style={{ background: "linear-gradient(180deg,#2b1458 0%,#1c0c3d 45%,#100722 100%)" }}
    >
      {/* ambient glow */}
      <div
        className="glow-breathe pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{ background: selSt.color }}
      />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-fuchsia-600/25 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />

      {/* ===== TOP BAR ala gambar 2 ===== */}
      <div className="relative flex items-center gap-2 px-3 pt-3">
        <button
          onClick={() => {
            sfx.click();
            onClose();
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-b-4 border-[#c25700] bg-gradient-to-b from-[#ffb03d] to-[#ef7d00] text-[22px] font-black text-white shadow-lg active:translate-y-0.5 active:border-b-2"
          aria-label="Kembali"
        >
          ‹
        </button>
        <div className="flex flex-col leading-none">
          <span className="text-[12px] font-black tracking-widest text-white/90">USE ALL</span>
          <button
            onClick={() => {
              sfx.click();
              setQuickEquip((v) => !v);
            }}
            className={`relative mt-1 h-6 w-11 rounded-full transition-colors ${quickEquip ? "bg-gradient-to-r from-lime-300 to-emerald-400" : "bg-white/20"}`}
            aria-label="Quick equip"
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${quickEquip ? "left-[22px]" : "left-0.5"}`}
            />
          </button>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 py-1 pl-3 pr-1 backdrop-blur">
          <span className="text-[16px]">🍎</span>
          <span className="text-[15px] font-black tabular-nums text-white">{coins.toLocaleString("id-ID")}</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3b82f6] text-[16px] font-black text-white">
            +
          </span>
        </div>
      </div>

      {/* ===== SHOWCASE + sunburst ===== */}
      <div
        className="relative mx-3 mt-2 overflow-hidden rounded-2xl border border-white/10"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, rgba(255,255,255,.10), transparent 55%), linear-gradient(180deg,#331a6b,#1d0d40)",
        }}
      >
        {/* sunburst rapi — tipis & pendek */}
        <div className="pointer-events-none absolute left-1/2 top-[44%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 opacity-80">
          <div
            className="spin-khas h-full w-full rounded-full"
            style={{
              background:
                "repeating-conic-gradient(from -6deg, rgba(255,255,255,.22) 0deg 8deg, transparent 8deg 30deg)",
              WebkitMaskImage: "radial-gradient(circle, #000 0%, #000 38%, transparent 68%)",
              maskImage: "radial-gradient(circle, #000 0%, #000 38%, transparent 68%)",
            }}
          />
          <div
            className="spin-khas-rev absolute inset-0 h-full w-full rounded-full"
            style={{
              background: `repeating-conic-gradient(from 9deg, ${selSt.color}44 0deg 5deg, transparent 5deg 30deg)`,
              WebkitMaskImage: "radial-gradient(circle, #000 0%, #000 35%, transparent 65%)",
              maskImage: "radial-gradient(circle, #000 0%, #000 35%, transparent 65%)",
            }}
          />
        </div>
        <div
          className="glow-breathe pointer-events-none absolute left-1/2 top-[44%] h-24 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
          style={{ background: selSt.glow }}
        />

        {/* badge kanan atas */}
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1.5">
          <span
            className="rounded-full px-2.5 py-1 text-[12px] font-black tracking-widest"
            style={{ background: selSt.color, color: "#1c0b33", boxShadow: `0 0 12px ${selSt.glow}` }}
          >
            {sel.rarity}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[12px] font-black tracking-widest ${
              isEq
                ? "bg-emerald-400 text-emerald-950"
                : hasSel
                  ? "bg-violet-400 text-violet-950"
                  : "bg-white/15 text-white/70"
            }`}
          >
            {isEq ? "✓ DIPAKAI" : hasSel ? "✓ UNLOCKED" : "🔒 LOCKED"}
          </span>
        </div>

        {/* senjata besar miring diagonal ala gambar 2 */}
        <div className="relative mx-auto mt-0 h-[128px] w-[240px]">
          <div key={sel.id} className="pop-in h-full w-full">
            <div
              style={{ transform: "rotate(-38deg) scale(1.22)", transformOrigin: "50% 55%" }}
              className="h-full w-full"
            >
              <div className="float-y h-full w-full">
                {hasSel ? (
                  <ShinyWeapon id={sel.id} className="h-full w-full" glow={selSt.glow} />
                ) : (
                  <WeaponArt id={sel.id} silhouette className="h-full w-full" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* nama + combo */}
        <p
          className="relative mt-0.5 px-2 text-center text-[20px] font-black uppercase leading-tight tracking-wide text-[#ffd21f]"
          style={{ textShadow: "0 2px 0 #7a4a00, 0 0 18px rgba(255,210,31,.35)" }}
        >
          {hasSel ? sel.name : "??? TERKUNCI"}
        </p>
        <div className="relative mt-0.5 flex justify-center gap-1.5">
          <span className="rounded-full border border-amber-300/40 bg-black/55 px-3 py-0.5 text-[12px] font-black text-amber-300">
            ⚡ {sel.power} · 💥 DMG {getWeaponStats(sel).damage}
          </span>
          <span className="rounded-full border border-sky-300/40 bg-black/55 px-3 py-0.5 text-[12px] font-black text-sky-200">
            {getWeaponStats(sel).speedIcon} {getWeaponStats(sel).speedLabel}
          </span>
        </div>

        {/* aksi */}
        <div className="relative px-3 pb-2.5 pt-1.5">
          {isEq ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-300 bg-emerald-500/15 px-4 py-2 text-[15px] font-black tracking-wide text-emerald-200">
              ✓ SEDANG DIPAKAI
            </div>
          ) : hasSel ? (
            <button
              onClick={() => {
                sfx.equip();
                onEquip(sel.id);
              }}
              className="relative w-full overflow-hidden rounded-xl border-b-4 border-emerald-900 bg-gradient-to-b from-[#6ef59a] to-[#149a4a] py-2 text-[16px] font-black tracking-widest text-white active:translate-y-0.5"
            >
              <span className="pointer-events-none absolute inset-x-4 top-0.5 h-[36%] rounded-lg bg-white/25" />
              ⚡ EQUIP
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => afford && onBuy(sel.id)}
                className={`relative flex-1 overflow-hidden rounded-xl border-b-4 py-2 text-[15px] font-black active:translate-y-0.5 ${
                  afford
                    ? "border-[#7a4a00] bg-gradient-to-b from-[#ffe27a] to-[#dd8d00] text-[#4a2c00]"
                    : "border-white/10 bg-white/10 text-white/40"
                }`}
              >
                {price.toLocaleString("id-ID")} 💵
              </button>
              <button
                onClick={() => onWatchAd(sel.id)}
                className="relative flex-1 overflow-hidden rounded-xl border-b-4 border-emerald-900 bg-gradient-to-b from-[#6ef59a] to-[#149a4a] py-2 text-[15px] font-black text-white active:translate-y-0.5"
              >
                📺 FREE
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== TAB IKON ala gambar 2 ===== */}
      <div className="relative mt-2 flex justify-center gap-1.5 px-3">
        {ARM_TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => changeTab(t.id)}
              title={t.label}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 text-[19px] transition active:scale-90 ${
                active
                  ? "border-white/80 bg-gradient-to-b from-[#a86bff] to-[#6a25e0] shadow-[0_0_14px_rgba(168,107,255,.6)]"
                  : "border-white/10 bg-white/[.07]"
              }`}
            >
              {t.icon}
            </button>
          );
        })}
      </div>

      {/* ===== HEADER UNGU ===== */}
      <div className="relative mx-3 mt-1.5 rounded-lg bg-gradient-to-b from-[#8b46ff] to-[#5f21d6] py-1.5 text-center text-[14px] font-black tracking-[0.2em] text-white shadow-[0_4px_14px_rgba(120,60,255,.4),inset_0_1px_0_rgba(255,255,255,.3)]">
        {tab === "ALL" ? "ALL WEAPONS" : `${tab} WEAPONS`}
      </div>

      {/* ===== GRID 3 KOLOM — kotak etalase besar ===== */}
      <div className="thin-scroll relative mx-3 mt-1.5 grid flex-1 grid-cols-3 content-start gap-1.5 overflow-y-auto pb-1">
        {visible.map((w, idx) => {
          const has = unlocked.includes(w.id);
          const eq = equippedId === w.id;
          const selected = selId === w.id;
          const st = RARITY_STYLE[w.rarity];
          return (
            <button
              key={w.id}
              onClick={() => pick(w)}
              className={`card-in relative flex h-[132px] flex-col overflow-visible rounded-xl border-2 p-1.5 text-left transition active:scale-95 ${
                selected ? "border-[#ffd21f]" : "border-white/10"
              }`}
              style={{
                background: "linear-gradient(180deg,#341c6e,#20104a)",
                boxShadow: selected
                  ? `0 0 16px ${st.glow}, 0 0 0 1px #ffd21f`
                  : "0 4px 10px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.12)",
                animationDelay: `${Math.min(idx, 8) * 0.05}s`,
              }}
            >
              <span
                className="w-fit rounded px-1.5 py-px text-[12px] font-black tracking-wide"
                style={{ background: st.color, color: "#1c0b33" }}
              >
                {RAR_SHORT[w.rarity]}
              </span>
              <span className="relative mx-auto -my-1 flex h-[68px] w-full items-center justify-center overflow-visible">
                <span
                  className="block h-[64px] w-[116px]"
                  style={{ transform: "rotate(-32deg) scale(1.22)", transformOrigin: "50% 50%" }}
                >
                  <WeaponArt
                    id={w.id}
                    silhouette={!has}
                    className="h-full w-full"
                    style={has ? { filter: `drop-shadow(0 0 6px ${st.glow})` } : undefined}
                  />
                </span>
              </span>
              <span className="mt-1 truncate rounded-md bg-black/70 px-1 py-[3px] text-center text-[12px] font-black uppercase text-white">
                {has ? w.name : "???"}
              </span>
              {eq && (
                <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[12px] font-black text-emerald-950 shadow">
                  ✓
                </span>
              )}
              {!has && (
                <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/60 bg-gradient-to-b from-[#38bdf8] to-[#034a7a] text-[12px] shadow">
                  🔒
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ===== PAGER dots + panah ===== */}
      <div className="relative flex items-center justify-center gap-2 py-1">
        <button
          onClick={() => {
            sfx.click();
            setPage((p) => (p - 1 + pages) % pages);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[14px] font-black text-white/80 active:scale-90"
          aria-label="Halaman sebelumnya"
        >
          ‹
        </button>
        {Array.from({ length: pages }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              sfx.click();
              setPage(i);
            }}
            aria-label={`Halaman ${i + 1}`}
            className={`h-2 rounded-full transition-all ${i === safePage ? "w-5 bg-[#c4a5ff]" : "w-2 bg-white/25"}`}
          />
        ))}
        <button
          onClick={() => {
            sfx.click();
            setPage((p) => (p + 1) % pages);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[14px] font-black text-white/80 active:scale-90"
          aria-label="Halaman berikutnya"
        >
          ›
        </button>
      </div>

      {/* ===== BOTTOM BAR ===== */}
      <div className="relative mx-3 mb-2.5 flex items-center justify-between rounded-full bg-gradient-to-b from-[#7c3ff0] to-[#4c1cb8] px-2 py-1.5 shadow-[0_6px_18px_rgba(90,30,200,.45),inset_0_1px_0_rgba(255,255,255,.25)]">
        <span className="rounded-full bg-black/50 px-3 py-1 text-[13px] font-black tabular-nums text-amber-300">
          {unlocked.length} / {WEAPONS.length}
        </span>
        <span className="pr-2 text-[13px] font-black tracking-[0.18em] text-white">GUNS UNLOCKED</span>
      </div>
    </div>
  );
}
