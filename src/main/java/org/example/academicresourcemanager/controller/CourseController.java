package org.example.academicresourcemanager.controller;

import org.example.academicresourcemanager.model.Course;
import org.example.academicresourcemanager.model.User;
import org.example.academicresourcemanager.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    @Autowired
    private CourseService courseService;

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course, @AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(courseService.createCourse(course, teacher));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Course> updateCourse(@PathVariable String id, @RequestBody Course course) {
        return ResponseEntity.ok(courseService.updateCourse(id, course));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable String id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable String id) {
        return ResponseEntity.ok(courseService.getCourseById(id));
    }

    @GetMapping("/teacher")
    public ResponseEntity<List<Course>> getCoursesByTeacher(@AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(courseService.getCoursesByTeacher(teacher));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Course>> getCoursesByStatus(@PathVariable Course.CourseStatus status) {
        return ResponseEntity.ok(courseService.getCoursesByStatus(status));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<Course> publishCourse(@PathVariable String id) {
        return ResponseEntity.ok(courseService.publishCourse(id));
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<Course> archiveCourse(@PathVariable String id) {
        return ResponseEntity.ok(courseService.archiveCourse(id));
    }
} 