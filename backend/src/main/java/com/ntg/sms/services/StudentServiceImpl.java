package com.ntg.sms.services;

import com.ntg.sms.Repositories.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class StudentServiceImpl  implements StudentsService  {

    private final StudentRepository studentRepository;

    @Override
    public long gettotalstudents() {

        return studentRepository.count();
    }

}
