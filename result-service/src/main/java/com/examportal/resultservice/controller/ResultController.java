package com.examportal.resultservice.controller;

import com.examportal.resultservice.entity.Result;
import com.examportal.resultservice.service.ResultService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "*")
public class ResultController {

    @Autowired
    private ResultService resultService;

    @GetMapping
    public ResponseEntity<List<Result>> getAllResults() {
        return ResponseEntity.ok(resultService.getAllResults());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Result>> getResultsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(resultService.getResultsByUser(userId));
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<Result>> getResultsByExam(@PathVariable Long examId) {
        return ResponseEntity.ok(resultService.getResultsByExam(examId));
    }

    @GetMapping("/check/{userId}/{examId}")
    public ResponseEntity<Map<String, Boolean>> checkExamCompleted(
            @PathVariable Long userId, 
            @PathVariable Long examId) {
        boolean completed = resultService.isExamCompleted(userId, examId);
        return ResponseEntity.ok(Map.of("completed", completed));
    }

    @PostMapping
    public ResponseEntity<Result> createResult(@RequestBody Result result) {
        return ResponseEntity.ok(resultService.saveResult(result));
    }
    
    @GetMapping("/user/{userId}/exam/{examId}")
    public ResponseEntity<Result> getResultByUserAndExam(
            @PathVariable Long userId, 
            @PathVariable Long examId) {
        Result result = resultService.getResultByUserAndExam(userId, examId);
        if (result != null) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.notFound().build();
    }
    
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteResultsByUserId(@PathVariable Long userId) {
        resultService.deleteResultsByUserId(userId);
        return ResponseEntity.ok().build();
    }
}