package com.ntg.sms.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "TEACHER")
public class Teacher {
    @Id
    @Column(name = "TEACHER_ID", nullable = false)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false, unique = true)
    private User user;

    @Size(max = 255)
    @Column(name = "EDUCATION")
    private String education;

    @Size(max = 255)
    @Column(name = "EMPLOYMENT_HISTORY")
    private String employmentHistory;

    @Column(name = "NUMBER_OF_YEARS_OF_EXPERIENCE")
    private Long numberOfYearsOfExperience;


}