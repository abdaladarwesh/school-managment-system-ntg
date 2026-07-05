package com.ntg.sms.Controllers;

import com.ntg.sms.Dtos.Request.PermissionRequest;
import com.ntg.sms.Dtos.Response.PermissionResponse;
import com.ntg.sms.Entities.Permission;
import com.ntg.sms.Mappers.PermissionMapper;
import com.ntg.sms.Service.PermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/permissions")
public class PermissionController {
    private final PermissionService permissionService;
    private final PermissionMapper permissionMapper;

    @GetMapping
    public ResponseEntity<List<PermissionResponse>> getAllPermissions() {
        return ResponseEntity.ok(
                permissionMapper.toResponse(
                        permissionService.getAllPermissions()
                )
        );
    }

    @PutMapping
    public ResponseEntity<PermissionResponse> createPermission(@RequestBody @Valid PermissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(permissionMapper.toResponse(permissionService.createPermission(request)))
                ;
    }
}
