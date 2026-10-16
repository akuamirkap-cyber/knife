import React, { useRef, useState, useEffect } from 'react';

interface ScaledFrameProps {
  baseWidth: number;
  baseHeight: number;
  children: React.ReactNode;
}

export default function ScaledFrame({ baseWidth, baseHeight, children }: ScaledFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth > 0 && clientHeight > 0) {
        const s = Math.min(clientWidth / baseWidth, clientHeight / baseHeight);
        setScale(s);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener('resize', updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [baseWidth, baseHeight]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black"
    >
      <div
        style={{
          width: baseWidth,
          height: baseHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
        }}
        className="relative overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
}
