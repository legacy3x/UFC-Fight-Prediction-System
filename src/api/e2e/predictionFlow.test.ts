import request from 'supertest';
import { app } from '../routes';
import { FightModel } from '../model';
import { createClient } from '@supabase/supabase-js';
import { sampleFighters } from '../../utils/sampleFighters';

// Mock Supabase client
jest.mock('@supabase/supabase-js');
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  mockResolvedValue: jest.fn().mockReturnThis(),
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

// Mock FightModel
jest.mock('../model');
const mockPredict = jest.fn().mockResolvedValue({
  winner: 'Israel Adesanya',
  confidence: 0.78,
  method: 'KO/TKO',
  round: 3,
  featureAnalysis: {
    reachAdvantage: 0.15,
    strikingDifferential: 0.22
  }
});

(FightModel as jest.Mock).mockImplementation(() => ({
  init: jest.fn().mockResolvedValue(true),
  predict: mockPredict
}));

describe('Prediction Flow', () => {
  beforeAll(async () => {
    // Setup mock data
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({
        in: () => ({
          or: () => ({
            order: () => ({
              limit: () => ({
                mockResolvedValue: ({ data: [sampleFighters.israelAdesanya, sampleFighters.seanStrickland] })
              })
            })
          })
        })
      })
    }));
  });

  it('should complete full prediction flow', async () => {
    // 1. Get fighter comparison data
    const comparisonRes = await request(app)
      .get('/compare/1/2')
      .expect(200);

    expect(comparisonRes.body.fighter1.name).toBe('Israel Adesanya');
    expect(comparisonRes.body.fighter2.name).toBe('Sean Strickland');

    // 2. Make prediction
    const predictionRes = await request(app)
      .post('/predict')
      .send({
        fighter1Id: '1',
        fighter2Id: '2'
      })
      .expect(200);

    expect(predictionRes.body.winner).toBe('Israel Adesanya');
    expect(predictionRes.body.confidence).toBeGreaterThan(0.5);

    // 3. Store prediction
    const storeRes = await request(app)
      .post('/predictions/store')
      .send({
        prediction: predictionRes.body,
        fightDetails: {
          fighter1: comparisonRes.body.fighter1,
          fighter2: comparisonRes.body.fighter2,
          date: '2023-09-10'
        },
        userNotes: 'Test prediction'
      })
      .expect(200);

    expect(storeRes.body.success).toBe(true);
    expect(storeRes.body.predictionId).toBeDefined();

    // 4. Verify prediction history
    mockSupabase.from.mockImplementationOnce(() => ({
      select: () => ({
        or: () => ({
          order: () => ({
            mockResolvedValue: { 
              data: [{
                id: storeRes.body.predictionId,
                fighter1_id: '1',
                fighter2_id: '2',
                predicted_winner: 'Israel Adesanya',
                confidence: 0.78
              }]
            }
          })
        })
      })
    }));

    const historyRes = await request(app)
      .get('/accuracy/history')
      .expect(200);

    expect(historyRes.body.accuracy).toBeDefined();
    expect(historyRes.body.recentPerformance).toHaveLength(1);
  });

  it('should handle prediction errors', async () => {
    mockPredict.mockRejectedValueOnce(new Error('Model error'));

    await request(app)
      .post('/predict')
      .send({
        fighter1Id: '1',
        fighter2Id: '2'
      })
      .expect(500);
  });
});
