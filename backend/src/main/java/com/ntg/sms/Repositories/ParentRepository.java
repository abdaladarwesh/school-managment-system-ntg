package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Parent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParentRepository extends JpaRepository<Parent, Long> {

    boolean existsByUserId(Long userId);
}
