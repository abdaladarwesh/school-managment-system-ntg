package com.ntg.sms.Service;

import com.ntg.sms.Entities.Class;
import com.ntg.sms.Entities.Grade;

import java.util.List;

public interface ClassService {
    long gettotalstudents();
    List<Class> getAllClasses();
    List<Class> getClassesByGrade(Grade grade);
}
