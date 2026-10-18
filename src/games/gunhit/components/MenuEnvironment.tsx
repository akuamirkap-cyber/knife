import type { CSSProperties } from 'react';

export type MenuEnvironmentTheme = 'forest' | 'morning' | 'town' | 'snow';

const SNOWFLAKES = Array.from({ length: 28 }, (_, index) => ({
  left: `${(index * 37 + 9) % 100}%`,
  top: `${(index * 53 + 5) % 86}%`,
  size: 2 + (index % 4),
  delay: `${(index % 7) * -0.6}s`,
}));

const TOWN_BUILDINGS = [
  { left: '0%', width: '15%', height: '22%' },
  { left: '12%', width: '13%', height: '35%' },
  { left: '25%', width: '14%', height: '26%' },
  { left: '39%', width: '12%', height: '43%' },
  { left: '51%', width: '15%', height: '29%' },
  { left: '66%', width: '12%', height: '38%' },
  { left: '78%', width: '13%', height: '25%' },
  { left: '90%', width: '14%', height: '34%' },
];

export default function MenuEnvironment({ theme }: { theme: MenuEnvironmentTheme }) {
  if (theme === 'forest') return null;

  if (theme === 'morning') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true" data-menu-environment="morning">
        <div className="absolute inset-0 bg-gradient-to-b from-[#ffd891]/75 via-[#ffc66e]/42 to-[#ffdf9b]/[.18]" />
        <div className="absolute right-[14%] top-[18%] h-24 w-24 rounded-full bg-amber-200/65 blur-2xl" />
        <div className="absolute right-[22%] top-[22%] h-10 w-10 rounded-full bg-yellow-100/55 blur-[2px]" />
        <div className="absolute inset-x-0 top-[34%] h-[20%] bg-gradient-to-b from-amber-100/[.08] to-transparent" />
      </div>
    );
  }

  if (theme === 'town') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true" data-menu-environment="town">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7ae68]/60 via-[#bb8b72]/40 to-[#13252d]/55" />
        <div className="absolute right-[16%] top-[17%] h-20 w-20 rounded-full bg-orange-200/25 blur-2xl" />
        <div className="absolute inset-x-0 bottom-0 h-[46%] opacity-85">
          {TOWN_BUILDINGS.map((building, index) => (
            <div
              key={index}
              className="absolute bottom-0 border-x border-t border-slate-300/10 bg-gradient-to-b from-[#243a48]/95 to-[#101e28]"
              style={{ ...building, backgroundImage: 'linear-gradient(180deg,rgba(49,68,79,.96),rgba(15,28,39,.99)), repeating-linear-gradient(90deg,transparent 0 13px,rgba(251,191,36,.22) 13px 16px,transparent 16px 25px)', clipPath: index % 3 === 0 ? 'polygon(0 12%, 30% 12%, 30% 0, 70% 0, 70% 12%, 100% 12%, 100% 100%, 0 100%)' : undefined } as CSSProperties}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#07151b] to-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true" data-menu-environment="snow">
      <div className="absolute inset-0 bg-gradient-to-b from-[#c9edff]/70 via-[#8ec9e5]/50 to-[#d9f4ff]/40" />
      <div className="absolute right-[15%] top-[17%] h-20 w-20 rounded-full bg-white/30 blur-2xl" />
      {SNOWFLAKES.map((flake, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(220,245,255,.85)] animate-pulse"
          style={{ left: flake.left, top: flake.top, width: flake.size, height: flake.size, animationDelay: flake.delay, opacity: 0.62 + (index % 4) * 0.08 }}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-[17%] rounded-[50%_50%_0_0] bg-gradient-to-t from-[#e7f8ff]/20 to-[#f5fcff]/[.06]" />
    </div>
  );
}
