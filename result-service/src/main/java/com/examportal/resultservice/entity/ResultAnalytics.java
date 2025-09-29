package com.examportal.resultservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

@Entity
@Table(name = "result_analytics")
public class ResultAnalytics {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull(message = "Exam ID is required")
    @Column(name = "exam_id")
    private Long examId;
    
    @Column(name = "total_attempts")
    private Integer totalAttempts;
    
    @Column(name = "average_score")
    private Double averageScore;
    
    @Column(name = "highest_score")
    private Integer highestScore;
    
    @Column(name = "lowest_score")
    private Integer lowestScore;
    
    @Column(name = "pass_count")
    private Integer passCount;
    
    @Column(name = "fail_count")
    private Integer failCount;
    
    @Column(name = "pass_percentage")
    private Double passPercentage;
    
    @Column(name = "average_time_minutes")
    private Double averageTimeMinutes;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public ResultAnalytics() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public ResultAnalytics(Long examId) {
        this();
        this.examId = examId;
        this.totalAttempts = 0;
        this.averageScore = 0.0;
        this.highestScore = 0;
        this.lowestScore = 0;
        this.passCount = 0;
        this.failCount = 0;
        this.passPercentage = 0.0;
        this.averageTimeMinutes = 0.0;
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
    
    public Integer getTotalAttempts() {
        return totalAttempts;
    }
    
    public void setTotalAttempts(Integer totalAttempts) {
        this.totalAttempts = totalAttempts;
    }
    
    public Double getAverageScore() {
        return averageScore;
    }
    
    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }
    
    public Integer getHighestScore() {
        return highestScore;
    }
    
    public void setHighestScore(Integer highestScore) {
        this.highestScore = highestScore;
    }
    
    public Integer getLowestScore() {
        return lowestScore;
    }
    
    public void setLowestScore(Integer lowestScore) {
        this.lowestScore = lowestScore;
    }
    
    public Integer getPassCount() {
        return passCount;
    }
    
    public void setPassCount(Integer passCount) {
        this.passCount = passCount;
    }
    
    public Integer getFailCount() {
        return failCount;
    }
    
    public void setFailCount(Integer failCount) {
        this.failCount = failCount;
    }
    
    public Double getPassPercentage() {
        return passPercentage;
    }
    
    public void setPassPercentage(Double passPercentage) {
        this.passPercentage = passPercentage;
    }
    
    public Double getAverageTimeMinutes() {
        return averageTimeMinutes;
    }
    
    public void setAverageTimeMinutes(Double averageTimeMinutes) {
        this.averageTimeMinutes = averageTimeMinutes;
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
