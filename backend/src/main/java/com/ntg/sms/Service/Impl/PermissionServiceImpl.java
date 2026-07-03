package com.ntg.sms.Service.Impl;

import com.ntg.sms.Dtos.Request.PermissionRequest;
import com.ntg.sms.Entities.Permission;
import com.ntg.sms.Entities.Student;
import com.ntg.sms.Repositories.PermissionRepository;
import com.ntg.sms.Repositories.StudentRepository;
import com.ntg.sms.Service.PermissionService;
import com.ntg.sms.Service.StudentsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;
    private final StudentRepository studentRepository;

    @Override
    public long getleaveRequests() {
        return permissionRepository.count();
    }

    @Override
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    @Override
    public Permission createPermission(PermissionRequest request) {
        Student student = studentRepository.findById(request.getStudentId()).orElse(null);
        Permission permission = Permission.builder().
                student(student)
                .reason(request.getReason())
                .notes(request.getNotes())
                .date(LocalDate.now())
                .build();
        return permissionRepository.save(permission);
    }


}
