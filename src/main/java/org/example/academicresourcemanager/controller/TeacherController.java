package org.example.academicresourcemanager.controller;

import org.example.academicresourcemanager.model.Classroom;
import org.example.academicresourcemanager.model.Course;
import org.example.academicresourcemanager.model.Material;
import org.example.academicresourcemanager.service.TeacherService;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@PreAuthorize("hasRole('ROLE_TEACHER')") // Ensures that only TEACHER can access these endpoints
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @PostMapping("/classroom")
    public ResponseEntity<Classroom> createClassroom(@RequestBody Classroom classroom) {
        Classroom createdClassroom = teacherService.createClassroom(classroom);
        return ResponseEntity.ok(createdClassroom);
    }

    @GetMapping("/classrooms")
    public ResponseEntity<List<Classroom>> getMyClassrooms() {
        List<Classroom> classrooms = teacherService.getMyClassrooms();
        return ResponseEntity.ok(classrooms);
    }

    @PostMapping("/classroom/{classroomId}/course")
    public ResponseEntity<Course> createCourseInClassroom(
            @PathVariable String classroomId,
            @RequestBody Course course) {
        Course createdCourse = teacherService.createCourseInClassroom(classroomId, course);
        return ResponseEntity.ok(createdCourse);
    }

    @GetMapping("/classroom/{classroomId}/courses")
    public ResponseEntity<List<Course>> getClassroomCourses(@PathVariable String classroomId) {
        List<Course> courses = teacherService.getClassroomCourses(classroomId);
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/classroom/{classroomId}/course/{courseId}/material")
    public ResponseEntity<Material> uploadCourseMaterial(
            @PathVariable String classroomId,
            @PathVariable String courseId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description) {
        Material material = teacherService.uploadCourseMaterial(classroomId, courseId, file, title, description);
        return ResponseEntity.ok(material);
    }

    @GetMapping("/classroom/{classroomId}/course/{courseId}/materials")
    public ResponseEntity<List<Material>> getCourseMaterials(
            @PathVariable String classroomId,
            @PathVariable String courseId) {
        List<Material> materials = teacherService.getCourseMaterials(classroomId, courseId);
        return ResponseEntity.ok(materials);
    }

    @GetMapping("/classroom/{classroomId}/course/{courseId}/material/{materialId}/download")
    public ResponseEntity<Resource> downloadMaterial(
            @PathVariable String classroomId,
            @PathVariable String courseId,
            @PathVariable String materialId) {
        Resource resource = teacherService.downloadMaterial(classroomId, courseId, materialId);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @DeleteMapping("/classroom/{classroomId}/course/{courseId}/material/{materialId}")
    public ResponseEntity<Void> deleteMaterial(
            @PathVariable String classroomId,
            @PathVariable String courseId,
            @PathVariable String materialId) {
        teacherService.deleteMaterial(classroomId, courseId, materialId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/classroom/{classroomId}/course/{courseId}")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable String classroomId,
            @PathVariable String courseId) {
        teacherService.deleteCourse(classroomId, courseId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/classroom/{classroomId}")
    public ResponseEntity<Void> deleteClassroom(
            @PathVariable String classroomId) {
        teacherService.deleteClassroom(classroomId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/classroom/{classroomId}/regenerate-code")
    public ResponseEntity<Classroom> regenerateClassroomCode(@PathVariable String classroomId) {
        Classroom classroom = teacherService.regenerateClassroomCode(classroomId);
        return ResponseEntity.ok(classroom);
    }
}
