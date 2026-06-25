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

    private final String EMAIL_REQUIRED_ERROR_MESSAGE = "Email is required!";
    private final String PASSWORD_REQUIRED_ERROR_MESSAGE = "Password is required!";



    @NotBlank(message =  EMAIL_REQUIRED_ERROR_MESSAGE )
    @NotNull(message =  EMAIL_REQUIRED_ERROR_MESSAGE )
    private String email;
    @NotBlank(message =  PASSWORD_REQUIRED_ERROR_MESSAGE )
    @NotNull(message =  PASSWORD_REQUIRED_ERROR_MESSAGE )
    private String password;


}