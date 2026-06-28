package com.ntg.sms.repositories;

import com.ntg.sms.entities.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface ClassRepository extends JpaRepository<Class,Long> {
}
