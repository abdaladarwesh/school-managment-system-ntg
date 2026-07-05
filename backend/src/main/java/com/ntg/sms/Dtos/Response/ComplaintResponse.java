package com.ntg.sms.Dtos.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * DTO for {@link com.ntg.sms.Entities.Complaints}
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ComplaintResponse implements Serializable {
    Long complaintId;
    UserResponse user;
    String title;
    String description;
    String status;
    String category;
    String response;
    String submittedAt;
}
