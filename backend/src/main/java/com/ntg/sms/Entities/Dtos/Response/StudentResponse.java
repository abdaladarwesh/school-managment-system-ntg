package com.ntg.sms.Entities.Dtos.Response;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

/**
 * DTO for {@link com.ntg.sms.Entities.Student}
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudentResponse {
    Long id;
    @NotNull
    UserResponse user;
    String governorate;
    Long academicScoreInMiddleSchool;
    String placeOfBirth;
    ClassResponse studentClass;
    List<String> medicalHistory;
}