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
 * DTO for {@link com.ntg.sms.Entities.Violation}
 */
@Data
@AllArgsConstructor
@Builder
@Value
public class ViolationResponse implements Serializable {
    Long id;
    @NotNull
    StudentResponse student;
    @NotNull
    @Size(max = 255)
    String violation;
    @NotNull
    @Size(max = 255)
    String nameOfViolator;
    @NotNull
    @Size(max = 255)
    String applicableProcedure;
    @NotNull
    @Size(max = 255)
    String referringAuthority;
    @NotNull
    Boolean ismeeting;
    @Size(max = 255)
    String notes;
    LocalDate date;
}