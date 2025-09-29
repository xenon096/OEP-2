package com.examportal.examservice.client;

import com.examportal.examservice.config.FeignConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "question-service", configuration = FeignConfig.class)
public interface QuestionClient {
    
    @DeleteMapping("/api/questions/exam/{examId}")
    void deleteQuestionsByExamId(@PathVariable("examId") Long examId);
}