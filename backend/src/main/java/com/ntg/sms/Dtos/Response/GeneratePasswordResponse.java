package com.ntg.sms.Dtos.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@AllArgsConstructor
@Data
@Builder
public class GeneratePasswordResponse {
    String password;
}
