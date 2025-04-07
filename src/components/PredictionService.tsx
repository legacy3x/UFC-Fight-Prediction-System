// Updated imports remain the same...

export const PredictionService = () => {
  // Existing state...
  const [explanationMode, setExplanationMode] = useState<'simple'|'technical'>('simple');
  const [modelVersion, setModelVersion] = useState('');

  // Add to makePrediction():
  const makePrediction = async () => {
    try {
      const response = await fetch('/api/predict', {
        headers: {
          'X-Model-Version': modelVersion || 'latest'
        },
        // ... rest unchanged
      });
      // Store version in result
      setPrediction({...result, modelVersion: result.version});
    } // ... catch unchanged
  };

  // New explanation component
  const renderExplanation = () => (
    <div className="mt-4">
      <div className="flex gap-2 mb-4">
        <Button 
          variant={explanationMode === 'simple' ? 'contained' : 'outlined'}
          onClick={() => setExplanationMode('simple')}
        >
          Simple Explanation
        </Button>
        <Button 
          variant={explanationMode === 'technical' ? 'contained' : 'outlined'}
          onClick={() => setExplanationMode('technical')}
        >
          Technical Details
        </Button>
      </div>

      {explanationMode === 'simple' ? (
        <div className="prose">
          <h3>Why {prediction.winner} is favored:</h3>
          <ul>
            {Object.entries(prediction.featureAnalysis)
              .sort((a,b) => Math.abs(b[1]) - Math.abs(a[1]))
              .slice(0,3)
              .map(([feature, value]) => (
                <li key={feature}>
                  <strong>{feature}:</strong> {value > 0 ? 'Advantage' : 'Disadvantage'} 
                  ({Math.abs(value).toFixed(2)})
                </li>
              ))}
          </ul>
        </div>
      ) : (
        <TechnicalExplanation 
          features={prediction.featureAnalysis}
          version={prediction.modelVersion}
        />
      )}
    </div>
  );

  // Add to prediction result display:
  {prediction && (
    <>
      {/* Existing prediction display... */}
      {renderExplanation()}
      <Chip 
        label={`Model v${prediction.modelVersion}`}
        variant="outlined"
        className="mt-2"
      />
    </>
  )}
};
