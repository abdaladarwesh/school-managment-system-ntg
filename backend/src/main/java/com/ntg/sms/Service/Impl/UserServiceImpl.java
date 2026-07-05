package com.ntg.sms.Service.Impl;

import com.ntg.sms.Entities.Student;
import com.ntg.sms.Entities.User;
import com.ntg.sms.Entities.UserPhoneNumber;
import com.ntg.sms.Repositories.UserPhoneNumberRepository;
import com.ntg.sms.Repositories.UserRepository;
import com.ntg.sms.Service.UserService;
import io.mailtrap.client.MailtrapClient;
import io.mailtrap.config.MailtrapConfig;
import io.mailtrap.factory.MailtrapClientFactory;
import io.mailtrap.model.request.emails.Address;
import io.mailtrap.model.request.emails.MailtrapMail;
import lombok.RequiredArgsConstructor;
import org.apache.commons.text.RandomStringGenerator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserPhoneNumberRepository userPhoneNumberRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static String TOKEN = "092d26fefbcc9b8a17fe12162379b4ac";

    private void sendPasswordEmail(String password, String email){
        final MailtrapConfig config = new MailtrapConfig.Builder()
                .token(TOKEN)
                .build();

        final MailtrapClient client = MailtrapClientFactory.createMailtrapClient(config);

        final MailtrapMail mail = MailtrapMail.builder()
                .from(new Address("ntgsms.noreply@demomailtrap.co", "NTG School Management System"))
                .to(List.of(new Address(email)))
                .subject("Password Reset")
                .text("Your new Password is \"" + password + "\" make sure to change it as soon as possible as the system will not let you in until you changed")
                .build();

        try {
            System.out.println(client.send(mail));
        } catch (Exception e) {
            System.out.println("Caught exception : " + e);
        }
    }

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

    @Override
    public String generatePassword(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        SecureRandom secureRandom = new SecureRandom();
        RandomStringGenerator secureGenerator = new RandomStringGenerator.Builder()
                .withinRange('!', 'z') // Includes symbols, numbers, and uppercase/lowercase letters
                .usingRandom(secureRandom::nextInt) // Explicitly binds SecureRandom
                .get();
        String generatedPassword = secureGenerator.generate(16);
        user.setPassword(passwordEncoder.encode(generatedPassword));
        userRepository.saveAndFlush(user);
        sendPasswordEmail(generatedPassword, user.getEmail());
        return generatedPassword;
    }
}
