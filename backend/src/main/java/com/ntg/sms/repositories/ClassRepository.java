package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface ClassRepository extends JpaRepository<Class,Long> {
}
