package com.ntg.sms.Service.Impl;

import com.ntg.sms.Entities.Grade;
import com.ntg.sms.Repositories.GradeRepository;
import com.ntg.sms.Service.GradeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GradeServiceImpl implements GradeService {
    private final GradeRepository gradeRepository;


    @Override
    public List<Grade> getAllGrades() {
        return gradeRepository.findAll();
    }
}
