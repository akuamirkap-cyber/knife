// 20 boss original — circular knife-hit style targets.
// Urutan kesulitan: steady -> pulse -> wobble -> pause -> reverse -> accel -> chaos.
// Detail lengkap: docs/rencana-100-level.txt

export type BossPattern = "steady" | "pulse" | "wobble" | "pause" | "reverse" | "accel" | "chaos";

export type BossId =
  | "sprout" | "thorn" | "gilt" | "bubble" | "tide"
  | "crab" | "cheese" | "shroom" | "frost" | "gloom"
  | "spider" | "mummy" | "lava" | "ghost" | "storm"
  | "shadow" | "golem" | "hydra" | "void" | "solar";

export interface Hazard {
  icon: string;
  name: string;
  desc: string;
}

export interface BossDef {
  id: BossId;
  world: string;
  name: string;
  title: string;
  desc: string;
  challenge: string; // "LEVEL 5" dst
  level: number;     // boss stage: 5,10,...,100
  knives: number;
  speed: number;
  difficulty: number; // 1-5
  pattern: BossPattern;
  hazards: Hazard[];
  colors: { from: string; to: string; edge: string; glow: string };
  grad: string;
  gradDark: string;
}

export const BOSSES: BossDef[] = [
  {
    id: "sprout", world: "TUNAS VALLEY", name: "SPROUTY", title: "Tunas Pemalu",
    desc: "Kecambah hijau yang baru melek. Putarannya pelan dan jujur.",
    challenge: "LEVEL 5", level: 5, knives: 5, speed: 90, difficulty: 1, pattern: "steady",
    hazards: [
      { icon: "🌱", name: "Tunas Goyang", desc: "Daun bergoyang mengikuti putaran" },
      { icon: "🐢", name: "Super Lambat", desc: "Jangan lengah, tetap bidik tengah" },
    ],
    colors: { from: "#d8ffb0", to: "#2f7d32", edge: "#4ade80", glow: "rgba(74,222,128,.45)" },
    grad: "linear-gradient(135deg,#4ade80,#15803d)", gradDark: "linear-gradient(135deg,#22c55e,#14532d)",
  },
  {
    id: "thorn", world: "THORNMAW", name: "TIKI GRRR", title: "Totem Rimba Angker",
    desc: "Totem kayu kuno penjaga rimba. Daunnya bergerak sendiri saat marah.",
    challenge: "LEVEL 10", level: 10, knives: 6, speed: 105, difficulty: 1, pattern: "steady",
    hazards: [
      { icon: "🍃", name: "Daun Rimbun", desc: "Daun menutup sebagian target" },
      { icon: "🌀", name: "Putaran Kejut", desc: "Kecepatan berubah tiba-tiba" },
    ],
    colors: { from: "#c4ff9e", to: "#14532d", edge: "#4ade80", glow: "rgba(74,222,128,.45)" },
    grad: "linear-gradient(135deg,#2fd66a,#0a9b4a)", gradDark: "linear-gradient(135deg,#17bd55,#067a36)",
  },
  {
    id: "gilt", world: "GILTVAULT", name: "MIMIC KING", title: "Raja Peti Emas",
    desc: "Peti harta yang hidup dan lapar. Mahkotanya terbuat dari koin korban.",
    challenge: "LEVEL 15", level: 15, knives: 6, speed: 115, difficulty: 2, pattern: "pulse",
    hazards: [
      { icon: "🦷", name: "Rahang Menutup", desc: "Lempar saat mulut terbuka lebar" },
      { icon: "🪙", name: "Hujan Koin", desc: "Koin berputar mengecoh bidikan" },
    ],
    colors: { from: "#ffe9a8", to: "#b45309", edge: "#f59e0b", glow: "rgba(251,191,36,.5)" },
    grad: "linear-gradient(135deg,#ff7a3d,#ff3d2e)", gradDark: "linear-gradient(135deg,#ff6a1a,#e01a0a)",
  },
  {
    id: "bubble", world: "BUIH BAY", name: "BUBBLEPUFF", title: "Ikan Buntal Ceria",
    desc: "Buntal yang mengembang saat gugup. Badannya licin dan bergoyang.",
    challenge: "LEVEL 20", level: 20, knives: 6, speed: 112, difficulty: 2, pattern: "wobble",
    hazards: [
      { icon: "🫧", name: "Gelembung", desc: "Gelembung menutupi titik bidik" },
      { icon: "🐡", name: "Mengembang", desc: "Badan mengembang-mengecil berirama" },
    ],
    colors: { from: "#d8f4ff", to: "#0369a1", edge: "#7dd3fc", glow: "rgba(125,211,252,.5)" },
    grad: "linear-gradient(135deg,#38bdf8,#0369a1)", gradDark: "linear-gradient(135deg,#0ea5e9,#075985)",
  },
  {
    id: "tide", world: "TIDEJACKS", name: "CAPT. RUSTJAW", title: "Hantu Bajak Laut",
    desc: "Kapten tengkorak penjaga lautan berkarat. Topi bajaknya menyimpan kutukan.",
    challenge: "LEVEL 25", level: 25, knives: 7, speed: 120, difficulty: 2, pattern: "pulse",
    hazards: [
      { icon: "🌫️", name: "Kabut Laut", desc: "Kabut lewat 2 detik, pandangan kabur" },
      { icon: "🌊", name: "Ombak Goyang", desc: "Target bergoyang seperti kapal" },
    ],
    colors: { from: "#bfe9ff", to: "#0c4a6e", edge: "#38bdf8", glow: "rgba(56,189,248,.45)" },
    grad: "linear-gradient(135deg,#3db8ff,#1d5cff)", gradDark: "linear-gradient(135deg,#1d9bff,#0a3ce0)",
  },
  {
    id: "crab", world: "TELUK KARAT", name: "CRABBY", title: "Kepiting Tukang Jepit",
    desc: "Kepiting karatan yang capitnya bisa membalik arus putaran!",
    challenge: "LEVEL 30", level: 30, knives: 7, speed: 122, difficulty: 3, pattern: "reverse",
    hazards: [
      { icon: "🦀", name: "Jepit Balik", desc: "Sesekali putaran BERBALIK arah" },
      { icon: "⚠️", name: "Ancang Capit", desc: "Capit terangkat = siap berbalik!" },
    ],
    colors: { from: "#ffc9a8", to: "#9a3412", edge: "#fb7185", glow: "rgba(251,113,133,.5)" },
    grad: "linear-gradient(135deg,#fb7185,#be123c)", gradDark: "linear-gradient(135deg,#f43f5e,#881337)",
  },
  {
    id: "cheese", world: "DAIRY DEPTHS", name: "CHEESE", title: "Keju Angker",
    desc: "Boss klasik berongga yang aromanya menusuk. Tetap favorit semua orang.",
    challenge: "LEVEL 35", level: 35, knives: 7, speed: 125, difficulty: 3, pattern: "pulse",
    hazards: [
      { icon: "🧀", name: "Lubang Keju", desc: "Banyak lubang mengecoh titik mendarat" },
      { icon: "🐭", name: "Tikus Usil", desc: "Kadang mencuri 1 pisau cadanganmu" },
    ],
    colors: { from: "#fff0a0", to: "#d48a1e", edge: "#c98a1c", glow: "rgba(255,200,60,.4)" },
    grad: "linear-gradient(135deg,#ffcf3d,#e8930c)", gradDark: "linear-gradient(135deg,#f5b83a,#c97a0a)",
  },
  {
    id: "shroom", world: "HUTAN SPORA", name: "SHROOMY", title: "Jamur Tukang Tidur",
    desc: "Jamur raksasa yang suka pura-pura berhenti. Jangan terkecoh!",
    challenge: "LEVEL 40", level: 40, knives: 7, speed: 125, difficulty: 3, pattern: "pause",
    hazards: [
      { icon: "😴", name: "Berhenti Palsu", desc: "Target kadang BERHENTI ~1 detik" },
      { icon: "🍄", name: "Spora Ngantuk", desc: "Spora beterbangan mengaburkan pandangan" },
    ],
    colors: { from: "#ffe4e6", to: "#9f1239", edge: "#f472b6", glow: "rgba(244,114,182,.5)" },
    grad: "linear-gradient(135deg,#f472b6,#be123c)", gradDark: "linear-gradient(135deg,#ec4899,#881337)",
  },
  {
    id: "frost", world: "TELUK KARAT", name: "FROSTBITE", title: "Raja Es Licin",
    desc: "Balok es angkuh yang makin lama makin cepat meluncur.",
    challenge: "LEVEL 45", level: 45, knives: 8, speed: 130, difficulty: 3, pattern: "accel",
    hazards: [
      { icon: "❄️", name: "Makin Ngebut", desc: "Kecepatan NAIK terus seiring waktu" },
      { icon: "🧊", name: "Licin", desc: "Jangan menunda lemparan!" },
    ],
    colors: { from: "#e0f7ff", to: "#075985", edge: "#a5f3fc", glow: "rgba(165,243,252,.55)" },
    grad: "linear-gradient(135deg,#67e8f9,#0369a1)", gradDark: "linear-gradient(135deg,#22d3ee,#075985)",
  },
  {
    id: "gloom", world: "GLOOMBIES", name: "GOBBLOR", title: "Raja Lendir Ungu",
    desc: "Monster lendir bermata satu yang doyan makan pisau. Ujian tengah game!",
    challenge: "LEVEL 50", level: 50, knives: 8, speed: 135, difficulty: 4, pattern: "reverse",
    hazards: [
      { icon: "🟣", name: "Lendir Licin", desc: "Area lengket, timing harus ekstra pas" },
      { icon: "👁️", name: "Tatapan Mata", desc: "Putaran berbalik + berdenyut cepat" },
    ],
    colors: { from: "#e9b8ff", to: "#6b21a8", edge: "#a855f7", glow: "rgba(168,85,247,.45)" },
    grad: "linear-gradient(135deg,#b45cff,#7c2bff)", gradDark: "linear-gradient(135deg,#9a3dff,#6a0dff)",
  },
  {
    id: "spider", world: "NGARAI GLOOM", name: "SPIDERO", title: "Laba-laba Jaring",
    desc: "Laba-laba gua yang menarik-narik arah putaran dengan jaringnya.",
    challenge: "LEVEL 55", level: 55, knives: 8, speed: 140, difficulty: 4, pattern: "reverse",
    hazards: [
      { icon: "🕸️", name: "Jaring Tarik", desc: "Putar balik makin SERING" },
      { icon: "🕷️", name: "Delapan Mata", desc: "Selalu mengawasimu melempar" },
    ],
    colors: { from: "#d8b4fe", to: "#3b0764", edge: "#8b5cf6", glow: "rgba(139,92,246,.55)" },
    grad: "linear-gradient(135deg,#8b5cf6,#4c1d95)", gradDark: "linear-gradient(135deg,#7c3aed,#2e1065)",
  },
  {
    id: "mummy", world: "NGARAI GLOOM", name: "MUMMY", title: "Mumi Kutukan",
    desc: "Mumi kuno yang mengutuk waktu: jeda berhentinya makin lama!",
    challenge: "LEVEL 60", level: 60, knives: 8, speed: 145, difficulty: 4, pattern: "pause",
    hazards: [
      { icon: "⏸️", name: "Kutukan Waktu", desc: "Jeda berhenti makin LAMA" },
      { icon: "🧻", name: "Perban Terbang", desc: "Perban menutupi celah bidik" },
    ],
    colors: { from: "#fef3c7", to: "#92400e", edge: "#fcd34d", glow: "rgba(252,211,77,.5)" },
    grad: "linear-gradient(135deg,#fcd34d,#b45309)", gradDark: "linear-gradient(135deg,#fbbf24,#78350f)",
  },
  {
    id: "lava", world: "NGARAI GLOOM", name: "LAVABLOB", title: "Gumpalan Lava",
    desc: "Lendir lava yang mendidih. Makin panas, makin brutal larinya.",
    challenge: "LEVEL 65", level: 65, knives: 9, speed: 150, difficulty: 4, pattern: "accel",
    hazards: [
      { icon: "🌋", name: "Mendidih", desc: "Akselerasi KUAT sejak awal" },
      { icon: "🔥", name: "Letupan", desc: "Letupan api mengecoh fokus" },
    ],
    colors: { from: "#fed7aa", to: "#7c2d12", edge: "#fb923c", glow: "rgba(251,146,60,.55)" },
    grad: "linear-gradient(135deg,#fb923c,#c2410c)", gradDark: "linear-gradient(135deg,#f97316,#7c2d12)",
  },
  {
    id: "ghost", world: "NGARAI GLOOM", name: "GHOSTLY", title: "Hantu Penakut",
    desc: "Hantu yang menghilang-muncul. Berhenti lama, lalu berbalik tiba-tiba!",
    challenge: "LEVEL 70", level: 70, knives: 9, speed: 152, difficulty: 5, pattern: "pause",
    hazards: [
      { icon: "👻", name: "Tembus Pandang", desc: "Jeda lama + balik arah dadakan" },
      { icon: "💨", name: "Ngepot Gaib", desc: "Melesat setelah berhenti" },
    ],
    colors: { from: "#f1f5f9", to: "#475569", edge: "#cbd5e1", glow: "rgba(203,213,225,.5)" },
    grad: "linear-gradient(135deg,#94a3b8,#334155)", gradDark: "linear-gradient(135deg,#64748b,#0f172a)",
  },
  {
    id: "storm", world: "NGARAI GLOOM", name: "STORMY", title: "Badai Petir",
    desc: "Awan badai yang polanya benar-benar acak. Baca petirnya!",
    challenge: "LEVEL 75", level: 75, knives: 9, speed: 158, difficulty: 5, pattern: "chaos",
    hazards: [
      { icon: "⛈️", name: "Pola Acak", desc: "Campuran semua pola ringan" },
      { icon: "⚡", name: "Sambar Petir", desc: "Kilat menyilaukan tiap balik arah" },
    ],
    colors: { from: "#bae6fd", to: "#1e3a8a", edge: "#60a5fa", glow: "rgba(96,165,250,.55)" },
    grad: "linear-gradient(135deg,#60a5fa,#1e40af)", gradDark: "linear-gradient(135deg,#3b82f6,#172554)",
  },
  {
    id: "shadow", world: "PUNCAK EMAS", name: "SHADOWBITE", title: "Gigitan Bayangan",
    desc: "Bayangan hidup dengan mata ungu menyala. Polanya makin liar.",
    challenge: "LEVEL 80", level: 80, knives: 9, speed: 162, difficulty: 5, pattern: "chaos",
    hazards: [
      { icon: "🌑", name: "Mode Gelap", desc: "Acak sedang + sering berhenti" },
      { icon: "👁️", name: "Mata Ungu", desc: "Menyala sebelum berbalik arah!" },
    ],
    colors: { from: "#4c1d95", to: "#030014", edge: "#7c3aed", glow: "rgba(124,58,237,.6)" },
    grad: "linear-gradient(135deg,#6d28d9,#1e1b4b)", gradDark: "linear-gradient(135deg,#5b21b6,#0a0a20)",
  },
  {
    id: "golem", world: "PUNCAK EMAS", name: "GOLEM", title: "Raksasa Batu",
    desc: "Raksasa batu yang berat tapi tak terhentikan. Menabrak semua ritme!",
    challenge: "LEVEL 85", level: 85, knives: 10, speed: 168, difficulty: 5, pattern: "accel",
    hazards: [
      { icon: "🪨", name: "Tak Terhentikan", desc: "Cepat + sesekali balik arah" },
      { icon: "🌿", name: "Lumut", desc: "Lumut menutupi celah aman" },
    ],
    colors: { from: "#d6d3d1", to: "#44403c", edge: "#a8a29e", glow: "rgba(168,162,158,.5)" },
    grad: "linear-gradient(135deg,#a8a29e,#44403c)", gradDark: "linear-gradient(135deg,#78716c,#1c1917)",
  },
  {
    id: "hydra", world: "PUNCAK EMAS", name: "HYDRA", title: "Naga Tiga Kepala",
    desc: "Tiga kepala yang tidak pernah akur: arah putaran flip seenaknya!",
    challenge: "LEVEL 90", level: 90, knives: 10, speed: 172, difficulty: 5, pattern: "chaos",
    hazards: [
      { icon: "🐲", name: "Kepala Rewel", desc: "Flip arah acak & cepat" },
      { icon: "🔥", name: "Napas Api", desc: "Semburan api menutupi layar" },
    ],
    colors: { from: "#86efac", to: "#14532d", edge: "#22c55e", glow: "rgba(34,197,94,.55)" },
    grad: "linear-gradient(135deg,#22c55e,#14532d)", gradDark: "linear-gradient(135deg,#16a34a,#052e16)",
  },
  {
    id: "void", world: "PUNCAK EMAS", name: "VOIDLORD", title: "Penguasa Kekosongan",
    desc: "Lubang kehampaan berdenyut. Polanya kuat, cepat, dan kejam.",
    challenge: "LEVEL 95", level: 95, knives: 10, speed: 180, difficulty: 5, pattern: "chaos",
    hazards: [
      { icon: "🕳️", name: "Hisapan Void", desc: "Acak kuat + akselerasi" },
      { icon: "💜", name: "Denyut Ungu", desc: "Denyutan menutupi timing" },
    ],
    colors: { from: "#7c3aed", to: "#000000", edge: "#a855f7", glow: "rgba(168,85,247,.65)" },
    grad: "linear-gradient(135deg,#7c3aed,#000000)", gradDark: "linear-gradient(135deg,#6d28d9,#000000)",
  },
  {
    id: "solar", world: "PUNCAK EMAS", name: "SOLARION", title: "FINAL: Murka Matahari",
    desc: "Raja terakhir Perfect Shot. 12 pisau melawan murka matahari!",
    challenge: "LEVEL 100", level: 100, knives: 12, speed: 188, difficulty: 5, pattern: "chaos",
    hazards: [
      { icon: "☀️", name: "SEMUA POLA", desc: "Reverse + pause + accel sekaligus" },
      { icon: "👑", name: "12 Pisau", desc: "Butuh 12 lemparan sempurna!" },
    ],
    colors: { from: "#fef08a", to: "#b45309", edge: "#facc15", glow: "rgba(250,204,21,.65)" },
    grad: "linear-gradient(135deg,#facc15,#b45309)", gradDark: "linear-gradient(135deg,#eab308,#713f12)",
  },
];

export function getBoss(id: BossId): BossDef {
  return BOSSES.find((b) => b.id === id) ?? BOSSES[0];
}

export const bossStageLevel = (index: number) => (index + 1) * 5;
export const bossIndexOfLevel = (level: number) => level / 5 - 1;

/* ---------- Lingkaran target boss ---------- */
export function BossTarget({ id, className = "", style }: { id: BossId; className?: string; style?: React.CSSProperties }) {
  switch (id) {
    case "cheese": return <CheeseFace className={className} style={style} />;
    case "gloom": return <GloomFace className={className} style={style} />;
    case "tide": return <TideFace className={className} style={style} />;
    case "thorn": return <ThornFace className={className} style={style} />;
    case "gilt": return <GiltFace className={className} style={style} />;
    case "sprout": return <SproutFace className={className} style={style} />;
    case "bubble": return <BubbleFace className={className} style={style} />;
    case "crab": return <CrabFace className={className} style={style} />;
    case "shroom": return <ShroomFace className={className} style={style} />;
    case "frost": return <FrostFace className={className} style={style} />;
    case "spider": return <SpiderFace className={className} style={style} />;
    case "mummy": return <MummyFace className={className} style={style} />;
    case "lava": return <LavaFace className={className} style={style} />;
    case "ghost": return <GhostFace className={className} style={style} />;
    case "storm": return <StormFace className={className} style={style} />;
    case "shadow": return <ShadowFace className={className} style={style} />;
    case "golem": return <GolemFace className={className} style={style} />;
    case "hydra": return <HydraFace className={className} style={style} />;
    case "void": return <VoidFace className={className} style={style} />;
    default: return <SolarFace className={className} style={style} />;
  }
}

/* ---------- Target kayu polos (NORMAL stage, tanpa wajah) ---------- */
export function WoodLog({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`absolute inset-0 rounded-full border-[6px] border-[#6b4210] ${className}`}
      style={{
        background: "radial-gradient(circle at 35% 30%,#e0aa5e 0%,#b57a2e 45%,#7d4f14 80%,#5a360a 100%)",
        boxShadow: "0 0 30px rgba(190,130,50,.3), inset 0 -8px 18px rgba(60,30,0,.5), inset 0 6px 12px rgba(255,230,170,.3)",
        ...style,
      }}
    >
      <div className="absolute inset-[16%] rounded-full border-4 border-[#6b4210]/60" />
      <div className="absolute inset-[30%] rounded-full border-4 border-[#6b4210]/50" />
      <div className="absolute inset-[44%] rounded-full bg-[#6b4210]/60" />
      <span className="absolute left-[20%] top-[30%] h-2.5 w-5 -rotate-[24deg] rounded-full bg-[#5a360a]/60" />
      <span className="absolute bottom-[24%] right-[20%] h-2.5 w-4 rotate-[30deg] rounded-full bg-[#5a360a]/60" />
      <span className="absolute left-[30%] top-[14%] h-3 w-3 rounded-full bg-[#5a360a]/50" />
    </div>
  );
}

function Shell({ className = "", style, edge, bg, glow, children }: {
  className?: string; style?: React.CSSProperties; edge: string; bg: string; glow: string; children?: React.ReactNode;
}) {
  return (
    <div
      className={`absolute inset-0 rounded-full border-[6px] ${className}`}
      style={{ borderColor: edge, background: bg, boxShadow: `0 0 50px ${glow}, inset 0 -10px 22px rgba(0,0,0,.35), inset 0 8px 16px rgba(255,255,255,.25)`, ...style }}
    >
      {children}
    </div>
  );
}

type FP = { className?: string; style?: React.CSSProperties };

/* ---- 5 wajah original yang sudah ada (dipertahankan) ---- */

function CheeseFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#c98a1c" glow="rgba(255,200,60,.35)"
      bg="radial-gradient(circle at 35% 30%,#fff0a0 0%,#ffd04d 35%,#f2a92e 75%,#d48a1e 100%)">
      <span className="absolute left-[16%] top-[18%] h-7 w-7 rounded-full bg-[#d8902a]/70 shadow-[inset_2px_3px_4px_rgba(120,60,0,.5)]" />
      <span className="absolute left-[70%] top-[24%] h-4 w-4 rounded-full bg-[#d8902a]/70 shadow-[inset_2px_3px_4px_rgba(120,60,0,.5)]" />
      <span className="absolute left-[20%] top-[66%] h-5 w-5 rounded-full bg-[#d8902a]/70 shadow-[inset_2px_3px_4px_rgba(120,60,0,.5)]" />
      <span className="absolute left-[72%] top-[64%] h-6 w-6 rounded-full bg-[#d8902a]/70 shadow-[inset_2px_3px_4px_rgba(120,60,0,.5)]" />
      <svg viewBox="0 0 100 100" className="absolute inset-[22%]">
        <path d="M18 30 L42 40" stroke="#5a2e00" strokeWidth="6" strokeLinecap="round" />
        <path d="M82 30 L58 40" stroke="#5a2e00" strokeWidth="6" strokeLinecap="round" />
        <circle cx="32" cy="50" r="8" fill="#5a2e00" /><circle cx="68" cy="50" r="8" fill="#5a2e00" />
        <circle cx="34" cy="48" r="2.5" fill="#fff" /><circle cx="70" cy="48" r="2.5" fill="#fff" />
        <path d="M34 78 Q50 66 66 78" stroke="#5a2e00" strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>
    </Shell>
  );
}

function GloomFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#7c3aed" glow="rgba(168,85,247,.45)"
      bg="radial-gradient(circle at 35% 28%,#f3d8ff 0%,#c084fc 32%,#8b3fd9 68%,#5b1aa8 100%)">
      <svg viewBox="0 0 100 100" className="absolute -top-[14%] left-0 h-[30%] w-full">
        <path d="M22 30 L14 4 L34 20 Z" fill="#e9d5ff" stroke="#4c1d95" strokeWidth="3" strokeLinejoin="round" />
        <path d="M78 30 L86 4 L66 20 Z" fill="#e9d5ff" stroke="#4c1d95" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <span className="absolute left-[12%] top-[30%] h-6 w-9 rounded-full bg-[#4c1d95]/45 blur-[1px]" />
      <span className="absolute right-[10%] top-[58%] h-5 w-5 rounded-full bg-[#4c1d95]/45" />
      <span className="absolute bottom-[12%] left-[30%] h-4 w-8 rounded-full bg-white/25" />
      <div className="absolute left-1/2 top-[34%] h-[38%] w-[44%] -translate-x-1/2 rounded-full border-4 border-[#2e1065] bg-white shadow-[inset_0_-4px_8px_rgba(0,0,0,.25)]">
        <div className="absolute left-1/2 top-1/2 h-[58%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#22d3ee] shadow-[0_0_12px_#22d3ee]">
          <div className="absolute left-1/2 top-1/2 h-[55%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0e222e]" />
          <div className="absolute left-[22%] top-[16%] h-[22%] w-[22%] rounded-full bg-white" />
        </div>
      </div>
      <svg viewBox="0 0 100 40" className="absolute bottom-[10%] left-1/2 w-[62%] -translate-x-1/2">
        <path d="M8 6 Q50 34 92 6 L92 14 Q50 40 8 14 Z" fill="#2e1065" />
        <path d="M24 15 L30 27 L36 15 Z M46 18 L52 30 L58 18 Z M68 15 L74 27 L80 15 Z" fill="#fff" />
      </svg>
    </Shell>
  );
}

function TideFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#0369a1" glow="rgba(56,189,248,.45)"
      bg="radial-gradient(circle at 35% 28%,#dcf3ff 0%,#7cc7ee 30%,#2b7fae 65%,#0c4a6e 100%)">
      <svg viewBox="0 0 120 44" className="absolute -top-[13%] left-1/2 w-[104%] -translate-x-1/2">
        <path d="M6 36 Q60 2 114 36 L104 40 Q60 18 16 40 Z" fill="#10233a" stroke="#020617" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="60" cy="30" r="9" fill="#f8fafc" stroke="#020617" strokeWidth="2.5" />
        <path d="M55 30 h10 M60 25 v10" stroke="#020617" strokeWidth="2.5" />
      </svg>
      <span className="absolute left-[10%] top-[46%] h-3.5 w-3.5 rounded-full bg-white/70" />
      <span className="absolute left-[14%] top-[56%] h-2.5 w-2.5 rounded-full bg-white/50" />
      <span className="absolute right-[12%] top-[30%] h-3 w-3 rounded-full bg-white/60" />
      <svg viewBox="0 0 100 100" className="absolute inset-[20%]">
        <ellipse cx="50" cy="46" rx="26" ry="24" fill="#f1f5f9" stroke="#0f2f45" strokeWidth="3.5" />
        <rect x="34" y="60" width="32" height="16" rx="5" fill="#f1f5f9" stroke="#0f2f45" strokeWidth="3.5" />
        <path d="M42 76 v-6 M50 76 v-6 M58 76 v-6" stroke="#0f2f45" strokeWidth="2.5" />
        <ellipse cx="40" cy="46" rx="8" ry="10" fill="#0f2f45" />
        <ellipse cx="60" cy="46" rx="8" ry="10" fill="#0f2f45" />
        <circle cx="42" cy="44" r="2.4" fill="#7dd3fc" /><circle cx="62" cy="44" r="2.4" fill="#7dd3fc" />
        <path d="M50 54 L46 62 L54 62 Z" fill="#0f2f45" />
        <path d="M26 34 Q50 22 74 34 L72 40 Q50 30 28 40 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="2" />
      </svg>
      <svg viewBox="0 0 60 26" className="absolute bottom-[6%] left-1/2 w-[46%] -translate-x-1/2">
        <path d="M4 4 Q30 26 56 4 L50 6 Q30 20 10 6 Z" fill="#b45309" stroke="#713f12" strokeWidth="2" />
      </svg>
    </Shell>
  );
}

function ThornFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#15803d" glow="rgba(74,222,128,.45)"
      bg="radial-gradient(circle at 35% 28%,#e2ffd2 0%,#6fce7f 30%,#2f9e57 62%,#14532d 100%)">
      <svg viewBox="0 0 100 40" className="absolute -top-[8%] left-0 h-[26%] w-full">
        <path d="M10 34 Q30 4 50 30 Q70 4 90 34 Q70 26 50 34 Q30 26 10 34Z" fill="#22c55e" stroke="#14532d" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M50 30 L50 12" stroke="#14532d" strokeWidth="2.5" />
      </svg>
      <span className="absolute left-[8%] top-[52%] h-4 w-4 rounded-full bg-[#14532d]/40" />
      <span className="absolute right-[10%] top-[60%] h-3 w-3 rounded-full bg-[#14532d]/40" />
      <svg viewBox="0 0 100 100" className="absolute inset-[18%]">
        <rect x="26" y="14" width="48" height="72" rx="14" fill="#8a5a2b" stroke="#3f2a10" strokeWidth="3.5" />
        <rect x="32" y="20" width="36" height="60" rx="10" fill="#c99a5b" opacity=".55" />
        <path d="M32 34 L48 38 M68 34 L52 38" stroke="#3f2a10" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="40" cy="48" rx="7" ry="9" fill="#fefce8" stroke="#3f2a10" strokeWidth="2.5" />
        <ellipse cx="60" cy="48" rx="7" ry="9" fill="#fefce8" stroke="#3f2a10" strokeWidth="2.5" />
        <circle cx="40" cy="50" r="3" fill="#14532d" /><circle cx="60" cy="50" r="3" fill="#14532d" />
        <path d="M50 52 L46 64 L54 64 Z" fill="#3f2a10" />
        <rect x="36" y="68" width="28" height="12" rx="6" fill="#3f2a10" />
        <path d="M40 74 h4 M46 74 h4 M52 74 h4 M58 74 h4" stroke="#fefce8" strokeWidth="2" />
        <path d="M32 22 h36" stroke="#3f2a10" strokeWidth="2" opacity=".6" />
      </svg>
    </Shell>
  );
}

function GiltFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#b45309" glow="rgba(251,191,36,.5)"
      bg="radial-gradient(circle at 35% 28%,#fff3c4 0%,#ffce54 32%,#e8930c 66%,#92400e 100%)">
      <svg viewBox="0 0 100 34" className="absolute -top-[11%] left-1/2 w-[72%] -translate-x-1/2">
        <path d="M10 30 L14 8 L28 20 L50 4 L72 20 L86 8 L90 30 Z" fill="#fde047" stroke="#92400e" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="14" cy="8" r="4" fill="#ef4444" stroke="#92400e" strokeWidth="2" />
        <circle cx="50" cy="4" r="4.5" fill="#38bdf8" stroke="#92400e" strokeWidth="2" />
        <circle cx="86" cy="8" r="4" fill="#22c55e" stroke="#92400e" strokeWidth="2" />
      </svg>
      <span className="absolute left-[12%] top-[30%] flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#92400e] bg-[#fde047] text-[12px] font-black text-[#92400e]">$</span>
      <span className="absolute right-[10%] top-[52%] flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#92400e] bg-[#fde047] text-[12px] font-black text-[#92400e]">$</span>
      <svg viewBox="0 0 100 100" className="absolute inset-[20%]">
        <ellipse cx="50" cy="52" rx="27" ry="24" fill="#451a03" stroke="#281203" strokeWidth="3.5" />
        <path d="M25 48 Q50 60 75 48 L75 54 Q50 68 25 54 Z" fill="#7c2d12" />
        <path d="M30 49 L35 58 L40 49 Z M44 51 L49 60 L54 51 Z M58 51 L63 60 L68 51 Z" fill="#fff" stroke="#281203" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M34 62 L39 55 L44 62 Z M50 63 L55 56 L60 63 Z" fill="#fff" stroke="#281203" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="38" cy="28" r="7" fill="#fff" stroke="#281203" strokeWidth="2.5" />
        <circle cx="62" cy="28" r="7" fill="#fff" stroke="#281203" strokeWidth="2.5" />
        <circle cx="38" cy="29" r="3" fill="#dc2626" /><circle cx="62" cy="29" r="3" fill="#dc2626" />
        <path d="M29 20 L45 24 M71 20 L55 24" stroke="#281203" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M44 66 Q50 76 56 66 Q50 70 44 66" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1.5" />
      </svg>
    </Shell>
  );
}

/* ---- 15 wajah baru (kompak tapi beda karakter) ---- */

function SproutFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#15803d" glow="rgba(74,222,128,.45)"
      bg="radial-gradient(circle at 35% 30%,#e9ffd2 0%,#86dd6a 40%,#3d9e46 75%,#1d5c25 100%)">
      <svg viewBox="0 0 100 40" className="absolute -top-[10%] left-1/2 w-[64%] -translate-x-1/2">
        <path d="M50 38 L50 14" stroke="#1d5c25" strokeWidth="4" strokeLinecap="round" />
        <path d="M50 22 Q30 22 24 6 Q44 8 50 22 Z" fill="#4ade80" stroke="#1d5c25" strokeWidth="2.5" />
        <path d="M50 18 Q70 18 76 2 Q56 4 50 18 Z" fill="#86efac" stroke="#1d5c25" strokeWidth="2.5" />
      </svg>
      <span className="absolute left-[16%] top-[55%] h-4 w-4 rounded-full bg-[#1d5c25]/35" />
      <span className="absolute right-[16%] top-[30%] h-3 w-3 rounded-full bg-white/40" />
      <svg viewBox="0 0 100 100" className="absolute inset-[24%]">
        <ellipse cx="36" cy="46" rx="7" ry="10" fill="#12330f" />
        <ellipse cx="64" cy="46" rx="7" ry="10" fill="#12330f" />
        <circle cx="38" cy="43" r="2.4" fill="#fff" /><circle cx="66" cy="43" r="2.4" fill="#fff" />
        <circle cx="24" cy="58" r="5" fill="#f9a8d4" opacity=".7" /><circle cx="76" cy="58" r="5" fill="#f9a8d4" opacity=".7" />
        <path d="M40 68 Q50 76 60 68" stroke="#12330f" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      </svg>
    </Shell>
  );
}

function BubbleFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#0369a1" glow="rgba(125,211,252,.5)"
      bg="radial-gradient(circle at 35% 28%,#f0fbff 0%,#a8dcf5 35%,#4a9ecb 70%,#075985 100%)">
      <circle cx="30" cy="30" r="7" fill="#fff" opacity=".55" />
      <circle cx="70" cy="22" r="4.5" fill="#fff" opacity=".5" />
      <circle cx="78" cy="66" r="3.5" fill="#fff" opacity=".45" />
      <svg viewBox="0 0 100 100" className="absolute inset-[24%]">
        <path d="M20 44 Q50 30 80 44" stroke="#075985" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity=".6" />
        <ellipse cx="37" cy="52" rx="7" ry="9" fill="#083344" />
        <ellipse cx="63" cy="52" rx="7" ry="9" fill="#083344" />
        <circle cx="39" cy="49" r="2.4" fill="#fff" /><circle cx="65" cy="49" r="2.4" fill="#fff" />
        <path d="M38 70 Q50 80 62 70 Q50 74 38 70Z" fill="#083344" />
      </svg>
    </Shell>
  );
}

function CrabFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#9f1239" glow="rgba(251,113,133,.5)"
      bg="radial-gradient(circle at 35% 28%,#ffd9c2 0%,#f0784f 40%,#c2410c 72%,#7c2d12 100%)">
      <svg viewBox="0 0 120 40" className="absolute top-[6%] left-0 w-full">
        <path d="M8 30 Q4 12 20 14 L24 26 Q12 26 8 30Z" fill="#fca5a5" stroke="#7f1d1d" strokeWidth="2.5" />
        <path d="M112 30 Q116 12 100 14 L96 26 Q108 26 112 30Z" fill="#fca5a5" stroke="#7f1d1d" strokeWidth="2.5" />
      </svg>
      <svg viewBox="0 0 100 100" className="absolute inset-[22%]">
        <path d="M22 32 L44 38 M78 32 L56 38" stroke="#7f1d1d" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="38" cy="50" rx="8" ry="10" fill="#fff" stroke="#7f1d1d" strokeWidth="2.5" />
        <ellipse cx="62" cy="50" rx="8" ry="10" fill="#fff" stroke="#7f1d1d" strokeWidth="2.5" />
        <circle cx="38" cy="52" r="3.5" fill="#7f1d1d" /><circle cx="62" cy="52" r="3.5" fill="#7f1d1d" />
        <path d="M36 72 L44 80 L52 72 L60 80 L66 72" stroke="#7f1d1d" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Shell>
  );
}

function ShroomFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#9f1239" glow="rgba(244,114,182,.5)"
      bg="radial-gradient(circle at 35% 30%,#fff1f2 0%,#fda4af 40%,#e11d48 75%,#881337 100%)">
      <svg viewBox="0 0 100 46" className="absolute -top-[9%] left-1/2 w-[86%] -translate-x-1/2">
        <path d="M8 40 Q50 -6 92 40 Z" fill="#dc2626" stroke="#7f1d1d" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="34" cy="24" r="5" fill="#fff" /><circle cx="58" cy="16" r="6" fill="#fff" /><circle cx="74" cy="28" r="4" fill="#fff" />
      </svg>
      <svg viewBox="0 0 100 100" className="absolute inset-[26%]">
        <path d="M30 44 Q38 40 46 44 M54 44 Q62 40 70 44" stroke="#4c0519" strokeWidth="4" strokeLinecap="round" />
        <path d="M40 62 Q50 68 60 62" stroke="#4c0519" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="30" cy="56" r="4" fill="#fda4af" opacity=".8" /><circle cx="70" cy="56" r="4" fill="#fda4af" opacity=".8" />
      </svg>
    </Shell>
  );
}

function FrostFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#0e7490" glow="rgba(165,243,252,.55)"
      bg="radial-gradient(circle at 35% 28%,#ffffff 0%,#bae6fd 35%,#38bdf8 70%,#075985 100%)">
      <svg viewBox="0 0 100 40" className="absolute -top-[10%] left-1/2 w-[60%] -translate-x-1/2">
        <path d="M50 38 L50 6 M38 14 L62 30 M62 14 L38 30" stroke="#e0f2fe" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <svg viewBox="0 0 100 100" className="absolute inset-[22%]">
        <rect x="20" y="38" width="28" height="16" rx="8" fill="#082f49" />
        <rect x="52" y="38" width="28" height="16" rx="8" fill="#082f49" />
        <path d="M28 46 h20 M48 46 h4 M60 46 h8" stroke="#7dd3fc" strokeWidth="2.5" />
        <path d="M40 68 L46 76 L54 76 L60 68" stroke="#082f49" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Shell>
  );
}

function SpiderFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#5b21b6" glow="rgba(139,92,246,.55)"
      bg="radial-gradient(circle at 35% 28%,#c4b5fd 0%,#7c3aed 40%,#4c1d95 75%,#2e1065 100%)">
      <svg viewBox="0 0 120 100" className="absolute inset-[6%]">
        <g stroke="#2e1065" strokeWidth="3.5" strokeLinecap="round">
          <path d="M14 30 L34 42 M14 55 L34 52 M106 30 L86 42 M106 55 L86 52" />
        </g>
        <ellipse cx="38" cy="40" rx="6" ry="7" fill="#dc2626" />
        <ellipse cx="60" cy="36" rx="7" ry="8" fill="#dc2626" />
        <ellipse cx="82" cy="40" rx="6" ry="7" fill="#dc2626" />
        <circle cx="38" cy="39" r="2" fill="#fff" /><circle cx="60" cy="35" r="2.2" fill="#fff" /><circle cx="82" cy="39" r="2" fill="#fff" />
        <path d="M42 68 Q60 78 78 68" stroke="#1e1b4b" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M50 70 L54 78 L58 70 M62 70 L66 78 L70 70" stroke="#fff" strokeWidth="2" />
      </svg>
    </Shell>
  );
}

function MummyFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#92400e" glow="rgba(252,211,77,.5)"
      bg="radial-gradient(circle at 35% 30%,#fef3c7 0%,#e7c06a 45%,#a16207 80%,#713f12 100%)">
      <path d="M0 26 L100 18 M0 48 L100 44 M0 70 L100 70" stroke="#fef3c7" strokeWidth="7" opacity=".85" />
      <path d="M0 34 L100 28 M0 58 L100 56" stroke="#b45309" strokeWidth="3" opacity=".7" />
      <div className="absolute left-1/2 top-[34%] h-[34%] w-[38%] -translate-x-1/2 rounded-full border-4 border-[#573a08] bg-white">
        <div className="absolute left-1/2 top-1/2 h-[60%] w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#65a30d]">
          <div className="absolute left-1/2 top-1/2 h-[55%] w-[45%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
        </div>
      </div>
      <svg viewBox="0 0 100 30" className="absolute bottom-[14%] left-1/2 w-[52%] -translate-x-1/2">
        <path d="M8 8 L92 8" stroke="#573a08" strokeWidth="6" strokeLinecap="round" />
        <path d="M30 8 v10 M50 8 v10 M70 8 v10" stroke="#fef3c7" strokeWidth="3" />
      </svg>
    </Shell>
  );
}

function LavaFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#9a3412" glow="rgba(251,146,60,.55)"
      bg="radial-gradient(circle at 35% 28%,#ffedd5 0%,#fb923c 38%,#c2410c 72%,#431407 100%)">
      <svg viewBox="0 0 100 44" className="absolute -top-[11%] left-1/2 w-[70%] -translate-x-1/2">
        <path d="M20 40 Q28 18 40 26 Q44 10 56 20 Q64 6 72 24 Q84 22 82 40 Z" fill="#fbbf24" stroke="#9a3412" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <path d="M22 62 L34 40 M74 66 L64 44" stroke="#431407" strokeWidth="3.5" strokeLinecap="round" />
      <svg viewBox="0 0 100 100" className="absolute inset-[24%]">
        <path d="M24 34 L46 40 M76 34 L54 40" stroke="#431407" strokeWidth="5.5" strokeLinecap="round" />
        <ellipse cx="38" cy="54" rx="8" ry="10" fill="#431407" />
        <ellipse cx="62" cy="54" rx="8" ry="10" fill="#431407" />
        <circle cx="38" cy="52" r="2.6" fill="#fde047" /><circle cx="62" cy="52" r="2.6" fill="#fde047" />
        <path d="M36 74 L44 82 L52 74 L60 82 L66 74" stroke="#431407" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Shell>
  );
}

function GhostFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#64748b" glow="rgba(203,213,225,.5)"
      bg="radial-gradient(circle at 35% 28%,#ffffff 0%,#dbe6f2 40%,#9db4cc 75%,#5b7186 100%)">
      <svg viewBox="0 0 100 100" className="absolute inset-[24%]">
        <ellipse cx="36" cy="44" rx="9" ry="13" fill="#1e293b" />
        <ellipse cx="64" cy="44" rx="9" ry="13" fill="#1e293b" />
        <ellipse cx="50" cy="70" rx="9" ry="12" fill="#1e293b" />
        <circle cx="28" cy="60" r="4.5" fill="#bae6fd" opacity=".8" /><circle cx="72" cy="60" r="4.5" fill="#bae6fd" opacity=".8" />
      </svg>
    </Shell>
  );
}

function StormFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#1d4ed8" glow="rgba(96,165,250,.55)"
      bg="radial-gradient(circle at 35% 28%,#dbeafe 0%,#60a5fa 40%,#1d4ed8 75%,#172554 100%)">
      <svg viewBox="0 0 100 44" className="absolute top-[10%] left-1/2 w-[76%] -translate-x-1/2">
        <path d="M10 32 Q30 10 50 24 Q70 8 90 30 Q70 26 50 32 Q30 28 10 32Z" fill="#e0e7ff" stroke="#172554" strokeWidth="2.5" />
      </svg>
      <svg viewBox="0 0 100 100" className="absolute inset-[24%]">
        <path d="M54 30 L40 56 L50 56 L44 78 L62 50 L52 50 L60 30Z" fill="#fde047" stroke="#854d0e" strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="32" cy="62" r="5" fill="#172554" /><circle cx="70" cy="64" r="5" fill="#172554" />
      </svg>
    </Shell>
  );
}

function ShadowFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#4c1d95" glow="rgba(124,58,237,.6)"
      bg="radial-gradient(circle at 35% 30%,#3b2a63 0%,#150a30 50%,#030014 100%)">
      <svg viewBox="0 0 100 100" className="absolute inset-[24%]">
        <path d="M26 30 L44 38 M74 30 L56 38" stroke="#a855f7" strokeWidth="4.5" strokeLinecap="round" />
        <ellipse cx="38" cy="50" rx="8" ry="11" fill="#a855f7" />
        <ellipse cx="62" cy="50" rx="8" ry="11" fill="#a855f7" />
        <ellipse cx="38" cy="50" rx="3.5" ry="6" fill="#0a0018" /><ellipse cx="62" cy="50" rx="3.5" ry="6" fill="#0a0018" />
        <path d="M38 70 L44 80 L50 70 L56 80 L62 70" stroke="#e9d5ff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Shell>
  );
}

function GolemFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#57534e" glow="rgba(168,162,158,.5)"
      bg="radial-gradient(circle at 35% 28%,#e7e5e4 0%,#a8a29e 42%,#57534e 78%,#292524 100%)">
      <svg viewBox="0 0 100 44" className="absolute -top-[8%] left-1/2 w-[60%] -translate-x-1/2">
        <path d="M24 40 L36 12 L48 34 L60 8 L74 40 Z" fill="#a8a29e" stroke="#292524" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <path d="M28 60 L44 44 M72 64 L60 46" stroke="#292524" strokeWidth="3" strokeLinecap="round" opacity=".7" />
      <svg viewBox="0 0 100 100" className="absolute inset-[24%]">
        <rect x="18" y="32" width="26" height="12" rx="4" fill="#292524" />
        <rect x="56" y="32" width="26" height="12" rx="4" fill="#292524" />
        <ellipse cx="38" cy="54" rx="6" ry="7" fill="#22d3ee" />
        <ellipse cx="62" cy="54" rx="6" ry="7" fill="#22d3ee" />
        <rect x="36" y="70" width="28" height="8" rx="4" fill="#292524" />
      </svg>
    </Shell>
  );
}

function HydraFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#15803d" glow="rgba(34,197,94,.55)"
      bg="radial-gradient(circle at 35% 30%,#bbf7d0 0%,#4ade80 42%,#15803d 78%,#052e16 100%)">
      <svg viewBox="0 0 100 44" className="absolute -top-[11%] left-1/2 w-[84%] -translate-x-1/2">
        <g stroke="#052e16" strokeWidth="2.5">
          <circle cx="24" cy="26" r="12" fill="#4ade80" /><circle cx="50" cy="18" r="13" fill="#22c55e" /><circle cx="76" cy="26" r="12" fill="#4ade80" />
        </g>
        <circle cx="21" cy="24" r="2.4" fill="#052e16" /><circle cx="27" cy="24" r="2.4" fill="#052e16" />
        <circle cx="47" cy="16" r="2.6" fill="#052e16" /><circle cx="53" cy="16" r="2.6" fill="#052e16" />
        <circle cx="73" cy="24" r="2.4" fill="#052e16" /><circle cx="79" cy="24" r="2.4" fill="#052e16" />
      </svg>
      <svg viewBox="0 0 100 100" className="absolute inset-[26%]">
        <path d="M28 36 L46 42 M72 36 L54 42" stroke="#052e16" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="39" cy="56" rx="8" ry="10" fill="#052e16" />
        <ellipse cx="61" cy="56" rx="8" ry="10" fill="#052e16" />
        <circle cx="39" cy="54" r="2.6" fill="#fde047" /><circle cx="61" cy="54" r="2.6" fill="#fde047" />
        <path d="M38 74 L50 82 L62 74" stroke="#052e16" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Shell>
  );
}

function VoidFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#6d28d9" glow="rgba(168,85,247,.65)"
      bg="radial-gradient(circle at 50% 50%,#000000 0%,#1e0a3c 55%,#3b0a6e 100%)">
      <div className="absolute left-1/2 top-1/2 h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#a855f7] shadow-[0_0_18px_#a855f7]">
        <div className="absolute left-1/2 top-1/2 h-[55%] w-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e9d5ff] shadow-[0_0_14px_#e9d5ff]" />
      </div>
      <span className="absolute left-[18%] top-[24%] h-2 w-2 rounded-full bg-[#c4b5fd]" />
      <span className="absolute right-[20%] top-[60%] h-2.5 w-2.5 rounded-full bg-[#c4b5fd]" />
      <span className="absolute bottom-[18%] left-[40%] h-1.5 w-1.5 rounded-full bg-white" />
    </Shell>
  );
}

function SolarFace({ className = "", style }: FP) {
  return (
    <Shell className={className} style={style} edge="#a16207" glow="rgba(250,204,21,.65)"
      bg="radial-gradient(circle at 35% 30%,#fef9c3 0%,#fde047 35%,#f59e0b 70%,#92400e 100%)">
      <svg viewBox="0 0 100 44" className="absolute -top-[12%] left-1/2 w-[88%] -translate-x-1/2">
        <g stroke="#92400e" strokeWidth="3" strokeLinecap="round">
          <path d="M14 38 L8 22 M30 34 L28 14 M50 32 L50 10 M70 34 L72 14 M86 38 L92 22" />
        </g>
        <circle cx="50" cy="34" r="7" fill="#fde047" stroke="#92400e" strokeWidth="2.5" />
      </svg>
      <svg viewBox="0 0 100 100" className="absolute inset-[23%]">
        <path d="M22 32 L46 40 M78 32 L54 40" stroke="#7c2d12" strokeWidth="5.5" strokeLinecap="round" />
        <ellipse cx="38" cy="54" rx="8" ry="11" fill="#7c2d12" />
        <ellipse cx="62" cy="54" rx="8" ry="11" fill="#7c2d12" />
        <circle cx="38" cy="52" r="2.8" fill="#fff" /><circle cx="62" cy="52" r="2.8" fill="#fff" />
        <path d="M36 74 Q50 66 64 74" stroke="#7c2d12" strokeWidth="5" fill="none" strokeLinecap="round" />
      </svg>
    </Shell>
  );
}
