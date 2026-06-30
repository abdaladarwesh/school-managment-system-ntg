package com.ntg.sms.Service;


import com.ntg.sms.Entities.Dtos.Request.StudentRequest;
import com.ntg.sms.Entities.Student;

import java.util.List;

public interface StudentsService {
    long gettotalstudents();
    List<Student> getAllStudents();
    Student addStudent(StudentRequest request);
}
