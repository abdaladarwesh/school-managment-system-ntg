package com.ntg.sms.Service;

import com.ntg.sms.Dtos.Request.ViolationRequest;
import com.ntg.sms.Entities.Violation;

import java.util.List;

public interface ViolationService {
    long gettotalviolations();

    /** Returns [monthNumber, count] pairs for the last {@code months} months. */
    List<Object[]> getViolationsByMonth(int months);

    /** Returns formatted month name labels for the last {@code months} months. */
    List<String> getViolationMonthLabels(int months);

    List<Violation> getAllViolations();

    Violation createViolation(ViolationRequest request);
}
