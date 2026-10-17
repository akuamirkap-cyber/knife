import type { WeaponId } from '../weapons';

/** These three have been retired to their original art AND shot only. */
export const FIXED_CLASSIC_WEAPONS = ['plasma', 'laser', 'blackhole'] as const satisfies readonly WeaponId[];
export type FixedClassicWeapon = (typeof FIXED_CLASSIC_WEAPONS)[number];

/** Only guns with an actual design choice appear in the DESAIN tab. */
export const EDITABLE_WEAPONS = [
  'dragon', 'diamond', 'rainbow', 'meteor', 'golden', 'moonbeam', 'chicken', 'honey',
] as const satisfies readonly WeaponId[];
export type EditableWeapon = (typeof EDITABLE_WEAPONS)[number];
export const VARIANT_WEAPONS = [...EDITABLE_WEAPONS, ...FIXED_CLASSIC_WEAPONS] as const;
export type VariantWeapon = (typeof VARIANT_WEAPONS)[number];

export type GunVariant = 'original' | 'current' | 'latest';
export const GUN_VARIANTS: readonly { id: GunVariant; label: string }[] = [
  { id: 'original', label: 'Sebelumnya' },
  { id: 'current', label: 'Sekarang' },
  { id: 'latest', label: 'Terbaru' },
];
export type GunEffect = 'original' | 'new';
export const GUN_EFFECTS: readonly { id: GunEffect; label: string }[] = [
  { id: 'original', label: 'Sebelumnya' },
  { id: 'new', label: 'Baru' },
];

export function isFixedClassicGun(id: WeaponId | 'old'): id is FixedClassicWeapon {
  return (FIXED_CLASSIC_WEAPONS as readonly string[]).includes(id);
}
export function canChooseGunDesign(id: WeaponId | 'old'): id is EditableWeapon {
  return (EDITABLE_WEAPONS as readonly string[]).includes(id);
}
export function supportsGunVariants(id: WeaponId | 'old'): id is VariantWeapon {
  return isFixedClassicGun(id) || canChooseGunDesign(id);
}

export function getGunVariantOptions(id: VariantWeapon) {
  if (isFixedClassicGun(id)) return GUN_VARIANTS.slice(0, 1);
  // Honey Blaster has its classic jar and the reworked bee blaster, not a
  // fictitious third renderer with the same drawing under a different name.
  return id === 'honey' ? GUN_VARIANTS.slice(0, 2) : GUN_VARIANTS;
}
export function getGunEffectOptions(id: VariantWeapon) {
  return isFixedClassicGun(id) ? GUN_EFFECTS.slice(0, 1) : GUN_EFFECTS;
}

// User-requested loadouts. A new save key makes these take effect even for a
// player whose earlier choices were stored in v1; further picks persist in v2.
const DEFAULT_DESIGNS: Record<EditableWeapon, GunVariant> = {
  dragon: 'original', diamond: 'latest', rainbow: 'original', meteor: 'original',
  golden: 'original', moonbeam: 'original', chicken: 'latest', honey: 'original',
};
const DEFAULT_EFFECTS: Record<EditableWeapon, GunEffect> = {
  dragon: 'new', diamond: 'new', rainbow: 'new', meteor: 'new',
  golden: 'original', moonbeam: 'original', chicken: 'new', honey: 'new',
};

function readChoices(key: string): Record<string, unknown> | null {
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown> : null;
  } catch { return null; /* Storage may be disabled or contain malformed JSON. */ }
}

const DESIGN_KEY = 'gunhit:gun-designs:v2';
const EFFECT_KEY = 'gunhit:shot-effects:v2';
const saved: Partial<Record<EditableWeapon, GunVariant>> = {};
const effects: Partial<Record<EditableWeapon, GunEffect>> = {};

const designsOnDisk = readChoices(DESIGN_KEY);
const effectsOnDisk = readChoices(EFFECT_KEY);
for (const id of EDITABLE_WEAPONS) {
  const design = designsOnDisk?.[id];
  if (getGunVariantOptions(id).some(option => option.id === design)) saved[id] = design as GunVariant;
  const effect = effectsOnDisk?.[id];
  if (getGunEffectOptions(id).some(option => option.id === effect)) effects[id] = effect as GunEffect;
}
// Rubber Chicken wasn't changed by this request: preserve its v1 choices
// when migrating, but supersede the old saves for the newly specified guns.
if (!designsOnDisk) {
  const chicken = readChoices('gunhit:gun-designs:v1')?.chicken;
  if (getGunVariantOptions('chicken').some(option => option.id === chicken)) saved.chicken = chicken as GunVariant;
}
if (!effectsOnDisk) {
  const chicken = readChoices('gunhit:shot-effects:v1')?.chicken;
  if (getGunEffectOptions('chicken').some(option => option.id === chicken)) effects.chicken = chicken as GunEffect;
}

/** Defaults change only the silhouette, never weapon stats or mechanics. */
export function getGunVariant(id: WeaponId): GunVariant {
  if (isFixedClassicGun(id)) return 'original';
  return canChooseGunDesign(id) ? saved[id] ?? DEFAULT_DESIGNS[id] : 'current';
}

export function setGunVariant(id: EditableWeapon, variant: GunVariant): void {
  if (!getGunVariantOptions(id).some(option => option.id === variant)) return;
  saved[id] = variant;
  try { globalThis.localStorage?.setItem(DESIGN_KEY, JSON.stringify(saved)); }
  catch { /* Continue using this session's choice if storage is unavailable. */ }
}

/** Shot appearance remains independent from the gun's physical design. */
export function getGunEffect(id: WeaponId | 'old'): GunEffect {
  if (isFixedClassicGun(id)) return 'original';
  return canChooseGunDesign(id) ? effects[id] ?? DEFAULT_EFFECTS[id] : 'new';
}

export function setGunEffect(id: EditableWeapon, effect: GunEffect): void {
  effects[id] = effect;
  try { globalThis.localStorage?.setItem(EFFECT_KEY, JSON.stringify(effects)); }
  catch { /* Continue using this session's choice if storage is unavailable. */ }
}
