package com.ntg.sms.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "TEACHER")
public class Teacher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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