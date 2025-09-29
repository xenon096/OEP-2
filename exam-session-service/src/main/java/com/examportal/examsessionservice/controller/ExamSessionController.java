package com.examportal.examsessionservice.controller;

import com.examportal.examsessionservice.entity.ExamSession;
import com.examportal.examsessionservice.entity.SessionAnswer;
import com.examportal.examsessionservice.service.ExamSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class ExamSessionController {
    
    @Autowired
    private ExamSessionService examSessionService;
    
    @PostMapping("/create")
    public ResponseEntity<?> createSession(@RequestParam Long examId, 
                                                   @RequestParam Long userId,
                                                   @RequestParam Integer durationMinutes,
                                                   @RequestParam Integer totalQuestions) {
        try {
            ExamSession session = examSessionService.createSession(examId, userId, durationMinutes, totalQuestions);
            return ResponseEntity.ok(session);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error creating session: " + e.getMessage());
        }
    }
    
    @PostMapping("/{sessionId}/start")
    public ResponseEntity<?> startSession(@PathVariable Long sessionId) {
        try {
            ExamSession session = examSessionService.startSession(sessionId);
            return ResponseEntity.ok(session);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error starting session: " + e.getMessage());
        }
    }
    
    @PostMapping("/{sessionId}/answer")
    public ResponseEntity<ExamSession> submitAnswer(@PathVariable Long sessionId,
                                                  @RequestParam Long questionId,
                                                  @RequestParam String answerText) {
        ExamSession session = examSessionService.submitAnswer(sessionId, questionId, answerText);
        return ResponseEntity.ok(session);
    }
    
    @PostMapping("/{sessionId}/submit")
    public ResponseEntity<ExamSession> submitSession(@PathVariable Long sessionId) {
        ExamSession session = examSessionService.submitSession(sessionId);
        return ResponseEntity.ok(session);
    }
    
    @GetMapping("/{sessionId}")
    public ResponseEntity<ExamSession> getSessionById(@PathVariable Long sessionId) {
        ExamSession session = examSessionService.getSessionById(sessionId);
        return ResponseEntity.ok(session);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ExamSession>> getSessionsByUserId(@PathVariable Long userId) {
        List<ExamSession> sessions = examSessionService.getSessionsByUserId(userId);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/exam/{examId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<ExamSession>> getSessionsByExamId(@PathVariable Long examId) {
        List<ExamSession> sessions = examSessionService.getSessionsByExamId(examId);
        return ResponseEntity.ok(sessions);
    }
    
    @GetMapping("/user/{userId}/active")
    public ResponseEntity<List<ExamSession>> getActiveSessionsByUserId(@PathVariable Long userId) {
        List<ExamSession> sessions = examSessionService.getActiveSessionsByUserId(userId);
        return ResponseEntity.ok(sessions);
    }
    
    @PutMapping("/{sessionId}/time")
    public ResponseEntity<ExamSession> updateTimeRemaining(@PathVariable Long sessionId,
                                                          @RequestParam Integer timeRemainingSeconds) {
        ExamSession session = examSessionService.updateTimeRemaining(sessionId, timeRemainingSeconds);
        return ResponseEntity.ok(session);
    }
    
    @GetMapping("/{sessionId}/answers")
    public ResponseEntity<List<SessionAnswer>> getSessionAnswers(@PathVariable Long sessionId) {
        List<SessionAnswer> answers = examSessionService.getSessionAnswers(sessionId);
        return ResponseEntity.ok(answers);
    }
    
    @GetMapping("/{sessionId}/answer/{questionId}")
    public ResponseEntity<SessionAnswer> getAnswerBySessionAndQuestion(@PathVariable Long sessionId,
                                                                     @PathVariable Long questionId) {
        SessionAnswer answer = examSessionService.getAnswerBySessionAndQuestion(sessionId, questionId);
        if (answer != null) {
            return ResponseEntity.ok(answer);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{sessionId}/cancel")
    public ResponseEntity<Void> cancelSession(@PathVariable Long sessionId) {
        examSessionService.cancelSession(sessionId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/expired")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<ExamSession>> getExpiredSessions() {
        List<ExamSession> sessions = examSessionService.getExpiredSessions();
        return ResponseEntity.ok(sessions);
    }
    
    @PostMapping("/auto-submit-expired")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Void> autoSubmitExpiredSessions() {
        examSessionService.autoSubmitExpiredSessions();
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/user/{userId}")
    public ResponseEntity<Void> deleteSessionsByUserId(@PathVariable Long userId) {
        examSessionService.deleteSessionsByUserId(userId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Exam Session Service is running!");
    }
}
