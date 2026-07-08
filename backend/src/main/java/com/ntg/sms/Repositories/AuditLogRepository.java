package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // Get history for a specific table (e.g., "STUDENT")
    Page<AuditLog> findByTableNameOrderByChangedAtDesc(String tableName, Pageable pageable);

    // Get history for a specific record (e.g., Student ID 5)
    Page<AuditLog> findByTableNameAndRecordIdOrderByChangedAtDesc(String tableName, Long recordId, Pageable pageable);
}