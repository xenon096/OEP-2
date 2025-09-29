package com.examportal.resultservice.service;

import com.examportal.resultservice.entity.Result;
import com.examportal.resultservice.repository.ResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ResultService {

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private RestTemplate restTemplate;

    public List<Result> getAllResults() {
        return resultRepository.findAll();
    }

    public List<Result> getResultsByUser(Long userId) {
        return resultRepository.findByUserId(userId);
    }

    public List<Result> getResultsByExam(Long examId) {
        return resultRepository.findByExamId(examId);
    }

    public boolean isExamCompleted(Long userId, Long examId) {
        return resultRepository.existsByUserIdAndExamId(userId, examId);
    }

    public Result saveResult(Result result) {
        // Calculate passing status if not already set
        if (result.getPassingStatus() == null) {
            result.setPassingStatus(calculatePassingStatus(result));
        }
        return resultRepository.save(result);
    }

    public Result createResult(Long userId, Long examId, String sessionId, Integer score, Integer totalMarks) {
        Result result = new Result(userId, examId, sessionId, score, totalMarks);
        result.setPassingStatus(calculatePassingStatus(result));
        return resultRepository.save(result);
    }
    
    public Result getResultByUserAndExam(Long userId, Long examId) {
        return resultRepository.findByUserIdAndExamId(userId, examId).orElse(null);
    }
    
    public void deleteResultsByUserId(Long userId) {
        resultRepository.deleteByUserId(userId);
    }
    
    private String calculatePassingStatus(Result result) {
        try {
            // Try to get exam details from exam service via API Gateway
            String examServiceUrl = "http://localhost:8080/api/exams/" + result.getExamId();
            Map<String, Object> examData = restTemplate.getForObject(examServiceUrl, Map.class);
            
            if (examData != null) {
                Integer passingMarks = (Integer) examData.get("passingMarks");
                
                if (passingMarks != null && result.getScore() != null) {
                    // Compare actual score with passing marks
                    return result.getScore() >= passingMarks ? "PASS" : "FAIL";
                }
            }
        } catch (Exception e) {
            // Silently handle exception and use fallback
        }
        
        // Fallback: use 50% of total marks as passing threshold
        if (result.getTotalMarks() != null && result.getScore() != null) {
            int passingThreshold = (int) Math.ceil(result.getTotalMarks() * 0.5);
            return result.getScore() >= passingThreshold ? "PASS" : "FAIL";
        }
        
        return "FAIL";
    }
}