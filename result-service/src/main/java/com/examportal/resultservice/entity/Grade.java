package com.examportal.resultservice.entity;

public enum Grade {
    A_PLUS("A+", 90, 100),
    A("A", 80, 89),
    B_PLUS("B+", 70, 79),
    B("B", 60, 69),
    C_PLUS("C+", 50, 59),
    C("C", 40, 49),
    D("D", 30, 39),
    F("F", 0, 29);
    
    private final String gradeName;
    private final int minPercentage;
    private final int maxPercentage;
    
    Grade(String gradeName, int minPercentage, int maxPercentage) {
        this.gradeName = gradeName;
        this.minPercentage = minPercentage;
        this.maxPercentage = maxPercentage;
    }
    
    public String getGradeName() {
        return gradeName;
    }
    
    public int getMinPercentage() {
        return minPercentage;
    }
    
    public int getMaxPercentage() {
        return maxPercentage;
    }
    
    public static Grade getGradeByPercentage(double percentage) {
        for (Grade grade : values()) {
            if (percentage >= grade.minPercentage && percentage <= grade.maxPercentage) {
                return grade;
            }
        }
        return F;
    }
}
