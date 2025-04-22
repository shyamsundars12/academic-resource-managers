package org.example.academicresourcemanager.repository;

import org.example.academicresourcemanager.model.Course;
import org.example.academicresourcemanager.model.CourseEnrollment;
import org.example.academicresourcemanager.model.EnrollmentStatus;
import org.example.academicresourcemanager.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseEnrollmentRepository extends MongoRepository<CourseEnrollment, String> {
    List<CourseEnrollment> findByStudent(User student);
    List<CourseEnrollment> findByCourse(Course course);
    List<CourseEnrollment> findByStatus(EnrollmentStatus status);
    Optional<CourseEnrollment> findByStudentAndCourse(User student, Course course);
} 