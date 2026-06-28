package com.ntg.sms.repositories;

import com.ntg.sms.entities.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface StudentRepository extends JpaRepository<Student,Long> {
}
