package com.ntg.sms.Dtos.Response;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * DTO for {@link com.ntg.sms.Entities.Parent}
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParentResponse{
    Long id;
    @NotNull
    UserResponse user;
    @Size(max = 60)
    String jobName;
}