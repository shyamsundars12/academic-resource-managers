package org.example.academicresourcemanager.repository;

import org.example.academicresourcemanager.model.Classroom;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomRepository extends MongoRepository<Classroom, String> {
    List<Classroom> findByTeacherId(String teacherId);
    List<Classroom> findByStudentIdsContaining(String studentId);
    Optional<Classroom> findByClassroomCode(String classroomCode);
}
