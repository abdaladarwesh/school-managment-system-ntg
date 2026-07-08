package com.ntg.sms.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.Audited;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "VIOLATIONS")
public class Violation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "VIOLATION_ID", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "STUDENT_ID", nullable = false)
    private Student student;

    @Size(max = 255)
    @NotNull
    @Column(name = "VIOLATION", nullable = false)
    private String violation;

    @Size(max = 255)
    @NotNull
    @Column(name = "NAME_OF_VIOLATOR", nullable = false)
    private String nameOfViolator;

    @Size(max = 255)
    @NotNull
    @Column(name = "APPLICABLE_PROCEDURE", nullable = false)
    private String applicableProcedure;

    @Size(max = 255)
    @NotNull
    @Column(name = "REFERRING_AUTHORITY", nullable = false)
    private String referringAuthority;

    @NotNull
    @Column(name = "ISMEETING", nullable = false)
    private Boolean ismeeting;

    @Size(max = 255)
    @Column(name = "NOTES")
    private String notes;

    @ColumnDefault("sysdate")
    @Column(name = "\"date\"")
    private LocalDate date;
}