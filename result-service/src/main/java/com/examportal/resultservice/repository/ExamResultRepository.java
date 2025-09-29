package com.examportal.resultservice.repository;

import com.examportal.resultservice.entity.ExamResult;
import com.examportal.resultservice.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {
    
    List<ExamResult> findByUserId(Long userId);
    
    List<ExamResult> findByExamId(Long examId);
    
    Optional<ExamResult> findBySessionId(Long sessionId);
    
    List<ExamResult> findByUserIdAndExamId(Long userId, Long examId);
    
    List<ExamResult> findByGrade(Grade grade);
    
    @Query("SELECT er FROM ExamResult er WHERE er.userId = :userId ORDER BY er.submittedAt DESC")
    List<ExamResult> findByUserIdOrderBySubmittedAtDesc(@Param("userId") Long userId);
    
    @Query("SELECT er FROM ExamResult er WHERE er.examId = :examId ORDER BY er.obtainedMarks DESC")
    List<ExamResult> findByExamIdOrderByObtainedMarksDesc(@Param("examId") Long examId);
    
    @Query("SELECT AVG(er.percentage) FROM ExamResult er WHERE er.examId = :examId")
    Double getAveragePercentageByExamId(@Param("examId") Long examId);
    
    @Query("SELECT MAX(er.obtainedMarks) FROM ExamResult er WHERE er.examId = :examId")
    Integer getHighestMarksByExamId(@Param("examId") Long examId);
    
    @Query("SELECT MIN(er.obtainedMarks) FROM ExamResult er WHERE er.examId = :examId")
    Integer getLowestMarksByExamId(@Param("examId") Long examId);
    
    @Query("SELECT COUNT(er) FROM ExamResult er WHERE er.examId = :examId AND er.percentage >= :passPercentage")
    Long getPassCountByExamId(@Param("examId") Long examId, @Param("passPercentage") Double passPercentage);
    
    @Query("SELECT COUNT(er) FROM ExamResult er WHERE er.examId = :examId")
    Long getTotalAttemptsByExamId(@Param("examId") Long examId);
    
    @Query("SELECT er FROM ExamResult er WHERE er.submittedAt BETWEEN :startDate AND :endDate")
    List<ExamResult> findBySubmittedAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
