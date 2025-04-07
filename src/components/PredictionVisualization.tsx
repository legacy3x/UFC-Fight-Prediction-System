import React from 'react';
import { PredictionResult } from '../types/matchup';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography, Grid, Chip, Divider } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface PredictionVisualizationProps {
  prediction: PredictionResult;
}

export const PredictionVisualization: React.FC<PredictionVisualizationProps> = ({ prediction }) => {
  const prepareFeatureAnalysisData = () => {
    return Object.entries(prediction.featureAnalysis)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  };

  const prepareMethodData = () => {
    return [
      { name: 'KO/TKO', value: prediction.method === 'KO/TKO' ? 1 : 0.2 },
      { name: 'Submission', value: prediction.method === 'Submission' ? 1 : 0.2 },
      { name: 'Decision', value: prediction.method === 'Decision' ? 1 : 0.2 },
    ];
  };

  const getMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case 'ko/tko': return '#FF5722';
      case 'submission': return '#4CAF50';
      case 'decision': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Prediction Summary */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Prediction Summary
            </Typography>
            <Divider className="my-2" />
            
            <div className="flex items-center justify-between mb-4">
              <Typography variant="h5">
                Winner: <strong>{prediction.winner}</strong>
              </Typography>
              <Chip
                label={`${(prediction.confidence * 100).toFixed(1)}%`}
                color={prediction.confidence > 0.7 ? 'success' : prediction.confidence > 0.5 ? 'warning' : 'error'}
              />
            </div>

            <div className="mb-4">
              <Typography variant="subtitle1">Method:</Typography>
              <Chip
                label={prediction.method}
                style={{ backgroundColor: getMethodColor(prediction.method) }}
                className="text-white"
              />
              {prediction.round && (
                <Chip
                  label={`Round ${prediction.round}`}
                  variant="outlined"
                  className="ml-2"
                />
              )}
            </div>

            <Typography variant="subtitle1">Key Factors:</Typography>
            <ul className="list-disc pl-5 mt-2">
              {prepareFeatureAnalysisData()
                .slice(0, 3)
                .map((factor, index) => (
                  <li key={index}>
                    <Typography>
                      {factor.name}: <strong>{factor.value > 0 ? '+' : ''}{factor.value.toFixed(2)}</strong>
                    </Typography>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      </Grid>

      {/* Method Probability */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Method Probability
            </Typography>
            <Divider className="my-2" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareMethodData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {prepareMethodData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getMethodColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Feature Impact */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Influential Features
            </Typography>
            <Divider className="my-2" />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareFeatureAnalysisData()}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Impact Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
