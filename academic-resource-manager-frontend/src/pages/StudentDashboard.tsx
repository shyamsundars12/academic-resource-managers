import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
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
} from '@mui/material';
import {
  Class as ClassIcon,
  Book as BookIcon,
  Download as DownloadIcon,
  Home as HomeIcon,
  School as SchoolIcon,
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
    try {
      const response = await studentService.downloadMaterial(material.id);
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

  const renderClassroomView = () => (
    <Box sx={{ 
      maxWidth: isDesktop ? 1600 : 1200, 
      mx: 'auto', 
      px: isDesktop ? 6 : isLaptop ? 4 : 3,
      py: isDesktop ? 4 : 3
    }}>
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
          Welcome to Your Dashboard
        </Typography>
        <Typography 
          variant={isDesktop ? 'h6' : 'subtitle1'} 
          color="text.secondary"
        >
          Select a classroom to view available courses
        </Typography>
      </Box>
      <Grid container spacing={isDesktop ? 6 : isLaptop ? 4 : 3}>
        {classrooms.map((classroom) => (
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={4} 
            lg={3} 
            key={classroom.id}
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
            maxWidth: isDesktop ? 1600 : 1200,
            mx: 'auto',
            px: isDesktop ? 6 : isLaptop ? 4 : 3
          }}
        >
          {error}
        </Alert>
      )}
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: isDesktop ? 8 : isLaptop ? 6 : 4 
        }}>
          <CircularProgress size={isDesktop ? 60 : isLaptop ? 48 : 40} />
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