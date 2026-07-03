package com.ntg.sms.Mappers;

import com.ntg.sms.Dtos.Response.ViolationResponse;
import com.ntg.sms.Entities.Violation;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {StudentMapper.class})
public interface ViolationMapper {
    ViolationResponse toResponse(Violation violation);
    List<ViolationResponse> toResponse(List<Violation> violation);
}
