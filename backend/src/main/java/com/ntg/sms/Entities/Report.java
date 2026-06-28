package com.ntg.sms.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "REPORTS")
public class Report {
    @Id
    @Column(name = "REPORT_ID", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Size(max = 255)
    @NotNull
    @Column(name = "CONTENT", nullable = false)
    private String content;

    @Size(max = 255)
    @Column(name = "FILE_LINK")
    private String fileLink;

    @ColumnDefault("sysdate")
    @Column(name = "CREATED_AT")
    private LocalDate createdAt;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "SENT_TO", nullable = false)
    private User sentTo;


}