import { UFCStatsScraper } from '../utils/scrapers/ufcStatsScraper';
import { TapologyScraper } from '../utils/scrapers/tapologyScraper';
import { SherdogScraper } from '../utils/scrapers/sherdogScraper';
import { supabase } from './client';
import { dataQualityCheck } from '../utils/dataQuality';

export class ScraperService {
  private static scrapers = {
    ufcstats: new UFCStatsScraper(),
    tapology: new TapologyScraper(),
    sherdog: new SherdogScraper()
  };

  static async scrapeFighter(name: string) {
    const results = await Promise.allSettled([
      this.scrapers.ufcstats.scrapeFighter(name),
      this.scrapers.tapology.scrapeFighter(name),
      this.scrapers.sherdog.scrapeFighter(name)
    ]);

    const successful = results
      .filter(r => r.status === 'fulfilled' && r.value.success)
      .map(r => (r as PromiseFulfilledResult<any>).value.data);

    if (successful.length === 0) {
      throw new Error(`No data found for fighter ${name}`);
    }

    // Merge data from different sources
    const mergedData = successful.reduce((acc, data) => ({ ...acc, ...data }), {});
    
    // Validate data quality
    const { valid, errors } = dataQualityCheck(mergedData);
    if (!valid) {
      throw new Error(`Data quality issues: ${errors.join(', ')}`);
    }

    // Store in database
    const { error } = await supabase
      .from('fighters')
      .upsert(mergedData, { onConflict: 'name' });

    if (error) throw error;

    return mergedData;
  }

  static async scrapeUpcomingEvents() {
    // Implementation for scraping upcoming events
    // Similar pattern to scrapeFighter
  }
}
