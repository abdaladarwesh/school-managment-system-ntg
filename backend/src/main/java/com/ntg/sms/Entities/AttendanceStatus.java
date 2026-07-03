package com.ntg.sms.Entities;


import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@AllArgsConstructor
//@NoArgsConstructor
public final class AttendanceStatus {
    public static final char PRESENT = 'P';
    public static final char ABSENT = 'A';
    public static final char LATE = 'L';
    public static final char EXCUSED = 'E';
}