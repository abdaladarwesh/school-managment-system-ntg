package com.ntg.sms.repositories;

import com.ntg.sms.entities.Violation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface ViolationRepository extends JpaRepository<Violation, Long> {
}
