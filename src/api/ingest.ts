// Add to existing imports
import { PipelineMetrics } from '../utils/pipelineMetrics';
import { DataQuality } from '../utils/dataQuality';

// Modify ingestFighterData
export async function ingestFighterData(scrapedData: unknown) {
  const startTime = Date.now();
  let recordsProcessed = 0;
  
  try {
    const validated = FighterSchema.parse(scrapedData);
    recordsProcessed = 1;

    // Data quality check
    const qualityScore = DataQuality.calculateQualityScore(validated);
    if (qualityScore < 70) {
      console.warn(`Low quality data for ${validated.name}: ${qualityScore}`);
    }

    // Rest of existing logic...

    await PipelineMetrics.trackRun(
      'ingest',
      Date.now() - startTime,
      recordsProcessed,
      true
    );
    return { success: true, data, corrected };
  } catch (error) {
    await PipelineMetrics.trackRun(
      'ingest', 
      Date.now() - startTime,
      recordsProcessed,
      false
    );
    await logError(error);
    return { success: false, error: error.message };
  }
}
