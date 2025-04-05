import { MatchupComparison } from '../types/matchup';

// Core feature calculations
export function calculateFeatures(matchup: MatchupComparison) {
  const { fighter1, fighter2 } = matchup.fighters;
  const { physicalDifferentials, performanceDifferentials, styleAnalysis } = matchup;

  return {
    // Physical attributes
    reachAdvantage: physicalDifferentials.reach,
    ageGap: Math.abs(physicalDifferentials.age),
    heightDifference: physicalDifferentials.height,
    sizeAdvantage: physicalDifferentials.sizeAdvantage,
    weightCutSeverity: physicalDifferentials.weightCutSeverity,

    // Experience metrics
    experienceGap: matchup.experienceDifferentials.totalFights,
    titleFightGap: matchup.experienceDifferentials.titleFights,
    fiveRoundExperience: matchup.experienceDifferentials.fiveRoundFights,
    highLevelOpponentGap: matchup.experienceDifferentials.highLevelOpponents,

    // Striking features
    strikingAccuracyDiff: performanceDifferentials.strikeAccuracy,
    strikingDefenseDiff: performanceDifferentials.strikeDefense,
    strikingDifferential: (fighter1.stats.sigStrikesLandedPerMin - fighter1.stats.sigStrikesAbsorbedPerMin) - 
                         (fighter2.stats.sigStrikesLandedPerMin - fighter2.stats.sigStrikesAbsorbedPerMin),
    headStrikeAccuracyDiff: fighter1.stats.headStrikeAccuracy - fighter2.stats.headStrikeAccuracy,
    knockdownRatioDiff: performanceDifferentials.knockdownRatio,

    // Grappling features
    takedownAccuracyDiff: performanceDifferentials.takedownAccuracy,
    takedownDefenseDiff: performanceDifferentials.takedownDefense,
    controlTimeDiff: performanceDifferentials.controlTime,
    submissionDefenseDiff: performanceDifferentials.submissionDefense,
    grapplingDifferential: (fighter1.style.grappling + fighter1.style.wrestling) - 
                          (fighter2.style.grappling + fighter2.style.wrestling),

    // Activity metrics
    activityScore: calculateActivityScore(fighter1, fighter2),
    daysSinceLastFight: matchup.contextualFactors.daysSinceLastFight,

    // Finish potential
    finishRateDiff: performanceDifferentials.finishRate,
    koPowerDiff: fighter1.style.power - fighter2.style.power,
    submissionThreatDiff: fighter1.style.submissionOffense - fighter2.style.submissionOffense,

    // Style matchup features
    strikerVsGrappler: styleAnalysis.strikerVsGrappler,
    wrestlingDominance: styleAnalysis.wrestlingDominance,
    cardioAdvantage: styleAnalysis.cardioAdvantage,
    fightIQGap: styleAnalysis.fightIQGap,
    stylisticThreats: styleAnalysis.stylisticThreats.length,

    // Contextual factors
    homeAdvantage: matchup.contextualFactors.homeAdvantage,
    elevationImpact: matchup.contextualFactors.elevationImpact,
    travelImpact: matchup.contextualFactors.travelImpact,
    shortNoticeImpact: matchup.contextualFactors.shortNoticeImpact,
    prefightMomentum: matchup.contextualFactors.prefightMomentum,

    // Shared opponent metrics
    sharedOpponentWinRatio: calculateSharedOpponentWinRatio(matchup.sharedOpponents),
    sharedOpponentStrikeDiff: calculateSharedOpponentStrikeDiff(matchup.sharedOpponents)
  };
}

// Helper functions
function calculateActivityScore(fighter1: any, fighter2: any) {
  // Count fights in last 12 months (would come from recentFights data)
  const fighter1Activity = fighter1.recentFights?.filter(f => 
    new Date(f.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  ).length || 0;
  
  const fighter2Activity = fighter2.recentFights?.filter(f => 
    new Date(f.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  ).length || 0;

  return fighter1Activity - fighter2Activity;
}

function calculateSharedOpponentWinRatio(sharedOpponents: any[]) {
  if (!sharedOpponents.length) return 0;
  
  const wins = sharedOpponents.filter(o => o.fighter1Result === 'Win').length;
  return wins / sharedOpponents.length;
}

function calculateSharedOpponentStrikeDiff(sharedOpponents: any[]) {
  if (!sharedOpponents.length) return 0;
  
  return sharedOpponents.reduce((sum, o) => sum + (o.commonMetrics?.strikesLandedDiff || 0), 0) / 
         sharedOpponents.length;
}

// Feature importance weights (for model training)
export const featureWeights = {
  physical: {
    reachAdvantage: 0.15,
    ageGap: 0.10,
    sizeAdvantage: 0.12
  },
  striking: {
    strikingDifferential: 0.20,
    knockdownRatioDiff: 0.18,
    headStrikeAccuracyDiff: 0.15
  },
  grappling: {
    grapplingDifferential: 0.15,
    controlTimeDiff: 0.12
  },
  intangibles: {
    cardioAdvantage: 0.18,
    fightIQGap: 0.15,
    stylisticThreats: 0.10
  },
  context: {
    homeAdvantage: 0.12,
    shortNoticeImpact: 0.15
  }
};

// Feature grouping for analysis
export const featureGroups = {
  physical: [
    'reachAdvantage', 'ageGap', 'heightDifference', 
    'sizeAdvantage', 'weightCutSeverity'
  ],
  experience: [
    'experienceGap', 'titleFightGap', 
    'fiveRoundExperience', 'highLevelOpponentGap'
  ],
  striking: [
    'strikingAccuracyDiff', 'strikingDefenseDiff',
    'strikingDifferential', 'headStrikeAccuracyDiff',
    'knockdownRatioDiff'
  ],
  grappling: [
    'takedownAccuracyDiff', 'takedownDefenseDiff',
    'controlTimeDiff', 'submissionDefenseDiff',
    'grapplingDifferential'
  ],
  activity: [
    'activityScore', 'daysSinceLastFight'
  ],
  finishing: [
    'finishRateDiff', 'koPowerDiff',
    'submissionThreatDiff'
  ],
  style: [
    'strikerVsGrappler', 'wrestlingDominance',
    'cardioAdvantage', 'fightIQGap',
    'stylisticThreats'
  ],
  context: [
    'homeAdvantage', 'elevationImpact',
    'travelImpact', 'shortNoticeImpact',
    'prefightMomentum'
  ],
  historical: [
    'sharedOpponentWinRatio', 'sharedOpponentStrikeDiff'
  ]
};
