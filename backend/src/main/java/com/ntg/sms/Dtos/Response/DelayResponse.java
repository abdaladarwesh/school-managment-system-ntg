package com.ntg.sms.Dtos.Response;

import com.ntg.sms.Dtos.Request.StudentRequest;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for {@link com.ntg.sms.Entities.Delay}
 */
@Data
@AllArgsConstructor
@Builder
public class DelayResponse implements Serializable {
    Long id;
    StudentResponse student;
    LocalDateTime timeOfArrival;
    String notes;
    LocalDate date;
}