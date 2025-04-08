import { AuthProvider } from './components/AuthProvider';
import { AuthTest } from './components/AuthTest';
import { LoginForm } from './components/LoginForm';
import { Box } from '@mui/material';

function App() {
  return (
    <AuthProvider>
      <Box sx={{ p: 3 }}>
        <AuthTest />
        <Box sx={{ mt: 4 }}>
          <LoginForm />
        </Box>
      </Box>
    </AuthProvider>
  );
}

export default App;
