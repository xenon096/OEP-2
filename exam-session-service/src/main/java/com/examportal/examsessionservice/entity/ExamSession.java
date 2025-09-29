package com.examportal.examsessionservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "exam_sessions")
public class ExamSession {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Exam ID is required")
    @Column(name = "exam_id")
    private Long examId;
    
    @NotNull(message = "User ID is required")
    @Column(name = "user_id")
    private Long userId;
    
    @Enumerated(EnumType.STRING)
    private SessionStatus status;
    
    @Column(name = "start_time")
    private LocalDateTime startTime;
    
    @Column(name = "end_time")
    private LocalDateTime endTime;
    
    @Column(name = "submitted_time")
    private LocalDateTime submittedTime;
    
    @Column(name = "time_remaining_seconds")
    private Integer timeRemainingSeconds;
    
    @Column(name = "total_questions")
    private Integer totalQuestions;
    
    @Column(name = "answered_questions")
    private Integer answeredQuestions;
    
    @Column(name = "current_question_index")
    private Integer currentQuestionIndex;
    
    // Store answers as JSON
    @Column(name = "answers", columnDefinition = "TEXT")
    private String answers;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public ExamSession() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = SessionStatus.NOT_STARTED;
        this.answeredQuestions = 0;
        this.currentQuestionIndex = 0;
    }
    
    public ExamSession(Long examId, Long userId, Integer timeRemainingSeconds, Integer totalQuestions) {
        this();
        this.examId = examId;
        this.userId = userId;
        this.timeRemainingSeconds = timeRemainingSeconds;
        this.totalQuestions = totalQuestions;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getExamId() {
        return examId;
    }
    
    public void setExamId(Long examId) {
        this.examId = examId;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public SessionStatus getStatus() {
        return status;
    }
    
    public void setStatus(SessionStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalDateTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    
    public LocalDateTime getSubmittedTime() {
        return submittedTime;
    }
    
    public void setSubmittedTime(LocalDateTime submittedTime) {
        this.submittedTime = submittedTime;
    }
    
    public Integer getTimeRemainingSeconds() {
        return timeRemainingSeconds;
    }
    
    public void setTimeRemainingSeconds(Integer timeRemainingSeconds) {
        this.timeRemainingSeconds = timeRemainingSeconds;
    }
    
    public Integer getTotalQuestions() {
        return totalQuestions;
    }
    
    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }
    
    public Integer getAnsweredQuestions() {
        return answeredQuestions;
    }
    
    public void setAnsweredQuestions(Integer answeredQuestions) {
        this.answeredQuestions = answeredQuestions;
    }
    
    public Integer getCurrentQuestionIndex() {
        return currentQuestionIndex;
    }
    
    public void setCurrentQuestionIndex(Integer currentQuestionIndex) {
        this.currentQuestionIndex = currentQuestionIndex;
    }
    
    public String getAnswers() {
        return answers;
    }
    
    public void setAnswers(String answers) {
        this.answers = answers;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
