import React, { useState, useEffect } from 'react';
import { 
  Crosshair, 
  Sparkles, 
  Flame, 
  Sword, 
  Maximize2, 
  Minimize2, 
  RotateCcw
} from 'lucide-react';

import ScaledFrame from './components/ScaledFrame';
import RifleRockGame from './games/rifle-rock/App';
import SunburstGame from './games/sunburst/SunburstGame';
import GunHitGame from './games/gunhit/App';
import KnifeHitGame from './games/knife-hit/App';

interface GameSlide {
  id: number;
  name: string;
  sub: string;
  icon: React.ElementType;
  themeColor: string;
  borderColor: string;
  render: () => React.ReactNode;
}

export default function App() {
  const [fullscreenId, setFullscreenId] = useState<number | null>(null);
  const [keys, setKeys] = useState([0, 0, 0, 0]);

  // Restart an individual game
  const reloadGame = (idx: number) => {
    setKeys((prev) => {
      const copy = [...prev];
      copy[idx] += 1;
      return copy;
    });
  };

  const SLIDES: GameSlide[] = [
    {
      id: 0,
      name: 'Diamond Breaker',
      sub: 'Rifle Rock',
      icon: Crosshair,
      themeColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400/80 shadow-cyan-950/40',
      render: () => (
        <ScaledFrame baseWidth={480} baseHeight={820}>
          <RifleRockGame key={keys[0]} />
        </ScaledFrame>
      ),
    },
    {
      id: 1,
      name: 'Sunburst FX Lab',
      sub: '3 Stage Demo',
      icon: Sparkles,
      themeColor: 'text-violet-400',
      borderColor: 'border-violet-500/40 hover:border-violet-400/80 shadow-violet-950/40',
      render: () => (
        <div className="w-full h-full relative overflow-hidden bg-[#070418]">
          <SunburstGame key={keys[1]} />
        </div>
      ),
    },
    {
      id: 2,
      name: 'Gun Hit Arcade',
      sub: 'Full Arsenal',
      icon: Flame,
      themeColor: 'text-amber-400',
      borderColor: 'border-amber-500/40 hover:border-amber-400/80 shadow-amber-950/40',
      render: () => (
        <ScaledFrame baseWidth={420} baseHeight={760}>
          <GunHitGame key={keys[2]} />
        </ScaledFrame>
      ),
    },
    {
      id: 3,
      name: 'Knife Boss 100 Lv',
      sub: '20 Bosses',
      icon: Sword,
      themeColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40 hover:border-emerald-400/80 shadow-emerald-950/40',
      render: () => (
        <ScaledFrame baseWidth={380} baseHeight={680}>
          <KnifeHitGame key={keys[3]} />
        </ScaledFrame>
      ),
    },
  ];

  // Esc key exits fullscreen focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#020408] text-white flex flex-col overflow-hidden select-none font-sans">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed -top-32 left-1/4 w-[500px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="pointer-events-none fixed -bottom-32 right-1/4 w-[500px] h-[300px] bg-amber-500/10 rounded-full blur-3xl" />

      {/* Slim Top Bar (34px) - Maximizes vertical canvas space */}
      <header className="h-[34px] flex-shrink-0 z-30 flex items-center justify-between px-3 sm:px-4 bg-neutral-950/95 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-[11px]">
            <span>4 Game Berjejer (9:16)</span>
          </span>
          <span className="text-[11px] text-neutral-400 hidden sm:inline">
            Semua game langsung aktif serentak tanpa ter-crop atas/bawah
          </span>
        </div>

        <div className="flex items-center gap-2">
          {fullscreenId !== null ? (
            <button
              onClick={() => setFullscreenId(null)}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-400 text-neutral-950 font-bold text-xs hover:bg-amber-300 transition cursor-pointer"
            >
              <Minimize2 className="w-3 h-3" />
              <span>Kembali Jejer 4</span>
            </button>
          ) : (
            <span className="text-[11px] text-neutral-400 font-mono hidden md:inline">
              Klik ⤢ untuk perbesar game
            </span>
          )}
        </div>
      </header>

      {/* Main Row: 4 Game Slides Side-by-Side in 9:16 */}
      <main className="relative flex-1 w-full h-[calc(100vh-34px)] p-1.5 sm:p-2 flex items-center justify-center overflow-x-auto overflow-y-hidden no-scrollbar">
        {/* If one game is focused fullscreen in 9:16 */}
        {fullscreenId !== null ? (
          <div className="relative h-full aspect-[9/16] rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_80px_rgba(251,191,36,0.3)] bg-black flex flex-col">
            <div className="absolute top-2 right-2 z-40 flex items-center gap-1.5">
              <button
                onClick={() => reloadGame(fullscreenId)}
                className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white/80 hover:text-white border border-white/20 backdrop-blur-md transition cursor-pointer"
                title="Restart Game Ini"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setFullscreenId(null)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs shadow-lg transition cursor-pointer"
                title="Kembali ke Tampilan 4 Layar"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Kecilkan</span>
              </button>
            </div>
            <div className="w-full h-full relative overflow-hidden">
              {SLIDES[fullscreenId].render()}
            </div>
          </div>
        ) : (
          /* Normal: ALL 4 SLIDES JEJER SIDE BY SIDE (100% height, zero top/bottom crop) */
          <div 
            className="h-full flex items-center justify-start xl:justify-center gap-2 sm:gap-2.5 md:gap-3"
            style={{
              maxHeight: 'calc(100vh - 42px)',
            }}
          >
            {SLIDES.map((slide) => {
              const Icon = slide.icon;

              return (
                <div
                  key={slide.id}
                  className={`group relative h-full aspect-[9/16] flex-shrink-0 rounded-2xl border-2 ${slide.borderColor} bg-neutral-950 shadow-2xl flex flex-col overflow-hidden transition-all duration-200`}
                  style={{
                    height: '100%',
                    maxHeight: 'calc(100vh - 46px)',
                  }}
                >
                  {/* Slim Header Bar (28px) */}
                  <div className="h-[28px] flex-shrink-0 px-2.5 bg-neutral-900/95 border-b border-white/10 flex items-center justify-between z-20 text-[11px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <Icon className={`w-3.5 h-3.5 ${slide.themeColor} flex-shrink-0`} />
                      <span className="font-bold text-white truncate text-xs">{slide.name}</span>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => reloadGame(slide.id)}
                        className="p-1 rounded hover:bg-white/15 text-neutral-400 hover:text-white transition cursor-pointer"
                        title="Reload Game Ini"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => setFullscreenId(slide.id)}
                        className="p-1 rounded hover:bg-white/15 text-neutral-400 hover:text-white transition cursor-pointer"
                        title="Perbesar Layar Ini"
                      >
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 100% Pure 9:16 Game Screen Viewport with Responsive Scale */}
                  <div className="relative flex-1 w-full h-[calc(100%-28px)] overflow-hidden bg-black flex items-center justify-center">
                    {slide.render()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
