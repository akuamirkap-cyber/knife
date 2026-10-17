import { useEffect, useRef, useState } from 'react';
import { Game } from './game/Game';
import { setMuted, sfx } from './game/audio';
import { sfx4 } from './game/sfx4';
import { getWeapon, type WeaponId } from './game/weapons';
import { useSlideActive } from '../shared/SlideActivity';
import { SunburstFX } from '../knife-hit/components/Effects';
import { gunSunburstColor } from './game/sunburstPalette';
import { drawGunCentered } from './game/art/drawCentered';
import { getGunMetrics } from './game/art/metrics';
import { type Quest, type QuestState } from './game/quests';
import Arsenal from './components/Arsenal';
import QuestModal from './components/QuestModal';
import LeaderboardModal from './components/LeaderboardModal';
import { BossDefeatedModal } from './components/BossDefeatedModal';
import { BossGiftBoxModal } from './components/BossGiftBoxModal';
import StarBuffModal from './components/StarBuffModal';

type Screen = 'menu' | 'playing' | 'over';

const LS = {
  best: 'gunhit_best',
  bestLevel: 'gunhit_best_level',
  coins: 'gunhit_coins',
  weapon: 'gunhit_weapon',
  owned: 'gunhit_owned_weapons',
  quests: 'gunhit_quests_state',
};

const num = (k: string) => Number(localStorage.getItem(k) || 0);
const coinsInBank = () => {
  const saved = localStorage.getItem(LS.coins);
  return saved === null ? 120 : Number(saved) || 0;
};

const getInitialQuests = (): QuestState => {
  try {
    const raw = localStorage.getItem(LS.quests);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    claimed: [],
    maxCombo: 0,
    totalCoinsCollected: num(LS.coins),
    highestScore: num(LS.best),
    highestLevel: num(LS.bestLevel) || 1,
  };
};

export default function App({ onExit }: { onExit?: () => void }) {
  const active = useSlideActive();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  const [screen, setScreen] = useState<Screen>('menu');
  const [transitioning, setTransitioning] = useState(false);
  const [transText, setTransText] = useState('READY?');
  const [transitionStep, setTransitionStep] = useState<0 | 1 | 2>(0);

  const [result, setResult] = useState({ score: 0, level: 1, coins: 0, newBest: false });
  const [displayScore, setDisplayScore] = useState(0);

  const [best, setBest] = useState(() => num(LS.best));
  const [bestLevel, setBestLevel] = useState(() => Math.max(1, num(LS.bestLevel)));
  const [totalCoins, setTotalCoins] = useState(coinsInBank);

  const [questState, setQuestState] = useState<QuestState>(getInitialQuests);
  const questStateRef = useRef(questState);
  questStateRef.current = questState;

  const [muted, setMutedState] = useState(false);
  const [arsenalOpen, setArsenalOpen] = useState(false);
  const [questOpen, setQuestOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  // Boss Defeated celebration modal state (Screenshot 2)
  const [bossDefeatedData, setBossDefeatedData] = useState<{
    name: string;
    level: number;
    coins: number;
  } | null>(null);
  const [bonusStageOpen, setBonusStageOpen] = useState(false);
  const [bonusAfterBoss, setBonusAfterBoss] = useState<{ stage: number; bossName: string }>({ stage: 5, bossName: 'BOSS' });
  const [starBuffOpen, setStarBuffOpen] = useState(false);
  const [starBuffTreasure, setStarBuffTreasure] = useState(false);

  const [weapon, setWeaponState] = useState<WeaponId>(() => getWeapon(localStorage.getItem(LS.weapon) || 'pistol').id);

  // Sync quests to LS
  const saveQuests = (qs: QuestState) => {
    questStateRef.current = qs;
    setQuestState(qs);
    localStorage.setItem(LS.quests, JSON.stringify(qs));
  };

  const depositCoins = (amount: number) => {
    const total = coinsInBank() + amount;
    localStorage.setItem(LS.coins, String(total));
    setTotalCoins(total);
    return total;
  };

  const chooseWeapon = (id: WeaponId) => {
    setWeaponState(id);
    localStorage.setItem(LS.weapon, id);
    gameRef.current?.setWeapon(id);
    sfx.unlock();
  };

  const handleClaimQuest = (q: Quest) => {
    const current = questStateRef.current;
    if (current.claimed.includes(q.id)) return;
    depositCoins(q.rewardCoins);
    if (q.rewardWeapon) chooseWeapon(q.rewardWeapon as WeaponId);
    saveQuests({
      ...current,
      claimed: [...current.claimed, q.id],
      totalCoinsCollected: current.totalCoinsCollected + q.rewardCoins,
    });
  };

  // Create one engine per mounted slide. Quest/coin updates must not destroy a live run.
  useEffect(() => {
    const g = new Game(canvasRef.current!, {
      onGameOver: (score, level, coins, runCoins) => {
        const prevBest = num(LS.best);
        const newBest = score > prevBest;
        if (newBest) localStorage.setItem(LS.best, String(score));
        if (level > num(LS.bestLevel)) localStorage.setItem(LS.bestLevel, String(level));
        depositCoins(coins); // special-stage and boss rewards were banked already
        setBest(num(LS.best));
        setBestLevel(Math.max(1, num(LS.bestLevel)));
        const current = questStateRef.current;
        saveQuests({
          ...current,
          highestScore: Math.max(current.highestScore, score),
          highestLevel: Math.max(current.highestLevel, level),
          totalCoinsCollected: current.totalCoinsCollected + coins,
        });
        setResult({ score, level, coins: runCoins, newBest });
        setDisplayScore(0);
        setScreen('over');
      },
      onStarHit: (treasure) => {
        setStarBuffTreasure(treasure);
        setStarBuffOpen(true);
      },
      onBossDefeated: (bossName, level, coinsEarned) => {
        setBossDefeatedData({ name: bossName, level, coins: coinsEarned });
        depositCoins(coinsEarned);
        const current = questStateRef.current;
        saveQuests({ ...current, highestLevel: Math.max(current.highestLevel, level), totalCoinsCollected: current.totalCoinsCollected + coinsEarned });
      },
      onTreasureCoin: (amount) => {
        depositCoins(amount); // Saved as each bouncing coin reaches the HUD.
        const current = questStateRef.current;
        saveQuests({ ...current, totalCoinsCollected: current.totalCoinsCollected + amount });
      },
      onStageReward: (_mode, level, unbankedCoins) => {
        if (unbankedCoins) depositCoins(unbankedCoins);
        if (level > num(LS.bestLevel)) {
          localStorage.setItem(LS.bestLevel, String(level));
          setBestLevel(level);
        }
        const current = questStateRef.current;
        saveQuests({
          ...current,
          highestScore: Math.max(current.highestScore, g.score),
          highestLevel: Math.max(current.highestLevel, level),
          totalCoinsCollected: current.totalCoinsCollected + unbankedCoins,
        });
      },
    });
    g.setWeapon(getWeapon(localStorage.getItem(LS.weapon) || 'pistol').id);
    gameRef.current = g;
    return () => {
      g.destroy();
      gameRef.current = null;
    };
  }, []);

  // The menu, results and modal screens use their own lightweight effects;
  // the heavy level canvas has nothing to simulate behind those overlays.
  useEffect(() => { gameRef.current?.setActive(active && screen === 'playing'); }, [active, screen]);

  // Floating upright weapon preview on main menu (matching Screenshot 1)
  useEffect(() => {
    if (screen !== 'menu' || arsenalOpen || questOpen || leaderboardOpen) return;
    const cv = previewCanvasRef.current;
    if (!cv) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pw = 240;
    const ph = 210;
    cv.width = pw * dpr;
    cv.height = ph * dpr;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const start = performance.now();
    let lastDraw = -Infinity;
    const curW = getWeapon(weapon);

    const loop = (now: number) => {
      if (now - lastDraw < 1000 / 30 - 1) {
        raf = requestAnimationFrame(loop);
        return;
      }
      lastDraw = now;
      const t = (now - start) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, pw, ph);

      // Gentle floating animation
      const floatY = Math.sin(t * 2.5) * 8;
      ctx.save();
      // Exact canvas center
      ctx.translate(pw / 2, ph / 2 + floatY);

      // Weapon shadow
      ctx.beginPath();
      ctx.ellipse(0, 85, 52, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fill();

      // 2X LEBIH BESAR & 100% ZERO CROP:
      // Using true measured gun span from metrics.ts
      const m = getGunMetrics(curW.id);
      const span = Math.max(m.span, 130);
      const sc = (ph * 0.78) / span;
      ctx.scale(sc, sc);

      // drawGunCentered puts the geometric mass center EXACTLY at (0, 0)!
      drawGunCentered(ctx, curW.id, t, 0, true, undefined, true);
      ctx.restore();

      if (active) raf = requestAnimationFrame(loop);
    };

    loop(start); // a still preview even before this slide has focus
    return () => cancelAnimationFrame(raf);
  }, [screen, weapon, active, arsenalOpen, questOpen, leaderboardOpen]);

  // Roll up score only while the slide is active; pause at the current number.
  useEffect(() => {
    if (screen !== 'over' || !active || displayScore >= result.score) return;
    const from = displayScore;
    const target = result.score;
    const start = performance.now();
    const timer = setInterval(() => {
      const p = Math.min(1, (performance.now() - start) / 800);
      setDisplayScore(Math.round(from + (target - from) * Math.pow(p, 0.7)));
      if (p >= 1) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
    // Restart this timer only when focus or a new result changes, not per tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, result.score, active]);

  // Pause the Ready / Go transition with the game, instead of starting a
  // level unseen if another slide was selected during its countdown.
  useEffect(() => {
    if (!active || transitionStep === 0) return;
    const timer = setTimeout(() => {
      if (transitionStep === 1) {
        setTransText('GO!! 🎯');
        sfx4.match();
        setTransitionStep(2);
      } else {
        setTransitioning(false);
        gameRef.current?.start();
        setScreen('playing');
        setTransitionStep(0);
      }
    }, transitionStep === 1 ? 380 : 320);
    return () => clearTimeout(timer);
  }, [transitionStep, active]);

  const play = () => {
    setTransitioning(true);
    setTransText('READY?');
    setTransitionStep(1);
    sfx.start();
  };

  const handleContinueAfterBoss = () => {
    setBonusAfterBoss({ stage: bossDefeatedData?.level ?? 5, bossName: bossDefeatedData?.name ?? 'BOSS' });
    setBossDefeatedData(null);
    // Bonus stage: kotak hadiah ala Knife Boss 100 Lv (senjata baru + koin).
    setBonusStageOpen(true);
  };

  const handleGiftBoxClaim = (bonusCoins: number, weaponId: WeaponId, equip: boolean) => {
    depositCoins(bonusCoins);
    const current = questStateRef.current;
    saveQuests({ ...current, totalCoinsCollected: current.totalCoinsCollected + bonusCoins });
    // Catat senjata hasil kotak hadiah ke koleksi.
    try {
      const owned: string[] = JSON.parse(localStorage.getItem(LS.owned) || '[]');
      if (!owned.includes(weaponId)) localStorage.setItem(LS.owned, JSON.stringify([...owned, weaponId]));
    } catch { /* simpan koleksi bersifat opsional */ }
    if (equip) chooseWeapon(weaponId);
    setBonusStageOpen(false);
    gameRef.current?.continueAfterBoss();
  };

  const startSpecial = (stage: 'boulder' | 'bonus' | 'treasure') => {
    gameRef.current?.startSpecialStage(stage);
    setScreen('playing');
  };

  const toggleMute = () => {
    const m = !muted;
    setMuted(m);
    setMutedState(m);
    if (!m) sfx.coin();
  };

  return (
    <div className="font-game flex h-full w-full select-none items-center justify-center bg-[#071318] relative">
      {onExit && (
        <button
          onClick={onExit}
          className="fixed top-3 left-3 z-50 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-xl cursor-pointer transition hover:scale-105 active:scale-95"
          title="Kembali ke Menu Game"
        >
          <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Pilih Game Lain</span>
        </button>
      )}
      <div className="relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] w-[420px] h-[760px] flex-shrink-0">
        {/* Canvas Engine */}
        <canvas ref={canvasRef} className="block touch-none w-[420px] h-[760px]" />

        {/* A low-cost, soft rarity aura around the gun, never over the target.
            This is the same FX Lab / Knife Boss ray treatment as the arsenal. */}
        {screen === 'playing' && (
          <div className="pointer-events-none absolute left-0 top-[510px] h-[180px] w-full opacity-40" aria-hidden="true">
            <SunburstFX size={420} color={gunSunburstColor(getWeapon(weapon).rarity)} intensity={0.55} speed={36} core={false} stars={false} />
          </div>
        )}

        {/* Transition Overlay (Hypercasual READY GO) */}
        {transitioning && (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="pop-in flex flex-col items-center">
              <div className="text-6xl font-black italic tracking-wider text-yellow-300 drop-shadow-[0_6px_0_rgba(0,0,0,0.8)] font-game">
                {transText}
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            MAIN MENU: EXACT MATCHING SCREENSHOT 1 KNIFE HIT LAYOUT!
           ------------------------------------------------------------- */}
        {screen === 'menu' && (
          <div className="absolute inset-0 z-20 flex flex-col justify-between py-4 px-4 text-white">
            {/* Top Bar: Settings gear (Left) & Apple/Coin Counter (Right) */}
            <div className="flex items-center justify-between">
              <button
                onClick={toggleMute}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-lg text-amber-300 shadow-md backdrop-blur-md transition hover:bg-white/20 active:scale-90 border border-white/10"
                aria-label="Settings / Audio"
              >
                ⚙️
              </button>

              <div className="flex items-center gap-1.5 text-lg font-bold font-game text-amber-300 drop-shadow">
                <span className="font-mono text-xl font-black tracking-tight">{totalCoins}</span>
                <span className="text-xl filter drop-shadow">🍎</span>
              </div>
            </div>

            {/* Title Section */}
            <div className="flex flex-col items-center text-center -mt-1">
              <div className="relative flex flex-col items-center">
                {/* GUN word */}
                <div className="text-6xl sm:text-7xl font-black tracking-widest text-[#4ade80] drop-shadow-[0_6px_0_#15803d] font-game transform -rotate-1 leading-none">
                  GUN
                </div>

                {/* Curved blade slice line with sword/gun */}
                <div className="relative -my-1.5 h-6 w-64 flex items-center justify-center">
                  <div className="h-2 w-full rounded-full bg-white shadow-[0_0_12px_#ffffff]" />
                  <span className="absolute right-2 text-xl transform rotate-12 drop-shadow">🗡️</span>
                </div>

                {/* HIT word */}
                <div className="text-6xl sm:text-7xl font-black tracking-widest text-[#fde047] drop-shadow-[0_6px_0_#a16207] font-game transform rotate-1 leading-none">
                  HIT
                </div>
              </div>

              {/* Subtitle: STAGE {bestLevel} ◆ SCORE {best} */}
              <div className="mt-2 flex items-center gap-2.5 text-xs sm:text-sm font-black tracking-[0.2em] text-white font-game drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                <span>STAGE {bestLevel}</span>
                <span className="text-amber-300 text-base">◆</span>
                <span>SCORE {best}</span>
              </div>
            </div>

            {/* Upright gun with a layered, rarity-aware Sunburst FX Lab halo. */}
            <div className="flex flex-col items-center justify-center my-auto">
              <div className="relative h-[210px] w-[240px]">
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                  <SunburstFX size={500} color={gunSunburstColor(getWeapon(weapon).rarity)} intensity={0.72} speed={32} stars={false} />
                </div>
                <canvas
                  ref={previewCanvasRef}
                  style={{ width: 240, height: 210 }}
                  className="relative z-10 block filter drop-shadow-[0_16px_30px_rgba(0,0,0,0.85)] cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setArsenalOpen(true)}
                />
              </div>
              <div className="relative z-10 text-xs sm:text-sm font-black text-amber-300 font-game tracking-widest bg-black/60 px-5 py-1.5 rounded-full border-2 border-white/20 -mt-2 shadow-2xl">
                {getWeapon(weapon).name}
              </div>
            </div>

            {/* Playable Diamond Breaker rounds; also reached naturally at levels 3, 4 and 6. */}
            <div className="w-full mb-3 rounded-2xl border border-cyan-300/25 bg-[#061520]/75 p-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md">
              <div className="mb-1.5 text-center text-[10px] font-black tracking-[0.2em] text-cyan-100/80">
                ✦ STAGE SPESIAL · COBA LANGSUNG ✦
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button onClick={() => startSpecial('boulder')} className="rounded-xl border border-cyan-300/40 bg-cyan-400/10 py-2 text-center transition hover:bg-cyan-400/25 active:scale-95">
                  <span className="block text-lg leading-none">💎</span>
                  <span className="block mt-1 text-[10px] font-black text-cyan-100">BATU</span>
                  <span className="block text-[9px] text-cyan-100/60">Level 3</span>
                </button>
                <button onClick={() => startSpecial('bonus')} className="rounded-xl border border-amber-300/40 bg-amber-400/10 py-2 text-center transition hover:bg-amber-400/25 active:scale-95">
                  <span className="block text-lg leading-none">🪙</span>
                  <span className="block mt-1 text-[10px] font-black text-amber-100">BONUS</span>
                  <span className="block text-[9px] text-amber-100/60">Level 4</span>
                </button>
                <button onClick={() => startSpecial('treasure')} className="rounded-xl border border-pink-300/40 bg-pink-400/10 py-2 text-center transition hover:bg-pink-400/25 active:scale-95">
                  <span className="block text-lg leading-none">🧰</span>
                  <span className="block mt-1 text-[10px] font-black text-pink-100">HARTA KARUN</span>
                  <span className="block text-[9px] text-pink-100/60">Level 6</span>
                </button>
              </div>
            </div>

            {/* Two Main Action Buttons */}
            <div className="flex w-full items-center justify-center gap-3 mb-2">
              {/* CHALLENGES Button */}
              <button
                onClick={() => {
                  chooseWeapon(weapon);
                  gameRef.current?.startBossChallenge?.();
                  setScreen('playing');
                }}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border-b-4 border-red-800 bg-gradient-to-b from-[#ff5e3a] to-[#d83110] py-3 px-2 text-sm sm:text-base font-black font-game text-white shadow-[0_8px_20px_rgba(216,49,16,0.45)] transition active:translate-y-1 active:border-b-0 hover:brightness-110"
              >
                <span className="text-xl">👹</span>
                <span>CHALLENGES</span>
              </button>

              {/* PLAY Button */}
              <button
                onClick={play}
                className="pulse-btn flex-1 flex items-center justify-center gap-2 rounded-xl border-b-4 border-emerald-800 bg-gradient-to-b from-[#22c55e] via-[#16a34a] to-[#15803d] py-3 px-2 text-xl font-black font-game text-white shadow-[0_8px_20px_rgba(34,197,94,0.45)] transition active:translate-y-1 active:border-b-0 hover:brightness-110"
              >
                <span>PLAY</span>
                <span className="text-xl font-black">▶</span>
              </button>
            </div>

            {/* Bottom Icon Bar */}
            <div className="flex items-center justify-around border-t-2 border-white/15 pt-2 pb-1 text-white/95">
              {/* GUN button */}
              <button
                onClick={() => setArsenalOpen(true)}
                className="flex flex-col items-center gap-1 transition hover:text-white active:scale-95 group"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl border-2 border-white/25 shadow-xl group-hover:border-amber-400 group-hover:bg-white/20 transition-all">
                  🔫
                </div>
                <span className="text-xs font-black tracking-widest font-game drop-shadow">GUN</span>
              </button>

              {/* LEADERBOARD button */}
              <button
                onClick={() => setLeaderboardOpen(true)}
                className="flex flex-col items-center gap-1 transition hover:text-white active:scale-95 group"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl border-2 border-white/25 shadow-xl group-hover:border-amber-400 group-hover:bg-white/20 transition-all">
                  🏆
                </div>
                <span className="text-xs font-black tracking-widest font-game drop-shadow">RANKS</span>
              </button>

              {/* REWARD / MISI button */}
              <button
                onClick={() => setQuestOpen(true)}
                className="flex flex-col items-center gap-1 transition hover:text-white active:scale-95 group"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl border-2 border-white/25 shadow-xl group-hover:border-yellow-300 group-hover:bg-white/20 transition-all">
                  🎁
                </div>
                <span className="text-xs font-black tracking-widest font-game text-yellow-300 drop-shadow">READY!</span>
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        {screen === 'menu' && arsenalOpen && (
          <Arsenal
            current={weapon}
            highestLevel={bestLevel}
            totalCoins={totalCoins}
            onPick={chooseWeapon}
            onClose={() => setArsenalOpen(false)}
          />
        )}

        {screen === 'menu' && questOpen && (
          <QuestModal
            state={questState}
            onClaim={handleClaimQuest}
            onClose={() => setQuestOpen(false)}
          />
        )}

        {screen === 'menu' && leaderboardOpen && (
          <LeaderboardModal
            bestScore={best}
            bestLevel={bestLevel}
            totalCoins={totalCoins}
            onClose={() => setLeaderboardOpen(false)}
          />
        )}

        {/* BOSS DEFEATED Modal Celebration (Exact Screenshot 2!) */}
        {bossDefeatedData && (
          <BossDefeatedModal
            bossName={bossDefeatedData.name}
            stage={bossDefeatedData.level}
            rewardCoins={bossDefeatedData.coins}
            onContinue={handleContinueAfterBoss}
          />
        )}

        {/* PILIHAN POWER UP DARI BINTANG */}
        {starBuffOpen && (
          <StarBuffModal
            treasure={starBuffTreasure}
            onPick={(kind) => {
              gameRef.current?.applyBuff(kind);
              setStarBuffOpen(false);
            }}
          />
        )}

        {/* BONUS STAGE: KOTAK HADIAH ala Knife Boss 100 Lv — efek kotak + senjata baru Gun Hit */}
        {bonusStageOpen && (
          <BossGiftBoxModal
            bossName={bonusAfterBoss.bossName}
            stage={bonusAfterBoss.stage}
            currentWeaponId={weapon}
            onClaim={handleGiftBoxClaim}
          />
        )}

        {/* Game Over Screen (DIBESARKAN TEKSNYA 2X + ANIMASI MEWAH!) */}
        {screen === 'over' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 px-6 text-white backdrop-blur-lg">
            <div className="pop-in flex w-full max-w-sm flex-col items-center">
              {/* Header 2X LEBIH BESAR */}
              <div className="text-6xl sm:text-7xl font-black italic tracking-wider text-red-500 drop-shadow-[0_6px_0_#991b1b] font-game leading-none">
                GAME OVER
              </div>
              <div className="mt-2 text-base sm:text-lg font-bold text-white/80 font-game">
                Bertahan hingga <span className="font-black text-amber-300">STAGE {result.level}</span>
              </div>

              {/* Glassmorphism Card DIBESARKAN & TEKS 2X */}
              <div className="mt-6 w-full rounded-3xl border-2 border-white/20 bg-white/10 p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                <div className="text-sm font-black tracking-[0.25em] text-white/60 font-game">SKOR AKHIR</div>

                {/* Score Counter Roll-up (Besar & Bergetar) */}
                <div className="text-8xl sm:text-9xl font-black leading-none my-2 font-game text-white filter drop-shadow-[0_8px_16px_rgba(255,255,255,0.3)] animate-pulse">
                  {displayScore}
                </div>

                {result.newBest && (
                  <div className="float-y mx-auto mt-2 mb-1 inline-block rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 px-5 py-1.5 text-sm font-black text-black shadow-[0_0_15px_#fde047] font-game">
                    ⭐ REKOR TERBARU! ⭐
                  </div>
                )}

                {/* Stat Grid (Teks Diperbesar 2x) */}
                <div className="mt-5 grid grid-cols-2 gap-3 border-t-2 border-white/15 pt-4">
                  <div className="rounded-2xl border-2 border-white/15 bg-black/60 px-3 py-3 shadow-inner">
                    <div className="text-xs font-black tracking-wider text-white/50 font-game">REKOR TERBAIK</div>
                    <div className="text-3xl font-black text-amber-300 font-mono mt-1 drop-shadow">{best}</div>
                  </div>
                  <div className="rounded-2xl border-2 border-white/15 bg-black/60 px-3 py-3 shadow-inner">
                    <div className="text-xs font-black tracking-wider text-white/50 font-game">DAPAT APEL</div>
                    <div className="text-3xl font-black text-amber-300 font-mono mt-1 drop-shadow">+{result.coins} 🍎</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: DIBESARKAN & TEBAL */}
              <button
                onClick={play}
                className="pulse-btn mt-6 w-full rounded-2xl border-b-4 border-emerald-800 bg-gradient-to-b from-[#22c55e] via-[#16a34a] to-[#15803d] py-4 text-3xl font-black text-white shadow-[0_12px_28px_rgba(34,197,94,0.5)] transition active:translate-y-1 active:border-b-0 font-game hover:brightness-110"
              >
                ↻ MAIN LAGI
              </button>

              <button
                onClick={() => {
                  gameRef.current?.toIdle();
                  setScreen('menu');
                }}
                className="mt-3 w-full rounded-2xl border-2 border-white/20 bg-white/15 py-3.5 text-base sm:text-lg font-black text-white transition hover:bg-white/25 active:scale-95 font-game shadow-lg"
              >
                🏠 MENU UTAMA
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
