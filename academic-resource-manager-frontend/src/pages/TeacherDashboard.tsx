import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  // Grid,
  Card,
  CardContent,
  // CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  // Menu,
  // MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Breadcrumbs,
  Link,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  // MoreVert as MoreVertIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  GetApp as DownloadIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Book as BookIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Classroom {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  classroomCode: string;
  studentIds: string[];
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
  uploadDate: string;
}

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [viewMode, setViewMode] = useState<'classrooms' | 'course'>('classrooms');
  const [openClassroomDialog, setOpenClassroomDialog] = useState(false);
  const [openCourseDialog, setOpenCourseDialog] = useState(false);
  const [openMaterialDialog, setOpenMaterialDialog] = useState(false);
  const [newClassroom, setNewClassroom] = useState({ name: '', description: '' });
  const [newCourse, setNewCourse] = useState({ name: '', description: '' });
  const [newMaterial, setNewMaterial] = useState({ title: '', description: '', file: null as File | null });
  // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [downloadingMaterial, setDownloadingMaterial] = useState<string | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<string | null>(null);
  const [openDeleteCourseDialog, setOpenDeleteCourseDialog] = useState(false);
  const [openDeleteClassroomDialog, setOpenDeleteClassroomDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{ classroom: Classroom; course: Course } | null>(null);
  const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/teacher/classrooms', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      console.log('Fetched classrooms:', response.data);
      
      // Fetch courses for each classroom
      const classroomsWithCourses = await Promise.all(
        response.data.map(async (classroom: Classroom) => {
          try {
            const coursesResponse = await axios.get(
              `http://localhost:8080/api/teacher/classroom/${classroom.id}/courses`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );

            // Log a warning if classroom code is missing
            if (!classroom.classroomCode) {
              console.warn(`Classroom ${classroom.id} has missing classroom code. Regenerating...`);
              // Try to regenerate the classroom code
              try {
                const updateResponse = await axios.put(
                  `http://localhost:8080/api/teacher/classroom/${classroom.id}/regenerate-code`,
                  {},
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                  }
                );
                classroom.classroomCode = updateResponse.data.classroomCode;
                console.log(`Regenerated classroom code for classroom ${classroom.id}: ${classroom.classroomCode}`);
              } catch (updateError) {
                console.error(`Failed to regenerate classroom code for classroom ${classroom.id}:`, updateError);
              }
            }

            return {
              ...classroom,
              courses: coursesResponse.data || [],
            };
          } catch (error) {
            console.error(`Failed to fetch courses for classroom ${classroom.id}:`, error);
            return {
              ...classroom,
              courses: [],
            };
          }
        })
      );
      
      setClassrooms(classroomsWithCourses);
    } catch (error) {
      console.error('Failed to fetch classrooms:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleCreateClassroom = async () => {
    try {
      await axios.post(
        'http://localhost:8080/api/teacher/classroom',
        newClassroom,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setOpenClassroomDialog(false);
      setNewClassroom({ name: '', description: '' });
      fetchClassrooms();
    } catch (error) {
      console.error('Failed to create classroom:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleCreateCourse = async () => {
    console.log('Selected classroom for course creation:', selectedClassroom);
    if (!selectedClassroom?.id) {
      console.error('No classroom selected');
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:8080/api/teacher/classroom/${selectedClassroom.id}/course`,
        newCourse,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log('Course created successfully:', response.data);
      setOpenCourseDialog(false);
      setNewCourse({ name: '', description: '' });
      // Refresh classrooms to show the new course
      await fetchClassrooms();
    } catch (error) {
      console.error('Failed to create course:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleCourseClick = async (classroom: Classroom, course: Course) => {
    try {
      // Fetch materials for the selected course
      const response = await axios.get(
        `http://localhost:8080/api/teacher/classroom/${classroom.id}/course/${course.id}/materials`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      // Update the course with fetched materials
      const updatedCourse = {
        ...course,
        materials: response.data,
      };
      
      setSelectedClassroom(classroom);
      setSelectedCourse(updatedCourse);
      setViewMode('course');
    } catch (error) {
      console.error('Failed to fetch course materials:', error);
    }
  };

  const handleBackToClassrooms = () => {
    setSelectedClassroom(null);
    setSelectedCourse(null);
    setViewMode('classrooms');
  };

  const handleUploadMaterial = async () => {
    if (!selectedCourse?.id || !selectedClassroom?.id) {
      console.error('No course or classroom selected');
      return;
    }

    if (!newMaterial.file) {
      console.error('No file selected');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(newMaterial.file.type)) {
      console.error('Invalid file type. Please upload PDF, Word, or image files.');
      return;
    }

    const formData = new FormData();
    formData.append('title', newMaterial.title);
    formData.append('description', newMaterial.description);
    formData.append('file', newMaterial.file);

    try {
      const response = await axios.post(
        `http://localhost:8080/api/teacher/classroom/${selectedClassroom.id}/course/${selectedCourse.id}/material`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      // Update the course with the new material
      if (selectedCourse) {
        const updatedCourse = {
          ...selectedCourse,
          materials: [...(selectedCourse.materials || []), response.data],
        };
        setSelectedCourse(updatedCourse);
      }

      // Refresh the classrooms list to update material counts
      const updatedClassrooms = await Promise.all(
        classrooms.map(async (classroom) => {
          if (classroom.id === selectedClassroom.id) {
            try {
              const coursesResponse = await axios.get(
                `http://localhost:8080/api/teacher/classroom/${classroom.id}/courses`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                  },
                }
              );
              return {
                ...classroom,
                courses: coursesResponse.data || [],
              };
            } catch (error) {
              console.error(`Failed to fetch courses for classroom ${classroom.id}:`, error);
              return classroom;
            }
          }
          return classroom;
        })
      );
      
      setClassrooms(updatedClassrooms);
      setOpenMaterialDialog(false);
      setNewMaterial({ title: '', description: '', file: null });
    } catch (error) {
      console.error('Failed to upload material:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Failed to upload material');
      }
    }
  };

  const handleDownloadMaterial = async (material: Material) => {
    if (!selectedClassroom?.id || !selectedCourse?.id) {
      console.error('No classroom or course selected');
      return;
    }

    setDownloadingMaterial(material.id);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/teacher/classroom/${selectedClassroom.id}/course/${selectedCourse.id}/material/${material.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          responseType: 'blob',
        }
      );
      
      // Get filename from response headers or use material title
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : material.title;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download material:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Failed to download material');
      }
    } finally {
      setDownloadingMaterial(null);
    }
  };

  const handleDeleteMaterial = async (material: Material) => {
    if (!selectedClassroom?.id || !selectedCourse?.id) {
      console.error('No classroom or course selected');
      return;
    }

    setDeletingMaterial(material.id);
    try {
      await axios.delete(
        `http://localhost:8080/api/teacher/classroom/${selectedClassroom.id}/course/${selectedCourse.id}/material/${material.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update the course materials list
      if (selectedCourse) {
        const updatedCourse = {
          ...selectedCourse,
          materials: selectedCourse.materials.filter(m => m.id !== material.id),
        };
        setSelectedCourse(updatedCourse);
      }

      // Refresh the classrooms list to update material counts
      const updatedClassrooms = await Promise.all(
        classrooms.map(async (classroom) => {
          if (classroom.id === selectedClassroom.id) {
            try {
              const coursesResponse = await axios.get(
                `http://localhost:8080/api/teacher/classroom/${classroom.id}/courses`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                  },
                }
              );
              return {
                ...classroom,
                courses: coursesResponse.data || [],
              };
            } catch (error) {
              console.error(`Failed to fetch courses for classroom ${classroom.id}:`, error);
              return classroom;
            }
          }
          return classroom;
        })
      );
      
      setClassrooms(updatedClassrooms);
    } catch (error) {
      console.error('Failed to delete material:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Failed to delete material');
      }
    } finally {
      setDeletingMaterial(null);
    }
  };

  const handleDeleteCourse = async (classroom: Classroom, course: Course) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/teacher/classroom/${classroom.id}/course/${course.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Refresh classrooms list
      const updatedClassrooms = await Promise.all(
        classrooms.map(async (c) => {
          if (c.id === classroom.id) {
            try {
              const coursesResponse = await axios.get(
                `http://localhost:8080/api/teacher/classroom/${c.id}/courses`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                  },
                }
              );
              return {
                ...c,
                courses: coursesResponse.data || [],
              };
            } catch (error) {
              console.error(`Failed to fetch courses for classroom ${c.id}:`, error);
              return c;
            }
          }
          return c;
        })
      );
      
      setClassrooms(updatedClassrooms);
      setOpenDeleteCourseDialog(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error('Failed to delete course:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  const handleDeleteClassroom = async (classroom: Classroom) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/teacher/classroom/${classroom.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Remove the classroom from the list
      setClassrooms(classrooms.filter(c => c.id !== classroom.id));
      setOpenDeleteClassroomDialog(false);
      setClassroomToDelete(null);
    } catch (error) {
      console.error('Failed to delete classroom:', error);
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.message || 'Failed to delete classroom');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleCopyClassroomCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setSnackbar({
        open: true,
        message: 'Classroom code copied to clipboard!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to copy classroom code',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const renderClassroomView = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          My Classrooms
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenClassroomDialog(true)}
        >
          Create Classroom
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {classrooms.map((classroom) => (
          <Box key={classroom.id} sx={{ width: { xs: '100%', md: 'calc(50% - 12px)' } }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{classroom.name}</Typography>
                  <IconButton
                    onClick={() => {
                      setClassroomToDelete(classroom);
                      setOpenDeleteClassroomDialog(true);
                    }}
                    title="Delete Classroom"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Typography color="textSecondary">{classroom.description}</Typography>
                
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">Classroom Code:</Typography>
                  <Chip
                    label={classroom.classroomCode}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleCopyClassroomCode(classroom.classroomCode)}
                    title="Copy classroom code"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Courses
                </Typography>
                <List>
                  {classroom.courses.map((course) => (
                    <ListItem
                      key={course.id}
                      onClick={() => handleCourseClick(classroom, course)}
                      sx={{
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemText
                        primary={course.name}
                        secondary={course.description}
                      />
                      <Chip
                        label={`${course.materials?.length || 0} materials`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCourseToDelete({ classroom, course });
                          setOpenDeleteCourseDialog(true);
                        }}
                        title="Delete Course"
                        color="error"
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setSelectedClassroom(classroom);
                    setOpenCourseDialog(true);
                  }}
                  sx={{ mt: 2 }}
                >
                  Add Course
                </Button>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </>
  );

  const renderCourseView = () => (
    <>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            component="button"
            variant="body1"
            onClick={handleBackToClassrooms}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Classrooms
          </Link>
          <Typography color="text.primary">
            <SchoolIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {selectedClassroom?.name}
          </Typography>
          <Typography color="text.primary">
            <BookIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            {selectedCourse?.name}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedCourse?.name}
              </Typography>
              <Typography color="textSecondary" paragraph>
                {selectedCourse?.description}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setOpenMaterialDialog(true)}
            >
              Upload Material
            </Button>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Course Materials
          </Typography>
          {selectedCourse?.materials && selectedCourse.materials.length > 0 ? (
            <List>
              {selectedCourse.materials
                .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
                .map((material) => (
                  <ListItem 
                    key={material.id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" component="span">
                            {material.title}
                          </Typography>
                          <Chip
                            label={material.filePath.split('.').pop()?.toUpperCase()}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box component="span">
                          <Typography variant="body2" color="text.secondary" component="span" display="block">
                            {material.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary" component="span">
                              Uploaded: {new Date(material.uploadDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" component="span">
                              {new Date(material.uploadDate).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleDownloadMaterial(material)}
                        title="Download Material"
                        color="primary"
                        disabled={downloadingMaterial === material.id}
                        sx={{ mr: 1 }}
                      >
                        {downloadingMaterial === material.id ? (
                          <CircularProgress size={24} />
                        ) : (
                          <DownloadIcon />
                        )}
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteMaterial(material)}
                        title="Delete Material"
                        color="error"
                        disabled={deletingMaterial === material.id}
                      >
                        {deletingMaterial === material.id ? (
                          <CircularProgress size={24} />
                        ) : (
                          <DeleteIcon />
                        )}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
            </List>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                py: 4,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography color="textSecondary" align="center">
                No materials available for this course yet.
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                Click the "Upload Material" button to add materials to this course.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {viewMode === 'classrooms' ? renderClassroomView() : renderCourseView()}

        {/* Create Classroom Dialog */}
        <Dialog open={openClassroomDialog} onClose={() => setOpenClassroomDialog(false)}>
          <DialogTitle>Create New Classroom</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Classroom Name"
              fullWidth
              value={newClassroom.name}
              onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={newClassroom.description}
              onChange={(e) => setNewClassroom({ ...newClassroom, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenClassroomDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateClassroom} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Course Dialog */}
        <Dialog open={openCourseDialog} onClose={() => setOpenCourseDialog(false)}>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Course Name"
              fullWidth
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCourseDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCourse} variant="contained">
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Upload Material Dialog */}
        <Dialog open={openMaterialDialog} onClose={() => setOpenMaterialDialog(false)}>
          <DialogTitle>Upload New Material</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              required
              value={newMaterial.title}
              onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={4}
              required
              value={newMaterial.description}
              onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              sx={{ mt: 2 }}
            >
              Upload File
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setNewMaterial({ ...newMaterial, file: e.target.files[0] });
                  }
                }}
              />
            </Button>
            {newMaterial.file && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">
                  Selected file: {newMaterial.file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Size: {(newMaterial.file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenMaterialDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleUploadMaterial} 
              variant="contained"
              disabled={!newMaterial.title || !newMaterial.description || !newMaterial.file}
            >
              Upload
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Course Dialog */}
        <Dialog
          open={openDeleteCourseDialog}
          onClose={() => {
            setOpenDeleteCourseDialog(false);
            setCourseToDelete(null);
          }}
        >
          <DialogTitle>Delete Course</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the course "{courseToDelete?.course.name}"?
              This action cannot be undone and will also delete all materials associated with this course.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenDeleteCourseDialog(false);
              setCourseToDelete(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => courseToDelete && handleDeleteCourse(courseToDelete.classroom, courseToDelete.course)}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Classroom Dialog */}
        <Dialog
          open={openDeleteClassroomDialog}
          onClose={() => {
            setOpenDeleteClassroomDialog(false);
            setClassroomToDelete(null);
          }}
        >
          <DialogTitle>Delete Classroom</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the classroom "{classroomToDelete?.name}"?
              This action cannot be undone and will also delete all courses and materials in this classroom.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setOpenDeleteClassroomDialog(false);
              setClassroomToDelete(null);
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => classroomToDelete && handleDeleteClassroom(classroomToDelete)}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Logout Button */}
        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
          sx={{ position: 'absolute', top: 16, right: 16 }}
        >
          Logout
        </Button>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default TeacherDashboard; 