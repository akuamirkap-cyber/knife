import { useEffect, useRef } from 'react';
import type { Weapon } from '../game/weapons';
import { drawGunCentered } from '../game/art/drawCentered';
import { getGunMetrics } from '../game/art/metrics';
import { GUN_VARIANTS, GUN_EFFECTS, getGunVariantOptions, getGunEffectOptions, type GunVariant, type GunEffect, type EditableWeapon } from '../game/art/gunVariants';
import ShotEffectCanvas from './ShotEffectCanvas';

type Description = Record<EditableWeapon, readonly string[]>;
const DESCRIPTIONS: Description = {
  chicken: ['Peluncur ayam karet klasik', 'Ayam pompa berayun', 'Ayam karet dengan sayap, grip, dan squeaker'],
  dragon: ['Naga merah klasik', 'Naga bersayap dan api', 'Kepala naga, sayap terlipat, grip kulit'],
  diamond: ['Permata dan bodi platinum', 'Kristal bersinar modern', 'Pistol berfaset dengan pegangan tegas'],
  rainbow: ['Busur pelangi klasik', 'Spektrum bercahaya', 'Prisma pelangi dalam pistol mutiara'],
  meteor: ['Batuan lava klasik', 'Inti meteor menyala', 'Meriam tempa dengan grip dan ventilasi lava'],
  golden: ['Pistol emas klasik', 'Emas berukir dan reload', 'Meriam emas, silinder dan slide bergerak'],
  moonbeam: ['Bulan sabit klasik', 'Tongkat bulan berbintang', 'Tongkat sihir dengan bintang dan aura'],
  honey: ['Stoples madu klasik dengan tutup kain', 'Blaster lebah dengan pompa dan reservoir madu'],
};

function VariantCanvas({ weapon, variant }: { weapon: Weapon; variant: GunVariant }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = 138; const h = 132;
    cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.translate(w / 2, h / 2);
    ctx.rotate(Math.PI / 4);
    const m = getGunMetrics(weapon.id, variant);
    ctx.scale((h * 0.94) / Math.max(m.span, 130), (h * 0.94) / Math.max(m.span, 130));
    drawGunCentered(ctx, weapon.id, 0.8, 0, true, variant);
  }, [weapon.id, variant]);
  return <canvas ref={ref} width={138} height={132} className="block h-[116px] w-[121px] shrink-0 sm:h-[132px] sm:w-[138px]" />;
}

interface Props {
  weapon: Weapon;
  variantId: EditableWeapon;
  selected: GunVariant;
  effect: GunEffect;
  onSelect: (variant: GunVariant) => void;
  onEffectSelect: (effect: GunEffect) => void;
  onClose: () => void;
}

export default function GunVariantPicker({ weapon, variantId, selected, effect, onSelect, onEffectSelect, onClose }: Props) {
  const designs = getGunVariantOptions(variantId);
  const effects = getGunEffectOptions(variantId);
  return (
    <div role="dialog" aria-modal="true" aria-label={`Bandingkan desain ${weapon.name}`}
      className="absolute inset-0 z-30 overflow-y-auto bg-gradient-to-b from-[#211346] via-[#110a2d] to-[#080316] text-white">
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-3 py-3 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">ARSENAL · PILIH DESAIN</div>
            <h2 className="mt-1 text-xl font-black leading-tight text-white">{weapon.name}</h2>
            <p className="mt-1 text-[11px] leading-snug text-indigo-200">Bandingkan desain dan efek tembakan. Pilihan keduanya terpisah.</p>
          </div>
          <button onClick={onClose} aria-label="Tutup pilihan desain"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-xl font-bold hover:bg-white/20">×</button>
        </div>
        <div className="mt-3 flex flex-1 flex-col justify-center gap-2.5">
          {designs.map(({ id, label }, index) => (
            <button key={id} type="button" onClick={() => onSelect(id)}
              aria-pressed={selected === id} aria-label={`Pilih desain ${label} untuk ${weapon.name}`}
              className={`group relative flex min-h-[126px] w-full items-center gap-2 overflow-hidden rounded-2xl border-2 px-2 py-1 text-left transition active:scale-[0.99] sm:min-h-[140px] sm:gap-4 sm:px-4 ${selected === id
                ? 'border-amber-300 bg-[#402358] shadow-[0_0_20px_rgba(250,204,21,0.22)]'
                : 'border-indigo-400/30 bg-[#21153f] hover:border-fuchsia-300 hover:bg-[#30204e]'}`}>
              <div className="pointer-events-none absolute -left-4 -top-12 h-40 w-40 rounded-full bg-purple-400/10 blur-2xl" />
              <VariantCanvas weapon={weapon} variant={id} />
              <span className="relative flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">0{index + 1} / 0{designs.length}</span>
                <span className="text-base font-black text-white sm:text-lg">{label}</span>
                <span className="text-[11px] leading-snug text-indigo-200 sm:text-xs">{DESCRIPTIONS[variantId][index]}</span>
                <span className={`w-fit rounded-full px-2 py-1 text-[10px] font-black ${selected === id ?
                  'bg-amber-300 text-[#271528]' : 'bg-white/10 text-white/80'}`}>
                  {selected === id ? '✓ DIPAKAI' : 'PILIH DESAIN'}
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-2xl border border-fuchsia-300/30 bg-[#1b1237] p-2.5" aria-label="Pilihan efek tembakan">
          <div className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-200">
            ✦ EFEK TEMBAKAN · PILIH TERPISAH ✦
          </div>
          <div className="grid grid-cols-2 gap-2">
            {effects.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => onEffectSelect(id)}
                aria-pressed={effect === id} aria-label={`Pilih efek ${label} untuk ${weapon.name}`}
                className={`flex min-w-0 flex-col items-center rounded-xl border-2 px-1 py-1.5 transition active:scale-[0.98] ${effect === id
                  ? 'border-cyan-200 bg-[#29425f] shadow-[0_0_14px_rgba(125,211,252,0.27)]'
                  : 'border-indigo-400/30 bg-[#281945] hover:border-fuchsia-300'}`}>
                <ShotEffectCanvas weapon={weapon} effect={id} />
                <span className="text-[11px] font-black text-white">{label}</span>
                <span className={`text-[9px] font-bold ${effect === id ? 'text-cyan-200' : 'text-indigo-300'}`}>
                  {effect === id ? '✓ DIPAKAI' : 'PILIH EFEK'}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-[9px] leading-snug text-indigo-300">
            Peluru, jejak, beam dan percikan berubah; damage, ammo, dan buff tetap.
          </p>
        </div>
        {variantId === 'moonbeam' && <p className="mt-2 text-center text-[10px] text-indigo-300">
          Ketiga versi Moonbeam tetap tongkat ajaib, tanpa pegangan pistol.
        </p>}
        <button onClick={onClose}
          className="mt-3 w-full rounded-xl border border-amber-200/80 bg-gradient-to-b from-amber-300 to-amber-500 py-2.5 text-sm font-black text-[#231432] shadow-lg transition hover:brightness-110 active:scale-[0.98]">
          GUNAKAN DESAIN {GUN_VARIANTS.find((v) => v.id === selected)?.label.toUpperCase()} · EFEK {GUN_EFFECTS.find((v) => v.id === effect)?.label.toUpperCase()}
        </button>
      </div>
    </div>
  );
}
