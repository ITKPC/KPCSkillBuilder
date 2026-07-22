import type { Drill } from "./drill-library";

export type RecommendationStyle = "social" | "competitive";
export type RecommendationSource = "PB Vision" | "self-assessment" | "chosen focus" | "custom plan";

const levelOrder: Drill["level"][] = ["foundation", "developing", "advanced"];

function preferredLevels(score: number): Drill["level"][] {
  if (score < 3) return ["foundation", "developing", "advanced"];
  if (score <= 3.75) return ["developing", "foundation", "advanced"];
  return ["advanced", "developing", "foundation"];
}

function drillProgression(skillLabel: string, score: number): string {
  const skill = skillLabel.toLowerCase();
  const stage = score < 3 ? "foundation" : score <= 3.75 ? "developing" : "advanced";

  const progressions: Record<string, Record<string, string>> = {
    serve: {
      foundation: "The first drill builds reliable depth and placement. The second adds recovery and preparation for the next shot so the serve carries into the rally.",
      developing: "The first drill sharpens serve location and consistency. The second connects the serve to the next ball so you practise beginning the point with purpose.",
      advanced: "The first drill challenges placement and intention. The second adds pressure and tactical follow-up so the serve becomes part of a complete point pattern.",
    },
    return: {
      foundation: "The first drill builds a dependable deep return. The second adds movement toward the kitchen so the return creates better court position.",
      developing: "The first drill improves depth and direction. The second connects the return to balanced forward movement and readiness for the next shot.",
      advanced: "The first drill challenges return placement under pressure. The second adds tactical movement and decision-making so the return supports the point that follows.",
    },
    offense: {
      foundation: "The first drill develops control on attackable balls. The second adds shot selection so you learn when to attack and when to stay patient.",
      developing: "The first drill improves controlled attacking technique. The second adds movement and decision-making so offense is created rather than forced.",
      advanced: "The first drill challenges precision and pace. The second adds pressure, disguise and tactical choices so attacking patterns transfer into games.",
    },
    defense: {
      foundation: "The first drill builds a softer, more controlled defensive response. The second adds recovery so you can regain balance and return to a neutral position.",
      developing: "The first drill improves resets and blocks. The second adds movement and repeated pressure so you practise turning defense back into control.",
      advanced: "The first drill challenges defensive control at higher pace. The second adds unpredictable pressure and recovery decisions so defense becomes game-ready.",
    },
    agility: {
      foundation: "The first drill develops early movement and balanced stops. The second adds recovery steps so you can return to a ready position after each shot.",
      developing: "The first drill improves efficient court movement. The second adds changing directions and shot preparation so footwork supports better contact.",
      advanced: "The first drill challenges speed and balance. The second adds unpredictable movement and decision-making so agility holds up under game pressure.",
    },
    consistency: {
      foundation: "The first drill builds a repeatable ball and dependable rhythm. The second adds a simple target so consistency becomes purposeful rather than passive.",
      developing: "The first drill strengthens repeatable technique. The second adds placement and decision-making so you can maintain consistency while directing the rally.",
      advanced: "The first drill challenges accuracy over longer sequences. The second adds pressure and changing patterns so consistency remains dependable in competition.",
    },
  };

  return progressions[skill]?.[stage]
    ?? "The first drill establishes the key skill. The second adds movement, decision-making or pressure so you can apply it more effectively in play.";
}

export function focusOnCues(skillLabel: string, drill: Drill): string[] {
  const cues: Record<string, string[]> = {
    serve: ["Use a smooth, repeatable swing.", "Aim for placement before power.", "Finish balanced and recover for the next shot."],
    return: ["Prepare early and contact the ball in front.", "Send the return deep with controlled pace.", "Move forward in balance after contact."],
    offense: ["Stay patient until the ball is attackable.", "Contact the ball in front with a compact swing.", "Recover immediately after the attack."],
    defense: ["Soften your grip and keep the paddle in front.", "Absorb pace instead of swinging harder.", "Recover your balance before the next ball."],
    agility: ["Move early rather than reaching late.", "Stay balanced as you change direction.", "Return to a ready position after every movement."],
    consistency: ["Use the same preparation on every ball.", "Choose a comfortable target with margin.", "Reset your balance before the next shot."],
  };

  const selected = [...(cues[skillLabel.toLowerCase()] ?? ["Prepare early.", "Stay balanced.", "Recover before the next shot."] )];
  if (drill.level === "advanced") selected[2] = "Maintain control as pace and pressure increase.";
  return selected;
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
  const progression = drillProgression(skillLabel, score);
  const styleEnding = style === "competitive"
    ? "The competitive version adds pressure and more demanding variations."
    : "The social version keeps the progression achievable and repeatable.";

  if (source === "chosen focus") return `${progression} ${styleEnding}`;
  if (source === "PB Vision") return `${progression} ${styleEnding}`;
  return `${progression} ${styleEnding}`;
}
