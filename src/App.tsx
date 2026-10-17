import React, { useEffect, useState } from 'react';
import { Crosshair, Flame, Sword, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

import ScaledFrame from './components/ScaledFrame';
import { SlideActivityProvider } from './games/shared/SlideActivity';
import RifleRockGame from './games/rifle-rock/App';
import GunHitGame from './games/gunhit/App';
import KnifeHitGame from './games/knife-hit/App';

type SlideId = 'rifle' | 'gunhit' | 'knife';

interface GameSlide {
  id: SlideId;
  name: string;
  icon: React.ElementType;
  themeColor: string;
  borderColor: string;
  render: () => React.ReactNode;
}

export default function App() {
  const [fullscreenId, setFullscreenId] = useState<SlideId | null>(null);
  const [activeId, setActiveId] = useState<SlideId | null>(null);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [keys, setKeys] = useState<Record<SlideId, number>>({ rifle: 0, gunhit: 0, knife: 0 });

  const reloadGame = (id: SlideId) => {
    setActiveId(id);
    setKeys((prev) => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const focusGame = (id: SlideId) => {
    setActiveId(id);
    setFullscreenId(id);
  };

  // A background browser tab is paused too, including the currently selected game.
  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const slides: GameSlide[] = [
    {
      id: 'rifle',
      name: 'Diamond Breaker',
      icon: Crosshair,
      themeColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400/80 shadow-cyan-950/40',
      render: () => (
        <ScaledFrame baseWidth={480} baseHeight={880}>
          <RifleRockGame key={keys.rifle} onExit={fullscreenId === 'rifle' ? () => setFullscreenId(null) : undefined} />
        </ScaledFrame>
      ),
    },
    {
      id: 'gunhit',
      name: 'Gun Hit Arcade',
      icon: Flame,
      themeColor: 'text-amber-400',
      borderColor: 'border-amber-500/40 hover:border-amber-400/80 shadow-amber-950/40',
      render: () => (
        <ScaledFrame baseWidth={420} baseHeight={760}>
          <GunHitGame key={keys.gunhit} />
        </ScaledFrame>
      ),
    },
    {
      id: 'knife',
      name: 'Knife Boss 100 Lv',
      icon: Sword,
      themeColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400/80 shadow-emerald-950/40',
      render: () => (
        <ScaledFrame baseWidth={420} baseHeight={920}>
          <KnifeHitGame key={keys.knife} onExit={fullscreenId === 'knife' ? () => setFullscreenId(null) : undefined} />
        </ScaledFrame>
      ),
    },
  ];

  return (
    <div className="relative w-screen h-screen bg-[#020408] text-white flex flex-col overflow-hidden select-none font-sans">
      <div className="pointer-events-none fixed -top-32 left-1/4 w-[500px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 right-1/4 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-3xl" />

      <header className="h-[34px] flex-shrink-0 z-30 flex items-center justify-between px-3 sm:px-4 bg-neutral-950/95 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-[11px]">
            <span className="sm:hidden">3 Game</span>
            <span className="hidden sm:inline">3 Game Berjejer (9:16)</span>
          </span>
          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            Klik game untuk bermain • Game lain dijeda otomatis
          </span>
        </div>

        <div className="flex items-center gap-2">
          {fullscreenId !== null ? (
            <>
              <button
                onClick={() => reloadGame(fullscreenId)}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-md border border-white/20 bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition cursor-pointer"
                title="Restart Game Ini"
              >
                <RotateCcw className="w-3 h-3" /> Restart
              </button>
              <button
                onClick={() => setFullscreenId(null)}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-400 text-neutral-950 font-bold text-xs hover:bg-amber-300 transition cursor-pointer"
              >
                <Minimize2 className="w-3 h-3" />
                <span className="sm:hidden">Jejer 3</span>
                <span className="hidden sm:inline">Kembali Jejer 3</span>
              </button>
            </>
          ) : (
            <span className="text-[11px] text-neutral-400 font-mono hidden md:inline">
              Klik ⤢ untuk perbesar game
            </span>
          )}
        </div>
      </header>

      {/* Keep each slide in the same React tree when entering/leaving focus: no game reset. */}
      <main className="relative flex-1 w-full h-[calc(100vh-34px)] p-1.5 sm:p-2 flex items-center justify-start overflow-x-auto overflow-y-hidden no-scrollbar">
        <div className="h-full w-max flex-shrink-0 mx-auto flex items-center gap-2 sm:gap-2.5 md:gap-3" style={{ maxHeight: 'calc(100vh - 42px)' }}>
          {slides.map((slide) => {
            const Icon = slide.icon;
            const expanded = fullscreenId === slide.id;
            const active = activeId === slide.id && pageVisible && (fullscreenId === null || expanded);

            return (
              <div
                key={slide.id}
                onPointerDownCapture={() => setActiveId(slide.id)}
                onFocusCapture={() => setActiveId(slide.id)}
                className={`group relative aspect-[9/16] flex-shrink-0 rounded-2xl border-2 ${expanded ? 'border-amber-400 shadow-[0_0_80px_rgba(251,191,36,0.3)]' : slide.borderColor} bg-neutral-950 shadow-2xl flex flex-col overflow-hidden transition-[border-color,box-shadow] duration-200`}
                style={{
                  // On phones, fit one complete 9:16 slide per swipe/focus;
                  // on wide screens, use the full available height.
                  height: 'min(calc(100vh - 46px), calc((100vw - 16px) * 16 / 9))',
                  display: fullscreenId !== null && !expanded ? 'none' : undefined,
                }}
              >
                <div
                  className="h-[28px] flex-shrink-0 px-2.5 bg-neutral-900/95 border-b border-white/10 flex items-center justify-between z-20 text-[11px]"
                  style={{ display: expanded ? 'none' : undefined }}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Icon className={`w-3.5 h-3.5 ${slide.themeColor} flex-shrink-0`} />
                    <span className="font-bold text-white truncate text-xs">{slide.name}</span>
                    {slide.id === 'knife' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/25 text-emerald-300 font-semibold border border-emerald-400/30 flex items-center gap-0.5">
                        Sunburst FX ✨
                      </span>
                    )}
                    {active && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400" title="Aktif" />}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => reloadGame(slide.id)}
                      className="p-1 rounded hover:bg-white/15 text-neutral-400 hover:text-white transition cursor-pointer"
                      title={`Restart ${slide.name}`}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => focusGame(slide.id)}
                      className="p-1 rounded hover:bg-white/15 text-neutral-400 hover:text-white transition cursor-pointer"
                      title={`Perbesar ${slide.name}`}
                    >
                      <Maximize2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className={`relative flex-1 min-h-0 w-full overflow-hidden bg-black flex items-center justify-center ${active ? '' : 'slide-paused'}`}>
                  <SlideActivityProvider active={active}>{slide.render()}</SlideActivityProvider>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
