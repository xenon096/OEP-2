package com.examportal.resultservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "results")
public class Result {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "exam_id", nullable = false)
    private Long examId;
    
    @Column(name = "session_id")
    private String sessionId;
    
    @Column(name = "score")
    private Integer score;
    
    @Column(name = "total_marks")
    private Integer totalMarks;
    
    @Column(name = "percentage")
    private Double percentage;
    
    @Column(name = "status")
    private String status = "COMPLETED";
    
    @Column(name = "passing_status")
    private String passingStatus; // "PASS", "FAIL", "PENDING"
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt = LocalDateTime.now();

    // Constructors
    public Result() {}

    public Result(Long userId, Long examId, String sessionId, Integer score, Integer totalMarks) {
        this.userId = userId;
        this.examId = examId;
        this.sessionId = sessionId;
        this.score = score;
        this.totalMarks = totalMarks;
        this.percentage = totalMarks > 0 ? (score * 100.0) / totalMarks : 0.0;
    }
    
    // Constructor for JSON deserialization
    public Result(Long userId, Long examId, String sessionId, Integer score, Integer totalMarks, Double percentage, String status) {
        this.userId = userId;
        this.examId = examId;
        this.sessionId = sessionId;
        this.score = score;
        this.totalMarks = totalMarks;
        this.percentage = percentage != null ? percentage : (totalMarks > 0 ? (score * 100.0) / totalMarks : 0.0);
        this.status = status != null ? status : "COMPLETED";
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Integer getTotalMarks() { return totalMarks; }
    public void setTotalMarks(Integer totalMarks) { this.totalMarks = totalMarks; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPassingStatus() { return passingStatus; }
    public void setPassingStatus(String passingStatus) { this.passingStatus = passingStatus; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    
    @PrePersist
    @PreUpdate
    public void calculatePercentage() {
        // Update percentage if score or totalMarks changed
        if (this.totalMarks != null && this.totalMarks > 0 && this.score != null) {
            this.percentage = (this.score * 100.0) / this.totalMarks;
        }
    }
}