package com.ntg.sms.Service.Impl;

import com.ntg.sms.Repositories.PermissionRepository;
import com.ntg.sms.Service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;

    @Override
    public long getleaveRequests() {
        return permissionRepository.count();
    }
}
