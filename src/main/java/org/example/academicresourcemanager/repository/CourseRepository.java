package org.example.academicresourcemanager.repository;

import org.example.academicresourcemanager.model.Course;
import org.example.academicresourcemanager.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseRepository extends MongoRepository<Course, String> {
    List<Course> findByTeacher(User teacher);
    List<Course> findByStatus(Course.CourseStatus status);
    List<Course> findByTitleContainingIgnoreCase(String title);
    List<Course> findByCodeContainingIgnoreCase(String code);
    List<Course> findByClassroomId(String classroomId);
    List<Course> findByTeacherId(String teacherId);
    List<Course> findAllById(List<String> ids);
} 