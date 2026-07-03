package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByClassField_IdAndDayOfWeekOrderByStartAtAsc(Long classId, Long dayOfWeek);
}