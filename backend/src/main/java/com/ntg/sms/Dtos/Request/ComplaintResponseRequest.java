package com.ntg.sms.Dtos.Request;

import jakarta.validation.constraints.NotNull;
import lombok.Value;

import java.io.Serializable;

/**
 * DTO for responding to a {@link com.ntg.sms.Entities.Complaints}
 */
@Value
public class ComplaintResponseRequest implements Serializable {
    @NotNull
    String response;
}
