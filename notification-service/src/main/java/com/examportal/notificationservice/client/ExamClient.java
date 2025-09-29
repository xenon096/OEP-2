package com.examportal.notificationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "exam-service")
public interface ExamClient {
    
    @GetMapping("/api/exams/{id}")
    Map<String, Object> getExamById(@PathVariable("id") Long id);
}