// Add these new imports at top:
import { PipelineMetrics } from '../utils/pipelineMetrics';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

// Add these new state variables:
const [pipelineHealth, setPipelineHealth] = useState({
  lastRuns: [],
  errorStats: [],
  requestStats: []
});
const [recentErrors, setRecentErrors] = useState([]);
const [loadingHealth, setLoadingHealth] = useState(true);

// Add this new useEffect:
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

// Add this new grid column definition:
const errorColumns: GridColDef[] = [
  { field: 'timestamp', headerName: 'Time', width: 180, 
    valueFormatter: (params) => new Date(params.value).toLocaleString() },
  { field: 'source', headerName: 'Source', width: 120 },
  { field: 'message', headerName: 'Error', flex: 1 }
];

// Add this new card to the Grid container (after Feature Importance card):
<Grid item xs={12}>
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Pipeline Health Monitoring
      </Typography>
      <Divider className="my-2" />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1">Recent Runs</Typography>
          {pipelineHealth.lastRuns.map((run) => (
            <div key={run.id} className="mb-2">
              <Typography>
                <strong>{run.pipeline_name}</strong>: 
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

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1">Error Rates</Typography>
          <div className="h-64">
            <BarChart
              xAxis={[{ 
                data: pipelineHealth.errorStats.map(s => s.source),
                scaleType: 'band'
              }]}
              series={[{
                data: pipelineHealth.errorStats.map(s => s.count),
                color: '#F44336'
              }]}
            />
          </div>
        </Grid>

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
