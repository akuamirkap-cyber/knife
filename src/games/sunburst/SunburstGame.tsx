import React from 'react';

interface Props {
  onExit?: () => void;
}

export default function SunburstGame({ onExit }: Props) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const scrollToControls = () => {
    try {
      const iframeDoc = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
      const target = iframeDoc?.getElementById('controlsAnchor');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.scrollBy({ top: 380, behavior: 'smooth' });
      }
    } catch {}
  };

  return (
    <div className="relative w-full h-full bg-[#070418] flex flex-col overflow-hidden text-white font-sans">
      {onExit && (
        <button
          onClick={onExit}
          className="fixed top-3 left-3 z-50 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-xl cursor-pointer transition hover:scale-105 active:scale-95"
          title="Kembali ke Menu Game"
        >
          <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Pilih Game Lain</span>
        </button>
      )}

      {/* Floating scroll indicator / helper for quick scrolling to controls */}
      <button
        onClick={scrollToControls}
        className="absolute bottom-2.5 right-3.5 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600/90 hover:bg-violet-500 text-white text-[11px] font-bold backdrop-blur-md border border-violet-300/40 shadow-xl cursor-pointer transition-all hover:scale-105 active:scale-95"
        title="Scroll ke Kontrol FX"
      >
        <span>Kontrol FX</span>
        <span className="text-violet-200 font-mono text-xs">↕</span>
      </button>

      <iframe
        ref={iframeRef}
        src="/sunburst.html"
        title="Sunburst FX"
        className="w-full h-full border-0 block pointer-events-auto"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
