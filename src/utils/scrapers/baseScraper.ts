import axios from 'axios';
import { RateLimiter } from 'limiter';
import { createClient } from '@supabase/supabase-js';
import { PipelineMetrics } from '../pipelineMetrics';

interface ScrapeResult {
  success: boolean;
  data?: any;
  error?: string;
  source: string;
  timestamp: Date;
  retryCount?: number;
}

abstract class BaseScraper {
  protected limiter = new RateLimiter({
    tokensPerInterval: 5,
    interval: 1000
  });
  
  protected supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
  );

  protected maxRetries = 3;
  protected retryDelay = 5000; // 5 seconds
  protected logger = new ScraperLogger();

  constructor(protected source: string) {}

  abstract scrapeFighter(name: string): Promise<ScrapeResult>;
  abstract scrapeRecentFights(): Promise<ScrapeResult>;

  protected async makeRequest(url: string, retryCount = 0): Promise<any> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    try {
      await this.limiter.removeTokens(1);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) UFC-Predict/1.0'
        },
        timeout: 5000
      });

      this.logger.logSuccess({
        source: this.source,
        url,
        duration: Date.now() - startTime,
        status: response.status
      });

      return response.data;
    } catch (error) {
      lastError = error;
      this.logger.logError({
        source: this.source,
        url,
        error: error.message,
        status: error.response?.status,
        retryCount
      });

      if (retryCount < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.makeRequest(url, retryCount + 1);
      }

      throw new Error(`Request failed after ${retryCount} retries: ${error.message}`);
    } finally {
      await PipelineMetrics.trackRequest({
        source: this.source,
        url,
        success: !lastError,
        duration: Date.now() - startTime,
        retryCount
      });
    }
  }

  protected async storeScrapeResult(result: ScrapeResult) {
    const { error } = await this.supabase
      .from('scrape_history')
      .insert({
        source: this.source,
        success: result.success,
        data: result.data,
        error: result.error,
        retry_count: result.retryCount || 0
      });
    
    if (error) {
      this.logger.logError({
        source: this.source,
        error: `Failed to store scrape result: ${error.message}`,
        context: 'result_storage'
      });
    }
  }

  protected async handleScrapeError(
    operation: string,
    error: Error,
    retryCount = 0
  ): Promise<ScrapeResult> {
    this.logger.logError({
      source: this.source,
      operation,
      error: error.message,
      stack: error.stack,
      retryCount
    });

    const result: ScrapeResult = {
      success: false,
      error: error.message,
      source: this.source,
      timestamp: new Date(),
      retryCount
    };

    await this.storeScrapeResult(result);
    return result;
  }
}

class ScraperLogger {
  private logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  };
  private currentLevel = this.logLevels.info;

  logError(details: {
    source: string;
    error: string;
    url?: string;
    status?: number;
    operation?: string;
    stack?: string;
    retryCount?: number;
    context?: string;
  }) {
    this.logToConsole('error', details);
    this.logToSupabase('error', details);
  }

  logSuccess(details: {
    source: string;
    url: string;
    duration: number;
    status: number;
  }) {
    this.logToConsole('info', details);
    this.logToSupabase('info', details);
  }

  private logToConsole(level: keyof typeof this.logLevels, data: any) {
    if (this.logLevels[level] > this.currentLevel) return;
    
    const timestamp = new Date().toISOString();
    const message = level === 'error' 
      ? `[${timestamp}] [${level.toUpperCase()}] ${data.source}: ${data.error}`
      : `[${timestamp}] [${level.toUpperCase()}] ${data.source}: Request to ${data.url} succeeded in ${data.duration}ms`;

    console[level](message, level === 'error' ? data : '');
  }

  private async logToSupabase(level: string, data: any) {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );

    await supabase
      .from('scraper_logs')
      .insert({
        level,
        source: data.source,
        message: level === 'error' ? data.error : 'Request succeeded',
        metadata: {
          url: data.url,
          status: data.status,
          duration: data.duration,
          operation: data.operation,
          retryCount: data.retryCount,
          context: data.context
        },
        timestamp: new Date()
      })
      .then(({ error }) => {
        if (error) {
          console.error('Failed to store log:', error);
        }
      });
  }
}

export { BaseScraper, ScrapeResult };
