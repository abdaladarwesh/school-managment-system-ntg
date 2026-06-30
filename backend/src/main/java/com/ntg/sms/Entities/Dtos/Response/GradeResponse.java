package com.ntg.sms.Entities.Dtos.Response;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.io.Serializable;
import java.util.Set;

/**
 * DTO for {@link com.ntg.sms.Entities.Grade}
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GradeResponse {
    Long id;
    @NotNull
    String name;
    Set<TermResponse> terms;
}