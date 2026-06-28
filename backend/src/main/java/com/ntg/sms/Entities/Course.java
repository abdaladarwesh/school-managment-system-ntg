package com.ntg.sms.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "COURSE")
public class Course {
    @Id
    @Column(name = "COURSE_ID", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "TEACHER_ID", nullable = false)
    private Teacher teacher;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "TERM_ID", nullable = false)
    private Term term;

    @Size(max = 80)
    @NotNull
    @Column(name = "COURSE_TYPE", nullable = false, length = 80)
    private String courseType;

    @Size(max = 100)
    @NotNull
    @Column(name = "COURSE_NAME", nullable = false, length = 100)
    private String courseName;

    @Size(max = 100)
    @Column(name = "DESCRIPTION", length = 100)
    private String description;

    @Size(max = 100)
    @Column(name = "STUDY_PLAN", length = 100)
    private String studyPlan;

    @ManyToMany
    @JoinTable(
            name = "COURSE_HAVE_ASSIGNMENTS",
            joinColumns = @JoinColumn(name = "COURSE_ID"),
            inverseJoinColumns = @JoinColumn(name = "ASSIGNMENT_ID")
    )
    private Set<Assignment> assignments = new LinkedHashSet<>();


}