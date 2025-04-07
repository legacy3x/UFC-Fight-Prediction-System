import { scrapeAllSources } from '../api/scrape';
import { ingestFighterData } from '../api/ingest';
import { PipelineMetrics } from '../utils/pipelineMetrics';
import { ScraperLogger } from '../utils/scrapers/baseScraper';

const logger = new ScraperLogger();

export async function runDailyScrape() {
  const startTime = Date.now();
  let recordsProcessed = 0;
  
  try {
    logger.logInfo({
      source: 'scrape_job',
      message: 'Starting daily scrape job'
    });

    const fighters = await scrapeAllSources();
    recordsProcessed = fighters.length;

    logger.logInfo({
      source: 'scrape_job',
      message: `Scraped ${recordsProcessed} fighters, beginning ingestion`
    });

    for (const [index, fighter] of fighters.entries()) {
      try {
        await ingestFighterData(fighter);
        if (index % 10 === 0) {
          logger.logInfo({
            source: 'scrape_job',
            message: `Processed ${index + 1}/${fighters.length} fighters`
          });
        }
      } catch (error) {
        logger.logError({
          source: 'scrape_job',
          error: `Failed to ingest fighter ${fighter.name}: ${error.message}`,
          context: 'ingestion'
        });
      }
    }

    await PipelineMetrics.trackRun(
      'daily_scrape',
      Date.now() - startTime,
      recordsProcessed,
      true
    );

    logger.logInfo({
      source: 'scrape_job',
      message: `Scrape job completed successfully in ${Date.now() - startTime}ms`
    });
  } catch (error) {
    await PipelineMetrics.trackRun(
      'daily_scrape',
      Date.now() - startTime,
      recordsProcessed,
      false,
      error.message
    );

    logger.logError({
      source: 'scrape_job',
      error: `Scrape job failed: ${error.message}`,
      stack: error.stack,
      context: 'scrape_job'
    });

    throw error;
  }
}

// Add retry wrapper for the entire job
export async function runScrapeWithRetries(maxRetries = 3, delay = 30000) {
  let attempt = 0;
  let lastError: Error;

  while (attempt < maxRetries) {
    try {
      return await runDailyScrape();
    } catch (error) {
      attempt++;
      lastError = error;
      
      logger.logError({
        source: 'scrape_job',
        error: `Attempt ${attempt} failed: ${error.message}`,
        context: 'retry'
      });

      if (attempt < maxRetries) {
        logger.logInfo({
          source: 'scrape_job',
          message: `Retrying in ${delay / 1000} seconds...`
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
