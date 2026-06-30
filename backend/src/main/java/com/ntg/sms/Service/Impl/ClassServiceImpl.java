package com.ntg.sms.Service.Impl;
import com.ntg.sms.Repositories.ClassRepository;
import com.ntg.sms.Service.ClassService;
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
