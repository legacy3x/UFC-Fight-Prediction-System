import { PredictionResult } from '../types/matchup';
import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Anon Key must be set in environment variables');
}

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export class PredictionClient {
  private static baseUrl = '/api';

  static async predictFight(
    fighter1Id: string, 
    fighter2Id: string,
    options?: {
      predictionType?: 'standard' | 'detailed' | 'confidence';
      includeFeatureAnalysis?: boolean;
    }
  ): Promise<PredictionResult> {
    const response = await fetch(`${this.baseUrl}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAccessToken()}`
      },
      body: JSON.stringify({
        fighter1Id,
        fighter2Id,
        predictionType: options?.predictionType || 'standard',
        includeFeatureAnalysis: options?.includeFeatureAnalysis ?? true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Prediction failed');
    }

    return response.json();
  }

  static async getPredictionHistory(fighterId?: string): Promise<PredictionResult[]> {
    const url = fighterId 
      ? `${this.baseUrl}/predictions?fighterId=${fighterId}`
      : `${this.baseUrl}/predictions`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${await this.getAccessToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch prediction history');
    }
    return response.json();
  }

  private static async getAccessToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }
    return session.access_token;
  }
}
