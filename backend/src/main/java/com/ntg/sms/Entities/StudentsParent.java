package com.ntg.sms.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "STUDENTS_PARENTS")
public class StudentsParent {
    @EmbeddedId
    private StudentsParentId id;

    @MapsId("parentId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    @JoinColumn(name = "PARENT_ID", nullable = false)
    private Parent parent;

    @MapsId("studentId")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.RESTRICT)
    @JoinColumn(name = "STUDENT_ID", nullable = false)
    private Student student;

    @Size(max = 255)
    @NotNull
    @Column(name = "PARENT_ROLE", nullable = false)
    private String parentRole;

    @NotNull
    @Column(name = "ISGUARDIAN", nullable = false)
    private Long isguardian;


}