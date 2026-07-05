package com.ntg.sms.Controllers;

import com.ntg.sms.Dtos.Request.ViolationRequest;
import com.ntg.sms.Dtos.Response.ViolationResponse;
import com.ntg.sms.Mappers.ViolationMapper;
import com.ntg.sms.Service.ViolationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/violations")
@RequiredArgsConstructor
public class ViolationController {
    private final ViolationService violationService;
    private final ViolationMapper violationMapper;


    @GetMapping
    public ResponseEntity<List<ViolationResponse>> getAllViolations() {
        return ResponseEntity.ok(violationMapper.toResponse(
                violationService.getAllViolations()
        ));
    }


    @PostMapping
    public ResponseEntity<ViolationResponse> createViolation(@RequestBody @Valid ViolationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        violationMapper.toResponse(
                                violationService.createViolation(
                                        request
                                ))
                );
    }
}
