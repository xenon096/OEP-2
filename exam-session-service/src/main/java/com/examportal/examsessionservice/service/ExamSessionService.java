package com.examportal.examsessionservice.service;

import com.examportal.examsessionservice.entity.ExamSession;
import com.examportal.examsessionservice.entity.SessionAnswer;
import com.examportal.examsessionservice.entity.SessionStatus;
import com.examportal.examsessionservice.repository.ExamSessionRepository;
import com.examportal.examsessionservice.repository.SessionAnswerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ExamSessionService {
    
    @Autowired
    private ExamSessionRepository examSessionRepository;
    
    @Autowired
    private SessionAnswerRepository sessionAnswerRepository;
    
    public ExamSession createSession(Long examId, Long userId, Integer durationMinutes, Integer totalQuestions) {
        // Check if user already has an active session for this exam
        Optional<ExamSession> existingSession = examSessionRepository.findByUserIdAndExamId(userId, examId);
        if (existingSession.isPresent() && 
            (existingSession.get().getStatus() == SessionStatus.IN_PROGRESS || 
             existingSession.get().getStatus() == SessionStatus.NOT_STARTED)) {
            throw new RuntimeException("User already has an active session for this exam");
        }
        
        ExamSession session = new ExamSession();
        session.setExamId(examId);
        session.setUserId(userId);
        session.setTimeRemainingSeconds(durationMinutes * 60);
        session.setTotalQuestions(totalQuestions);
        session.setStatus(SessionStatus.NOT_STARTED);
        session.setCreatedAt(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        
        return examSessionRepository.save(session);
    }
    
    public ExamSession startSession(Long sessionId) {
        ExamSession session = examSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        if (session.getStatus() != SessionStatus.NOT_STARTED) {
            throw new RuntimeException("Session cannot be started");
        }
        
        session.setStatus(SessionStatus.IN_PROGRESS);
        session.setStartTime(LocalDateTime.now());
        session.setEndTime(session.getStartTime().plusSeconds(session.getTimeRemainingSeconds()));
        session.setUpdatedAt(LocalDateTime.now());
        
        return examSessionRepository.save(session);
    }
    
    public ExamSession submitAnswer(Long sessionId, Long questionId, String answerText) {
        ExamSession session = examSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        if (session.getStatus() != SessionStatus.IN_PROGRESS) {
            throw new RuntimeException("Session is not active");
        }
        
        // Check if time has expired
        if (LocalDateTime.now().isAfter(session.getEndTime())) {
            session.setStatus(SessionStatus.TIMED_OUT);
            examSessionRepository.save(session);
            throw new RuntimeException("Session has expired");
        }
        
        // Save or update answer
        Optional<SessionAnswer> existingAnswer = sessionAnswerRepository.findBySessionIdAndQuestionId(sessionId, questionId);
        SessionAnswer answer;
        
        if (existingAnswer.isPresent()) {
            answer = existingAnswer.get();
            answer.setAnswerText(answerText);
            answer.setAnsweredAt(LocalDateTime.now());
        } else {
            answer = new SessionAnswer(sessionId, questionId, answerText);
            session.setAnsweredQuestions(session.getAnsweredQuestions() + 1);
        }
        
        sessionAnswerRepository.save(answer);
        examSessionRepository.save(session);
        
        return session;
    }
    
    public ExamSession submitSession(Long sessionId) {
        ExamSession session = examSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        if (session.getStatus() != SessionStatus.IN_PROGRESS) {
            throw new RuntimeException("Session is not active");
        }
        
        session.setStatus(SessionStatus.SUBMITTED);
        session.setSubmittedTime(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        
        return examSessionRepository.save(session);
    }
    
    public ExamSession getSessionById(Long sessionId) {
        return examSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
    }
    
    public List<ExamSession> getSessionsByUserId(Long userId) {
        return examSessionRepository.findByUserId(userId);
    }
    
    public List<ExamSession> getSessionsByExamId(Long examId) {
        return examSessionRepository.findByExamId(examId);
    }
    
    public List<ExamSession> getActiveSessionsByUserId(Long userId) {
        return examSessionRepository.findActiveSessionsByUserId(userId);
    }
    
    public ExamSession updateTimeRemaining(Long sessionId, Integer timeRemainingSeconds) {
        ExamSession session = examSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        session.setTimeRemainingSeconds(timeRemainingSeconds);
        session.setUpdatedAt(LocalDateTime.now());
        
        return examSessionRepository.save(session);
    }
    
    public List<SessionAnswer> getSessionAnswers(Long sessionId) {
        return sessionAnswerRepository.findBySessionId(sessionId);
    }
    
    public SessionAnswer getAnswerBySessionAndQuestion(Long sessionId, Long questionId) {
        return sessionAnswerRepository.findBySessionIdAndQuestionId(sessionId, questionId)
                .orElse(null);
    }
    
    public void cancelSession(Long sessionId) {
        ExamSession session = examSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        session.setStatus(SessionStatus.CANCELLED);
        session.setUpdatedAt(LocalDateTime.now());
        
        examSessionRepository.save(session);
    }
    
    public List<ExamSession> getExpiredSessions() {
        return examSessionRepository.findExpiredSessions(LocalDateTime.now());
    }
    
    public void autoSubmitExpiredSessions() {
        List<ExamSession> expiredSessions = getExpiredSessions();
        for (ExamSession session : expiredSessions) {
            session.setStatus(SessionStatus.TIMED_OUT);
            session.setUpdatedAt(LocalDateTime.now());
            examSessionRepository.save(session);
        }
    }
    
    public void deleteSessionsByUserId(Long userId) {
        List<ExamSession> userSessions = examSessionRepository.findByUserId(userId);
        for (ExamSession session : userSessions) {
            // Delete all answers for this session first
            sessionAnswerRepository.deleteBySessionId(session.getId());
        }
        // Then delete all sessions for the user
        examSessionRepository.deleteByUserId(userId);
    }
}
