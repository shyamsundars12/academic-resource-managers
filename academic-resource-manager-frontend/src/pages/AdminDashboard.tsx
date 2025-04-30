import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { adminService } from '../services/api';
import Layout from '../components/Layout';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isLaptop = useMediaQuery(theme.breakpoints.up('md'));
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPendingUsers();
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch pending users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      setProcessing(userId);
      await adminService.approveUser(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to approve user');
      console.error('Error approving user:', err);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      setProcessing(userId);
      await adminService.rejectUser(userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      setError('Failed to reject user');
      console.error('Error rejecting user:', err);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Layout>
      <Box sx={{ 
        maxWidth: isDesktop ? 1600 : 1200, 
        mx: 'auto', 
        px: isDesktop ? 6 : isLaptop ? 4 : 3,
        py: isDesktop ? 4 : 3
      }}>
        <Typography 
          variant={isDesktop ? 'h3' : isLaptop ? 'h4' : 'h5'} 
          component="h1" 
          gutterBottom
          sx={{ mb: isDesktop ? 6 : isLaptop ? 4 : 3 }}
        >
          Pending User Approvals
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={isDesktop ? 60 : isLaptop ? 48 : 40} />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Registration Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleApprove(user.id)}
                        disabled={processing === user.id}
                        sx={{ mr: 1 }}
                      >
                        {processing === user.id ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Approve'
                        )}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleReject(user.id)}
                        disabled={processing === user.id}
                      >
                        {processing === user.id ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Reject'
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No pending users to approve
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Layout>
  );
};

export default AdminDashboard; 