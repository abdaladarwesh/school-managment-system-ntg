package com.ntg.sms.Dtos.Request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Value;

import java.io.Serializable;

/**
 * DTO for {@link com.ntg.sms.Entities.Complaints}
 */
@Value
public class ComplaintRequest implements Serializable {
    @NotNull
    Long userId;

    @NotNull
    @Size(max = 255)
    String title;

    @NotNull
    String description;

    @Size(max = 100)
    String category;

    @Size(max = 50)
    String status;
}
