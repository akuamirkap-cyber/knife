import type { Rarity } from './weapons';

// Knife Boss's SunburstFX accepts RGB triplets. The four Gun Hit tiers use
// separate silver, aqua, violet and gold light, rather than a generic ray.
export const GUN_SUNBURST_RGB: Record<Rarity, string> = {
  UMUM: '201,220,238',
  LANGKA: '56,204,248',
  EPIC: '174,104,255',
  LEGENDARIS: '255,193,52',
};

export const gunSunburstColor = (rarity: Rarity) => GUN_SUNBURST_RGB[rarity];
