package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Class;
import com.ntg.sms.Entities.Grade;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClassRepository extends JpaRepository<Class,Long> {

    @Override
    @EntityGraph(attributePaths = {
            "grade",
            "grade.terms"
    })
    Optional<Class> findById(Long aLong);

    List<Class> findAllByGrade(Grade grade);
}
