package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Student;
import com.ntg.sms.Entities.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

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

    Optional<Student> findByUser(User user);

    @Query("""
            select sa from Student sa where sa.user.isDeleted = false
            """)
    List<Student> findAllWhereNotIsDeleted();

}
