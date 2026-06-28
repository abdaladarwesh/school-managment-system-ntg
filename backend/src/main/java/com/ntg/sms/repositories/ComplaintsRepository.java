package com.ntg.sms.repositories;

import com.ntg.sms.entities.Complaints;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface ComplaintsRepository  extends JpaRepository<Complaints,Long>{
}
