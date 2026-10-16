import { useEffect, useRef, useState } from 'react';
import { Game } from './game/Game';
import { setMuted, sfx } from './game/audio';
import { sfx4 } from './game/sfx4';
import { getWeapon, type WeaponId } from './game/weapons';
import { drawGunCentered } from './game/art/drawCentered';
import { getGunMetrics } from './game/art/metrics';
import { type Quest, type QuestState } from './game/quests';
import Arsenal from './components/Arsenal';
import QuestModal from './components/QuestModal';
import LeaderboardModal from './components/LeaderboardModal';
import { BossDefeatedModal } from './components/BossDefeatedModal';
import { BonusStageModal } from './components/BonusStageModal';
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

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  const [screen, setScreen] = useState<Screen>('menu');
  const [transitioning, setTransitioning] = useState(false);
  const [transText, setTransText] = useState('READY?');

  const [result, setResult] = useState({ score: 0, level: 1, coins: 0, newBest: false });
  const [displayScore, setDisplayScore] = useState(0);

  const [best, setBest] = useState(() => num(LS.best));
  const [bestLevel, setBestLevel] = useState(() => Math.max(1, num(LS.bestLevel)));
  const [totalCoins, setTotalCoins] = useState(() => Math.max(120, num(LS.coins)));

  const [questState, setQuestState] = useState<QuestState>(getInitialQuests);

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
  const [starBuffOpen, setStarBuffOpen] = useState(false);

  const [weapon, setWeaponState] = useState<WeaponId>(() => getWeapon(localStorage.getItem(LS.weapon) || 'pistol').id);

  // Sync quests to LS
  const saveQuests = (qs: QuestState) => {
    setQuestState(qs);
    localStorage.setItem(LS.quests, JSON.stringify(qs));
  };

  const chooseWeapon = (id: WeaponId) => {
    setWeaponState(id);
    localStorage.setItem(LS.weapon, id);
    gameRef.current?.setWeapon(id);
    sfx.unlock();
  };

  const handleClaimQuest = (q: Quest) => {
    const nextCoins = totalCoins + q.rewardCoins;
    setTotalCoins(nextCoins);
    localStorage.setItem(LS.coins, String(nextCoins));

    if (q.rewardWeapon) {
      chooseWeapon(q.rewardWeapon as WeaponId);
    }

    const nextQuests: QuestState = {
      ...questState,
      claimed: [...questState.claimed, q.id],
      totalCoinsCollected: questState.totalCoinsCollected + q.rewardCoins,
    };
    saveQuests(nextQuests);
  };

  useEffect(() => {
    const g = new Game(canvasRef.current!, {
      onGameOver: (score, level, coins) => {
        const prevBest = num(LS.best);
        const newBest = score > prevBest;
        if (newBest) localStorage.setItem(LS.best, String(score));
        if (level > num(LS.bestLevel)) localStorage.setItem(LS.bestLevel, String(level));

        const updatedTotalCoins = num(LS.coins) + coins;
        localStorage.setItem(LS.coins, String(updatedTotalCoins));

        setBest(num(LS.best));
        setBestLevel(Math.max(1, num(LS.bestLevel)));
        setTotalCoins(updatedTotalCoins);

        // Update Quest state metrics
        const updatedQuests: QuestState = {
          ...questState,
          highestScore: Math.max(questState.highestScore, score),
          highestLevel: Math.max(questState.highestLevel, level),
          totalCoinsCollected: questState.totalCoinsCollected + coins,
        };
        saveQuests(updatedQuests);

        setResult({ score, level, coins, newBest });
        setDisplayScore(0);
        setScreen('over');
      },
      onStarHit: () => setStarBuffOpen(true),
      applyStarBuff: () => undefined,
      onBossDefeated: (bossName, level, coinsEarned) => {
        setBossDefeatedData({ name: bossName, level, coins: coinsEarned });
        const updatedTotalCoins = totalCoins + coinsEarned;
        setTotalCoins(updatedTotalCoins);
        localStorage.setItem(LS.coins, String(updatedTotalCoins));
      },
    });

    g.setWeapon(getWeapon(localStorage.getItem(LS.weapon) || 'pistol').id);
    gameRef.current = g;
    return () => g.destroy();
  }, [questState]);

  // Floating upright weapon preview on main menu (matching Screenshot 1)
  useEffect(() => {
    if (screen !== 'menu') return;
    const cv = previewCanvasRef.current;
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1;
    const pw = 240;
    const ph = 210;
    cv.width = pw * dpr;
    cv.height = ph * dpr;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const start = performance.now();
    const curW = getWeapon(weapon);

    const loop = (now: number) => {
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
      drawGunCentered(ctx, curW.id, t, 0, true);
      ctx.restore();

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [screen, weapon]);

  // Roll up score animation on game over
  useEffect(() => {
    if (screen !== 'over') return;
    let val = 0;
    const target = result.score;
    const dur = 800;
    const start = performance.now();
    const timer = setInterval(() => {
      const p = Math.min(1, (performance.now() - start) / dur);
      val = Math.round(target * Math.pow(p, 0.7));
      setDisplayScore(val);
      if (p >= 1) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [screen, result.score]);

  // Start with Hypercasual Ready... GO! transition
  const play = () => {
    setTransitioning(true);
    setTransText('READY?');
    sfx.start();

    setTimeout(() => {
      setTransText('GO!! 🎯');
      sfx4.match();
    }, 380);

    setTimeout(() => {
      setTransitioning(false);
      gameRef.current?.start();
      setScreen('playing');
    }, 700);
  };

  const handleContinueAfterBoss = () => {
    setBossDefeatedData(null);
    // Buka halaman BONUS REWARD STAGE yang seru dan rewarding setelah mengalahkan Boss!
    setBonusStageOpen(true);
  };

  const handleBonusFinished = (bonusCoins: number) => {
    const updated = totalCoins + bonusCoins;
    setTotalCoins(updated);
    localStorage.setItem(LS.coins, String(updated));
    setBonusStageOpen(false);
    gameRef.current?.continueAfterBoss();
  };

  const toggleMute = () => {
    const m = !muted;
    setMuted(m);
    setMutedState(m);
    if (!m) sfx.coin();
  };

  return (
    <div className="font-game flex h-full w-full select-none items-center justify-center bg-[#071318]">
      <div className="relative overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] w-[420px] h-[760px] flex-shrink-0">
        {/* Canvas Engine */}
        <canvas ref={canvasRef} className="block touch-none w-[420px] h-[760px]" />

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

            {/* Upright Floating Gun Avatar */}
            <div className="flex flex-col items-center justify-center my-auto">
              <canvas
                ref={previewCanvasRef}
                style={{ width: 240, height: 210 }}
                className="block filter drop-shadow-[0_16px_30px_rgba(0,0,0,0.85)] cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setArsenalOpen(true)}
              />
              <div className="text-xs sm:text-sm font-black text-amber-300 font-game tracking-widest bg-black/60 px-5 py-1.5 rounded-full border-2 border-white/20 -mt-2 shadow-2xl">
                {getWeapon(weapon).name}
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
            onPick={(kind) => {
              gameRef.current?.applyBuff(kind);
              setStarBuffOpen(false);
            }}
          />
        )}

        {/* HALAMAN BONUS REWARD STAGE YANG SERU & REWARDING BANGET! */}
        {bonusStageOpen && (
          <BonusStageModal
            currentStage={bestLevel}
            onClaimAndContinue={handleBonusFinished}
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
