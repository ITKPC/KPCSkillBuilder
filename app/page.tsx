"use client";

import { useMemo, useState } from "react";

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
type Screen = "home" | "pbvision" | "assessment" | "choose" | "style" | "results";
type Source = "PB Vision" | "self-assessment" | "chosen focus";

const initialScores: Scores = {
  serve: 3,
  return: 3,
  offense: 3,
  defense: 3,
  agility: 3,
  consistency: 3,
};

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

type Drill = {
  name: string;
  purpose: string;
  setup: string;
  steps: string[];
  socialTarget: string;
  competitiveTarget: string;
  solo: string;
  partner: string;
};

const drillLibrary: Record<SkillKey, Drill[]> = {
  serve: [
    {
      name: "Three-Zone Serve",
      purpose: "Build depth and placement without sacrificing reliability.",
      setup: "Place three flat markers in the back third of the opposite service court: wide, middle and centreline.",
      steps: [
        "Serve five balls toward each marker.",
        "Use the same calm routine before every serve.",
        "Count a ball only when it is legal and lands in the back third.",
      ],
      socialTarget: "Land 9 of 15 serves in the back third.",
      competitiveTarget: "Land 12 of 15 deep, including three successful serves to each zone.",
      solo: "Use markers and retrieve after each set of five.",
      partner: "Your partner calls the target just before you begin your motion.",
    },
    {
      name: "Serve Plus One",
      purpose: "Connect a purposeful serve with readiness for the next ball.",
      setup: "Server begins at the baseline. A partner returns; solo players shadow the recovery movement after serving.",
      steps: [
        "Serve deep and recover to a balanced ready position.",
        "Track the return and play the third ball with control.",
        "Reset after every three repetitions and check your balance.",
      ],
      socialTarget: "Complete 8 controlled serve-and-recovery sequences.",
      competitiveTarget: "Win or neutralize 7 of 10 serve-plus-one sequences.",
      solo: "Serve, split-step as the ball bounces, then shadow a controlled third shot.",
      partner: "Partner varies return depth while keeping the feed playable.",
    },
  ],
  return: [
    {
      name: "Deep Return Lane",
      purpose: "Create time to reach the kitchen with a deep, reliable return.",
      setup: "Mark the back third of the court with two cones or flat markers.",
      steps: [
        "Start one step behind the baseline.",
        "Return with a smooth, controlled swing toward the back third.",
        "Follow the ball to the kitchen and arrive in a balanced ready position.",
      ],
      socialTarget: "Land 7 of 10 returns beyond the markers.",
      competitiveTarget: "Land 8 of 10 deep while alternating cross-court and middle targets.",
      solo: "Drop-hit ten groundstrokes toward a marked deep zone, then move forward after each hit.",
      partner: "Partner serves from the opposite baseline and varies placement.",
    },
    {
      name: "Return and Arrive",
      purpose: "Improve the transition from return contact to kitchen position.",
      setup: "Use one marker halfway to the kitchen and another at the non-volley line.",
      steps: [
        "Return deep, move through the halfway marker and split-step as the server contacts the third shot.",
        "Continue only when the incoming ball allows it.",
        "Finish balanced at the kitchen—not running through the next shot.",
      ],
      socialTarget: "Complete 8 balanced arrivals without rushing.",
      competitiveTarget: "Reach a stable attacking position in 7 of 10 live sequences.",
      solo: "Drop-hit a return, move through both markers and finish with a split-step.",
      partner: "Partner serves and then plays a controlled third shot.",
    },
  ],
  offense: [
    {
      name: "Green-Light Attack",
      purpose: "Attack only balls that can be contacted above net height.",
      setup: "Both players begin at the kitchen. The feeder alternates neutral dinks and slightly elevated balls.",
      steps: [
        "Call “wait” for a neutral ball and continue dinking.",
        "Call “go” for an attackable ball and speed it up with a compact swing.",
        "Recover the paddle to ready position immediately.",
      ],
      socialTarget: "Correctly identify 8 of 10 attackable or neutral balls.",
      competitiveTarget: "Correctly identify 9 of 10 and place 7 attacks below shoulder height.",
      solo: "Use alternating low and higher self-feeds against a wall; attack only the higher rebound.",
      partner: "Feeder randomizes height without telling the hitter what is coming.",
    },
    {
      name: "Finish to Space",
      purpose: "Replace hitting harder with purposeful placement.",
      setup: "Place two targets near the opponents’ feet or open court. Begin with a cooperative kitchen exchange.",
      steps: [
        "Wait for a ball above net height.",
        "Choose the open target before contact.",
        "Use a compact swing and recover for the next ball.",
      ],
      socialTarget: "Hit 6 of 10 controlled attacks into either target zone.",
      competitiveTarget: "Hit 7 of 10 into the called target while the defender moves naturally.",
      solo: "Mark two wall targets and alternate placement after a controlled self-feed.",
      partner: "Partner defends from the kitchen and awards a point for placement, not raw speed.",
    },
  ],
  defense: [
    {
      name: "Reset and Breathe",
      purpose: "Soften a hard ball into the kitchen and regain control.",
      setup: "Defender begins in the transition zone. Feeder stands at the kitchen.",
      steps: [
        "Use a compact block with a relaxed grip.",
        "Aim for the middle of the kitchen.",
        "Hold your balance after contact before moving forward.",
      ],
      socialTarget: "Land 6 of 10 resets in the kitchen.",
      competitiveTarget: "Land 7 of 10 resets in the kitchen from randomized feeds.",
      solo: "Against a wall, absorb ten firm rebounds so the next bounce lands close to you.",
      partner: "Feeder increases pace only after the defender completes three successful resets.",
    },
    {
      name: "Two-Step Recovery",
      purpose: "Defend, regain balance and move forward only when the ball permits.",
      setup: "Begin one step behind the kitchen. The feeder applies controlled pressure.",
      steps: [
        "Block the first ball softly.",
        "Recover your ready position before taking a small step forward.",
        "Repeat until you safely reach the kitchen line.",
      ],
      socialTarget: "Reach the kitchen under control in 5 of 8 sequences.",
      competitiveTarget: "Reach the kitchen and neutralize the rally in 6 of 8 randomized sequences.",
      solo: "Shadow block, recover and step movements using a wall rebound or imaginary feed.",
      partner: "Feeder varies forehand and backhand pressure while keeping the drill safe.",
    },
  ],
  agility: [
    {
      name: "Split-Step Path",
      purpose: "Move early and arrive balanced instead of hitting while running.",
      setup: "Place markers at the baseline, transition zone and kitchen line.",
      steps: [
        "Move from one marker to the next using short, controlled steps.",
        "Split-step at every marker and hold a balanced ready position.",
        "Keep your chest forward and avoid crossing your feet.",
      ],
      socialTarget: "Complete six smooth paths with full balance at each marker.",
      competitiveTarget: "Complete eight paths while reacting to random left-or-right direction calls.",
      solo: "Use three markers and change direction after every split-step.",
      partner: "Partner points left or right as you arrive at each marker.",
    },
    {
      name: "Hit, Recover, Ready",
      purpose: "Return to a useful court position after every shot.",
      setup: "Place a home-base marker near the middle of your playing area.",
      steps: [
        "Move from home base to play the ball.",
        "Recover with small steps instead of turning your back to the net.",
        "Pause in ready position before the next feed.",
      ],
      socialTarget: "Complete 10 balanced hit-and-recover repetitions.",
      competitiveTarget: "Complete 12 randomized repetitions without being late or off balance.",
      solo: "Use shadow swings at two side markers and recover to home base.",
      partner: "Partner feeds alternating forehand, backhand and middle balls.",
    },
  ],
  consistency: [
    {
      name: "Ten-Ball Rally",
      purpose: "Build repeatable control before increasing difficulty.",
      setup: "Choose one shot—dink, volley or groundstroke—and agree on a comfortable pace.",
      steps: [
        "Count every successful contact aloud.",
        "Restart at zero after an error.",
        "After reaching ten, add placement or movement while keeping the same control.",
      ],
      socialTarget: "Complete three rallies of 10 controlled shots.",
      competitiveTarget: "Complete three rallies of 15, then play the final ball to a target.",
      solo: "Use a wall and mark a safe rebound zone.",
      partner: "Cooperate until the target is reached; do not try to win the rally.",
    },
    {
      name: "High-Percentage Choice",
      purpose: "Practise choosing the safer ball when under pressure.",
      setup: "Play half-court points. Before contact, the hitter calls “safe” or “attack.”",
      steps: [
        "Choose “safe” for balls below net height or when off balance.",
        "Choose “attack” only when balanced with contact above net height.",
        "After each rally, review whether the choice—not the result—was sound.",
      ],
      socialTarget: "Make an appropriate choice on 8 of 10 balls.",
      competitiveTarget: "Make an appropriate choice on 9 of 10 balls during scored half-court play.",
      solo: "Alternate low and high self-feeds and call the choice before swinging.",
      partner: "Partner varies feed height and gives immediate choice feedback.",
    },
  ],
};

function formatScore(value: number) {
  return value.toFixed(1);
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [style, setStyle] = useState<PlayStyle>("social");
  const [scores, setScores] = useState<Scores>(initialScores);
  const [assessment, setAssessment] = useState<Partial<Scores>>({});
  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [source, setSource] = useState<Source>("self-assessment");
  const [chosenFocus, setChosenFocus] = useState<SkillKey[]>([]);

  const rankedSkills = useMemo(
    () => [...skills].sort((a, b) => scores[a.key] - scores[b.key]),
    [scores],
  );

  const priorities = source === "chosen focus"
    ? chosenFocus.map((key) => skills.find((skill) => skill.key === key)!).filter(Boolean)
    : rankedSkills.slice(0, 2);

  const startOver = () => {
    setScreen("home");
    setScores(initialScores);
    setAssessment({});
    setAssessmentIndex(0);
    setStyle("social");
    setChosenFocus([]);
  };

  const toggleFocus = (key: SkillKey) => {
    setChosenFocus((current) => {
      if (current.includes(key)) return current.filter((item) => item !== key);
      if (current.length >= 2) return current;
      return [...current, key];
    });
  };

  const continueWithChosenFocus = () => {
    if (!chosenFocus.length) return;
    setSource("chosen focus");
    setScreen("style");
  };

  const chooseAssessmentAnswer = (value: number) => {
    const key = skills[assessmentIndex].key;
    const nextAssessment = { ...assessment, [key]: value };
    setAssessment(nextAssessment);
    if (assessmentIndex < skills.length - 1) {
      setAssessmentIndex(assessmentIndex + 1);
      return;
    }
    setScores(nextAssessment as Scores);
    setSource("self-assessment");
    setScreen("style");
  };

  const showResultsFromPbVision = () => {
    setSource("PB Vision");
    setScreen("style");
  };

  const showPlan = () => setScreen("results");

  const savePlanImage = async () => {
    const width = 1200;
    const drillCount = priorities.length * 2;
    const height = 690 + drillCount * 245;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;

    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(" ");
      let line = "";
      let currentY = y;
      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        if (context.measureText(testLine).width > maxWidth && line) {
          context.fillText(line, x, currentY);
          line = word;
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      if (line) context.fillText(line, x, currentY);
      return currentY + lineHeight;
    };

    context.fillStyle = "#f4f8fb";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#061747";
    context.fillRect(0, 0, width, 330);
    context.fillStyle = "#01aef0";
    context.fillRect(0, 320, width, 10);

    try {
      const logo = new window.Image();
      logo.src = "/kpc-logo.png";
      await logo.decode();
      context.save();
      context.beginPath();
      context.arc(104, 96, 66, 0, Math.PI * 2);
      context.clip();
      context.drawImage(logo, 38, 30, 132, 132);
      context.restore();
    } catch {
      // The plan remains useful if the logo cannot be drawn.
    }

    context.fillStyle = "#e9df46";
    context.font = "700 22px Arial";
    context.fillText("KPC SKILL BUILDER", 205, 72);
    context.fillStyle = "#ffffff";
    context.font = "800 48px Arial";
    const focusTitle = priorities.length === 1
      ? `Focus on ${priorities[0].label}`
      : `Focus on ${priorities[0].label}, then ${priorities[1].label}`;
    wrapText(focusTitle, 205, 130, 900, 58);
    context.fillStyle = "#dceefe";
    context.font = "400 23px Arial";
    context.fillText(`${style === "social" ? "Social" : "Competitive"} practice plan • ${source}`, 205, 260);

    let y = 390;
    context.fillStyle = "#061747";
    context.font = "800 34px Arial";
    context.fillText("Your practice plan", 58, y);
    y += 48;

    priorities.forEach((priority, priorityIndex) => {
      drillLibrary[priority.key].forEach((drill, drillIndex) => {
        context.fillStyle = "#ffffff";
        context.strokeStyle = "#c8d9e8";
        context.lineWidth = 2;
        context.beginPath();
        context.roundRect(48, y, 1104, 215, 20);
        context.fill();
        context.stroke();
        context.fillStyle = priorityIndex === 0 ? "#01aef0" : "#8ec753";
        context.fillRect(48, y, 10, 215);
        context.fillStyle = "#0877cf";
        context.font = "800 18px Arial";
        context.fillText(`PRIORITY ${priorityIndex + 1} • ${priority.label.toUpperCase()}`, 82, y + 38);
        context.fillStyle = "#061747";
        context.font = "800 29px Arial";
        context.fillText(`${priorityIndex + 1}.${drillIndex + 1}  ${drill.name}`, 82, y + 78);
        context.fillStyle = "#52617b";
        context.font = "400 21px Arial";
        wrapText(drill.purpose, 82, y + 112, 1010, 28);
        context.fillStyle = "#4d851a";
        context.font = "700 20px Arial";
        wrapText(`Target: ${style === "social" ? drill.socialTarget : drill.competitiveTarget}`, 82, y + 170, 1010, 26);
        y += 245;
      });
    });

    context.fillStyle = "#061747";
    context.font = "800 30px Arial";
    context.fillText("Four-week rhythm", 58, y + 10);
    context.fillStyle = "#52617b";
    context.font = "400 21px Arial";
    const weeks = [
      "Week 1: Learn the Priority 1 drills.",
      "Week 2: Repeat Priority 1 and meet the targets.",
      priorities.length > 1 ? "Week 3: Add the Priority 2 drills." : "Week 3: Increase the challenge gradually.",
      "Week 4: Mix the drills, then reassess.",
    ];
    weeks.forEach((week, index) => context.fillText(week, 58, y + 52 + index * 34));

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "KPC-practice-plan.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <main className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={startOver} aria-label="KPC Skill Builder home">
          <span className="brand-logo" role="img" aria-label="Kamloops Pickleball Club" />
          <span className="brand-divider" aria-hidden="true" />
          <span className="brand-name">KPC Skill Builder</span>
        </button>
        {screen !== "home" && (
          <button className="text-button" onClick={startOver}>Start over</button>
        )}
      </header>

      {screen === "home" && (
        <section className="hero court-bg">
          <div className="court-art" aria-hidden="true">
            <div className="court-green" />
            <div className="court-blue" />
            <div className="court-line court-line-one" />
            <div className="court-line court-line-two" />
            <div className="pickleball"><span /><span /><span /><span /><span /><span /></div>
          </div>

          <div className="hero-content">
            <p className="eyebrow">Your game. Your next step.</p>
            <h1>Build the part of your game that matters most</h1>
            <p className="hero-copy">
              A private tool that creates a personal practice plan—without names,
              accounts or saved results.
            </p>

            <div className="start-grid" aria-label="Choose how to begin">
              <button className="start-card start-card-primary" onClick={() => setScreen("pbvision")}>
                <span className="start-number">01</span>
                <span className="start-title">I have PB Vision scores</span>
                <span className="start-description">Enter your six skill scores</span>
                <span className="start-arrow" aria-hidden="true">→</span>
              </button>
              <button className="start-card start-card-secondary" onClick={() => setScreen("assessment")}>
                <span className="start-number">02</span>
                <span className="start-title">Help me assess my skills</span>
                <span className="start-description">Answer six quick questions</span>
                <span className="start-arrow" aria-hidden="true">→</span>
              </button>
              <button className="start-card start-card-tertiary" onClick={() => setScreen("choose")}>
                <span className="start-number">03</span>
                <span className="start-title">I know what I want to improve</span>
                <span className="start-description">Choose one or two focus areas</span>
                <span className="start-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </div>

          <div className="home-rail">
            <div className="style-preview" aria-label="Plans for social and competitive players">
              <span className="style-chip active">Social</span>
              <span className="style-chip">Competitive</span>
            </div>
            <div className="skill-preview">
              {skills.map((skill) => (
                <div className="skill-mini" key={skill.key}>
                  <span>{skill.symbol}</span>
                  {skill.label}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {screen === "pbvision" && (
        <section className="flow-screen">
          <div className="flow-card score-entry-card">
            <button className="back-button" onClick={() => setScreen("home")}>← Back</button>
            <p className="eyebrow">Step 1 of 2</p>
            <h1>Enter your PB Vision scores</h1>
            <p className="flow-intro">Use the six scores shown in your PB Vision skill rating. Nothing is saved.</p>
            <div className="score-grid">
              {skills.map((skill) => (
                <label className="score-field" key={skill.key}>
                  <span className="score-label"><b>{skill.label}</b><span>{formatScore(scores[skill.key])}</span></span>
                  <input
                    type="range"
                    min="2"
                    max="5.5"
                    step="0.1"
                    value={scores[skill.key]}
                    onChange={(event) => setScores({ ...scores, [skill.key]: Number(event.target.value) })}
                    aria-label={`${skill.label} score`}
                  />
                  <span className="range-labels"><span>2.0</span><span>5.5</span></span>
                </label>
              ))}
            </div>
            <button className="primary-button" onClick={showResultsFromPbVision}>Continue</button>
            <p className="privacy-note">Private by design: your scores remain only on this screen and disappear when you close or refresh the app.</p>
          </div>
        </section>
      )}

      {screen === "assessment" && (
        <section className="flow-screen">
          <div className="flow-card assessment-card">
            <button
              className="back-button"
              onClick={() => assessmentIndex === 0 ? setScreen("home") : setAssessmentIndex(assessmentIndex - 1)}
            >← Back</button>
            <div className="progress-row">
              <p className="eyebrow">Question {assessmentIndex + 1} of {skills.length}</p>
              <span>{Math.round(((assessmentIndex + 1) / skills.length) * 100)}%</span>
            </div>
            <div className="progress-track"><span style={{ width: `${((assessmentIndex + 1) / skills.length) * 100}%` }} /></div>
            <div className="question-symbol" aria-hidden="true">{skills[assessmentIndex].symbol}</div>
            <p className="question-area">{skills[assessmentIndex].label}</p>
            <h1>{assessmentStatements[skills[assessmentIndex].key]}</h1>
            <div className="answer-grid">
              {answerChoices.map((answer) => (
                <button
                  key={answer.label}
                  className={assessment[skills[assessmentIndex].key] === answer.value ? "answer-button selected" : "answer-button"}
                  onClick={() => chooseAssessmentAnswer(answer.value)}
                >{answer.label}</button>
              ))}
            </div>
            <p className="assessment-help">Choose the answer that describes your usual play—not your very best day.</p>
          </div>
        </section>
      )}

      {screen === "choose" && (
        <section className="flow-screen">
          <div className="flow-card choose-card">
            <button className="back-button" onClick={() => setScreen("home")}>← Back</button>
            <p className="eyebrow">Choose your focus</p>
            <h1>What would you like to improve?</h1>
            <p className="flow-intro">Choose one or two areas. No scores or assessment needed.</p>
            <div className="focus-choice-grid">
              {skills.map((skill) => {
                const selected = chosenFocus.includes(skill.key);
                return (
                  <button
                    key={skill.key}
                    className={selected ? "focus-choice selected" : "focus-choice"}
                    onClick={() => toggleFocus(skill.key)}
                    aria-pressed={selected}
                  >
                    <span>{skill.symbol}</span>
                    <b>{skill.label}</b>
                    {selected && <em>Selected</em>}
                  </button>
                );
              })}
            </div>
            <div className="focus-footer">
              <p>{chosenFocus.length === 0 ? "Choose at least one area." : `${chosenFocus.length} of 2 selected`}</p>
              <button className="primary-button" disabled={!chosenFocus.length} onClick={continueWithChosenFocus}>Continue</button>
            </div>
          </div>
        </section>
      )}

      {screen === "style" && (
        <section className="flow-screen">
          <div className="flow-card style-card">
            <button className="back-button" onClick={() => setScreen(source === "PB Vision" ? "pbvision" : source === "chosen focus" ? "choose" : "assessment")}>← Back</button>
            <p className="eyebrow">Step 2 of 2</p>
            <h1>What kind of practice plan do you want today?</h1>
            <p className="flow-intro">This changes the feel of your drills—not your assessment.</p>
            <div className="style-choice-grid">
              <button className={style === "social" ? "style-choice selected" : "style-choice"} onClick={() => setStyle("social")}>
                <span className="style-choice-icon" aria-hidden="true">● ●</span>
                <b>Social</b>
                <span>Longer rallies, confidence, consistency and comfortable improvement.</span>
              </button>
              <button className={style === "competitive" ? "style-choice selected" : "style-choice"} onClick={() => setStyle("competitive")}>
                <span className="style-choice-icon" aria-hidden="true">◆</span>
                <b>Competitive</b>
                <span>Pressure, tactical choices, attacking opportunities and match preparation.</span>
              </button>
            </div>
            <button className="primary-button" onClick={showPlan}>Build my plan</button>
          </div>
        </section>
      )}

      {screen === "results" && (
        <section className="results-screen">
          <div className="results-hero court-bg">
            <div>
              <p className="eyebrow">Your KPC development profile</p>
              <h1>{priorities.length === 1 ? `Focus on ${priorities[0].label}` : `Focus first on ${priorities[0].label}, then ${priorities[1].label}`}</h1>
              <p>
                Based on your {source === "PB Vision" ? "entered PB Vision scores" : source === "chosen focus" ? "chosen focus" : "six-question self-assessment"} and a {style} practice style.
                This is a development guide—not an official club rating.
              </p>
            </div>
            <div className="results-actions no-print">
              <button className="secondary-button" onClick={startOver}>Start again</button>
              <button className="primary-button" onClick={savePlanImage}>Save plan image</button>
            </div>
          </div>

          <div className="results-content">
            {source !== "chosen focus" && <section className="profile-card" aria-labelledby="profile-heading">
              <div className="section-heading">
                <div><p className="eyebrow">Your six areas</p><h2 id="profile-heading">Development profile</h2></div>
                <span className="source-badge">{source}</span>
              </div>
              <div className="profile-bars">
                {skills.map((skill) => {
                  const isPriority = priorities.some((item) => item.key === skill.key);
                  return (
                    <div className="profile-row" key={skill.key}>
                      <div className="profile-label"><span>{skill.label}</span>{isPriority && <em>Focus</em>}</div>
                      <div className="bar-track"><span style={{ width: `${Math.max(8, ((scores[skill.key] - 2) / 3.5) * 100)}%` }} /></div>
                      <b>{formatScore(scores[skill.key])}</b>
                    </div>
                  );
                })}
              </div>
            </section>}

            <section className="plan-section" aria-labelledby="plan-heading">
              <div className="section-heading">
                <div><p className="eyebrow">Your practice plan</p><h2 id="plan-heading">{priorities.length * 2} drills for your {priorities.length === 1 ? "focus area" : "two priorities"}</h2></div>
                <span className="style-badge">{style === "social" ? "Social plan" : "Competitive plan"}</span>
              </div>
              <div className="priority-blocks">
                {priorities.map((priority, priorityIndex) => (
                  <div className="priority-block" key={priority.key}>
                    <div className="priority-header">
                      <span>Priority {priorityIndex + 1}</span>
                      <h3>{priority.label}</h3>
                    </div>
                    <div className="drill-grid">
                      {drillLibrary[priority.key].map((drill, drillIndex) => (
                        <article className="drill-card" key={drill.name}>
                          <div className="drill-number">{priorityIndex + 1}.{drillIndex + 1}</div>
                          <h4>{drill.name}</h4>
                          <p className="drill-purpose">{drill.purpose}</p>
                          <dl>
                            <div><dt>Set up</dt><dd>{drill.setup}</dd></div>
                            <div><dt>How to do it</dt><dd><ol>{drill.steps.map((step) => <li key={step}>{step}</li>)}</ol></dd></div>
                            <div className="target-box"><dt>Your target</dt><dd>{style === "social" ? drill.socialTarget : drill.competitiveTarget}</dd></div>
                            <div className="two-way"><span><dt>Solo</dt><dd>{drill.solo}</dd></span><span><dt>With a partner</dt><dd>{drill.partner}</dd></span></div>
                          </dl>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="weekly-card">
              <div>
                <p className="eyebrow">Keep it simple</p>
                <h2>Your four-week rhythm</h2>
              </div>
              <ol>
                <li><b>Week 1</b><span>Learn the two Priority 1 drills.</span></li>
                <li><b>Week 2</b><span>Repeat Priority 1 and meet the targets.</span></li>
                <li><b>Week 3</b><span>{priorities.length > 1 ? "Add the two Priority 2 drills." : "Increase the challenge gradually."}</span></li>
                <li><b>Week 4</b><span>{priorities.length === 1 ? "Mix both drills, then reassess." : "Mix all four drills, then reassess."}</span></li>
              </ol>
            </section>

            <p className="results-footer">Your results are not stored or transmitted. Refreshing or closing this page clears your plan.</p>
          </div>
        </section>
      )}
    </main>
  );
}
