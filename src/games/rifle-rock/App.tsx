import { useEffect, useRef, useState } from 'react';
import { Game, GAME_H, GAME_W, type HudInfo } from './game/engine';
import { WEAPON_DEFS, WEAPON_MAP, TIER_INFO } from './game/weapons';

function Stars({ n }: { n: number }) {
  return (
    <div className="flex justify-center gap-2 my-3">
      {[1, 2, 3].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`w-12 h-12 star-pop ${i <= n ? 'text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]' : 'text-white/15'}`}
          style={{ animationDelay: `${0.5 + i * 0.2}s` }}
        >
          <path fill="currentColor" d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18.3 5.5 22l1.7-7.4-5.7-5 7.5-.7z" />
        </svg>
      ))}
    </div>
  );
}

export default function App({ onExit }: { onExit?: () => void }) {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [hud, setHud] = useState<HudInfo | null>(null);
  const [arsenalOpen, setArsenalOpen] = useState(false);

  useEffect(() => {
    const g = new Game(canvasRef.current!, setHud);
    gameRef.current = g;
    g.pushHud();
    const kd = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); if (g.state === 'playing') g.setFiring(true); }
      const idx = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].indexOf(e.key);
      if (idx >= 0) g.setWeapon(WEAPON_DEFS[idx].id);
      if (e.key.toLowerCase() === 'r') g.reload();
      if (e.key === 'Enter' && g.state !== 'playing') g.start();
      if (e.key.toLowerCase() === 'a') setArsenalOpen((v) => !v);
    };
    const ku = (e: KeyboardEvent) => { if (e.code === 'Space') g.setFiring(false); };
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

  const g = gameRef.current;
  const state = hud?.state ?? 'menu';
  const weapon = hud?.weapon ?? 'ak';
  const wDef = WEAPON_MAP[weapon];
  const tier = TIER_INFO[wDef.tier];
  const stage = hud?.stage ?? 'normal';
  const isTreasure = stage === 'treasure';
  const stageLabel = isTreasure ? 'HARTA 💰' : stage === 'bonus' ? 'BONUS ⭐' : 'NORMAL';
  const time = hud?.time ?? (isTreasure ? 10 : 90);
  const pct = Math.round((hud?.progress ?? 0) * 100);
  const accuracy = hud && hud.shots > 0 ? Math.round((hud.hits / hud.shots) * 100) : 0;
  const buffs = hud?.buffs ?? { dmg: 1, mag: 1, speed: 1 };

  const toGameCoords = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * GAME_W,
      y: ((e.clientY - rect.top) / rect.height) * GAME_H,
    };
  };

  return (
    <div className="h-full w-full bg-[#05060a] flex items-center justify-center select-none overflow-hidden relative">
      {onExit && (
        <button
          onClick={onExit}
          className="fixed top-3 left-3 z-50 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-xl cursor-pointer transition hover:scale-105 active:scale-95"
          title="Kembali ke Menu Game"
        >
          <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Pilih Game Lain</span>
        </button>
      )}
      <div
        className="relative h-full w-full max-w-full shadow-[0_0_80px_rgba(80,160,255,0.15)]"
        style={{ aspectRatio: `${GAME_W} / ${GAME_H}` }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
          onPointerDown={(e) => {
            e.preventDefault();
            const p = toGameCoords(e);
            g?.pointerTap(p.x, p.y);
            if (g?.state === 'playing' && hud?.state === 'playing') g.setFiring(true);
          }}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Top HUD */}
        {(state === 'playing' || state === 'choice') && (
          <div className="absolute top-0 inset-x-0 p-3 pointer-events-none">
            <div className="flex items-center justify-between text-white">
              <div className="bg-black/40 backdrop-blur rounded-xl px-3 py-1.5 border border-white/10">
                <div className="text-[10px] uppercase tracking-widest text-white/50">Skor</div>
                <div className="font-black text-lg leading-none">{hud?.score ?? 0}</div>
              </div>
              <div className={`bg-black/40 backdrop-blur rounded-xl px-4 py-1.5 border border-white/10 text-center ${time < (isTreasure ? 5 : 15) ? 'text-red-400 animate-pulse' : ''}`}>
                <div className="text-[10px] uppercase tracking-widest text-white/50">Waktu</div>
                <div className={`font-black leading-none tabular-nums ${isTreasure ? 'text-3xl text-amber-300' : 'text-xl'}`}>{time.toFixed(1)}</div>
              </div>
              <div className="bg-black/40 backdrop-blur rounded-xl px-3 py-1.5 border border-white/10 text-right">
                <div className="text-[10px] uppercase tracking-widest text-white/50">Stage</div>
                <div className={`font-black text-[13px] leading-none mt-0.5 ${isTreasure ? 'text-amber-300' : 'text-cyan-200'}`}>{stageLabel}</div>
              </div>
            </div>
            <div className="mt-2 mx-auto w-4/5">
              {isTreasure ? (
                <div className="flex justify-center">
                  <div className="bg-black/40 backdrop-blur rounded-2xl px-6 py-2 border border-amber-300/50 text-center">
                    <div className="text-[10px] uppercase tracking-widest text-amber-200/70">Koin terkumpul</div>
                    <div className="text-3xl font-black text-amber-300 tabular-nums leading-none mt-1">🪙 {hud?.coinTotal ?? 0}</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-[10px] text-cyan-200/80 font-bold uppercase tracking-wider mb-1">
                    <span>Batu hancur {stage === 'bonus' ? '• 🪙 ' + (hud?.coinTotal ?? 0) : ''}</span><span>{pct}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10 overflow-hidden border border-white/10">
                    <div className="h-full bg-gradient-to-r from-amber-600 via-amber-300 to-cyan-300 transition-all duration-200" style={{ width: `${pct}%` }} />
                  </div>
                </>
              )}
              <div className="flex justify-center gap-1.5 mt-1.5 h-5">
                {buffs.speed > 1 && <span className="text-[10px] font-black bg-yellow-400/20 text-yellow-200 border border-yellow-300/40 rounded px-1.5">⚡ PELURU ×{buffs.speed}</span>}
                {buffs.mag > 1 && <span className="text-[10px] font-black bg-cyan-400/20 text-cyan-200 border border-cyan-300/40 rounded px-1.5">📦 AMUNISI ×{buffs.mag}</span>}
                {buffs.dmg > 1 && <span className="text-[10px] font-black bg-red-400/20 text-red-200 border border-red-300/40 rounded px-1.5">💥 DAYA ×{buffs.dmg}</span>}
                {hud?.fxName && <span className="text-[10px] font-black bg-sky-400/20 text-sky-200 border border-sky-300/40 rounded px-1.5">{hud.fxName}</span>}
                {hud?.aiming && <span className="text-[10px] font-black bg-amber-400/20 text-amber-200 border border-amber-300/40 rounded px-1.5">🎯 MEMUKUI BINTANG</span>}
              </div>
            </div>
          </div>
        )}

        {/* Weapon card + arsenal */}
        {(state === 'playing' || state === 'choice' || state === 'menu') && (
          <div className="absolute left-2 bottom-3 z-10 flex flex-col gap-1.5 items-start">
            <div
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 border bg-black/60 backdrop-blur"
              style={{ borderColor: tier.color, boxShadow: `0 0 12px ${tier.color}44` }}
            >
              <span className="text-2xl leading-none">{wDef.emoji}</span>
              <div className="pr-1">
                <div className="text-[11px] font-black leading-tight" style={{ color: tier.color }}>{wDef.name}</div>
                <div className="text-[9px] text-white/60 leading-tight">{wDef.perk} • DMG {wDef.dmg}{wDef.splash ? `+AoE` : ''}{wDef.pierce ? `+Tembus` : ''}</div>
              </div>
            </div>
            <button
              onPointerDown={(e) => { e.stopPropagation(); setArsenalOpen((v) => !v); }}
              className="rounded-xl px-3 py-1.5 text-[11px] font-black bg-white/90 text-black hover:bg-white active:scale-95 transition"
            >
              📦 ARSENAL (76)
            </button>
          </div>
        )}

        {/* Ammo */}
        {(state === 'playing' || state === 'choice') && hud && (
          <div className="absolute right-2 bottom-3 z-10 flex flex-col items-end gap-2">
            <div className="bg-black/50 backdrop-blur rounded-xl px-3 py-2 border border-white/10 text-right min-w-[96px]">
              <div className="text-[10px] uppercase tracking-widest text-white/50">Amunisi</div>
              {hud.reloading ? (
                <>
                  <div className="text-amber-300 font-black text-sm">RELOAD...</div>
                  <div className="h-1.5 mt-1 rounded bg-white/10 overflow-hidden">
                    <div className="h-full bg-amber-300" style={{ width: `${hud.reloadPct * 100}%` }} />
                  </div>
                </>
              ) : (
                <div className={`font-black text-2xl leading-none tabular-nums ${hud.ammo <= hud.mag * 0.2 ? 'text-red-400' : 'text-white'}`}>
                  {hud.ammo}<span className="text-sm text-white/40">/{hud.mag}</span>
                </div>
              )}
            </div>
            <button
              onPointerDown={(e) => { e.stopPropagation(); g?.reload(); }}
              className="bg-amber-500/80 hover:bg-amber-400 text-black font-black text-xs rounded-lg px-3 py-1.5"
            >
              RELOAD (R)
            </button>
          </div>
        )}

        {/* Arsenal panel */}
        {arsenalOpen && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col" onPointerDown={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <div className="text-white font-black text-sm">📦 ARSENAL <span className="text-white/40 font-bold">— 76 senjata</span></div>
              <button onClick={() => setArsenalOpen(false)} className="text-white/70 hover:text-white text-xl leading-none px-2">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-3">
              {TIER_INFO.map((ti, tiIdx) => (
                <div key={ti.name}>
                  <div className="sticky top-0 z-10 px-2 py-1.5 text-[10px] font-black tracking-[0.25em] backdrop-blur bg-black/70" style={{ color: ti.color }}>
                    {ti.emoji} {ti.name}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {WEAPON_DEFS.filter((wd) => wd.tier === tiIdx).map((wd) => (
                      <button
                        key={wd.id}
                        onClick={() => { g?.setWeapon(wd.id); setArsenalOpen(false); }}
                        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-left border transition ${
                          weapon === wd.id ? 'bg-white/15 border-white/60' : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-lg leading-none">{wd.emoji}</span>
                        <span className="min-w-0">
                          <span className="block text-[11px] font-bold text-white truncate">{wd.name}</span>
                          <span className="block text-[9px] truncate" style={{ color: ti.color }}>{wd.perk}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Star choice modal */}
        {hud?.state === 'choice' && hud.choiceStar && (
          <div
            className="absolute z-30 pointer-events-none"
            style={{
              left: `${(hud.choiceStar.x / GAME_W) * 100}%`,
              top: `${(hud.choiceStar.y / GAME_H) * 100}%`,
              transform: 'translate(-50%, 24px)',
            }}
          >
            <div className="panel-in pointer-events-auto w-52 rounded-2xl bg-slate-950/95 border-2 border-yellow-300/70 p-3 text-center shadow-[0_0_40px_rgba(255,210,60,0.4)]">
              <div className="text-yellow-200 font-black text-xs tracking-widest mb-2">⭐ PILIH KEKUATAN</div>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => g?.pickStar(0)} className="py-2 rounded-xl bg-yellow-400/20 hover:bg-yellow-400/40 border border-yellow-300/50 text-yellow-100 font-black text-xs">
                  ⚡ PELURU 2× LEBIH CEPAT
                </button>
                <button onClick={() => g?.pickStar(1)} className="py-2 rounded-xl bg-cyan-400/20 hover:bg-cyan-400/40 border border-cyan-300/50 text-cyan-100 font-black text-xs">
                  📦 AMUNISI 2×
                </button>
                <button onClick={() => g?.pickStar(2)} className="py-2 rounded-xl bg-red-400/20 hover:bg-red-400/40 border border-red-300/50 text-red-100 font-black text-xs">
                  💥 DAYA HANCUR 2×
                </button>
              </div>
              <div className="text-[9px] text-white/50 mt-1.5">Senjatamu akan membidik bintang ini!</div>
            </div>
          </div>
        )}

        {/* Menu */}
        {state === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 backdrop-blur-[3px] text-white p-4 text-center z-20">
            <div className="text-[11px] tracking-[0.3em] text-cyan-300 font-bold uppercase">Pilih Stage</div>
            <h1 className="text-4xl font-black leading-tight mt-1 bg-gradient-to-b from-white to-cyan-300 bg-clip-text text-transparent drop-shadow">
              DIAMOND BREAKER
            </h1>
            <div className="text-xs font-bold text-amber-300 tracking-wide mb-4">76 Senjata • Recoil Physics</div>
            
            <div className="flex flex-col gap-2 w-full max-w-[280px]">
              <button
                onClick={() => g?.start('normal')}
                className="flex items-center gap-3 rounded-xl p-2.5 border border-cyan-400/40 bg-cyan-400/15 hover:bg-cyan-400/25 active:scale-95 transition text-left cursor-pointer"
              >
                <div className="text-2xl">💎</div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-xs text-cyan-200">NORMAL STAGE</div>
                  <div className="text-[10px] text-white/60 leading-tight">Pecahkan batu & bebaskan diamond</div>
                </div>
              </button>

              <button
                onClick={() => g?.start('bonus')}
                className="flex items-center gap-3 rounded-xl p-2.5 border border-yellow-400/40 bg-yellow-400/15 hover:bg-yellow-400/25 active:scale-95 transition text-left cursor-pointer"
              >
                <div className="text-2xl">🪙</div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-xs text-yellow-200">BONUS WHEEL</div>
                  <div className="text-[10px] text-white/60 leading-tight">Putaran koin merata satu arah</div>
                </div>
              </button>

              <button
                onClick={() => g?.start('treasure')}
                className="flex items-center gap-3 rounded-xl p-2.5 border border-amber-400/40 bg-amber-400/15 hover:bg-amber-400/25 active:scale-95 transition text-left cursor-pointer"
              >
                <div className="text-2xl">💰</div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-xs text-amber-200">HARTA KARUN</div>
                  <div className="text-[10px] text-white/60 leading-tight">10 detik raup koin sebanyaknya</div>
                </div>
              </button>
            </div>

            <p className="mt-4 text-[11px] text-white/50">
              🖱️ Tahan klik / tap untuk menembak • <b>A</b> Arsenal
            </p>
          </div>
        )}

        {/* Won */}
        {state === 'won' && hud && (
          <div className="absolute inset-0 flex items-end justify-center pb-20 px-6">
            <div
              className={`panel-in w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-6 text-center text-white ${
                isTreasure
                  ? 'border border-amber-300/50 shadow-[0_0_60px_rgba(255,200,60,0.4)]'
                  : 'border border-cyan-300/40 shadow-[0_0_60px_rgba(103,232,249,0.35)]'
              }`}
              style={{ animationDelay: isTreasure ? '0.2s' : '0.9s' }}
            >
              {isTreasure ? (
                <>
                  <div className="text-xs tracking-[0.35em] text-amber-300 font-bold">HARTA KARUN SELESAI</div>
                  <div className="text-3xl font-black mt-1">💰 {hud.coinTotal} Koin!</div>
                  <Stars n={hud.stars} />
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-white/5 rounded-xl py-2"><div className="text-[10px] text-white/50">KOIN</div><div className="font-black text-amber-300">{hud.coinTotal}</div></div>
                    <div className="bg-white/5 rounded-xl py-2"><div className="text-[10px] text-white/50">SKOR</div><div className="font-black">{hud.score}</div></div>
                    <div className="bg-white/5 rounded-xl py-2"><div className="text-[10px] text-white/50">SENJATA</div><div className="font-black text-xs mt-1">{wDef.emoji} {wDef.name}</div></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-xs tracking-[0.35em] text-cyan-300 font-bold">STAGE SELESAI</div>
                  <div className="text-3xl font-black mt-1">{stage === 'bonus' ? `⭐ Bonus! 🪙 ${hud.coinTotal}` : '💎 Diamond Bersih!'}</div>
                  <Stars n={hud.stars} />
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-white/5 rounded-xl py-2"><div className="text-[10px] text-white/50">SKOR</div><div className="font-black">{hud.score}</div></div>
                    <div className="bg-white/5 rounded-xl py-2"><div className="text-[10px] text-white/50">WAKTU</div><div className="font-black">{(90 - hud.time).toFixed(1)}s</div></div>
                    <div className="bg-white/5 rounded-xl py-2"><div className="text-[10px] text-white/50">AKURASI</div><div className="font-black">{accuracy}%</div></div>
                  </div>
                </>
              )}
              <div className="flex gap-2 mt-5">
                <button onClick={() => g?.toMenu()} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold">Menu</button>
                <button
                  onClick={() => g?.start(stage)}
                  className={`flex-1 py-3 rounded-xl text-black font-black ${isTreasure ? 'bg-amber-400 hover:bg-amber-300' : 'bg-cyan-400 hover:bg-cyan-300'}`}
                >
                  Main Lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lost */}
        {state === 'lost' && hud && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 px-6">
            <div className="panel-in w-full max-w-sm rounded-3xl bg-slate-900/95 border border-red-400/40 p-6 text-center text-white">
              <div className="text-4xl">⏰</div>
              <div className="text-3xl font-black mt-1 text-red-400">Waktu Habis!</div>
              <p className="text-white/70 text-sm mt-2">Batu hancur {pct}% — diamond belum bersih. Coba senjata epik!</p>
              <div className="text-sm mt-3">Skor: <b>{hud.score}</b></div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => g?.toMenu()} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold">Menu</button>
                <button onClick={() => g?.start()} className="flex-1 py-3 rounded-xl bg-red-400 hover:bg-red-300 text-black font-black">Coba Lagi</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
