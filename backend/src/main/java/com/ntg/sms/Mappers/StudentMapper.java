package com.ntg.sms.Mappers;

import com.ntg.sms.Dtos.Response.StudentResponse;
import com.ntg.sms.Entities.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(
        componentModel = "spring",
        uses = {
                UserMapper.class,
                ClassMapper.class
        }
)
public interface StudentMapper {

    StudentResponse toDto(Student student);

    @Mapping(source = "studentClass" , target = "studentClass")
    List<StudentResponse> toDto(List<Student> students);
}