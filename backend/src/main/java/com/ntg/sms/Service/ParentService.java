package com.ntg.sms.Service;

import com.ntg.sms.Entities.Parent;
import com.ntg.sms.Entities.Student;

import java.util.List;

public interface ParentService {
    List<Parent> getParentsByStudent(Student student);
}
