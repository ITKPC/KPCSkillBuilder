import type { Drill } from "./drill-library";

export type RecommendationStyle = "social" | "competitive";
export type RecommendationSource = "PB Vision" | "self-assessment" | "chosen focus" | "custom plan";

const levelOrder: Drill["level"][] = ["foundation", "developing", "advanced"];

function preferredLevels(score: number): Drill["level"][] {
  if (score < 3) return ["foundation", "developing", "advanced"];
  if (score <= 3.75) return ["developing", "foundation", "advanced"];
  return ["advanced", "developing", "foundation"];
}

export function practiceProfileLabel(score: number): string {
  if (score < 2.75) return "Foundation focus";
  if (score < 3.5) return "Building consistency";
  if (score <= 3.75) return "Developing";
  return "Advanced challenge";
}

export function recommendDrills(drills: Drill[], score: number, count: number, style: RecommendationStyle): Drill[] {
  const preferred = preferredLevels(score);
  const levelRank = new Map(preferred.map((level, index) => [level, index]));

  return [...drills]
    .sort((a, b) => {
      const levelDifference = (levelRank.get(a.level) ?? levelOrder.length) - (levelRank.get(b.level) ?? levelOrder.length);
      if (levelDifference !== 0) return levelDifference;

      if (style === "competitive") {
        const aHasVariation = a.advancedVariation ? 0 : 1;
        const bHasVariation = b.advancedVariation ? 0 : 1;
        if (aHasVariation !== bHasVariation) return aHasVariation - bHasVariation;
      }

      return drills.indexOf(a) - drills.indexOf(b);
    })
    .slice(0, count);
}

export function explainRecommendation(
  skillLabel: string,
  score: number,
  source: RecommendationSource,
  style: RecommendationStyle,
): string {
  const emphasis = style === "competitive"
    ? "They add pressure, decision-making and more advanced variations."
    : "They build control, confidence and repeatable success.";

  if (source === "chosen focus") {
    return `You chose ${skillLabel} as a focus area. The drills below work directly on that part of your game. ${emphasis}`;
  }

  if (source === "PB Vision") {
    const reason = score < 3
      ? "start with reliable technique and consistency before adding difficulty"
      : score <= 3.75
        ? "strengthen consistency while introducing more demanding situations"
        : "provide an advanced challenge without returning to introductory work";
    return `Your entered PB Vision ${skillLabel} score was ${score.toFixed(1)}. We chose the drills below to ${reason}. ${emphasis}`;
  }

  const reason = score < 3
    ? "build dependable technique and confidence before increasing difficulty"
    : score <= 3.75
      ? "strengthen consistency while progressing the skill"
      : "challenge the skill with more demanding practice";
  return `Based on your answers, we chose the drills below to ${reason}. ${emphasis}`;
}
