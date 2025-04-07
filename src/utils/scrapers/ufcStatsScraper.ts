import { BaseScraper, ScrapeResult } from './baseScraper';
import * as cheerio from 'cheerio';

class UFCStatsScraper extends BaseScraper {
  constructor() {
    super('ufcstats');
  }

  async scrapeFighter(name: string): Promise<ScrapeResult> {
    try {
      const searchUrl = `http://ufcstats.com/statistics/fighters/search?query=${encodeURIComponent(name)}`;
      const searchPage = await this.makeRequest(searchUrl);
      const $ = cheerio.load(searchPage);
      
      // Extract fighter link and detailed stats
      const fighterLink = $('tbody tr:first-child td:first-child a').attr('href');
      if (!fighterLink) throw new Error('Fighter not found');
      
      const fighterPage = await this.makeRequest(fighterLink);
      const $$ = cheerio.load(fighterPage);
      
      const stats = {
        name: $$('.b-content__title-highlight').text().trim(),
        record: $$('.b-content__title-record').text().trim(),
        height: $$('.b-list__info-box_style li:contains("Height:")').text().split(':')[1].trim(),
        reach: $$('.b-list__info-box_style li:contains("Reach:")').text().split(':')[1].trim(),
        strikes: {
          landedPerMin: $$('.b-list__info-box_style li:contains("SLpM:")').text().split(':')[1].trim(),
          accuracy: $$('.b-list__info-box_style li:contains("Str. Acc.:")').text().split(':')[1].trim()
        },
        grappling: {
          takedownAvg: $$('.b-list__info-box_style li:contains("TD Avg.:")').text().split(':')[1].trim(),
          takedownDef: $$('.b-list__info-box_style li:contains("TD Def.:")').text().split(':')[1].trim()
        }
      };

      const result: ScrapeResult = {
        success: true,
        data: stats,
        source: this.source,
        timestamp: new Date()
      };

      await this.storeScrapeResult(result);
      return result;
    } catch (error) {
      const result: ScrapeResult = {
        success: false,
        error: error.message,
        source: this.source,
        timestamp: new Date()
      };
      await this.storeScrapeResult(result);
      return result;
    }
  }

  async scrapeRecentFights(): Promise<ScrapeResult> {
    // Implementation for scraping recent fight cards
    // Similar pattern to scrapeFighter
  }
}

export default UFCStatsScraper;
