import { useCallback, useMemo, useRef, useState } from "react";
import { AchievementScreen, AdScreen, ArmoryScreen, BoxScreen, RewardScreen, SkippedScreen, StageScreen } from "./components/Screens";
import { BonusStageScreen, DestroyStageScreen, StageSelectScreen, TreasureStageScreen } from "./components/SpecialStages";
import { FailScreen } from "./components/FlowScreens";
import { ChallengesScreen, MainMenuScreen } from "./components/MenuScreens";
import { BOSSES, getBoss, type BossId } from "./components/Bosses";
import { WEAPONS, WEAPON_PRICE, getWeaponStats, rollByRarity, rollWeaponUnique, type WeaponDef } from "./weapons";
import { WeaponArt } from "./weapons";
import { ACHIEVEMENTS } from "./achievements";
import { BONUS_COIN_VALUE, bossesDefeated, completionPct, useSave } from "./progress";
import { MAX_LEVEL, STAGE_META, bossReward, destroyHP, destroyReward, getStage, normalReward } from "./stages";
import { audio, sfx } from "./sfx";

type Phase = "menu" | "challenges" | "stage" | "normal" | "box" | "bonus" | "destroy" | "treasure" | "ad" | "reward" | "skipped";

const LABELS: [Phase, string][] = [
  ["menu", "0. Menu"],
  ["challenges", "1. Peta"],
  ["stage", "2. Boss"],
  ["normal", "3. Normal"],
  ["box", "4. Kotak"],
  ["bonus", "5. Bonus"],
  ["destroy", "6. Destroy"],
  ["treasure", "7. Harta"],
  ["reward", "8. Defeated"],
];

type Overlay = { type: "failed"; progressText: string };

export default function App({ onExit }: { onExit?: () => void }) {

  const { save, update, reset } = useSave();
  const [phase, setPhase] = useState<Phase>("menu");
  const [key, setKey] = useState(0);
  const [stageKey, setStageKey] = useState(0);
  const [muted, setMuted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [bossId, setBossId] = useState<BossId>("sprout");
  const [weapon, setWeapon] = useState<WeaponDef>(WEAPONS[1]);
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [showAd, setShowAd] = useState<null | (() => void)>(null);
  const [showArmory, setShowArmory] = useState(false);
  const [showAch, setShowAch] = useState(false);
  const [showStages, setShowStages] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [failSnap, setFailSnap] = useState<number[]>([]);
  const failCount = useRef(0);

  const boss = getBoss(bossId);
  const equippedWeapon = WEAPONS.find((w) => w.id === save.equippedId);

  const go = useCallback((p: Phase) => { setPhase(p); setKey((k) => k + 1); }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }, []);

  const bumpStats = useCallback((patch: Partial<typeof save.stats>) => {
    update((s) => {
      const stats = { ...s.stats };
      (Object.keys(patch) as (keyof typeof stats)[]).forEach((k) => {
        stats[k] = (stats[k] ?? 0) + (patch[k] ?? 0);
      });
      return { stats };
    });
  }, [update]);

  /* ---------- main level router ---------- */
  const playLevel = useCallback((level: number) => {
    const lv = Math.min(MAX_LEVEL, Math.max(1, level));
    if (lv > save.highestUnlocked) {
      showToast(`🔒 Level ${lv} terkunci! Selesaikan Lv ${save.highestUnlocked} dulu.`);
      sfx.tick(true);
      return;
    }
    const info = getStage(lv);
    setCurrentLevel(lv);
    setFailSnap([]);
    failCount.current = 0;
    setOverlay(null);
    setShowStages(false);
    if (info.kind === "boss" && info.bossIndex != null) {
      setBossId(BOSSES[info.bossIndex].id);
    }
    go(STAGE_META[info.kind].phase as Phase);
  }, [go, save.highestUnlocked, showToast]);

  const markCleared = useCallback((level: number, stars: number, coinsGain: number, statsPatch: Partial<typeof save.stats>, addScore = true) => {
    let newBest = false;
    update((s) => {
      const prev = s.completed[String(level)];
      newBest = !prev || coinsGain > prev.best;
      const completed = {
        ...s.completed,
        [String(level)]: {
          done: true,
          stars: Math.max(prev?.stars ?? 0, stars),
          best: Math.max(prev?.best ?? 0, coinsGain),
        },
      };
      const stats = { ...s.stats };
      (Object.keys(statsPatch) as (keyof typeof stats)[]).forEach((k) => {
        stats[k] = (stats[k] ?? 0) + (statsPatch[k] ?? 0);
      });
      return {
        completed,
        coins: s.coins + coinsGain,
        score: addScore ? s.score + coinsGain : s.score,
        highestUnlocked: Math.max(s.highestUnlocked, Math.min(MAX_LEVEL, level + 1)),
        stats,
      };
    });
    return newBest;
  }, [update]);

  /* ---------- win handlers ----------
     Aturan: stage biasa LANGSUNG lanjut (tanpa layar skor).
     Skor/koin bonus besar hanya dihitung setelah ngalahin BOSS. */
  const advanceAfterWin = useCallback((level: number) => {
    if (level >= MAX_LEVEL) {
      showToast("👑 MASTER SLAYER! Semua 100 level tamat!");
      go("challenges");
      return;
    }
    const info = getStage(level + 1);
    setCurrentLevel(level + 1);
    setFailSnap([]);
    failCount.current = 0;
    setOverlay(null);
    if (info.kind === "boss" && info.bossIndex != null) {
      setBossId(BOSSES[info.bossIndex].id);
    }
    go(STAGE_META[info.kind].phase as Phase);
  }, [go, showToast]);

  const onNormalWin = useCallback(() => {
    const gain = normalReward(currentLevel);
    const stars = failCount.current === 0 ? 3 : failCount.current === 1 ? 2 : 1;
    markCleared(currentLevel, stars, gain, { stagesWon: 1, coinsEarned: gain }, false);
    advanceAfterWin(currentLevel);
  }, [currentLevel, markCleared, advanceAfterWin]);

  const onBonusWin = useCallback((earnedCoins: number) => {
    const gain = earnedCoins * BONUS_COIN_VALUE;
    const stars = earnedCoins >= 8 ? 3 : earnedCoins >= 4 ? 2 : 1;
    markCleared(currentLevel, stars, gain, { stagesWon: 1, coinsEarned: gain }, false);
    advanceAfterWin(currentLevel);
  }, [currentLevel, markCleared, advanceAfterWin]);

  const onTreasureWin = useCallback((earnedCoins: number) => {
    const gain = earnedCoins;
    const stars = earnedCoins >= 25 ? 3 : earnedCoins >= 12 ? 2 : 1;
    markCleared(currentLevel, stars, gain, { stagesWon: 1, coinsEarned: gain }, false);
    advanceAfterWin(currentLevel);
  }, [currentLevel, markCleared, advanceAfterWin]);

  const onDestroyWin = useCallback((shots: number) => {
    const gain = destroyReward(currentLevel);
    const dmg = getWeaponStats(equippedWeapon ?? WEAPONS[1]).damage;
    const expected = Math.ceil(destroyHP(currentLevel) / Math.max(1, dmg));
    const stars = shots <= expected ? 3 : shots <= Math.ceil(expected * 1.6) ? 2 : 1;
    markCleared(currentLevel, stars, gain, { stagesWon: 1, coinsEarned: gain }, false);
    advanceAfterWin(currentLevel);
  }, [currentLevel, markCleared, advanceAfterWin, equippedWeapon]);

  const onBossWin = useCallback(() => {
    const stars = failCount.current === 0 ? 3 : failCount.current === 1 ? 2 : 1;
    const rolled = rollWeaponUnique(save.unlockedWeapons);
    markCleared(currentLevel, stars, 0, { stagesWon: 1, bossesDefeated: 1 }, true);
    if (!rolled) {
      const gain = 500 + bossReward(currentLevel);
      update((s) => ({ coins: s.coins + gain, score: s.score + gain }));
      bumpStats({ coinsEarned: gain });
      showToast(`👑 ${boss.name} tumbang! +${gain} 💵 (skor dihitung!)`);
      go("challenges");
      return;
    }
    setWeapon(rolled);
    go("box");
  }, [currentLevel, markCleared, save.unlockedWeapons, boss.name, go, update, bumpStats, showToast]);

  const onBoxDone = useCallback(() => {
    bumpStats({ boxesOpened: 1 });
    update((s) => s.unlockedWeapons.includes(weapon.id)
      ? {}
      : { unlockedWeapons: [...s.unlockedWeapons, weapon.id] });
    go("reward");
  }, [bumpStats, update, weapon.id, go]);

  const onRewardClose = useCallback(() => {
    const gain = bossReward(currentLevel);
    update((s) => ({ coins: s.coins + gain, score: s.score + gain }));
    bumpStats({ coinsEarned: gain });
    showToast(`+${gain} 💵 Bonus boss!`);
    go("challenges");
  }, [currentLevel, update, bumpStats, showToast, go]);

  /* ---------- fail / revive ---------- */
  const onStageFail = useCallback((stuck: number[], total: number) => {
    failCount.current += 1;
    setFailSnap(stuck);
    setOverlay({ type: "failed", progressText: `${stuck.length}/${total} pisau` });
  }, []);

  const doRevive = useCallback(() => {
    setShowAd(() => () => {
      setShowAd(null);
      bumpStats({ adsWatched: 1, continuesDone: 1 });
      showToast("Revive! Lanjut dari posisi terakhir ✨");
      setOverlay(null);
      setStageKey((k) => k + 1);
    });
  }, [bumpStats, showToast]);

  const doRetry = useCallback(() => {
    setFailSnap([]);
    setOverlay(null);
    setStageKey((k) => k + 1);
  }, []);

  const goMap = useCallback(() => {
    setOverlay(null);
    setFailSnap([]);
    go("challenges");
  }, [go]);



  /** Cari level terdekat (ke bawah) dengan jenis tertentu yang sudah terbuka */
  const playNearestKind = useCallback((kind: "bonus" | "treasure") => {
    for (let lv = save.highestUnlocked; lv >= 1; lv--) {
      if (getStage(lv).kind === kind) {
        playLevel(lv);
        return;
      }
    }
    showToast(kind === "bonus" ? "🎡 Bonus terbuka di Level 3!" : "💰 Harta terbuka di Level 4!");
  }, [save.highestUnlocked, playLevel, showToast]);



  /* ---------- armory / shop ---------- */
  const equipWeapon = useCallback((id: string) => {
    update((s) => s.unlockedWeapons.includes(id)
      ? { equippedId: id }
      : { unlockedWeapons: [...s.unlockedWeapons, id], equippedId: id });
    bumpStats({ equips: 1 });
  }, [update, bumpStats]);

  const buyWeapon = useCallback((id: string) => {
    const w = WEAPONS.find((x) => x.id === id);
    if (!w) return;
    const price = WEAPON_PRICE[w.rarity];
    if (save.coins < price) { sfx.tick(true); showToast("Koin kurang!"); return; }
    update((s) => ({ coins: s.coins - price }));
    equipWeapon(id);
    sfx.equip();
    showToast(`${w.name} dibeli!`);
  }, [save.coins, equipWeapon, showToast, update]);

  const getViaAd = useCallback((id: string) => {
    bumpStats({ adsWatched: 1, continuesDone: 1 });
    equipWeapon(id);
    showToast("Iklan selesai! Senjata dibuka 🎉");
  }, [bumpStats, equipWeapon, showToast]);

  const claimAch = useCallback((id: string) => {
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (!a || save.claimedAch.includes(id)) return;
    update((s) => ({ claimedAch: [...s.claimedAch, id], coins: s.coins + a.coins, score: s.score + a.coins }));
    sfx.equip();
    showToast(`+${a.coins} 💵 ${a.title}`);
  }, [save.claimedAch, update, showToast]);

  const claimMilestone = useCallback((count: number) => {
    if (save.milestonesClaimed.includes(count)) return;
    const rarity = count === 5 ? "COMMON" : count === 10 ? "RARE" : "LEGEND";
    const w = rollByRarity(rarity as "COMMON" | "RARE" | "LEGEND", save.unlockedWeapons);
    update((s) => ({ milestonesClaimed: [...s.milestonesClaimed, count] }));
    if (!w) {
      update((s) => ({ coins: s.coins + 1000 }));
      showToast(`Semua ${rarity} sudah punya! +1000 💵`);
      return;
    }
    setWeapon(w);
    update((s) => ({ unlockedWeapons: [...s.unlockedWeapons, w.id] }));
    setShowAch(false);
    go("reward");
    sfx.reveal();
  }, [save.milestonesClaimed, save.unlockedWeapons, update, showToast, go]);

  const playStageFromMap = useCallback((p: "stage" | "normal" | "bonus" | "destroy" | "treasure", id: BossId, level?: number) => {
    if (typeof level === "number") {
      playLevel(level);
      return;
    }
    // fallback lama: boss -> level boss-nya, lainnya fase langsung
    if (p === "stage") {
      const idx = BOSSES.findIndex((b) => b.id === id);
      if (idx >= 0) {
        playLevel(idx * 5 + 5);
        return;
      }
    }
    setBossId(id);
    go(p as Phase);
  }, [playLevel, go]);

  const completedCount = useMemo(() => ACHIEVEMENTS.filter((a) => {
    const p = Math.min(a.progress(save.stats as never, save.unlockedWeapons.length), a.target);
    return p >= a.target;
  }).length, [save.stats, save.unlockedWeapons.length]);

  const inGame = phase !== "menu" && phase !== "challenges";
  const pct = completionPct(save.completed);
  const bossCount = bossesDefeated(save.completed);

  return (
    <div className="game-font flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,#0b1d22_0%,#03080a_70%)] relative overflow-hidden">
      {onExit && (
        <button
          onClick={onExit}
          className="fixed top-3 left-3 z-50 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-xl cursor-pointer transition hover:scale-105 active:scale-95"
          title="Kembali ke Menu Game"
        >
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Pilih Game Lain</span>
        </button>
      )}
      <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_38%,#21454e_0%,#13292f_45%,#0a1519_100%)]">
        <div className="pointer-events-none absolute inset-0 z-40 rounded-[30px] shadow-[inset_0_0_80px_rgba(0,0,0,.55)]" />

        {inGame && (
          <>
            <div className="absolute bottom-3 left-3 z-30 flex gap-1.5">
              <button onClick={() => { sfx.click(); setShowArmory(true); }} className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 py-1.5 pl-2 pr-3 backdrop-blur">
                <span className="flex h-7 w-10 items-center justify-center overflow-hidden rounded-full bg-white/10">
                  {equippedWeapon && <WeaponArt id={equippedWeapon.id} className="h-6 w-9" />}
                </span>
                <span className="text-left leading-none">
                  <span className="block text-[12px] font-black tracking-widest text-emerald-300">ARMORY</span>
                  <span className="block max-w-[80px] truncate text-[13px] font-bold text-white">{save.unlockedWeapons.length}/{WEAPONS.length}</span>
                </span>
              </button>
              <button onClick={() => { sfx.click(); setShowAch(true); }} className="relative flex h-[46px] w-[46px] items-center justify-center rounded-full border border-amber-300/30 bg-black/55 text-xl backdrop-blur">
                🏆
                {completedCount > save.claimedAch.length + save.milestonesClaimed.length && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[12px] font-bold text-white">!</span>
                )}
              </button>
            </div>
            <div className="absolute right-3 top-16 z-30 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 text-[13px] font-black text-amber-300 backdrop-blur">💵 {save.coins.toLocaleString("id-ID")}</div>
          </>
        )}

        <div key={key} className="absolute inset-0">
          {phase === "menu" && (
            <MainMenuScreen
              apples={save.apples}
              stage={save.highestUnlocked}
              score={save.score}
              progressPct={pct}
              bossCount={bossCount}
              equippedWeaponId={save.equippedId}
              onPlay={() => playLevel(save.highestUnlocked)}
              onChallenges={() => go("challenges")}
              onArmory={() => setShowArmory(true)}
              onAch={() => setShowAch(true)}
              onGift={() => { sfx.equip(); update((s) => ({ coins: s.coins + 200 })); showToast("+200 💵 Daily Gift!"); }}
              onBonus={() => playNearestKind("bonus")}
              onTreasure={() => playNearestKind("treasure")}
            />
          )}
          {phase === "challenges" && (
            <ChallengesScreen
              onBack={() => go("menu")}
              onPlayStage={playStageFromMap}
              onSkins={() => setShowArmory(true)}
              onLeague={() => setShowAch(true)}
              completed={save.completed}
              highestUnlocked={save.highestUnlocked}
              currentLevel={currentLevel}
            />
          )}
          {phase === "stage" && (
            <div key={`st-${stageKey}`} className="absolute inset-0">
              <StageScreen
                bossId={bossId} level={currentLevel} coins={save.coins}
                initialStuck={failSnap.length > 0 ? failSnap : undefined}
                onComplete={onBossWin}
                onThrow={() => bumpStats({ knivesThrown: 1 })}
                onFail={(stuck) => onStageFail(stuck, boss.knives)}
                onQuit={goMap}
              />
            </div>
          )}
          {phase === "normal" && (
            <div key={`nm-${stageKey}`} className="absolute inset-0">
              <StageScreen
                mode="normal" level={currentLevel} coins={save.coins}
                initialStuck={failSnap.length > 0 ? failSnap : undefined}
                onComplete={onNormalWin}
                onThrow={() => bumpStats({ knivesThrown: 1 })}
                onFail={(stuck) => onStageFail(stuck, 5 + Math.min(2, Math.floor((currentLevel - 1) / 25)))}
                onQuit={goMap}
              />
            </div>
          )}
          {phase === "box" && <BoxScreen weapon={weapon} bossName={boss.name} level={currentLevel} score={save.score} onDone={onBoxDone} />}
          {phase === "bonus" && (
            <div key={`bn-${stageKey}`} className="absolute inset-0">
              <BonusStageScreen
                level={currentLevel} coins={save.coins}
                initialStuck={failSnap.length > 0 ? failSnap : undefined}
                onComplete={onBonusWin}
                onThrow={() => bumpStats({ knivesThrown: 1 })}
                onFail={(stuck) => onStageFail(stuck, 6)}
                onQuit={goMap}
              />
            </div>
          )}
          {phase === "destroy" && <DestroyStageScreen weapon={equippedWeapon ?? WEAPONS[1]} level={currentLevel} coins={save.coins} onQuit={goMap} onComplete={onDestroyWin} />}
          {phase === "treasure" && <TreasureStageScreen weapon={equippedWeapon ?? WEAPONS[1]} level={currentLevel} coins={save.coins} onQuit={goMap} onComplete={onTreasureWin} />}
          {phase === "ad" && <AdScreen onDone={() => go("reward")} />}
          {phase === "reward" && (
            <RewardScreen
              weapon={weapon}
              equipped={save.equippedId === weapon.id}
              bossId={bossId}
              bossName={boss.name}
              level={currentLevel}
              score={save.score}
              onEquip={() => equipWeapon(weapon.id)}
              onClose={onRewardClose}
              onReplay={() => playLevel(currentLevel)}
            />
          )}
          {phase === "skipped" && <SkippedScreen onReplay={() => playLevel(currentLevel)} />}
        </div>

        {/* overlay gagal di atas stage (stage tetap mount di belakang).
            Menang stage biasa langsung lanjut (tanpa layar skor);
            skor hanya dihitung setelah ngalahin BOSS. */}
        {overlay?.type === "failed" && inGame && (
          <FailScreen
            level={currentLevel}
            kind={getStage(currentLevel).kind}
            progressText={overlay.progressText}
            onReviveAd={doRevive}
            onRetry={doRetry}
            onMap={goMap}
          />
        )}

        {showAd && (
          <div className="absolute inset-0 z-40">
            <AdScreen onDone={() => showAd()} />
          </div>
        )}

        {showArmory && (
          <ArmoryScreen
            coins={save.coins}
            unlocked={save.unlockedWeapons}
            equippedId={save.equippedId}
            onEquip={equipWeapon}
            onBuy={buyWeapon}
            onWatchAd={getViaAd}
            onClose={() => setShowArmory(false)}
          />
        )}
        {showAch && (
          <AchievementScreen
            stats={save.stats as never}
            ownedCount={save.unlockedWeapons.length}
            claimed={save.claimedAch}
            milestonesClaimed={save.milestonesClaimed}
            onClaim={claimAch}
            onClaimMilestone={claimMilestone}
            onClose={() => setShowAch(false)}
          />
        )}
        {showStages && (
          <StageSelectScreen
            bossId={bossId}
            onBoss={setBossId}
            onGo={(p) => { setShowStages(false); go(p); }}
            onClose={() => setShowStages(false)}
          />
        )}

        {toast && (
          <div className="pop-in absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-2xl border border-amber-300/40 bg-black/85 px-5 py-3 text-center text-[15px] font-bold text-amber-200 shadow-2xl">
            {toast}
          </div>
        )}
      </div>

      <div className="flex max-w-[420px] flex-wrap items-center justify-center gap-1.5">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
          Lv {currentLevel} · {pct}% · 👑{bossCount}/20
        </span>
        {LABELS.map(([p, l]) => (
          <button
            key={p}
            onClick={() => {
              sfx.click();
              if (p === "box" || p === "reward") {
                const rolled = rollWeaponUnique(save.unlockedWeapons);
                if (rolled) setWeapon(rolled);
              }
              go(p);
            }}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${phase === p ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,.5)]" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
          >
            {l}
          </button>
        ))}
        <button onClick={() => { sfx.click(); setShowStages(true); }} className="rounded-full bg-sky-500/30 px-3 py-1 text-xs font-semibold text-sky-200 hover:bg-sky-500/50">🗺 Pilih Stage</button>
        <button onClick={() => { sfx.click(); setShowArmory(true); }} className="rounded-full bg-violet-500/30 px-3 py-1 text-xs font-semibold text-violet-200 hover:bg-violet-500/50">🎒 Armory</button>
        <button onClick={() => { sfx.click(); setShowAch(true); }} className="rounded-full bg-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/50">🏆 {completedCount}/{ACHIEVEMENTS.length}</button>
        <button onClick={() => { const m = !muted; audio.setMuted(m); setMuted(m); }} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/20">
          {muted ? "🔇 Off" : "🔊 On"}
        </button>
        <button onClick={() => { reset(); setCurrentLevel(1); setOverlay(null); go("menu"); showToast("Save direset!"); }} className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-200 hover:bg-red-500/40">↺ Reset</button>
      </div>
    </div>
  );
}
