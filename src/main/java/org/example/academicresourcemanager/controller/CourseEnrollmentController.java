package org.example.academicresourcemanager.controller;

import org.example.academicresourcemanager.model.Course;
import org.example.academicresourcemanager.model.CourseEnrollment;
import org.example.academicresourcemanager.model.User;
import org.example.academicresourcemanager.model.EnrollmentStatus;
import org.example.academicresourcemanager.service.CourseEnrollmentService;
import org.example.academicresourcemanager.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/enrollments")
public class CourseEnrollmentController {
    @Autowired
    private CourseEnrollmentService courseEnrollmentService;

    @Autowired
    private CourseService courseService;

    @PostMapping
    public ResponseEntity<CourseEnrollment> enrollStudent(
            @PathVariable String courseId,
            @AuthenticationPrincipal User student) {
        Course course = courseService.getCourseById(courseId);
        return ResponseEntity.ok(courseEnrollmentService.enrollStudent(student, course));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<CourseEnrollment> approveEnrollment(@PathVariable String id) {
        return ResponseEntity.ok(courseEnrollmentService.approveEnrollment(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<CourseEnrollment> rejectEnrollment(@PathVariable String id) {
        return ResponseEntity.ok(courseEnrollmentService.rejectEnrollment(id));
    }

    @GetMapping
    public ResponseEntity<List<CourseEnrollment>> getEnrollmentsByCourse(@PathVariable String courseId) {
        Course course = courseService.getCourseById(courseId);
        return ResponseEntity.ok(courseEnrollmentService.getEnrollmentsByCourse(course));
    }

    @GetMapping("/student")
    public ResponseEntity<List<CourseEnrollment>> getEnrollmentsByStudent(@AuthenticationPrincipal User student) {
        return ResponseEntity.ok(courseEnrollmentService.getEnrollmentsByStudent(student));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CourseEnrollment>> getEnrollmentsByStatus(
            @PathVariable String status) {
        return ResponseEntity.ok(courseEnrollmentService.getEnrollmentsByStatus(
            EnrollmentStatus.valueOf(status.toUpperCase())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable String id) {
        courseEnrollmentService.deleteEnrollment(id);
        return ResponseEntity.ok().build();
    }
} 