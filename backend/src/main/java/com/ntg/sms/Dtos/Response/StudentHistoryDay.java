package com.ntg.sms.Dtos.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentHistoryDay {
    private LocalDate date;
    private String status; // "P", "A", "L", "E"
}