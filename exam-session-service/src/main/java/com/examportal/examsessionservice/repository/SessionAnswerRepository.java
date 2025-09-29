package com.examportal.examsessionservice.repository;

import com.examportal.examsessionservice.entity.SessionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionAnswerRepository extends JpaRepository<SessionAnswer, Long> {
    
    List<SessionAnswer> findBySessionId(Long sessionId);
    
    Optional<SessionAnswer> findBySessionIdAndQuestionId(Long sessionId, Long questionId);
    
    @Query("SELECT sa FROM SessionAnswer sa WHERE sa.sessionId = :sessionId ORDER BY sa.questionId")
    List<SessionAnswer> findBySessionIdOrderByQuestionId(@Param("sessionId") Long sessionId);
    
    @Query("SELECT COUNT(sa) FROM SessionAnswer sa WHERE sa.sessionId = :sessionId")
    Long countAnswersBySessionId(@Param("sessionId") Long sessionId);
    
    @Query("SELECT SUM(sa.marksObtained) FROM SessionAnswer sa WHERE sa.sessionId = :sessionId")
    Integer getTotalMarksBySessionId(@Param("sessionId") Long sessionId);
    
    @Modifying
    @Transactional
    void deleteBySessionId(Long sessionId);
}
