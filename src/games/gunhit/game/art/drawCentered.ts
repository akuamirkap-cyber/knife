import type { WeaponId } from '../weapons';
import type { GunVariant } from './gunVariants';
import { drawGun } from './guns';
import { getGunMetrics } from './metrics';

/**
 * Draws any weapon with its true geometric mass center placed EXACTLY at (0, 0).
 * This eliminates the issue where grips point outward or barrels shoot off-screen.
 */
export function drawGunCentered(
  c: CanvasRenderingContext2D,
  id: WeaponId,
  t = 0,
  flash = 0,
  ready = true,
  variant?: GunVariant,
) {
  const m = getGunMetrics(id, variant);
  // Offsetting by (-centerOffsetX, -centerOffsetY) shifts the true visual center directly to (0, 0)!
  drawGun(c, id, -m.centerOffsetX, -m.centerOffsetY, t, flash, ready, undefined, variant);
}
