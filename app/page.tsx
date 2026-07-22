"use client";

import { useMemo, useState } from "react";
import { offenseDrills } from "./offense-drills";
import { returnDrills, serveDrills, type Drill } from "./drill-library";

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

const legacyDrills: Record<"defense" | "agility" | "consistency", Drill[]> = {
  defense: [
    { name: "Reset and Breathe", level: "foundation", purpose: "Soften a hard ball into the kitchen and regain control.", setup: "Begin in the transition zone while a partner feeds from the kitchen.", steps: ["Use a compact block with a relaxed grip.", "Aim for the middle of the kitchen.", "Hold balance before moving forward."], socialTarget: "Land 6 of 10 resets in the kitchen.", competitiveTarget: "Land 7 of 10 resets from randomized feeds.", solo: "Absorb firm wall rebounds so the next bounce lands close to you.", partner: "Increase pace only after three successful resets." },
    { name: "Two-Step Recovery", level: "developing", purpose: "Defend, regain balance and move forward only when the ball permits.", setup: "Begin one step behind the kitchen while a partner applies controlled pressure.", steps: ["Block the first ball softly.", "Recover before taking a small step forward.", "Repeat until you reach the kitchen line."], socialTarget: "Reach the kitchen under control in 5 of 8 sequences.", competitiveTarget: "Reach the kitchen and neutralize 6 of 8 sequences.", solo: "Shadow block, recover and step movements.", partner: "Vary forehand and backhand pressure safely.", advancedVariation: "Randomize pace and direction while preserving a soft reset target." },
  ],
  agility: [
    { name: "Split-Step Path", level: "foundation", purpose: "Move early and arrive balanced instead of hitting while running.", setup: "Place markers at the baseline, transition zone and kitchen line.", steps: ["Move with short, controlled steps.", "Split-step at every marker.", "Keep your chest forward and avoid crossing your feet."], socialTarget: "Complete six smooth paths with balance.", competitiveTarget: "Complete eight paths while reacting to random direction calls.", solo: "Change direction after every split-step.", partner: "A partner points left or right at each marker." },
    { name: "Hit, Recover, Ready", level: "developing", purpose: "Return to a useful court position after every shot.", setup: "Place a home-base marker near the middle of your playing area.", steps: ["Move from home base to play the ball.", "Recover with small steps.", "Pause in ready position before the next feed."], socialTarget: "Complete 10 balanced repetitions.", competitiveTarget: "Complete 12 randomized repetitions without being late.", solo: "Use shadow swings at two side markers.", partner: "Feed alternating forehand, backhand and middle balls.", advancedVariation: "Add random short and deep feeds while preserving balance." },
  ],
  consistency: [
    { name: "Ten-Ball Rally", level: "foundation", purpose: "Build repeatable control before increasing difficulty.", setup: "Choose one shot and agree on a comfortable pace.", steps: ["Count every successful contact.", "Restart after an error.", "Add placement only after reaching ten."], socialTarget: "Complete three rallies of 10 controlled shots.", competitiveTarget: "Complete three rallies of 15, then finish to a target.", solo: "Use a wall and mark a safe rebound zone.", partner: "Cooperate until the target is reached." },
    { name: "High-Percentage Choice", level: "developing", purpose: "Choose the safer ball when under pressure.", setup: "Play half-court points and call safe or attack before contact.", steps: ["Choose safe below net height or when off balance.", "Attack only when balanced above net height.", "Review the choice rather than only the result."], socialTarget: "Make an appropriate choice on 8 of 10 balls.", competitiveTarget: "Make an appropriate choice on 9 of 10 balls.", solo: "Alternate low and high self-feeds.", partner: "Vary feed height and give immediate feedback.", advancedVariation: "Play scored half-court points with a bonus for correct decisions." },
  ],
};

const drillLibrary: Record<SkillKey, Drill[]> = {
  serve: serveDrills,
  return: returnDrills,
  offense: offenseDrills,
  defense: legacyDrills.defense,
  agility: legacyDrills.agility,
  consistency: legacyDrills.consistency,
};

const allDrillChoices = skills.flatMap((skill) =>
  drillLibrary[skill.key].map((drill, drillIndex) => ({ id: `${skill.key}-${drillIndex}`, skill, drill })),
);

const levelLabel = { foundation: "Foundation", developing: "Developing", advanced: "Advanced" } as const;

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

  const rankedSkills = useMemo(() => [...skills].sort((a, b) => scores[a.key] - scores[b.key]), [scores]);
  const customPlanDrills = allDrillChoices.filter((choice) => customDrills.includes(choice.id));
  const priorities = source === "custom plan"
    ? skills.filter((skill) => customPlanDrills.some((choice) => choice.skill.key === skill.key))
    : source === "chosen focus"
      ? chosenFocus.slice(0, drillCount / 2).map((key) => skills.find((skill) => skill.key === key)!).filter(Boolean)
      : rankedSkills.slice(0, drillCount / 2);
  const session = sessionOptions.find((option) => option.drillCount === drillCount)!;
  const planDrillCount = source === "custom plan" ? customPlanDrills.length : drillCount;
  const planMinutes = source === "custom plan" ? customPlanDrills.length * 10 : session.minutes;
  const sessionName = source === "custom plan" ? "Build Your Own" : session.name;
  const planGroups = priorities.map((priority) => ({
    priority,
    drills: source === "custom plan"
      ? customPlanDrills.filter((choice) => choice.skill.key === priority.key).map((choice) => choice.drill)
      : drillLibrary[priority.key].slice(0, 2),
  }));
  const focusLabels = priorities.map((priority) => priority.label);
  const focusTitle = focusLabels.length <= 1 ? `Focus on ${focusLabels[0] ?? "your selected skills"}` : `Focus on ${focusLabels.slice(0, -1).join(", ")}, then ${focusLabels.at(-1)}`;

  const startOver = () => { setScreen("home"); setScores(initialScores); setAssessment({}); setAssessmentIndex(0); setStyle("social"); setChosenFocus([]); setDrillCount(4); setCustomDrills([]); };
  const toggleFocus = (key: SkillKey) => setChosenFocus((current) => current.includes(key) ? current.filter((item) => item !== key) : current.length < 3 ? [...current, key] : current);
  const chooseAssessmentAnswer = (value: number) => {
    const key = skills[assessmentIndex].key;
    const next = { ...assessment, [key]: value };
    setAssessment(next);
    if (assessmentIndex < skills.length - 1) setAssessmentIndex(assessmentIndex + 1);
    else { setScores(next as Scores); setSource("self-assessment"); setScreen("style"); }
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
        <button className="start-card start-card-quaternary" onClick={() => { setSource("custom plan"); setCustomDrills([]); setScreen("customstyle"); }}><span className="start-number">04</span><span className="start-title">Build my own plan</span><span className="start-description">Choose from all available drills</span></button>
      </div></div></section>}

      {screen === "pbvision" && <section className="flow-screen"><div className="flow-card score-entry-card"><button className="back-button" onClick={() => setScreen("home")}>← Back</button><h1>Enter your PB Vision scores</h1><div className="score-grid">{skills.map((skill) => <label className="score-field" key={skill.key}><span className="score-label"><b>{skill.label}</b><span>{scores[skill.key].toFixed(1)}</span></span><input type="range" min="2" max="5.5" step="0.1" value={scores[skill.key]} onChange={(event) => setScores({ ...scores, [skill.key]: Number(event.target.value) })} /></label>)}</div><button className="primary-button" onClick={() => { setSource("PB Vision"); setScreen("style"); }}>Continue</button></div></section>}

      {screen === "assessment" && <section className="flow-screen"><div className="flow-card assessment-card"><button className="back-button" onClick={() => assessmentIndex === 0 ? setScreen("home") : setAssessmentIndex(assessmentIndex - 1)}>← Back</button><p className="eyebrow">Question {assessmentIndex + 1} of 6</p><h1>{assessmentStatements[skills[assessmentIndex].key]}</h1><div className="answer-grid">{answerChoices.map((answer) => <button key={answer.label} className="answer-button" onClick={() => chooseAssessmentAnswer(answer.value)}>{answer.label}</button>)}</div></div></section>}

      {screen === "choose" && <section className="flow-screen"><div className="flow-card choose-card"><button className="back-button" onClick={() => setScreen("home")}>← Back</button><h1>What would you like to improve?</h1><div className="focus-choice-grid">{skills.map((skill) => <button key={skill.key} className={chosenFocus.includes(skill.key) ? "focus-choice selected" : "focus-choice"} onClick={() => toggleFocus(skill.key)}><span>{skill.symbol}</span><b>{skill.label}</b></button>)}</div><button className="primary-button" disabled={!chosenFocus.length} onClick={() => { setSource("chosen focus"); setScreen("style"); }}>Continue</button></div></section>}

      {(screen === "style" || screen === "customstyle") && <section className="flow-screen"><div className="flow-card style-card"><button className="back-button" onClick={() => setScreen(screen === "customstyle" ? "home" : source === "PB Vision" ? "pbvision" : source === "chosen focus" ? "choose" : "assessment")}>← Back</button><h1>How do you want to practise?</h1><div className="style-choice-grid"><button className={style === "social" ? "style-choice selected" : "style-choice"} onClick={() => setStyle("social")}><b>Social</b><span>Confidence, consistency and longer rallies.</span></button><button className={style === "competitive" ? "style-choice selected" : "style-choice"} onClick={() => setStyle("competitive")}><b>Competitive / Advanced</b><span>Pressure, tactics and advanced variations.</span></button></div><button className="primary-button" onClick={() => setScreen(screen === "customstyle" ? "customdrills" : "session")}>{screen === "customstyle" ? "Choose my drills" : "Choose my session length"}</button></div></section>}

      {screen === "session" && <section className="flow-screen"><div className="flow-card session-card"><button className="back-button" onClick={() => setScreen("style")}>← Back</button><h1>How much time do you have today?</h1><div className="session-choice-grid">{sessionOptions.map((option) => <button className="session-choice" key={option.name} onClick={() => { setDrillCount(option.drillCount); setScreen("results"); }}><span>{option.minutes} min</span><b>{option.name}</b><em>{option.drillCount} drills</em></button>)}</div></div></section>}

      {screen === "customdrills" && <section className="flow-screen custom-drills-screen"><div className="flow-card custom-drills-card"><button className="back-button" onClick={() => setScreen("customstyle")}>← Back</button><p className="eyebrow">Build your own plan · {style === "social" ? "Social" : "Competitive / Advanced"}</p><h1>Pick the drills you want</h1><p className="flow-intro">All new drills appear here automatically. Each drill takes about 10 minutes.</p><div className="custom-drill-groups">{skills.map((skill) => <section className="custom-drill-group" key={skill.key}><div className="custom-group-heading"><span>{skill.symbol}</span><h2>{skill.label}</h2><em>{drillLibrary[skill.key].length} drills</em></div><div className="custom-drill-grid">{allDrillChoices.filter((choice) => choice.skill.key === skill.key).map((choice) => { const selected = customDrills.includes(choice.id); return <button className={selected ? "custom-drill-choice selected" : "custom-drill-choice"} key={choice.id} onClick={() => setCustomDrills((current) => current.includes(choice.id) ? current.filter((id) => id !== choice.id) : [...current, choice.id])}><span className="custom-check">{selected ? "✓" : "+"}</span><span className={`custom-drill-area level-${choice.drill.level}`}>{levelLabel[choice.drill.level]} · {skill.label}</span><b>{choice.drill.name}</b><span>{choice.drill.purpose}</span>{style === "competitive" && choice.drill.advancedVariation && <em>Includes an advanced variation</em>}</button>; })}</div></section>)}</div><div className="custom-plan-footer"><div><b>{customDrills.length} {customDrills.length === 1 ? "drill" : "drills"} selected</b><span>{customDrills.length ? `About ${customDrills.length * 10} minutes` : "Choose at least one drill"}</span></div><button className="primary-button" disabled={!customDrills.length} onClick={() => setScreen("results")}>Build my plan</button></div></div></section>}

      {screen === "results" && <section className="results-screen"><div className="results-hero court-bg"><div><p className="eyebrow">Your KPC development profile</p><h1>{focusTitle}</h1><p>Your {sessionName} session includes {planDrillCount} {planDrillCount === 1 ? "drill" : "drills"} and takes about {planMinutes} minutes.</p></div><div className="results-actions"><button className="secondary-button" onClick={startOver}>Start again</button></div></div><div className="results-content"><section className="plan-section"><div className="priority-blocks">{planGroups.map(({ priority, drills }, priorityIndex) => <div className="priority-block" key={priority.key}><div className="priority-header"><span>Priority {priorityIndex + 1}</span><h3>{priority.label}</h3></div><div className="drill-grid">{drills.map((drill, drillIndex) => <article className="drill-card" key={`${priority.key}-${drill.name}`}><div className="drill-number">{priorityIndex + 1}.{drillIndex + 1}</div><p className="eyebrow">{levelLabel[drill.level]}</p><h4>{drill.name}</h4><p className="drill-purpose">{drill.purpose}</p><dl><div><dt>Set up</dt><dd>{drill.setup}</dd></div><div><dt>How to do it</dt><dd><ol>{drill.steps.map((step) => <li key={step}>{step}</li>)}</ol></dd></div><div className="target-box"><dt>Your target</dt><dd>{style === "social" ? drill.socialTarget : drill.competitiveTarget}</dd></div>{style === "competitive" && drill.advancedVariation && <div className="advanced-box"><dt>Advanced variation</dt><dd>{drill.advancedVariation}</dd></div>}<div className="two-way"><span><dt>Solo</dt><dd>{drill.solo}</dd></span><span><dt>With a partner</dt><dd>{drill.partner}</dd></span></div></dl></article>)}</div></div>)}</div></section></div></section>}
    </main>
  );
}
