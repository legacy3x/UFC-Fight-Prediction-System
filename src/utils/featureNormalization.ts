import { MatchupComparison } from '../types/matchup';

export class FeatureNormalizer {
  private static minMaxValues = {
    reachAdvantage: { min: -20, max: 20 },
    ageGap: { min: 0, max: 20 },
    strikingDifferential: { min: -5, max: 5 },
    grapplingDifferential: { min: -3, max: 3 }
  };

  static normalize(features: any) {
    const normalized: any = {};
    
    for (const [key, value] of Object.entries(features)) {
      if (this.minMaxValues[key]) {
        const { min, max } = this.minMaxValues[key];
        normalized[key] = (value - min) / (max - min);
      } else {
        normalized[key] = value;
      }
    }

    return normalized;
  }

  static standardize(features: any, means: any, stdDevs: any) {
    const standardized: any = {};
    
    for (const [key, value] of Object.entries(features)) {
      if (means[key] !== undefined && stdDevs[key] !== undefined) {
        standardized[key] = (value - means[key]) / stdDevs[key];
      } else {
        standardized[key] = value;
      }
    }

    return standardized;
  }
}
