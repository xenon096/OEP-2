package com.examportal.examservice.controller;

import com.examportal.examservice.entity.Exam;
import com.examportal.examservice.entity.ExamStatus;
import com.examportal.examservice.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {
    
    @Autowired
    private ExamService examService;
    
    @GetMapping
    public ResponseEntity<List<Exam>> getAllExams() {
        List<Exam> exams = examService.getAllExams();
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/paginated")
    public ResponseEntity<Page<Exam>> getAllExamsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Exam> exams = examService.getAllExams(pageable);
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<Exam>> searchExams(
            @RequestParam String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Exam> exams = examService.searchExams(title, pageable);
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExamById(@PathVariable Long id) {
        Exam exam = examService.getExamById(id);
        return ResponseEntity.ok(exam);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<?> createExam(@RequestBody Exam exam) {
        try {
            Exam createdExam = examService.createExam(exam);
            return ResponseEntity.ok(createdExam);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating exam: " + e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Exam> updateExam(@PathVariable Long id, @RequestBody Exam exam) {
        Exam updatedExam = examService.updateExam(id, exam);
        return ResponseEntity.ok(updatedExam);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<?> deleteExam(@PathVariable Long id) {
        try {
            examService.deleteExam(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting exam: " + e.getMessage());
        }
    }
    
    @GetMapping("/created-by/{createdBy}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<Exam>> getExamsByCreatedBy(@PathVariable Long createdBy) {
        List<Exam> exams = examService.getExamsByCreatedBy(createdBy);
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<List<Exam>> getExamsByStatus(@PathVariable ExamStatus status) {
        List<Exam> exams = examService.getExamsByStatus(status);
        return ResponseEntity.ok(exams);
    }
    
    @PutMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Exam> publishExam(@PathVariable Long id) {
        Exam exam = examService.publishExam(id);
        return ResponseEntity.ok(exam);
    }
    
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Exam> activateExam(@PathVariable Long id) {
        Exam exam = examService.activateExam(id);
        return ResponseEntity.ok(exam);
    }
    
    @PutMapping("/{id}/unpublish")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    public ResponseEntity<Exam> unpublishExam(@PathVariable Long id) {
        Exam exam = examService.unpublishExam(id);
        return ResponseEntity.ok(exam);
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Exam>> getActiveExams() {
        List<Exam> exams = examService.getActiveExams();
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/upcoming")
    public ResponseEntity<List<Exam>> getUpcomingExams() {
        List<Exam> exams = examService.getUpcomingExams();
        return ResponseEntity.ok(exams);
    }
    
    @GetMapping("/completed")
    public ResponseEntity<List<Exam>> getCompletedExams() {
        List<Exam> exams = examService.getCompletedExams();
        return ResponseEntity.ok(exams);
    }
    
    @PutMapping("/{examId}/update-total-marks")
    public ResponseEntity<Void> updateExamTotalMarks(@PathVariable Long examId, @RequestParam Integer totalMarks) {
        examService.updateTotalMarks(examId, totalMarks);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Exam Service is running!");
    }
}
