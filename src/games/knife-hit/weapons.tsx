import { useId } from "react";

export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGEND" | "MYTHIC";

export interface WeaponDef {
  id: string;
  name: string;
  rarity: Rarity;
  desc: string;
  power: number;
}

export const RARITY_STYLE: Record<Rarity, { color: string; glow: string; bg: string; text: string; chance: string }> = {
  COMMON: { color: "#9aa7b2", glow: "rgba(154,167,178,.5)", bg: "linear-gradient(135deg,#3a4550,#232c34)", text: "#cbd5e1", chance: "45%" },
  RARE: { color: "#38bdf8", glow: "rgba(56,189,248,.55)", bg: "linear-gradient(135deg,#0c4a6e,#082f49)", text: "#7dd3fc", chance: "27%" },
  EPIC: { color: "#c084fc", glow: "rgba(192,132,252,.6)", bg: "linear-gradient(135deg,#6b21a8,#3b0764)", text: "#d8b4fe", chance: "17%" },
  LEGEND: { color: "#fbbf24", glow: "rgba(251,191,36,.65)", bg: "linear-gradient(135deg,#92400e,#451a03)", text: "#fde68a", chance: "8%" },
  MYTHIC: { color: "#fb7185", glow: "rgba(251,113,133,.7)", bg: "linear-gradient(135deg,#9f1239,#4c0519)", text: "#fecdd3", chance: "3%" },
};

export const WEAPONS: WeaponDef[] = [
  { id: "revolver", name: "Revolver Koboi", rarity: "COMMON", desc: "Warisan sheriff kota tua. Bunyinya nyaring!", power: 12, },
  { id: "ak47", name: "AK-47 Kayu", rarity: "COMMON", desc: "Legenda medan tempur bergagang kayu.", power: 25, },
  { id: "cricket", name: "Cricket Smasher", rarity: "COMMON", desc: "Lemparan bola 150km/jam!", power: 18, },
  { id: "nail", name: "Nail Gun", rarity: "COMMON", desc: "Tukang bangunan jadi tukang tembak.", power: 15, },
  { id: "fish", name: "Fish Gun", rarity: "COMMON", desc: "Menembakkan ikan terbang yang licin.", power: 14, },
  { id: "crossbow", name: "Crossbow Kayu", rarity: "COMMON", desc: "Senapan panah pemburu senyap.", power: 22, },
  { id: "disc", name: "Disc Launcher", rarity: "COMMON", desc: "Piringan terbang pemotong keju.", power: 16, },
  { id: "pencil", name: "Pencil Gun", rarity: "COMMON", desc: "Senjata anak sekolahan yang tajam.", power: 10, },
  { id: "sandal", name: "Sandal Jepit", rarity: "COMMON", desc: "Senjata emak paling mematikan.", power: 30, },
  { id: "slingshot", name: "Ketapel Klasik", rarity: "COMMON", desc: "Karet gelang + batu kali.", power: 11, },
  { id: "bubble", name: "Bubble Gun", rarity: "COMMON", desc: "Gelembung sabun penuh kejutan.", power: 9, },
  { id: "glue", name: "Glue Gun", rarity: "COMMON", desc: "Lem super lengket, boss auto nempel.", power: 13, },
  { id: "card", name: "Card Thrower", rarity: "RARE", desc: "Kartu remi setajam silet.", power: 35, },
  { id: "bee", name: "Bee Rifle", rarity: "RARE", desc: "Dengungan 1000 lebah marah.", power: 42, },
  { id: "coin", name: "Coin Blaster", rarity: "RARE", desc: "Sultan menembak pakai koin emas.", power: 38, },
  { id: "paintball", name: "Paintball Splash", rarity: "RARE", desc: "Ledakan cat warna-warni.", power: 33, },
  { id: "kunai", name: "Kunai Gun", rarity: "RARE", desc: "Senjata ninja, cepat & senyap.", power: 45, },
  { id: "plasma", name: "Plasma Coil", rarity: "EPIC", desc: "Listrik biru 10.000 volt.", power: 60, },
  { id: "laser", name: "Laser Merah", rarity: "EPIC", desc: "Sinar fokus pemotong baja.", power: 62, },
  { id: "electro", name: "Electro Storm", rarity: "EPIC", desc: "Badai petir dalam genggaman.", power: 65, },
  { id: "frost", name: "Frostbite", rarity: "EPIC", desc: "Membekukan boss jadi es keju.", power: 64, },
  { id: "flame", name: "Flame Thrower", rarity: "EPIC", desc: "Semburan api naga mini.", power: 66, },
  { id: "acid", name: "Acid Spitter", rarity: "EPIC", desc: "Cairan hijau melelehkan semua.", power: 61, },
  { id: "emerald", name: "Emerald Laser", rarity: "EPIC", desc: "Permata zamrud bertenaga laser.", power: 68, },
  { id: "crystal", name: "Crystal Shard", rarity: "EPIC", desc: "Kristal ungu beresonansi magis.", power: 67, },
  { id: "pixel", name: "8-Bit Blaster", rarity: "EPIC", desc: "Tembakan kotak-kotak retro.", power: 59, },
  { id: "shadow", name: "Shadow Fang", rarity: "EPIC", desc: "Bayangan yang menggigit.", power: 70, },
  { id: "bazooka", name: "Bazooka Klasik", rarity: "LEGEND", desc: "Satu tembakan, satu ledakan.", power: 85, },
  { id: "rpg", name: "RPG Badak", rarity: "LEGEND", desc: "Roket berhulu ledak raksasa.", power: 88, },
  { id: "gravity", name: "Gravity Hole", rarity: "LEGEND", desc: "Lubang hitam mini penyedot boss.", power: 92, },
  { id: "meteor", name: "Meteor Crash", rarity: "LEGEND", desc: "Menembakkan pecahan meteor.", power: 90, },
  { id: "wand", name: "Magic Wand", rarity: "LEGEND", desc: "Tongkat bintang penuh mantra.", power: 86, },
  { id: "firework", name: "Firework Party", rarity: "LEGEND", desc: "Pesta kembang api mematikan.", power: 84, },
  { id: "beam", name: "Beam Cannon", rarity: "LEGEND", desc: "Meriam cahaya pemusnah.", power: 89, },
  { id: "bfg", name: "BFG 9000", rarity: "MYTHIC", desc: "Senjata pamungkas pemusnah planet.", power: 100, },
  { id: "holy", name: "Holy Light", rarity: "MYTHIC", desc: "Cahaya suci bersayap malaikat.", power: 98, },
  { id: "unicorn", name: "Rainbow Unicorn", rarity: "MYTHIC", desc: "Pelangi + tanduk unicorn ajaib.", power: 97, },
  { id: "phoenix", name: "Phoenix Reborn", rarity: "MYTHIC", desc: "Burung api yang tak pernah mati.", power: 99, },
  { id: "solar", name: "Solar Wrath", rarity: "MYTHIC", desc: "Murka matahari dalam genggaman.", power: 96, },
];

export function rollWeapon(): WeaponDef {
  const r = Math.random() * 100;
  let pool: WeaponDef[];
  if (r < 3) pool = WEAPONS.filter((w) => w.rarity === "MYTHIC");
  else if (r < 11) pool = WEAPONS.filter((w) => w.rarity === "LEGEND");
  else if (r < 28) pool = WEAPONS.filter((w) => w.rarity === "EPIC");
  else if (r < 55) pool = WEAPONS.filter((w) => w.rarity === "RARE");
  else pool = WEAPONS.filter((w) => w.rarity === "COMMON");
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Roll tanpa duplikat — weapon yang sudah dimiliki tidak masuk acakan.
 *  Pool kotak hadiah: COMMON + RARE + EPIC + LEGEND + MYTHIC (semua), tapi yang sudah punya di-exclude. */
export function rollWeaponUnique(ownedIds: string[]): WeaponDef | null {
  const remaining = WEAPONS.filter((w) => !ownedIds.includes(w.id));
  if (remaining.length === 0) return null;
  const has = (r: Rarity) => remaining.some((w) => w.rarity === r);
  const r = Math.random() * 100;
  const order: Rarity[] =
    r < 3 ? ["MYTHIC", "LEGEND", "EPIC", "RARE", "COMMON"]
    : r < 11 ? ["LEGEND", "EPIC", "RARE", "MYTHIC", "COMMON"]
    : r < 28 ? ["EPIC", "RARE", "LEGEND", "COMMON", "MYTHIC"]
    : r < 55 ? ["RARE", "COMMON", "EPIC", "LEGEND", "MYTHIC"]
    : ["COMMON", "RARE", "EPIC", "LEGEND", "MYTHIC"];
  for (const rar of order) {
    if (has(rar)) {
      const pool = remaining.filter((w) => w.rarity === rar);
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
  return remaining[Math.floor(Math.random() * remaining.length)];
}

/** Random 1 weapon belum dimiliki dari rarity tertentu (untuk milestone achievement). */
export function rollByRarity(rarity: Rarity, ownedIds: string[]): WeaponDef | null {
  const pool = WEAPONS.filter((w) => w.rarity === rarity && !ownedIds.includes(w.id));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export const WEAPON_PRICE: Record<Rarity, number> = {
  COMMON: 800,
  RARE: 1500,
  EPIC: 2500,
  LEGEND: 5000,
  MYTHIC: 10000,
};

/* ---------- Combat: tiap senjata punya DAMAGE & KECEPATAN TEMBAK berbeda ----------
   damage  = dari power (1..6): senjata lemah = 1 koin/tembakan, obliterator = 5-6 koin
   cooldown = makin besar damage makin LAMBAT jedanya (tapi DPS tier tinggi tetap unggul) */
export interface WeaponCombat {
  damage: number;
  cooldownMs: number;
  speedLabel: string;
  speedIcon: string;
  bullet: string;
  bulletGlow: string;
}

const BULLET_BY_RARITY: Record<Rarity, { bullet: string; glow: string }> = {
  COMMON: { bullet: "#e2e8f0", glow: "rgba(226,232,240,.8)" },
  RARE: { bullet: "#7dd3fc", glow: "rgba(56,189,248,.85)" },
  EPIC: { bullet: "#d8b4fe", glow: "rgba(192,132,252,.9)" },
  LEGEND: { bullet: "#fde047", glow: "rgba(251,191,36,.9)" },
  MYTHIC: { bullet: "#fda4af", glow: "rgba(251,113,133,.95)" },
};

export function getWeaponStats(def: WeaponDef): WeaponCombat {
  const damage = Math.min(6, Math.max(1, Math.round(def.power / 17)));
  const jitter = def.power % 4;
  const cooldownMs = 200 + damage * 75 + jitter * 18;
  const speedLabel =
    cooldownMs <= 320 ? "Sangat Cepat" : cooldownMs <= 400 ? "Cepat" : cooldownMs <= 490 ? "Sedang" : cooldownMs <= 580 ? "Lambat" : "Sangat Lambat";
  const speedIcon =
    cooldownMs <= 320 ? "⚡⚡⚡" : cooldownMs <= 400 ? "⚡⚡" : cooldownMs <= 490 ? "⚡" : cooldownMs <= 580 ? "🐢" : "🐌";
  const b = BULLET_BY_RARITY[def.rarity];
  return { damage, cooldownMs, speedLabel, speedIcon, bullet: b.bullet, bulletGlow: b.glow };
}

const S = "#0e222e";

/* Each weapon drawn in 240x150 side view */
function Inner({ id }: { id: string }) {
  switch (id) {
    case "revolver":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
        <path d="M70 70 L108 70 L100 132 Q98 138 90 138 L64 138 Q58 138 59 132 Z" fill="#8a5a2b" />
        <path d="M72 84 L102 84 M70 98 L100 98 M68 112 L98 112" stroke="#5a3410" strokeWidth={2.5} />
        <rect x="28" y="46" width="110" height="30" rx="8" fill="#c3ccd4" />
        <rect x="42" y="50" width="60" height="8" rx="4" fill="#fff" opacity=".7" stroke="none" />
        <rect x="104" y="42" width="34" height="38" rx="6" fill="#8f9aa5" />
        <circle cx="115" cy="55" r="5" fill="#5b636d" /><circle cx="128" cy="55" r="5" fill="#5b636d" /><circle cx="115" cy="68" r="5" fill="#5b636d" /><circle cx="128" cy="68" r="5" fill="#5b636d" />
        <rect x="136" y="50" width="66" height="20" rx="6" fill="#aeb9c4" />
        <rect x="200" y="46" width="12" height="28" rx="4" fill="#8a5a2b" />
        <path d="M50 46 L56 32 L66 32 L62 46 Z" fill="#8a5a2b" />
      </g>);
    case "ak47":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
        <path d="M18 78 L52 70 L58 96 L24 104 Z" fill="#8a5a2b" />
        <rect x="50" y="60" width="86" height="30" rx="6" fill="#2b3138" />
        <rect x="58" y="64" width="60" height="6" rx="3" fill="#5b636d" stroke="none" />
        <path d="M96 88 Q100 112 84 124 L72 118 Q86 108 84 88 Z" fill="#6b7280" />
        <path d="M120 66 L150 66 L146 84 L118 84 Z" fill="#8a5a2b" />
        <rect x="148" y="68" width="56" height="14" rx="5" fill="#2b3138" />
        <rect x="202" y="64" width="14" height="22" rx="3" fill="#8a5a2b" />
        <rect x="70" y="52" width="8" height="10" fill="#2b3138" /><rect x="128" y="50" width="8" height="12" fill="#2b3138" />
      </g>);
    case "cricket":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <path d="M60 66 L110 66 L102 134 L66 134 Z" fill="#3f6212" />
        <rect x="66" y="74" width="30" height="50" rx="8" fill="#d9b382" strokeWidth={2.5} />
        <circle cx="150" cy="60" r="18" fill="#dc2626" /><path d="M138 52 Q150 60 138 70" stroke="#fff" strokeWidth={2} fill="none" />
        <rect x="30" y="56" width="90" height="26" rx="8" fill="#65a30d" />
        <rect x="118" y="60" width="52" height="16" rx="6" fill="#365314" />
        <rect x="38" y="60" width="60" height="6" rx="3" fill="#d9f99d" stroke="none" />
      </g>);
    case "nail":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="40" y="52" width="100" height="44" rx="8" fill="#6b7280" />
        <rect x="40" y="52" width="100" height="14" fill="#f97316" stroke="none" opacity=".9" />
        <rect x="60" y="30" width="70" height="24" rx="4" fill="#374151" />
        <path d="M66 36 L120 36 M66 42 L120 42 M66 48 L120 48" stroke="#9ca3af" strokeWidth={2} />
        <rect x="138" y="60" width="52" height="22" rx="4" fill="#9ca3af" />
        <rect x="188" y="58" width="12" height="26" rx="3" fill="#f97316" />
        <path d="M64 94 L96 94 L90 130 L60 130 Z" fill="#374151" />
      </g>);
    case "fish":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <ellipse cx="120" cy="66" rx="62" ry="34" fill="#38bdf8" />
        <path d="M176 66 L214 44 L208 66 L214 88 Z" fill="#0284c7" />
        <path d="M110 34 L128 52 L100 52 Z" fill="#0284c7" />
        <circle cx="80" cy="60" r="10" fill="#fff" /><circle cx="80" cy="60" r="4.5" fill="#0c4a6e" stroke="none" />
        <path d="M96 74 Q110 78 124 74" stroke="#0c4a6e" strokeWidth={2.5} fill="none" />
        <path d="M130 58 L146 62 L130 66 M140 52 L156 62 L140 72" stroke="#7dd3fc" strokeWidth={2.5} fill="none" />
        <path d="M96 96 L124 96 L118 132 L70 132 Z" fill="#0c4a6e" />
        <circle cx="205" cy="40" r="5" fill="#bae6fd" strokeWidth={2} /><circle cx="220" cy="28" r="3.5" fill="#bae6fd" strokeWidth={2} />
      </g>);
    case "crossbow":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
        <path d="M60 70 L170 70 L160 84 L60 84 Z" fill="#8a5a2b" />
        <path d="M170 40 Q150 62 170 100" fill="none" strokeWidth={6} stroke="#57534e" />
        <path d="M170 40 Q120 62 60 66 M170 100 Q120 78 60 74" fill="none" strokeWidth={2} stroke="#e7e5e4" />
        <rect x="120" y="60" width="90" height="8" rx="4" fill="#d6d3d1" />
        <path d="M205 60 L228 64 L205 68 Z" fill="#dc2626" />
        <path d="M80 84 L110 84 L104 130 L74 130 Z" fill="#5a3410" />
        <circle cx="95" cy="77" r="7" fill="#44403c" />
      </g>);
    case "disc":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="40" y="62" width="110" height="32" rx="10" fill="#7c3aed" />
        <ellipse cx="95" cy="48" rx="42" ry="14" fill="#22d3ee" /><ellipse cx="95" cy="48" rx="14" ry="5" fill="#fff" strokeWidth={2} />
        <rect x="148" y="66" width="54" height="20" rx="6" fill="#4c1d95" />
        <rect x="200" y="62" width="12" height="28" rx="4" fill="#22d3ee" />
        <path d="M64 92 L98 92 L92 130 L60 130 Z" fill="#4c1d95" />
        <rect x="50" y="68" width="70" height="7" rx="3.5" fill="#c4b5fd" stroke="none" />
      </g>);
    case "pencil":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <path d="M60 68 L100 68 L94 132 L58 132 Z" fill="#3b82f6" />
        <path d="M40 56 L170 56 L170 80 L40 80 Z" fill="#facc15" />
        <path d="M40 56 L40 80 M70 56 L70 80 M100 56 L100 80 M130 56 L130 80" stroke="#a16207" strokeWidth={2} />
        <path d="M170 56 L206 62 L206 74 L170 80 Z" fill="#e8c39e" />
        <path d="M206 62 L224 68 L206 74 Z" fill="#1f2937" />
        <rect x="20" y="54" width="22" height="28" rx="5" fill="#f9a8d4" />
      </g>);
    case "sandal":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="36" y="60" width="110" height="30" rx="10" fill="#f97316" />
        <ellipse cx="100" cy="38" rx="52" ry="16" fill="#14b8a6" />
        <path d="M100 30 L108 48 M100 30 L88 46 M100 30 L100 50" stroke="#0f766e" strokeWidth={3} fill="none" />
        <circle cx="66" cy="38" r="4" fill="#99f6e4" stroke="none" /><circle cx="130" cy="38" r="4" fill="#99f6e4" stroke="none" />
        <rect x="144" y="64" width="52" height="18" rx="6" fill="#7c2d12" />
        <path d="M60 88 L94 88 L88 130 L56 130 Z" fill="#7c2d12" />
      </g>);
    case "slingshot":
      return (<g stroke={S} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
        <path d="M100 140 L100 90 M100 90 L64 44 M100 90 L140 44" fill="none" stroke="#8a5a2b" />
        <path d="M64 44 L140 44" stroke="#ef4444" strokeWidth={3} />
        <path d="M88 62 L116 62 L110 74 L94 74 Z" fill="#78350f" strokeWidth={3} />
        <circle cx="102" cy="52" r="9" fill="#57534e" />
        <path d="M88 100 L112 100 L110 140 L90 140 Z" fill="#5a3410" strokeWidth={3} />
      </g>);
    case "bubble":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="46" y="66" width="92" height="34" rx="14" fill="#ec4899" />
        <circle cx="70" cy="78" r="8" fill="#fdf2f8" strokeWidth={2.5} /><circle cx="92" cy="80" r="5" fill="#fdf2f8" strokeWidth={2} />
        <circle cx="170" cy="72" r="20" fill="none" strokeWidth={5} stroke="#f9a8d4" />
        <circle cx="138" cy="72" width="10" height="10" r="0" fill="none" />
        <rect x="134" y="68" width="22" height="10" fill="#9d174d" />
        <path d="M64 98 L94 98 L88 132 L60 132 Z" fill="#9d174d" />
        <circle cx="196" cy="40" r="9" fill="#fce7f3" opacity=".8" strokeWidth={2} /><circle cx="214" cy="58" r="6" fill="#fce7f3" opacity=".8" strokeWidth={2} /><circle cx="188" cy="22" r="5" fill="#fce7f3" opacity=".8" strokeWidth={2} />
      </g>);
    case "glue":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="48" y="58" width="96" height="36" rx="10" fill="#3b82f6" />
        <rect x="120" y="52" width="56" height="16" rx="8" fill="#bfdbfe" opacity=".9" />
        <path d="M174 58 L204 64 L204 70 L174 76 Z" fill="#1e3a8a" />
        <path d="M204 68 Q208 80 202 86" stroke="#bfdbfe" strokeWidth={4} fill="none" />
        <circle cx="202" cy="92" r="4" fill="#bfdbfe" strokeWidth={2} />
        <path d="M86 92 L116 92 L110 130 L80 130 Z" fill="#1e3a8a" />
        <path d="M112 92 Q118 104 108 108" fill="none" stroke="#f97316" strokeWidth={5} />
        <rect x="58" y="64" width="50" height="8" rx="4" fill="#bfdbfe" stroke="none" />
      </g>);
    case "card":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="44" y="64" width="110" height="30" rx="8" fill="#111827" />
        <rect x="54" y="68" width="60" height="7" rx="3.5" fill="#ef4444" stroke="none" />
        <g transform="rotate(-18 130 40)"><rect x="108" y="14" width="32" height="44" rx="5" fill="#fff" /><text x="116" y="42" fontSize="18" stroke="none" fill="#dc2626" fontWeight="bold">A</text></g>
        <g><rect x="138" y="10" width="32" height="44" rx="5" fill="#fff" /><text x="146" y="38" fontSize="18" stroke="none" fill="#111" fontWeight="bold">K</text></g>
        <g transform="rotate(18 168 40)"><rect x="162" y="14" width="32" height="44" rx="5" fill="#fff" /><text x="170" y="42" fontSize="18" stroke="none" fill="#dc2626" fontWeight="bold">Q</text></g>
        <rect x="152" y="68" width="50" height="18" rx="6" fill="#374151" />
        <path d="M66 92 L98 92 L92 130 L62 130 Z" fill="#374151" />
      </g>);
    case "bee":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="36" y="60" width="120" height="30" rx="10" fill="#facc15" />
        <path d="M62 60 L62 90 M86 60 L86 90 M110 60 L110 90" stroke="#111827" strokeWidth={8} />
        <ellipse cx="96" cy="42" rx="30" ry="12" fill="#e0f2fe" opacity=".85" />
        <ellipse cx="126" cy="40" rx="22" ry="10" fill="#e0f2fe" opacity=".85" />
        <rect x="154" y="64" width="48" height="18" rx="6" fill="#111827" />
        <path d="M202 64 L222 73 L202 82 Z" fill="#111827" />
        <path d="M60 88 L92 88 L86 130 L56 130 Z" fill="#713f12" />
        <path d="M150 60 L160 44 L168 60" stroke="#111827" strokeWidth={2.5} fill="none" />
      </g>);
    case "coin":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="40" y="60" width="112" height="32" rx="10" fill="#eab308" />
        <rect x="50" y="65" width="70" height="8" rx="4" fill="#fef9c3" stroke="none" />
        <g><ellipse cx="100" cy="44" rx="22" ry="8" fill="#fde047" /><rect x="78" y="44" width="44" height="12" fill="#eab308" /><ellipse cx="100" cy="56" rx="22" ry="8" fill="#ca8a04" /><text x="92" y="54" fontSize="12" stroke="none" fontWeight="bold" fill="#713f12">$</text></g>
        <g><ellipse cx="140" cy="40" rx="18" ry="7" fill="#fde047" /><rect x="122" y="40" width="36" height="10" fill="#eab308" /><ellipse cx="140" cy="50" rx="18" ry="7" fill="#ca8a04" /></g>
        <rect x="150" y="64" width="52" height="20" rx="6" fill="#713f12" />
        <path d="M62 90 L94 90 L88 130 L58 130 Z" fill="#713f12" />
      </g>);
    case "paintball":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="42" y="68" width="110" height="28" rx="9" fill="#1f2937" />
        <path d="M80 68 L96 40 L150 40 L138 68 Z" fill="#22c55e" />
        <ellipse cx="115" cy="40" rx="28" ry="7" fill="#16a34a" />
        <circle cx="180" cy="56" r="10" fill="#ec4899" /><circle cx="196" cy="66" r="7" fill="#3b82f6" /><circle cx="168" cy="48" r="6" fill="#eab308" />
        <rect x="150" y="72" width="52" height="16" rx="6" fill="#4b5563" />
        <path d="M64 94 L96 94 L90 130 L60 130 Z" fill="#111827" />
        <circle cx="60" cy="76" r="4" fill="#ec4899" stroke="none" />
      </g>);
    case "kunai":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="44" y="62" width="100" height="28" rx="8" fill="#27272a" />
        <path d="M70 62 L70 90 M90 62 L90 90" stroke="#dc2626" strokeWidth={4} />
        <path d="M142 56 L196 62 L196 76 L142 82 Z" fill="#d4d4d8" />
        <path d="M196 62 L222 69 L196 76 Z" fill="#a1a1aa" />
        <circle cx="52" cy="76" r="9" fill="none" strokeWidth={4} stroke="#52525b" />
        <path d="M66 88 L96 88 L90 130 L62 130 Z" fill="#18181b" />
        <path d="M160 64 L180 72" stroke="#fff" strokeWidth={2} />
      </g>);
    case "plasma":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="36" y="58" width="100" height="34" rx="10" fill="#0f172a" />
        <ellipse cx="70" cy="75" rx="10" ry="16" fill="none" stroke="#22d3ee" strokeWidth={4} />
        <ellipse cx="92" cy="75" rx="10" ry="16" fill="none" stroke="#22d3ee" strokeWidth={4} />
        <ellipse cx="114" cy="75" rx="10" ry="16" fill="none" stroke="#67e8f9" strokeWidth={4} />
        <rect x="134" y="62" width="56" height="24" rx="8" fill="#164e63" />
        <circle cx="200" cy="74" r="12" fill="#a5f3fc" /><circle cx="200" cy="74" r="6" fill="#fff" stroke="none" />
        <path d="M60 90 L92 90 L86 130 L56 130 Z" fill="#164e63" />
      </g>);
    case "laser":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="34" y="58" width="118" height="32" rx="12" fill="#e2e8f0" />
        <rect x="34" y="58" width="118" height="10" fill="#ef4444" stroke="none" opacity=".9" />
        <rect x="150" y="62" width="46" height="22" rx="6" fill="#7f1d1d" />
        <circle cx="206" cy="73" r="13" fill="#ef4444" /><circle cx="206" cy="73" r="6" fill="#fecaca" stroke="none" />
        <path d="M60 88 L92 88 L86 130 L56 130 Z" fill="#7f1d1d" />
        <path d="M219 73 L236 73" stroke="#ef4444" strokeWidth={4} />
      </g>);
    case "electro":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="38" y="60" width="110" height="30" rx="10" fill="#1e3a8a" />
        <path d="M78 62 L68 76 L78 76 L68 90 L90 72 L78 72 L88 62 Z" fill="#fde047" stroke="none" />
        <path d="M108 62 L100 74 L108 74 L100 88 L118 70 L108 70 L116 62 Z" fill="#fde047" stroke="none" />
        <circle cx="176" cy="75" r="14" fill="#fef9c3" /><path d="M176 63 L170 76 L176 76 L170 87 L184 74 L177 74 L183 63 Z" fill="#eab308" stroke="none" />
        <rect x="146" y="66" width="20" height="16" fill="#172554" />
        <path d="M60 88 L92 88 L86 130 L56 130 Z" fill="#172554" />
      </g>);
    case "frost":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="40" y="60" width="110" height="30" rx="10" fill="#bae6fd" />
        <path d="M70 60 L84 34 L92 60 M120 60 L134 32 L142 60" fill="#e0f2fe" />
        <path d="M84 34 L84 22 M78 28 L90 28 M134 32 L134 20 M128 26 L140 26" stroke="#fff" strokeWidth={2.5} />
        <rect x="148" y="64" width="48" height="20" rx="8" fill="#0284c7" />
        <path d="M196 58 L218 74 L196 90 Z" fill="#e0f2fe" />
        <circle cx="100" cy="75" r="7" fill="#fff" stroke="none" opacity=".9" />
        <path d="M62 88 L94 88 L88 130 L58 130 Z" fill="#0369a1" />
      </g>);
    case "flame":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="40" y="62" width="108" height="30" rx="10" fill="#1c1917" />
        <path d="M52 62 Q48 44 62 38 Q58 50 68 48 Q64 36 80 34 Q76 48 90 46 Q92 34 104 34 Q100 48 112 50 Q124 52 118 62 Z" fill="#fb923c" />
        <path d="M66 62 Q66 50 76 48 Q74 56 82 56 Q84 48 94 48 Q92 56 102 58 L102 62 Z" fill="#fde047" stroke="none" />
        <rect x="146" y="66" width="48" height="20" rx="6" fill="#7c2d12" />
        <path d="M194 62 L216 72 L194 82 Z" fill="#431407" />
        <path d="M62 90 L94 90 L88 130 L58 130 Z" fill="#431407" />
      </g>);
    case "acid":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="40" y="60" width="110" height="32" rx="10" fill="#365314" />
        <rect x="40" y="60" width="110" height="32" rx="10" fill="#84cc16" opacity=".45" stroke="none" />
        <circle cx="70" cy="74" r="6" fill="#d9f99d" stroke="none" /><circle cx="88" cy="78" r="4" fill="#d9f99d" stroke="none" /><circle cx="108" cy="72" r="5" fill="#d9f99d" stroke="none" />
        <path d="M60 92 L64 104 L60 114 M84 92 L88 102 M108 92 L112 106 L108 116" stroke="#84cc16" strokeWidth={4} fill="none" />
        <rect x="148" y="64" width="44" height="20" rx="6" fill="#1a2e05" />
        <circle cx="204" cy="74" r="10" fill="#84cc16" /><circle cx="204" cy="74" r="4" fill="#ecfccb" stroke="none" />
        <path d="M62 88 L86 88 L82 128 L58 128 Z" fill="#1a2e05" />
      </g>);
    case "emerald":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="38" y="60" width="108" height="30" rx="10" fill="#064e3b" />
        <path d="M84 38 L106 52 L96 74 L72 74 L62 52 Z" fill="#34d399" />
        <path d="M62 52 L106 52 M72 74 L78 56 L90 56 L96 74 M84 38 L84 74" stroke="#065f46" strokeWidth={2} fill="none" />
        <path d="M72 52 L80 46" stroke="#fff" strokeWidth={2.5} />
        <rect x="144" y="64" width="48" height="20" rx="6" fill="#022c22" />
        <circle cx="202" cy="74" r="10" fill="#6ee7b7" /><circle cx="202" cy="74" r="4" fill="#fff" stroke="none" />
        <path d="M60 88 L92 88 L86 130 L56 130 Z" fill="#022c22" />
      </g>);
    case "crystal":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="42" y="64" width="104" height="28" rx="10" fill="#4c1d95" />
        <path d="M70 64 L80 30 L92 64 Z" fill="#c4b5fd" /><path d="M90 64 L104 24 L118 64 Z" fill="#a78bfa" /><path d="M114 64 L124 38 L136 64 Z" fill="#ddd6fe" />
        <rect x="144" y="68" width="48" height="18" rx="6" fill="#2e1065" />
        <path d="M192 62 L214 77 L192 90 Z" fill="#c4b5fd" />
        <path d="M62 90 L94 90 L88 130 L58 130 Z" fill="#2e1065" />
      </g>);
    case "pixel":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="40" y="60" width="24" height="24" fill="#ef4444" /><rect x="64" y="60" width="24" height="24" fill="#f59e0b" /><rect x="88" y="60" width="24" height="24" fill="#10b981" /><rect x="40" y="84" width="24" height="12" fill="#3b82f6" /><rect x="64" y="84" width="24" height="12" fill="#8b5cf6" /><rect x="88" y="84" width="24" height="12" fill="#ec4899" />
        <rect x="112" y="64" width="48" height="24" fill="#111827" /><rect x="120" y="68" width="16" height="8" fill="#22d3ee" stroke="none" />
        <rect x="160" y="64" width="32" height="24" fill="#e5e7eb" /><rect x="192" y="64" width="16" height="24" fill="#ef4444" />
        <rect x="60" y="96" width="24" height="34" fill="#6b7280" />
      </g>);
    case "shadow":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="40" y="60" width="112" height="32" rx="12" fill="#09090b" />
        <circle cx="76" cy="74" r="6" fill="#a855f7" stroke="none" /><circle cx="100" cy="74" r="6" fill="#a855f7" stroke="none" />
        <path d="M64 60 Q70 44 86 46 Q82 54 92 54 Q100 44 112 48 Q108 56 118 58" fill="#3b0764" opacity=".9" />
        <rect x="150" y="64" width="46" height="22" rx="8" fill="#1c1917" />
        <circle cx="206" cy="75" r="11" fill="#3b0764" /><circle cx="206" cy="75" r="5" fill="#e9d5ff" stroke="none" />
        <path d="M62 90 L94 90 L88 130 L58 130 Z" fill="#09090b" />
      </g>);
    case "bazooka":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="22" y="56" width="170" height="36" rx="18" fill="#4d7c0f" />
        <rect x="22" y="56" width="170" height="12" fill="#65a30d" stroke="none" opacity=".8" />
        <rect x="188" y="62" width="28" height="24" rx="6" fill="#365314" />
        <circle cx="60" cy="74" r="10" fill="#365314" /><circle cx="100" cy="74" r="10" fill="#365314" />
        <path d="M84 90 L116 90 L110 130 L78 130 Z" fill="#365314" />
        <rect x="120" y="44" width="30" height="14" rx="4" fill="#365314" />
      </g>);
    case "rpg":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="30" y="64" width="130" height="26" rx="10" fill="#3f6212" />
        <path d="M160 56 L200 60 L200 80 L160 84 Z" fill="#65a30d" />
        <path d="M200 58 L226 64 L226 76 L200 82 Z" fill="#dc2626" />
        <path d="M150 64 L134 44 L142 64 M150 76 L134 96 L142 76" stroke="#365314" strokeWidth={4} fill="none" />
        <path d="M80 88 L110 88 L104 128 L74 128 Z" fill="#365314" />
        <rect x="50" y="68" width="60" height="7" rx="3.5" fill="#d9f99d" stroke="none" />
      </g>);
    case "gravity":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="36" y="60" width="110" height="32" rx="12" fill="#1e1b4b" />
        <circle cx="90" cy="76" r="18" fill="#000" /><circle cx="90" cy="76" r="18" fill="none" stroke="#a78bfa" strokeWidth={3} />
        <ellipse cx="90" cy="76" rx="28" ry="9" fill="none" stroke="#c4b5fd" strokeWidth={2.5} transform="rotate(-20 90 76)" />
        <circle cx="120" cy="64" r="4" fill="#ddd6fe" stroke="none" />
        <rect x="144" y="64" width="48" height="22" rx="8" fill="#312e81" />
        <circle cx="204" cy="75" r="10" fill="#4c1d95" /><circle cx="204" cy="75" r="4" fill="#000" stroke="none" />
        <path d="M60 90 L92 90 L86 130 L56 130 Z" fill="#312e81" />
      </g>);
    case "meteor":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="42" y="60" width="100" height="34" rx="12" fill="#78350f" />
        <circle cx="66" cy="72" r="6" fill="#451a03" stroke="none" /><circle cx="88" cy="80" r="4" fill="#451a03" stroke="none" /><circle cx="104" cy="68" r="5" fill="#451a03" stroke="none" />
        <path d="M142 60 L170 52 L178 68 L170 86 L142 86 Z" fill="#fb923c" />
        <path d="M170 52 L196 44 L188 68 L196 90 L170 86" fill="#ef4444" />
        <path d="M196 44 L214 38 M188 68 L208 68 M196 90 L214 96" stroke="#fdba74" strokeWidth={3} />
        <path d="M62 92 L94 92 L88 130 L58 130 Z" fill="#451a03" />
      </g>);
    case "wand":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="40" y="66" width="90" height="24" rx="10" fill="#92400e" />
        <rect x="128" y="62" width="66" height="12" rx="6" fill="#d6a35c" />
        <path d="M200 44 L204 56 L216 56 L206 63 L209 75 L200 68 L191 75 L194 63 L184 56 L196 56 Z" fill="#fde047" />
        <circle cx="184" cy="48" r="4" fill="#f9a8d4" stroke="none" /><circle cx="216" cy="42" r="3" fill="#a5f3fc" stroke="none" />
        <path d="M150 68 Q170 74 190 68" stroke="#f9a8d4" strokeWidth={2.5} fill="none" />
        <path d="M60 88 L90 88 L84 130 L56 130 Z" fill="#78350f" />
      </g>);
    case "firework":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="42" y="60" width="104" height="32" rx="10" fill="#dc2626" />
        <path d="M66 60 L66 92 M90 60 L90 92 M114 60 L114 92" stroke="#fff" strokeWidth={8} />
        <path d="M66 60 L66 92 M90 60 L90 92 M114 60 L114 92" stroke="#1d4ed8" strokeWidth={3} />
        <path d="M146 60 Q160 40 180 44 Q172 54 178 62" fill="none" stroke="#78350f" strokeWidth={2.5} />
        <circle cx="182" cy="38" r="5" fill="#fde047" stroke="none" />
        <circle cx="198" cy="30" r="3" fill="#f472b6" stroke="none" /><circle cx="168" cy="28" r="3" fill="#60a5fa" stroke="none" />
        <rect x="144" y="64" width="48" height="20" rx="6" fill="#7f1d1d" />
        <path d="M62 90 L94 90 L88 130 L58 130 Z" fill="#7f1d1d" />
      </g>);
    case "beam":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="34" y="60" width="104" height="30" rx="10" fill="#f1f5f9" />
        <rect x="44" y="64" width="60" height="7" rx="3.5" fill="#38bdf8" stroke="none" />
        <rect x="136" y="54" width="34" height="42" rx="8" fill="#334155" />
        <circle cx="188" cy="75" r="20" fill="#0ea5e9" /><circle cx="188" cy="75" r="13" fill="#bae6fd" /><circle cx="188" cy="75" r="6" fill="#fff" stroke="none" />
        <path d="M58 88 L90 88 L84 130 L54 130 Z" fill="#334155" />
      </g>);
    case "bfg":
      return (<g stroke={S} strokeWidth={3.5} strokeLinejoin="round">
        <rect x="26" y="50" width="130" height="46" rx="14" fill="#475569" />
        <rect x="26" y="50" width="130" height="14" fill="#94a3b8" stroke="none" opacity=".6" />
        <rect x="50" y="66" width="70" height="16" rx="8" fill="#86efac" /><rect x="58" y="69" width="40" height="6" rx="3" fill="#fff" stroke="none" />
        <rect x="154" y="58" width="52" height="32" rx="8" fill="#334155" />
        <circle cx="214" cy="74" r="14" fill="#22c55e" /><circle cx="214" cy="74" r="6" fill="#bbf7d0" stroke="none" />
        <path d="M60 94 L104 94 L96 134 L54 134 Z" fill="#1e293b" />
        <path d="M40 50 L52 30 L74 30 L64 50" fill="#334155" />
      </g>);
    case "holy":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <path d="M52 62 Q36 44 48 30 Q56 44 66 48 Q60 34 72 26 Q76 42 88 50 L80 66 Z" fill="#fff" />
        <path d="M60 62 Q52 50 58 40 M70 58 Q66 46 72 38" stroke="#fde68a" strokeWidth={2} fill="none" />
        <rect x="70" y="60" width="100" height="28" rx="12" fill="#fefce8" />
        <rect x="80" y="64" width="60" height="7" rx="3.5" fill="#fde047" stroke="none" />
        <ellipse cx="120" cy="44" rx="22" ry="7" fill="none" stroke="#fde047" strokeWidth={4} />
        <rect x="168" y="64" width="40" height="18" rx="8" fill="#eab308" />
        <circle cx="214" cy="73" r="10" fill="#fffbeb" /><circle cx="214" cy="73" r="4" fill="#fde047" stroke="none" />
        <path d="M86 86 L116 86 L110 130 L80 130 Z" fill="#eab308" />
      </g>);
    case "unicorn":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <rect x="40" y="62" width="96" height="28" rx="12" fill="#fff" />
        <rect x="40" y="62" width="96" height="7" fill="#f472b6" stroke="none" /><rect x="40" y="69" width="96" height="6" fill="#facc15" stroke="none" /><rect x="40" y="75" width="96" height="6" fill="#4ade80" stroke="none" /><rect x="40" y="81" width="96" height="6" fill="#60a5fa" stroke="none" />
        <path d="M110 62 L124 34 L132 62 Z" fill="#fef3c7" />
        <path d="M124 34 L132 24 L136 36" fill="#f9a8d4" stroke="none" />
        <path d="M70 62 Q66 48 78 44 Q76 54 86 54 Q88 44 98 46" fill="#f9a8d4" />
        <rect x="134" y="66" width="48" height="18" rx="8" fill="#fce7f3" />
        <circle cx="192" cy="75" r="10" fill="#f9a8d4" /><circle cx="192" cy="75" r="4" fill="#fff" stroke="none" />
        <path d="M60 88 L90 88 L84 130 L56 130 Z" fill="#f9a8d4" />
      </g>);
    case "phoenix":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <path d="M40 72 Q28 54 44 44 Q48 58 62 60 Q56 46 70 42 Q72 56 86 60 L80 76 Z" fill="#fb923c" />
        <path d="M52 68 Q48 58 56 52 M66 64 Q64 54 72 50" stroke="#fde047" strokeWidth={2.5} fill="none" />
        <rect x="72" y="62" width="96" height="28" rx="12" fill="#9a3412" />
        <circle cx="96" cy="72" r="5" fill="#fde047" stroke="none" /><circle cx="112" cy="74" r="4" fill="#fb923c" stroke="none" />
        <path d="M168 62 L196 54 L200 70 L196 86 L168 84 Z" fill="#ef4444" />
        <path d="M196 54 L218 46 L210 70 L218 92 L196 86" fill="#fde047" />
        <path d="M88 88 L118 88 L112 130 L82 130 Z" fill="#7c2d12" />
      </g>);
    case "solar":
      return (<g stroke={S} strokeWidth={3} strokeLinejoin="round">
        <circle cx="92" cy="74" r="26" fill="#f59e0b" />
        <circle cx="92" cy="74" r="16" fill="#fde047" /><circle cx="92" cy="74" r="7" fill="#fff7ed" stroke="none" />
        <path d="M92 38 L92 28 M92 120 L92 110 M56 74 L46 74 M138 74 L128 74 M66 48 L60 42 M124 106 L118 100 M118 48 L124 42 M60 106 L66 100" stroke="#fbbf24" strokeWidth={4} />
        <rect x="116" y="66" width="56" height="20" rx="8" fill="#7c2d12" />
        <circle cx="184" cy="76" r="12" fill="#fdba74" /><circle cx="184" cy="76" r="5" fill="#fff" stroke="none" />
        <path d="M70 96 L102 96 L96 132 L64 132 Z" fill="#7c2d12" />
      </g>);
    default:
      return (<g><rect x="40" y="60" width="120" height="30" rx="10" fill="#888" /></g>);
  }
}

export function WeaponArt({
  id, className = "", style, silhouette = false,
}: { id: string; className?: string; style?: React.CSSProperties; silhouette?: boolean }) {
  return (
    <svg
      viewBox="0 0 240 150"
      className={className}
      style={{
        ...style,
        filter: silhouette
          ? "brightness(0) drop-shadow(0 0 6px rgba(200,245,255,.95)) drop-shadow(0 0 14px rgba(124,248,255,.5))"
          : style?.filter,
      }}
    >
      <Inner id={id} />
    </svg>
  );
}

/** Senjata + kilau yang DI-CROP ke dalam bentuk senjata (clipPath = siluet senjata).
 *  Jadi tidak ada lagi jajar genjang yang keluar dari bentuk. */
export function ShinyWeapon({
  id, className = "", style, glow,
}: { id: string; className?: string; style?: React.CSSProperties; glow?: string }) {
  const uid = useId().replace(/:/g, "");
  const clipId = `wclip${uid}`;
  const gradId = `wshine${uid}`;
  return (
    <svg
      viewBox="0 0 240 150"
      className={className}
      style={{ ...style, filter: glow ? `drop-shadow(0 0 12px ${glow})` : style?.filter, overflow: "visible" }}
    >
      <defs>
        <clipPath id={clipId}>
          <Inner id={id} />
        </clipPath>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0.15" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <Inner id={id} />
      <g clipPath={`url(#${clipId})`}>
        <g className="weapon-shine-sweep">
          <rect x="-110" y="-30" width="64" height="220" fill={`url(#${gradId})`} transform="skewX(-18)" />
          <rect x="-38" y="-30" width="10" height="220" fill="#ffffff" opacity="0.85" transform="skewX(-18)" />
        </g>
      </g>
    </svg>
  );
}
