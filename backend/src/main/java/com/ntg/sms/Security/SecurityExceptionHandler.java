package com.ntg.sms.Security;


import com.ntg.sms.Entities.Dtos.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.LocalDateTime;

@Slf4j
@Component
public class SecurityExceptionHandler implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public SecurityExceptionHandler() {
        this.objectMapper = new ObjectMapper();
    }
    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        log.warn("Unauthorized request to {}: {}", request.getRequestURI(), authException.getMessage());
        writeError(response, HttpStatus.UNAUTHORIZED, "Unauthorized",
                "Authentication is required to access this resource.");
    }


    @Override
    public void handle(HttpServletRequest request,
                       HttpServletResponse response,
                       AccessDeniedException accessDeniedException) throws IOException {
        log.warn("Access denied for {} on {}: {}", request.getRemoteAddr(),
                request.getRequestURI(), accessDeniedException.getMessage());
        writeError(response, HttpStatus.FORBIDDEN, "Forbidden",
                "You do not have permission to access this resource.");
    }

    private void writeError(HttpServletResponse response,
                             HttpStatus status,
                             String error,
                             String message) throws IOException {
        ErrorResponse body = ErrorResponse.builder()
                .status(status.value())
                .error(error)
                .message(message)
                .details(null)
                .timestamp(LocalDateTime.now())
                .build();

        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(), body);
    }
}
