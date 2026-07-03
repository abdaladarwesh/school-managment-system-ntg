package com.ntg.sms.Service.Impl;

import com.ntg.sms.Dtos.Request.DelayRequest;
import com.ntg.sms.Entities.Delay;
import com.ntg.sms.Entities.Student;
import com.ntg.sms.Repositories.DelayRepository;
import com.ntg.sms.Repositories.StudentRepository;
import com.ntg.sms.Service.DelayService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DelayServiceImpl implements DelayService {

    private final DelayRepository delayRepository;
    private final StudentRepository studentRepository;

    @Override
    public List<Delay> getAllDelays() {
       return delayRepository.findAll() ;
    }

    @Override
    public Delay createDelay(DelayRequest request) {
        Student student = studentRepository.findById(request.getStudentId()).orElse(null);
        Delay delay = Delay.builder()
                .student(student)
                .timeOfArrival(request.getTimeOfArrival())
                .notes(request.getNotes())
                .date(LocalDate.now())
                .build();
        return delayRepository.save(delay);
    }
}
