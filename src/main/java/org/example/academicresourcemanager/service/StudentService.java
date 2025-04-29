package org.example.academicresourcemanager.service;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.example.academicresourcemanager.model.Classroom;
import org.example.academicresourcemanager.model.Course;
import org.example.academicresourcemanager.model.Material;
import org.example.academicresourcemanager.model.User;
import org.example.academicresourcemanager.repository.ClassroomRepository;
import org.example.academicresourcemanager.repository.CourseRepository;
import org.example.academicresourcemanager.repository.MaterialRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class StudentService {
    private static final Logger logger = LoggerFactory.getLogger(StudentService.class);

    private final ClassroomRepository classroomRepository;
    private final CourseRepository courseRepository;
    private final MaterialRepository materialRepository;

    public StudentService(ClassroomRepository classroomRepository,
                         CourseRepository courseRepository,
                         MaterialRepository materialRepository) {
        this.classroomRepository = classroomRepository;
        this.courseRepository = courseRepository;
        this.materialRepository = materialRepository;
    }

    public List<Classroom> getMyClassrooms() {
        String studentId = getCurrentUserId();
        logger.debug("Fetching classrooms for student ID: {}", studentId);
        List<Classroom> classrooms = classroomRepository.findByStudentIdsContaining(studentId);
        logger.debug("Found {} classrooms for student ID: {}", classrooms.size(), studentId);
        return classrooms;
    }

    public Classroom joinClassroom(String classroomCode) {
        if (classroomCode == null || classroomCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Classroom code cannot be empty");
        }

        String studentId = getCurrentUserId();
        logger.debug("Student {} attempting to join classroom with code: {}", studentId, classroomCode);

        Classroom classroom = classroomRepository.findByClassroomCode(classroomCode)
            .orElseThrow(() -> new RuntimeException("Classroom not found with code: " + classroomCode));

        if (classroom.getStudentIds().contains(studentId)) {
            throw new RuntimeException("You are already a member of this classroom");
        }

        classroom.getStudentIds().add(studentId);
        Classroom savedClassroom = classroomRepository.save(classroom);
        logger.info("Student {} successfully joined classroom {}", studentId, classroom.getId());
        return savedClassroom;
    }

    public List<Course> getClassroomCourses(String classroomId) {
        String studentId = getCurrentUserId();
        logger.debug("Fetching courses for classroom {} and student {}", classroomId, studentId);

        Classroom classroom = classroomRepository.findById(classroomId)
            .orElseThrow(() -> new RuntimeException("Classroom not found with ID: " + classroomId));

        if (!classroom.getStudentIds().contains(studentId)) {
            throw new RuntimeException("You are not a member of this classroom");
        }

        // Initialize courseIds if null
        if (classroom.getCourseIds() == null) {
            classroom.setCourseIds(new ArrayList<>());
            classroomRepository.save(classroom);
            logger.info("Initialized empty courseIds list for classroom {}", classroomId);
            return new ArrayList<>();
        }

        // Fetch all courses associated with this classroom using courseIds
        List<Course> courses = courseRepository.findAllById(classroom.getCourseIds());
        logger.debug("Found {} courses for classroom {}", courses.size(), classroomId);
        
        // For each course, fetch its materials
        for (Course course : courses) {
            List<Material> materials = materialRepository.findByClassroomIdAndCourseId(classroomId, course.getId());
            course.setMaterials(materials);
        }
        
        return courses;
    }

    public List<Material> getCourseMaterials(String classroomId, String courseId) {
        String studentId = getCurrentUserId();
        logger.debug("Fetching materials for classroom {}, course {}, and student {}", 
            classroomId, courseId, studentId);

        Classroom classroom = classroomRepository.findById(classroomId)
            .orElseThrow(() -> new RuntimeException("Classroom not found with ID: " + classroomId));

        if (!classroom.getStudentIds().contains(studentId)) {
            throw new RuntimeException("You are not a member of this classroom");
        }

        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        if (!classroom.getCourseIds().contains(courseId)) {
            throw new RuntimeException("Course not found in this classroom");
        }

        List<Material> materials = materialRepository.findByClassroomIdAndCourseId(classroomId, courseId);
        logger.debug("Found {} materials for course {}", materials.size(), courseId);
        return materials;
    }

    public Resource downloadMaterial(String classroomId, String courseId, String materialId) {
        String studentId = getCurrentUserId();
        logger.debug("Attempting to download material {} for student {} in classroom {} and course {}", 
            materialId, studentId, classroomId, courseId);

        Classroom classroom = classroomRepository.findById(classroomId)
            .orElseThrow(() -> {
                logger.error("Classroom not found: {}", classroomId);
                return new RuntimeException("Classroom not found");
            });

        if (!classroom.getStudentIds().contains(studentId)) {
            logger.error("Student {} is not a member of classroom {}", studentId, classroomId);
            throw new RuntimeException("You are not a member of this classroom");
        }

        Material material = materialRepository.findById(materialId)
            .orElseThrow(() -> {
                logger.error("Material not found: {}", materialId);
                return new RuntimeException("Material not found");
            });

        if (!material.getClassroomId().equals(classroomId) || !material.getCourseId().equals(courseId)) {
            logger.error("Material {} not found in classroom {} and course {}", materialId, classroomId, courseId);
            throw new RuntimeException("Material not found in this classroom/course");
        }

        try {
            Path filePath = Paths.get(material.getFilePath());
            logger.debug("Attempting to load file from path: {}", filePath.toAbsolutePath());
            
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                logger.info("Successfully loaded file for download: {}", material.getFilePath());
                return resource;
            } else {
                logger.error("File not found or not readable: {}", material.getFilePath());
                throw new RuntimeException("File not found or not readable");
            }
        } catch (Exception e) {
            logger.error("Failed to download file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to download file: " + e.getMessage(), e);
        }
    }

    private String getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null) {
                throw new RuntimeException("No authentication found");
            }

            Object principal = authentication.getPrincipal();
            if (!(principal instanceof User)) {
                throw new RuntimeException("Invalid user type in authentication");
            }

            User user = (User) principal;
            String userId = user.getId();
            if (userId == null || userId.trim().isEmpty()) {
                throw new RuntimeException("User ID is null or empty");
            }

            return userId;
        } catch (Exception e) {
            logger.error("Error getting current user ID", e);
            throw new RuntimeException("Failed to get current user ID: " + e.getMessage());
        }
    }
}
