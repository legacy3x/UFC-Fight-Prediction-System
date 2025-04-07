import { useState } from 'react';
import { supabase } from '../api/client';
import { Button, TextField, Box, Typography, Alert } from '@mui/material';

export const LoginForm = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 400,
        margin: 'auto',
        padding: 4,
        borderRadius: 2,
        boxShadow: 3,
        bgcolor: 'background.paper'
      }}
    >
      <Typography variant="h5" component="h1" textAlign="center">
        MMA Prediction Dashboard
      </Typography>
      
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
      />

      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        fullWidth
        sx={{ mt: 2 }}
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
    </Box>
  );
};
