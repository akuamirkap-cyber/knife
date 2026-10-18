import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GiftBoxBody, GiftBoxLid } from '../../knife-hit/components/Art';
import {
  Burst,
  Confetti,
  Dust,
  Flare,
  GodRays,
  GreenButton,
  LetterPop,
  Shockwave,
  SparkleField,
} from '../../knife-hit/components/Effects';
// Efek & suara kotak hadiah yang sama persis dengan slide Knife Boss 100 Lv.
import { sfx as boxSfx, vibrate } from '../../knife-hit/sfx';
import { useSlideActive } from '../../shared/SlideActivity';
import {
  RARITY_COLOR,
  rollGiftWeapon,
  type Rarity,
  type Weapon,
  type WeaponId,
} from '../game/weapons';
import { drawGunCentered } from '../game/art/drawCentered';
import { getGunMetrics } from '../game/art/metrics';

type BoxState = 'drop' | 'ready' | 'charging' | 'open';
const TAPS = 3;

/** Warna sinar/efek per rarity (rgb "r,g,b" — format efek Knife). */
const RARITY_RGB: Record<Rarity, string> = {
  UMUM: '200,205,215',
  LANGKA: '56,189,248',
  EPIC: '192,132,252',
  LEGENDARIS: '251,191,36',
};

const RARITY_STARS: Record<Rarity, number> = {
  UMUM: 1,
  LANGKA: 2,
  EPIC: 3,
  LEGENDARIS: 3,
};

/** Koin bonus buka kotak: naik per stage + bonus rarity senjata. */
export function giftBoxCoins(stage: number, rarity: Rarity): number {
  const bonus: Record<Rarity, number> = { UMUM: 0, LANGKA: 30, EPIC: 80, LEGENDARIS: 150 };
  return 50 + stage * 6 + bonus[rarity];
}

function shakeEl(el: HTMLElement | null, power = 3, duration = 200) {
  if (!el) return;
  const p = power;
  el.animate(
    [
      { transform: 'translate(0,0)' },
      { transform: `translate(${-p}px,${p * 0.5}px)` },
      { transform: `translate(${p}px,${-p * 0.5}px)` },
      { transform: 'translate(0,0)' },
    ],
    { duration, easing: 'ease-out' },
  );
}

/** Kanvas senjata Gun Hit untuk reveal kotak hadiah (silhouette → senjata asli). */
function GunRevealCanvas({ id, silhouette }: { id: WeaponId; silhouette: boolean }) {
  const active = useSlideActive();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const W = 210 * 1.6;
    const H = 150 * 1.6;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr;
    cv.height = H * dpr;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    if (!active) return;

    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const span = Math.max(getGunMetrics(id).span, 130);
      const scale = (H * 0.86) / span;
      ctx.save();
      ctx.translate(W / 2, H / 2 + Math.sin(t * 2.2) * 3);
      ctx.rotate(Math.PI / 4 + Math.sin(t * 2.8) * 0.045);
      ctx.scale(scale, scale);
      drawGunCentered(ctx, id, t, 0, true, undefined, true);
      ctx.restore();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [id, active]);

  return (
    <canvas
      ref={ref}
      style={{
        width: 336,
        height: 240,
        filter: silhouette ? 'brightness(0)' : 'drop-shadow(0 10px 18px rgba(0,0,0,.55))',
        transition: 'filter .25s',
      }}
    />
  );
}

interface BossGiftBoxModalProps {
  bossName: string;
  stage: number;
  /** Senjata yang sedang dipakai — tidak ikut di-roll supaya hadiah terasa baru. */
  currentWeaponId?: WeaponId;
  /** Klaim hadiah: koin bonus, id senjata baru, dan apakah langsung dipakai. */
  onClaim: (coins: number, weaponId: WeaponId, equip: boolean) => void;
}

/**
 * Bonus stage kotak hadiah ala Knife Boss 100 Lv untuk Gun Hit Arcade:
 * kotak jatuh → tap 3× → buka (lid terbang + sinar + konfeti) → reveal senjata
 * baru dari katalog senjata Gun Hit.
 */
export const BossGiftBoxModal = ({ bossName, stage, currentWeaponId, onClaim }: BossGiftBoxModalProps) => {
  const active = useSlideActive();
  const wrapRef = useRef<HTMLDivElement>(null);
  const punchRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<BoxState>('drop');
  const [taps, setTaps] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  const weapon: Weapon = useMemo(() => rollGiftWeapon(currentWeaponId), [currentWeaponId]);
  const rayColor = RARITY_RGB[weapon.rarity];
  const coins = giftBoxCoins(stage, weapon.rarity);

  useEffect(() => {
    if (!active || state !== 'drop') return;
    boxSfx.whoosh();
    const a = setTimeout(() => {
      boxSfx.thud();
      vibrate(12);
      shakeEl(wrapRef.current, 3, 220);
    }, 560);
    const b = setTimeout(() => setState('ready'), 1000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [active, state]);

  const tap = useCallback(() => {
    if (state !== 'ready') return;
    const n = taps + 1;
    setTaps(n);
    boxSfx.tap(n);
    vibrate(8);
    shakeEl(wrapRef.current, 2 + n, 160);
    punchRef.current?.animate(
      [
        { transform: 'scale(1)' },
        { transform: `scale(${1.1 + n * 0.03}, ${0.88 - n * 0.02})` },
        { transform: 'scale(.96,1.05)' },
        { transform: 'scale(1)' },
      ],
      { duration: 280, easing: 'cubic-bezier(.3,.8,.4,1.3)' },
    );
    if (n >= TAPS) {
      setState('charging');
      boxSfx.charge();
      setTimeout(() => {
        setState('open');
        boxSfx.open();
        vibrate(20);
        shakeEl(wrapRef.current, 5, 350);
      }, 900);
      setTimeout(() => {
        setShowInfo(true);
        boxSfx.reveal();
      }, 2400);
    }
  }, [state, taps]);

  const claim = (equip: boolean) => {
    boxSfx.click();
    onClaim(coins, weapon.id, equip);
  };

  const isOpen = state === 'open';
  const charging = state === 'charging';
  const seam = charging ? 1 : [0, 0.35, 0.7, 1][taps];
  const anim = state === 'drop' ? 'drop-in' : charging ? 'violent' : taps === 0 ? 'idle-bob' : 'wobble';

  return (
    <div ref={wrapRef} className="absolute inset-0 z-50 overflow-hidden bg-[#0b1420] font-game text-white select-none" onPointerDown={tap}>
      <Dust />
      <div className={`absolute inset-0 transition-colors duration-700 ${isOpen ? 'bg-black/20' : 'bg-black/45'}`} />

      {/* Judul */}
      <div className="absolute inset-x-0 top-4 text-center">
        <span className="inline-block rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-black tracking-widest text-black shadow-md">
          ★ BONUS REWARD STAGE ★
        </span>
      </div>
      <div className="absolute inset-x-0 top-[72px] text-center">
        {!showInfo ? (
          <div className={`transition-all duration-300 ${isOpen ? 'scale-75 opacity-0' : ''}`}>
            <h2 className="text-[30px] font-black leading-none text-amber-300 drop-shadow-[0_3px_0_#9a5b00]">
              <LetterPop text={`${bossName} DEFEATED!`} delay={0.2} />
            </h2>
            <p className="fade-up mt-2 text-base text-white/80" style={{ animationDelay: '.8s' }}>
              🎁 Kotak hadiah boss didapat!
            </p>
          </div>
        ) : (
          <>
            <div className="pop-in flex justify-center">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-1 text-[13px] font-black tracking-[0.14em]"
                style={{
                  color: RARITY_COLOR[weapon.rarity],
                  borderColor: RARITY_COLOR[weapon.rarity],
                  background: 'rgba(0,0,0,.45)',
                  boxShadow: `0 0 16px ${RARITY_COLOR[weapon.rarity]}66`,
                }}
              >
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: RARITY_COLOR[weapon.rarity] }} />
                {weapon.rarity}
              </span>
            </div>
            <h2 className="mt-1 text-[30px] font-black leading-none text-emerald-300 drop-shadow-[0_3px_0_#0d5c33]">
              <LetterPop text="SENJATA BARU!" />
            </h2>
            <div className="fade-up mt-1 flex justify-center gap-1" style={{ animationDelay: '.4s' }}>
              {Array.from({ length: RARITY_STARS[weapon.rarity] }).map((_, i) => (
                <span key={i} className="pop-in text-2xl text-yellow-300 drop-shadow-[0_0_8px_#fde047]" style={{ animationDelay: `${0.5 + i * 0.12}s` }}>
                  ★
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Ledakan efek saat kotak terbuka — sama dengan slide Knife */}
      {isOpen && (
        <div className="absolute left-1/2 top-[300px] h-0 w-0">
          <GodRays size={620} intensity={1.1} color={rayColor} />
          <Shockwave size={500} color={`rgba(${rayColor},.9)`} />
          <Shockwave size={360} delay={0.15} />
          <Flare width={500} color={rayColor} />
          <Burst count={18} distance={230} />
          <Burst count={12} distance={140} shape="dot" size={8} colors={['#a970ff', '#fff', '#7cf8ff']} delay={0.05} />
          <Confetti count={40} />
        </div>
      )}

      {(taps >= 2 || charging) && !isOpen && (
        <div className="absolute left-1/2 top-[345px] h-0 w-0 transition-opacity" style={{ opacity: charging ? 0.9 : 0.45 }}>
          <GodRays size={charging ? 420 : 280} intensity={charging ? 1 : 0.6} color={rayColor} core={false} />
        </div>
      )}

      {/* Kotak hadiah */}
      <div className="absolute left-1/2 top-[300px] w-[200px] -translate-x-1/2">
        {isOpen && <div className="beam-up pointer-events-none absolute bottom-[110px] left-1/2 h-[520px] w-[150px] bg-gradient-to-t from-white via-amber-100/60 to-transparent blur-md" />}

        {isOpen && (
          <div className="absolute left-1/2 top-[-62px] z-20 h-[240px] w-[336px] -translate-x-1/2">
            <div className="weapon-rise h-full w-full">
              <div className={`float relative flex h-full w-full items-center justify-center ${showInfo ? 'reveal-pop' : ''}`}>
                <GunRevealCanvas id={weapon.id} silhouette={!showInfo} />
                {!showInfo && (
                  <span
                    className="absolute inset-0 flex items-center justify-center pl-4 text-4xl font-bold text-white/90 drop-shadow-[0_0_10px_#7cf8ff]"
                    style={{ transform: 'rotate(35deg)' }}
                  >
                    ?
                  </span>
                )}
              </div>
            </div>
            <SparkleField count={8} spread={1.6} delay={0.8} />
          </div>
        )}

        <div
          className={`relative z-10 ${anim}`}
          style={{
            transformOrigin: '50% 100%',
            animationDuration: anim === 'wobble' ? `${0.6 - taps * 0.1}s` : anim === 'violent' ? '.3s' : undefined,
          }}
        >
          <div ref={punchRef} style={{ transformOrigin: '50% 100%' }}>
            <div className={isOpen ? 'box-sink' : ''} style={{ animationDelay: isOpen ? '.2s' : undefined }}>
              <div className={`relative z-20 h-[96px] w-[200px] ${isOpen ? 'lid-fly' : ''}`}>
                <GiftBoxLid />
              </div>
              {!isOpen && (
                <div
                  className={`pointer-events-none absolute left-1/2 top-[84px] z-30 h-[14px] w-[176px] -translate-x-1/2 rounded-full ${seam > 0 ? 'seam-pulse' : ''}`}
                  style={{
                    opacity: seam,
                    background: 'linear-gradient(90deg, transparent, #fff8d0 15%, #ffffff 50%, #fff8d0 85%, transparent)',
                    boxShadow: `0 0 ${16 + seam * 22}px ${6 + seam * 8}px rgba(${rayColor},${0.55 * seam})`,
                    transition: 'opacity .25s',
                  }}
                />
              )}
              <div className="relative z-10 mx-auto -mt-2 h-[132px] w-[180px]">
                <GiftBoxBody />
                {seam > 0 && !isOpen && (
                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-amber-100/40 to-transparent mix-blend-screen"
                    style={{ opacity: seam * 0.5 }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={`mx-auto mt-2 h-4 w-40 rounded-full bg-black/45 blur-sm ${isOpen ? 'box-sink' : ''}`} />
      </div>

      {taps > 0 && !isOpen && (
        <div key={`t${taps}`} className="pointer-events-none absolute left-1/2 top-[380px] h-0 w-0">
          <Burst count={7 + taps * 3} distance={100 + taps * 25} shape="star" size={11} />
        </div>
      )}

      {isOpen && <div className="flash pointer-events-none absolute inset-0 bg-white" />}

      {/* Info senjata + aksi */}
      <div className={`absolute inset-x-0 ${showInfo ? 'top-[390px]' : 'bottom-[36px]'} flex flex-col items-center gap-2 px-6`}>
        {state === 'ready' && (
          <>
            <div className="flex gap-2.5">
              {Array.from({ length: TAPS }).map((_, i) => (
                <span
                  key={i}
                  className={`h-3.5 w-3.5 rounded-full border-2 border-amber-300 transition-all duration-200 ${i < taps ? 'scale-125 bg-amber-300 shadow-[0_0_10px_#fcd34d]' : 'bg-transparent'}`}
                />
              ))}
            </div>
            <p key={taps} className="pop-in tap-hint text-2xl font-black text-white drop-shadow-[0_3px_0_rgba(0,0,0,.35)]">
              {taps === 0 ? 'TAP UNTUK MEMBUKA!' : taps === 1 ? 'TAP LAGI!' : 'SATU LAGI!!'}
            </p>
          </>
        )}
        {showInfo && (
          <div className="pop-in flex w-full max-w-[340px] flex-col items-center gap-1.5">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[11px] font-black tracking-wide text-amber-200">
                {weapon.emoji} {weapon.name}
              </span>
              <span
                className="rounded-full px-2 py-1 text-[10px] font-black text-white"
                style={{ background: RARITY_COLOR[weapon.rarity] }}
              >
                ⚡ {weapon.perk}
              </span>
            </div>
            <p className="max-w-[340px] text-center text-[12px] leading-snug font-medium text-white/80">{weapon.desc}</p>
            <p className="text-[16px] font-black text-amber-300 drop-shadow-[0_2px_0_#7a4a00]">+{coins} KOIN 💰</p>
            <GreenButton onClick={() => claim(true)} className="w-full max-w-[300px] px-4 py-2 text-[18px]">
              PAKAI &amp; LANJUT ➜
            </GreenButton>
            <button onClick={() => claim(false)} className="text-[12px] font-bold text-white/75 underline underline-offset-2">
              Lanjut tanpa ganti senjata
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
