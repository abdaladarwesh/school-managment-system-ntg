package com.ntg.sms.Service;

import com.ntg.sms.Dtos.Request.MedicalRecordRequest;
import com.ntg.sms.Entities.MedicalRecord;

import java.util.List;

public interface MedicalRecordService {
    List<MedicalRecord> getAllMedicalRecords();
    MedicalRecord createMedicalRecord(MedicalRecordRequest request);
}
