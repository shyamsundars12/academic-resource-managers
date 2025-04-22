package org.example.academicresourcemanager.repository;

import org.example.academicresourcemanager.model.Material;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialRepository extends MongoRepository<Material, String> {
    List<Material> findByClassroomId(String classroomId);
    List<Material> findByClassroomIdAndCourseId(String classroomId, String courseId);
    List<Material> findByUploadedBy(String uploadedBy);
}
