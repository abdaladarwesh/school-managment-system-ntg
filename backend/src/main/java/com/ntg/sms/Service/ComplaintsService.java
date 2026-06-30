package com.ntg.sms.Service;

import java.util.List;

public interface ComplaintsService {
    long gettotalComplaints();

    /** Returns [category, count] pairs ordered by count descending. */
    List<Object[]> getComplaintsByCategory();
}
