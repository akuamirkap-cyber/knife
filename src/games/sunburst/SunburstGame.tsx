import React from 'react';

interface Props {
  onExit?: () => void;
}

export default function SunburstGame({ onExit }: Props) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  return (
    <div className="relative w-full h-full bg-[#070418] flex flex-col overflow-hidden text-white font-sans">
      {/* Embedded Sunburst App - 100% full height & width without cropping */}
      <iframe
        ref={iframeRef}
        src="/sunburst.html"
        title="Sunburst FX"
        className="w-full h-full border-0 block"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
