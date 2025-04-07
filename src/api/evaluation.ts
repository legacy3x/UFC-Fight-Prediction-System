import { supabase } from './client';
import FightModel from './model';

export class ModelEvaluator {
  static async evaluatePerformance() {
    // Get test data
    const { data: testData } = await supabase
      .from('test_fights')
      .select('*')
      .limit(100);

    if (!testData || testData.length === 0) {
      throw new Error('No test data available');
    }

    // Run predictions
    const predictions = await Promise.all(
      testData.map(async fight => {
        const prediction = await FightModel.predict(fight.features);
        return {
          ...prediction,
          actual: fight.outcome,
          isCorrect: prediction.winner === fight.outcome.winner
        };
      })
    );

    // Calculate metrics
    const correct = predictions.filter(p => p.isCorrect).length;
    const accuracy = correct / predictions.length;
    
    const confusionMatrix = {
      truePositives: predictions.filter(p => 
        p.isCorrect && p.winner === 'Fighter1').length,
      falsePositives: predictions.filter(p => 
        !p.isCorrect && p.winner === 'Fighter1').length,
      falseNegatives: predictions.filter(p => 
        !p.isCorrect && p.winner === 'Fighter2').length,
      trueNegatives: predictions.filter(p => 
        p.isCorrect && p.winner === 'Fighter2').length
    };

    // Store metrics
    const { error } = await supabase
      .from('model_performance')
      .insert({
        accuracy,
        precision: confusionMatrix.truePositives / 
          (confusionMatrix.truePositives + confusionMatrix.falsePositives),
        recall: confusionMatrix.truePositives / 
          (confusionMatrix.truePositives + confusionMatrix.falseNegatives),
        f1: 2 * (confusionMatrix.truePositives / 
          (confusionMatrix.truePositives + 0.5 * 
           (confusionMatrix.falsePositives + confusionMatrix.falseNegatives))),
        confusion_matrix: confusionMatrix,
        test_size: predictions.length
      });

    if (error) throw error;

    return {
      accuracy,
      confusionMatrix,
      predictions
    };
  }
}
