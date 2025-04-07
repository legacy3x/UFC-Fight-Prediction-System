import { z } from 'zod';
import { FighterProfile, CareerStats } from '../types/matchup';

// Statistical validation thresholds
const STATS_THRESHOLDS = {
  strikeAccuracy: { min: 20, max: 100 },
  takedownAccuracy: { min: 0, max: 100 },
  sigStrikesLanded: { min: 0, max: 20 }
};

export const FighterValidation = {
  basic: (data: Partial<FighterProfile>) => {
    if (!data.name || data.name.length < 2) return false;
    if (data.height && (data.height < 100 || data.height > 250)) return false;
    if (data.reach && (data.reach < 100 || data.reach > 300)) return false;
    return true;
  },

  stats: (stats: Partial<CareerStats>) => {
    if (!stats) return false;
    
    // Range validation
    if (stats.strikeAccuracy && 
        (stats.strikeAccuracy < STATS_THRESHOLDS.strikeAccuracy.min || 
         stats.strikeAccuracy > STATS_THRESHOLDS.strikeAccuracy.max)) return false;
         
    // Cross-field validation
    if (stats.takedownAccuracy && stats.takedownDefense &&
        stats.takedownAccuracy > stats.takedownDefense) {
      return false;
    }
    
    // Statistical outlier detection
    if (stats.sigStrikesLandedPerMin && 
        stats.sigStrikesLandedPerMin > STATS_THRESHOLDS.sigStrikesLanded.max * 1.5) {
      return false;
    }
    
    return true;
  },

  historicalConsistency: (current: CareerStats, historical: CareerStats[]) => {
    if (historical.length === 0) return true;
    
    const avgStrikeAcc = historical.reduce((sum, s) => sum + (s.strikeAccuracy || 0), 0) / historical.length;
    if (Math.abs((current.strikeAccuracy || 0) - avgStrikeAcc) > 20) {
      return false; // Significant deviation from historical average
    }
    return true;
  },

  record: (record: { wins: number; losses: number }) => {
    if (record.wins < 0 || record.losses < 0) return false;
    if (record.wins + record.losses > 100) return false; // Sanity check
    return true;
  }
};

export function validateCompleteProfile(profile: FighterProfile) {
  return (
    FighterValidation.basic(profile) &&
    FighterValidation.stats(profile.stats) &&
    FighterValidation.record(profile.record || { wins: 0, losses: 0 })
  );
}
