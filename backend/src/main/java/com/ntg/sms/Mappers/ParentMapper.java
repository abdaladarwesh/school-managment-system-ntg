package com.ntg.sms.Mappers;

import com.ntg.sms.Entities.Dtos.Response.ParentResponse;
import com.ntg.sms.Entities.Parent;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ParentMapper {
    ParentResponse toResponse(Parent parent);
    List<ParentResponse> toResponse(List<Parent> parent);
}
