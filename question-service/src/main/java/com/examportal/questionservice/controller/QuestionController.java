package com.examportal.questionservice.controller;

import com.examportal.questionservice.entity.Question;
import com.examportal.questionservice.entity.QuestionType;
import com.examportal.questionservice.entity.DifficultyLevel;
import com.examportal.questionservice.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {
    
    @Autowired
    private QuestionService questionService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<Question>> getAllQuestions() {
        List<Question> questions = questionService.getAllQuestions();
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable Long id) {
        Question question = questionService.getQuestionById(id);
        return ResponseEntity.ok(question);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
        Question createdQuestion = questionService.createQuestion(question);
        return ResponseEntity.ok(createdQuestion);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Question> updateQuestion(@PathVariable Long id, @RequestBody Question question) {
        Question updatedQuestion = questionService.updateQuestion(id, question);
        return ResponseEntity.ok(updatedQuestion);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<Question>> getQuestionsByExamId(@PathVariable Long examId) {
        List<Question> questions = questionService.getQuestionsByExamId(examId);
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/created-by/{createdBy}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<Question>> getQuestionsByCreatedBy(@PathVariable Long createdBy) {
        List<Question> questions = questionService.getQuestionsByCreatedBy(createdBy);
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/type/{questionType}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<Question>> getQuestionsByType(@PathVariable QuestionType questionType) {
        List<Question> questions = questionService.getQuestionsByType(questionType);
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/difficulty/{difficultyLevel}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<Question>> getQuestionsByDifficulty(@PathVariable DifficultyLevel difficultyLevel) {
        List<Question> questions = questionService.getQuestionsByDifficulty(difficultyLevel);
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/exam/{examId}/type/{questionType}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<Question>> getQuestionsByExamAndType(@PathVariable Long examId, @PathVariable QuestionType questionType) {
        List<Question> questions = questionService.getQuestionsByExamAndType(examId, questionType);
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/exam/{examId}/difficulty/{difficultyLevel}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<Question>> getQuestionsByExamAndDifficulty(@PathVariable Long examId, @PathVariable DifficultyLevel difficultyLevel) {
        List<Question> questions = questionService.getQuestionsByExamAndDifficulty(examId, difficultyLevel);
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/exam/{examId}/random")
    public ResponseEntity<List<Question>> getRandomQuestionsByExamId(@PathVariable Long examId) {
        List<Question> questions = questionService.getRandomQuestionsByExamId(examId);
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/exam/{examId}/random/difficulty/{difficulty}")
    public ResponseEntity<List<Question>> getRandomQuestionsByExamIdAndDifficulty(@PathVariable Long examId, @PathVariable DifficultyLevel difficulty) {
        List<Question> questions = questionService.getRandomQuestionsByExamIdAndDifficulty(examId, difficulty);
        return ResponseEntity.ok(questions);
    }
    
    @GetMapping("/exam/{examId}/count")
    public ResponseEntity<Long> getQuestionCountByExamId(@PathVariable Long examId) {
        Long count = questionService.getQuestionCountByExamId(examId);
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/exam/{examId}/total-marks")
    public ResponseEntity<Integer> getTotalMarksByExamId(@PathVariable Long examId) {
        Integer totalMarks = questionService.getTotalMarksByExamId(examId);
        return ResponseEntity.ok(totalMarks);
    }
    
    @PostMapping("/exam/{examId}/bulk")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<Question>> createQuestionsForExam(@PathVariable Long examId, @RequestBody List<Question> questions, @RequestParam Long createdBy) {
        List<Question> createdQuestions = questionService.createQuestionsForExam(examId, questions, createdBy);
        return ResponseEntity.ok(createdQuestions);
    }
    
    @PostMapping("/import-csv")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Map<String, Object>> importQuestionsFromCSV(
            @RequestParam("file") MultipartFile file,
            @RequestParam("examId") Long examId,
            @RequestParam("createdBy") Long createdBy) {
        

        
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "Please select a CSV file to upload");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (!file.getOriginalFilename().endsWith(".csv")) {
                response.put("success", false);
                response.put("message", "Please upload a CSV file");
                return ResponseEntity.badRequest().body(response);
            }
            
            List<Question> importedQuestions = questionService.importQuestionsFromCSV(file, examId, createdBy);
            
            response.put("success", true);
            response.put("message", "Successfully imported " + importedQuestions.size() + " questions");
            response.put("count", importedQuestions.size());
            response.put("questions", importedQuestions);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error importing questions: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/csv-template")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<String> getCSVTemplate() {
        String template = "questionText,questionType,difficultyLevel,marks,options,correctAnswer,explanation\n" +
                         "What is 2+2?,MULTIPLE_CHOICE,EASY,1,\"A) 3,B) 4,C) 5,D) 6\",B,Basic addition\n" +
                         "Explain photosynthesis,ESSAY,MEDIUM,2,,Plants convert sunlight to energy,Biology concept";
        
        return ResponseEntity.ok()
                .header("Content-Type", "text/csv")
                .header("Content-Disposition", "attachment; filename=question_template.csv")
                .body(template);
    }
    
    @DeleteMapping("/exam/{examId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Void> deleteQuestionsByExamId(@PathVariable Long examId) {
        questionService.deleteQuestionsByExamId(examId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Question Service is running!");
    }
}
