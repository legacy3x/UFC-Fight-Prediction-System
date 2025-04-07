import { FighterProfile } from '../types/matchup';

export class DataQuality {
  static checkCompleteness(profile: FighterProfile) {
    const requiredFields = ['name', 'stats.strikeAccuracy', 'stats.takedownAccuracy'];
    return requiredFields.every(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], profile);
      return value !== undefined && value !== null;
    });
  }

  static checkConsistency(profile: FighterProfile) {
    if (profile.stats?.strikeAccuracy > 100) return false;
    if (profile.stats?.takedownAccuracy > 100) return false;
    if (profile.height && profile.height < 100) return false;
    return true;
  }

  static calculateQualityScore(profile: FighterProfile) {
    let score = 0;
    if (this.checkCompleteness(profile)) score += 50;
    if (this.checkConsistency(profile)) score += 30;
    if (profile.lastFightDate) score += 20;
    return score;
  }
}
