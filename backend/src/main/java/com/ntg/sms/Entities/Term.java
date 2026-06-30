package com.ntg.sms.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "TERM")
public class Term {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TERM_ID", nullable = false)
    private Long id;

    @NotNull
    @Column(name = "TERM", nullable = false)
    private Long term;

    @NotNull
    @Column(name = "YEAR", nullable = false)
    private Long year;

    @ManyToMany(mappedBy = "terms")
    private Set<Grade> grades = new LinkedHashSet<>();


}