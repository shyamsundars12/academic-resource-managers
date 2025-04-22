import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School as SchoolIcon,
  Email as EmailIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { authService } from '../services/api';

const Login: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isLaptop = useMediaQuery(theme.breakpoints.up('md'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ username, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', response.data.role.toLowerCase());
        localStorage.setItem('username', username);

        switch (response.data.role.toLowerCase()) {
          case 'student':
            navigate('/student');
            break;
          case 'teacher':
            navigate('/teacher');
            break;
          case 'admin':
            navigate('/admin');
            break;
          default:
            navigate('/login');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        width: '100%',
        py: isDesktop ? 8 : isLaptop ? 6 : 4,
      }}
    >
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mx: 'auto',
          px: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: isDesktop ? 6 : isLaptop ? 5 : 4,
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
            width: '100%',
            maxWidth: 500,
            mx: 'auto',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: isDesktop ? 6 : isLaptop ? 5 : 4 }}>
            <SchoolIcon
              sx={{
                fontSize: isDesktop ? 80 : isLaptop ? 70 : 60,
                color: 'primary.main',
                mb: isDesktop ? 3 : isLaptop ? 2.5 : 2,
              }}
            />
            <Typography
              variant={isDesktop ? 'h3' : isLaptop ? 'h4' : 'h5'}
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant={isDesktop ? 'h6' : isLaptop ? 'subtitle1' : 'body1'}
              color="text.secondary"
            >
              Sign in to access your account
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: isDesktop ? 4 : isLaptop ? 3 : 2,
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: isDesktop ? '2rem' : isLaptop ? '1.75rem' : '1.5rem',
                },
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: isDesktop ? 4 : isLaptop ? 3 : 2,
              }}
            >
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon
                        color="primary"
                        sx={{
                          fontSize: isDesktop ? '2rem' : isLaptop ? '1.75rem' : '1.5rem',
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: isDesktop ? '1.25rem' : isLaptop ? '1.1rem' : '1rem',
                    height: isDesktop ? '60px' : isLaptop ? '56px' : '48px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: isDesktop ? '1.1rem' : isLaptop ? '1rem' : '0.9rem',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon
                        color="primary"
                        sx={{
                          fontSize: isDesktop ? '2rem' : isLaptop ? '1.75rem' : '1.5rem',
                        }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size={isDesktop ? 'large' : 'medium'}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontSize: isDesktop ? '1.25rem' : isLaptop ? '1.1rem' : '1rem',
                    height: isDesktop ? '60px' : isLaptop ? '56px' : '48px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: isDesktop ? '1.1rem' : isLaptop ? '1rem' : '0.9rem',
                  },
                }}
              />
              <Button
                fullWidth
                variant="contained"
                type="submit"
                size="large"
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  py: isDesktop ? 2 : isLaptop ? 1.75 : 1.5,
                  textTransform: 'none',
                  fontSize: isDesktop ? '1.25rem' : isLaptop ? '1.1rem' : '1rem',
                  height: isDesktop ? '60px' : isLaptop ? '56px' : '48px',
                  background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    transition: 'transform 0.2s ease-in-out',
                    background: 'linear-gradient(45deg, #1565c0 30%, #1e88e5 90%)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={isDesktop ? 30 : isLaptop ? 26 : 24}
                    color="inherit"
                  />
                ) : (
                  'Sign In'
                )}
              </Button>
              <Typography
                align="center"
                sx={{
                  fontSize: isDesktop ? '1.1rem' : isLaptop ? '1rem' : '0.9rem',
                  mt: isDesktop ? 2 : isLaptop ? 1.5 : 1,
                }}
              >
                Don't have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/register')}
                  sx={{
                    textDecoration: 'none',
                    fontSize: isDesktop ? '1.1rem' : isLaptop ? '1rem' : '0.9rem',
                    color: 'primary.main',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Register here
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
