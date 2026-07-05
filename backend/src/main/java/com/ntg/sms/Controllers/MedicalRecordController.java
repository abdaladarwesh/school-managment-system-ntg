package com.ntg.sms.Controllers;

import com.ntg.sms.Dtos.Request.MedicalRecordRequest;
import com.ntg.sms.Dtos.Response.FullStudentResponse;
import com.ntg.sms.Dtos.Response.MedicalRecordResponse;
import com.ntg.sms.Dtos.Response.ParentResponse;
import com.ntg.sms.Dtos.Response.StudentResponse;
import com.ntg.sms.Entities.MedicalRecord;
import com.ntg.sms.Entities.Parent;
import com.ntg.sms.Entities.Student;
import com.ntg.sms.Mappers.ParentMapper;
import com.ntg.sms.Mappers.StudentMapper;
import com.ntg.sms.Service.MedicalRecordService;
import com.ntg.sms.Service.ParentService;
import com.ntg.sms.Service.StudentsService;
import com.ntg.sms.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/medical-record")
@RequiredArgsConstructor
public class MedicalRecordController {
    private final MedicalRecordService medicalRecordService;
    private final StudentsService studentsService;
    private final StudentMapper studentMapper;
    private final ParentService parentService;
    private final UserService userService;
    private final ParentMapper parentMapper;

    @GetMapping
    public ResponseEntity<List<MedicalRecordResponse>> getAllMedicalRecords() {

        List<MedicalRecordResponse> responses = new ArrayList<>();
        List<MedicalRecord> allMedicalRecords = medicalRecordService.getAllMedicalRecords();
        allMedicalRecords.forEach(
                m -> {
                    Student student = studentsService.getStudentById(m.getStudent().getId());

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

                    FullStudentResponse response =
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
                                    .build();
                    responses.add(
                            MedicalRecordResponse.builder()
                                    .id(m.getId()).student(response).illnessType(m.getIllnessType()).date(m.getDate()).build()
                    );
                }
        );
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    public ResponseEntity<MedicalRecordResponse> createMedicalResponse(@RequestBody @Valid MedicalRecordRequest medicalRecordRequest) {
        MedicalRecord medicalRecord = medicalRecordService.createMedicalRecord(medicalRecordRequest);
        Student student = studentsService.getStudentById(medicalRecord.getStudent().getId());
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

        FullStudentResponse studentResponse = FullStudentResponse.builder()
                .studentResponse(
                        dto
                )
                .parentsResponse(
                        parents
                )
                .medicalHistories(
                        studentsService.getStudentMedicalHistory(student)
                )
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(MedicalRecordResponse.builder()
                        .id(medicalRecord.getId()).student(studentResponse).illnessType(medicalRecord.getIllnessType()).date(medicalRecord.getDate()).build());
    }


}
