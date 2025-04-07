import { calculateFeatures, featureWeights } from './featureEngineering';
import { sampleFighters } from './sampleFighters';
import { MatchupComparison } from '../types/matchup';

describe('Feature Engineering', () => {
  const testMatchup: MatchupComparison = {
    fighters: {
      fighter1: sampleFighters.israelAdesanya,
      fighter2: sampleFighters.seanStrickland
    },
    physicalDifferentials: {
      reach: 8, // cm
      age: 2, // years
      height: 3, // cm
      sizeAdvantage: 0.4,
      weightCutSeverity: 0.2
    },
    experienceDifferentials: {
      totalFights: 5,
      titleFights: 3,
      fiveRoundFights: 2,
      highLevelOpponents: 4
    },
    performanceDifferentials: {
      strikeAccuracy: 0.12,
      strikeDefense: 0.08,
      knockdownRatio: 0.15,
      takedownAccuracy: 0.05,
      takedownDefense: 0.1,
      controlTime: 0.3,
      submissionDefense: 0.2,
      finishRate: 0.25
    },
    styleAnalysis: {
      strikerVsGrappler: 0.8,
      wrestlingDominance: 0.3,
      cardioAdvantage: 0.4,
      fightIQGap: 0.5,
      stylisticThreats: ['counter-striking', 'distance-control']
    },
    contextualFactors: {
      daysSinceLastFight: 120,
      homeAdvantage: 0.6,
      elevationImpact: 0,
      travelImpact: 0.2,
      shortNoticeImpact: 0,
      prefightMomentum: 0.7
    },
    sharedOpponents: [
      {
        fighter1Result: 'Win',
        commonMetrics: {
          strikesLandedDiff: 25
        }
      }
    ]
  };

  describe('calculateFeatures()', () => {
    it('should calculate physical features correctly', () => {
      const features = calculateFeatures(testMatchup);
      expect(features.reachAdvantage).toBe(8);
      expect(features.ageGap).toBe(2);
      expect(features.sizeAdvantage).toBe(0.4);
    });

    it('should calculate striking features correctly', () => {
      const features = calculateFeatures(testMatchup);
      expect(features.strikingAccuracyDiff).toBe(0.12);
      expect(features.knockdownRatioDiff).toBe(0.15);
      expect(features.strikingDifferential).toBeCloseTo(
        (sampleFighters.israelAdesanya.stats.sigStrikesLandedPerMin - 
         sampleFighters.israelAdesanya.stats.sigStrikesAbsorbedPerMin) - 
        (sampleFighters.seanStrickland.stats.sigStrikesLandedPerMin - 
         sampleFighters.seanStrickland.stats.sigStrikesAbsorbedPerMin)
      );
    });

    it('should calculate grappling features correctly', () => {
      const features = calculateFeatures(testMatchup);
      expect(features.takedownAccuracyDiff).toBe(0.05);
      expect(features.grapplingDifferential).toBeCloseTo(
        (sampleFighters.israelAdesanya.style.grappling + 
         sampleFighters.israelAdesanya.style.wrestling) - 
        (sampleFighters.seanStrickland.style.grappling + 
         sampleFighters.seanStrickland.style.wrestling)
      );
    });

    it('should calculate contextual features correctly', () => {
      const features = calculateFeatures(testMatchup);
      expect(features.homeAdvantage).toBe(0.6);
      expect(features.shortNoticeImpact).toBe(0);
      expect(features.prefightMomentum).toBe(0.7);
    });

    it('should calculate shared opponent metrics correctly', () => {
      const features = calculateFeatures(testMatchup);
      expect(features.sharedOpponentWinRatio).toBe(1);
      expect(features.sharedOpponentStrikeDiff).toBe(25);
    });
  });

  describe('featureWeights', () => {
    it('should have valid weight distributions', () => {
      // Check that weights sum to reasonable values per category
      const physicalSum = Object.values(featureWeights.physical).reduce((a, b) => a + b, 0);
      expect(physicalSum).toBeGreaterThan(0.3);
      expect(physicalSum).toBeLessThan(0.5);

      const strikingSum = Object.values(featureWeights.striking).reduce((a, b) => a + b, 0);
      expect(strikingSum).toBeGreaterThan(0.4);
      expect(strikingSum).toBeLessThan(0.7);
    });

    it('should have all features accounted for', () => {
      const allFeatureNames = new Set([
        ...Object.values(featureGroups).flat(),
      ]);
      
      // Check that all feature groups are represented in weights
      for (const group of Object.keys(featureGroups)) {
        expect(featureWeights).toHaveProperty(group);
      }
    });
  });
});
