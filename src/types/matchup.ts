// Enhanced fighter profile with additional metrics
interface FighterProfile {
  id: string;
  name: string;
  nickname?: string;
  age: number;
  weightClass: string;
  height: number; // in cm
  reach: number;  // in cm
  stance: 'Orthodox' | 'Southpaw' | 'Switch';
  team?: string;
  imageUrl?: string;
  debutYear: number;
  lastWeightCut?: {
    weight: number; // in kg
    percentageOfBodyWeight: number;
  };
}

// Enhanced career statistics with fight-by-fight metrics
interface CareerStats {
  // Base records
  wins: number;
  losses: number;
  draws: number;
  noContests: number;
  winStreak: number;
  
  // Win methods
  winsByKO: number;
  winsBySubmission: number;
  winsByDecision: number;
  winsBySplitDecision: number;
  winsByUnanimousDecision: number;
  
  // Loss methods
  lossesByKO: number;
  lossesBySubmission: number;
  lossesByDecision: number;
  
  // Performance metrics
  avgFightTime: number; // in seconds
  finishRate: number; // percentage of wins by finish
  comebackRate: number; // percentage of wins after being knocked down
  
  // Striking metrics
  sigStrikesLandedPerMin: number;
  sigStrikesAbsorbedPerMin: number;
  strikeAccuracy: number;
  strikeDefense: number;
  headStrikeAccuracy: number;
  bodyStrikeAccuracy: number;
  legStrikeAccuracy: number;
  knockdownsLanded: number;
  knockdownsAbsorbed: number;
  
  // Grappling metrics
  takedownAvgPer15Min: number;
  takedownAccuracy: number;
  takedownDefense: number;
  submissionAvgPer15Min: number;
  submissionAttempts: number;
  submissionDefense: number;
  reversalsPer15Min: number;
  
  // Advanced metrics
  controlTimePercentage: number;
  topPositionTime: number;
  bottomPositionTime: number;
  significantStrikeDifferential: number;
  takedownDifferential: number;
  fightPace: number; // strikes + takedowns per minute
  cardioIndex: number; // performance in later rounds
  damageResistance: number; // strikes absorbed per knockdown
  submissionEfficiency: number; // subs per attempt
  
  // Round-by-round performance
  roundPerformance: {
    round1: number; // performance score 0-100
    round2: number;
    round3: number;
    round4?: number;
    round5?: number;
  };
}

// Enhanced fighting style with mental attributes
interface FightingStyle {
  // Technical skills (0-100)
  striking: number;
  grappling: number;
  wrestling: number;
  clinchWork: number;
  cageWork: number;
  submissionOffense: number;
  
  // Physical attributes (0-100)
  cardio: number;
  power: number;
  chin: number;
  speed: number;
  flexibility: number;
  recovery: number;
  
  // Mental attributes (0-100)
  fightIQ: number;
  adaptability: number;
  composure: number;
  aggression: number;
  patience: number;
  killerInstinct: number;
  
  // Style classification
  classification: 'Striker' | 'Grappler' | 'Wrestler' | 'Well-Rounded' | 'Hybrid';
  primaryWeapons: string[]; // e.g. ['Left high kick', 'Guillotine choke']
  knownWeaknesses: string[]; // e.g. ['Body shots', 'Leg locks']
}

// Enhanced fight context with prefight metrics
interface FightContext {
  isTitleFight: boolean;
  isMainEvent: boolean;
  isShortNotice: boolean; // < 4 weeks
  daysSinceLastFight: number;
  weightCutStatus: {
    percentageOfWeightMissed?: number;
    weightCutDifficulty?: 'Easy' | 'Normal' | 'Hard' | 'Brutal';
  };
  prefightMetrics: {
    mediaAppearances: number;
    openWorkoutPerformance?: number; // 0-100 rating
    faceoffIntensity?: number; // 0-100 rating
  };
  location: {
    city: string;
    country: string;
    elevation: number; // meters
    timezoneOffset: number; // hours from UTC
    isHomeTerritory: boolean; // fighting in home country
    travelDistance: number; // km traveled
    acclimationDays: number; // days in location
  };
  injuries?: {
    type: string;
    severity: number; // 0-100
    affectedAreas: string[];
  }[];
  campChanges?: {
    newCoaches: string[];
    trainingPartners: string[];
    campLocationChange: boolean;
  };
}

// Enhanced matchup comparison with new metrics
interface MatchupComparison {
  fighters: {
    fighter1: FighterProfile & {
      stats: CareerStats;
      style: FightingStyle;
      recentFights: RecentFight[];
    };
    fighter2: FighterProfile & {
      stats: CareerStats;
      style: FightingStyle;
      recentFights: RecentFight[];
    };
  };
  
  // Physical differentials
  physicalDifferentials: {
    age: number;
    height: number;
    reach: number;
    weightCutSeverity: number; // difference in weight cut difficulty
    sizeAdvantage: number; // composite of height/reach/weight
  };
  
  // Experience differentials
  experienceDifferentials: {
    totalFights: number;
    titleFights: number;
    fiveRoundFights: number;
    championshipRounds: number; // rounds 4-5 experience
    highLevelOpponents: number; // ranked opponents faced
  };
  
  // Performance differentials
  performanceDifferentials: {
    strikeAccuracy: number;
    strikeDefense: number;
    takedownAccuracy: number;
    takedownDefense: number;
    submissionDefense: number;
    knockdownRatio: number;
    controlTime: number;
    finishRate: number;
    cardio: number; // later round performance
    damageOutput: number; // strikes landed per minute
    damageAbsorption: number; // strikes absorbed per minute
  };
  
  // Style analysis
  styleAnalysis: {
    strikerVsGrappler: number;
    wrestlingDominance: number;
    clinchAdvantage: number;
    cageControl: number;
    cardioAdvantage: number;
    fightIQGap: number;
    adaptabilityGap: number;
    stylisticThreats: string[]; // e.g. ['Fighter1 struggles against southpaws']
  };
  
  // Contextual factors
  contextualFactors: {
    homeAdvantage: number;
    elevationImpact: number;
    travelImpact: number;
    shortNoticeImpact: number;
    weightCutImpact: number;
    prefightMomentum: number; // media/faceoff metrics
  };
  
  // Historical data
  sharedOpponents: SharedOpponentComparison[];
  historicalMatchups?: Array<{
    date: string;
    winner: string;
    method: string;
    rounds: number;
    significantStrikes: {
      fighter1: number;
      fighter2: number;
    };
    takedowns: {
      fighter1: number;
      fighter2: number;
    };
  }>;
  
  // Prediction metrics
  predictionMetrics: {
    keyAdvantages: string[];
    potentialXFactors: string[];
    mostLikelyPathsToVictory: string[];
    mostProbableFinishes: string[];
  };
  
  meta: {
    lastUpdated: string;
    dataSources: string[];
    confidenceScore: number; // 0-100
    dataCompleteness: number; // 0-100
  };
}

// Enhanced utility functions
export function createEnhancedMatchup(
  fighter1Data: FighterProfile & { stats: CareerStats, style: FightingStyle, recentFights: RecentFight[] },
  fighter2Data: FighterProfile & { stats: CareerStats, style: FightingStyle, recentFights: RecentFight[] },
  context: FightContext,
  sharedOpponents: SharedOpponentComparison[] = [],
  historicalMatchups?: MatchupComparison['historicalMatchups']
): MatchupComparison {
  // Calculate all differentials
  const physicalDiffs = calculatePhysicalDifferentials(fighter1Data, fighter2Data);
  const expDiffs = calculateExperienceDifferentials(fighter1Data.stats, fighter2Data.stats);
  const perfDiffs = calculatePerformanceDifferentials(fighter1Data.stats, fighter2Data.stats);
  const styleAnalysis = calculateStyleAnalysis(fighter1Data.style, fighter2Data.style);
  const contextFactors = calculateContextualFactors(context);
  
  return {
    fighters: {
      fighter1: fighter1Data,
      fighter2: fighter2Data
    },
    physicalDifferentials: physicalDiffs,
    experienceDifferentials: expDiffs,
    performanceDifferentials: perfDiffs,
    styleAnalysis,
    contextualFactors: contextFactors,
    sharedOpponents,
    historicalMatchups,
    predictionMetrics: {
      keyAdvantages: [],
      potentialXFactors: [],
      mostLikelyPathsToVictory: [],
      mostProbableFinishes: []
    },
    meta: {
      lastUpdated: new Date().toISOString(),
      dataSources: ['UFCStats', 'SportsRadar', 'Tapology', 'FightMetric'],
      confidenceScore: 85,
      dataCompleteness: 90
    }
  };
}

// Helper calculation functions
function calculatePhysicalDifferentials(f1: FighterProfile, f2: FighterProfile) {
  return {
    age: f1.age - f2.age,
    height: f1.height - f2.height,
    reach: f1.reach - f2.reach,
    weightCutSeverity: (f1.lastWeightCut?.percentageOfBodyWeight || 0) - 
                      (f2.lastWeightCut?.percentageOfBodyWeight || 0),
    sizeAdvantage: ((f1.height + f1.reach) - (f2.height + f2.reach)) / 2
  };
}

function calculateExperienceDifferentials(s1: CareerStats, s2: CareerStats) {
  return {
    totalFights: (s1.wins + s1.losses) - (s2.wins + s2.losses),
    titleFights: (s1.winsByKO + s1.winsByDecision) - (s2.winsByKO + s2.winsByDecision), // Simplified
    fiveRoundFights: 0, // Would be calculated from fight history
    championshipRounds: 0,
    highLevelOpponents: 0
  };
}

function calculatePerformanceDifferentials(s1: CareerStats, s2: CareerStats) {
  return {
    strikeAccuracy: s1.strikeAccuracy - s2.strikeAccuracy,
    strikeDefense: s1.strikeDefense - s2.strikeDefense,
    takedownAccuracy: s1.takedownAccuracy - s2.takedownAccuracy,
    takedownDefense: s1.takedownDefense - s2.takedownDefense,
    submissionDefense: s1.submissionDefense - s2.submissionDefense,
    knockdownRatio: s1.knockdownsLanded - s2.knockdownsLanded,
    controlTime: s1.controlTimePercentage - s2.controlTimePercentage,
    finishRate: s1.finishRate - s2.finishRate,
    cardio: s1.cardioIndex - s2.cardioIndex,
    damageOutput: s1.sigStrikesLandedPerMin - s2.sigStrikesLandedPerMin,
    damageAbsorption: s1.sigStrikesAbsorbedPerMin - s2.sigStrikesAbsorbedPerMin
  };
}

function calculateStyleAnalysis(style1: FightingStyle, style2: FightingStyle) {
  return {
    strikerVsGrappler: style1.striking - style2.grappling,
    wrestlingDominance: style1.wrestling - style2.wrestling,
    clinchAdvantage: style1.clinchWork - style2.clinchWork,
    cageControl: style1.cageWork - style2.cageWork,
    cardioAdvantage: style1.cardio - style2.cardio,
    fightIQGap: style1.fightIQ - style2.fightIQ,
    adaptabilityGap: style1.adaptability - style2.adaptability,
    stylisticThreats: determineStylisticThreats(style1, style2)
  };
}

function determineStylisticThreats(style1: FightingStyle, style2: FightingStyle): string[] {
  const threats = [];
  
  if (style1.striking < 50 && style2.striking > 75) {
    threats.push(`${style2.classification} may dominate striking exchanges`);
  }
  
  if (style1.grappling < 50 && style2.grappling > 75) {
    threats.push(`${style2.classification} may dominate ground exchanges`);
  }
  
  if (style1.wrestling < style2.wrestling * 0.7) {
    threats.push(`Significant wrestling disadvantage`);
  }
  
  return threats;
}

function calculateContextualFactors(context: FightContext) {
  return {
    homeAdvantage: context.location.isHomeTerritory ? 15 : 0,
    elevationImpact: context.location.elevation > 1500 ? 10 : 0,
    travelImpact: context.location.travelDistance > 8000 ? 5 : 0,
    shortNoticeImpact: context.isShortNotice ? 20 : 0,
    weightCutImpact: context.weightCutStatus?.weightCutDifficulty === 'Brutal' ? 15 : 0,
    prefightMomentum: context.prefightMetrics?.faceoffIntensity || 50
  };
}
