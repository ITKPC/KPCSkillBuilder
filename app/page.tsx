"use client";

import { useMemo, useState } from "react";
import { agilityDrills } from "./agility-drills";
import { consistencyDrills } from "./consistency-drills";
import { defenseDrills } from "./defense-drills";
import { offenseDrills } from "./offense-drills";
import { returnDrills, serveDrills, type Drill } from "./drill-library";
import DrillCard from "./components/DrillCard";
import { explainRecommendation, recommendDrills } from "./recommendation-engine";
import styles from "./custom-plan.module.css";

const skills = [
  { key: "serve", label: "Serve", symbol: "S" },
  { key: "return", label: "Return", symbol: "R" },
  { key: "offense", label: "Offense", symbol: "O" },
  { key: "defense", label: "Defense", symbol: "D" },
  { key: "agility", label: "Agility", symbol: "A" },
  { key: "consistency", label: "Consistency", symbol: "C" },
] as const;

type SkillKey = (typeof skills)[number]["key"];
type Scores = Record<SkillKey, number>;
type PlayStyle = "social" | "competitive";
type Screen = "home" | "pbvision" | "assessment" | "choose" | "style" | "session" | "customstyle" | "customdrills" | "results";
type Source = "PB Vision" | "self-assessment" | "chosen focus" | "custom plan";
type DrillCount = 2 | 4 | 6;
type LevelFilter = "all" | Drill["level"];
type PracticeFilter = "either" | "solo" | "partner";
type ImageLine = { text: string; size: number; weight: number; gap: number; color?: string };

const sessionOptions: { name: string; drillCount: DrillCount; minutes: number }[] = [
  { name: "Quick Rally", drillCount: 2, minutes: 20 },
  { name: "Game On", drillCount: 4, minutes: 40 },
  { name: "All In", drillCount: 6, minutes: 60 },
];

const initialScores: Scores = { serve: 3, return: 3, offense: 3, defense: 3, agility: 3, consistency: 3 };

const assessmentStatements: Record<SkillKey, string> = {
  serve: "My serves land deep, stay in play and make the return more difficult.",
  return: "My returns usually land deep and give me time to reach the kitchen.",
  offense: "I recognize attackable balls and can finish without forcing the shot.",
  defense: "Under pressure, I can soften the ball, reset and regain my position.",
  agility: "I move early, arrive balanced and recover efficiently after each shot.",
  consistency: "I choose repeatable shots and limit unforced errors during rallies.",
};

const answerChoices = [
  { label: "Not yet", value: 2.25 },
  { label: "Sometimes", value: 2.75 },
  { label: "Usually", value: 3.5 },
  { label: "Consistently", value: 4.25 },
];

const drillLibrary: Record<SkillKey, Drill[]> = {
  serve: serveDrills,
  return: returnDrills,
  offense: offenseDrills,
  defense: defenseDrills,
  agility: agilityDrills,
  consistency: consistencyDrills,
};

const allDrillChoices = skills.flatMap((skill) =>
  drillLibrary[skill.key].map((drill, drillIndex) => ({ id: `${skill.key}-${drillIndex}`, skill, drill })),
);

const levelLabel = { foundation: "Foundation", developing: "Developing", advanced: "Advanced" } as const;

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const test = current ? `${current} ${word}` : word;
    if (context.measureText(test).width <= maxWidth || !current) current = test;
    else { lines.push(current); current = word; }
  });
  if (current) lines.push(current);
  return lines;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [style, setStyle] = useState<PlayStyle>("social");
  const [scores, setScores] = useState<Scores>(initialScores);
  const [assessment, setAssessment] = useState<Partial<Scores>>({});
  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [source, setSource] = useState<Source>("self-assessment");
  const [chosenFocus, setChosenFocus] = useState<SkillKey[]>([]);
  const [drillCount, setDrillCount] = useState<DrillCount>(4);
  const [customDrills, setCustomDrills] = useState<string[]>([]);
  const [skillFilter, setSkillFilter] = useState<"all" | SkillKey>("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [practiceFilter, setPracticeFilter] = useState<PracticeFilter>("either");
  const [searchText, setSearchText] = useState("");
  const [sharingPlan, setSharingPlan] = useState(false);

  const rankedSkills = useMemo(() => [...skills].sort((a, b) => scores[a.key] - scores[b.key]), [scores]);
  const customPlanDrills = allDrillChoices.filter((choice) => customDrills.includes(choice.id));
  const normalizedSearch = searchText.trim().toLowerCase();
  const filteredDrillChoices = allDrillChoices.filter((choice) => {
    const skillMatches = skillFilter === "all" || choice.skill.key === skillFilter;
    const levelMatches = levelFilter === "all" || choice.drill.level === levelFilter;
    const searchMatches = !normalizedSearch || `${choice.drill.name} ${choice.drill.purpose} ${choice.drill.setup}`.toLowerCase().includes(normalizedSearch);
    return skillMatches && levelMatches && searchMatches;
  });
  const visibleSkills = skills.filter((skill) => skillFilter === "all" ? filteredDrillChoices.some((choice) => choice.skill.key === skill.key) : skill.key === skillFilter);
  const filtersActive = skillFilter !== "all" || levelFilter !== "all" || practiceFilter !== "either" || Boolean(normalizedSearch);
  const selectedMinutes = customDrills.length * 10;

  const priorities = source === "custom plan"
    ? skills.filter((skill) => customPlanDrills.some((choice) => choice.skill.key === skill.key))
    : source === "chosen focus"
      ? chosenFocus.slice(0, drillCount / 2).map((key) => skills.find((skill) => skill.key === key)!).filter(Boolean)
      : rankedSkills.slice(0, drillCount / 2);
  const session = sessionOptions.find((option) => option.drillCount === drillCount)!;
  const planDrillCount = source === "custom plan" ? customPlanDrills.length : drillCount;
  const planMinutes = source === "custom plan" ? selectedMinutes : session.minutes;
  const sessionName = source === "custom plan" ? "Build Your Own" : session.name;
  const planGroups = priorities.map((priority) => {
    const score = scores[priority.key];
    return {
      priority,
      explanation: source === "custom plan" ? null : explainRecommendation(priority.label, score, source, style),
      drills: source === "custom plan"
        ? customPlanDrills.filter((choice) => choice.skill.key === priority.key).map((choice) => choice.drill)
        : recommendDrills(drillLibrary[priority.key], score, 2, style),
    };
  });
  const focusLabels = priorities.map((priority) => priority.label);
  const focusTitle = focusLabels.length <= 1 ? `Focus on ${focusLabels[0] ?? "your selected skills"}` : `Focus on ${focusLabels.slice(0, -1).join(", ")}, then ${focusLabels.at(-1)}`;

  const clearFilters = () => { setSkillFilter("all"); setLevelFilter("all"); setPracticeFilter("either"); setSearchText(""); };
  const removeCustomDrill = (id: string) => setCustomDrills((current) => current.filter((item) => item !== id));
  const updateScore = (key: SkillKey, value: number) => {
    const rounded = Math.round(value * 10) / 10;
    const validValue = Math.min(5.5, Math.max(2, rounded));
    setScores((current) => ({ ...current, [key]: validValue }));
  };
  const startOver = () => {
    setScreen("home"); setScores(initialScores); setAssessment({}); setAssessmentIndex(0); setStyle("social");
    setChosenFocus([]); setDrillCount(4); setCustomDrills([]); clearFilters();
  };
  const toggleFocus = (key: SkillKey) => setChosenFocus((current) => current.includes(key) ? current.filter((item) => item !== key) : current.length < 3 ? [...current, key] : current);
  const chooseAssessmentAnswer = (value: number) => {
    const key = skills[assessmentIndex].key;
    const next = { ...assessment, [key]: value };
    setAssessment(next);
    if (assessmentIndex < skills.length - 1) setAssessmentIndex(assessmentIndex + 1);
    else { setScores(next as Scores); setSource("self-assessment"); setScreen("style"); }
  };

  const shareFullPlan = async () => {
    setSharingPlan(true);
    try {
      const width = 1400;
      const margin = 80;
      const maxWidth = width - margin * 2;
      const measureCanvas = document.createElement("canvas");
      const measure = measureCanvas.getContext("2d");
      if (!measure) return;
      const lines: ImageLine[] = [];
      const add = (text: string, size = 30, weight = 400, gap = 12, color = "#061747") => {
        measure.font = `${weight} ${size}px Arial`;
        wrapText(measure, text, maxWidth).forEach((part, index, wrapped) => lines.push({ text: part, size, weight, gap: index === wrapped.length - 1 ? gap : 2, color }));
      };
      add("KPC SKILL BUILDER", 24, 800, 18, "#0877cf");
      add(focusTitle, 54, 800, 18);
      add(`${sessionName} · ${planDrillCount} ${planDrillCount === 1 ? "drill" : "drills"} · about ${planMinutes} minutes · ${style === "social" ? "Social" : "Competitive / Advanced"}`, 28, 700, 34, "#52617b");
      planGroups.forEach(({ priority, explanation, drills }, priorityIndex) => {
        add(`PRIORITY ${priorityIndex + 1}: ${priority.label}`, 34, 800, 14, "#5d9c22");
        if (explanation) { add("Why these drills", 25, 800, 5); add(explanation, 27, 400, 22, "#23375e"); }
        drills.forEach((drill, drillIndex) => {
          add(`${priorityIndex + 1}.${drillIndex + 1}  ${drill.name}`, 36, 800, 5);
          add(`${levelLabel[drill.level]} · ${drill.purpose}`, 25, 700, 16, "#0877cf");
          add("SET UP", 22, 800, 4, "#5d9c22"); add(drill.setup, 27, 400, 12);
          add("HOW TO DO IT", 22, 800, 4, "#5d9c22");
          drill.steps.forEach((step, index) => add(`${index + 1}. ${step}`, 27, 400, 7));
          add("YOUR TARGET", 22, 800, 4, "#5d9c22"); add(style === "social" ? drill.socialTarget : drill.competitiveTarget, 27, 400, 12);
          if (style === "competitive" && drill.advancedVariation) { add("ADVANCED VARIATION", 22, 800, 4, "#5d9c22"); add(drill.advancedVariation, 27, 400, 12); }
          add("SOLO", 22, 800, 4, "#5d9c22"); add(drill.solo, 27, 400, 10);
          add("WITH A PARTNER", 22, 800, 4, "#5d9c22"); add(drill.partner, 27, 400, 28);
        });
      });
      add("Created with KPC Skill Builder · Kamloops Pickleball Club", 23, 700, 0, "#52617b");
      const height = Math.max(900, margin * 2 + lines.reduce((total, line) => total + Math.ceil(line.size * 1.35) + line.gap, 0));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.fillStyle = "#01aef0";
      context.fillRect(0, 0, 24, height);
      let y = margin;
      lines.forEach((line) => {
        context.font = `${line.weight} ${line.size}px Arial`;
        context.fillStyle = line.color ?? "#061747";
        context.textBaseline = "top";
        context.fillText(line.text, margin, y);
        y += Math.ceil(line.size * 1.35) + line.gap;
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.96));
      if (!blob) return;
      const file = new File([blob], "kpc-full-practice-plan.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: "My KPC Practice Plan", text: "My complete KPC Skill Builder practice plan.", files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) console.error("Unable to share plan", error);
    } finally {
      setSharingPlan(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={startOver} aria-label="KPC Skill Builder home"><span className="brand-logo" role="img" aria-label="Kamloops Pickleball Club" /><span className="brand-divider" /><span className="brand-name">KPC Skill Builder</span></button>
        {screen !== "home" && <button className="text-button" onClick={startOver}>Start over</button>}
      </header>

      {screen === "home" && <section className="hero court-bg"><div className="hero-content"><p className="eyebrow">Your game. Your next step.</p><h1>Build the part of your game that matters most</h1><p className="hero-copy">A Player Development tool created by the Kamloops Pickleball Club to help players build a focused, achievable and enjoyable practice plan.</p><div className="start-grid">
        <button className="start-card start-card-primary" onClick={() => setScreen("pbvision")}><span className="start-number">01</span><span className="start-title">I have PB Vision scores</span><span className="start-description">Enter your six skill scores</span></button>
        <button className="start-card start-card-secondary" onClick={() => setScreen("assessment")}><span className="start-number">02</span><span className="start-title">Help me assess my skills</span><span className="start-description">Answer six quick questions</span></button>
        <button className="start-card start-card-tertiary" onClick={() => setScreen("choose")}><span className="start-number">03</span><span className="start-title">I know what I want to improve</span><span className="start-description">Choose up to three focus areas</span></button>
        <button className="start-card start-card-quaternary" onClick={() => { setSource("custom plan"); setCustomDrills([]); clearFilters(); setScreen("customstyle"); }}><span className="start-number">04</span><span className="start-title">Build my own plan</span><span className="start-description">Choose from all available drills</span></button>
      </div></div></section>}

      {screen === "pbvision" && <section className="flow-screen"><div className="flow-card score-entry-card"><button className="back-button" onClick={() => setScreen("home")}>← Back</button><h1>Enter your PB Vision scores</h1><p className="flow-intro">Select or adjust each PB Vision score. Scores must be between 2.0 and 5.5.</p><div className="score-grid">{skills.map((skill) => <label className="score-field" key={skill.key}><span className="score-label"><b>{skill.label}</b><input type="number" min="2" max="5.5" step="0.1" inputMode="decimal" aria-label={`${skill.label} PB Vision score`} value={scores[skill.key].toFixed(1)} onChange={(event) => { const value = Number(event.target.value); if (Number.isFinite(value)) updateScore(skill.key, value); }} /></span><input type="range" min="2" max="5.5" step="0.1" value={scores[skill.key]} onChange={(event) => updateScore(skill.key, Number(event.target.value))} /></label>)}</div><button className="primary-button" onClick={() => { setSource("PB Vision"); setScreen("style"); }}>Continue</button></div></section>}

      {screen === "assessment" && <section className="flow-screen"><div className="flow-card assessment-card"><button className="back-button" onClick={() => assessmentIndex === 0 ? setScreen("home") : setAssessmentIndex(assessmentIndex - 1)}>← Back</button><p className="eyebrow">Question {assessmentIndex + 1} of 6</p><h1>{assessmentStatements[skills[assessmentIndex].key]}</h1><div className="answer-grid">{answerChoices.map((answer) => <button key={answer.label} className="answer-button" onClick={() => chooseAssessmentAnswer(answer.value)}>{answer.label}</button>)}</div></div></section>}

      {screen === "choose" && <section className="flow-screen"><div className="flow-card choose-card"><button className="back-button" onClick={() => setScreen("home")}>← Back</button><h1>What would you like to improve?</h1><div className="focus-choice-grid">{skills.map((skill) => <button key={skill.key} className={chosenFocus.includes(skill.key) ? "focus-choice selected" : "focus-choice"} onClick={() => toggleFocus(skill.key)}><span>{skill.symbol}</span><b>{skill.label}</b></button>)}</div><button className="primary-button" disabled={!chosenFocus.length} onClick={() => { setSource("chosen focus"); setScreen("style"); }}>Continue</button></div></section>}

      {(screen === "style" || screen === "customstyle") && <section className="flow-screen"><div className="flow-card style-card"><button className="back-button" onClick={() => setScreen(screen === "customstyle" ? "home" : source === "PB Vision" ? "pbvision" : source === "chosen focus" ? "choose" : "assessment")}>← Back</button><h1>How do you want to practise?</h1><div className="style-choice-grid"><button className={style === "social" ? "style-choice selected" : "style-choice"} onClick={() => setStyle("social")}><b>Social</b><span>Confidence, consistency and longer rallies.</span></button><button className={style === "competitive" ? "style-choice selected" : "style-choice"} onClick={() => setStyle("competitive")}><b>Competitive / Advanced</b><span>Pressure, tactics and advanced variations.</span></button></div><button className="primary-button" onClick={() => setScreen(screen === "customstyle" ? "customdrills" : "session")}>{screen === "customstyle" ? "Choose my drills" : "Choose my session length"}</button></div></section>}

      {screen === "session" && <section className="flow-screen"><div className="flow-card session-card"><button className="back-button" onClick={() => setScreen("style")}>← Back</button><h1>How much time do you have today?</h1><div className="session-choice-grid">{sessionOptions.map((option) => <button className="session-choice" key={option.name} onClick={() => { setDrillCount(option.drillCount); setScreen("results"); }}><span>{option.minutes} min</span><b>{option.name}</b><em>{option.drillCount} drills</em></button>)}</div></div></section>}

      {screen === "customdrills" && <section className="flow-screen custom-drills-screen"><div className="flow-card custom-drills-card"><button className="back-button" onClick={() => setScreen("customstyle")}>← Back</button><p className="eyebrow">Build your own plan · {style === "social" ? "Social" : "Competitive / Advanced"}</p><h1>Pick the drills you want</h1><p className="flow-intro">Use the filters to narrow the 36-drill library. Each drill takes about 10 minutes.</p>
        <section className={styles.filterPanel} aria-label="Filter drills">
          <div className={styles.filterHeading}><div><b>Filter drills</b><span>{filteredDrillChoices.length} of {allDrillChoices.length} shown</span></div>{filtersActive && <button type="button" onClick={clearFilters}>Clear filters</button>}</div>
          <div className={styles.filterGrid}>
            <label><span>Skill</span><select value={skillFilter} onChange={(event) => setSkillFilter(event.target.value as "all" | SkillKey)}><option value="all">All skills</option>{skills.map((skill) => <option key={skill.key} value={skill.key}>{skill.label}</option>)}</select></label>
            <label><span>Level</span><select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value as LevelFilter)}><option value="all">All levels</option><option value="foundation">Foundation</option><option value="developing">Developing</option><option value="advanced">Advanced</option></select></label>
            <label><span>Practice format</span><select value={practiceFilter} onChange={(event) => setPracticeFilter(event.target.value as PracticeFilter)}><option value="either">Solo or partner</option><option value="solo">Show solo instructions</option><option value="partner">Show partner instructions</option></select></label>
            <label className={styles.searchField}><span>Search</span><input type="search" value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search reset, movement, dink…" /></label>
          </div>
        </section>

        {visibleSkills.length ? <div className="custom-drill-groups">{visibleSkills.map((skill) => { const skillChoices = filteredDrillChoices.filter((choice) => choice.skill.key === skill.key); return <section className="custom-drill-group" key={skill.key}><div className="custom-group-heading"><span>{skill.symbol}</span><h2>{skill.label}</h2><em>{skillChoices.length === drillLibrary[skill.key].length ? `${skillChoices.length} drills` : `${skillChoices.length} of ${drillLibrary[skill.key].length}`}</em></div><div className="custom-drill-grid">{skillChoices.map((choice) => { const selected = customDrills.includes(choice.id); const practiceCopy = practiceFilter === "solo" ? choice.drill.solo : practiceFilter === "partner" ? choice.drill.partner : null; return <button className={selected ? "custom-drill-choice selected" : "custom-drill-choice"} key={choice.id} onClick={() => setCustomDrills((current) => current.includes(choice.id) ? current.filter((id) => id !== choice.id) : [...current, choice.id])}><span className="custom-check">{selected ? "✓" : "+"}</span><span className={`custom-drill-area level-${choice.drill.level}`}>{levelLabel[choice.drill.level]} · {skill.label}</span><b>{choice.drill.name}</b><span>{choice.drill.purpose}</span><span className={styles.cardBadges}><small>10 min</small><small>{practiceFilter === "solo" ? "Solo" : practiceFilter === "partner" ? "Partner" : "Solo + partner"}</small></span>{practiceCopy && <span className={styles.practicePreview}>{practiceCopy}</span>}{style === "competitive" && choice.drill.advancedVariation && <em>Includes an advanced variation</em>}</button>; })}</div></section>; })}</div> : <div className={styles.emptyState}><b>No drills match those filters.</b><span>Try clearing one of the filters or using a broader search.</span><button type="button" onClick={clearFilters}>Show all drills</button></div>}

        <section className={styles.selectedPanel} aria-label="Selected drills"><div className={styles.selectedHeader}><div><b>Your practice</b><span>{customDrills.length ? `${customDrills.length} ${customDrills.length === 1 ? "drill" : "drills"} · about ${selectedMinutes} minutes` : "No drills selected yet"}</span></div>{customDrills.length > 0 && <button type="button" onClick={() => setCustomDrills([])}>Clear selections</button>}</div>{customPlanDrills.length > 0 && <div className={styles.selectedList}>{customPlanDrills.map((choice) => <div key={choice.id}><span><small>{choice.skill.label}</small><b>{choice.drill.name}</b></span><button type="button" onClick={() => removeCustomDrill(choice.id)} aria-label={`Remove ${choice.drill.name}`}>×</button></div>)}</div>}</section>

        <div className="custom-plan-footer"><div><b>{customDrills.length} {customDrills.length === 1 ? "drill" : "drills"} selected</b><span>{customDrills.length ? `About ${selectedMinutes} minutes` : "Choose at least one drill"}</span></div><button className="primary-button" disabled={!customDrills.length} onClick={() => setScreen("results")}>{customDrills.length ? `Build ${selectedMinutes}-Minute Practice` : "Build my practice"}</button></div>
      </div></section>}

      {screen === "results" && <section className="results-screen"><div className="results-hero court-bg"><div><p className="eyebrow">Your KPC development profile</p><h1>{focusTitle}</h1><p>Your {sessionName} session includes {planDrillCount} {planDrillCount === 1 ? "drill" : "drills"} and takes about {planMinutes} minutes.</p></div><div className="results-actions"><button className="primary-button" onClick={shareFullPlan} disabled={sharingPlan}>{sharingPlan ? "Preparing full plan…" : "Share full plan"}</button><button className="secondary-button" onClick={startOver}>Start again</button></div></div><div className="results-content"><section className="plan-section"><div className="priority-blocks">{planGroups.map(({ priority, explanation, drills }, priorityIndex) => <div className="priority-block" key={priority.key}><div className="priority-header"><span>Priority {priorityIndex + 1}</span><h3>{priority.label}</h3></div>{explanation && <div className="target-box"><dt>Why these drills?</dt><dd>{explanation}</dd></div>}<div className="drill-grid">{drills.map((drill, drillIndex) => <DrillCard key={`${priority.key}-${drill.name}`} drill={drill} drillNumber={`${priorityIndex + 1}.${drillIndex + 1}`} skillLabel={priority.label} style={style} levelLabel={levelLabel[drill.level]} />)}</div></div>)}</div></section></div></section>}
    </main>
  );
}
