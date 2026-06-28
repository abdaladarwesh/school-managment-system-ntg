package com.ntg.sms.Entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@EqualsAndHashCode
@Embeddable
public class ParentHaveStudentId implements Serializable {
    private static final long serialVersionUID = 1L;

    @NotNull
    @Column(name = "PARENT_ID", nullable = false)
    private Long parentId;

    @NotNull
    @Column(name = "STUDENT_ID", nullable = false)
    private Long studentId;
}
