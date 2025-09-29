package com.examportal.notificationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.List;
import java.util.Map;

@FeignClient(name = "user-service")
public interface UserClient {
    
    @GetMapping("/api/users/students")
    List<Map<String, Object>> getAllStudents();
}