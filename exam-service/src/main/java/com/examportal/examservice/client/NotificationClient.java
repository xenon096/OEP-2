package com.examportal.examservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "notification-service")
public interface NotificationClient {
    
    @PostMapping("/api/notifications/exam-published/{examId}")
    String notifyExamPublished(@PathVariable("examId") Long examId);
}