import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

interface Fighter {
  id: string;
  name: string;
  wins: number;
  losses: number;
  wins_by_ko: number;
  wins_by_submission: number;
  wins_by_decision: number;
  strike_accuracy: number;
  strike_defense: number;
  takedown_accuracy: number;
  takedown_defense: number;
  strikes_landed_per_min: number;
  strikes_absorbed_per_min: number;
  takedowns_per_15min: number;
  submission_attempts_per_15min: number;
  striking_rating: number;
  grappling_rating: number;
  wrestling_rating: number;
}

interface PredictionRequest {
  fighter1: string;
  fighter2: string;
  predictionType: 'basic' | 'detailed' | 'upset' | 'style';
}

interface PredictionResponse {
  predictedWinner: string;
  methodOfVictory: string;
  confidenceScore: number;
  keyFactors: string[];
  roundPrediction?: number;
  upsetProbability?: number;
  styleDominance?: {
    striking: number;
    grappling: number;
    wrestling: number;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

function calculateStyleDominance(winner: Fighter, loser: Fighter) {
  return {
    striking: Math.round((winner.striking_rating / (winner.striking_rating + loser.striking_rating)) * 100),
    grappling: Math.round((winner.grappling_rating / (winner.grappling_rating + loser.grappling_rating)) * 100),
    wrestling: Math.round((winner.wrestling_rating / (winner.wrestling_rating + loser.wrestling_rating)) * 100)
  };
}

function predictRound(winner: Fighter, methodOfVictory: string): number {
  if (methodOfVictory === 'Decision') return 3;
  
  const finishRate = (winner.wins_by_ko + winner.wins_by_submission) / winner.wins;
  if (finishRate > 0.7) return 1;
  if (finishRate > 0.4) return 2;
  return 3;
}

function calculateUpsetProbability(favorite: Fighter, underdog: Fighter): number {
  const favoriteScore = favorite.wins / (favorite.wins + favorite.losses);
  const underdogScore = underdog.wins / (underdog.wins + underdog.losses);
  const differential = favoriteScore - underdogScore;
  
  return Math.round((1 - differential) * 100);
}

async function predictFight(supabase: any, fighter1Name: string, fighter2Name: string, predictionType: PredictionRequest['predictionType']): Promise<PredictionResponse> {
  // Fetch fighter data from database
  const { data: fighters, error } = await supabase
    .from('fighters')
    .select('*')
    .in('name', [fighter1Name, fighter2Name]);

  if (error) throw new Error('Failed to fetch fighter data');
  if (!fighters || fighters.length !== 2) {
    throw new Error(`Fighter data not found for ${!fighters ? 'both fighters' : fighters[0].name === fighter1Name ? fighter2Name : fighter1Name}`);
  }

  const fighter1 = fighters.find(f => f.name === fighter1Name)!;
  const fighter2 = fighters.find(f => f.name === fighter2Name)!;

  // Calculate base scores
  let score1 = 0;
  let score2 = 0;

  // Win-loss record
  score1 += fighter1.wins * 2;
  score2 += fighter2.wins * 2;

  // Finish rate
  score1 += (fighter1.wins_by_ko + fighter1.wins_by_submission) * 1.5;
  score2 += (fighter2.wins_by_ko + fighter2.wins_by_submission) * 1.5;

  // Technical skills
  score1 += fighter1.strike_accuracy * 10 + fighter1.takedown_accuracy * 10;
  score2 += fighter2.strike_accuracy * 10 + fighter2.takedown_accuracy * 10;

  // Defense
  score1 += fighter1.strike_defense * 8 + fighter1.takedown_defense * 8;
  score2 += fighter2.strike_defense * 8 + fighter2.takedown_defense * 8;

  // Activity rates
  score1 += fighter1.strikes_landed_per_min + fighter1.takedowns_per_15min * 2;
  score2 += fighter2.strikes_landed_per_min + fighter2.takedowns_per_15min * 2;

  // Determine winner and confidence
  const totalScore = score1 + score2;
  const winnerScore = Math.max(score1, score2);
  const confidenceScore = Math.round((winnerScore / totalScore) * 100);
  
  const winner = score1 > score2 ? fighter1 : fighter2;
  const loser = score1 > score2 ? fighter2 : fighter1;

  // Determine method of victory
  let methodOfVictory = "Decision";
  if (winner.wins_by_ko > winner.wins_by_submission && winner.strike_accuracy > 0.5) {
    methodOfVictory = "KO/TKO";
  } else if (winner.wins_by_submission > winner.wins_by_ko && winner.grappling_rating > 0.7) {
    methodOfVictory = "Submission";
  }

  // Determine key factors
  const keyFactors = [];
  if (winner.strike_accuracy > 0.6) keyFactors.push("Superior striking accuracy");
  if (winner.takedown_accuracy > 0.6) keyFactors.push("Excellent takedown accuracy");
  if (winner.wins_by_ko > 5) keyFactors.push("Proven knockout power");
  if (winner.wins_by_submission > 5) keyFactors.push("Strong submission game");
  if (winner.strike_defense > 0.7) keyFactors.push("Exceptional striking defense");
  if (winner.takedown_defense > 0.7) keyFactors.push("Strong takedown defense");

  // Base prediction response
  const prediction: PredictionResponse = {
    predictedWinner: winner.name,
    methodOfVictory,
    confidenceScore,
    keyFactors
  };

  // Add type-specific predictions
  switch (predictionType) {
    case 'detailed':
      prediction.roundPrediction = predictRound(winner, methodOfVictory);
      break;
    case 'upset':
      prediction.upsetProbability = calculateUpsetProbability(winner, loser);
      break;
    case 'style':
      prediction.styleDominance = calculateStyleDominance(winner, loser);
      break;
  }

  return prediction;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error('Content-Type must be application/json');
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json() as PredictionRequest;
    const prediction = await predictFight(supabaseClient, body.fighter1, body.fighter2, body.predictionType);
    
    return new Response(
      JSON.stringify(prediction),
      { headers: corsHeaders }
    );
  } catch (error) {
    const errorResponse = {
      error: true,
      message: error.message || 'An unexpected error occurred'
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: error.message.includes('not found') || error.message.includes('required') ? 400 : 500,
        headers: corsHeaders
      }
    );
  }
});
