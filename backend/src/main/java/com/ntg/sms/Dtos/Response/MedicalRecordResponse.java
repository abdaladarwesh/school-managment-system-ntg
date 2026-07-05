package com.ntg.sms.Dtos.Response;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Value;

import java.io.Serializable;
import java.time.LocalDate;

/**
 * DTO for {@link com.ntg.sms.Entities.MedicalRecord}
 */
@Value
@Data
@AllArgsConstructor
@Builder
public class MedicalRecordResponse implements Serializable {
    Long id;
    @NotNull
    FullStudentResponse student;
    @NotNull
    @Size(max = 255)
    String illnessType;
    LocalDate date;
}