package com.ntg.sms.Controllers;

import com.ntg.sms.Dtos.Request.StudentRequest;
import com.ntg.sms.Dtos.Response.FullStudentResponse;
import com.ntg.sms.Dtos.Response.GeneratePasswordResponse;
import com.ntg.sms.Dtos.Response.ParentResponse;
import com.ntg.sms.Dtos.Response.StudentResponse;
import com.ntg.sms.Entities.Parent;
import com.ntg.sms.Entities.Student;
import com.ntg.sms.Mappers.ParentMapper;
import com.ntg.sms.Mappers.StudentMapper;
import com.ntg.sms.Service.ParentService;
import com.ntg.sms.Service.StudentsService;
import com.ntg.sms.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/student")
public class StudentController {

    private final StudentMapper studentMapper;
    private final StudentsService studentsService;
    private final ParentService parentService;
    private final ParentMapper parentMapper;
    private final UserService userService;

    @GetMapping
    public List<StudentResponse> getAllStudents() {

        List<StudentResponse> dto = studentMapper.toDto(

                studentsService.getAllStudents()

        );
        dto.forEach(s -> {
                    Long id = s.getUser().getId();

                    s.getUser().setPhoneNumbers(userService.getUserPhoneNumbers(id));
                }
        );
        return dto;
    }

    @PostMapping("generate-password/{id}")
    public ResponseEntity<?> generatePassword(@PathVariable Long id){
        String s = userService.generatePassword(id);
        return ResponseEntity.ok(GeneratePasswordResponse.builder().password(s).build());
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

    @DeleteMapping("{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id){
        studentsService.deleteStudent(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PutMapping("{id}")
    public ResponseEntity<FullStudentResponse> editStudent(@PathVariable Long id, @RequestBody @Valid StudentRequest studentRequest){
        Student student = studentsService.editStudent(studentRequest, id);
        List<Parent> studentParents = parentService.getParentsByStudent(student);
        StudentResponse dto = studentMapper.toDto(student);
        dto.getUser().setPhoneNumbers(
                userService.getUserPhoneNumbers(student.getUser().getId())
        );
        dto.setMedicalHistory(
                studentsService.getStudentMedicalHistory(student)
        );
        List<ParentResponse> parents = parentMapper.toResponse(studentParents);
        parents.forEach(
                p -> {
                    p.getUser().setPhoneNumbers(userService.getUserPhoneNumbers(p.getUser().getId()));
                }
        );

        return ResponseEntity.ok(
                FullStudentResponse.builder()
                        .studentResponse(
                                dto
                        )
                        .parentsResponse(
                                parents
                        )
                        .medicalHistories(
                                studentsService.getStudentMedicalHistory(student)
                        )
                        .build()
        );
    }

    @GetMapping("{id}")
    public ResponseEntity<FullStudentResponse> getFullStudent(@PathVariable Long id) {
        Student student = studentsService.getStudentById(id);
        List<Parent> studentParents = parentService.getParentsByStudent(student);
        StudentResponse dto = studentMapper.toDto(student);
        dto.getUser().setPhoneNumbers(
                userService.getUserPhoneNumbers(student.getUser().getId())
        );
        dto.setMedicalHistory(
                studentsService.getStudentMedicalHistory(student)
        );
        List<ParentResponse> parents = parentMapper.toResponse(studentParents);
        parents.forEach(
                p -> {
                    p.getUser().setPhoneNumbers(userService.getUserPhoneNumbers(p.getUser().getId()));
                }
        );

        return ResponseEntity.ok(
                FullStudentResponse.builder()
                        .studentResponse(
                                dto
                        )
                        .parentsResponse(
                                parents
                        )
                        .medicalHistories(
                                studentsService.getStudentMedicalHistory(student)
                        )
                        .build()
        );


    }

}
