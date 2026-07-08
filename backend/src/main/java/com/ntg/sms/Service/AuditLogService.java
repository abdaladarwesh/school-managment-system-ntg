package com.ntg.sms.Service;



import com.ntg.sms.Entities.AuditLog;
import org.springframework.data.domain.Page;

public interface AuditLogService {
    Page<AuditLog> getAllLogs(int page, int size);
    Page<AuditLog> getRecordHistory(String tableName, Long recordId, int page, int size) ;
}
