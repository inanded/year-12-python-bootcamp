"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { BADGES, TOTAL_TASKS, type Badge, type ChallengeLevel } from "./course-data";
import { KEYWORDS } from "./keyword-data";

const STORAGE_KEY = "python-bridge-progress-v1";
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

function countComplete(progress: Progress, keys: string[]) {
  return keys.filter((key) => progress[key]).length;
}

function firstIncompleteLevelIndex(progress: Progress, badge: Badge) {
  const index = badge.levels.findIndex((level) => countComplete(progress, taskKeys(badge, level)) < level.tasks.length);
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

function awardTier(done: number, total: number): AwardTier {
  if (done === total) return "gold";
  if (done >= 6) return "silver";
  if (done >= 3) return "bronze";
  if (done > 0) return "working";
  return "locked";
}

function awardLabel(tier: AwardTier) {
  if (tier === "gold") return "Gold badge earned";
  if (tier === "silver") return "Silver level earned";
  if (tier === "bronze") return "Bronze level earned";
  if (tier === "working") return "Badge in progress";
  return "Not started";
}

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
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [lastBadgeId, setLastBadgeId] = useState<string | null>(null);
  const [lastLevelIndex, setLastLevelIndex] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [reportMessage, setReportMessage] = useState("");
  const [badgeCollectionOpen, setBadgeCollectionOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        setProgress(saved);
      } catch {
        setProgress({});
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

  const completeTasks = countComplete(progress, CORE_TASK_KEYS);
  const completeBadges = CORE_BADGES.filter((badge) => countComplete(progress, taskKeys(badge)) === taskKeys(badge).length).length;
  const selectedBadge = BADGES.find((badge) => badge.id === selectedBadgeId) || null;
  const currentLevel = selectedBadge?.levels[selectedLevel];

  const resumeTarget = useMemo(() => {
    const lastBadge = BADGES.find((badge) => badge.id === lastBadgeId);
    if (lastBadge) {
      const done = countComplete(progress, taskKeys(lastBadge));
      const validStoredLevel = lastLevelIndex !== null && !!lastBadge.levels[lastLevelIndex];
      if (done > 0 && done < taskKeys(lastBadge).length) {
        return { badge: lastBadge, levelIndex: validStoredLevel ? lastLevelIndex : firstIncompleteLevelIndex(progress, lastBadge) };
      }
    }

    const partialBadge = BADGES.find((badge) => {
      const done = countComplete(progress, taskKeys(badge));
      return done > 0 && done < taskKeys(badge).length;
    });
    const badge = partialBadge
      || CORE_BADGES.find((item) => countComplete(progress, taskKeys(item)) < taskKeys(item).length)
      || BADGES.find((item) => item.optional && countComplete(progress, taskKeys(item)) < taskKeys(item).length)
      || BADGES[0];
    return { badge, levelIndex: firstIncompleteLevelIndex(progress, badge) };
  }, [progress, lastBadgeId, lastLevelIndex]);

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

  function downloadProgress() {
    const report = {
      format: "python-bridge-progress",
      version: 3,
      course: "Python Bootcamp · Year 12",
      savedAt: new Date().toISOString(),
      lastBadgeId,
      lastLevelIndex,
      progress,
      summary: {
        coreTasks: `${completeTasks} / ${TOTAL_TASKS}`,
        coreBadges: `${completeBadges} / ${CORE_BADGES.length}`,
        badges: BADGES.map((badge) => {
        const done = countComplete(progress, taskKeys(badge));
          return {
            number: badge.number,
            title: badge.title,
            optional: !!badge.optional,
            complete: `${done} / ${taskKeys(badge).length}`,
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
            <span>{completeBadges} of {CORE_BADGES.length} core badges</span>
            <div><i style={{ width: `${Math.round((completeTasks / TOTAL_TASKS) * 100)}%` }} /></div>
          </div>
          <button className="quiet-button badge-dashboard-button" type="button" onClick={showBadgeCollection}>My badges</button>
          <button className="quiet-button" type="button" onClick={downloadProgress}>Save report</button>
          <label className="quiet-button file-button">Upload report<input type="file" accept=".json,application/json" onChange={uploadProgress} /></label>
        </div>
      </header>
      {reportMessage && <div className="report-message" role="status">{reportMessage}</div>}

      {selectedBadge && currentLevel ? (
          <BadgeView
            key={`${selectedBadge.id}-${selectedLevel}`}
            badge={selectedBadge}
          level={currentLevel}
          levelIndex={selectedLevel}
          progress={progress}
            onBack={returnHome}
            onShowBadges={showBadgeCollection}
            onSelectLevel={selectLevel}
            onToggleTask={toggleTask}
            onOpenBadge={openBadge}
            onDownload={downloadProgress}
            onUpload={uploadProgress}
        />
      ) : (
        <Dashboard
          progress={progress}
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

function Dashboard({ progress, completeTasks, completeBadges, resumeBadge, resumeLevel, badgeCollectionOpen, onToggleBadgeCollection, onOpenBadge, onDownload, onUpload, onReset }: {
  progress: Progress;
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
            <li><span>4</span><div><strong>Tick a task only after it works.</strong></div></li>
          </ol>
        </aside>
      </section>

      <BadgeCollection progress={progress} completeBadges={completeBadges} open={badgeCollectionOpen} onToggle={onToggleBadgeCollection} onOpenBadge={onOpenBadge} />

      <section className="roadmap" aria-labelledby="roadmap-title">
        <div className="section-heading">
          <div><p className="eyebrow dark">Your pathway</p><h2 id="roadmap-title">Ten core badges, plus one optional advanced pathway.</h2></div>
          <div className="dashboard-progress"><ProgressBar value={completeBadges} max={CORE_BADGES.length} label="Core badges complete" /><p>{completeTasks} of {TOTAL_TASKS} checked tasks are saved. Focus on the nine tasks in your current badge. Badge 11 is optional advanced work.</p></div>
        </div>
        <div className="badge-grid">
          {BADGES.map((badge) => {
            const total = taskKeys(badge).length;
            const done = countComplete(progress, taskKeys(badge));
            const isComplete = done === total;
            const isRecommended = badge.id === resumeBadge.id;
            const openLevel = isRecommended ? resumeLevel : firstIncompleteLevelIndex(progress, badge);
            const status = badge.optional && done === 0 ? "Optional · Advanced" : isComplete ? "Gold earned" : done > 0 ? "In progress" : isRecommended ? "Recommended next" : "Available";
            return (
              <article role="button" tabIndex={0} className={`badge-card ${badge.optional ? "optional" : ""} ${done > 0 ? "active" : ""} ${isComplete ? "complete" : ""} ${isRecommended ? "recommended" : ""}`} onClick={() => onOpenBadge(badge.id, openLevel)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpenBadge(badge.id, openLevel); } }} key={badge.id} aria-label={`${done > 0 ? "Continue" : "Open"} ${badge.title}`}>
                <div className="badge-card-top"><div className="badge-number">{badge.number}</div><span className="status">{status}</span></div>
                <h3>{badge.title}</h3><p>{badge.short}</p>
                <div className="mini-progress"><i style={{ width: `${Math.round((done / total) * 100)}%` }} /></div>
                <div className="badge-meta"><span>{done} / {total} tasks</span>{badge.optional && <span>Does not affect core progress</span>}</div>
                <div className="levels">
                  {badge.levels.map((level) => {
                    const levelDone = countComplete(progress, taskKeys(badge, level));
                    return <span className={levelDone === 3 ? "earned" : ""} key={level.id}>{level.id === "bronze" ? "Bronze" : level.id === "silver" ? "Silver" : "Gold"} {levelDone}/3</span>;
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

function BadgeCollection({ progress, completeBadges, open, onToggle, onOpenBadge }: {
  progress: Progress;
  completeBadges: number;
  open: boolean;
  onToggle: () => void;
  onOpenBadge: (id: string, level?: number) => void;
}) {
  const earnedLevels = BADGES.reduce((total, badge) => total + badge.levels.filter((level) => countComplete(progress, taskKeys(badge, level)) === level.tasks.length).length, 0);

  return (
    <section className={`achievement-dashboard ${open ? "expanded" : "collapsed"}`} id="badge-collection" aria-labelledby="badge-collection-title">
      <div className="badge-bar">
        <div><p className="eyebrow dark">Your achievements</p><h2 id="badge-collection-title">My badges</h2></div>
        <div className="collection-summary" aria-label={`${completeBadges} core badges and ${earnedLevels} challenge levels earned`}>
          <span><strong>{completeBadges}</strong><small>core badges</small></span>
          <span><strong>{earnedLevels}</strong><small>levels earned</small></span>
        </div>
        <button className="collection-toggle" type="button" aria-expanded={open} aria-controls="badge-collection-panel" onClick={onToggle}>{open ? "Hide badge collection" : "Show badge collection"}<span aria-hidden="true">{open ? "↑" : "↓"}</span></button>
      </div>
      {open && <div className="badge-collection-panel" id="badge-collection-panel">
        <div className="collection-explainer"><strong>How badges work</strong><span>Each set of three working tasks earns a level. Complete Bronze, Silver and Gold to earn the full badge.</span></div>
        <div className="tier-key" aria-label="Badge colour key"><span className="key-locked">Not started</span><span className="key-working">Working on it</span><span className="key-bronze">Bronze</span><span className="key-silver">Silver</span><span className="key-gold">Gold</span></div>
        <div className="medal-grid">
          {BADGES.map((badge) => {
            const total = taskKeys(badge).length;
            const done = countComplete(progress, taskKeys(badge));
            const tier = awardTier(done, total);
            const nextLevel = firstIncompleteLevelIndex(progress, badge);
            return (
              <button className={`medal-card ${tier} ${badge.optional ? "advanced" : ""}`} type="button" onClick={() => onOpenBadge(badge.id, nextLevel)} key={badge.id} aria-label={`${badge.credential}. ${awardLabel(tier)}. ${done} of ${total} tasks complete.`}>
                <AchievementMedal badge={badge} tier={tier} />
                <span className="medal-copy"><strong>{badge.credential}</strong><small>{awardLabel(tier)}</small><span>{done} / {total} tasks</span></span>
              </button>
            );
          })}
        </div>
        <p className="collection-note"><strong>Evidence rule:</strong> tick a task only after your own program runs and passes the stated tests. The saved Python file is your evidence; the dashboard records your progress.</p>
      </div>}
    </section>
  );
}

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
  const levelDone = countComplete(progress, taskKeys(badge, level));
  const badgeDone = countComplete(progress, taskKeys(badge));
  const nextBadge = BADGES[BADGES.findIndex((item) => item.id === badge.id) + 1];
  const keywords = KEYWORDS[badge.id] || [];
  const independentBadge = ["algorithms", "problem-solver", "advanced-as"].includes(badge.id);

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
        {BADGES.map((item) => {
          const done = countComplete(progress, taskKeys(item));
          return <button type="button" className={item.id === badge.id ? "selected" : ""} onClick={() => onOpenBadge(item.id, firstIncompleteLevelIndex(progress, item))} key={item.id}><span>{item.number}</span><div>{item.title}<small>{done} / {taskKeys(item).length} tasks{item.optional ? " · optional" : ""}</small></div></button>;
        })}
      </aside>

      <div className="badge-main">
        <section className="badge-banner">
          <div><p className="eyebrow">Badge {badge.number} · {badge.credential}</p><h1>{badge.title}</h1><p>{badge.short}</p></div>
          <div className="badge-facts"><span><b>Before this</b>{badge.prerequisite}</span><span><b>Progress</b>{badgeDone} / {taskKeys(badge).length} tasks</span>{badge.optional && <span><b>Pathway</b>Optional advanced work</span>}</div>
        </section>
        <div className="badge-shortcuts"><span>You are in Badge {badge.number} · {level.label}</span><a href="#current-challenge">Jump to current challenge ↓</a></div>

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
          {badge.id === "starter" && <div className="setup-callout"><strong>How to complete every task</strong><ol><li>Open the Python editor used in class.</li><li>Create a new file and save it before typing.</li><li>Type or adapt the supplied starting point.</li><li>Press Run and read the output area.</li><li>If an error appears, read the final line first and check the named line number.</li><li>Tick the task only when your own code passes the listed test.</li></ol></div>}
          {badge.id === "files" && <div className="download-callout"><div><strong>Before you start the file badge</strong><p>Download the supplied text files and keep them in the same folder as your Python program.</p></div><a href={`${PUBLIC_BASE_PATH}/python-bridge-practice-files.zip`} download>Download practice files</a></div>}
        </section>}

        {badge.id === "problem-solver" && <section className="resource-section"><div className="download-callout"><div><strong>Files for this capstone</strong><p>Download names.txt and tournament_scores.txt. Keep both files in the same folder as your Python program.</p></div><a href={`${PUBLIC_BASE_PATH}/python-bridge-practice-files.zip`} download>Download capstone files</a></div></section>}
        {badge.id === "advanced-as" && <section className="resource-section"><div className="download-callout"><div><strong>Files for the three advanced programs</strong><p>Download once, then use only the file named in the current challenge. Do not edit the supplied test files.</p></div><a href={`${PUBLIC_BASE_PATH}/python-bridge-practice-files.zip`} download>Download advanced files</a></div></section>}

        <section className="level-section" id="current-challenge">
          <div className="level-tabs" role="tablist" aria-label="Challenge level">
            {badge.levels.map((item, index) => {
              const done = countComplete(progress, taskKeys(badge, item));
              const tabId = `level-tab-${badge.id}-${item.id}`;
              return <button type="button" role="tab" id={tabId} aria-controls={`level-panel-${badge.id}-${item.id}`} aria-selected={index === levelIndex} tabIndex={index === levelIndex ? 0 : -1} className={index === levelIndex ? "selected" : ""} onClick={() => onSelectLevel(index)} onKeyDown={(event) => { let next = index; if (event.key === "ArrowRight") next = (index + 1) % badge.levels.length; else if (event.key === "ArrowLeft") next = (index - 1 + badge.levels.length) % badge.levels.length; else if (event.key === "Home") next = 0; else if (event.key === "End") next = badge.levels.length - 1; else return; event.preventDefault(); onSelectLevel(next); window.requestAnimationFrame(() => document.getElementById(`level-tab-${badge.id}-${badge.levels[next].id}`)?.focus()); }} key={item.id}><span>{item.id}</span><strong>{item.label.split(" · ")[1]}</strong><small>{index === levelIndex ? "Current · " : ""}{done} / 3 complete</small></button>;
            })}
          </div>

          <article className={`mission-card ${level.id}`} role="tabpanel" id={`level-panel-${badge.id}-${level.id}`} aria-labelledby={`level-tab-${badge.id}-${level.id}`} tabIndex={0}>
            <div className="mission-head"><div><p>{level.label}</p><h2>{level.scenario}</h2><span>{level.support}</span></div><ProgressBar value={levelDone} max={3} label="This level" /></div>
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
              <div className="subheading"><div><p className="eyebrow dark">Build</p><h3 id="tasks-heading">Three checked tasks</h3></div><p>Tick a task only after the relevant code runs and passes its test.</p></div>
              {level.tasks.map((task, index) => {
                const key = taskKey(badge, level, index);
                return (
                  <label className={`task-row ${progress[key] ? "done" : ""}`} key={key}>
                    <input type="checkbox" checked={!!progress[key]} onChange={() => onToggleTask(key)} />
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

            {levelDone === 3 && <div className={`credential-earned ${level.id}`}><AchievementMedal badge={badge} tier={level.id} compact /><div><strong>{level.id === "bronze" ? "Bronze" : level.id === "silver" ? "Silver" : "Gold"} level earned</strong><p>Added to your badge collection. Your working Python file is the evidence.</p></div><button type="button" onClick={onShowBadges}>View my badges</button></div>}

            <div className="mission-actions">
              {levelIndex > 0 && <button type="button" onClick={() => onSelectLevel(levelIndex - 1)}>← Previous level</button>}
              {levelIndex < badge.levels.length - 1 && <button className="primary-small" type="button" onClick={() => { onSelectLevel(levelIndex + 1); window.scrollTo({ top: 520, behavior: "smooth" }); }}>Next challenge level →</button>}
              {levelIndex === badge.levels.length - 1 && nextBadge && <button className="primary-small" type="button" onClick={() => onOpenBadge(nextBadge.id, firstIncompleteLevelIndex(progress, nextBadge))}>Next badge: {nextBadge.title} →</button>}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
