import React, { useRef, useState, useLayoutEffect } from 'react';

interface ScaledFrameProps {
  baseWidth: number;
  baseHeight: number;
  children: React.ReactNode;
}

export default function ScaledFrame({ baseWidth, baseHeight, children }: ScaledFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    let retry = 0;
    let raf = 0;
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth > 0 && clientHeight > 0) {
        // Uniform fit: strictly fit both width and height with small 2px safety margin so no edges touch or get clipped
        const s = Math.min((clientWidth - 2) / baseWidth, (clientHeight - 2) / baseHeight);
        setScale(Math.max(0.05, s));
        retry = 0;
      } else if (retry < 60) {
        // Kontainer sempat 0-size (transisi display:none / layout belum siap).
        // Jangan biarkan slide blank (opacity 0 selamanya) — coba lagi tiap frame.
        retry += 1;
        raf = requestAnimationFrame(updateScale);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', updateScale);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [baseWidth, baseHeight]);

  const currentScale = scale ?? 1;

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black select-none"
    >
      <div
        style={{
          width: baseWidth,
          height: baseHeight,
          transform: `scale(${currentScale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          opacity: scale === null ? 0 : 1,
        }}
        className="relative overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
}
