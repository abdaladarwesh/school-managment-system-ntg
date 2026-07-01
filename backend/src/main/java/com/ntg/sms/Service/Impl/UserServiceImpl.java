package com.ntg.sms.Service.Impl;

import com.ntg.sms.Entities.User;
import com.ntg.sms.Entities.UserPhoneNumber;
import com.ntg.sms.Repositories.UserPhoneNumberRepository;
import com.ntg.sms.Service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserPhoneNumberRepository userPhoneNumberRepository;
    @Override
    public List<Long> getUserPhoneNumbers(Long id) {
        List<UserPhoneNumber> userPhoneNumbers = userPhoneNumberRepository.findAllByUser_Id(id);
        List<Long> phoneNumbers = new ArrayList<>();
        userPhoneNumbers.forEach(
                p -> {
                    phoneNumbers.add(p.getId().getPhoneNumber());
                }
        );
        return phoneNumbers;
    }
}
