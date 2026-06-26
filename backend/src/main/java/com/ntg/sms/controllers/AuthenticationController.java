package com.ntg.sms.controllers;

import com.ntg.sms.Security.AuthenticationService;
import com.ntg.sms.entities.dtos.request.AuthenticationRequest;
import com.ntg.sms.entities.dtos.response.AuthenticationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth/")
public class AuthenticationController {
    private final AuthenticationService authenticationService;

    @Value("${jwt.expiry}")
    private Long expiresAt;

    @PostMapping("login")
    public ResponseEntity<AuthenticationResponse> login(
            @RequestBody @Valid AuthenticationRequest request
    ) {
        UserDetails user = authenticationService.authenticate(request.getEmail(), request.getPassword());

        String token = authenticationService.generateToken(user);
        String role = user.getAuthorities()
                .stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse(null);

        return ResponseEntity.ok(
                AuthenticationResponse.builder()
                        .token(token)
                        .role(role)
                        .expiresAt(expiresAt)
                        .build());
    }
}
