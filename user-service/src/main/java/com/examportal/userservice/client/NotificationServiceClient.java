package com.examportal.userservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "notification-service")
public interface NotificationServiceClient {
    
    @DeleteMapping("/api/notifications/user/{userId}")
    void deleteNotificationsByUserId(@PathVariable("userId") Long userId);
}