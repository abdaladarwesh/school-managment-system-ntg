package com.ntg.sms.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "TRAINING_PROGRAM")
public class TrainingProgram {
    @Id
    @Column(name = "PROGRAM_ID", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    @JoinColumn(name = "TEACHER_ID", nullable = false)
    private Teacher teacher;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Size(max = 255)
    @NotNull
    @Column(name = "PROGRAM_NAME", nullable = false)
    private String programName;

    @Size(max = 255)
    @Column(name = "DESCRIPTION")
    private String description;

    @NotNull
    @Column(name = "START_DATE", nullable = false)
    private LocalDate startDate;

    @Column(name = "END_DATE")
    private LocalDate endDate;

    @Size(max = 255)
    @Column(name = "LOCATION")
    private String location;

    @NotNull
    @Column(name = "CREATED_AT", nullable = false)
    private Instant createdAt;


}