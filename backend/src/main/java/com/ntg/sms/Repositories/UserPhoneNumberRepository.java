package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.UserPhoneNumber;
import com.ntg.sms.Entities.UserPhoneNumberId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPhoneNumberRepository extends JpaRepository<UserPhoneNumber, UserPhoneNumberId> {
}
