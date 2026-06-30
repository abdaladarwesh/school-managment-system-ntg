package com.ntg.sms.Mappers;

import com.ntg.sms.Entities.Dtos.Response.GradeResponse;
import com.ntg.sms.Entities.Grade;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {TermMapper.class})
public interface GradeMapper {

    @Mapping(source = "terms" , target = "terms")
    GradeResponse toDto(Grade grade);

    List<GradeResponse> toDto(List<Grade> grades);
}