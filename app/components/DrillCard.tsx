import type { Drill } from "../drill-library";
import { focusOnCues } from "../recommendation-engine";

type DrillCardProps = {
  drill: Drill;
  drillNumber: string;
  skillLabel: string;
  style: "social" | "competitive";
  levelLabel: string;
};

export default function DrillCard({ drill, drillNumber, skillLabel, style, levelLabel }: DrillCardProps) {
  const cues = focusOnCues(skillLabel, drill);

  return (
    <article className="drill-card">
      <div className="drill-number">{drillNumber}</div>
      <p className="eyebrow">{levelLabel}</p>
      <h4>{drill.name}</h4>
      <p className="drill-purpose">{drill.purpose}</p>
      <dl>
        <div>
          <dt>Set up</dt>
          <dd>{drill.setup}</dd>
        </div>
        <div>
          <dt>How to do it</dt>
          <dd>
            <ol>{drill.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          </dd>
        </div>
        <div className="focus-on-box">
          <dt>Focus On</dt>
          <dd>
            <ul>{cues.map((cue) => <li key={cue}>{cue}</li>)}</ul>
          </dd>
        </div>
        <div className="target-box">
          <dt>Your target</dt>
          <dd>{style === "social" ? drill.socialTarget : drill.competitiveTarget}</dd>
        </div>
        {style === "competitive" && drill.advancedVariation && (
          <div className="advanced-box">
            <dt>Advanced variation</dt>
            <dd>{drill.advancedVariation}</dd>
          </div>
        )}
        <div className="two-way">
          <span><dt>Solo</dt><dd>{drill.solo}</dd></span>
          <span><dt>With a partner</dt><dd>{drill.partner}</dd></span>
        </div>
      </dl>
    </article>
  );
}
