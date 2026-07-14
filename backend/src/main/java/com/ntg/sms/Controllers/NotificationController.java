package com.ntg.sms.Controllers;

import com.ntg.sms.Dtos.Request.NotificationRequest;
import com.ntg.sms.Service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationService notificationService;


    @PostMapping
    public ResponseEntity<?> createNotification(@RequestBody NotificationRequest request){
        notificationService.addNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
