"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { BADGES, TOTAL_TASKS, type Badge, type ChallengeLevel } from "./course-data";
import { KEYWORDS } from "./keyword-data";

const STORAGE_KEY = "python-bridge-progress-v1";
const CERTIFICATION_STORAGE_KEY = "python-bridge-certifications-v1";
const TEST_STORAGE_KEY = "python-bridge-tests-v1";
const LAST_BADGE_KEY = "python-bridge-last-badge-v1";
const LAST_LEVEL_KEY = "python-bridge-last-level-v1";
const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

type Progress = Record<string, boolean>;

function taskKey(badge: Badge, level: ChallengeLevel, taskIndex: number) {
  return `${badge.id}:${level.id}:${taskIndex}`;
}

function taskKeys(badge: Badge, level?: ChallengeLevel) {
  const levels = level ? [level] : badge.levels;
  return levels.flatMap((item) => item.tasks.map((_, index) => taskKey(badge, item, index)));
}

function certificationKey(badge: Badge, level: ChallengeLevel) {
  return `${badge.id}:${level.id}`;
}

function testKey(badge: Badge, level: ChallengeLevel, testIndex: number) {
  return `${badge.id}:${level.id}:${testIndex}`;
}

function testKeys(badge: Badge, level: ChallengeLevel) {
  return level.tests.map((_, index) => testKey(badge, level, index));
}

function countComplete(progress: Progress, keys: string[]) {
  return keys.filter((key) => progress[key]).length;
}

function firstIncompleteLevelIndex(certifications: Progress, badge: Badge) {
  const index = badge.levels.findIndex((level) => !certifications[certificationKey(badge, level)]);
  return index === -1 ? Math.max(0, badge.levels.length - 1) : index;
}

const CORE_BADGES = BADGES.filter((badge) => !badge.optional);
const CORE_TASK_KEYS = CORE_BADGES.flatMap((badge) => taskKeys(badge));

type AwardTier = "locked" | "working" | "bronze" | "silver" | "gold";

const BADGE_MARKS: Record<string, string> = {
  starter: ">_",
  input: "123",
  selection: "IF",
  loops: "↻",
  lists: "[ ]",
  grids: "#",
  subroutines: "ƒ()",
  files: "TXT",
  algorithms: "⇅",
  "problem-solver": "★",
  "advanced-as": "AS",
};

function awardTier(challengesDone: number, hasStarted: boolean): AwardTier {
  if (challengesDone >= 3) return "gold";
  if (challengesDone === 2) return "silver";
  if (challengesDone === 1) return "bronze";
  if (hasStarted) return "working";
  return "locked";
}

function awardLabel(tier: AwardTier) {
  if (tier === "gold") return "Gold badge · self-certified";
  if (tier === "silver") return "Silver challenge · self-certified";
  if (tier === "bronze") return "Bronze challenge · self-certified";
  if (tier === "working") return "Badge in progress";
  return "Not started";
}

function challengeStatus(done: number, certified = false, total = 3) {
  if (certified) return "Self-certified";
  if (done === 0) return "Not started";
  return `In progress · ${done} of ${total} steps`;
}

function certifiedChallenges(certifications: Progress, badge: Badge) {
  return badge.levels.filter((level) => certifications[certificationKey(badge, level)]).length;
}

const PLAYER_STAGES = ["Understand", "Plan", "Build", "Test", "Claim"] as const;

function AchievementMedal({ badge, tier, compact = false }: { badge: Badge; tier: AwardTier; compact?: boolean }) {
  return (
    <span className={`achievement-medal ${tier} ${badge.optional ? "advanced" : ""} ${compact ? "compact" : ""}`} aria-hidden="true">
      <span className="medal-disc"><span className="medal-mark">{BADGE_MARKS[badge.id] || badge.number}</span><small>{badge.number}</small></span>
    </span>
  );
}

function CodeBlock({ label, value, copyLabel = "Copy code" }: { label: string; value: string; copyLabel?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  return (
    <section className="code-panel">
      <div className="code-head"><span>{label}</span><button type="button" onClick={copy} aria-live="polite">{copied ? "Copied" : copyLabel}</button></div>
      <pre><code>{value}</code></pre>
    </section>
  );
}

function ProgressiveHints({ hints }: { hints: string[] }) {
  const [visibleHints, setVisibleHints] = useState(0);
  const nextHint = visibleHints + 1;

  return (
    <section className="hint-box" aria-labelledby="hint-title">
      <div className="support-heading">
        <div><p className="eyebrow dark">Use only when needed</p><h3 id="hint-title">Progressive hints</h3></div>
        {visibleHints < hints.length && <button type="button" onClick={() => setVisibleHints(nextHint)}>Reveal hint {nextHint}</button>}
      </div>
      {visibleHints === 0 ? <p className="hint-prompt">Try the task and its tests first. Reveal one hint only when you reach a specific block.</p> : <ol aria-live="polite">{hints.slice(0, visibleHints).map((hint) => <li key={hint}>{hint}</li>)}</ol>}
      {visibleHints === hints.length && <p className="all-hints-shown">All hints are now visible. Return to your code before opening the model answer.</p>}
    </section>
  );
}

function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const percentage = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="progress-block" aria-label={`${label}: ${value} of ${max}`}>
      <div><span>{label}</span><strong>{value} / {max}</strong></div>
      <div className="progress-track"><i style={{ width: `${percentage}%` }} /></div>
    </div>
  );
}

export default function Home() {
  const [progress, setProgress] = useState<Progress>({});
  const [certifications, setCertifications] = useState<Progress>({});
  const [testProgress, setTestProgress] = useState<Progress>({});
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [lastBadgeId, setLastBadgeId] = useState<string | null>(null);
  const [lastLevelIndex, setLastLevelIndex] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [badgeCollectionOpen, setBadgeCollectionOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let restoredProgress: Progress = {};
      try {
        restoredProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        setProgress(restoredProgress);
      } catch {
        setProgress({});
      }
      try {
        const savedCertifications = localStorage.getItem(CERTIFICATION_STORAGE_KEY);
        if (savedCertifications) {
          setCertifications(JSON.parse(savedCertifications));
        } else {
          const migrated: Progress = {};
          BADGES.forEach((badge) => badge.levels.forEach((level) => {
            if (countComplete(restoredProgress, taskKeys(badge, level)) === level.tasks.length) migrated[certificationKey(badge, level)] = true;
          }));
          setCertifications(migrated);
        }
      } catch {
        setCertifications({});
      }
      try {
        setTestProgress(JSON.parse(localStorage.getItem(TEST_STORAGE_KEY) || "{}"));
      } catch {
        setTestProgress({});
      }
      setLastBadgeId(localStorage.getItem(LAST_BADGE_KEY));
      const savedLevel = Number.parseInt(localStorage.getItem(LAST_LEVEL_KEY) || "", 10);
      setLastLevelIndex(Number.isInteger(savedLevel) ? savedLevel : null);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem(CERTIFICATION_STORAGE_KEY, JSON.stringify(certifications));
  }, [certifications, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify(testProgress));
  }, [testProgress, ready]);

  const completeTasks = countComplete(progress, CORE_TASK_KEYS);
  const completeChallenges = CORE_BADGES.reduce((total, badge) => total + certifiedChallenges(certifications, badge), 0);
  const completeBadges = CORE_BADGES.filter((badge) => certifiedChallenges(certifications, badge) === badge.levels.length).length;
  const selectedBadge = BADGES.find((badge) => badge.id === selectedBadgeId) || null;
  const currentLevel = selectedBadge?.levels[selectedLevel];

  const resumeTarget = useMemo(() => {
    const lastBadge = BADGES.find((badge) => badge.id === lastBadgeId);
    if (lastBadge) {
      const done = countComplete(progress, taskKeys(lastBadge));
      const validStoredLevel = lastLevelIndex !== null && !!lastBadge.levels[lastLevelIndex];
      if ((done > 0 || certifiedChallenges(certifications, lastBadge) > 0) && certifiedChallenges(certifications, lastBadge) < 3) {
        return { badge: lastBadge, levelIndex: validStoredLevel ? lastLevelIndex : firstIncompleteLevelIndex(certifications, lastBadge) };
      }
    }

    const partialBadge = BADGES.find((badge) => {
      const done = countComplete(progress, taskKeys(badge));
      return done > 0 && certifiedChallenges(certifications, badge) < 3;
    });
    const badge = partialBadge
      || CORE_BADGES.find((item) => certifiedChallenges(certifications, item) < 3)
      || BADGES.find((item) => item.optional && certifiedChallenges(certifications, item) < 3)
      || BADGES[0];
    return { badge, levelIndex: firstIncompleteLevelIndex(certifications, badge) };
  }, [progress, certifications, lastBadgeId, lastLevelIndex]);

  function openBadge(id: string, level = 0) {
    setSelectedBadgeId(id);
    setSelectedLevel(level);
    localStorage.setItem(LAST_BADGE_KEY, id);
    localStorage.setItem(LAST_LEVEL_KEY, String(level));
    setLastBadgeId(id);
    setLastLevelIndex(level);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectLevel(level: number) {
    setSelectedLevel(level);
    localStorage.setItem(LAST_LEVEL_KEY, String(level));
    setLastLevelIndex(level);
  }

  function returnHome() {
    setSelectedBadgeId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showBadgeCollection() {
    setSelectedBadgeId(null);
    setBadgeCollectionOpen(true);
    window.setTimeout(() => document.getElementById("badge-collection")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function toggleTask(key: string) {
    setProgress((current) => ({ ...current, [key]: !current[key] }));
  }

  function toggleTest(key: string) {
    setTestProgress((current) => ({ ...current, [key]: !current[key] }));
  }

  function setChallengeCertification(key: string, value: boolean) {
    setCertifications((current) => {
      const next = { ...current };
      if (value) next[key] = true;
      else delete next[key];
      return next;
    });
  }

  function downloadProgress() {
    const report = {
      format: "python-bridge-progress",
      version: 4,
      course: "Python Bootcamp · Year 12",
      savedAt: new Date().toISOString(),
      lastBadgeId,
      lastLevelIndex,
      progress,
      certifications,
      testProgress,
      summary: {
        awardMethod: "self-certified",
        coreTasks: `${completeTasks} / ${TOTAL_TASKS}`,
        coreBadges: `${completeBadges} / ${CORE_BADGES.length}`,
        badges: BADGES.map((badge) => {
          const done = countComplete(progress, taskKeys(badge));
          const challenges = certifiedChallenges(certifications, badge);
          return {
            number: badge.number,
            title: badge.title,
            optional: !!badge.optional,
            complete: `${done} / ${taskKeys(badge).length}`,
            challenges: `${challenges} / 3 self-certified`,
          };
        }),
      },
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "year-12-python-bootcamp-progress-report.json";
    link.click();
    URL.revokeObjectURL(url);
    setReportMessage("Progress report saved. Keep this file so you can upload it next time.");
  }

  async function uploadProgress(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const report = JSON.parse(await file.text());
      if (report?.format !== "python-bridge-progress" || typeof report.progress !== "object" || report.progress === null) {
        throw new Error("Not a Python Bridge report");
      }

      const allowedKeys = new Set(BADGES.flatMap((badge) => taskKeys(badge)));
      const restored: Progress = {};
      for (const [key, value] of Object.entries(report.progress)) {
        if (allowedKeys.has(key) && value === true) restored[key] = true;
      }
      setProgress(restored);

      const allowedCertificationKeys = new Set(BADGES.flatMap((badge) => badge.levels.map((level) => certificationKey(badge, level))));
      const restoredCertifications: Progress = {};
      if (typeof report.certifications === "object" && report.certifications !== null) {
        for (const [key, value] of Object.entries(report.certifications)) {
          if (allowedCertificationKeys.has(key) && value === true) restoredCertifications[key] = true;
        }
      } else {
        BADGES.forEach((badge) => badge.levels.forEach((level) => {
          if (countComplete(restored, taskKeys(badge, level)) === level.tasks.length) restoredCertifications[certificationKey(badge, level)] = true;
        }));
      }
      setCertifications(restoredCertifications);

      const allowedTestKeys = new Set(BADGES.flatMap((badge) => badge.levels.flatMap((level) => testKeys(badge, level))));
      const restoredTests: Progress = {};
      if (typeof report.testProgress === "object" && report.testProgress !== null) {
        for (const [key, value] of Object.entries(report.testProgress)) {
          if (allowedTestKeys.has(key) && value === true) restoredTests[key] = true;
        }
      }
      setTestProgress(restoredTests);

      const restoredLastBadge = BADGES.find((badge) => badge.id === report.lastBadgeId)?.id || null;
      const restoredBadge = BADGES.find((badge) => badge.id === restoredLastBadge);
      const requestedLevel = Number.isInteger(report.lastLevelIndex) ? report.lastLevelIndex : 0;
      const restoredLevel = restoredBadge?.levels[requestedLevel] ? requestedLevel : 0;
      setLastBadgeId(restoredLastBadge);
      setLastLevelIndex(restoredLastBadge ? restoredLevel : null);
      if (restoredLastBadge) {
        localStorage.setItem(LAST_BADGE_KEY, restoredLastBadge);
        localStorage.setItem(LAST_LEVEL_KEY, String(restoredLevel));
      } else {
        localStorage.removeItem(LAST_BADGE_KEY);
        localStorage.removeItem(LAST_LEVEL_KEY);
      }
      setReportMessage("Progress restored. You can continue from your saved work.");
    } catch {
      setReportMessage("That file is not a valid Python Bridge progress report. Choose the report downloaded from this site.");
    }
  }

  function resetProgress() {
    if (window.confirm("Clear every completed task on this device? Your Python files will not be affected.")) {
      setProgress({});
      setCertifications({});
      setTestProgress({});
      localStorage.removeItem(CERTIFICATION_STORAGE_KEY);
      localStorage.removeItem(TEST_STORAGE_KEY);
      localStorage.removeItem(LAST_BADGE_KEY);
      localStorage.removeItem(LAST_LEVEL_KEY);
      setLastBadgeId(null);
      setLastLevelIndex(null);
      setReportMessage("Progress cleared on this device.");
    }
  }

  return (
    <main>
      <header className="site-header">
        <button className="brand" type="button" onClick={returnHome} aria-label="Python Bootcamp home">
          <span className="brand-mark">PB</span>
          <span><strong>Python Bootcamp</strong><small>Year 12 · Pseudocode to Python</small></span>
        </button>
        {selectedBadge && currentLevel && <div className="header-context" aria-label={`Current position: Badge ${selectedBadge.number}, ${selectedBadge.title}, ${currentLevel.label}`}><span>Badge {selectedBadge.number}</span><strong>{selectedBadge.title}</strong><small>{currentLevel.label}</small></div>}
        <div className="header-actions">
          <div className="header-progress">
            <span>{completeChallenges} of {CORE_BADGES.length * 3} core challenges claimed</span>
            <div><i style={{ width: `${Math.round((completeChallenges / (CORE_BADGES.length * 3)) * 100)}%` }} /></div>
          </div>
          <button className="quiet-button badge-dashboard-button" type="button" onClick={showBadgeCollection}>My badges</button>
          <button className="quiet-button" type="button" onClick={downloadProgress}>Save report</button>
          <label className="quiet-button file-button">Upload report<input type="file" accept=".json,application/json" onChange={uploadProgress} /></label>
        </div>
      </header>
      {reportMessage && <div className="report-message" role="status">{reportMessage}</div>}

      {selectedBadge && currentLevel ? (
          <ChallengePlayer
            key={`${selectedBadge.id}-${selectedLevel}`}
            badge={selectedBadge}
          level={currentLevel}
          levelIndex={selectedLevel}
          progress={progress}
          certifications={certifications}
          testProgress={testProgress}
            onBack={returnHome}
            onShowBadges={showBadgeCollection}
            onSelectLevel={selectLevel}
            onToggleTask={toggleTask}
            onToggleTest={toggleTest}
            onSetCertification={setChallengeCertification}
            onOpenBadge={openBadge}
            onDownload={downloadProgress}
            onUpload={uploadProgress}
        />
      ) : (
        <Dashboard
          progress={progress}
          certifications={certifications}
          completeTasks={completeTasks}
          completeBadges={completeBadges}
          resumeBadge={resumeTarget.badge}
          resumeLevel={resumeTarget.levelIndex}
          badgeCollectionOpen={badgeCollectionOpen}
          onToggleBadgeCollection={() => setBadgeCollectionOpen((current) => !current)}
          onOpenBadge={openBadge}
          onDownload={downloadProgress}
          onUpload={uploadProgress}
          onReset={resetProgress}
        />
      )}
    </main>
  );
}

function Dashboard({ progress, certifications, completeTasks, completeBadges, resumeBadge, resumeLevel, badgeCollectionOpen, onToggleBadgeCollection, onOpenBadge, onDownload, onUpload, onReset }: {
  progress: Progress;
  certifications: Progress;
  completeTasks: number;
  completeBadges: number;
  resumeBadge: Badge;
  resumeLevel: number;
  badgeCollectionOpen: boolean;
  onToggleBadgeCollection: () => void;
  onOpenBadge: (id: string, level?: number) => void;
  onDownload: () => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}) {
  return (
    <>
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Cambridge 9618 · Pseudocode to Python</p>
          <h1>Python Bootcamp</h1>
          <p className="hero-intro">No Python knowledge is assumed. Start with familiar pseudocode, translate one idea at a time, run it, test it and keep your progress on this device.</p>
          <button className="primary-button" type="button" onClick={() => onOpenBadge(resumeBadge.id, resumeLevel)}>
            {completeTasks === 0 ? "Start with Python Starter" : `Continue: ${resumeBadge.title} · ${resumeBadge.levels[resumeLevel].label.split(" · ")[1]}`} <span>→</span>
          </button>
        </div>
        <aside className="promise-card">
          <p className="card-label">How to use the course</p>
          <h2>You are learning Python syntax, not starting Computer Science again.</h2>
          <ol>
            <li><span>1</span><div><strong>Read</strong> the pseudocode you already understand.</div></li>
            <li><span>2</span><div><strong>Translate</strong> the small Python differences.</div></li>
            <li><span>3</span><div><strong>Run and test</strong> your own Python file.</div></li>
            <li><span>4</span><div><strong>Tick each completion step only after it works.</strong></div></li>
          </ol>
        </aside>
      </section>

      <BadgeCollection progress={progress} certifications={certifications} completeBadges={completeBadges} open={badgeCollectionOpen} onToggle={onToggleBadgeCollection} onOpenBadge={onOpenBadge} />

      <section className="roadmap" aria-labelledby="roadmap-title">
        <div className="section-heading">
          <div><p className="eyebrow dark">Your pathway</p><h2 id="roadmap-title">Ten core badges, plus one optional advanced pathway.</h2></div>
          <div className="dashboard-progress"><ProgressBar value={completeBadges} max={CORE_BADGES.length} label="Core badges complete" /><p>{completeTasks} of {TOTAL_TASKS} completion steps are saved. Each badge contains one Bronze, one Silver and one Gold challenge. Badge 11 is optional advanced work.</p></div>
        </div>
        <div className="badge-grid">
          {BADGES.map((badge) => {
            const total = taskKeys(badge).length;
            const done = countComplete(progress, taskKeys(badge));
            const challengesDone = certifiedChallenges(certifications, badge);
            const isComplete = challengesDone === 3;
            const isRecommended = badge.id === resumeBadge.id;
            const openLevel = isRecommended ? resumeLevel : firstIncompleteLevelIndex(certifications, badge);
            const status = badge.optional && done === 0 ? "Optional · Advanced" : isComplete ? "Gold earned" : done > 0 ? "In progress" : isRecommended ? "Recommended next" : "Available";
            return (
              <article role="button" tabIndex={0} className={`badge-card ${badge.optional ? "optional" : ""} ${done > 0 ? "active" : ""} ${isComplete ? "complete" : ""} ${isRecommended ? "recommended" : ""}`} onClick={() => onOpenBadge(badge.id, openLevel)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpenBadge(badge.id, openLevel); } }} key={badge.id} aria-label={`${done > 0 ? "Continue" : "Open"} ${badge.title}`}>
                <div className="badge-card-top"><div className="badge-number">{badge.number}</div><span className="status">{status}</span></div>
                <h3>{badge.title}</h3><p>{badge.short}</p>
                <div className="mini-progress"><i style={{ width: `${Math.round((done / total) * 100)}%` }} /></div>
                <div className="badge-meta"><span>{done} / {total} completion steps</span>{badge.optional && <span>Does not affect core progress</span>}</div>
                <div className="levels">
                  {badge.levels.map((level) => {
                    const levelDone = countComplete(progress, taskKeys(badge, level));
                    const certified = !!certifications[certificationKey(badge, level)];
                    return <span className={certified ? "earned" : ""} key={level.id}>{level.id === "bronze" ? "Bronze" : level.id === "silver" ? "Silver" : "Gold"} · {challengeStatus(levelDone, certified)}</span>;
                  })}
                </div>
                <span className="card-button">{done > 0 ? "Continue badge" : isRecommended ? "Start here" : "Open badge"} <span>→</span></span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="course-tools">
        <div><h2>Save your place and continue later</h2><p>Your ticks save automatically on this device. Download a progress report before you leave; upload that same report on another device to restore your completed tasks. Keep your Python files separately as evidence.</p></div>
        <div className="tool-actions"><a href={`${PUBLIC_BASE_PATH}/python-bridge-practice-files.zip`} download>Download practice files</a><button type="button" onClick={onDownload}>Save progress report</button><label className="file-button">Upload progress report<input type="file" accept=".json,application/json" onChange={onUpload} /></label><button className="danger-link" type="button" onClick={onReset}>Clear saved progress</button></div>
      </section>
    </>
  );
}

function BadgeCollection({ progress, certifications, completeBadges, open, onToggle, onOpenBadge }: {
  progress: Progress;
  certifications: Progress;
  completeBadges: number;
  open: boolean;
  onToggle: () => void;
  onOpenBadge: (id: string, level?: number) => void;
}) {
  const completedChallenges = BADGES.reduce((total, badge) => total + certifiedChallenges(certifications, badge), 0);

  return (
    <section className={`achievement-dashboard ${open ? "expanded" : "collapsed"}`} id="badge-collection" aria-labelledby="badge-collection-title">
      <div className="badge-bar">
        <div><p className="eyebrow dark">Your achievements</p><h2 id="badge-collection-title">My badges</h2></div>
        <div className="collection-summary" aria-label={`${completeBadges} core badges and ${completedChallenges} challenges self-certified`}>
          <span><strong>{completeBadges}</strong><small>core badges</small></span>
          <span><strong>{completedChallenges}</strong><small>challenges certified</small></span>
        </div>
        <button className="collection-toggle" type="button" aria-expanded={open} aria-controls="badge-collection-panel" onClick={onToggle}>{open ? "Hide badge collection" : "Show badge collection"}<span aria-hidden="true">{open ? "↑" : "↓"}</span></button>
      </div>
      {open && <div className="badge-collection-panel" id="badge-collection-panel">
        <div className="collection-explainer"><strong>How badges work</strong><span>Each badge has exactly three challenges: one Bronze, one Silver and one Gold. Each challenge contains three completion steps—not three separate activities. Finish and self-certify all three challenges to earn the full badge.</span></div>
        <div className="tier-key" aria-label="Badge colour key"><span className="key-locked">Not started</span><span className="key-working">Working on it</span><span className="key-bronze">Bronze</span><span className="key-silver">Silver</span><span className="key-gold">Gold</span></div>
        <div className="medal-grid">
          {BADGES.map((badge) => {
            const done = countComplete(progress, taskKeys(badge));
            const challengesDone = certifiedChallenges(certifications, badge);
            const tier = awardTier(challengesDone, done > 0);
            const nextLevel = firstIncompleteLevelIndex(certifications, badge);
            return (
              <button className={`medal-card ${tier} ${badge.optional ? "advanced" : ""}`} type="button" onClick={() => onOpenBadge(badge.id, nextLevel)} key={badge.id} aria-label={`${badge.credential}. ${awardLabel(tier)}. ${challengesDone} of 3 challenges self-certified.`}>
                <AchievementMedal badge={badge} tier={tier} />
                <span className="medal-copy"><strong>{badge.credential}</strong><small>{awardLabel(tier)}</small><span>{challengesDone} / 3 challenges</span></span>
              </button>
            );
          })}
        </div>
        <p className="collection-note"><strong>Evidence rule:</strong> tick a task only after your own program runs and passes the stated tests. The saved Python file is your evidence; the dashboard records your progress.</p>
      </div>}
    </section>
  );
}

function ChallengePlayer({ badge, level, levelIndex, progress, certifications, testProgress, onBack, onShowBadges, onSelectLevel, onToggleTask, onToggleTest, onSetCertification, onOpenBadge, onDownload, onUpload }: {
  badge: Badge;
  level: ChallengeLevel;
  levelIndex: number;
  progress: Progress;
  certifications: Progress;
  testProgress: Progress;
  onBack: () => void;
  onShowBadges: () => void;
  onSelectLevel: (index: number) => void;
  onToggleTask: (key: string) => void;
  onToggleTest: (key: string) => void;
  onSetCertification: (key: string, value: boolean) => void;
  onOpenBadge: (id: string, level?: number) => void;
  onDownload: () => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const levelTaskKeys = taskKeys(badge, level);
  const levelTestKeys = testKeys(badge, level);
  const levelDone = countComplete(progress, levelTaskKeys);
  const testsDone = countComplete(testProgress, levelTestKeys);
  const claimKey = certificationKey(badge, level);
  const levelCertified = !!certifications[claimKey];
  const maxUnlockedStage = levelCertified ? 4 : levelDone < level.tasks.length ? 2 : testsDone < level.tests.length ? 3 : 4;
  const [activeStage, setActiveStage] = useState(() => {
    const defaultStage = levelCertified ? 4 : levelDone > 0 ? 2 : 0;
    if (typeof window === "undefined") return defaultStage;
    const saved = Number.parseInt(localStorage.getItem(`python-bridge-stage-v1:${badge.id}:${level.id}`) || "", 10);
    return Number.isInteger(saved) && saved >= 0 ? Math.min(saved, maxUnlockedStage) : defaultStage;
  });
  const [activeTaskIndex, setActiveTaskIndex] = useState(() => {
    const first = levelTaskKeys.findIndex((key) => !progress[key]);
    return first === -1 ? Math.max(0, level.tasks.length - 1) : first;
  });
  const [supportOpen, setSupportOpen] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);
  const keywords = KEYWORDS[badge.id] || [];
  const independentBadge = ["algorithms", "problem-solver", "advanced-as"].includes(badge.id);
  const tierName = level.id === "bronze" ? "Bronze" : level.id === "silver" ? "Silver" : "Gold";
  const nextBadge = BADGES[BADGES.findIndex((item) => item.id === badge.id) + 1];
  const stageStorageKey = `python-bridge-stage-v1:${badge.id}:${level.id}`;

  useEffect(() => {
    localStorage.setItem(stageStorageKey, String(activeStage));
  }, [activeStage, stageStorageKey]);

  function moveToStage(index: number) {
    if (index <= maxUnlockedStage) {
      setActiveStage(index);
      window.setTimeout(() => document.getElementById("player-stage-panel")?.focus(), 0);
    }
  }

  function toggleBuildStep(index: number) {
    const key = levelTaskKeys[index];
    const wasDone = !!progress[key];
    onToggleTask(key);
    if (levelCertified) onSetCertification(claimKey, false);
    if (wasDone && activeStage > 2) setActiveStage(2);
    if (!wasDone && index < level.tasks.length - 1) setActiveTaskIndex(index + 1);
    else if (wasDone) setActiveTaskIndex(index);
  }

  function toggleChallengeTest(index: number) {
    const wasPassed = !!testProgress[levelTestKeys[index]];
    onToggleTest(levelTestKeys[index]);
    if (levelCertified) onSetCertification(claimKey, false);
    if (wasPassed && activeStage > 3) setActiveStage(3);
  }

  function confirmClaim() {
    onSetCertification(claimKey, true);
    setClaimOpen(false);
  }

  function levelState(item: ChallengeLevel) {
    const done = countComplete(progress, taskKeys(badge, item));
    return challengeStatus(done, !!certifications[certificationKey(badge, item)]);
  }

  return (
    <div className="badge-view player-view">
      <nav className="mobile-course-nav" aria-label="Course and challenge navigation">
        <button type="button" onClick={onBack}>← Pathway</button>
        <label><span>Badge</span><select value={badge.id} onChange={(event) => { const selected = BADGES.find((item) => item.id === event.target.value); if (selected) onOpenBadge(selected.id, firstIncompleteLevelIndex(certifications, selected)); }}>{BADGES.map((item) => <option value={item.id} key={item.id}>{item.number} · {item.title}</option>)}</select></label>
        <label><span>Challenge</span><select value={levelIndex} onChange={(event) => onSelectLevel(Number(event.target.value))}>{badge.levels.map((item, index) => <option value={index} key={item.id}>{item.label}</option>)}</select></label>
        <button type="button" onClick={onDownload}>Save report</button>
        <label className="mobile-upload">Upload report<input type="file" accept=".json,application/json" onChange={onUpload} /></label>
      </nav>

      <aside className="course-nav">
        <button className="back-link" type="button" onClick={onBack}>← Course pathway</button>
        <p className="nav-label">Badges</p>
        {BADGES.map((item) => <button type="button" className={item.id === badge.id ? "selected" : ""} onClick={() => onOpenBadge(item.id, firstIncompleteLevelIndex(certifications, item))} key={item.id}><span>{item.number}</span><div>{item.title}<small>{certifiedChallenges(certifications, item)} / 3 challenges{item.optional ? " · optional" : ""}</small></div></button>)}
      </aside>

      <div className="badge-main">
        <section className="badge-banner compact-banner">
          <div><p className="eyebrow">Badge {badge.number} · {badge.credential}</p><h1>{badge.title}</h1><p>{badge.short}</p></div>
          <div className="badge-facts"><span><b>Current challenge</b>{level.label}</span><span><b>Badge progress</b>{certifiedChallenges(certifications, badge)} / 3 challenges claimed</span>{badge.optional && <span><b>Pathway</b>Optional advanced work</span>}</div>
        </section>

        <section className="challenge-switcher" aria-labelledby="challenge-switcher-title">
          <div><p className="eyebrow dark">Choose one challenge</p><h2 id="challenge-switcher-title">Bronze, Silver or Gold</h2></div>
          <div className="level-tabs player-level-tabs" role="tablist" aria-label="Challenge level">
            {badge.levels.map((item, index) => <button type="button" role="tab" aria-selected={index === levelIndex} className={index === levelIndex ? "selected" : ""} onClick={() => onSelectLevel(index)} key={item.id}><span>{item.id}</span><strong>{item.label.split(" · ")[1]}</strong><small>{levelState(item)}</small></button>)}
          </div>
          <p className="challenge-explainer"><strong>One challenge = one program.</strong> Work through five short stages, then claim it yourself when your evidence is ready.</p>
        </section>

        <section className={`challenge-player ${supportOpen ? "support-visible" : ""}`} id="current-challenge">
          <header className="player-header">
            <div><p className={`stage-chip ${level.id}`}>{tierName} challenge</p><h2>{level.scenario}</h2><p>{level.outcome}</p></div>
            <button className={`support-toggle ${supportOpen ? "open" : ""}`} type="button" aria-expanded={supportOpen} aria-controls="player-support" onClick={() => setSupportOpen((current) => !current)}><span aria-hidden="true">?</span>{supportOpen ? "Hide reference & help" : "Reference & help"}</button>
          </header>

          <div className="stage-stepper-wrap" aria-label="Challenge stages">
            <ol className="stage-stepper">
              {PLAYER_STAGES.map((stage, index) => {
                const locked = index > maxUnlockedStage;
                const complete = levelCertified || index < activeStage || (index === 2 && levelDone === level.tasks.length) || (index === 3 && testsDone === level.tests.length);
                return <li key={stage}><button type="button" disabled={locked} aria-current={index === activeStage ? "step" : undefined} className={`${index === activeStage ? "current" : ""} ${complete ? "complete" : ""}`} onClick={() => moveToStage(index)}><span>{complete ? "✓" : index + 1}</span><strong>{stage}</strong><small>{locked ? (index === 3 ? "Finish Build first" : "Pass every test first") : index === activeStage ? "You are here" : complete ? "Complete" : "Available"}</small></button></li>;
              })}
            </ol>
          </div>

          <div className="player-workspace">
            <article className="player-main" id="player-stage-panel" tabIndex={-1}>
              {activeStage === 0 && <section className="stage-panel">
                <div className="stage-heading"><span>1</span><div><p className="eyebrow dark">Understand</p><h3>Know exactly what you are making</h3><p>Do not code yet. Read the outcome, inputs and evidence first.</p></div></div>
                <div className="mission-summary"><strong>Your mission</strong><p>{level.scenario}: {level.outcome}</p><span>{level.support}</span></div>
                {independentBadge && <div className="plain-brief"><h4>Plain-English requirements</h4><ul>{(level.plainEnglish || [level.outcome]).map((item) => <li key={item}>{item}</li>)}</ul></div>}
                {(level.setup || level.deliverables) && <div className="setup-summary">{level.setup && <section><h4>Set up first</h4><ol>{level.setup.map((item) => <li key={item}>{item}</li>)}</ol></section>}{level.deliverables && <section><h4>Keep as evidence</h4><ul>{level.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></section>}</div>}
                {(badge.id === "files" || badge.id === "problem-solver" || badge.id === "advanced-as") && <div className="download-callout compact-download"><div><strong>Files needed for this challenge</strong><p>Download once and keep the supplied text files beside your Python program.</p></div><a href={`${PUBLIC_BASE_PATH}/python-bridge-practice-files.zip`} download>Download files</a></div>}
                <div className="stage-actions"><span>When you can explain the finished program in one sentence, continue.</span><button className="primary-small" type="button" onClick={() => moveToStage(1)}>Continue to Plan →</button></div>
              </section>}

              {activeStage === 1 && <section className="stage-panel">
                <div className="stage-heading"><span>2</span><div><p className="eyebrow dark">Plan</p><h3>Translate the logic before the syntax</h3><p>Use the pseudocode you know to identify the sequence of the solution.</p></div></div>
                {badge.id === "input" && level.id === "bronze" && <section className="input-pattern-card"><h4>Three Python input patterns</h4><p>Python input begins as text. Convert it only when the program needs a number.</p><div><code>name = input(&quot;Name: &quot;)</code><code>age = int(input(&quot;Age: &quot;))</code><code>price = float(input(&quot;Price: &quot;))</code></div></section>}
                {independentBadge ? <details className="pseudocode-box staged-reveal"><summary>Reveal the pseudocode after making your own plan</summary><div className="reveal-warning">First identify the inputs, processing and outputs. Then compare your structure with this example.</div><CodeBlock label="Cambridge pseudocode example" value={level.pseudocode} copyLabel="Copy pseudocode" /></details> : <CodeBlock label="Pseudocode / design supplied" value={level.pseudocode} copyLabel="Copy pseudocode" />}
                <div className="plan-check"><strong>Before you build, point to:</strong><span>the input or starting data</span><span>the processing</span><span>the output or final result</span></div>
                <div className="stage-actions"><button type="button" onClick={() => moveToStage(0)}>← Back</button><button className="primary-small" type="button" onClick={() => moveToStage(2)}>Continue to Build →</button></div>
              </section>}

              {activeStage === 2 && <section className="stage-panel">
                <div className="stage-heading"><span>3</span><div><p className="eyebrow dark">Build</p><h3>Complete one step at a time</h3><p>This is one program with three build steps—not three separate activities.</p></div></div>
                <div className="build-progress"><ProgressBar value={levelDone} max={level.tasks.length} label="Build steps complete" /></div>
                <div className="build-step-nav" aria-label="Build steps">{level.tasks.map((task, index) => <button type="button" className={`${index === activeTaskIndex ? "current" : ""} ${progress[levelTaskKeys[index]] ? "done" : ""}`} onClick={() => setActiveTaskIndex(index)} key={task.title}><span>{progress[levelTaskKeys[index]] ? "✓" : index + 1}</span><small>Step {index + 1}</small></button>)}</div>
                <article className={`focused-task ${progress[levelTaskKeys[activeTaskIndex]] ? "done" : ""}`}>
                  <p>Step {activeTaskIndex + 1} of {level.tasks.length}</p><h4>{level.tasks[activeTaskIndex].title.replace(/^\d+\.\s*/, "")}</h4><p>{level.tasks[activeTaskIndex].instruction}</p>
                  <button type="button" onClick={() => toggleBuildStep(activeTaskIndex)}>{progress[levelTaskKeys[activeTaskIndex]] ? "✓ Step complete — undo" : "Mark this build step complete"}</button>
                </article>
                <details className="starter-box staged-reveal"><summary>{independentBadge ? "Need a nudge? Reveal the incomplete Python structure" : "Need a scaffold? Reveal the incomplete Python starting point"}</summary><div className="starter-warning">Try the current step first. This is an incomplete starting point, not the model answer.</div><CodeBlock label="Incomplete Python starting point" value={level.pythonStarter} /></details>
                <div className="stage-actions"><button type="button" onClick={() => moveToStage(1)}>← Back to Plan</button>{levelDone === level.tasks.length ? <button className="primary-small" type="button" onClick={() => moveToStage(3)}>Build complete · start Test →</button> : <span>Complete all three build steps to unlock Test.</span>}</div>
              </section>}

              {activeStage === 3 && <section className="stage-panel">
                <div className="stage-heading"><span>4</span><div><p className="eyebrow dark">Test</p><h3>Prove that your program works</h3><p>Run your own program for each check. Tick a test only after you have seen the correct result.</p></div></div>
                <ProgressBar value={testsDone} max={level.tests.length} label="Tests passed" />
                <div className="interactive-tests">{level.tests.map((test, index) => <label className={testProgress[levelTestKeys[index]] ? "passed" : ""} key={test}><input type="checkbox" checked={!!testProgress[levelTestKeys[index]]} onChange={() => toggleChallengeTest(index)} /><span aria-hidden="true">{testProgress[levelTestKeys[index]] ? "✓" : index + 1}</span><strong>{test}</strong></label>)}</div>
                {level.expectedOutput && <details className="expected-output-box"><summary>Compare with the known-good output</summary><div className="reveal-warning">Run your own program first. Small spacing differences are acceptable unless an exact format is required.</div><CodeBlock label="Known-good output" value={level.expectedOutput} copyLabel="Copy expected output" /></details>}
                {level.troubleshooting && <details className="troubleshooting-compact"><summary>My program is not passing a test</summary><div>{level.troubleshooting.map((item) => <article key={item.problem}><strong>{item.problem}</strong><p>{item.check}</p></article>)}</div></details>}
                <div className="stage-actions"><button type="button" onClick={() => moveToStage(2)}>← Back to Build</button>{testsDone === level.tests.length ? <button className="primary-small" type="button" onClick={() => moveToStage(4)}>All tests passed · Claim →</button> : <span>Pass and tick every test to unlock Claim.</span>}</div>
              </section>}

              {activeStage === 4 && <section className="stage-panel claim-stage">
                <div className="stage-heading"><span>5</span><div><p className="eyebrow dark">Claim</p><h3>{levelCertified ? `${tierName} challenge claimed` : `Claim your ${tierName} challenge`}</h3><p>The site cannot inspect your Python. You make an honest claim using the evidence in your saved file.</p></div></div>
                {levelCertified ? <div className={`credential-earned ${level.id}`} role="status"><AchievementMedal badge={badge} tier={level.id} compact /><div><strong>{tierName} challenge self-certified</strong><p>Your program runs, passes all stated tests and is saved as evidence.</p></div><button type="button" onClick={onShowBadges}>View my badges</button></div> : <div className="claim-readiness"><h4>Your evidence is ready</h4><ul><li><span>✓</span>All three build steps are complete.</li><li><span>✓</span>Every listed test is passed.</li><li><span>✓</span>Your Python file is saved.</li></ul><button className="claim-button" type="button" onClick={() => setClaimOpen(true)}>Claim {tierName} challenge</button></div>}
                {levelCertified && <details className="model-box"><summary>Compare with the model Python answer</summary><div className="model-warning">A different working solution can still be correct. Compare the logic, not just the exact lines.</div><CodeBlock label="Model Python" value={level.model} /><h4>Why this works</h4><ul>{level.modelNotes.map((note) => <li key={note}>{note}</li>)}</ul></details>}
                <div className="stage-actions final-actions">{levelIndex > 0 && <button type="button" onClick={() => onSelectLevel(levelIndex - 1)}>← Previous challenge</button>}{levelCertified && levelIndex < badge.levels.length - 1 && <button className="primary-small" type="button" onClick={() => onSelectLevel(levelIndex + 1)}>Next challenge: {badge.levels[levelIndex + 1].id === "silver" ? "Silver" : "Gold"} →</button>}{levelCertified && levelIndex === badge.levels.length - 1 && nextBadge && <button className="primary-small" type="button" onClick={() => onOpenBadge(nextBadge.id, firstIncompleteLevelIndex(certifications, nextBadge))}>Next badge: {nextBadge.title} →</button>}</div>
              </section>}
            </article>

            {supportOpen && <aside className="player-support" id="player-support">
              <div className="support-title"><span aria-hidden="true">?</span><div><strong>Reference & help</strong><small>Open only what you need.</small></div></div>
              <details open><summary>Keywords</summary><dl>{keywords.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl></details>
              <details><summary>Learning goals</summary><ul>{badge.learning.map((item) => <li key={item}>{item}</li>)}</ul></details>
              <details><summary>Rules to remember</summary><ol>{badge.rules.map((item) => <li key={item}>{item}</li>)}</ol></details>
              {!independentBadge && <details><summary>Pseudocode → Python example</summary><CodeBlock label="Cambridge pseudocode" value={badge.pseudoExample} /><CodeBlock label="Python equivalent" value={badge.pythonExample} /></details>}
              <ProgressiveHints hints={level.hints} />
              {badge.id === "starter" && <details><summary>How to run a Python file</summary><ol><li>Open the Python editor used in class.</li><li>Create a new file and save it.</li><li>Type or adapt the starting point.</li><li>Press Run and read the output.</li><li>For an error, read the final line and check the named line number.</li></ol></details>}
            </aside>}
          </div>
        </section>
      </div>

      {claimOpen && <div className="certification-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setClaimOpen(false); }}>
        <section className="certification-dialog" role="dialog" aria-modal="true" aria-labelledby="certification-title" onKeyDown={(event) => { if (event.key === "Escape") setClaimOpen(false); }}>
          <p className="eyebrow dark">Final self-check</p><h2 id="certification-title">Claim your {tierName} challenge?</h2><p>This site cannot inspect or mark your Python code. Confirm only when every statement is true.</p>
          <ul><li>My own program runs without an unresolved error.</li><li>I ran it and passed every test listed in the Test stage.</li><li>I saved the Python file as evidence.</li></ul>
          <p className="certification-consequence">After confirmation, this challenge appears in <strong>My badges</strong>. If you later undo a build step or test, the claim is removed until you check it again.</p>
          <div><button type="button" onClick={() => setClaimOpen(false)} autoFocus>Not yet — return to my code</button><button className="confirm-claim" type="button" onClick={confirmClaim}>Confirm and claim {tierName}</button></div>
        </section>
      </div>}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function BadgeView({ badge, level, levelIndex, progress, onBack, onShowBadges, onSelectLevel, onToggleTask, onOpenBadge, onDownload, onUpload }: {
  badge: Badge;
  level: ChallengeLevel;
  levelIndex: number;
  progress: Progress;
  onBack: () => void;
  onShowBadges: () => void;
  onSelectLevel: (index: number) => void;
  onToggleTask: (key: string) => void;
  onOpenBadge: (id: string, level?: number) => void;
  onDownload: () => void;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const [pendingCertificationKey, setPendingCertificationKey] = useState<string | null>(null);
  const levelDone = countComplete(progress, taskKeys(badge, level));
  const nextBadge = BADGES[BADGES.findIndex((item) => item.id === badge.id) + 1];
  const keywords = KEYWORDS[badge.id] || [];
  const independentBadge = ["algorithms", "problem-solver", "advanced-as"].includes(badge.id);
  const tierName = level.id === "bronze" ? "Bronze" : level.id === "silver" ? "Silver" : "Gold";

  function requestTaskToggle(key: string) {
    if (!progress[key] && levelDone === level.tasks.length - 1) {
      setPendingCertificationKey(key);
      return;
    }
    onToggleTask(key);
  }

  function confirmCertification() {
    if (pendingCertificationKey) onToggleTask(pendingCertificationKey);
    setPendingCertificationKey(null);
  }

  return (
    <div className="badge-view">
      <nav className="mobile-course-nav" aria-label="Course and challenge navigation">
        <button type="button" onClick={onBack}>← Pathway</button>
        <label><span>Badge</span><select value={badge.id} onChange={(event) => { const selected = BADGES.find((item) => item.id === event.target.value); if (selected) onOpenBadge(selected.id, firstIncompleteLevelIndex(progress, selected)); }}>{BADGES.map((item) => <option value={item.id} key={item.id}>{item.number} · {item.title}</option>)}</select></label>
        <label><span>Level</span><select value={levelIndex} onChange={(event) => onSelectLevel(Number(event.target.value))}>{badge.levels.map((item, index) => <option value={index} key={item.id}>{item.label}</option>)}</select></label>
        <button type="button" onClick={onDownload}>Save report</button>
        <label className="mobile-upload">Upload report<input type="file" accept=".json,application/json" onChange={onUpload} /></label>
      </nav>
      <aside className="course-nav">
        <button className="back-link" type="button" onClick={onBack}>← Course pathway</button>
        <p className="nav-label">Badges</p>
        {BADGES.map((item) => <button type="button" className={item.id === badge.id ? "selected" : ""} onClick={() => onOpenBadge(item.id, firstIncompleteLevelIndex(progress, item))} key={item.id}><span>{item.number}</span><div>{item.title}<small>{certifiedChallenges(progress, item)} / 3 challenges{item.optional ? " · optional" : ""}</small></div></button>)}
      </aside>

      <div className="badge-main">
        <section className="badge-banner">
          <div><p className="eyebrow">Badge {badge.number} · {badge.credential}</p><h1>{badge.title}</h1><p>{badge.short}</p></div>
          <div className="badge-facts"><span><b>Before this</b>{badge.prerequisite}</span><span><b>Progress</b>{certifiedChallenges(progress, badge)} / 3 challenges self-certified</span>{badge.optional && <span><b>Pathway</b>Optional advanced work</span>}</div>
        </section>
        <div className="badge-shortcuts"><span>You are in Badge {badge.number} · {level.label}</span><a href="#current-challenge">Jump to current challenge ↓</a></div>
        <section className="challenge-structure" aria-label="Badge structure"><strong>One badge · three challenges</strong><div><span><b>Bronze</b> one guided challenge</span><span><b>Silver</b> one translation challenge</span><span><b>Gold</b> one application challenge</span></div><p>Each challenge has three completion steps. The steps are a checklist for one piece of work, not three separate activities.</p></section>

        <section className="keyword-section" aria-labelledby="keyword-title">
          <div><p className="eyebrow dark">Read these first</p><h2 id="keyword-title">Keywords for this badge</h2><p>These words will appear in the pseudocode, Python or task instructions.</p></div>
          <dl>{keywords.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl>
        </section>

        <section className="concept-grid">
          <div className="learn-card"><h2>By the end, you can</h2><ul>{badge.learning.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div className="rules-card"><h2>Rules to keep beside you</h2><ol>{badge.rules.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol></div>
        </section>

        {!independentBadge && <section className="translation-section">
          <div className="section-heading compact"><div><p className="eyebrow dark">Translation bridge</p><h2>Same algorithm, different notation</h2></div><p>Read left to right. Do not memorise a Python line until you understand what it does.</p></div>
          <div className="code-bridge"><CodeBlock label="Cambridge pseudocode" value={badge.pseudoExample} /><b aria-hidden="true">→</b><CodeBlock label="Python equivalent" value={badge.pythonExample} /></div>
          {badge.id === "starter" && <div className="setup-callout"><strong>How to complete every challenge</strong><ol><li>Open the Python editor used in class.</li><li>Create a new file and save it before typing.</li><li>Type or adapt the supplied starting point.</li><li>Press Run and read the output area.</li><li>If an error appears, read the final line first and check the named line number.</li><li>Tick each completion step only when your own code passes the relevant test.</li></ol></div>}
          {badge.id === "files" && <div className="download-callout"><div><strong>Before you start the file badge</strong><p>Download the supplied text files and keep them in the same folder as your Python program.</p></div><a href={`${PUBLIC_BASE_PATH}/python-bridge-practice-files.zip`} download>Download practice files</a></div>}
        </section>}

        {badge.id === "problem-solver" && <section className="resource-section"><div className="download-callout"><div><strong>Files for this capstone</strong><p>Download names.txt and tournament_scores.txt. Keep both files in the same folder as your Python program.</p></div><a href={`${PUBLIC_BASE_PATH}/python-bridge-practice-files.zip`} download>Download capstone files</a></div></section>}
        {badge.id === "advanced-as" && <section className="resource-section"><div className="download-callout"><div><strong>Files for the three advanced programs</strong><p>Download once, then use only the file named in the current challenge. Do not edit the supplied test files.</p></div><a href={`${PUBLIC_BASE_PATH}/python-bridge-practice-files.zip`} download>Download advanced files</a></div></section>}

        <section className="level-section" id="current-challenge">
          <div className="level-tabs" role="tablist" aria-label="Challenge level">
            {badge.levels.map((item, index) => {
              const done = countComplete(progress, taskKeys(badge, item));
              const tabId = `level-tab-${badge.id}-${item.id}`;
              return <button type="button" role="tab" id={tabId} aria-controls={`level-panel-${badge.id}-${item.id}`} aria-selected={index === levelIndex} tabIndex={index === levelIndex ? 0 : -1} className={index === levelIndex ? "selected" : ""} onClick={() => onSelectLevel(index)} onKeyDown={(event) => { let next = index; if (event.key === "ArrowRight") next = (index + 1) % badge.levels.length; else if (event.key === "ArrowLeft") next = (index - 1 + badge.levels.length) % badge.levels.length; else if (event.key === "Home") next = 0; else if (event.key === "End") next = badge.levels.length - 1; else return; event.preventDefault(); onSelectLevel(next); window.requestAnimationFrame(() => document.getElementById(`level-tab-${badge.id}-${badge.levels[next].id}`)?.focus()); }} key={item.id}><span>{item.id}</span><strong>{item.label.split(" · ")[1]} challenge</strong><small>{index === levelIndex ? "Current · " : ""}{challengeStatus(done)}</small></button>;
            })}
          </div>

          <article className={`mission-card ${level.id}`} role="tabpanel" id={`level-panel-${badge.id}-${level.id}`} aria-labelledby={`level-tab-${badge.id}-${level.id}`} tabIndex={0}>
            <div className="mission-head"><div><p>{level.label} challenge</p><h2>{level.scenario}</h2><span>{level.support}</span></div><ProgressBar value={levelDone} max={3} label="Challenge steps" /></div>
            <div className="outcome"><strong>Finished outcome</strong><p>{level.outcome}</p></div>

            {independentBadge && (
              <section className="plain-english-brief" aria-label="Plain-English challenge brief">
                <div><p className="eyebrow dark">Start here · no code supplied</p><h3>Plain-English challenge</h3><p>Work out the structure before revealing either example.</p></div>
                <ul>{(level.plainEnglish || [level.outcome]).map((item) => <li key={item}>{item}</li>)}</ul>
              </section>
            )}

            <div className="work-order"><span>Work in this order</span>{independentBadge ? <ol><li>Read the plain-English brief and identify the inputs, processing and outputs.</li><li>Draft your own pseudocode or structure chart.</li><li>Reveal the pseudocode and compare it with your plan.</li><li>Begin the Python yourself; reveal the starter only if needed.</li><li>Complete every test before comparing with the model.</li></ol> : <ol><li>Read the pseudocode.</li><li>Try the first line yourself.</li><li>Reveal the starter only if you need a scaffold.</li><li>Complete and test one task at a time.</li><li>Use the model only after your own attempt.</li></ol>}</div>

            {level.setup && level.deliverables && (
              <section className="clarity-grid" aria-label="Challenge setup and completion checklist">
                <article><p className="eyebrow dark">Before you type any code</p><h3>Set up exactly like this</h3><ol>{level.setup.map((item) => <li key={item}>{item}</li>)}</ol></article>
                <article><p className="eyebrow dark">Definition of finished</p><h3>Keep these files</h3><ul>{level.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></article>
              </section>
            )}

            {level.expectedOutput && <details className="expected-output-box"><summary>Check your result · reveal the known-good output</summary><div className="reveal-warning">Run your own program once before comparing. Differences in spacing are acceptable unless the task specifies an exact format.</div><CodeBlock label="Known-good output using the supplied test file" value={level.expectedOutput} copyLabel="Copy expected output" /></details>}

            {badge.id === "input" && level.id === "bronze" && (
              <section className="foundation-strip in-activity" aria-labelledby="input-foundation">
                <div><p className="eyebrow dark">Reference for this activity</p><h2 id="input-foundation">The three input patterns</h2><p>Python input begins as text. Convert it only when the program needs a number.</p></div>
                <div className="input-patterns">
                  <article><span>Text</span><code>name = input(&quot;Name: &quot;)</code><small>Use for names, codes and words.</small></article>
                  <article><span>Whole number</span><code>age = int(input(&quot;Age: &quot;))</code><small>Use for counts and whole values.</small></article>
                  <article><span>Decimal number</span><code>price = float(input(&quot;Price: &quot;))</code><small>Use when a decimal may be entered.</small></article>
                </div>
              </section>
            )}

            {independentBadge ? (
              <details className="pseudocode-box"><summary>Reveal 1 · Compare with a Cambridge pseudocode example</summary><div className="reveal-warning">Open this only after drafting your own solution. Compare the sequence, selection, iteration, data structures and modules with your plan; do not copy it without understanding it.</div><CodeBlock label="Cambridge pseudocode example" value={level.pseudocode} copyLabel="Copy pseudocode" /></details>
            ) : (
              <CodeBlock label="Pseudocode / design supplied" value={level.pseudocode} copyLabel="Copy pseudocode" />
            )}
            <details className="starter-box"><summary>{independentBadge ? "Reveal 2 · Show the incomplete Python starting point" : "Need a scaffold? Reveal the Python starting point"}</summary><div className="starter-warning">{independentBadge ? "Open this only after you have compared your own design with the pseudocode and attempted the first Python section. It supplies structure, not a completed solution." : "Try to translate at least the first line from the pseudocode before opening this. The starting point is incomplete: you still need to make the decisions and write the missing logic."}</div><CodeBlock label="Incomplete Python starting point" value={level.pythonStarter} /></details>

            <section className="task-list" aria-labelledby="tasks-heading">
              <div className="subheading"><div><p className="eyebrow dark">Build one program</p><h3 id="tasks-heading">Three completion steps</h3></div><p>These are three steps within this one {tierName} challenge. Tick each step only after the relevant code works.</p></div>
              <div className="self-certification-notice">
                <div><span aria-hidden="true">✓</span><div><strong>This challenge is self-certified</strong><p>The site cannot inspect your Python code. Completing the third step asks you to confirm your evidence before awarding this challenge.</p></div></div>
                <ol><li>My own program runs.</li><li>It passes every listed test.</li><li>I have saved the Python file.</li></ol>
              </div>
              {level.tasks.map((task, index) => {
                const key = taskKey(badge, level, index);
                return (
                  <label className={`task-row ${progress[key] ? "done" : ""}`} key={key}>
                    <input type="checkbox" checked={!!progress[key]} onChange={() => requestTaskToggle(key)} />
                    <span className="check-box" aria-hidden="true">{progress[key] ? "✓" : index + 1}</span>
                    <span><strong>{task.title}</strong><small>{task.instruction}</small></span>
                  </label>
                );
              })}
            </section>

            <section className="test-panel"><p className="eyebrow dark">Do not skip this</p><h3>Test before you tick</h3><ul>{level.tests.map((test) => <li key={test}>{test}</li>)}</ul></section>

            {level.troubleshooting && (
              <section className="troubleshooting-panel">
                <p className="eyebrow dark">Fix it independently</p><h3>If something does not work</h3>
                <div>{level.troubleshooting.map((item) => <article key={item.problem}><strong>{item.problem}</strong><p>{item.check}</p></article>)}</div>
              </section>
            )}

            <div className="support-grid">
              <ProgressiveHints hints={level.hints} />
              <details className="model-box"><summary>Compare with the model Python answer</summary><div className="model-warning">Use this after you have run and tested your own attempt. A different working solution can still be correct.</div><CodeBlock label="Model Python" value={level.model} /><h4>Why this works</h4><ul>{level.modelNotes.map((note) => <li key={note}>{note}</li>)}</ul></details>
            </div>

            {levelDone === 3 && <div className={`credential-earned ${level.id}`} role="status"><AchievementMedal badge={badge} tier={level.id} compact /><div><strong>{tierName} challenge self-certified</strong><p>You confirmed that this one program runs, passes the tests and has been saved. The challenge is now shown in your badge collection.</p></div><button type="button" onClick={onShowBadges}>View my badges</button></div>}

            <div className="mission-actions">
              {levelIndex > 0 && <button type="button" onClick={() => onSelectLevel(levelIndex - 1)}>← Previous level</button>}
              {levelIndex < badge.levels.length - 1 && <button className="primary-small" type="button" onClick={() => { onSelectLevel(levelIndex + 1); window.scrollTo({ top: 520, behavior: "smooth" }); }}>Next challenge: {badge.levels[levelIndex + 1].id === "silver" ? "Silver" : "Gold"} →</button>}
              {levelIndex === badge.levels.length - 1 && nextBadge && <button className="primary-small" type="button" onClick={() => onOpenBadge(nextBadge.id, firstIncompleteLevelIndex(progress, nextBadge))}>Next badge: {nextBadge.title} →</button>}
            </div>
          </article>
        </section>
      </div>
      {pendingCertificationKey && <div className="certification-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingCertificationKey(null); }}>
        <section className="certification-dialog" role="dialog" aria-modal="true" aria-labelledby="certification-title" onKeyDown={(event) => { if (event.key === "Escape") setPendingCertificationKey(null); }}>
          <p className="eyebrow dark">Self-certification</p>
          <h2 id="certification-title">Claim your {tierName} level?</h2>
          <p>This site cannot inspect or mark your Python code. Confirm only when all three statements are true.</p>
          <ul><li>My own program runs without an unresolved error.</li><li>It passes every test listed in this activity.</li><li>I have saved the Python file as evidence.</li></ul>
          <p className="certification-consequence">After confirmation, the {tierName} level will appear in <strong>My badges</strong>. You can remove it later by unticking a task.</p>
          <div><button type="button" onClick={() => setPendingCertificationKey(null)} autoFocus>Not yet — return to my code</button><button className="confirm-claim" type="button" onClick={confirmCertification}>Confirm and claim {tierName}</button></div>
        </section>
      </div>}
    </div>
  );
}
