package com.examportal.userservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "exam-session-service")
public interface ExamSessionServiceClient {
    
    @DeleteMapping("/api/sessions/user/{userId}")
    void deleteExamSessionsByUserId(@PathVariable("userId") Long userId);
}