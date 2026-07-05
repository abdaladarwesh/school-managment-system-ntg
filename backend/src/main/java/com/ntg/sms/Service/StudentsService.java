package com.ntg.sms.Service;


import com.ntg.sms.Dtos.Request.StudentRequest;
import com.ntg.sms.Entities.Student;

import java.util.List;

public interface StudentsService {
    long gettotalstudents();
    List<Student> getAllStudents();
    Student addStudent(StudentRequest request);
    Student getStudentById(Long id);
    List<String> getStudentMedicalHistory(Student student);
    void deleteStudent(Long id);
    Student editStudent(StudentRequest request, Long studentId);
    String generatePassword(Long studentId);
}
