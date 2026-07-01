package com.ntg.sms.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "STUDENT_FEEDBACK")
public class StudentFeedback {
    @Id
    @Column(name = "FEEDBACK_ID", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "STUDENT_ID", nullable = false)
    private Student student;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @NotNull
    @Column(name = "FEEDBACK_DATE", nullable = false)
    private LocalDate feedbackDate;

    @Size(max = 255)
    @NotNull
    @Column(name = "PERFORMANCE_NOTES", nullable = false)
    private String performanceNotes;

    @Size(max = 255)
    @Column(name = "BEHAVIOR_NOTES")
    private String behaviorNotes;

    @Size(max = 255)
    @Column(name = "RECOMMENDATIONS")
    private String recommendations;


}