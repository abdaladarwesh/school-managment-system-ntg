package com.ntg.sms.Repositories;

import com.ntg.sms.Entities.UserNotification;
import com.ntg.sms.Entities.UserNotificationId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserNotificationRepository extends JpaRepository<UserNotification, UserNotificationId> {
}