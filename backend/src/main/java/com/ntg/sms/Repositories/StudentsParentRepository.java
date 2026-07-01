package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Student;
import com.ntg.sms.Entities.StudentsParent;
import com.ntg.sms.Entities.StudentsParentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentsParentRepository extends JpaRepository<StudentsParent, StudentsParentId> {
    List<StudentsParent> findAllByStudent(Student student);
    @Query("SELECT sp FROM StudentsParent sp WHERE sp.id.studentId = :studentId AND sp.parentRole = :parentRole")
    Optional<StudentsParent> findByStudentIdAndParentRole(
            @Param("studentId") Long studentId,
            @Param("parentRole") String parentRole
    );

}
