package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.StudentMedicalHistory;
import com.ntg.sms.Entities.StudentMedicalHistoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentMedicalHistoryRepository extends JpaRepository<StudentMedicalHistory, Long> {
}
