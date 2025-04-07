import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

class PipelineMetrics {
  static async trackRun(
    pipelineName: string,
    duration: number,
    recordsProcessed: number,
    success: boolean,
    error?: string
  ) {
    await supabase
      .from('pipeline_runs')
      .insert({
        pipeline_name: pipelineName,
        duration_ms: duration,
        records_processed: recordsProcessed,
        success,
        error,
        timestamp: new Date()
      });
  }

  static async trackRequest(requestData: {
    source: string;
    url: string;
    success: boolean;
    duration: number;
    retryCount: number;
  }) {
    await supabase
      .from('scraper_requests')
      .insert({
        source: requestData.source,
        url: requestData.url,
        success: requestData.success,
        duration_ms: requestData.duration,
        retry_count: requestData.retryCount,
        timestamp: new Date()
      });
  }

  static async getRecentFailures(hours = 24) {
    const { data, error } = await supabase
      .from('scraper_logs')
      .select('*')
      .eq('level', 'error')
      .gte('timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getScraperHealth() {
    const { data: lastRuns } = await supabase
      .from('pipeline_runs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(3);

    const { data: errorStats } = await supabase
      .from('scraper_logs')
      .select('source, count(*)')
      .eq('level', 'error')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .group('source');

    const { data: requestStats } = await supabase
      .from('scraper_requests')
      .select('source, avg(duration_ms), count(*)')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .group('source');

    return {
      lastRuns,
      errorStats,
      requestStats
    };
  }
}

export { PipelineMetrics };
