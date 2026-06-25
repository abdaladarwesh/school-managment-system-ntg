package com.ntg.sms.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "SESSIONS")
public class Session {
    @Id
    @Column(name = "SESSION_ID", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    @JoinColumn(name = "CLASS_ID", nullable = false)
    private Class classField;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    @JoinColumn(name = "COURSE_ID", nullable = false)
    private Course course;

    @NotNull
    @Column(name = "DAY_OF_WEEK", nullable = false)
    private Long dayOfWeek;

    @NotNull
    @Column(name = "START_AT", nullable = false)
    private LocalDate startAt;

    @NotNull
    @Column(name = "END_AT", nullable = false)
    private LocalDate endAt;

    @NotNull
    @Column(name = "UPDATED_AT", nullable = false)
    private LocalDate updatedAt;


}