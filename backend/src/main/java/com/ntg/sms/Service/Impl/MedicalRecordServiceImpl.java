package com.ntg.sms.Service.Impl;

import com.ntg.sms.Dtos.Request.MedicalRecordRequest;
import com.ntg.sms.Entities.MedicalRecord;
import com.ntg.sms.Entities.Student;
import com.ntg.sms.Repositories.MedicalRecordRepository;
import com.ntg.sms.Repositories.StudentRepository;
import com.ntg.sms.Service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {
    private final MedicalRecordRepository medicalRecordRepository;
    private final StudentRepository studentRepository;
    @Override
    public List<MedicalRecord> getAllMedicalRecords() {
        return medicalRecordRepository.findAll();
    }

    @Override
    public MedicalRecord createMedicalRecord(MedicalRecordRequest request) {
        Student student = studentRepository.findById(request.getStudentId()).orElse(null);
        MedicalRecord medicalRecord =
                MedicalRecord.builder()
                        .student(student).
                        illnessType(request.getIllnessType())
                        .date(LocalDate.now())
                        .build();
        return medicalRecordRepository.save(medicalRecord);
    }
}
