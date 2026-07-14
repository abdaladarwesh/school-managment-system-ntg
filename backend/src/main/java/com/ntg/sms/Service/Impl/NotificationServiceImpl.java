package com.ntg.sms.Service.Impl;

import com.ntg.sms.Dtos.Request.NotificationRequest;
import com.ntg.sms.Entities.Notification;
import com.ntg.sms.Entities.User;
import com.ntg.sms.Entities.UserNotification;
import com.ntg.sms.Entities.UserNotificationId;
import com.ntg.sms.Repositories.NotificationRepository;
import com.ntg.sms.Repositories.UserNotificationRepository;
import com.ntg.sms.Repositories.UserRepository;
import com.ntg.sms.Service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final UserNotificationRepository userNotificationRepository;

    @Override
    public Notification addNotification(NotificationRequest request) {
        User senderUser = userRepository.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElse(null);
        User receiverId = userRepository.findById(request.getReceiverId()).orElse(null);
        Notification notification = Notification.builder()
                .title(request.getTitle())
                .type(request.getType())
                .priority(request.getPriority())
                .body(request.getBody())
                .build();
        Notification saved = notificationRepository.save(notification);
        UserNotificationId userNotificationId = new UserNotificationId();
        UserNotification userNotification = UserNotification.builder()
                .id(userNotificationId)
                .user(senderUser)
                .notification(notification)
                .sentTo(receiverId)
                .build();
        userNotificationRepository.save(userNotification);
        return saved;
    }
}
