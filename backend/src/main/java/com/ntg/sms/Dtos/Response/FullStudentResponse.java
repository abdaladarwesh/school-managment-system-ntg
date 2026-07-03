package com.ntg.sms.Dtos.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FullStudentResponse {
    List<ParentResponse> parentsResponse;
    List<String> medicalHistories;
    StudentResponse studentResponse;
}
