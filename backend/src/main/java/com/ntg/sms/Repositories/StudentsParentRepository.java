package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.StudentsParent;
import com.ntg.sms.Entities.StudentsParentId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentsParentRepository extends JpaRepository<StudentsParent, StudentsParentId> {
}
