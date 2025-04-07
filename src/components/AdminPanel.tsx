import { Button, Box, Typography } from '@mui/material';
import { useAuth } from './AuthProvider';

export const AdminPanel = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  return (
    <Box sx={{ p: 2, border: '1px dashed grey', mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Admin Controls
      </Typography>
      <Button variant="contained" sx={{ mr: 2 }}>
        Import Fighters
      </Button>
      <Button variant="contained" sx={{ mr: 2 }}>
        Retrain Model
      </Button>
      <Button variant="contained" color="error">
        Purge Cache
      </Button>
    </Box>
  );
};
