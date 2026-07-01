package com.ntg.sms.Entities.Dtos.Response;

import com.ntg.sms.Entities.Dtos.Request.StudentRequest;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serializable;

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