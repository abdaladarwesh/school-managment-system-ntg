package com.ntg.sms.Entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@EqualsAndHashCode
@Embeddable
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentMedicalHistoryId implements Serializable {
    private static final long serialVersionUID = -6617143140543756509L;
    @NotNull
    @Column(name = "STUDENT_ID", nullable = false)
    private Long studentId;

    @Size(max = 255)
    @NotNull
    @Column(name = "MEDICAL_NOTE", nullable = false)
    private String medicalNote;


}