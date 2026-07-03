package com.ntg.sms.Mappers;

import com.ntg.sms.Dtos.Response.StudentClassResponse;
import com.ntg.sms.Entities.Class;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = GradeMapper.class
)
public interface ClassMapper {

    StudentClassResponse toDto(Class studentClass);

    List<StudentClassResponse> toDto(List<Class> classes);
}