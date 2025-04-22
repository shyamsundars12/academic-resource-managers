package org.example.academicresourcemanager.controller;

import org.example.academicresourcemanager.model.Course;
import org.example.academicresourcemanager.model.CourseMaterial;
import org.example.academicresourcemanager.service.CourseMaterialService;
import org.example.academicresourcemanager.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/materials")
public class CourseMaterialController {
    @Autowired
    private CourseMaterialService courseMaterialService;

    @Autowired
    private CourseService courseService;

    @PostMapping
    public ResponseEntity<CourseMaterial> createCourseMaterial(
            @PathVariable String courseId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description) {
        Course course = courseService.getCourseById(courseId);
        CourseMaterial material = new CourseMaterial();
        material.setTitle(title);
        material.setDescription(description);
        return ResponseEntity.ok(courseMaterialService.createCourseMaterial(material, course, file));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CourseMaterial> updateCourseMaterial(
            @PathVariable String id,
            @RequestBody CourseMaterial material) {
        return ResponseEntity.ok(courseMaterialService.updateCourseMaterial(id, material));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourseMaterial(@PathVariable String id) {
        courseMaterialService.deleteCourseMaterial(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<CourseMaterial>> getCourseMaterialsByCourse(@PathVariable String courseId) {
        Course course = courseService.getCourseById(courseId);
        return ResponseEntity.ok(courseMaterialService.getCourseMaterialsByCourse(course));
    }

    @GetMapping("/type/{fileType}")
    public ResponseEntity<List<CourseMaterial>> getCourseMaterialsByFileType(@PathVariable String fileType) {
        return ResponseEntity.ok(courseMaterialService.getCourseMaterialsByFileType(fileType));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseMaterial> getCourseMaterialById(@PathVariable String id) {
        return ResponseEntity.ok(courseMaterialService.getCourseMaterialById(id));
    }
} 