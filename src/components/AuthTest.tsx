import { useAuth } from './AuthProvider';
import { Button, Typography, Box, Paper, Alert } from '@mui/material';

export const AuthTest = () => {
  const { user, isAdmin, signIn, signOut } = useAuth();

  const testAdminLogin = async () => {
    try {
      await signIn('info@legacy3x.com', 'Primavera11d!');
    } catch (error) {
      console.error('Admin login failed:', error);
    }
  };

  const testRegularLogin = async () => {
    try {
      await signIn('test@user.com', 'TestPassword123!');
    } catch (error) {
      console.error('Regular user login failed:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Authentication Test Panel
        </Typography>
        
        {user ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              Logged in as: {user.email} ({user.role})
            </Alert>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="error"
                onClick={signOut}
              >
                Sign Out
              </Button>
              <Button 
                variant="contained" 
                color="info"
                disabled={!isAdmin}
              >
                Admin Action (Only for Admins)
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              Not logged in
            </Alert>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                onClick={testAdminLogin}
              >
                Test Admin Login
              </Button>
              <Button 
                variant="outlined" 
                onClick={testRegularLogin}
              >
                Test Regular User Login
              </Button>
            </Box>
          </>
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1">Test Results:</Typography>
          <ul>
            <li>
              <strong>Admin Login:</strong> Should succeed with admin@example.com
            </li>
            <li>
              <strong>Regular Login:</strong> Should fail (user doesn't exist yet)
            </li>
            <li>
              <strong>Admin Actions:</strong> Button should only work for admins
            </li>
            <li>
              <strong>Sign Out:</strong> Should clear user session
            </li>
          </ul>
        </Box>
      </Paper>
    </Box>
  );
};
