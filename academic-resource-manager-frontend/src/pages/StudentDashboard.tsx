import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  // Container,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fade,
  Zoom,
  Grow,
} from '@mui/material';
import {
  Class as ClassIcon,
  Book as BookIcon,
  Download as DownloadIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { studentService } from '../services/api';

interface Classroom {
  id: string;
  name: string;
  code: string;
  courses: Course[];
}

interface Course {
  id: string;
  name: string;
  description: string;
  materials: Material[];
}

interface Material {
  id: string;
  title: string;
  description: string;
  filePath: string;
}

const StudentDashboard: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isLaptop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [classroomCode, setClassroomCode] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await studentService.getClassrooms();
      const classroomsWithCourses = await Promise.all(
        response.data.map(async (classroom: Classroom) => {
          try {
            const coursesResponse = await studentService.getClassroomCourses(classroom.id);
            return { ...classroom, courses: coursesResponse.data };
          } catch (err) {
            console.error(`Error fetching courses for classroom ${classroom.id}:`, err);
            return { ...classroom, courses: [] };
          }
        })
      );
      setClassrooms(classroomsWithCourses);
    } catch (err) {
      setError('Failed to fetch classrooms');
      console.error('Error fetching classrooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = async (classroom: Classroom, course: Course) => {
    try {
      setLoading(true);
      const response = await studentService.getCourseMaterials(classroom.id, course.id);
      setSelectedClassroom(classroom);
      setSelectedCourse({ ...course, materials: response.data });
    } catch (err) {
      setError('Failed to fetch course materials');
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMaterial = async (material: Material) => {
    if (!selectedClassroom?.id || !selectedCourse?.id) {
      setError('No classroom or course selected');
      return;
    }

    try {
      const response = await studentService.downloadMaterial(
        selectedClassroom.id,
        selectedCourse.id,
        material.id
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', material.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download material');
      console.error('Error downloading material:', err);
    }
  };

  const handleJoinClassroom = async () => {
    if (!classroomCode.trim()) {
      setJoinError('Please enter a classroom code');
      return;
    }

    try {
      setLoading(true);
      setJoinError('');
      await studentService.joinClassroom(classroomCode);
      setJoinDialogOpen(false);
      setClassroomCode('');
      fetchClassrooms(); // Refresh the classrooms list
    } catch (err: any) {
      console.error('Error joining classroom:', err);
      setJoinError(err.response?.data || 'Failed to join classroom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderClassroomView = () => (
    <Fade in timeout={500}>
      <Box sx={{ 
        width: '100%',
        minHeight: '100vh',
        p: { xs: 2, sm: 3, md: 4 },
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        position: 'relative',
        overflow: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at top right, rgba(37, 99, 235, 0.1) 0%, transparent 50%)',
          zIndex: 0,
        },
      }}>
        <Box sx={{ 
          position: 'relative',
          zIndex: 1,
          maxWidth: 1600,
          mx: 'auto',
        }}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: { xs: 4, sm: 6, md: 8 },
            animation: 'fadeIn 1s ease-in-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(-20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}>
            <Typography 
              variant="h3"
              component="h1" 
              sx={{
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              }}
            >
              Welcome to Your Dashboard
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                maxWidth: 800,
                mx: 'auto',
              }}
            >
              Select a classroom to view available courses
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: { xs: 4, sm: 6, md: 8 },
            animation: 'slideIn 0.5s ease-out',
            '@keyframes slideIn': {
              '0%': { transform: 'translateY(20px)', opacity: 0 },
              '100%': { transform: 'translateY(0)', opacity: 1 },
            },
          }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setJoinDialogOpen(true)}
              size="large"
              sx={{
                borderRadius: 2,
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '1rem', sm: '1.1rem' },
                textTransform: 'none',
                background: 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1d4ed8 30%, #6d28d9 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                },
              }}
            >
              Join Classroom
            </Button>
          </Box>

          <Grid 
            container 
            spacing={{ xs: 2, sm: 3, md: 4 }}
            sx={{
              '& > .MuiGrid-item': {
                animation: 'fadeIn 0.5s ease-in-out',
                animationFillMode: 'both',
              },
            }}
          >
            {classrooms.map((classroom, index) => (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={3} 
                key={classroom.id}
                sx={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <Card
                  title={classroom.name}
                  subtitle={`Code: ${classroom.code}`}
                  icon={<ClassIcon />}
                  iconColor="primary"
                  chips={[
                    { label: `${classroom.courses.length} Courses`, color: 'primary' },
                  ]}
                  action={{
                    label: 'View Courses',
                    onClick: () => setSelectedClassroom(classroom),
                    icon: <BookIcon />,
                    color: 'primary',
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Dialog 
          open={joinDialogOpen} 
          onClose={() => setJoinDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 2,
              p: { xs: 2, sm: 3 },
              maxWidth: { xs: '90%', sm: 500 },
              width: '100%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center',
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            fontWeight: 'bold',
            pb: 2,
            background: 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Join Classroom
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Classroom Code"
              type="text"
              fullWidth
              value={classroomCode}
              onChange={(e) => setClassroomCode(e.target.value)}
              error={!!joinError}
              helperText={joinError}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ 
            px: { xs: 2, sm: 3 },
            pb: { xs: 2, sm: 3 },
            justifyContent: 'center'
          }}>
            <Button 
              onClick={() => setJoinDialogOpen(false)}
              sx={{
                borderRadius: 2,
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                textTransform: 'none',
                mr: 2,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoinClassroom}
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: 2,
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                textTransform: 'none',
                background: 'linear-gradient(45deg, #2563eb 30%, #7c3aed 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1d4ed8 30%, #6d28d9 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Join'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );

  const renderCourseView = () => (
    <Box sx={{ 
      maxWidth: isDesktop ? 1600 : 1200, 
      mx: 'auto', 
      px: isDesktop ? 6 : isLaptop ? 4 : 3,
      py: isDesktop ? 4 : 3
    }}>
      <Breadcrumbs sx={{ mb: isDesktop ? 6 : 4 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => setSelectedClassroom(null)}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Classrooms
        </Link>
        <Typography color="text.primary">
          {selectedClassroom?.name}
        </Typography>
      </Breadcrumbs>

      <Box sx={{ 
        textAlign: 'center', 
        mb: isDesktop ? 8 : isLaptop ? 6 : 4,
        maxWidth: 800,
        mx: 'auto'
      }}>
        <Typography 
          variant={isDesktop ? 'h3' : isLaptop ? 'h4' : 'h5'} 
          component="h1" 
          gutterBottom
        >
          Available Courses
        </Typography>
        <Typography 
          variant={isDesktop ? 'h6' : 'subtitle1'} 
          color="text.secondary"
        >
          Select a course to view its materials
        </Typography>
      </Box>

      <Grid container spacing={isDesktop ? 6 : isLaptop ? 4 : 3}>
        {selectedClassroom?.courses.map((course) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            lg={3} 
            key={course.id}
          >
            <Card
              title={course.name}
              description={course.description}
              icon={<SchoolIcon />}
              iconColor="secondary"
              chips={[
                { label: `${course.materials?.length || 0} Materials`, color: 'secondary' },
              ]}
              action={{
                label: 'View Materials',
                onClick: () => handleCourseClick(selectedClassroom, course),
                icon: <BookIcon />,
                color: 'secondary',
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderMaterialView = () => (
    <Box sx={{ 
      maxWidth: isDesktop ? 1600 : 1200, 
      mx: 'auto', 
      px: isDesktop ? 6 : isLaptop ? 4 : 3,
      py: isDesktop ? 4 : 3
    }}>
      <Breadcrumbs sx={{ mb: isDesktop ? 6 : 4 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => setSelectedClassroom(null)}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Classrooms
        </Link>
        <Link
          component="button"
          variant="body1"
          onClick={() => setSelectedCourse(null)}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          {selectedClassroom?.name}
        </Link>
        <Typography color="text.primary">
          {selectedCourse?.name}
        </Typography>
      </Breadcrumbs>

      <Paper sx={{ 
        p: isDesktop ? 6 : isLaptop ? 4 : 3, 
        borderRadius: 2, 
        boxShadow: 3 
      }}>
        <Box sx={{ mb: isDesktop ? 6 : 4 }}>
          <Typography 
            variant={isDesktop ? 'h3' : isLaptop ? 'h4' : 'h5'} 
            component="h1" 
            gutterBottom
          >
            {selectedCourse?.name}
          </Typography>
          <Typography 
            variant={isDesktop ? 'h6' : 'subtitle1'} 
            color="text.secondary"
          >
            {selectedCourse?.description}
          </Typography>
        </Box>

        <Divider sx={{ my: isDesktop ? 4 : 3 }} />

        <Box>
          <Typography 
            variant={isDesktop ? 'h5' : 'h6'} 
            gutterBottom
            sx={{ mb: isDesktop ? 4 : 3 }}
          >
            Course Materials
          </Typography>
          <List>
            {selectedCourse?.materials.map((material) => (
              <ListItem
                key={material.id}
                sx={{
                  borderRadius: 1,
                  mb: 2,
                  p: isDesktop ? 3 : 2,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateY(-2px)',
                    transition: 'transform 0.2s ease-in-out',
                  },
                }}
              >
                <ListItemIcon sx={{ mr: isDesktop ? 3 : 2 }}>
                  <BookIcon color="primary" fontSize={isDesktop ? 'large' : 'medium'} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant={isDesktop ? 'h6' : 'subtitle1'}>
                      {material.title}
                    </Typography>
                  }
                  secondary={
                    <Typography 
                      variant={isDesktop ? 'body1' : 'body2'} 
                      color="text.secondary"
                    >
                      {material.description}
                    </Typography>
                  }
                  sx={{ mr: isDesktop ? 4 : 2 }}
                />
                <IconButton
                  color="primary"
                  onClick={() => handleDownloadMaterial(material)}
                  size={isDesktop ? 'large' : 'medium'}
                  sx={{
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'primary.contrastText',
                      transform: 'scale(1.1)',
                      transition: 'transform 0.2s ease-in-out',
                    },
                  }}
                >
                  <DownloadIcon fontSize={isDesktop ? 'large' : 'medium'} />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Layout>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            maxWidth: 1600,
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            animation: 'slideIn 0.5s ease-out',
          }}
        >
          {error}
        </Alert>
      )}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '100vh',
        }}>
          <CircularProgress 
            size={isDesktop ? 60 : isLaptop ? 48 : 40} 
            sx={{
              color: 'primary.main',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
        </Box>
      ) : selectedCourse ? (
        renderMaterialView()
      ) : selectedClassroom ? (
        renderCourseView()
      ) : (
        renderClassroomView()
      )}
    </Layout>
  );
};

export default StudentDashboard; 