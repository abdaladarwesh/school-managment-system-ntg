package com.ntg.sms.Mappers;

import com.ntg.sms.Entities.Dtos.Response.ClassResponse;
import com.ntg.sms.Entities.Class;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = GradeMapper.class
)
public interface ClassMapper {

    ClassResponse toDto(Class studentClass);

    List<ClassResponse> toDto(List<Class> classes);
}