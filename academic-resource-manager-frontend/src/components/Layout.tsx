import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Container,
} from '@mui/material';
import {
  School as SchoolIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const userRole = localStorage.getItem('userRole');
  const username = localStorage.getItem('username');

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    // Navigate to profile page when implemented
  };

  const handleDashboard = () => {
    handleClose();
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'teacher') {
      navigate('/teacher');
    } else if (userRole === 'student') {
      navigate('/student');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="default" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <SchoolIcon 
                color="primary" 
                sx={{ 
                  mr: 2,
                  fontSize: 32,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                }} 
              />
              <Typography 
                variant="h6" 
                component="div"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  background: 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {title || 'Academic Resource Manager'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton 
                color="inherit"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <Badge 
                  badgeContent={4} 
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#ef4444',
                    },
                  }}
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <IconButton
                onClick={handleMenu}
                size="small"
                sx={{ 
                  ml: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
                aria-controls="menu-appbar"
                aria-haspopup="true"
              >
                <Avatar 
                  sx={{ 
                    width: 36, 
                    height: 36, 
                    bgcolor: 'primary.main',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  {username?.charAt(0).toUpperCase() || <PersonIcon />}
                </Avatar>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 180,
                    borderRadius: 2,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <MenuItem 
                  onClick={handleDashboard}
                  sx={{
                    py: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    },
                  }}
                >
                  <DashboardIcon sx={{ mr: 1, color: 'primary.main' }} /> Dashboard
                </MenuItem>
                <MenuItem 
                  onClick={handleProfile}
                  sx={{
                    py: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    },
                  }}
                >
                  <PersonIcon sx={{ mr: 1, color: 'primary.main' }} /> Profile
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    py: 1,
                    color: '#ef4444',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    },
                  }}
                >
                  <LogoutIcon sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout; 