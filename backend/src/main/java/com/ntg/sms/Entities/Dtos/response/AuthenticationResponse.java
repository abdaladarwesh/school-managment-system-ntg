package com.ntg.sms.Entities.Dtos.response;

import lombok.*;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class AuthenticationResponse {
    private String token;
    private Long expiresAt;
    private String role;
}