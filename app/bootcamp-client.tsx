"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { BADGES, TOTAL_TASKS, type Badge, type ChallengeLevel } from "./course-data";
import { KEYWORDS } from "./keyword-data";

const STORAGE_KEY = "python-bridge-progress-v1";
const LAST_BADGE_KEY = "python-bridge-last-badge-v1";
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

const CORE_BADGES = BADGES.filter((badge) => !badge.optional);
const CORE_TASK_KEYS = CORE_BADGES.flatMap((badge) => taskKeys(badge));

function CodeBlock({ label, value, copyLabel = "Copy code" }: { label: string; value: string; copyLabel?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <section className="code-panel">
      <div className="code-head"><span>{label}</span><button type="button" onClick={copy}>{copied ? "Copied" : copyLabel}</button></div>
      <pre><code>{value}</code></pre>
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
  const [ready, setReady] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        setProgress(saved);
      } catch {
        setProgress({});
      }
      setLastBadgeId(localStorage.getItem(LAST_BADGE_KEY));
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

  const resumeBadge = useMemo(() => {
    const found = BADGES.find((badge) => badge.id === lastBadgeId);
    if (found) return found;
    return CORE_BADGES.find((badge) => countComplete(progress, taskKeys(badge)) < taskKeys(badge).length)
      || BADGES.find((badge) => badge.optional && countComplete(progress, taskKeys(badge)) < taskKeys(badge).length)
      || BADGES[0];
  }, [progress, lastBadgeId]);

  function openBadge(id: string, level = 0) {
    setSelectedBadgeId(id);
    setSelectedLevel(level);
    localStorage.setItem(LAST_BADGE_KEY, id);
    setLastBadgeId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function returnHome() {
    setSelectedBadgeId(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleTask(key: string) {
    setProgress((current) => ({ ...current, [key]: !current[key] }));
  }

  function downloadProgress() {
    const report = {
      format: "python-bridge-progress",
      version: 2,
      course: "Python Bootcamp · Year 12",
      savedAt: new Date().toISOString(),
      lastBadgeId,
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
      setLastBadgeId(restoredLastBadge);
      if (restoredLastBadge) localStorage.setItem(LAST_BADGE_KEY, restoredLastBadge);
      else localStorage.removeItem(LAST_BADGE_KEY);
      setReportMessage("Progress restored. You can continue from your saved work.");
    } catch {
      setReportMessage("That file is not a valid Python Bridge progress report. Choose the report downloaded from this site.");
    }
  }

  function resetProgress() {
    if (window.confirm("Clear every completed task on this device? Your Python files will not be affected.")) {
      setProgress({});
      localStorage.removeItem(LAST_BADGE_KEY);
      setLastBadgeId(null);
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
        <div className="header-actions">
          <div className="header-progress">
            <span>{completeBadges} of {CORE_BADGES.length} core badges</span>
            <div><i style={{ width: `${Math.round((completeTasks / TOTAL_TASKS) * 100)}%` }} /></div>
          </div>
          <button className="quiet-button" type="button" onClick={downloadProgress}>Save report</button>
          <label className="quiet-button file-button">Upload report<input type="file" accept=".json,application/json" onChange={uploadProgress} /></label>
        </div>
      </header>
      {reportMessage && <div className="report-message" role="status">{reportMessage}</div>}

      {selectedBadge && currentLevel ? (
        <BadgeView
          badge={selectedBadge}
          level={currentLevel}
          levelIndex={selectedLevel}
          progress={progress}
          onBack={returnHome}
          onSelectLevel={setSelectedLevel}
          onToggleTask={toggleTask}
          onOpenBadge={openBadge}
        />
      ) : (
        <Dashboard
          progress={progress}
          completeTasks={completeTasks}
          completeBadges={completeBadges}
          resumeBadge={resumeBadge}
          onOpenBadge={openBadge}
          onDownload={downloadProgress}
          onUpload={uploadProgress}
          onReset={resetProgress}
        />
      )}
    </main>
  );
}

function Dashboard({ progress, completeTasks, completeBadges, resumeBadge, onOpenBadge, onDownload, onUpload, onReset }: {
  progress: Progress;
  completeTasks: number;
  completeBadges: number;
  resumeBadge: Badge;
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
          <button className="primary-button" type="button" onClick={() => onOpenBadge(resumeBadge.id)}>
            {completeTasks === 0 ? "Start with Python Starter" : `Continue: ${resumeBadge.title}`} <span>→</span>
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

      <section className="roadmap" aria-labelledby="roadmap-title">
        <div className="section-heading">
          <div><p className="eyebrow dark">Your pathway</p><h2 id="roadmap-title">Ten core badges, plus one optional advanced pathway.</h2></div>
          <div className="dashboard-progress"><ProgressBar value={completeTasks} max={TOTAL_TASKS} label="Core tasks complete" /><p>{completeBadges} complete core badges. Badge 11 is only for students who feel secure with all the core content.</p></div>
        </div>
        <div className="badge-grid">
          {BADGES.map((badge) => {
            const total = taskKeys(badge).length;
            const done = countComplete(progress, taskKeys(badge));
            const isComplete = done === total;
            return (
              <article role="button" tabIndex={0} className={`badge-card ${badge.optional ? "optional" : ""} ${done > 0 ? "active" : ""} ${isComplete ? "complete" : ""}`} onClick={() => onOpenBadge(badge.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpenBadge(badge.id); } }} key={badge.id} aria-label={`${done > 0 ? "Continue" : "Open"} ${badge.title}`}>
                <div className="badge-card-top"><div className="badge-number">{badge.number}</div><span className="status">{badge.optional && done === 0 ? "Optional · Advanced" : isComplete ? "Gold earned" : done > 0 ? "In progress" : "Ready"}</span></div>
                <h3>{badge.title}</h3><p>{badge.short}</p>
                <div className="mini-progress"><i style={{ width: `${Math.round((done / total) * 100)}%` }} /></div>
                <div className="badge-meta"><span>{done} / {total} tasks</span>{badge.optional && <span>Does not affect core progress</span>}</div>
                <div className="levels">
                  {badge.levels.map((level) => {
                    const levelDone = countComplete(progress, taskKeys(badge, level));
                    return <span className={levelDone === 3 ? "earned" : ""} key={level.id}>{level.id === "bronze" ? "Bronze" : level.id === "silver" ? "Silver" : "Gold"} {levelDone}/3</span>;
                  })}
                </div>
                <span className="card-button">{done > 0 ? "Continue badge" : "Open badge"} <span>→</span></span>
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

function BadgeView({ badge, level, levelIndex, progress, onBack, onSelectLevel, onToggleTask, onOpenBadge }: {
  badge: Badge;
  level: ChallengeLevel;
  levelIndex: number;
  progress: Progress;
  onBack: () => void;
  onSelectLevel: (index: number) => void;
  onToggleTask: (key: string) => void;
  onOpenBadge: (id: string, level?: number) => void;
}) {
  const levelDone = countComplete(progress, taskKeys(badge, level));
  const badgeDone = countComplete(progress, taskKeys(badge));
  const nextBadge = BADGES[BADGES.findIndex((item) => item.id === badge.id) + 1];
  const keywords = KEYWORDS[badge.id] || [];

  return (
    <div className="badge-view">
      <aside className="course-nav">
        <button className="back-link" type="button" onClick={onBack}>← Course pathway</button>
        <p className="nav-label">Badges</p>
        {BADGES.map((item) => {
          const done = countComplete(progress, taskKeys(item));
          return <button type="button" className={item.id === badge.id ? "selected" : ""} onClick={() => onOpenBadge(item.id)} key={item.id}><span>{item.number}</span><div>{item.title}<small>{done} / {taskKeys(item).length} tasks{item.optional ? " · optional" : ""}</small></div></button>;
        })}
      </aside>

      <div className="badge-main">
        <section className="badge-banner">
          <div><p className="eyebrow">Badge {badge.number} · {badge.credential}</p><h1>{badge.title}</h1><p>{badge.short}</p></div>
          <div className="badge-facts"><span><b>Before this</b>{badge.prerequisite}</span><span><b>Progress</b>{badgeDone} / {taskKeys(badge).length} tasks</span>{badge.optional && <span><b>Pathway</b>Optional advanced work</span>}</div>
        </section>

        <section className="keyword-section" aria-labelledby="keyword-title">
          <div><p className="eyebrow dark">Read these first</p><h2 id="keyword-title">Keywords for this badge</h2><p>These words will appear in the pseudocode, Python or task instructions.</p></div>
          <dl>{keywords.map((item) => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl>
        </section>

        <section className="concept-grid">
          <div className="learn-card"><h2>By the end, you can</h2><ul>{badge.learning.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div className="rules-card"><h2>Rules to keep beside you</h2><ol>{badge.rules.map((item, index) => <li key={item}><span>{index + 1}</span>{item}</li>)}</ol></div>
        </section>

        <section className="translation-section">
          <div className="section-heading compact"><div><p className="eyebrow dark">Translation bridge</p><h2>Same algorithm, different notation</h2></div><p>Read left to right. Do not memorise a Python line until you understand what it does.</p></div>
          <div className="code-bridge"><CodeBlock label="Cambridge pseudocode" value={badge.pseudoExample} /><b aria-hidden="true">→</b><CodeBlock label="Python equivalent" value={badge.pythonExample} /></div>
          {badge.id === "starter" && <div className="setup-callout"><strong>How to complete every task</strong><ol><li>Open the Python editor used in class.</li><li>Create a new file and save it before typing.</li><li>Type or adapt the supplied starting point.</li><li>Press Run and read the output area.</li><li>If an error appears, read the final line first and check the named line number.</li><li>Tick the task only when your own code passes the listed test.</li></ol></div>}
          {badge.id === "files" && <div className="download-callout"><div><strong>Before you start the file badge</strong><p>Download the supplied text files and keep them in the same folder as your Python program.</p></div><a href={`${PUBLIC_BASE_PATH}/python-bridge-practice-files.zip`} download>Download practice files</a></div>}
          {badge.id === "problem-solver" && <div className="download-callout"><div><strong>Before you start the final problem</strong><p>Download names.txt and tournament_scores.txt. Keep both files in the same folder as your Python program.</p></div><a href={`${PUBLIC_BASE_PATH}/python-bridge-practice-files.zip`} download>Download capstone files</a></div>}
          {badge.id === "advanced-as" && <div className="download-callout"><div><strong>Read this before Advanced 1</strong><p>These are three separate programs. Complete them in order. Download the supplied files once, then use only the file named in the current challenge. Do not edit the supplied test files.</p></div><a href={`${PUBLIC_BASE_PATH}/python-bridge-practice-files.zip`} download>Download advanced files</a></div>}
        </section>

        <section className="level-section">
          <div className="level-tabs" role="tablist" aria-label="Challenge level">
            {badge.levels.map((item, index) => {
              const done = countComplete(progress, taskKeys(badge, item));
              return <button type="button" role="tab" aria-selected={index === levelIndex} className={index === levelIndex ? "selected" : ""} onClick={() => onSelectLevel(index)} key={item.id}><span>{item.id}</span><strong>{item.label.split(" · ")[1]}</strong><small>{done} / 3 complete</small></button>;
            })}
          </div>

          <article className={`mission-card ${level.id}`}>
            <div className="mission-head"><div><p>{level.label}</p><h2>{level.scenario}</h2><span>{level.support}</span></div><ProgressBar value={levelDone} max={3} label="This level" /></div>
            <div className="outcome"><strong>Finished outcome</strong><p>{level.outcome}</p></div>

            {level.setup && level.deliverables && (
              <section className="clarity-grid" aria-label="Challenge setup and completion checklist">
                <article><p className="eyebrow dark">Before you type any code</p><h3>Set up exactly like this</h3><ol>{level.setup.map((item) => <li key={item}>{item}</li>)}</ol></article>
                <article><p className="eyebrow dark">Definition of finished</p><h3>Keep these files</h3><ul>{level.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></article>
              </section>
            )}

            {level.expectedOutput && <CodeBlock label="Known-good output using the supplied test file" value={level.expectedOutput} copyLabel="Copy expected output" />}

            <div className="work-order"><span>Work in this order</span><ol><li>Read the pseudocode.</li><li>Try the first line yourself.</li><li>Reveal the starter only if you need a scaffold.</li><li>Complete and test one task at a time.</li><li>Use the model only after your own attempt.</li></ol></div>

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

            <CodeBlock label={badge.id === "problem-solver" || badge.id === "advanced-as" ? "Cambridge pseudocode for this stage" : "Pseudocode / design supplied"} value={level.pseudocode} copyLabel="Copy pseudocode" />
            <details className="starter-box"><summary>Need a scaffold? Reveal the Python starting point</summary><div className="starter-warning">Try to translate at least the first line from the pseudocode before opening this. The starting point is incomplete: you still need to make the decisions and write the missing logic.</div><CodeBlock label="Incomplete Python starting point" value={level.pythonStarter} /></details>

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
              <details className="hint-box"><summary>Stuck? Reveal hints one at a time</summary><ol>{level.hints.map((hint) => <li key={hint}>{hint}</li>)}</ol></details>
              <details className="model-box"><summary>Compare with the model Python answer</summary><div className="model-warning">Use this after you have run and tested your own attempt. A different working solution can still be correct.</div><CodeBlock label="Model Python" value={level.model} /><h4>Why this works</h4><ul>{level.modelNotes.map((note) => <li key={note}>{note}</li>)}</ul></details>
            </div>

            {levelDone === 3 && <div className="credential-earned"><span>✓</span><div><strong>{level.id === "bronze" ? "Bronze" : level.id === "silver" ? "Silver" : "Gold"} level complete</strong><p>Your working Python file is the evidence. Keep it with your progress report.</p></div></div>}

            <div className="mission-actions">
              {levelIndex > 0 && <button type="button" onClick={() => onSelectLevel(levelIndex - 1)}>← Previous level</button>}
              {levelIndex < badge.levels.length - 1 && <button className="primary-small" type="button" onClick={() => { onSelectLevel(levelIndex + 1); window.scrollTo({ top: 520, behavior: "smooth" }); }}>Next challenge level →</button>}
              {levelIndex === badge.levels.length - 1 && nextBadge && <button className="primary-small" type="button" onClick={() => onOpenBadge(nextBadge.id)}>Next badge: {nextBadge.title} →</button>}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
