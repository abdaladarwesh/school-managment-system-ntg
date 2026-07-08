package com.ntg.sms.Entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "AUDIT_LOGS")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AUDIT_ID")
    private Long auditId;

    @Column(name = "TABLE_NAME", nullable = false, length = 50)
    private String tableName;

    @Column(name = "RECORD_ID", nullable = false)
    private Long recordId;

    @Column(name = "ACTION", nullable = false, length = 10)
    private String action;

    @Lob
    @Column(name = "OLD_VALUE")
    private String oldValue; // Hibernate handles CLOB to String conversion

    @Lob
    @Column(name = "NEW_VALUE")
    private String newValue;

    @Column(name = "CHANGED_BY", length = 100)
    private String changedBy;

    @Column(name = "EDITED_USER_NAME", length = 300)
    private String editedUserName;

    @Lob
    @Column(name = "CHANGED_FIELDS")
    private String changedFields;

    @Column(name = "CHANGED_AT", updatable = false, columnDefinition = "DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime changedAt;

}