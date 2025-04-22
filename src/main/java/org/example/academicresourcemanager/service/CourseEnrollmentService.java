package org.example.academicresourcemanager.service;

import org.example.academicresourcemanager.model.Course;
import org.example.academicresourcemanager.model.CourseEnrollment;
import org.example.academicresourcemanager.model.EnrollmentStatus;
import org.example.academicresourcemanager.model.User;
import org.example.academicresourcemanager.repository.CourseEnrollmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CourseEnrollmentService {
    private final CourseEnrollmentRepository courseEnrollmentRepository;

    public CourseEnrollmentService(CourseEnrollmentRepository courseEnrollmentRepository) {
        this.courseEnrollmentRepository = courseEnrollmentRepository;
    }

    public CourseEnrollment enrollStudent(User student, Course course) {
        // Check if student is already enrolled
        if (courseEnrollmentRepository.findByStudentAndCourse(student, course).isPresent()) {
            throw new RuntimeException("Student is already enrolled in this course");
        }

        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setStatus(EnrollmentStatus.PENDING);
        enrollment.setCreatedAt(LocalDateTime.now());
        enrollment.setUpdatedAt(LocalDateTime.now());

        return courseEnrollmentRepository.save(enrollment);
    }

    public CourseEnrollment approveEnrollment(String id) {
        CourseEnrollment enrollment = courseEnrollmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        enrollment.setStatus(EnrollmentStatus.APPROVED);
        enrollment.setUpdatedAt(LocalDateTime.now());

        return courseEnrollmentRepository.save(enrollment);
    }

    public CourseEnrollment rejectEnrollment(String id) {
        CourseEnrollment enrollment = courseEnrollmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        enrollment.setStatus(EnrollmentStatus.REJECTED);
        enrollment.setUpdatedAt(LocalDateTime.now());

        return courseEnrollmentRepository.save(enrollment);
    }

    public List<CourseEnrollment> getEnrollmentsByStudent(User student) {
        return courseEnrollmentRepository.findByStudent(student);
    }

    public List<CourseEnrollment> getEnrollmentsByCourse(Course course) {
        return courseEnrollmentRepository.findByCourse(course);
    }

    public List<CourseEnrollment> getEnrollmentsByStatus(EnrollmentStatus status) {
        return courseEnrollmentRepository.findByStatus(status);
    }

    public void deleteEnrollment(String id) {
        courseEnrollmentRepository.deleteById(id);
    }
} 