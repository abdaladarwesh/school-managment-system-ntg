package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Student;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student,Long> {
    @Override
    @EntityGraph(attributePaths = {
            "user",
            "studentClass",
            "studentClass.grade",
            "studentClass.grade.terms"
    })
    List<Student> findAll();

    @Override
    @EntityGraph(attributePaths = {
            "user",
            "studentClass",
            "studentClass.grade",
            "studentClass.grade.terms"
    })
    Optional<Student> findById(Long aLong);

    boolean existsByUserId(Long userId);

    List<Student> findByStudentClassIdOrderByUserFirstNameAsc(Long studentClassId);

    long countByStudentClassId(Long studentClassId);
}
