let actx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.55;
}

function ac(): AudioContext {
  if (!actx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    actx = new AC();
    master = actx.createGain();
    master.gain.value = muted ? 0 : 0.55;
    master.connect(actx.destination);
    noiseBuf = actx.createBuffer(1, actx.sampleRate, actx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}

export function noise(dur: number, freq: number, vol: number, type: BiquadFilterType = 'lowpass', freqEnd?: number, delay = 0) {
  try {
    const a = ac();
    const t = a.currentTime + delay;
    const src = a.createBufferSource();
    src.buffer = noiseBuf;
    const f = a.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f);
    f.connect(g);
    g.connect(master!);
    src.start(t);
    src.stop(t + dur + 0.02);
  } catch {
    /* ignore */
  }
}

export function tone(f0: number, f1: number, dur: number, type: OscillatorType, vol: number, delay = 0) {
  try {
    const a = ac();
    const t = a.currentTime + delay;
    const o = a.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    const g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(master!);
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  unlock() {
    ac();
  },
  shoot() {
    noise(0.2, 5000, 0.9, 'lowpass', 250);
    tone(190, 45, 0.14, 'square', 0.28);
    tone(95, 30, 0.22, 'sine', 0.7);
    // shell casing tinkle
    tone(4200, 3900, 0.05, 'sine', 0.05, 0.28);
    tone(3500, 3300, 0.04, 'sine', 0.035, 0.36);
  },
  shootAk() {
    noise(0.13, 7500, 1, 'lowpass', 400);
    noise(0.05, 3000, 0.7, 'highpass');
    tone(160, 40, 0.1, 'square', 0.32);
    tone(75, 28, 0.18, 'sine', 0.85);
    tone(4600, 4300, 0.04, 'sine', 0.04, 0.22);
  },
  shootPlasma() {
    tone(950, 110, 0.3, 'sawtooth', 0.16);
    tone(1900, 220, 0.24, 'square', 0.05);
    tone(130, 40, 0.32, 'sine', 0.75);
    noise(0.28, 1400, 0.3, 'bandpass', 300);
  },
  shootLaser() {
    tone(2600, 260, 0.17, 'square', 0.11);
    tone(1900, 180, 0.22, 'sine', 0.28);
    tone(3800, 900, 0.08, 'sawtooth', 0.04);
    noise(0.06, 8000, 0.2, 'highpass');
  },
  zap() {
    tone(500, 1500, 0.07, 'square', 0.08);
    noise(0.2, 4500, 0.4, 'highpass', 1500);
    tone(90, 40, 0.12, 'sine', 0.45);
  },
  shootCricket() {
    tone(400, 2400, 0.08, 'sine', 0.12);
    noise(0.7, 6000, 1, 'lowpass', 90, 0.05);
    tone(140, 22, 0.7, 'sine', 1, 0.05);
    tone(70, 20, 0.8, 'square', 0.3, 0.05);
    tone(1800, 300, 0.3, 'sawtooth', 0.06, 0.05);
  },
  shootElectro() {
    tone(1400, 180, 0.16, 'sawtooth', 0.16);
    noise(0.25, 7000, 0.5, 'highpass', 2000);
    for (let i = 0; i < 4; i++) tone(600 + Math.random() * 1500, 200, 0.03, 'square', 0.07, i * 0.035);
  },
  shootNail() {
    noise(0.05, 2600, 0.9, 'bandpass');
    tone(240, 90, 0.06, 'square', 0.25);
    noise(0.12, 7000, 0.22, 'highpass', 3000, 0.03);
  },
  shootFish() {
    tone(260, 950, 0.12, 'sine', 0.45);
    tone(200, 700, 0.1, 'sine', 0.3, 0.08);
    noise(0.22, 2500, 0.35, 'bandpass', 600);
  },
  shootCrossbow() {
    tone(190, 150, 0.28, 'triangle', 0.4);
    tone(380, 300, 0.2, 'sawtooth', 0.07);
    noise(0.07, 5000, 0.45, 'highpass');
    noise(0.25, 1500, 0.2, 'bandpass', 4000, 0.02);
  },
  shootBazooka() {
    tone(80, 30, 0.35, 'sine', 0.9);
    noise(0.6, 700, 0.9, 'bandpass', 3500);
    tone(110, 40, 0.5, 'sawtooth', 0.22);
    noise(0.25, 4000, 0.6, 'lowpass', 300);
  },
  shootRpg() {
    tone(120, 35, 0.25, 'sine', 0.85);
    noise(0.4, 1800, 1, 'bandpass', 6000);
    tone(160, 55, 0.3, 'square', 0.18);
  },
  shootFreeze() {
    [2100, 2700, 3300, 4100].forEach((f, i) => tone(f, f * 0.95, 0.18, 'sine', 0.08, i * 0.03));
    noise(0.3, 6000, 0.35, 'highpass', 9000);
    tone(500, 200, 0.2, 'triangle', 0.15);
  },
  shootGolden() {
    noise(0.18, 6000, 0.8, 'lowpass', 300);
    tone(180, 45, 0.14, 'square', 0.25);
    tone(95, 30, 0.2, 'sine', 0.6);
    tone(2350, 2350, 0.7, 'sine', 0.1, 0.03);
    tone(3520, 3520, 0.5, 'sine', 0.06, 0.06);
  },
  shootBlackHole() {
    tone(220, 35, 0.55, 'sawtooth', 0.22);
    tone(65, 28, 0.7, 'sine', 0.85);
    noise(0.5, 400, 0.4, 'lowpass', 80);
  },
  explosion() {
    noise(1, 2600, 1, 'lowpass', 70);
    tone(95, 22, 0.9, 'sine', 1);
    tone(55, 20, 1, 'square', 0.22);
    noise(0.4, 7000, 0.3, 'highpass', 2000, 0.05);
  },
  ice() {
    noise(0.18, 8000, 0.5, 'highpass');
    tone(3200, 2600, 0.25, 'sine', 0.12);
    tone(4400, 3900, 0.18, 'sine', 0.07, 0.04);
  },
  splash() {
    noise(0.3, 1600, 0.6, 'bandpass', 350);
    tone(420, 140, 0.12, 'sine', 0.35);
  },
  suck() {
    tone(70, 500, 0.45, 'sine', 0.45);
    tone(140, 1000, 0.45, 'triangle', 0.1);
    noise(0.45, 300, 0.4, 'lowpass', 3000);
  },
  hit() {
    tone(330, 90, 0.09, 'triangle', 0.55);
    noise(0.08, 1800, 0.55, 'bandpass');
    tone(70, 40, 0.1, 'sine', 0.5);
  },
  clang() {
    tone(1250, 1180, 0.7, 'square', 0.1);
    tone(1870, 1800, 0.6, 'sine', 0.22);
    tone(620, 590, 0.6, 'triangle', 0.25);
    noise(0.18, 5000, 0.6, 'highpass');
  },
  shatter() {
    noise(0.8, 3500, 1, 'lowpass', 150);
    tone(150, 32, 0.55, 'sine', 0.9);
    tone(85, 30, 0.6, 'square', 0.18);
    noise(0.3, 6000, 0.3, 'highpass', 2000, 0.05);
  },
  coin() {
    tone(988, 988, 0.08, 'square', 0.13);
    tone(1319, 1319, 0.22, 'square', 0.13, 0.07);
  },
  combo(n: number) {
    const b = 520 + Math.min(n, 10) * 70;
    tone(b, b * 1.5, 0.12, 'square', 0.09);
  },
  boss() {
    tone(110, 105, 0.6, 'sawtooth', 0.18);
    tone(117, 110, 0.6, 'sawtooth', 0.18);
    tone(82, 78, 0.9, 'sawtooth', 0.22, 0.55);
    tone(87, 80, 0.9, 'sawtooth', 0.22, 0.55);
  },
  start() {
    tone(440, 880, 0.14, 'square', 0.12);
    tone(660, 1320, 0.2, 'square', 0.1, 0.1);
  },
  level() {
    tone(523, 523, 0.1, 'square', 0.1);
    tone(659, 659, 0.1, 'square', 0.1, 0.09);
    tone(784, 784, 0.18, 'square', 0.1, 0.18);
  },
};
