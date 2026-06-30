package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Term;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TermRepository extends JpaRepository<Term, Long> {
}