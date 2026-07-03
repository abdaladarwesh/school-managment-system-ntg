package com.ntg.sms.Service.Impl;
import com.ntg.sms.Entities.Class;
import com.ntg.sms.Entities.Grade;
import com.ntg.sms.Repositories.ClassRepository;
import com.ntg.sms.Service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor


public class ClassServiceImpl implements ClassService {

    private final ClassRepository classRepository;

    @Override
    public long gettotalstudents() {
        return classRepository.count();
    }

    @Override
    public List<Class> getAllClasses() {
        return classRepository.findAll();
    }

    @Override
    public List<Class> getClassesByGrade(Grade grade) {
        return classRepository.findAllByGrade(grade);
    }
}
