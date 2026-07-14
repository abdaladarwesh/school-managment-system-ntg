package com.ntg.sms.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.Audited;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "PARENT")
public class Parent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PARENT_ID", nullable = false)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "USER_ID", nullable = false, unique = true)
    private User user;

    @Size(max = 60)
    @Column(name = "JOB_NAME", length = 60)
    private String jobName;

    @Enumerated(EnumType.STRING)
    @Column(name = "EDUCATION_LEVEL", length = 30)
    private EducationLevel educationLevel;

}

