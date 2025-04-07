import { useState } from 'react';
import { useAuth } from './AuthProvider';

export const PredictionService = () => {
  const [modelVersion, setModelVersion] = useState<string>('latest');
  const [prediction, setPrediction] = useState<any>(null);
  const { session } = useAuth();

  const makePrediction = async () => {
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Model-Version': modelVersion || 'latest'
        },
        body: JSON.stringify(inputData) // assuming you have inputData
      });

      const result = await response.json();
      setPrediction({ ...result, modelVersion: result.version });

    } catch (error) {
      console.error('Error making prediction:', error);
      // Optionally show an error message to the user
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Prediction Service</h2>
      {/* Add your prediction service UI here */}
    </div>
  );
};
