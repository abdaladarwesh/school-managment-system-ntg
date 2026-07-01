package com.ntg.sms.Service.Impl;

import com.ntg.sms.Entities.Parent;
import com.ntg.sms.Entities.Student;
import com.ntg.sms.Entities.StudentsParent;
import com.ntg.sms.Repositories.ParentRepository;
import com.ntg.sms.Repositories.StudentsParentRepository;
import com.ntg.sms.Service.ParentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ParentServiceImpl implements ParentService {

    private final ParentRepository parentRepository;
    private final StudentsParentRepository studentsParentRepository;


    @Override
    public List<Parent> getParentsByStudent(Student student) {
        List<StudentsParent> studentParents = studentsParentRepository.findAllByStudent(student);
        List<Parent> parents = new ArrayList<>();
        studentParents.forEach(s -> {
            parents.add(s.getParent());
        });
        return parents;
    }
}
