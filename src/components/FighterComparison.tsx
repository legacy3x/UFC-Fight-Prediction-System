import React from 'react';
import { FighterProfile } from '../types/matchup';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, Typography, Grid, Divider, Chip, Paper, Tabs, Tab, Box } from '@mui/material';

interface FighterComparisonProps {
  fighter1: FighterProfile;
  fighter2: FighterProfile;
  historicalMatchups: Array<{
    date: string;
    fighter1: string;
    fighter2: string;
    winner: string;
    method: string;
    round: number;
  }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`comparison-tabpanel-${index}`}
      aria-labelledby={`comparison-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `comparison-tab-${index}`,
    'aria-controls': `comparison-tabpanel-${index}`,
  };
}

export const FighterComparison: React.FC<FighterComparisonProps> = ({ fighter1, fighter2, historicalMatchups }) => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const prepareStatsData = () => {
    return [
      { name: 'Record', fighter1: fighter1.record, fighter2: fighter2.record },
      { name: 'Height (cm)', fighter1: fighter1.height, fighter2: fighter2.height },
      { name: 'Reach (cm)', fighter1: fighter1.reach, fighter2: fighter2.reach },
      { name: 'Strikes Landed', fighter1: fighter1.stats.sigStrikesLandedPerMin, fighter2: fighter2.stats.sigStrikesLandedPerMin },
      { name: 'Strike Accuracy', fighter1: fighter1.stats.strikeAccuracy, fighter2: fighter2.stats.strikeAccuracy },
      { name: 'Takedown Avg', fighter1: fighter1.stats.takedownAverage, fighter2: fighter2.stats.takedownAverage },
      { name: 'Submission Avg', fighter1: fighter1.stats.submissionAverage, fighter2: fighter2.stats.submissionAverage },
    ];
  };

  const prepareStyleData = () => {
    return [
      { name: 'Striking', fighter1: fighter1.style.striking, fighter2: fighter2.style.striking },
      { name: 'Grappling', fighter1: fighter1.style.grappling, fighter2: fighter2.style.grappling },
      { name: 'Wrestling', fighter1: fighter1.style.wrestling, fighter2: fighter2.style.wrestling },
      { name: 'Cardio', fighter1: fighter1.style.cardio, fighter2: fighter2.style.cardio },
      { name: 'Power', fighter1: fighter1.style.power, fighter2: fighter2.style.power },
      { name: 'Chin', fighter1: fighter1.style.chin, fighter2: fighter2.style.chin },
    ];
  };

  return (
    <Card className="mt-4">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {fighter1.name} vs {fighter2.name}
        </Typography>
        <Divider className="my-2" />

        <Paper>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="comparison tabs">
            <Tab label="Stats Comparison" {...a11yProps(0)} />
            <Tab label="Style Analysis" {...a11yProps(1)} />
            <Tab label="Historical Matchups" {...a11yProps(2)} />
          </Tabs>
        </Paper>

        <TabPanel value={tabValue} index={0}>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepareStatsData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="fighter1" name={fighter1.name} fill="#8884d8" />
                <Bar dataKey="fighter2" name={fighter2.name} fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepareStyleData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="fighter1" name={fighter1.name} fill="#8884d8" />
                <Bar dataKey="fighter2" name={fighter2.name} fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {historicalMatchups.length > 0 ? (
            <Grid container spacing={2}>
              {historicalMatchups.map((matchup, index) => (
                <Grid item xs={12} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">
                        {matchup.fighter1} vs {matchup.fighter2}
                      </Typography>
                      <Typography color="textSecondary">
                        {new Date(matchup.date).toLocaleDateString()}
                      </Typography>
                      <div className="mt-2">
                        <Chip 
                          label={`Winner: ${matchup.winner}`} 
                          color={matchup.winner === fighter1.name ? 'primary' : 'secondary'} 
                        />
                        <Chip 
                          label={`Method: ${matchup.method}`} 
                          variant="outlined" 
                          className="ml-2" 
                        />
                        {matchup.round && (
                          <Chip 
                            label={`Round ${matchup.round}`} 
                            variant="outlined" 
                            className="ml-2" 
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography color="textSecondary">
              No historical matchups found between these fighters
            </Typography>
          )}
        </TabPanel>
      </CardContent>
    </Card>
  );
};
