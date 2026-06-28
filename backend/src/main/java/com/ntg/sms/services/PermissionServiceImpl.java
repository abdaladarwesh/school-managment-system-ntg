package com.ntg.sms.services;


import com.ntg.sms.Repositories.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private PermissionRepository permissionRepository;

    @Override
    public long getleaveRequests() {
        return permissionRepository.count();
    }
}
