import type { Drill } from "./drill-library";

export type RecommendationStyle = "social" | "competitive";

const levelOrder: Drill["level"][] = ["foundation", "developing", "advanced"];

function preferredLevels(score: number): Drill["level"][] {
  if (score < 3) return ["foundation", "developing", "advanced"];
  if (score <= 3.75) return ["developing", "foundation", "advanced"];
  return ["advanced", "developing", "foundation"];
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

export function explainRecommendation(skillLabel: string, score: number, source: string, style: RecommendationStyle): string {
  const intensity = style === "competitive"
    ? "The drills add pressure, decision-making and advanced variations where appropriate."
    : "The drills emphasize control, confidence and repeatable success.";

  if (source === "chosen focus") {
    return `${skillLabel} was selected as a focus area. ${intensity}`;
  }

  if (score < 3) {
    return `${skillLabel} is currently one of the lowest-rated areas at ${score.toFixed(1)}. The plan starts with foundation work before increasing difficulty. ${intensity}`;
  }

  if (score <= 3.75) {
    return `${skillLabel} is rated ${score.toFixed(1)}. The plan uses developing drills while reinforcing the underlying fundamentals. ${intensity}`;
  }

  return `${skillLabel} is rated ${score.toFixed(1)}. The plan uses advanced drills to create a meaningful challenge rather than repeating introductory work. ${intensity}`;
}
