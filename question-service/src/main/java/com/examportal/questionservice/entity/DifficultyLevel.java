package com.examportal.questionservice.entity;

public enum DifficultyLevel {
    EASY(1),
    MEDIUM(2),
    HARD(5);
    
    private final int defaultMarks;
    
    DifficultyLevel(int defaultMarks) {
        this.defaultMarks = defaultMarks;
    }
    
    public int getDefaultMarks() {
        return defaultMarks;
    }
}
