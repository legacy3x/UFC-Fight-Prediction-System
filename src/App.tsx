import React, { useState } from 'react';
import { Search, Swords, Trophy, Percent, List, Clock, Zap, Scale } from 'lucide-react';

interface Prediction {
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

interface ErrorResponse {
  error: boolean;
  message: string;
}

type PredictionType = 'basic' | 'detailed' | 'upset' | 'style';

function App() {
  const [fighter1, setFighter1] = useState('Jon Jones');
  const [fighter2, setFighter2] = useState('Ciryl Gane');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionType, setPredictionType] = useState<PredictionType>('basic');

  const getPrediction = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-fight`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fighter1, 
          fighter2,
          predictionType 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as Prediction;
      setPrediction(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">UFC Fight Predictor AI</h1>
          <p className="text-xl text-gray-300">Advanced fight analysis and prediction system</p>
        </div>

        <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2">Fighter 1</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={fighter1}
                  onChange={(e) => setFighter1(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="Enter fighter name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fighter 2</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={fighter2}
                  onChange={(e) => setFighter2(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-gray-600 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="Enter fighter name"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">Prediction Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setPredictionType('basic')}
                className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  predictionType === 'basic' ? 'bg-red-600' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <Trophy size={20} />
                <span>Basic</span>
              </button>
              <button
                onClick={() => setPredictionType('detailed')}
                className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  predictionType === 'detailed' ? 'bg-red-600' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <Clock size={20} />
                <span>Detailed</span>
              </button>
              <button
                onClick={() => setPredictionType('upset')}
                className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  predictionType === 'upset' ? 'bg-red-600' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <Zap size={20} />
                <span>Upset</span>
              </button>
              <button
                onClick={() => setPredictionType('style')}
                className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  predictionType === 'style' ? 'bg-red-600' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <Scale size={20} />
                <span>Style</span>
              </button>
            </div>
          </div>

          <button
            onClick={getPrediction}
            disabled={loading}
            className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Swords size={20} />
            {loading ? 'Analyzing...' : 'Predict Fight'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {prediction && (
            <div className="mt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="text-yellow-500" size={24} />
                    <h3 className="text-lg font-medium">Predicted Winner</h3>
                  </div>
                  <p className="text-2xl font-bold text-red-500">{prediction.predictedWinner}</p>
                </div>

                <div className="bg-white/5 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Swords className="text-blue-500" size={24} />
                    <h3 className="text-lg font-medium">Method of Victory</h3>
                  </div>
                  <p className="text-2xl font-bold text-blue-500">
                    {prediction.methodOfVictory}
                    {prediction.roundPrediction && ` (Round ${prediction.roundPrediction})`}
                  </p>
                </div>

                <div className="bg-white/5 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Percent className="text-green-500" size={24} />
                    <h3 className="text-lg font-medium">Confidence Score</h3>
                  </div>
                  <p className="text-2xl font-bold text-green-500">{prediction.confidenceScore}%</p>
                </div>
              </div>

              {prediction.upsetProbability !== undefined && (
                <div className="bg-white/5 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="text-yellow-500" size={24} />
                    <h3 className="text-lg font-medium">Upset Probability</h3>
                  </div>
                  <p className="text-2xl font-bold text-yellow-500">{prediction.upsetProbability}%</p>
                </div>
              )}

              {prediction.styleDominance && (
                <div className="bg-white/5 p-6 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Scale className="text-purple-500" size={24} />
                    <h3 className="text-lg font-medium">Style Analysis</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Striking</span>
                        <span>{prediction.styleDominance.striking}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${prediction.styleDominance.striking}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Grappling</span>
                        <span>{prediction.styleDominance.grappling}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${prediction.styleDominance.grappling}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Wrestling</span>
                        <span>{prediction.styleDominance.wrestling}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${prediction.styleDominance.wrestling}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white/5 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <List className="text-purple-500" size={24} />
                  <h3 className="text-lg font-medium">Key Factors</h3>
                </div>
                <ul className="space-y-2">
                  {prediction.keyFactors.map((factor, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
