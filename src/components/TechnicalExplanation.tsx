import React from 'react';
import { featureGroups } from '../utils/featureEngineering';

export const TechnicalExplanation = ({ features, version }) => {
  const groupedFeatures = Object.entries(featureGroups).map(([group, fields]) => ({
    group,
    score: fields.reduce((sum, f) => sum + (features[f] || 0), 0)
  })).filter(g => Math.abs(g.score) > 0.1);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Technical Breakdown (v{version})</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groupedFeatures.map(({group, score}) => (
          <div key={group} className="border p-4 rounded">
            <h4 className="font-medium capitalize">{group}</h4>
            <div className="h-4 bg-gray-200 rounded-full mt-2">
              <div 
                className={`h-full rounded-full ${score > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, Math.abs(score) * 100}%` }}
              />
            </div>
            <span className="text-sm">
              {score > 0 ? 'Advantage' : 'Disadvantage'} ({score.toFixed(2)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
