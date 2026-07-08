package com.ntg.sms.Service.Impl;

import com.ntg.sms.Entities.AuditLog;
import com.ntg.sms.Repositories.AuditLogRepository;
import com.ntg.sms.Service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;


    public Page<AuditLog> getAllLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepository.findAll(pageable);
    }

    public Page<AuditLog> getRecordHistory(String tableName, Long recordId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepository.findByTableNameAndRecordIdOrderByChangedAtDesc(tableName, recordId, pageable);
    }
}