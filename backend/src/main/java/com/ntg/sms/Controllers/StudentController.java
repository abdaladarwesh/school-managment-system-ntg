package com.ntg.sms.Controllers;

import com.ntg.sms.Entities.Dtos.Request.StudentRequest;
import com.ntg.sms.Entities.Dtos.Response.StudentResponse;
import com.ntg.sms.Mappers.StudentMapper;
import com.ntg.sms.Service.StudentsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/student")
public class StudentController {

    private final StudentMapper studentMapper;
    private final StudentsService studentsService;

    @GetMapping
    public List<StudentResponse> getAllStudents() {

        return studentMapper.toDto(

                studentsService.getAllStudents()

        );
    }

    @PostMapping
    public ResponseEntity<StudentResponse> addStudent(
            @RequestBody @Valid StudentRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(studentMapper.toDto(
                        studentsService.addStudent(request)
                ));
    }

}
