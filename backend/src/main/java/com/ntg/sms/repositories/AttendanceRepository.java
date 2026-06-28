package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Attendance;
import com.ntg.sms.Entities.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface AttendanceRepository  extends JpaRepository<Student, Long>{



}
