export type DrillLevel = "foundation" | "developing" | "advanced";

export type Drill = {
  name: string;
  level: DrillLevel;
  purpose: string;
  setup: string;
  steps: string[];
  socialTarget: string;
  competitiveTarget: string;
  solo: string;
  partner: string;
  advancedVariation?: string;
};

export const serveDrills: Drill[] = [
  {
    name: "Three-Zone Serve",
    level: "foundation",
    purpose: "Build reliable depth and placement without sacrificing consistency.",
    setup: "Place three flat markers in the back third of the opposite service court: wide, middle, and centreline.",
    steps: [
      "Serve five balls toward each marker.",
      "Use the same calm pre-serve routine before every serve.",
      "Count a ball only when it is legal and lands in the back third.",
    ],
    socialTarget: "Land 9 of 15 serves in the back third.",
    competitiveTarget: "Land 12 of 15 deep, including three successful serves to each zone.",
    solo: "Use markers and retrieve after each set of five.",
    partner: "Your partner calls the target just before you begin your motion.",
  },
  {
    name: "Serve Plus One",
    level: "foundation",
    purpose: "Connect a purposeful serve with balanced preparation for the next shot.",
    setup: "The server starts at the baseline. A partner returns the ball; solo players shadow the recovery movement after serving.",
    steps: [
      "Serve deep and recover to a balanced ready position.",
      "Track the return and play the third ball with control.",
      "Reset after every three repetitions and check your balance.",
    ],
    socialTarget: "Complete 8 controlled serve-and-recovery sequences.",
    competitiveTarget: "Win or neutralize 7 of 10 serve-plus-one sequences.",
    solo: "Serve, split-step as the ball bounces, then shadow a controlled third shot.",
    partner: "The partner varies return depth while keeping the feed playable.",
  },
  {
    name: "Ten-Ball Rhythm",
    level: "foundation",
    purpose: "Create a repeatable serving routine and reduce avoidable errors.",
    setup: "Use ten balls at the baseline and choose one service court.",
    steps: [
      "Use the same breath, bounce, target, and swing routine on every serve.",
      "Serve all ten balls without changing pace after a miss.",
      "Record legal serves and deep serves separately.",
    ],
    socialTarget: "Make 8 of 10 legal serves.",
    competitiveTarget: "Make 9 of 10 legal serves with at least 7 landing deep.",
    solo: "Repeat three rounds and compare the scores.",
    partner: "The partner watches for routine changes and gives one observation after each round.",
  },
  {
    name: "Wide-Middle Challenge",
    level: "developing",
    purpose: "Improve directional control and make the returner move before the rally begins.",
    setup: "Mark two target lanes in the back third: one wide and one near the centreline.",
    steps: [
      "Alternate wide and middle serves for twelve balls.",
      "Keep the same preparation so direction is not obvious early.",
      "Score one point for depth and one additional point for the correct lane.",
    ],
    socialTarget: "Score 14 points out of a possible 24.",
    competitiveTarget: "Score 18 points and miss no more than two serves.",
    solo: "Use visible target lanes and track each result.",
    partner: "The returner calls whether the serve changed their contact position.",
    advancedVariation: "The returner starts in a neutral position and plays the point out after each successful target serve.",
  },
  {
    name: "Pressure at 8-9",
    level: "developing",
    purpose: "Practise serving with consequence and maintaining routine under score pressure.",
    setup: "Begin a simulated game at 8-9. The server must earn two points before committing two serving errors.",
    steps: [
      "Announce the score before each serve.",
      "Use the full routine and choose a clear target.",
      "Play out the rally with a partner, or score the serve by target when solo.",
    ],
    socialTarget: "Complete three successful simulated games in six attempts.",
    competitiveTarget: "Win four of six simulated games without a service error on game point.",
    solo: "A deep target serve earns a point; a miss or short serve loses the rally.",
    partner: "Play the rally from the serve and rotate server after each simulated game.",
    advancedVariation: "Start at 9-10 and require two consecutive pressure holds.",
  },
  {
    name: "Disguise and Decide",
    level: "advanced",
    purpose: "Develop late directional choice while keeping a consistent serving motion.",
    setup: "Mark wide, body, and centreline targets in both service courts. A partner displays or calls a target late in the routine.",
    steps: [
      "Begin the normal serving routine without committing to a target.",
      "Receive the target cue immediately before starting the forward swing.",
      "Serve with controlled pace and recover for the next ball.",
    ],
    socialTarget: "Hit 8 of 15 called targets while keeping 12 serves legal.",
    competitiveTarget: "Hit 11 of 15 called targets while keeping 14 serves legal.",
    solo: "Shuffle target cards and reveal one before each serve.",
    partner: "The partner gives the late target cue and returns successful serves.",
    advancedVariation: "Play the full point and award a bonus when the targeted serve creates a weak return.",
  },
];
