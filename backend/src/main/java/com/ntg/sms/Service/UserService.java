package com.ntg.sms.Service;

import java.util.List;

public interface UserService {
    List<Long> getUserPhoneNumbers(Long id);

    String generatePassword(Long userId);
}
