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
  const intensity = style === "competitive"
    ? "The drills add pressure, decision-making and advanced variations where appropriate."
    : "The drills emphasize control, confidence and repeatable success.";

  if (source === "chosen focus") {
    return `You selected ${skillLabel} as a focus area. ${intensity}`;
  }

  if (source === "PB Vision") {
    const challenge = score < 3
      ? "foundation work before gradually increasing difficulty"
      : score <= 3.75
        ? "developing drills while reinforcing the underlying fundamentals"
        : "advanced drills that provide an appropriate challenge";
    return `You entered a PB Vision ${skillLabel} score of ${score.toFixed(1)}. The app used that entered score to select ${challenge}. KPC Skill Builder does not change, verify or issue PB Vision ratings. ${intensity}`;
  }

  const profile = practiceProfileLabel(score);
  const approach = score < 3
    ? "The plan begins with control and foundation work before adding difficulty."
    : score <= 3.75
      ? "The plan combines developing drills with reinforcement of the fundamentals."
      : "The plan uses more challenging drills rather than repeating introductory work.";

  return `Your answers suggest a ${profile.toLowerCase()} practice profile for ${skillLabel}. ${approach} This is a drill-selection guide, not a player rating or club placement decision. ${intensity}`;
}
