package com.ntg.sms.Dtos.Request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PermissionRequest{
    private Long studentId;
    private String reason;
    private String notes;
    private LocalDate date;

}
