import { useEffect, useRef } from 'react';
import type { Weapon } from '../game/weapons';
import { drawProjectile } from '../game/art/projectiles';
import { drawMaterialTrail } from '../game/art/projectileTrails';
import { drawClassicBeam, drawLaserBeam, drawVoidTether } from '../game/art/beamEffects';
import { star } from '../game/art/kit';
import { useSlideActive } from '../../shared/SlideActivity';
import type { GunEffect } from '../game/art/gunVariants';

/** Tiny live comparison using the exact same projectile/beam renderers as gameplay. */
export default function ShotEffectCanvas({ weapon, effect }: { weapon: Weapon; effect: GunEffect }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const active = useSlideActive();
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = 152, h = 88;
    cv.width = w * dpr; cv.height = h * dpr;
    const c = cv.getContext('2d');
    if (!c) return;
    let frame = 0, previous = -Infinity;
    const paint = (now: number) => {
      if (now - previous >= 1000 / 18 - 1) {
        previous = now;
        const t = now / 1000;
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.clearRect(0, 0, w, h);
        // Small target rim makes the firing direction and hit point readable.
        c.strokeStyle = 'rgba(255,255,255,0.2)'; c.lineWidth = 2;
        c.beginPath(); c.arc(w / 2, -31, 42, 0, Math.PI * 2); c.stroke();
        if (weapon.id === 'laser' || weapon.id === 'moonbeam') {
          if (effect === 'original') drawClassicBeam(c, w / 2, 8, 84, 0.88, weapon.trail);
          else if (weapon.id === 'laser') drawLaserBeam(c, w / 2, 8, 84, 0.84, t);
          else {
            drawClassicBeam(c, w / 2, 8, 84, 0.54, weapon.trail);
            for (let i = 0; i < 5; i++) {
              const yy = 17 + ((i * 20 + t * 31) % 66);
              star(c, w / 2 + Math.sin(t * 4 + i) * 4, yy, i % 2 ? 4 : 6,
                i % 2 ? '#e9dcff' : '#fff9dc', 5);
            }
          }
        } else {
          c.save();
          c.translate(w / 2, 13 + Math.sin(t * 4) * 2);
          c.scale(1.15, 1.1);
          if (weapon.id === 'blackhole' && effect === 'new') {
            drawVoidTether(c, 0, 7, 0, 83, t);
          }
          if (!drawMaterialTrail(c, weapon.id, effect)) {
            const trail = c.createLinearGradient(0, 14, 0, 80);
            trail.addColorStop(0, `rgba(${weapon.trail},0.6)`);
            trail.addColorStop(1, `rgba(${weapon.trail},0)`);
            c.fillStyle = trail;
            c.beginPath(); c.moveTo(-6, 17); c.lineTo(6, 17);
            c.lineTo(0, 82); c.closePath(); c.fill();
          }
          drawProjectile(c, weapon.id, Math.min(weapon.stick + 21, 44), t, 0, false, effect);
          c.restore();
        }
      }
      if (active) frame = requestAnimationFrame(paint);
    };
    paint(performance.now());
    return () => cancelAnimationFrame(frame);
  }, [weapon.id, weapon.stick, weapon.trail, effect, active]);
  return <canvas ref={ref} width={152} height={88} className="pointer-events-none block h-[74px] w-[128px] max-w-full sm:h-[88px] sm:w-[152px]" />;
}
