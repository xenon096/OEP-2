package com.examportal.resultservice.repository;

import com.examportal.resultservice.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {
    
    List<Result> findByUserId(Long userId);
    
    List<Result> findByExamId(Long examId);
    
    boolean existsByUserIdAndExamId(Long userId, Long examId);
    
    java.util.Optional<Result> findByUserIdAndExamId(Long userId, Long examId);
    
    @Modifying
    @Transactional
    void deleteByUserId(Long userId);
}