package com.ntg.sms.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "ENGINEER_FEEDBACK")
public class EngineerFeedback {
    @Id
    @Column(name = "FEEDBACK_ID", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "TEACHER_ID", nullable = false)
    private Teacher teacher;

    @NotNull
    @Column(name = "FEEDBACK_DATE", nullable = false)
    private LocalDate feedbackDate;

    @Size(max = 255)
    @NotNull
    @Column(name = "FEEDBACK", nullable = false)
    private String feedback;

    @Size(max = 255)
    @Column(name = "NOTES")
    private String notes;


}