package com.ntg.sms.Repositories;

import com.ntg.sms.entities.Complaints;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintsRepository  extends JpaRepository<Complaints,Long>{
}
