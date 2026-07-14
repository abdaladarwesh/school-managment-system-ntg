package com.ntg.sms.Service;

import com.ntg.sms.Dtos.Request.NotificationRequest;
import com.ntg.sms.Entities.Notification;

public interface NotificationService {
    Notification addNotification(NotificationRequest request);
}
