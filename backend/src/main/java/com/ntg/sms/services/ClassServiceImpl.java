package com.ntg.sms.services;

import com.ntg.sms.Repositories.ClassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor


public class ClassServiceImpl implements ClassService {

    private final ClassRepository classRepository;

    @Override
    public long gettotalstudents() {
        return classRepository.count();
    }
}
