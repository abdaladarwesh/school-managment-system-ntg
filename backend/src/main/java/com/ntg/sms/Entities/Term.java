package com.ntg.sms.Entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "TERM")
public class Term {
    @Id
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