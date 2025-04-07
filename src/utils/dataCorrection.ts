// Previous imports remain
import _ from 'lodash';

export class DataCorrector {
  // Previous static methods remain

  static async getCorrectionConfidence(
    original: FighterProfile, 
    corrected: FighterProfile,
    historical: CareerStats[]
  ): Promise<number> {
    let confidence = 1.0;
    
    // Reduce confidence for large deviations from historical
    if (original.stats?.strikeAccuracy && corrected.stats?.strikeAccuracy) {
      const historicalAvg = _.meanBy(historical, 'strikeAccuracy');
      const deviation = Math.abs(corrected.stats.strikeAccuracy - historicalAvg) / 100;
      confidence *= 1 - Math.min(0.5, deviation);
    }

    // Reduce confidence for multiple corrections
    const correctionCount = Object.keys(original).filter(
      k => !_.isEqual(original[k], corrected[k])
    ).length;
    confidence *= Math.max(0.7, 1 - (correctionCount * 0.1));

    return Math.round(confidence * 100) / 100;
  }

  static async submitForReview(
    original: FighterProfile,
    corrected: FighterProfile
  ): Promise<void> {
    const confidence = await this.getCorrectionConfidence(
      original,
      corrected,
      await this.getHistoricalStats(original.name)
    );

    await supabase
      .from('pending_corrections')
      .insert({
        original_data: original,
        proposed_data: corrected,
        confidence_score: confidence,
        status: 'pending',
        submitted_at: new Date()
      });
  }

  static async analyzeHistoricalTrends(name: string): Promise<{
    strikeAccuracyTrend: number;
    takedownAccuracyTrend: number;
    anomalyScore: number;
  }> {
    const historical = await this.getHistoricalStats(name);
    if (historical.length < 3) return {
      strikeAccuracyTrend: 0,
      takedownAccuracyTrend: 0,
      anomalyScore: 0
    };

    // Calculate linear regression trends
    const strikeTrend = this.calculateTrend(
      historical.map((h, i) => ({x: i, y: h.strikeAccuracy || 0}))
    );
    const takedownTrend = this.calculateTrend(
      historical.map((h, i) => ({x: i, y: h.takedownAccuracy || 0}))
    );

    // Calculate anomaly score (0-1)
    const recent = historical.slice(-3);
    const avgStrike = _.meanBy(recent, 'strikeAccuracy');
    const stdStrike = Math.sqrt(
      _.sumBy(recent, h => Math.pow((h.strikeAccuracy || 0) - avgStrike, 2)) / recent.length
    );
    const anomalyScore = stdStrike > 10 ? 0.8 : stdStrike > 5 ? 0.5 : 0.2;

    return {
      strikeAccuracyTrend: strikeTrend,
      takedownAccuracyTrend: takedownTrend,
      anomalyScore
    };
  }

  private static calculateTrend(points: {x: number, y: number}[]): number {
    const n = points.length;
    const sumX = _.sumBy(points, 'x');
    const sumY = _.sumBy(points, 'y');
    const sumXY = _.sumBy(points, p => p.x * p.y);
    const sumXX = _.sumBy(points, p => p.x * p.x);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return Math.round(slope * 100) / 100;
  }
}

// Update autoCorrectAllFighters to use review system
export async function autoCorrectAllFighters() {
  const { data: fighters } = await supabase
    .from('fighters')
    .select('*');

  if (!fighters) return;

  for (const fighter of fighters) {
    if (!Validation.validateCompleteProfile(fighter)) {
      const corrected = await DataCorrector.correctFighterProfile(fighter);
      const { anomalyScore } = await DataCorrector.analyzeHistoricalTrends(fighter.name);
      
      if (anomalyScore > 0.7) {
        await DataCorrector.submitForReview(fighter, corrected);
      } else {
        await supabase
          .from('fighters')
          .update(corrected)
          .eq('name', fighter.name);
      }
    }
  }
}
