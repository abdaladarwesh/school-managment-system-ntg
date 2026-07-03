package com.ntg.sms.Service;

import com.ntg.sms.Dtos.Request.PermissionRequest;
import com.ntg.sms.Entities.Permission;

import java.util.List;

public interface PermissionService {
    long getleaveRequests();
    List<Permission> getAllPermissions();
    Permission createPermission(PermissionRequest request);
}
