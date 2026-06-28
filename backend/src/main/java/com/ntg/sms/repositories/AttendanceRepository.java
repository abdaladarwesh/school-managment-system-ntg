package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    @Query("""
                SELECT COUNT(a)
                FROM Attendance a
                WHERE a.dateTime >= :startOfDay
                  AND a.dateTime < :startOfNextDay
            """)
    long countByDateBetween(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("startOfNextDay") LocalDateTime startOfNextDay
    );

    default long countToday() {
        LocalDate today = LocalDate.now();

        return countByDateBetween(
                today.atStartOfDay(),
                today.plusDays(1).atStartOfDay()
        );
    }
}
