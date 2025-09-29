package com.examportal.questionservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;

import java.time.LocalDateTime;

@Entity
@Table(name = "questions")
public class Question {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Question text is required")
    @Column(columnDefinition = "TEXT")
    private String questionText;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Question type is required")
    private QuestionType questionType;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Difficulty level is required")
    private DifficultyLevel difficultyLevel;
    
    @NotNull(message = "Marks is required")
    @Positive(message = "Marks must be positive")
    private Integer marks;
    
    @Column(name = "exam_id")
    private Long examId;
    
    @Column(name = "created_by")
    private Long createdBy;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // For MCQ questions - store as comma-separated string
    @Column(name = "options", columnDefinition = "TEXT")
    private String options;
    
    @Column(name = "correct_answer")
    private String correctAnswer;
    
    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;
    
    // Constructors
    public Question() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public Question(String questionText, QuestionType questionType, DifficultyLevel difficultyLevel, 
                   Integer marks, Long examId, Long createdBy) {
        this();
        this.questionText = questionText;
        this.questionType = questionType;
        this.difficultyLevel = difficultyLevel;
        this.marks = marks;
        this.examId = examId;
        this.createdBy = createdBy;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getQuestionText() {
        return questionText;
    }
    
    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }
    
    public QuestionType getQuestionType() {
        return questionType;
    }
    
    public void setQuestionType(QuestionType questionType) {
        this.questionType = questionType;
    }
    
    public DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }
    
    public void setDifficultyLevel(DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }
    
    public Integer getMarks() {
        return marks;
    }
    
    public void setMarks(Integer marks) {
        this.marks = marks;
    }
    
    public Long getExamId() {
        return examId;
    }
    
    public void setExamId(Long examId) {
        this.examId = examId;
    }
    
    public Long getCreatedBy() {
        return createdBy;
    }
    
    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
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
    
    public String getOptions() {
        return options;
    }
    
    public void setOptions(String options) {
        this.options = options;
    }
    
    // Helper method to get options as array for frontend
    @JsonProperty("options")
    public String[] getOptionsArray() {
        if (options == null || options.isEmpty()) {
            return new String[0];
        }
        return options.split(",");
    }
    
    // Helper method to set options from array (used by frontend)
    public void setOptionsArray(String[] optionsArray) {
        if (optionsArray == null || optionsArray.length == 0) {
            this.options = "";
        } else {
            this.options = String.join(",", optionsArray);
        }
    }
    
    // Custom setter to handle both string and array inputs
    @JsonSetter("options")
    public void setOptionsFromJson(Object optionsInput) {
        if (optionsInput instanceof String) {
            this.options = (String) optionsInput;
        } else if (optionsInput instanceof String[]) {
            setOptionsArray((String[]) optionsInput);
        } else if (optionsInput instanceof java.util.List) {
            @SuppressWarnings("unchecked")
            java.util.List<String> optionsList = (java.util.List<String>) optionsInput;
            setOptionsArray(optionsList.toArray(new String[0]));
        } else {
            this.options = "";
        }
    }
    
    public String getCorrectAnswer() {
        return correctAnswer;
    }
    
    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }
    
    public String getExplanation() {
        return explanation;
    }
    
    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
