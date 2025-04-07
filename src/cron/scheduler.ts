import { CronJob } from 'cron';
import { ScraperService } from '../api/scrape';
import { ModelEvaluator } from '../api/evaluation';
import { supabase } from '../api/client';

export class Scheduler {
  private static jobs: CronJob[] = [];

  static start() {
    // Daily fighter data refresh
    this.jobs.push(new CronJob(
      '0 4 * * *', // 4 AM daily
      async () => {
        try {
          const { data: fighters } = await supabase
            .from('fighters')
            .select('name')
            .order('last_updated', { ascending: true })
            .limit(10);

          if (fighters) {
            await Promise.all(
              fighters.map(f => ScraperService.scrapeFighter(f.name))
            );
          }
        } catch (error) {
          console.error('Daily scrape failed:', error);
        }
      },
      null,
      true,
      'America/New_York'
    ));

    // Weekly model evaluation
    this.jobs.push(new CronJob(
      '0 5 * * 1', // 5 AM every Monday
      async () => {
        try {
          await ModelEvaluator.evaluatePerformance();
        } catch (error) {
          console.error('Weekly evaluation failed:', error);
        }
      },
      null,
      true,
      'America/New_York'
    ));

    // Monthly model retraining
    this.jobs.push(new CronJob(
      '0 6 1 * *', // 6 AM on 1st of each month
      async () => {
        try {
          const { data: trainingData } = await supabase
            .from('training_fights')
            .select('*');

          if (trainingData) {
            await FightModel.train(trainingData);
          }
        } catch (error) {
          console.error('Monthly training failed:', error);
        }
      },
      null,
      true,
      'America/New_York'
    ));
  }

  static stop() {
    this.jobs.forEach(job => job.stop());
  }
}
