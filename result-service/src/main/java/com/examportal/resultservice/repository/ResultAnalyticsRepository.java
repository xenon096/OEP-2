package com.examportal.resultservice.repository;

import com.examportal.resultservice.entity.ResultAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResultAnalyticsRepository extends JpaRepository<ResultAnalytics, Long> {
    
    Optional<ResultAnalytics> findByExamId(Long examId);
}
