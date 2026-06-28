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
@Table(name = "STUDENT")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "STUDENT_ID", nullable = false)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false, unique = true)
    private User user;

    @Size(max = 40)
    @Column(name = "GOVERNORATE", length = 40)
    private String governorate;

    @Column(name = "ACADEMIC_SCORE_IN_MIDDLE_SCHOOL")
    private Long academicScoreInMiddleSchool;

    @Size(max = 90)
    @Column(name = "PLACE_OF_BIRTH", length = 90)
    private String placeOfBirth;

    @ManyToMany
    @JoinTable(
            name = "STUDENT_IN_A_TEAM",
            joinColumns = @JoinColumn(name = "STUDENT_ID"),
            inverseJoinColumns = @JoinColumn(name = "TEAM_ID")
    )
    private Set<Team> teams = new LinkedHashSet<>();


}