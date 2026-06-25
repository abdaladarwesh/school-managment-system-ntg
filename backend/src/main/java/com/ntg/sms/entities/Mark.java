package com.ntg.sms.entities;

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
@Table(name = "MARKS")
public class Mark {
    @Id
    @Column(name = "MARK_ID", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    @JoinColumn(name = "COURSE_ID", nullable = false)
    private Course course;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "TYPE_ID", nullable = false)
    private MarksType type;

    @NotNull
    @Column(name = "FEEDBACK_DATE", nullable = false)
    private LocalDate feedbackDate;

    @Size(max = 255)
    @Column(name = "FEEDBACK")
    private String feedback;

    @Size(max = 255)
    @Column(name = "NOTES")
    private String notes;


}