package org.example.academicresourcemanager.repository;

import org.example.academicresourcemanager.model.Course;
import org.example.academicresourcemanager.model.CourseMaterial;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseMaterialRepository extends MongoRepository<CourseMaterial, String> {
    List<CourseMaterial> findByCourse(Course course);
    List<CourseMaterial> findByTitleContainingIgnoreCase(String title);
    List<CourseMaterial> findByFileType(String fileType);
} 