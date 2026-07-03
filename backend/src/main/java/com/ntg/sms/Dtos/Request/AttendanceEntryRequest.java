package com.ntg.sms.Dtos.Request;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AttendanceEntryRequest {
    @NotNull(message = "Student id is required!")
    private Long studentId;

    @NotNull(message = "Session id is required!")
    private Long sessionId;

    @NotNull(message = "Status is required!")
    @Pattern(regexp = "[PALE]", message = "Status must be one of P, A, L, E")
    private String status;
}