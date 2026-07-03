package com.ntg.sms.Dtos.Response;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO for {@link com.ntg.sms.Entities.Class}
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudentClassResponse {
    Long id;
    @NotNull
    GradeResponse grade;
    @NotNull
    String name;
    @NotNull
    Long capacity;
}