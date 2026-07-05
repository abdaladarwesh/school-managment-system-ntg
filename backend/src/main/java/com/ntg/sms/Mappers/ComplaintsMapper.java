package com.ntg.sms.Mappers;

import com.ntg.sms.Dtos.Response.ComplaintResponse;
import com.ntg.sms.Entities.Complaints;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ComplaintsMapper {
    ComplaintResponse toResponse(Complaints complaint);
    List<ComplaintResponse> toResponse(List<Complaints> complaints);
}
