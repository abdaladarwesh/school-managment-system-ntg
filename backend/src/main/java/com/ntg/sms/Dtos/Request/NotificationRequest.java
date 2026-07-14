package com.ntg.sms.Dtos.Request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO for {@link com.ntg.sms.Entities.Notification}
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotificationRequest implements Serializable {
    @NotNull
    @Size(max = 255)
    String title;
    @NotNull
    @Size(max = 255)
    String type;
    @NotNull
    @Size(max = 255)
    String priority;
    @NotNull
    @Size(max = 255)
    String body;
    @NotNull
    Long receiverId;
}