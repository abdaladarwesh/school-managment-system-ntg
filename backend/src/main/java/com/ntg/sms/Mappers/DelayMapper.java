package com.ntg.sms.Mappers;

import com.ntg.sms.Dtos.Response.DelayResponse;
import com.ntg.sms.Entities.Delay;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface DelayMapper {
    DelayResponse toResponse(Delay delay);

    List<DelayResponse> toResponse(List<Delay> delay);
}
