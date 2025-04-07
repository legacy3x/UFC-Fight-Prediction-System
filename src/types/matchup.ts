import { z } from 'zod';

// Add to existing types
export interface PredictionResult {
  predictionId: string;
  timestamp: string;
  fighter1: {
    id: string;
    name: string;
    record: string;
  };
  fighter2: {
    id: string;
    name: string;
    record: string;
  };
  predictedWinner: 'Fighter1' | 'Fighter2';
  confidence: number;
  method: string;
  round?: number;
  featureAnalysis?: Record<string, number>;
  metadata: {
    modelVersion: string;
    predictionType?: string;
  };
}

export interface FighterProfile {
  id: string;
  name: string;
  age: number;
  reach: number;
  wins: number;
  losses: number;
  draws?: number;
  wins_by_ko: number;
  wins_by_submission: number;
  wins_by_decision: number;
  strike_accuracy: number;
  strike_defense: number;
  takedown_accuracy: number;
  takedown_defense: number;
  total_fights: number;
  title_fights: number;
  [key: string]: any;
}

// Zod schema for API documentation
export const PredictionResponseSchema = z.object({
  predictionId: z.string().uuid(),
  timestamp: z.string().datetime(),
  fighter1: z.object({
    id: z.string().uuid(),
    name: z.string(),
    record: z.string()
  }),
  fighter2: z.object({
    id: z.string().uuid(),
    name: z.string(),
    record: z.string()
  }),
  predictedWinner: z.enum(['Fighter1', 'Fighter2']),
  confidence: z.number().min(0).max(1),
  method: z.string(),
  round: z.number().int().min(1).max(5).optional(),
  featureAnalysis: z.record(z.number()).optional(),
  metadata: z.object({
    modelVersion: z.string(),
    predictionType: z.string().optional()
  })
});
