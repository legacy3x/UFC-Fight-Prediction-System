import { ModelDashboard } from './components/ModelDashboard';
import { PredictionService } from './components/PredictionService';
import { LoginForm } from './components/LoginForm';
import { AdminPanel } from './components/AdminPanel';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Button } from '@mui/material';
import { AuthProvider, useAuth } from './components/AuthProvider';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AuthApp />
      </Router>
    </AuthProvider>
  );
}

function AuthApp() {
  const { session, loading, isAdmin } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {session && (
        <AppBar position="static">
          <Toolbar>
            <Button color="inherit" href="/">
              Dashboard
            </Button>
            <Button color="inherit" href="/predict">
              Prediction Service
            </Button>
            {isAdmin && (
              <Button color="inherit" href="/admin">
                Admin
              </Button>
            )}
            <div style={{ flexGrow: 1 }} />
            <Button 
              color="inherit" 
              onClick={() => supabase.auth.signOut()}
            >
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>
      )}

      <div className="container mx-auto p-4">
        <Routes>
          <Route 
            path="/" 
            element={session ? <ModelDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/predict" 
            element={session ? <PredictionService /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/login" 
            element={session ? <Navigate to="/" /> : <LoginForm onLogin={() => window.location.href = '/'} />} 
          />
          <Route path="*" element={<Navigate to={session ? '/' : '/login'} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
