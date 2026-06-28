package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.Complaints;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface ComplaintsRepository  extends JpaRepository<Complaints,Long>{
}
