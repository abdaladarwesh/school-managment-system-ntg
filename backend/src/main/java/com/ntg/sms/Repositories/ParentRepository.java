package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Parent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParentRepository extends JpaRepository<Parent, Long> {

    boolean existsByUserId(Long userId);

    Optional<Parent> findByUserId(Long id);
}
