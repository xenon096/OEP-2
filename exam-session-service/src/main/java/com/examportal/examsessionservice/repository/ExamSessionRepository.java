package com.examportal.examsessionservice.repository;

import com.examportal.examsessionservice.entity.ExamSession;
import com.examportal.examsessionservice.entity.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamSessionRepository extends JpaRepository<ExamSession, Long> {
    
    List<ExamSession> findByUserId(Long userId);
    
    List<ExamSession> findByExamId(Long examId);
    
    Optional<ExamSession> findByUserIdAndExamId(Long userId, Long examId);
    
    List<ExamSession> findByStatus(SessionStatus status);
    
    List<ExamSession> findByUserIdAndStatus(Long userId, SessionStatus status);
    
    @Query("SELECT es FROM ExamSession es WHERE es.userId = :userId AND es.status IN ('IN_PROGRESS', 'NOT_STARTED')")
    List<ExamSession> findActiveSessionsByUserId(@Param("userId") Long userId);
    
    @Query("SELECT es FROM ExamSession es WHERE es.status = 'IN_PROGRESS' AND es.endTime < :currentTime")
    List<ExamSession> findExpiredSessions(@Param("currentTime") LocalDateTime currentTime);
    
    @Query("SELECT COUNT(es) FROM ExamSession es WHERE es.userId = :userId AND es.examId = :examId")
    Long countSessionsByUserAndExam(@Param("userId") Long userId, @Param("examId") Long examId);
    
    @Query("SELECT es FROM ExamSession es WHERE es.examId = :examId AND es.status = 'SUBMITTED'")
    List<ExamSession> findCompletedSessionsByExam(@Param("examId") Long examId);
    
    @Modifying
    @Transactional
    void deleteByUserId(Long userId);
}
