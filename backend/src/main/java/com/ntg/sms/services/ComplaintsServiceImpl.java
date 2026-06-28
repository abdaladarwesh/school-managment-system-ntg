package com.ntg.sms.services;


import com.ntg.sms.Repositories.ComplaintsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class ComplaintsServiceImpl implements   ComplaintsService {
     private  final ComplaintsRepository complaintsRepository;

      @Override
      public long gettotalComplaints() {
         return complaintsRepository.count();

      }

}
