package com.ntg.sms.Mappers;

import com.ntg.sms.Dtos.Response.PermissionResponse;
import com.ntg.sms.Entities.Permission;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring" , uses = {StudentMapper.class})
public interface PermissionMapper {
    PermissionResponse toResponse(Permission permission);
    List<PermissionResponse> toResponse(List<Permission> permission);
}
