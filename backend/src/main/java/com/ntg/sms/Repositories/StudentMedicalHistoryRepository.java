package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Student;
import com.ntg.sms.Entities.StudentMedicalHistory;
import com.ntg.sms.Entities.StudentMedicalHistoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentMedicalHistoryRepository extends JpaRepository<StudentMedicalHistory, Long> {
    List<StudentMedicalHistory> findAllByStudent(Student student);
}
