package com.ntg.sms.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "GRADE")
public class Grade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "GRADE_ID", nullable = false)
    private Long id;

    @Size(max = 100)
    @NotNull
    @Column(name = "NAME", nullable = false, length = 100)
    private String name;

    @ManyToMany
    @JoinTable(
            name = "GRADES_PER_TERM",
            joinColumns = @JoinColumn(name = "GRADE_ID"),
            inverseJoinColumns = @JoinColumn(name = "TERM_ID")
    )
    private Set<Term> terms = new LinkedHashSet<>();

    @OneToMany(mappedBy = "grade")
    private Set<Class> classes = new HashSet<>();


}