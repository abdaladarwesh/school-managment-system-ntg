package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Violation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ViolationRepository extends JpaRepository<Violation, Long> {

    /**
     * Count violations grouped by month for a given date range.
     * Returns Object[]{monthNumber, count} ordered by month ascending.
     */
    @Query("""
                SELECT MONTH(v.date), COUNT(v)
                FROM Violation v
                WHERE v.date >= :from AND v.date <= :to
                GROUP BY MONTH(v.date)
                ORDER BY MONTH(v.date)
            """)
    List<Object[]> countByMonth(
            @Param("from") LocalDate from,
            @Param("to")   LocalDate to
    );
}
