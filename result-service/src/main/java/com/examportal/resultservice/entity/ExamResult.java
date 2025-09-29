package com.examportal.resultservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "exam_results")
public class ExamResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Session ID is required")
    @Column(name = "session_id")
    private Long sessionId;
    
    @NotNull(message = "Exam ID is required")
    @Column(name = "exam_id")
    private Long examId;
    
    @NotNull(message = "User ID is required")
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "total_questions")
    private Integer totalQuestions;
    
    @Column(name = "answered_questions")
    private Integer answeredQuestions;
    
    @Column(name = "correct_answers")
    private Integer correctAnswers;
    
    @Column(name = "wrong_answers")
    private Integer wrongAnswers;
    
    @Column(name = "total_marks")
    private Integer totalMarks;
    
    @Column(name = "obtained_marks")
    private Integer obtainedMarks;
    
    @Column(name = "percentage")
    private Double percentage;
    
    @Enumerated(EnumType.STRING)
    private Grade grade;
    
    @Column(name = "time_taken_minutes")
    private Integer timeTakenMinutes;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public ExamResult() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public ExamResult(Long sessionId, Long examId, Long userId) {
        this();
        this.sessionId = sessionId;
        this.examId = examId;
        this.userId = userId;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
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
    
    public Integer getCorrectAnswers() {
        return correctAnswers;
    }
    
    public void setCorrectAnswers(Integer correctAnswers) {
        this.correctAnswers = correctAnswers;
    }
    
    public Integer getWrongAnswers() {
        return wrongAnswers;
    }
    
    public void setWrongAnswers(Integer wrongAnswers) {
        this.wrongAnswers = wrongAnswers;
    }
    
    public Integer getTotalMarks() {
        return totalMarks;
    }
    
    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }
    
    public Integer getObtainedMarks() {
        return obtainedMarks;
    }
    
    public void setObtainedMarks(Integer obtainedMarks) {
        this.obtainedMarks = obtainedMarks;
    }
    
    public Double getPercentage() {
        return percentage;
    }
    
    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
    
    public Grade getGrade() {
        return grade;
    }
    
    public void setGrade(Grade grade) {
        this.grade = grade;
    }
    
    public Integer getTimeTakenMinutes() {
        return timeTakenMinutes;
    }
    
    public void setTimeTakenMinutes(Integer timeTakenMinutes) {
        this.timeTakenMinutes = timeTakenMinutes;
    }
    
    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
    
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
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
