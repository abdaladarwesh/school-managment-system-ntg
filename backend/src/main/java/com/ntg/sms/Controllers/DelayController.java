package com.ntg.sms.Controllers;

import com.ntg.sms.Dtos.Request.DelayRequest;
import com.ntg.sms.Dtos.Response.DelayResponse;
import com.ntg.sms.Mappers.DelayMapper;
import com.ntg.sms.Service.DelayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/delays")
public class DelayController {
    private final DelayService delayService;
    private final DelayMapper delayMapper;

    @GetMapping
    public ResponseEntity<List<DelayResponse>> getAllDelays() {
        return ResponseEntity.ok(delayMapper.toResponse(delayService.getAllDelays()));
    }

    @PutMapping
    public ResponseEntity<DelayResponse> createDelay(@RequestBody DelayRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(delayMapper.toResponse(delayService.createDelay(request)));
    }
}
