package org.example.academicresourcemanager.service;

import org.example.academicresourcemanager.model.Course;
import org.example.academicresourcemanager.model.User;
import org.example.academicresourcemanager.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseService {
    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    public Course createCourse(Course course, User teacher) {
        course.setTeacher(teacher);
        course.setStatus(Course.CourseStatus.DRAFT);
        course.setCreatedAt(LocalDateTime.now());
        course.setUpdatedAt(LocalDateTime.now());
        return courseRepository.save(course);
    }

    public Course updateCourse(String id, Course course) {
        Course existingCourse = courseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Course not found"));
        
        existingCourse.setTitle(course.getTitle());
        existingCourse.setDescription(course.getDescription());
        existingCourse.setCode(course.getCode());
        existingCourse.setCredits(course.getCredits());
        existingCourse.setUpdatedAt(LocalDateTime.now());
        
        return courseRepository.save(existingCourse);
    }

    public void deleteCourse(String id) {
        courseRepository.deleteById(id);
    }

    public Course getCourseById(String id) {
        return courseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> getCoursesByTeacher(User teacher) {
        return courseRepository.findByTeacher(teacher);
    }

    public List<Course> getCoursesByStatus(Course.CourseStatus status) {
        return courseRepository.findByStatus(status);
    }

    public List<Course> searchCourses(String query) {
        return courseRepository.findByTitleContainingIgnoreCase(query);
    }

    public Course publishCourse(String id) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Course not found"));
        
        course.setStatus(Course.CourseStatus.PUBLISHED);
        course.setUpdatedAt(LocalDateTime.now());
        
        return courseRepository.save(course);
    }

    public Course archiveCourse(String id) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Course not found"));
        
        course.setStatus(Course.CourseStatus.ARCHIVED);
        course.setUpdatedAt(LocalDateTime.now());
        
        return courseRepository.save(course);
    }
} 