package com.ntg.sms.Dtos.Request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Value;

import java.io.Serializable;

/**
 * DTO for {@link com.ntg.sms.Entities.MedicalRecord}
 */
@Value
@Data
@AllArgsConstructor
@Builder
public class MedicalRecordRequest implements Serializable {
    @NotNull
    Long studentId;
    @NotNull
    @Size(max = 255)
    String illnessType;
}