package com.ntg.sms.services;


import com.ntg.sms.Repositories.ViolationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ViolationServiceImpl implements ViolationService {

   private final ViolationRepository violationRepository;

    @Override
    public long  gettotalviolations() {
       return violationRepository.count();
    }

}
