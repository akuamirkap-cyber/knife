import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CATALOG, Game, GAME_H, GAME_W, RARITY_COLOR, RARITY_LABEL, BY_ID,
  type BuffId, type HudInfo, type Rarity, type StageId, type TreasureBuff,
} from './game/engine';
import { useSlideActive } from '../shared/SlideActivity';

const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'legend'];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex justify-center gap-2 my-3">
      {[1, 2, 3].map((i) => (
        <svg key={i} viewBox="0 0 24 24"
          className={`w-11 h-11 star-pop ${i <= n ? 'text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]' : 'text-white/15'}`}
          style={{ animationDelay: `${0.5 + i * 0.2}s` }}>
          <path fill="currentColor" d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18.3 5.5 22l1.7-7.4-5.7-5 7.5-.7z" />
        </svg>
      ))}
    </div>
  );
}

const STAGES: { id: StageId; icon: string; name: string; desc: string; color: string }[] = [
  { id: 'classic', icon: '💎', name: 'Klasik', desc: 'Hancurkan batu sampai diamond bersih', color: '#67e8f9' },
  { id: 'bonus', icon: '🪙', name: 'Bonus', desc: 'Putaran santai 1 arah, koin merata di semua sisi', color: '#fbbf24' },
  { id: 'treasure', icon: '🧰', name: 'Harta Karun', desc: '10 detik! Berondong peti demi koin sebanyaknya', color: '#f472b6' },
];

const TBUFFS: { id: TreasureBuff; icon: string; title: string; desc: string; color: string }[] = [
  { id: 'rapid', icon: '⚡', title: 'TEMBAK 2X CEPAT', desc: 'Rate of fire dua kali lipat', color: '#38bdf8' },
  { id: 'double', icon: '🔱', title: 'DOUBLE SHOT', desc: 'Dua peluru tiap tembakan', color: '#4ade80' },
  { id: 'mini', icon: '✨', title: 'PELURU MINI', desc: 'Peluru kecil tapi beruntun lebih rapat', color: '#c084fc' },
  { id: 'giant', icon: '🔆', title: 'PELURU 2X BESAR', desc: 'Peluru raksasa, tiap hit lebih banyak koin', color: '#fb923c' },
];

const BUFFS: { id: BuffId; icon: string; title: string; desc: string; color: string }[] = [
  { id: 'speed', icon: '⚡', title: 'TEMBAK 2X CEPAT', desc: 'Rate of fire dua kali lipat', color: '#38bdf8' },
  { id: 'ammo', icon: '🧰', title: 'AMMO 2X', desc: 'Kapasitas magasin dua kali lipat', color: '#4ade80' },
  { id: 'power', icon: '💥', title: 'DAYA HANCUR 2X', desc: 'Damage & ledakan dua kali lipat', color: '#fb923c' },
];

export default function App({ onExit }: { onExit?: () => void } = {}) {
  const active = useSlideActive();
  const activeRef = useRef(active);
  activeRef.current = active;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [hud, setHud] = useState<HudInfo | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [rarity, setRarity] = useState<Rarity>('common');
  const [twin, setTwin] = useState(false);
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState<StageId>('classic');

  useEffect(() => {
    const g = new Game(canvasRef.current!, setHud);
    gameRef.current = g;
    g.setActive(activeRef.current);
    g.pushHud();
    const kd = (e: KeyboardEvent) => {
      if (!activeRef.current) return;
      if (e.code === 'Space') { e.preventDefault(); if (g.state === 'playing') g.setFiring(true); }
      if (e.key.toLowerCase() === 'r') g.reload();
      if (e.key.toLowerCase() === 'q') setPickerOpen((v) => !v);
      if (e.key === 'Enter' && g.state !== 'playing') g.start();
    };
    const ku = (e: KeyboardEvent) => { if (activeRef.current && e.code === 'Space') g.setFiring(false); };
    const up = () => g.setFiring(false);
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    window.addEventListener('pointerup', up);
    window.addEventListener('blur', up);
    return () => {
      g.destroy();
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('blur', up);
    };
  }, []);

  useEffect(() => { gameRef.current?.setActive(active); }, [active]);

  const g = gameRef.current;
  const state = hud?.state ?? 'menu';
  const wdef = BY_ID[hud?.weapon ?? 'ak47'];
  const time = hud?.time ?? 95;
  const pct = Math.round((hud?.progress ?? 0) * 100);
  const accuracy = hud && hud.shots > 0 ? Math.round((hud.hits / hud.shots) * 100) : 0;
  const choosing = !!hud?.choosing;

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CATALOG.filter((w) => (q ? w.name.toLowerCase().includes(q) || w.perk.toLowerCase().includes(q) : w.rarity === rarity));
  }, [rarity, query]);

  const canvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * GAME_W, y: ((e.clientY - r.top) / r.height) * GAME_H };
  };

  return (
    <div className="w-full h-full bg-[#04050a] flex items-center justify-center select-none overflow-hidden relative">
      {onExit && (
        <button
          onClick={onExit}
          className="fixed top-3 left-3 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all shadow-lg active:scale-95 cursor-pointer"
          title="Keluar Fullscreen"
        >
          ✕ Keluar
        </button>
      )}
      <div
        className="relative w-full h-full shadow-[0_0_90px_rgba(80,160,255,0.18)]"
        style={{ width: `${GAME_W}px`, height: `${GAME_H}px` }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
          onPointerDown={(e) => {
            e.preventDefault();
            const p = canvasPoint(e);
            const consumed = g?.pointerDown(p.x, p.y);
            if (!consumed && g?.state === 'playing') g.setFiring(true);
          }}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Top HUD */}
        {state === 'playing' && (
          <div className="absolute top-0 inset-x-0 p-3 pointer-events-none">
            <div className="flex items-start justify-between text-white">
              <div className="bg-black/45 backdrop-blur rounded-xl px-3 py-1.5 border border-white/10">
                <div className="text-[10px] uppercase tracking-widest text-white/50">Skor</div>
                <div className="font-black text-lg leading-none tabular-nums">{hud?.score ?? 0}</div>
              </div>
              <div className={`bg-black/45 backdrop-blur rounded-xl px-4 py-1.5 border border-white/10 text-center ${time < 15 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                <div className="text-[10px] uppercase tracking-widest text-white/50">Waktu</div>
                <div className="font-black text-xl leading-none tabular-nums">{time.toFixed(1)}</div>
              </div>
              {stage === 'classic' ? (
                <div className="bg-black/45 backdrop-blur rounded-xl px-3 py-1.5 border border-white/10 text-right">
                  <div className="text-[10px] uppercase tracking-widest text-white/50">⭐ Bintang</div>
                  <div className="font-black text-lg leading-none">{hud?.starsHit ?? 0}</div>
                </div>
              ) : (
                <div className="bg-amber-400/15 backdrop-blur rounded-xl px-3 py-1.5 border border-amber-300/40 text-right">
                  <div className="text-[10px] uppercase tracking-widest text-amber-200/70">🪙 Koin</div>
                  <div key={hud?.coins} className="coin-pop font-black text-xl leading-none text-amber-300 tabular-nums">{hud?.coins ?? 0}</div>
                </div>
              )}
            </div>
            {stage === 'classic' && (
              <div className="mt-2 mx-auto w-4/5">
                <div className="flex justify-between text-[10px] text-cyan-200/80 font-bold uppercase tracking-wider mb-1">
                  <span>Batu hancur</span><span>{pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/10 overflow-hidden border border-white/10">
                  <div className="h-full bg-gradient-to-r from-amber-600 via-amber-300 to-cyan-300 transition-all duration-200" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}
            {stage === 'treasure' && (
              <div className="mt-1 text-center">
                <div className="inline-block px-3 py-1 rounded-full bg-pink-500/20 border border-pink-300/40 text-[10px] font-black text-pink-200">
                  🧰 BERONDONG PETINYA! {hud?.tBuff ? '· BONUS AKTIF' : ''}
                </div>
              </div>
            )}
            <div className="mt-2 flex justify-center gap-1.5">
              {BUFFS.filter((b) => (hud?.buffs?.[b.id] ?? 0) > 0).map((b) => (
                <span key={b.id} className="text-[10px] font-black px-2 py-0.5 rounded-full border"
                  style={{ color: b.color, borderColor: `${b.color}66`, background: `${b.color}1a` }}>
                  {b.icon} x{Math.pow(2, hud!.buffs[b.id])}
                </span>
              ))}
            </div>
            {!!hud?.combo && hud.combo > 2 && (
              <div className="mt-2 text-center">
                <span key={hud.combo} className="combo-pop inline-block px-3 py-1 rounded-full text-sm font-black text-black bg-gradient-to-r from-amber-300 to-orange-400 shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                  COMBO x{hud.combo}
                </span>
              </div>
            )}
          </div>
        )}

        {/* current weapon + controls */}
        {state === 'playing' && hud && (
          <>
            <button
              onPointerDown={(e) => { e.stopPropagation(); setPickerOpen(true); }}
              className="absolute left-2 bottom-3 z-10 flex items-center gap-2 rounded-2xl border bg-black/60 backdrop-blur px-3 py-2 text-left"
              style={{ borderColor: `${wdef.glow}77`, boxShadow: `0 0 16px ${wdef.glow}44` }}
            >
              <span className="text-2xl">{wdef.emoji}</span>
              <span>
                <span className="block text-[11px] font-black text-white leading-tight">{wdef.name}</span>
                <span className="block text-[9px] font-bold" style={{ color: RARITY_COLOR[wdef.rarity] }}>{wdef.perk}</span>
                <span className="block text-[9px] text-white/50">Ganti senjata (Q)</span>
              </span>
            </button>
            <div className="absolute right-2 bottom-3 z-10 flex flex-col items-end gap-2">
              <div className="rounded-xl px-3 py-2 border bg-black/60 backdrop-blur text-right min-w-[112px]" style={{ borderColor: `${wdef.glow}66` }}>
                <div className="text-[10px] uppercase tracking-widest text-white/40">Amunisi</div>
                {hud.reloading ? (
                  <>
                    <div className="text-amber-300 font-black text-sm animate-pulse">RELOADING</div>
                    <div className="h-1.5 mt-1 rounded bg-white/10 overflow-hidden">
                      <div className="h-full bg-amber-300" style={{ width: `${hud.reloadPct * 100}%` }} />
                    </div>
                  </>
                ) : (
                  <div className={`font-black text-2xl leading-none tabular-nums ${hud.ammo <= hud.mag * 0.2 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {hud.ammo}<span className="text-sm text-white/40">/{hud.mag}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-1.5">
                <button
                  onPointerDown={(e) => { e.stopPropagation(); setTwin((v) => { g?.setTwin(!v); return !v; }); }}
                  className={`font-black text-[10px] rounded-lg px-2 py-1.5 border ${twin ? 'bg-cyan-400 text-black border-cyan-200' : 'bg-black/60 text-white/70 border-white/15'}`}
                >DUAL 🔫🔫</button>
                <button
                  onPointerDown={(e) => { e.stopPropagation(); g?.reload(); }}
                  className="bg-amber-500/85 hover:bg-amber-400 text-black font-black text-[10px] rounded-lg px-2 py-1.5"
                >RELOAD (R)</button>
              </div>
            </div>
          </>
        )}

        {/* Buff choice */}
        {choosing && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm px-5">
            <div className="text-5xl mb-1 animate-bounce">⭐</div>
            <div className="text-xs tracking-[0.35em] text-amber-300 font-bold">BINTANG BONUS</div>
            <h2 className="text-2xl font-black text-white mt-1 mb-4">Pilih Satu Upgrade</h2>
            <div className="w-full max-w-xs space-y-2.5">
              {(stage === 'treasure' ? TBUFFS : BUFFS).map((b, i) => (
                <button
                  key={b.id}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    if (stage === 'treasure') g?.chooseTreasure(b.id as TreasureBuff);
                    else g?.chooseBuff(b.id as BuffId);
                  }}
                  className="panel-in w-full flex items-center gap-3 rounded-2xl border px-4 py-3 text-left bg-slate-900/90 hover:scale-[1.03] active:scale-95 transition"
                  style={{ borderColor: `${b.color}88`, boxShadow: `0 0 22px ${b.color}33`, animationDelay: `${i * 0.08}s` }}
                >
                  <span className="text-3xl">{b.icon}</span>
                  <span>
                    <span className="block font-black text-white text-sm">{b.title}</span>
                    <span className="block text-[11px] text-white/60">{b.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Weapon picker */}
        {pickerOpen && (
          <div className="absolute inset-0 z-40 flex flex-col bg-slate-950/95 backdrop-blur">
            <div className="p-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-black text-lg">🔫 Gudang Senjata <span className="text-white/40 text-xs">({CATALOG.length})</span></h2>
                <button onPointerDown={(e) => { e.stopPropagation(); setPickerOpen(false); }}
                  className="text-white/70 hover:text-white font-black text-xl px-2">✕</button>
              </div>
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari senjata atau perk…"
                className="mt-2 w-full rounded-lg bg-white/10 border border-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/35 outline-none focus:border-cyan-300/60"
              />
              {!query && (
                <div className="mt-2 flex gap-1.5">
                  {RARITIES.map((r) => (
                    <button key={r} onPointerDown={(e) => { e.stopPropagation(); setRarity(r); }}
                      className={`flex-1 text-[10px] font-black py-1.5 rounded-lg border transition ${rarity === r ? 'bg-white/15' : 'bg-black/40 opacity-60'}`}
                      style={{ color: RARITY_COLOR[r], borderColor: `${RARITY_COLOR[r]}66` }}>
                      {RARITY_LABEL[r]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2.5 grid grid-cols-3 gap-2 content-start">
              {list.map((w) => {
                const active = hud?.weapon === w.id;
                return (
                  <button key={w.id}
                    onPointerDown={(e) => { e.stopPropagation(); g?.setWeapon(w.id, twin); setPickerOpen(false); }}
                    className={`rounded-xl border p-2 text-center transition active:scale-95 ${active ? 'bg-white/15 scale-105' : 'bg-white/5 hover:bg-white/10'}`}
                    style={{ borderColor: active ? w.glow : `${RARITY_COLOR[w.rarity]}44`, boxShadow: active ? `0 0 16px ${w.glow}66` : undefined }}>
                    <div className="text-2xl leading-none">{w.emoji}</div>
                    <div className="text-[10px] font-black text-white mt-1 leading-tight">{w.name}</div>
                    <div className="text-[8px] font-bold mt-0.5" style={{ color: RARITY_COLOR[w.rarity] }}>{w.perk}</div>
                    <div className="text-[8px] text-white/45 mt-0.5">DMG {w.dmg} · {w.mag} peluru</div>
                  </button>
                );
              })}
            </div>
            <div className="p-2.5 border-t border-white/10 flex items-center gap-2">
              <button onPointerDown={(e) => { e.stopPropagation(); setTwin((v) => { g?.setTwin(!v); return !v; }); }}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs border ${twin ? 'bg-cyan-400 text-black border-cyan-200' : 'bg-white/10 text-white/70 border-white/15'}`}>
                MODE DUAL 🔫🔫 {twin ? 'ON' : 'OFF'}
              </button>
              <button onPointerDown={(e) => { e.stopPropagation(); setPickerOpen(false); }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-400 text-black font-black text-xs">TUTUP</button>
            </div>
          </div>
        )}

        {/* Menu */}
        {state === 'menu' && !pickerOpen && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px] text-white px-6 text-center">
            <div className="text-xs tracking-[0.4em] text-cyan-300/80 font-bold">STAGE 1</div>
            <h1 className="text-5xl font-black leading-none mt-2 bg-gradient-to-b from-white to-cyan-300 bg-clip-text text-transparent drop-shadow">GUN HIT</h1>
            <div className="text-lg font-black text-amber-300 tracking-wide">Diamond Breaker</div>
            <p className="mt-3 text-sm text-white/75 max-w-xs">
              Hancurkan bongkahan batu berputar hingga <b className="text-cyan-300">diamond</b> di tengahnya bersih.
              Tembak <b className="text-amber-300">⭐ bintang</b> yang lewat untuk memilih upgrade!
            </p>
            <div className="mt-4 w-full max-w-xs space-y-1.5">
              {STAGES.map((st) => (
                <button key={st.id}
                  onPointerDown={(e) => { e.stopPropagation(); setStage(st.id); g?.setStage(st.id); }}
                  className={`w-full flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition ${stage === st.id ? 'bg-white/15 scale-[1.02]' : 'bg-black/40 opacity-70'}`}
                  style={{ borderColor: `${st.color}77`, boxShadow: stage === st.id ? `0 0 16px ${st.color}44` : undefined }}>
                  <span className="text-2xl">{st.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-xs font-black" style={{ color: st.color }}>STAGE {st.name.toUpperCase()}</span>
                    <span className="block text-[10px] text-white/60 leading-tight">{st.desc}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5 text-center">
              {(['common', 'rare', 'epic', 'legend'] as Rarity[]).map((r) => (
                <div key={r} className="rounded-lg bg-white/5 border border-white/10 py-1.5 px-1">
                  <div className="text-[9px] font-black" style={{ color: RARITY_COLOR[r] }}>{RARITY_LABEL[r]}</div>
                  <div className="text-[11px] font-black text-white">{CATALOG.filter((w) => w.rarity === r).length}</div>
                </div>
              ))}
            </div>
            <button onPointerDown={(e) => { e.stopPropagation(); setPickerOpen(true); }}
              className="mt-4 px-5 py-2 rounded-xl bg-white/10 border border-white/15 text-sm font-black">
              {wdef.emoji} {wdef.name} — ganti
            </button>
            <ul className="mt-3 text-[11px] text-white/60 space-y-1">
              <li>🖱️ Tahan klik / tap / <b>Spasi</b> untuk menembak</li>
              <li>⭐ Tap bintang = 3 pilihan: cepat 2x, ammo 2x, damage 2x</li>
              <li>🔫 <b>Q</b> gudang senjata • <b>R</b> reload</li>
            </ul>
            <button onPointerDown={(e) => { e.stopPropagation(); g?.start(); }}
              className="mt-5 px-10 py-3 rounded-2xl bg-gradient-to-b from-cyan-300 to-cyan-500 text-black font-black text-xl shadow-[0_0_30px_rgba(103,232,249,0.5)] active:scale-95 transition">
              MULAI
            </button>
          </div>
        )}

        {/* Won */}
        {state === 'won' && hud && !pickerOpen && (
          <div className="absolute inset-0 flex items-end justify-center pb-20 px-6">
            <div className="panel-in w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-cyan-300/40 p-6 text-center text-white shadow-[0_0_60px_rgba(103,232,249,0.35)]" style={{ animationDelay: '0.9s' }}>
              <div className="text-xs tracking-[0.35em] text-cyan-300 font-bold">STAGE SELESAI</div>
              <div className="text-3xl font-black mt-1">
                {stage === 'classic' ? '💎 Diamond Bersih!' : stage === 'bonus' ? '🪙 Panen Koin!' : '🧰 Harta Karun!'}
              </div>
              <Stars n={hud.stars} />
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-white/5 rounded-xl py-2"><div className="text-[10px] text-white/50">SKOR</div><div className="font-black">{hud.score}</div></div>
                <div className="bg-white/5 rounded-xl py-2"><div className="text-[10px] text-white/50">KOIN</div><div className="font-black text-amber-300">{hud.coins}</div></div>
                <div className="bg-white/5 rounded-xl py-2"><div className="text-[10px] text-white/50">AKURASI</div><div className="font-black">{accuracy}%</div></div>
              </div>
              <div className="flex gap-2 mt-5">
                <button onPointerDown={(e) => { e.stopPropagation(); g?.toMenu(); }} className="flex-1 py-3 rounded-xl bg-white/10 font-bold">Menu</button>
                <button onPointerDown={(e) => { e.stopPropagation(); g?.start(); }} className="flex-1 py-3 rounded-xl bg-cyan-400 text-black font-black">Main Lagi</button>
              </div>
            </div>
          </div>
        )}

        {/* Lost */}
        {state === 'lost' && hud && !pickerOpen && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/65 px-6">
            <div className="panel-in w-full max-w-sm rounded-3xl bg-slate-900/95 border border-red-400/40 p-6 text-center text-white">
              <div className="text-4xl">⏰</div>
              <div className="text-3xl font-black mt-1 text-red-400">Waktu Habis!</div>
              <p className="text-white/70 text-sm mt-2">Batu hancur {pct}% — coba senjata EPIC atau LEGENDARIS!</p>
              <div className="text-sm mt-3">Skor: <b>{hud.score}</b></div>
              <div className="flex gap-2 mt-5">
                <button onPointerDown={(e) => { e.stopPropagation(); setPickerOpen(true); }} className="flex-1 py-3 rounded-xl bg-white/10 font-bold">Ganti Senjata</button>
                <button onPointerDown={(e) => { e.stopPropagation(); g?.start(); }} className="flex-1 py-3 rounded-xl bg-red-400 text-black font-black">Coba Lagi</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
