package com.ntg.sms.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Entity
@Table(name = "PARENT_HAVE_STUDENT")
public class ParentHaveStudent {
    @EmbeddedId
    private ParentHaveStudentId id;

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

    @Size(max = 50)
    @Column(name = "PARENT_ROLE", length = 50)
    private String parentRole;

    @ColumnDefault("0")
    @Column(name = "IS_GUARDIAN")
    private Boolean isGuardian;


}