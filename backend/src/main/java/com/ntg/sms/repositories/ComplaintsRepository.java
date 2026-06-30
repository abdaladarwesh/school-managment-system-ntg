package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Complaints;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ComplaintsRepository extends JpaRepository<Complaints, Long> {

    /**
     * Count complaints grouped by category.
     * Returns Object[]{category, count}.
     */
    @Query("""
                SELECT c.category, COUNT(c)
                FROM Complaints c
                WHERE c.category IS NOT NULL
                GROUP BY c.category
                ORDER BY COUNT(c) DESC
            """)
    List<Object[]> countByCategory();
}
