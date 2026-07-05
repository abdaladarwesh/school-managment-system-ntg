package com.ntg.sms.Service;

import com.ntg.sms.Dtos.Request.ComplaintRequest;
import com.ntg.sms.Dtos.Request.ComplaintResponseRequest;
import com.ntg.sms.Entities.Complaints;

import java.util.List;

public interface ComplaintsService {
    long gettotalComplaints();

    /** Returns [category, count] pairs ordered by count descending. */
    List<Object[]> getComplaintsByCategory();

    /** Returns all complaints. */
    List<Complaints> getAllComplaints();

    /** Creates a new complaint submitted by a user. */
    Complaints createComplaint(ComplaintRequest request);

    /** Submits an admin response to an existing complaint and marks it as Replied. */
    Complaints respondToComplaint(Long complaintId, ComplaintResponseRequest request);
}
