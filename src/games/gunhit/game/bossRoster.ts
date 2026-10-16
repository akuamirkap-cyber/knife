export type BossType = 'knight' | 'oni' | 'cyborg' | 'pirate';

const TAU = Math.PI * 2;

export interface BossProfile {
  id: BossType;
  name: string;
  title: string;
  desc: string;
  accent: string;
  glow: string;
  projectileName: string;
  projectileEmoji: string;
  fireInterval: number; // seconds
}

export const BOSS_ROSTER: BossProfile[] = [
  {
    id: 'knight',
    name: 'DARK KNIGHT',
    title: 'Ksatria Kegelapan',
    desc: 'Helm baja ksatria jahat dengan visor runcing & mata merah. Menembakkan pedang bayangan!',
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.4)',
    projectileName: 'Shadow Dagger',
    projectileEmoji: '🗡️',
    fireInterval: 2.2,
  },
  {
    id: 'oni',
    name: 'ONI DEMON',
    title: 'Iblis Bertanduk',
    desc: 'Iblis merah kartun dengan tanduk kuning & taring tajam. Menembakkan bola api iblis!',
    accent: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.4)',
    projectileName: 'Demon Fireball',
    projectileEmoji: '🔥',
    fireInterval: 2.0,
  },
  {
    id: 'cyborg',
    name: 'MECHA CYBORG',
    title: 'Titan Siber',
    desc: 'Robot villain bersudut tajam dengan optik laser merah. Meluncurkan roket mikro!',
    accent: '#22d3ee',
    glow: 'rgba(34, 211, 238, 0.4)',
    projectileName: 'Cyber Rocket',
    projectileEmoji: '🚀',
    fireInterval: 1.9,
  },
  {
    id: 'pirate',
    name: 'PIRATE LORD',
    title: 'Nahkoda Bajak Laut',
    desc: 'Tengkorak nahkoda bertopi bajak laut & penutup mata. Menembakkan peluru meriam kutukan!',
    accent: '#eab308',
    glow: 'rgba(234, 179, 8, 0.4)',
    projectileName: 'Cursed Cannonball',
    projectileEmoji: '💣',
    fireInterval: 2.3,
  },
];

export const getBossDef = (id: string): BossProfile =>
  BOSS_ROSTER.find((b) => b.id === id) || BOSS_ROSTER[0];

/**
 * Returns non-circular radial distance at angle `ang` (local target coordinates).
 * Creates non-round collision surface conforming to the head silhouette!
 */
export function getBossProfileRadius(type: BossType, ang: number, baseR: number): number {
  // Normalize angle to -PI..PI, with 0 pointing straight down (where player shoots from Math.PI/2)
  const a = ((ang % TAU) + TAU) % TAU; // 0..TAU
  switch (type) {
    case 'knight': {
      // Angular helmet: pointed crest at top (around 3PI/2 or -PI/2), chin at PI/2, wide cheek guards
      // Modulate with cosine harmonics
      const topSpike = Math.max(0, -Math.sin(a)) * 22; // pointed crest at top
      const cheeks = Math.pow(Math.cos(a), 2) * 12; // wide sides
      const chin = Math.max(0, Math.sin(a)) * 14; // pointed chin
      return baseR + topSpike + cheeks + chin - 6;
    }
    case 'oni': {
      // Two distinct horns pointing out at ~11 o'clock and 1 o'clock (angles 4.0 and 5.4 rad)
      const horn1 = Math.max(0, Math.cos(a - 4.1)) ** 8 * 32;
      const horn2 = Math.max(0, Math.cos(a - 5.3)) ** 8 * 32;
      const chin = Math.max(0, Math.sin(a)) * 10;
      return baseR + horn1 + horn2 + chin - 6;
    }
    case 'cyborg': {
      // Hexagonal / angular robotic jaw and cyber horns
      const hex = Math.cos(6 * a) * 8;
      const ear1 = Math.max(0, Math.cos(a - 0.2)) ** 12 * 18;
      const ear2 = Math.max(0, Math.cos(a - (Math.PI - 0.2))) ** 12 * 18;
      return baseR + hex + ear1 + ear2;
    }
    case 'pirate': {
      // Wide tricorn pirate hat across the top
      const hat = Math.max(0, -Math.sin(a)) * 26 + Math.abs(Math.cos(a)) * 14;
      const chin = Math.max(0, Math.sin(a)) * 8;
      return baseR + hat + chin - 8;
    }
  }
}

/**
 * Draws crisp, vector flat-cartoon villain head with NO black rectangle background!
 * Outlined with bold cartoon 2D stroke and solid cartoon fills.
 */
export function drawVectorBossHead(c: CanvasRenderingContext2D, type: BossType, R: number) {
  c.save();
  switch (type) {
    case 'knight':
      drawKnightVector(c, R);
      break;
    case 'oni':
      drawOniVector(c, R);
      break;
    case 'cyborg':
      drawCyborgVector(c, R);
      break;
    case 'pirate':
      drawPirateVector(c, R);
      break;
  }
  c.restore();
}

// ---------------------------------------------------------------- KNIGHT
function drawKnightVector(c: CanvasRenderingContext2D, R: number) {
  // Helmet outer silhouette
  c.beginPath();
  c.moveTo(0, -R * 1.15); // Top pointed crest
  c.lineTo(R * 0.35, -R * 0.85);
  c.lineTo(R * 0.85, -R * 0.35); // Upper cheek
  c.lineTo(R * 0.75, R * 0.35); // Lower cheek
  c.lineTo(0, R * 1.12); // Pointed chin
  c.lineTo(-R * 0.75, R * 0.35);
  c.lineTo(-R * 0.85, -R * 0.35);
  c.lineTo(-R * 0.35, -R * 0.85);
  c.closePath();

  // Flat 2D cartoon shading (Cyan / Sky blue)
  c.fillStyle = '#0284c7';
  c.fill();
  c.lineWidth = 5;
  c.strokeStyle = '#082f49';
  c.stroke();

  // Helmet facet highlights (Left bright, Right darker)
  c.beginPath();
  c.moveTo(0, -R * 1.15);
  c.lineTo(-R * 0.35, -R * 0.85);
  c.lineTo(-R * 0.85, -R * 0.35);
  c.lineTo(-R * 0.75, R * 0.35);
  c.lineTo(0, R * 1.12);
  c.closePath();
  c.fillStyle = '#38bdf8';
  c.fill();

  // Crest plume/spike detail
  c.beginPath();
  c.moveTo(0, -R * 1.25);
  c.lineTo(R * 0.18, -R * 0.85);
  c.lineTo(-R * 0.18, -R * 0.85);
  c.closePath();
  c.fillStyle = '#7dd3fc';
  c.fill();
  c.strokeStyle = '#082f49';
  c.lineWidth = 3;
  c.stroke();

  // Visor (Black pointed cartoon villain opening)
  c.beginPath();
  c.moveTo(-R * 0.65, -R * 0.12);
  c.lineTo(0, -R * 0.32);
  c.lineTo(R * 0.65, -R * 0.12);
  c.lineTo(R * 0.6, R * 0.24);
  c.lineTo(0, R * 0.42);
  c.lineTo(-R * 0.6, R * 0.24);
  c.closePath();
  c.fillStyle = '#0f172a';
  c.fill();
  c.strokeStyle = '#0369a1';
  c.lineWidth = 3.5;
  c.stroke();

  // Glowing evil red cartoon slit eyes
  c.fillStyle = '#ff1133';
  c.shadowColor = '#ff0033';
  c.shadowBlur = 12;
  // Left eye
  c.beginPath();
  c.moveTo(-R * 0.48, 0);
  c.lineTo(-R * 0.12, R * 0.08);
  c.lineTo(-R * 0.28, R * 0.14);
  c.closePath();
  c.fill();
  // Right eye
  c.beginPath();
  c.moveTo(R * 0.48, 0);
  c.lineTo(R * 0.12, R * 0.08);
  c.lineTo(R * 0.28, R * 0.14);
  c.closePath();
  c.fill();
  c.shadowBlur = 0;

  // Helmet chin vent slats
  c.fillStyle = '#082f49';
  for (let i = -2; i <= 2; i++) {
    c.beginPath();
    c.roundRect(i * 12 - 2, R * 0.55, 4, 16, 2);
    c.fill();
  }
}

// ---------------------------------------------------------------- ONI
function drawOniVector(c: CanvasRenderingContext2D, R: number) {
  // Two golden horns first
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * R * 0.25, -R * 0.45);
    c.quadraticCurveTo(s * R * 0.75, -R * 1.25, s * R * 0.28, -R * 1.15);
    c.quadraticCurveTo(s * R * 0.4, -R * 0.7, s * R * 0.1, -R * 0.48);
    c.closePath();
    c.fillStyle = '#facc15';
    c.fill();
    c.strokeStyle = '#713f12';
    c.lineWidth = 4;
    c.stroke();
    // Horn rings
    c.strokeStyle = '#b45309';
    c.lineWidth = 2.5;
    for (let k = 1; k <= 3; k++) {
      const hy = -R * 0.55 - k * 16;
      c.beginPath();
      c.ellipse(s * (R * 0.28 + k * 3), hy, 7, 3, s * 0.4, 0, TAU);
      c.stroke();
    }
  }

  // Red Demon Face Outline
  c.beginPath();
  c.moveTo(0, -R * 0.65);
  c.lineTo(R * 0.6, -R * 0.5);
  c.lineTo(R * 0.85, -R * 0.1);
  c.lineTo(R * 0.7, R * 0.55);
  c.lineTo(0, R * 1.05);
  c.lineTo(-R * 0.7, R * 0.55);
  c.lineTo(-R * 0.85, -R * 0.1);
  c.lineTo(-R * 0.6, -R * 0.5);
  c.closePath();
  c.fillStyle = '#ef4444';
  c.fill();
  c.lineWidth = 5;
  c.strokeStyle = '#450a0a';
  c.stroke();

  // Face left shadow / right highlight for 2D flat pop
  c.beginPath();
  c.moveTo(0, -R * 0.65);
  c.lineTo(-R * 0.6, -R * 0.5);
  c.lineTo(-R * 0.85, -R * 0.1);
  c.lineTo(-R * 0.7, R * 0.55);
  c.lineTo(0, R * 1.05);
  c.closePath();
  c.fillStyle = '#dc2626';
  c.fill();

  // Angry bushy brows
  c.fillStyle = '#1c1917';
  c.beginPath();
  c.moveTo(-R * 0.6, -R * 0.18);
  c.lineTo(-R * 0.08, -R * 0.04);
  c.lineTo(-R * 0.18, -R * 0.22);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(R * 0.6, -R * 0.18);
  c.lineTo(R * 0.08, -R * 0.04);
  c.lineTo(R * 0.18, -R * 0.22);
  c.closePath();
  c.fill();

  // Yellow evil glowing eyes
  for (const s of [-1, 1]) {
    c.fillStyle = '#fef08a';
    c.beginPath();
    c.ellipse(s * R * 0.35, -R * 0.02, 14, 8, s * 0.2, 0, TAU);
    c.fill();
    c.strokeStyle = '#713f12';
    c.lineWidth = 1.5;
    c.stroke();
    // Pupil
    c.fillStyle = '#000';
    c.beginPath();
    c.arc(s * R * 0.35, -R * 0.02, 4.5, 0, TAU);
    c.fill();
  }

  // Grinning mouth
  c.beginPath();
  c.moveTo(-R * 0.48, R * 0.32);
  c.quadraticCurveTo(0, R * 0.68, R * 0.48, R * 0.32);
  c.quadraticCurveTo(0, R * 0.42, -R * 0.48, R * 0.32);
  c.closePath();
  c.fillStyle = '#180202';
  c.fill();
  c.strokeStyle = '#450a0a';
  c.lineWidth = 2.5;
  c.stroke();

  // Upward sharp fangs
  for (const s of [-1, 1]) {
    c.beginPath();
    c.moveTo(s * 26 - 5, R * 0.48);
    c.lineTo(s * 26, R * 0.2);
    c.lineTo(s * 26 + 5, R * 0.48);
    c.closePath();
    c.fillStyle = '#ffffff';
    c.fill();
    c.strokeStyle = '#450a0a';
    c.lineWidth = 1.2;
    c.stroke();
  }
}

// ---------------------------------------------------------------- CYBORG
function drawCyborgVector(c: CanvasRenderingContext2D, R: number) {
  // Angular robot head contour
  c.beginPath();
  c.moveTo(-R * 0.4, -R * 0.9);
  c.lineTo(R * 0.4, -R * 0.9);
  c.lineTo(R * 0.92, -R * 0.25);
  c.lineTo(R * 0.72, R * 0.65);
  c.lineTo(R * 0.4, R * 0.95);
  c.lineTo(-R * 0.4, R * 0.95);
  c.lineTo(-R * 0.72, R * 0.65);
  c.lineTo(-R * 0.92, -R * 0.25);
  c.closePath();
  c.fillStyle = '#475569';
  c.fill();
  c.lineWidth = 5;
  c.strokeStyle = '#0f172a';
  c.stroke();

  // Face split panel
  c.beginPath();
  c.moveTo(0, -R * 0.9);
  c.lineTo(-R * 0.4, -R * 0.9);
  c.lineTo(-R * 0.92, -R * 0.25);
  c.lineTo(-R * 0.72, R * 0.65);
  c.lineTo(-R * 0.4, R * 0.95);
  c.lineTo(0, R * 0.95);
  c.closePath();
  c.fillStyle = '#64748b';
  c.fill();

  // Big Red Cybernetic Eye (Left)
  c.shadowColor = '#ff0033';
  c.shadowBlur = 14;
  c.beginPath();
  c.arc(-R * 0.35, -R * 0.1, 20, 0, TAU);
  c.fillStyle = '#0f172a';
  c.fill();
  c.strokeStyle = '#dc2626';
  c.lineWidth = 3.5;
  c.stroke();
  c.beginPath();
  c.arc(-R * 0.35, -R * 0.1, 11, 0, TAU);
  c.fillStyle = '#ef4444';
  c.fill();
  c.beginPath();
  c.arc(-R * 0.35, -R * 0.1, 4.5, 0, TAU);
  c.fillStyle = '#ffffff';
  c.fill();
  c.shadowBlur = 0;

  // Right Scanner Box
  c.fillStyle = '#0f172a';
  c.beginPath();
  c.roundRect(R * 0.16, -R * 0.22, 30, 22, 3);
  c.fill();
  c.strokeStyle = '#22d3ee';
  c.lineWidth = 2;
  c.stroke();
  for (let i = 0; i < 3; i++) {
    c.fillStyle = '#38bdf8';
    c.fillRect(R * 0.2 + i * 8, -R * 0.17, 5, 12);
  }

  // Steel teeth grille
  c.fillStyle = '#0f172a';
  c.beginPath();
  c.roundRect(-R * 0.45, R * 0.35, R * 0.9, 24, 4);
  c.fill();
  c.strokeStyle = '#94a3b8';
  c.lineWidth = 2.5;
  for (let i = -3; i <= 3; i++) {
    c.beginPath();
    c.moveTo(i * 11, R * 0.35);
    c.lineTo(i * 11, R * 0.35 + 24);
    c.stroke();
  }

  // Forehead bolts
  for (const s of [-1, 1]) {
    c.fillStyle = '#94a3b8';
    c.beginPath();
    c.arc(s * R * 0.3, -R * 0.65, 4.5, 0, TAU);
    c.fill();
    c.strokeStyle = '#0f172a';
    c.lineWidth = 1.5;
    c.stroke();
  }
}

// ---------------------------------------------------------------- PIRATE
function drawPirateVector(c: CanvasRenderingContext2D, R: number) {
  // Big Tricorn Pirate Hat
  c.beginPath();
  c.moveTo(-R * 1.05, -R * 0.15);
  c.quadraticCurveTo(0, -R * 1.25, R * 1.05, -R * 0.15);
  c.lineTo(R * 0.72, -R * 0.05);
  c.quadraticCurveTo(0, -R * 0.45, -R * 0.72, -R * 0.05);
  c.closePath();
  c.fillStyle = '#0f172a';
  c.fill();
  c.strokeStyle = '#facc15';
  c.lineWidth = 4;
  c.stroke();

  // Jolly Roger skull on hat
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.arc(0, -R * 0.55, 9, 0, TAU);
  c.fill();
  c.fillStyle = '#000';
  c.beginPath();
  c.arc(-3.5, -R * 0.55, 2.2, 0, TAU);
  c.arc(3.5, -R * 0.55, 2.2, 0, TAU);
  c.fill();

  // Skull face outline
  c.beginPath();
  c.arc(0, R * 0.15, R * 0.52, 0, TAU);
  c.fillStyle = '#f8fafc';
  c.fill();
  c.lineWidth = 4.5;
  c.strokeStyle = '#0f172a';
  c.stroke();

  // Eyepatch (Left)
  c.fillStyle = '#020617';
  c.beginPath();
  c.ellipse(-R * 0.22, R * 0.08, 14, 16, 0.2, 0, TAU);
  c.fill();
  c.strokeStyle = '#020617';
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(-R * 0.55, -R * 0.08);
  c.lineTo(R * 0.35, R * 0.28);
  c.stroke();

  // Ghostly green fire eye (Right)
  c.shadowColor = '#22c55e';
  c.shadowBlur = 14;
  c.fillStyle = '#22c55e';
  c.beginPath();
  c.ellipse(R * 0.22, R * 0.08, 11, 14, -0.2, 0, TAU);
  c.fill();
  c.fillStyle = '#fef08a';
  c.beginPath();
  c.arc(R * 0.22, R * 0.08, 4.5, 0, TAU);
  c.fill();
  c.shadowBlur = 0;

  // Nose socket
  c.fillStyle = '#0f172a';
  c.beginPath();
  c.moveTo(0, R * 0.18);
  c.lineTo(-4.5, R * 0.3);
  c.lineTo(4.5, R * 0.3);
  c.closePath();
  c.fill();

  // Grinning teeth with GOLD TOOTH!
  c.fillStyle = '#0f172a';
  c.beginPath();
  c.roundRect(-24, R * 0.42, 48, 16, 3);
  c.fill();
  for (let i = -2; i <= 2; i++) {
    c.fillStyle = i === 1 ? '#eab308' : '#ffffff';
    c.fillRect(i * 9 - 3.5, R * 0.44, 7, 12);
  }
}
