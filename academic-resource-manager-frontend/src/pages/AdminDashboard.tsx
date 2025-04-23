import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  // Dialog,
  // DialogTitle,
  // DialogContent,
  // DialogActions,
  Alert,
} from '@mui/material';
import axios from 'axios';

interface RegistrationRequest {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  // const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  // const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/pending-users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRequests(response.data);
    } catch (err) {
      setError('Failed to fetch registration requests');
      console.error('Error fetching requests:', err);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await axios.post(
        `http://localhost:8080/api/admin/approve/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setSuccess('Request approved successfully');
      fetchRequests();
    } catch (err) {
      setError('Failed to approve request');
      console.error('Error approving request:', err);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await axios.post(
        `http://localhost:8080/api/admin/reject/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setSuccess('Request rejected successfully');
      fetchRequests();
    } catch (err) {
      setError('Failed to reject request');
      console.error('Error rejecting request:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Registration Requests
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request._id}>
                  <TableCell>{request.fullName}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell>{request.role}</TableCell>
                  <TableCell>{request.department}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(request.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {request.status === 'pending' && (
                      <>
                        <Button
                          color="success"
                          onClick={() => handleApprove(request._id)}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          color="error"
                          onClick={() => handleReject(request._id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default AdminDashboard; 