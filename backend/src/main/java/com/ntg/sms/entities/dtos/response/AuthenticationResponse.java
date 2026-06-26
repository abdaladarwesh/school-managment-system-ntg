package com.ntg.sms.entities.dtos.response;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class AuthenticationResponse {
    private String token;
    private Long expiresAt;
    private String role;
}