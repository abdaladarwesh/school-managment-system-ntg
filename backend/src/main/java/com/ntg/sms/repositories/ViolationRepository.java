package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Violation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ViolationRepository extends JpaRepository<Violation, Long> {
}
