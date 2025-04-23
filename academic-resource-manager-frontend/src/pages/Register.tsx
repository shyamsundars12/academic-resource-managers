import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Badge as BadgeIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { authService } from '../services/api';

interface RegisterResponse {
  data: {
    message: string;
  };
}

const Register: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isLaptop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    role: 'STUDENT',
    department: '',
    studentId: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
    // Clear error when user changes input
    if (error) setError('');
  };

  const handleRoleChange = (event: any) => {
    setFormData(prev => ({
      ...prev,
      role: event.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.register({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        role: formData.role,
        fullName: formData.fullName,
        ...(formData.role === 'STUDENT' ? { studentId: formData.studentId } : { department: formData.department }),
      });

      if (response.data) {
        navigate('/login', { 
          state: { 
            message: 'Registration successful! Please login.',
            type: 'success'
          } 
        });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      // Extract the error message from the response
      const errorMessage = err.response?.data || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
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
        py: isDesktop ? 8 : isLaptop ? 6 : 4,
        px: isDesktop ? 4 : isLaptop ? 3 : 2,
      }}
    >
      <Container maxWidth={isDesktop ? 'sm' : 'xs'}>
        <Paper
          elevation={3}
          sx={{
            p: isDesktop ? 6 : isLaptop ? 5 : 4,
            borderRadius: 2,
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
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
            >
              Create Account
            </Typography>
            <Typography 
              variant={isDesktop ? 'h6' : isLaptop ? 'subtitle1' : 'body1'} 
              color="text.secondary"
            >
              Join our academic community
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
                }
              }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: isDesktop ? 4 : isLaptop ? 3 : 2, 
                borderRadius: 2,
                '& .MuiAlert-icon': {
                  fontSize: isDesktop ? '2rem' : isLaptop ? '1.75rem' : '1.5rem',
                }
              }}
            >
              Registration successful! Redirecting to login...
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? 4 : isLaptop ? 3 : 2 }}>
              <TextField
                required
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon 
                        color="primary" 
                        sx={{ 
                          fontSize: isDesktop ? '2rem' : isLaptop ? '1.75rem' : '1.5rem' 
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
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: isDesktop ? '1.1rem' : isLaptop ? '1rem' : '0.9rem',
                  },
                }}
              />
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon 
                        color="primary" 
                        sx={{ 
                          fontSize: isDesktop ? '2rem' : isLaptop ? '1.75rem' : '1.5rem' 
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
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: isDesktop ? '1.1rem' : isLaptop ? '1rem' : '0.9rem',
                  },
                }}
              />
              <TextField
                required
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon 
                        color="primary" 
                        sx={{ 
                          fontSize: isDesktop ? '2rem' : isLaptop ? '1.75rem' : '1.5rem' 
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
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: isDesktop ? '1.1rem' : isLaptop ? '1rem' : '0.9rem',
                  },
                }}
              />
              <TextField
                required
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon 
                        color="primary" 
                        sx={{ 
                          fontSize: isDesktop ? '2rem' : isLaptop ? '1.75rem' : '1.5rem' 
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
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: isDesktop ? '1.1rem' : isLaptop ? '1rem' : '0.9rem',
                  },
                }}
              />
              <FormControl fullWidth>
                <InputLabel sx={{ 
                  fontSize: isDesktop ? '1.1rem' : isLaptop ? '1rem' : '0.9rem',
                }}>
                  Role
                </InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={handleRoleChange}
                  sx={{
                    borderRadius: 2,
                    fontSize: isDesktop ? '1.25rem' : isLaptop ? '1.1rem' : '1rem',
                    height: isDesktop ? '60px' : isLaptop ? '56px' : '48px',
                    '& .MuiSelect-icon': {
                      fontSize: isDesktop ? '2rem' : isLaptop ? '1.75rem' : '1.5rem',
                    },
                  }}
                >
                  <MenuItem value="STUDENT">Student</MenuItem>
                  <MenuItem value="TEACHER">Teacher</MenuItem>
                </Select>
              </FormControl>
              {formData.role === 'STUDENT' ? (
                <TextField
                  required
                  fullWidth
                  label="Student ID"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeIcon 
                          color="primary" 
                          sx={{ 
                            fontSize: isDesktop ? '2rem' : isLaptop ? '1.75rem' : '1.5rem' 
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
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: isDesktop ? '1.1rem' : isLaptop ? '1rem' : '0.9rem',
                    },
                  }}
                />
              ) : (
                <TextField
                  required
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon 
                          color="primary" 
                          sx={{ 
                            fontSize: isDesktop ? '2rem' : isLaptop ? '1.75rem' : '1.5rem' 
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
                    },
                    '& .MuiInputLabel-root': {
                      fontSize: isDesktop ? '1.1rem' : isLaptop ? '1rem' : '0.9rem',
                    },
                  }}
                />
              )}
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
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    transition: 'transform 0.2s ease-in-out',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress 
                    size={isDesktop ? 30 : isLaptop ? 26 : 24} 
                    color="inherit" 
                  />
                ) : (
                  'Register'
                )}
              </Button>
              <Typography 
                align="center"
                sx={{
                  fontSize: isDesktop ? '1.1rem' : isLaptop ? '1rem' : '0.9rem',
                  mt: isDesktop ? 2 : isLaptop ? 1.5 : 1,
                }}
              >
                Already have an account?{' '}
                <Button
                  component="button"
                  variant="text"
                  onClick={() => navigate('/login')}
                  sx={{ 
                    textTransform: 'none',
                    fontSize: isDesktop ? '1.1rem' : isLaptop ? '1rem' : '0.9rem',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign in
                </Button>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register; 