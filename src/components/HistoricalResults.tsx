import React from 'react';
import { FighterProfile } from '../types/matchup';
import { Card, CardContent, Typography, Grid, Chip, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface HistoricalResultsProps {
  fighter1: FighterProfile;
  fighter2: FighterProfile;
  results: Array<{
    date: string;
    opponent: string;
    result: 'Win' | 'Loss' | 'Draw';
    method: string;
    round?: number;
    event?: string;
  }>;
}

export const HistoricalResults: React.FC<HistoricalResultsProps> = ({ fighter1, fighter2, results }) => {
  const fighter1Results = results.filter(r => r.opponent === fighter2.name);
  const fighter2Results = results.filter(r => r.opponent === fighter1.name);

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Win': return 'success';
      case 'Loss': return 'error';
      case 'Draw': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Card className="mt-4">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Fighter History
        </Typography>
        <Divider className="my-2" />

        <Grid container spacing={3}>
          {/* Fighter 1 Recent Results */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {fighter1.name}'s Last 5 Fights
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Opponent</TableCell>
                    <TableCell>Result</TableCell>
                    <TableCell>Method</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fighter1.recentFights.slice(0, 5).map((fight, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(fight.date).toLocaleDateString()}</TableCell>
                      <TableCell>{fight.opponent}</TableCell>
                      <TableCell>
                        <Chip 
                          label={fight.result} 
                          color={getResultColor(fight.result)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{fight.method}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Fighter 2 Recent Results */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {fighter2.name}'s Last 5 Fights
            </Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Opponent</TableCell>
                    <TableCell>Result</TableCell>
                    <TableCell>Method</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fighter2.recentFights.slice(0, 5).map((fight, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(fight.date).toLocaleDateString()}</TableCell>
                      <TableCell>{fight.opponent}</TableCell>
                      <TableCell>
                        <Chip 
                          label={fight.result} 
                          color={getResultColor(fight.result)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{fight.method}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Head-to-Head Results */}
          {(fighter1Results.length > 0 || fighter2Results.length > 0) && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Head-to-Head History
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Matchup</TableCell>
                      <TableCell>Result</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Round</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...fighter1Results, ...fighter2Results]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((fight, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(fight.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {fight.opponent === fighter2.name 
                              ? `${fighter1.name} vs ${fighter2.name}`
                              : `${fighter2.name} vs ${fighter1.name}`}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={fight.result} 
                              color={getResultColor(fight.result)} 
                            />
                          </TableCell>
                          <TableCell>{fight.method}</TableCell>
                          <TableCell>{fight.round || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
