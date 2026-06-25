package com.ntg.sms.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "NOTIFICATION")
public class Notification {
    @Id
    @Column(name = "NOTIFICATION_ID", nullable = false)
    private Long id;

    @Size(max = 255)
    @NotNull
    @Column(name = "TITLE", nullable = false)
    private String title;

    @Size(max = 255)
    @NotNull
    @Column(name = "\"TYPE\"", nullable = false)
    private String type;

    @Size(max = 255)
    @NotNull
    @Column(name = "PRIORITY", nullable = false)
    private String priority;

    @ColumnDefault("sysdate")
    @Column(name = "SENT_AT")
    private LocalDate sentAt;

    @Size(max = 255)
    @NotNull
    @Column(name = "\"BODY\"", nullable = false)
    private String body;


}