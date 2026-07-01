package com.ntg.sms.Service;

import com.ntg.sms.Entities.User;

import java.util.List;

public interface UserService {
    List<Long> getUserPhoneNumbers(Long id);
}
