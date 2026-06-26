package com.ntg.sms.entities.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthenticationRequest {

    @NotBlank(message =  "Email is required!" )
    @NotNull(message =  "Email is required!" )
    private String email;
    @NotBlank(message =  "Password is required!" )
    @NotNull(message =  "Password is required!" )
    private String password;


}