package com.ntg.sms.Service.Impl;

import com.ntg.sms.Repositories.ComplaintsRepository;
import com.ntg.sms.Service.ComplaintsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplaintsServiceImpl implements ComplaintsService {

    private final ComplaintsRepository complaintsRepository;

    @Override
    public long gettotalComplaints() {
        return complaintsRepository.count();
    }

    @Override
    public List<Object[]> getComplaintsByCategory() {
        return complaintsRepository.countByCategory();
    }
}
