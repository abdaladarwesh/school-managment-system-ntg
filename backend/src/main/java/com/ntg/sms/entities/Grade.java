package com.ntg.sms.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "GRADE")
public class Grade {
    @Id
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


}