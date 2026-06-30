package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Grade;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GradeRepository extends JpaRepository<Grade, Long> {
}