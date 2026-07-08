package com.ntg.sms.Controllers;

import com.ntg.sms.Entities.AuditLog;
import com.ntg.sms.Service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;


    // GET /api/audit-logs?page=0&size=20
    @GetMapping
    public ResponseEntity<Page<AuditLog>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditLogService.getAllLogs(page, size));
    }

    // GET /api/audit-logs/STUDENT/123?page=0&size=10
    @GetMapping("/{tableName}/{recordId}")
    public ResponseEntity<Page<AuditLog>> getRecordHistory(
            @PathVariable String tableName,
            @PathVariable Long recordId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(auditLogService.getRecordHistory(tableName, recordId, page, size));
    }
}