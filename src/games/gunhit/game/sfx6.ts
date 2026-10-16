import { noise, tone } from './audio';

const r = (a: number, b: number) => a + Math.random() * (b - a);

export const sfx6 = {
  // REVOLVER KELANA - koboi "BANG!"
  revolver() {
    noise(0.35, 6000, 1, 'lowpass', 200);
    tone(150, 35, 0.22, 'sine', 1);
    tone(280, 60, 0.14, 'square', 0.3);
    // gema canyon
    noise(1.1, 800, 0.25, 'lowpass', 80, 0.16);
    tone(70, 24, 0.5, 'sine', 0.35, 0.16);
    // drum peluru berputar
    for (let i = 0; i < 3; i++) noise(0.03, 2200, 0.3, 'bandpass', undefined, 0.06 + i * 0.05);
  },
  revolverHit() {
    tone(200, 60, 0.1, 'square', 0.25);
    noise(0.12, 1200, 0.4, 'bandpass');
  },

  // PHOTON SABER - hum + shwing
  saberHum() {
    tone(520, 560, 0.6, 'sine', 0.06);
    tone(624, 672, 0.6, 'sine', 0.03);
  },
  saberShoot() {
    tone(620, 1600, 0.08, 'sawtooth', 0.14);
    tone(1560, 200, 0.2, 'square', 0.08);
    noise(0.12, 6000, 0.25, 'highpass', 3000);
    tone(90, 30, 0.16, 'sine', 0.4);
  },
  saberHit() {
    tone(1800, 900, 0.16, 'sawtooth', 0.16);
    noise(0.2, 6000, 0.5, 'highpass', 2000);
    tone(200, 90, 0.1, 'sine', 0.4);
  },

  // PLASMA REPEATER
  blaster() {
    tone(1100, 220, 0.1, 'square', 0.12);
    noise(0.07, 3500, 0.35, 'bandpass', 800);
    tone(120, 45, 0.08, 'sine', 0.3);
  },
  blasterHit() {
    tone(900, 200, 0.1, 'sawtooth', 0.14);
    noise(0.1, 5000, 0.3, 'highpass');
  },

  // WARP DISRUPTOR - superlaser raksasa
  superlaser() {
    tone(160, 260, 0.5, 'sawtooth', 0.14);
    tone(80, 130, 1.1, 'sine', 0.9);
    tone(520, 780, 0.5, 'square', 0.05);
    noise(0.9, 600, 0.6, 'lowpass', 1800, 0.1);
  },
  superlaserHit() {
    tone(70, 24, 1.4, 'sine', 1);
    noise(1.3, 2200, 1, 'lowpass', 60);
    tone(140, 40, 0.9, 'sawtooth', 0.18);
    for (let i = 0; i < 8; i++) noise(0.05, r(2000, 6000), 0.25, 'highpass', undefined, 0.2 + i * 0.05);
  },

  // DEFLECTOR SHIELD
  shield() {
    tone(700, 1300, 0.12, 'sine', 0.16);
    tone(1300, 1900, 0.14, 'sine', 0.08, 0.04);
    noise(0.1, 4000, 0.2, 'bandpass');
  },
  shieldHit() {
    tone(900, 300, 0.14, 'sine', 0.2);
    tone(1800, 900, 0.16, 'sine', 0.1);
  },

  // GAUNTLET CANNON
  gauntlet() {
    tone(500, 120, 0.16, 'square', 0.16);
    noise(0.14, 3000, 0.4, 'lowpass', 500);
    tone(80, 26, 0.3, 'sine', 0.85);
  },
  gauntletHit() {
    tone(220, 70, 0.18, 'square', 0.28);
    noise(0.24, 2600, 0.5, 'bandpass', 400);
    tone(90, 30, 0.35, 'sine', 0.85);
  },

  // ALIEN RAY
  alien() {
    tone(1400, 420, 0.14, 'sine', 0.2);
    tone(2100, 640, 0.1, 'triangle', 0.1, 0.04);
    noise(0.16, 5000, 0.3, 'highpass', 2200);
    tone(200, 90, 0.1, 'sine', 0.3);
  },
  alienHit() {
    tone(1000, 300, 0.12, 'sawtooth', 0.16);
    noise(0.14, 4000, 0.4, 'highpass');
  },

  // PULSE RIFLE
  pulse() {
    tone(1600, 500, 0.06, 'square', 0.14);
    noise(0.06, 5000, 0.3, 'bandpass', 1500);
    tone(220, 90, 0.05, 'sine', 0.3);
  },
  pulseHit() {
    tone(1200, 300, 0.08, 'square', 0.18);
    noise(0.08, 6000, 0.3, 'highpass');
  },

  // CRYO BLASTER
  cryo() {
    [3200, 2600, 3800, 2200].forEach((f, i) => tone(f, f * 0.9, 0.14, 'sine', 0.09, i * 0.03));
    noise(0.3, 7000, 0.3, 'highpass', 9000);
    tone(500, 200, 0.18, 'triangle', 0.12);
  },
  cryoHit() {
    noise(0.2, 9000, 0.5, 'highpass');
    tone(4200, 3200, 0.24, 'sine', 0.14);
    tone(5600, 4800, 0.16, 'sine', 0.08, 0.04);
  },

  // HYPERDRIVE
  hyper() {
    tone(240, 1400, 0.2, 'sawtooth', 0.16);
    noise(0.2, 5000, 0.4, 'bandpass', 1200);
    tone(1400, 400, 0.2, 'square', 0.06);
    tone(100, 30, 0.24, 'sine', 0.6);
  },
  hyperHit() {
    tone(1600, 300, 0.12, 'sawtooth', 0.16);
    noise(0.18, 5000, 0.4, 'highpass', 1500);
  },

  // QUANTUM DESTABILIZER
  quantum() {
    tone(300, 1800, 0.16, 'sine', 0.18);
    tone(380, 2100, 0.16, 'triangle', 0.08, 0.04);
    noise(0.2, 2600, 0.25, 'bandpass', 6000);
    tone(90, 30, 0.2, 'sine', 0.45);
  },
  quantumHit() {
    tone(1800, 200, 0.2, 'sine', 0.18);
    noise(0.16, 3000, 0.3, 'bandpass', 7000);
    tone(2600, 1200, 0.12, 'sine', 0.1);
  },
};
