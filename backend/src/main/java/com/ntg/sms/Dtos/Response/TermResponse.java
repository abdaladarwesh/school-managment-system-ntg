package com.ntg.sms.Dtos.Response;

import lombok.*;

/**
 * DTO for {@link com.ntg.sms.Entities.Term}
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TermResponse {
    Long term;
    Long year;
}