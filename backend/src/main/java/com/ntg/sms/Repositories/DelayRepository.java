package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Delay;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DelayRepository extends JpaRepository<Delay, Long> {
}