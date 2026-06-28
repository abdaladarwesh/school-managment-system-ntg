package com.ntg.sms.Entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "ASSIGNMENT")
public class Assignment {
    @Id
    @Column(name = "ASSIGNMENT_ID", nullable = false)
    private Long id;

    @Size(max = 255)
    @NotNull
    @Column(name = "NAME", nullable = false)
    private String name;

    @NotNull
    @Column(name = "DEADLINE", nullable = false)
    private LocalDate deadline;

    @NotNull
    @Column(name = "ASSIGN_DATE", nullable = false)
    private LocalDate assignDate;

    @Size(max = 255)
    @NotNull
    @Column(name = "DESCRIPTION", nullable = false)
    private String description;

    @Size(max = 255)
    @Column(name = "FILE_LINK")
    private String fileLink;

    @Size(max = 255)
    @NotNull
    @Column(name = "STUDENT_SUBMISSION", nullable = false)
    private String studentSubmission;

    @ManyToMany(mappedBy = "assignments")
    private Set<Course> courses = new LinkedHashSet<>();


}