package com.examportal.examservice.repository;

import com.examportal.examservice.entity.Exam;
import com.examportal.examservice.entity.ExamStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    
    List<Exam> findByCreatedBy(Long createdBy);
    
    List<Exam> findByStatus(ExamStatus status);
    
    List<Exam> findByCreatedByAndStatus(Long createdBy, ExamStatus status);
    
    @Query("SELECT e FROM Exam e WHERE e.status = :status AND e.startTime <= :currentTime AND e.endTime >= :currentTime")
    List<Exam> findActiveExams(@Param("status") ExamStatus status, @Param("currentTime") LocalDateTime currentTime);
    
    @Query("SELECT e FROM Exam e WHERE e.status = :status AND e.startTime > :currentTime")
    List<Exam> findUpcomingExams(@Param("status") ExamStatus status, @Param("currentTime") LocalDateTime currentTime);
    
    @Query("SELECT e FROM Exam e WHERE e.status = :status AND e.endTime < :currentTime")
    List<Exam> findCompletedExams(@Param("status") ExamStatus status, @Param("currentTime") LocalDateTime currentTime);
    
    Page<Exam> findByStatus(ExamStatus status, Pageable pageable);
    
    Page<Exam> findByCreatedBy(Long createdBy, Pageable pageable);
    
    Page<Exam> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM questions WHERE exam_id = :examId", nativeQuery = true)
    void deleteQuestionsByExamId(@Param("examId") Long examId);
}
