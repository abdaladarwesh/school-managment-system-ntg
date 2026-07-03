package com.ntg.sms.Controllers;

import com.ntg.sms.Dtos.Response.StudentClassResponse;
import com.ntg.sms.Mappers.ClassMapper;
import com.ntg.sms.Repositories.ClassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/classes")
public class ClassController {
    private final ClassRepository classRepository;
    private final ClassMapper classMapper;

    @GetMapping
    public ResponseEntity<List<StudentClassResponse>> getALlClasses() {
        return ResponseEntity.ok(classMapper.toDto(classRepository.findAll()));
    }
}
