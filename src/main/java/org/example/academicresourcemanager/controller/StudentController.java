package org.example.academicresourcemanager.controller;

import org.example.academicresourcemanager.model.Classroom;
import org.example.academicresourcemanager.model.Course;
import org.example.academicresourcemanager.model.Material;
import org.example.academicresourcemanager.service.StudentService;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('ROLE_STUDENT')")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/classrooms")
    public ResponseEntity<List<Classroom>> getMyClassrooms() {
        List<Classroom> classrooms = studentService.getMyClassrooms();
        return ResponseEntity.ok(classrooms);
    }

    @PostMapping("/classroom/join/{classroomCode}")
    public ResponseEntity<Classroom> joinClassroom(@PathVariable String classroomCode) {
        Classroom classroom = studentService.joinClassroom(classroomCode);
        return ResponseEntity.ok(classroom);
    }

    @GetMapping("/classroom/{classroomId}/courses")
    public ResponseEntity<List<Course>> getClassroomCourses(@PathVariable String classroomId) {
        List<Course> courses = studentService.getClassroomCourses(classroomId);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/classroom/{classroomId}/course/{courseId}/materials")
    public ResponseEntity<List<Material>> getCourseMaterials(
            @PathVariable String classroomId,
            @PathVariable String courseId) {
        List<Material> materials = studentService.getCourseMaterials(classroomId, courseId);
        return ResponseEntity.ok(materials);
    }

    @GetMapping("/classroom/{classroomId}/course/{courseId}/material/{materialId}/download")
    public ResponseEntity<Resource> downloadMaterial(
            @PathVariable String classroomId,
            @PathVariable String courseId,
            @PathVariable String materialId) {
        Resource resource = studentService.downloadMaterial(classroomId, courseId, materialId);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
