package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

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

    /**
     * Count attendance records falling in a specific week
     * (from weekStart inclusive to weekEnd exclusive).
     */
    @Query("""
                SELECT COUNT(a)
                FROM Attendance a
                WHERE a.dateTime >= :weekStart
                  AND a.dateTime < :weekEnd
            """)
    long countByWeek(
            @Param("weekStart") LocalDateTime weekStart,
            @Param("weekEnd")   LocalDateTime weekEnd
    );

    /**
     * Absence count grouped by class name (student.class.name).
     * Returns Object[]{className, absentCount}.
     */
    @Query("""
    SELECT g.name, COUNT(a)
    FROM Attendance a
    JOIN a.student s
    JOIN s.studentClass c
    JOIN c.grade g
    WHERE a.status = 'A'
    GROUP BY g.name
""")
    List<Object[]> countAbsenceByGrade();
}
