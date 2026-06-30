package com.ntg.sms.Entities.Dtos.Response;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.io.Serializable;

/**
 * DTO for {@link com.ntg.sms.Entities.Class}
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ClassResponse {
    Long id;
    @NotNull
    GradeResponse grade;
    @NotNull
    String name;
    @NotNull
    Long capacity;
}