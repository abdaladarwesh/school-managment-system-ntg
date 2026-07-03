package com.ntg.sms.Dtos.Request;


import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SaveAttendanceRequest {
    @NotNull(message = "Class id is required!")
    private Long classId;

    @NotNull(message = "Date is required!")
    private LocalDate date;

    @NotEmpty(message = "At least one attendance entry is required!")
    @Valid
    private List<AttendanceEntryRequest> entries;
}