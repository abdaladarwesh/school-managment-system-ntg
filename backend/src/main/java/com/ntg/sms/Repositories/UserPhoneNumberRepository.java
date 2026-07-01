package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.User;
import com.ntg.sms.Entities.UserPhoneNumber;
import com.ntg.sms.Entities.UserPhoneNumberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserPhoneNumberRepository extends JpaRepository<UserPhoneNumber, UserPhoneNumberId> {
    List<UserPhoneNumber> findAllByUser_Id(Long id);
}
