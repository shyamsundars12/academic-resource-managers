package org.example.academicresourcemanager.service;

import org.example.academicresourcemanager.model.Classroom;
import org.example.academicresourcemanager.model.Course;
import org.example.academicresourcemanager.model.Material;
import org.example.academicresourcemanager.model.User;
import org.example.academicresourcemanager.repository.ClassroomRepository;
import org.example.academicresourcemanager.repository.CourseRepository;
import org.example.academicresourcemanager.repository.MaterialRepository;
import org.example.academicresourcemanager.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.ArrayList;

@Service
public class TeacherService {
    private static final Logger logger = LoggerFactory.getLogger(TeacherService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClassroomRepository classroomRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private MaterialRepository materialRepository;

    private final String uploadDir = "uploads";

    public TeacherService(UserRepository userRepository,
                         ClassroomRepository classroomRepository, 
                         CourseRepository courseRepository,
                         MaterialRepository materialRepository) {
        this.userRepository = userRepository;
        this.classroomRepository = classroomRepository;
        this.courseRepository = courseRepository;
        this.materialRepository = materialRepository;
    }

    public Classroom createClassroom(Classroom classroom) {
        String teacherId = getCurrentUserId();
        classroom.setTeacherId(teacherId);
        
        // Generate a unique classroom code
        String classroomCode = generateClassroomCode();
        logger.info("Generated classroom code: {}", classroomCode);
        classroom.setClassroomCode(classroomCode);
        
        Classroom savedClassroom = classroomRepository.save(classroom);
        logger.info("Saved classroom with code: {}", savedClassroom.getClassroomCode());
        return savedClassroom;
    }

    private String generateClassroomCode() {
        // Generate a 6-character alphanumeric code
        String uuid = UUID.randomUUID().toString().replace("-", "");
        String code = uuid.substring(0, 6).toUpperCase();
        logger.debug("Generated new classroom code: {}", code);
        return code;
    }

    public List<Classroom> getMyClassrooms() {
        String teacherId = getCurrentUserId();
        return classroomRepository.findByTeacherId(teacherId);
    }

    public Course createCourseInClassroom(String classroomId, Course course) {
        String teacherId = getCurrentUserId();
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        if (!classroom.getTeacherId().equals(teacherId)) {
            throw new RuntimeException("You are not the teacher of this classroom");
        }

        // Initialize courseIds if null
        if (classroom.getCourseIds() == null) {
            classroom.setCourseIds(new ArrayList<>());
        }

        course.setTeacher(getCurrentUser());
        course.setStatus(Course.CourseStatus.DRAFT);
        course.setCreatedAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());
        course.setClassroomId(classroomId); // Set the classroom ID in the course
        
        Course savedCourse = courseRepository.save(course);
        
        // Add the course ID to the classroom's courseIds list
        if (!classroom.getCourseIds().contains(savedCourse.getId())) {
            classroom.getCourseIds().add(savedCourse.getId());
            classroomRepository.save(classroom);
            logger.info("Added course {} to classroom {}", savedCourse.getId(), classroomId);
        }
        
        return savedCourse;
    }

    public List<Course> getClassroomCourses(String classroomId) {
        String teacherId = getCurrentUserId();
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        if (!classroom.getTeacherId().equals(teacherId)) {
            throw new RuntimeException("You are not the teacher of this classroom");
        }

        // Initialize courseIds if null
        if (classroom.getCourseIds() == null) {
            classroom.setCourseIds(new ArrayList<>());
            classroomRepository.save(classroom);
        }

        List<Course> courses = courseRepository.findAllById(classroom.getCourseIds());
        logger.info("Found {} courses for classroom {}", courses.size(), classroomId);
        return courses;
    }

    public Material uploadCourseMaterial(String classroomId, String courseId, 
                                       MultipartFile file, String title, String description) {
        String teacherId = getCurrentUserId();
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        if (!classroom.getTeacherId().equals(teacherId)) {
            throw new RuntimeException("You are not the teacher of this classroom");
        }

        if (!classroom.getCourseIds().contains(courseId)) {
            throw new RuntimeException("Course not found in this classroom");
        }

        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);
            Files.createDirectories(filePath.getParent());
            Files.copy(file.getInputStream(), filePath);

            Material material = new Material();
            material.setTitle(title);
            material.setDescription(description);
            material.setFilePath(filePath.toString());
            material.setClassroomId(classroomId);
            material.setCourseId(courseId);
            material.setUploadedBy(teacherId);
            material.setUploadDate(LocalDateTime.now());

            return materialRepository.save(material);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    public List<Material> getCourseMaterials(String classroomId, String courseId) {
        String teacherId = getCurrentUserId();
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        if (!classroom.getTeacherId().equals(teacherId)) {
            throw new RuntimeException("You are not the teacher of this classroom");
        }

        if (!classroom.getCourseIds().contains(courseId)) {
            throw new RuntimeException("Course not found in this classroom");
        }

        return materialRepository.findByClassroomIdAndCourseId(classroomId, courseId);
    }

    public Resource downloadMaterial(String classroomId, String courseId, String materialId) {
        String teacherId = getCurrentUserId();
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        if (!classroom.getTeacherId().equals(teacherId)) {
            throw new RuntimeException("You are not the teacher of this classroom");
        }

        if (!classroom.getCourseIds().contains(courseId)) {
            throw new RuntimeException("Course not found in this classroom");
        }

        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        if (!material.getClassroomId().equals(classroomId) || !material.getCourseId().equals(courseId)) {
            throw new RuntimeException("Material not found in this classroom/course");
        }

        try {
            Path filePath = Paths.get(material.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or not readable");
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to download file", e);
        }
    }

    public void deleteMaterial(String classroomId, String courseId, String materialId) {
        // Get the current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find the material
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found"));

        // Verify ownership
        if (!material.getUploadedBy().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to delete this material");
        }

        // Delete the file
        try {
            Path filePath = Paths.get(material.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete material file", e);
        }

        // Delete the material record
        materialRepository.delete(material);
    }

    public void deleteCourse(String classroomId, String courseId) {
        // Get the current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find the classroom and verify ownership
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        if (!classroom.getTeacherId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to delete this course");
        }

        // Find the course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Delete all materials associated with the course
        List<Material> materials = materialRepository.findByClassroomIdAndCourseId(classroomId, courseId);
        for (Material material : materials) {
            try {
                Path filePath = Paths.get(material.getFilePath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to delete material file", e);
            }
            materialRepository.delete(material);
        }

        // Delete the course
        courseRepository.delete(course);
    }

    public void deleteClassroom(String classroomId) {
        // Get the current user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find the classroom and verify ownership
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
        if (!classroom.getTeacherId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to delete this classroom");
        }

        // Delete all materials associated with the classroom
        List<Material> materials = materialRepository.findByClassroomId(classroomId);
        for (Material material : materials) {
            try {
                Path filePath = Paths.get(material.getFilePath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to delete material file", e);
            }
            materialRepository.delete(material);
        }

        // Delete all courses in the classroom
        List<Course> courses = courseRepository.findByClassroomId(classroomId);
        courseRepository.deleteAll(courses);

        // Delete the classroom
        classroomRepository.delete(classroom);
    }

    public Classroom regenerateClassroomCode(String classroomId) {
        String teacherId = getCurrentUserId();
        Classroom classroom = classroomRepository.findById(classroomId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        if (!classroom.getTeacherId().equals(teacherId)) {
            throw new RuntimeException("You are not the teacher of this classroom");
        }

        // Generate a new classroom code
        String newClassroomCode = generateClassroomCode();
        logger.info("Regenerating classroom code for classroom {}: {}", classroomId, newClassroomCode);
        
        classroom.setClassroomCode(newClassroomCode);
        Classroom savedClassroom = classroomRepository.save(classroom);
        logger.info("Saved classroom with new code: {}", savedClassroom.getClassroomCode());
        
        return savedClassroom;
    }

    private String getCurrentUserId() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return user.getId();
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
