package com.ntg.sms.Controllers;

import com.ntg.sms.Dtos.Request.ComplaintRequest;
import com.ntg.sms.Dtos.Request.ComplaintResponseRequest;
import com.ntg.sms.Dtos.Response.ComplaintResponse;
import com.ntg.sms.Mappers.ComplaintsMapper;
import com.ntg.sms.Service.ComplaintsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
public class ComplaintsController {

    private final ComplaintsService complaintsService;
    private final ComplaintsMapper complaintsMapper;

    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(
                complaintsMapper.toResponse(
                        complaintsService.getAllComplaints()
                )
        );
    }

    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(@RequestBody @Valid ComplaintRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        complaintsMapper.toResponse(
                                complaintsService.createComplaint(request)
                        )
                );
    }

    @PatchMapping("/{id}/respond")
    public ResponseEntity<ComplaintResponse> respondToComplaint(
            @PathVariable Long id,
            @RequestBody ComplaintResponseRequest request) {
        return ResponseEntity.ok(
                complaintsMapper.toResponse(
                        complaintsService.respondToComplaint(id, request)
                )
        );
    }
}
