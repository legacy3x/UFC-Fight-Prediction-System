import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Chip
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { BarChart } from '@mui/x-charts/BarChart'; // Adjust if using custom chart
import { PipelineMetrics } from '../utils/pipelineMetrics';

// 🔷 Define interfaces for type safety
interface PipelineRun {
  id: string;
  pipeline_name: string;
  success: boolean;
  duration_ms: number;
  error?: string;
}

interface ErrorStat {
  source: string;
  count: number;
}

interface RecentError {
  id: string;
  timestamp: string;
  source: string;
  message: string;
}

interface PipelineHealth {
  lastRuns: PipelineRun[];
  errorStats: ErrorStat[];
  requestStats: any[]; // Adjust if needed
}

export const ModelDashboard = () => {
  const [pipelineHealth, setPipelineHealth] = useState<PipelineHealth>({
    lastRuns: [],
    errorStats: [],
    requestStats: []
  });

  const [recentErrors, setRecentErrors] = useState<RecentError[]>([]);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    const loadHealthData = async () => {
      const health = await PipelineMetrics.getScraperHealth();
      const errors = await PipelineMetrics.getRecentFailures();
      setPipelineHealth(health);
      setRecentErrors(errors);
      setLoadingHealth(false);
    };
    loadHealthData();
  }, []);

  const errorColumns: GridColDef[] = [
    {
      field: 'timestamp',
      headerName: 'Time',
      width: 180,
      valueFormatter: (params) => new Date(params.value as string).toLocaleString()
    },
    { field: 'source', headerName: 'Source', width: 120 },
    { field: 'message', headerName: 'Error', flex: 1 }
  ];

  return (
    <Grid item xs={12}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pipeline Health Monitoring
          </Typography>
          <Divider className="my-2" />

          <Grid container spacing={3}>
            {/* 🟢 Recent Runs */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Recent Runs</Typography>
              {pipelineHealth.lastRuns.map((run) => (
                <div key={run.id} className="mb-2">
                  <Typography>
                    <strong>{run.pipeline_name}</strong>:{' '}
                    {run.success ? '✅' : '❌'} in {run.duration_ms}ms
                  </Typography>
                  {run.error && (
                    <Typography variant="caption" color="error">
                      {run.error}
                    </Typography>
                  )}
                </div>
              ))}
            </Grid>

            {/* 🟠 Error Rates Chart */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Error Rates</Typography>
              <div className="h-64">
                <BarChart
                  xAxis={[
                    {
                      data: pipelineHealth.errorStats.map((s) => s.source),
                      scaleType: 'band'
                    }
                  ]}
                  series={[
                    {
                      data: pipelineHealth.errorStats.map((s) => s.count),
                      color: '#F44336'
                    }
                  ]}
                />
              </div>
            </Grid>

            {/* 🔴 Recent Errors Table */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Recent Errors</Typography>
              <div style={{ height: 300 }}>
                <DataGrid
                  rows={recentErrors}
                  columns={errorColumns}
                  loading={loadingHealth}
                  pageSize={5}
                />
              </div>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
};
