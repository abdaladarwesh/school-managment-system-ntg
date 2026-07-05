package com.ntg.sms.Service.Impl;

import com.ntg.sms.Dtos.Request.ComplaintRequest;
import com.ntg.sms.Dtos.Request.ComplaintResponseRequest;
import com.ntg.sms.Entities.Complaints;
import com.ntg.sms.Entities.User;
import com.ntg.sms.Repositories.ComplaintsRepository;
import com.ntg.sms.Repositories.UserRepository;
import com.ntg.sms.Service.ComplaintsService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplaintsServiceImpl implements ComplaintsService {

    private final ComplaintsRepository complaintsRepository;
    private final UserRepository userRepository;

    @Override
    public long gettotalComplaints() {
        return complaintsRepository.count();
    }

    @Override
    public List<Object[]> getComplaintsByCategory() {
        return complaintsRepository.countByCategory();
    }

    @Override
    public List<Complaints> getAllComplaints() {
        return complaintsRepository.findAll();
    }

    @Override
    public Complaints createComplaint(ComplaintRequest request) {
        User user = userRepository.findById(request.getUserId()).orElse(null);
        Complaints complaint = Complaints.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .status("Pending")
                .submittedAt(LocalDateTime.now())
                .build();
        return complaintsRepository.save(complaint);
    }

    @Override
    public Complaints respondToComplaint(Long complaintId, ComplaintResponseRequest request) {
        Complaints complaint = complaintsRepository.findById(complaintId)
                .orElseThrow(() -> new EntityNotFoundException("Complaint not found with id: " + complaintId));
        complaint.setResponse(request.getResponse());
        complaint.setStatus("Replied");
        return complaintsRepository.save(complaint);
    }
}
