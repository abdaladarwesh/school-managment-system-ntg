package com.ntg.sms.Service;

import java.util.List;

public interface ViolationService {
    long gettotalviolations();

    /** Returns [monthNumber, count] pairs for the last {@code months} months. */
    List<Object[]> getViolationsByMonth(int months);

    /** Returns formatted month name labels for the last {@code months} months. */
    List<String> getViolationMonthLabels(int months);
}
