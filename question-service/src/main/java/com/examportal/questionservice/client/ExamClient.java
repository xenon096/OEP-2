package com.examportal.questionservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "exam-service")
public interface ExamClient {
    
    @GetMapping("/api/exams/{examId}")
    Object getExamById(@PathVariable("examId") Long examId);
    
    @PutMapping("/api/exams/{examId}/update-total-marks")
    void updateExamTotalMarks(@PathVariable("examId") Long examId, @RequestParam("totalMarks") Integer totalMarks);
}