package com.examportal.questionservice.repository;

import com.examportal.questionservice.entity.Question;
import com.examportal.questionservice.entity.QuestionType;
import com.examportal.questionservice.entity.DifficultyLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    
    List<Question> findByExamId(Long examId);
    
    List<Question> findByCreatedBy(Long createdBy);
    
    List<Question> findByQuestionType(QuestionType questionType);
    
    List<Question> findByDifficultyLevel(DifficultyLevel difficultyLevel);
    
    List<Question> findByExamIdAndQuestionType(Long examId, QuestionType questionType);
    
    List<Question> findByExamIdAndDifficultyLevel(Long examId, DifficultyLevel difficultyLevel);
    
    @Query("SELECT q FROM Question q WHERE q.examId = :examId ORDER BY RAND()")
    List<Question> findRandomQuestionsByExamId(@Param("examId") Long examId);
    
    @Query("SELECT q FROM Question q WHERE q.examId = :examId AND q.difficultyLevel = :difficulty ORDER BY RAND()")
    List<Question> findRandomQuestionsByExamIdAndDifficulty(@Param("examId") Long examId, @Param("difficulty") DifficultyLevel difficulty);
    
    @Query("SELECT COUNT(q) FROM Question q WHERE q.examId = :examId")
    Long countByExamId(@Param("examId") Long examId);
    
    @Query("SELECT SUM(q.marks) FROM Question q WHERE q.examId = :examId")
    Integer getTotalMarksByExamId(@Param("examId") Long examId);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM questions WHERE exam_id = :examId", nativeQuery = true)
    void deleteByExamId(@Param("examId") Long examId);
    

}
