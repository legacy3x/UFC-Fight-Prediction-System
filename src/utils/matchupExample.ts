import { MatchupComparison, createMatchupTemplate } from '../types/matchup';

// Example usage with mock data
export const exampleMatchup: MatchupComparison = createMatchupTemplate(
  {
    id: 'fighter-001',
    name: 'Israel Adesanya',
    age: 34,
    weightClass: 'Middleweight',
    height: 193,
    reach: 203,
    stance: 'Orthodox',
    team: 'City Kickboxing',
    stats: {
      wins: 24,
      losses: 3,
      draws: 0,
      winStreak: 2,
      winsByKO: 16,
      winsBySubmission: 0,
      winsByDecision: 8,
      avgFightTime: 1024,
      sigStrikesLandedPerMin: 4.32,
      sigStrikesAbsorbedPerMin: 3.12,
      strikeAccuracy: 50.2,
      strikeDefense: 62.1,
      takedownAvgPer15Min: 0.5,
      takedownAccuracy: 30.0,
      takedownDefense: 78.0,
      submissionAvgPer15Min: 0.1,
      knockdownRatio: 2.4,
      controlTimePercentage: 12.5
    },
    style: {
      striking: 95,
      grappling: 30,
      wrestling: 25,
      cardio: 85,
      power: 90,
      chin: 80,
      submissionDefense: 65,
      classification: 'Striker'
    }
  },
  {
    id: 'fighter-002',
    name: 'Sean Strickland',
    age: 32,
    weightClass: 'Middleweight',
    height: 185,
    reach: 193,
    stance: 'Orthodox',
    team: 'Xtreme Couture',
    stats: {
      wins: 28,
      losses: 5,
      draws: 0,
      winStreak: 3,
      winsByKO: 11,
      winsBySubmission: 4,
      winsByDecision: 13,
      avgFightTime: 876,
      sigStrikesLandedPerMin: 5.67,
      sigStrikesAbsorbedPerMin: 4.21,
      strikeAccuracy: 42.3,
      strikeDefense: 58.7,
      takedownAvgPer15Min: 1.2,
      takedownAccuracy: 45.0,
      takedownDefense: 72.0,
      submissionAvgPer15Min: 0.8,
      knockdownRatio: 1.8,
      controlTimePercentage: 18.3
    },
    style: {
      striking: 80,
      grappling: 60,
      wrestling: 55,
      cardio: 90,
      power: 75,
      chin: 85,
      submissionDefense: 70,
      classification: 'Well-Rounded'
    }
  },
  {
    isTitleFight: true,
    isMainEvent: true,
    isShortNotice: false,
    daysSinceLastFight: 120,
    location: {
      city: 'Sydney',
      country: 'Australia',
      elevation: 6,
      timezoneOffset: 10
    }
  },
  [
    {
      opponentName: 'Alex Pereira',
      fighter1Result: 'Loss',
      fighter2Result: 'Win',
      commonMetrics: {
        strikesLandedDiff: -15, // F1 landed 15 fewer than F2
        controlTimeDiff: -2.3,  // F1 had 2.3 mins less control
        finishRoundDiff: 2      // F1 lost in R2, F2 won in R4
      }
    }
  ]
);

// Key metrics extraction for prediction model
export function extractKeyMetrics(matchup: MatchupComparison) {
  return {
    reachAdvantage: matchup.differentials.reach,
    ageDifference: matchup.differentials.age,
    strikeAccuracyDiff: matchup.differentials.strikeAccuracy,
    takedownDefenseDiff: matchup.differentials.takedownDefense,
    styleMatchup: matchup.styleComparison.strikerVsGrappler,
    cardioDifference: matchup.differentials.cardio,
    isShortNotice: matchup.context.isShortNotice,
    elevation: matchup.context.location.elevation,
    sharedOpponentWinRatio: matchup.sharedOpponents.length > 0 ? 
      matchup.sharedOpponents.filter(o => o.fighter1Result === 'Win').length / 
      matchup.sharedOpponents.length : 0.5
  };
}
