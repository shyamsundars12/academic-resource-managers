import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (data: {
    username: string;
    password: string;
    email: string;
    role: string;
    fullName: string;
    department?: string;
    studentId?: string;
  }) => {
    const endpoint = data.role === 'STUDENT' ? '/register/student' : '/register/teacher';
    return api.post(endpoint, data);
  },
};

// Student services
export const studentService = {
  getClassrooms: () => api.get('/student/classrooms'),
  getClassroomCourses: (classroomId: string) =>
    api.get(`/student/classroom/${classroomId}/courses`),
  getCourseMaterials: (classroomId: string, courseId: string) =>
    api.get(`/student/classroom/${classroomId}/course/${courseId}/materials`),
  downloadMaterial: (classroomId: string, courseId: string, materialId: string) =>
    api.get(`/student/classroom/${classroomId}/course/${courseId}/material/${materialId}/download`, {
      responseType: 'blob',
    }),
  joinClassroom: async (classroomCode: string) => {
    try {
      const response = await api.post(`/student/classroom/join/${classroomCode}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Teacher services
export const teacherService = {
  getClassrooms: () => api.get('/teacher/classrooms'),
  createClassroom: (data: { name: string; code: string }) =>
    api.post('/teacher/classrooms', data),
  createCourse: (classroomId: string, data: { name: string; description: string }) =>
    api.post(`/teacher/classroom/${classroomId}/courses`, data),
  uploadMaterial: (classroomId: string, courseId: string, formData: FormData) =>
    api.post(`/teacher/classroom/${classroomId}/course/${courseId}/materials`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
};

// Admin services
export const adminService = {
  getUsers: () => api.get('/admin/users'),
  createUser: (data: {
    username: string;
    password: string;
    email: string;
    role: string;
    fullName: string;
  }) => api.post('/admin/users', data),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
};

export default api; 