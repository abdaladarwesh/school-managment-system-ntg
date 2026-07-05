package com.ntg.sms.Entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "MEDICAL_RECORD")
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MEDICAL_ID", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "STUDENT_ID", nullable = false)
    private Student student;

    @Size(max = 255)
    @NotNull
    @Column(name = "ILLNESS_TYPE", nullable = false)
    private String illnessType;


    @Column(name = "NOTES", nullable = true)
    private String notes;

    @Column(name = "\"DATE\"", nullable = true)
    private LocalDate date;
}