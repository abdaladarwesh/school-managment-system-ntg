package com.ntg.sms.Dtos.Request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Value;

import java.io.Serializable;

/**
 * DTO for {@link com.ntg.sms.Entities.Violation}
 */
@Value
public class ViolationRequest implements Serializable {
    Long studentId;
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
}