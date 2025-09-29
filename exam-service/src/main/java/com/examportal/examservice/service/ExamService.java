package com.examportal.examservice.service;

import com.examportal.examservice.client.NotificationClient;
import com.examportal.examservice.client.QuestionClient;
import com.examportal.examservice.entity.Exam;
import com.examportal.examservice.entity.ExamStatus;
import com.examportal.examservice.repository.ExamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ExamService {
    
    @Autowired
    private ExamRepository examRepository;
    
    @Autowired
    private NotificationClient notificationClient;
    
    @Autowired
    private QuestionClient questionClient;
    
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }
    
    public Page<Exam> getAllExams(Pageable pageable) {
        return examRepository.findAll(pageable);
    }
    
    public Page<Exam> getExamsByStatus(ExamStatus status, Pageable pageable) {
        return examRepository.findByStatus(status, pageable);
    }
    
    public Page<Exam> searchExams(String title, Pageable pageable) {
        return examRepository.findByTitleContainingIgnoreCase(title, pageable);
    }
    
    public Exam getExamById(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));
    }
    
    public Exam createExam(Exam exam) {
        exam.setCreatedAt(LocalDateTime.now());
        exam.setUpdatedAt(LocalDateTime.now());
        exam.setStatus(ExamStatus.DRAFT);
        
        // Auto-calculate passing marks as totalMarks/2
        if (exam.getTotalMarks() != null) {
            exam.setPassingMarks(exam.getTotalMarks() / 2);
        }
        
        return examRepository.save(exam);
    }
    
    public Exam updateExam(Long id, Exam examDetails) {
        Exam exam = getExamById(id);
        exam.setTitle(examDetails.getTitle());
        exam.setDescription(examDetails.getDescription());
        exam.setDurationMinutes(examDetails.getDurationMinutes());
        exam.setTotalMarks(examDetails.getTotalMarks());
        exam.setMaxAttempts(examDetails.getMaxAttempts());
        exam.setStartTime(examDetails.getStartTime());
        exam.setEndTime(examDetails.getEndTime());
        exam.setUpdatedAt(LocalDateTime.now());
        
        // Auto-calculate passing marks as totalMarks/2
        if (examDetails.getTotalMarks() != null) {
            exam.setPassingMarks(examDetails.getTotalMarks() / 2);
        }
        
        return examRepository.save(exam);
    }
    
    @Transactional
    public void deleteExam(Long id) {
        System.out.println("Starting deletion process for exam: " + id);
        
        // First try to delete questions via question service
        try {
            System.out.println("Attempting to delete questions via question service...");
            questionClient.deleteQuestionsByExamId(id);
            System.out.println("Successfully deleted questions via question service for exam: " + id);
        } catch (Exception e) {
            System.err.println("Failed to delete questions via service: " + e.getMessage());
            // Fallback to direct database deletion
            try {
                System.out.println("Falling back to direct database deletion...");
                examRepository.deleteQuestionsByExamId(id);
                System.out.println("Successfully deleted questions via database for exam: " + id);
            } catch (Exception dbError) {
                System.err.println("Failed to delete questions via database: " + dbError.getMessage());
                throw new RuntimeException("Failed to delete questions for exam: " + id, dbError);
            }
        }
        
        // Delete the exam
        try {
            examRepository.deleteById(id);
            System.out.println("Successfully deleted exam: " + id);
        } catch (Exception e) {
            System.err.println("Failed to delete exam: " + e.getMessage());
            throw new RuntimeException("Failed to delete exam: " + id, e);
        }
    }
    
    public List<Exam> getExamsByCreatedBy(Long createdBy) {
        return examRepository.findByCreatedBy(createdBy);
    }
    
    public List<Exam> getExamsByStatus(ExamStatus status) {
        return examRepository.findByStatus(status);
    }
    
    public Exam publishExam(Long id) {
        Exam exam = getExamById(id);
        // Normalize "publish" to ACTIVE to avoid PUBLISHED vs ACTIVE confusion
        exam.setStatus(ExamStatus.ACTIVE);
        exam.setStartTime(LocalDateTime.now());
        exam.setEndTime(LocalDateTime.now().plusMinutes(exam.getDurationMinutes()));
        exam.setUpdatedAt(LocalDateTime.now());
        
        Exam savedExam = examRepository.save(exam);
        
        // Send notification to students using Feign Client
        try {
            System.out.println("📧 ExamService: Sending notification via Feign Client for exam ID: " + id);
            System.out.println("📧 ExamService: Exam title: " + savedExam.getTitle());
            String response = notificationClient.notifyExamPublished(id);
            System.out.println("📧 ExamService: Feign Client response: " + response);
        } catch (Exception e) {
            System.err.println("❌ ExamService: Failed to send notification via Feign: " + e.getMessage());
            System.err.println("❌ ExamService: Exception class: " + e.getClass().getSimpleName());
            e.printStackTrace();
        }
        
        return savedExam;
    }
    
    public Exam activateExam(Long id) {
        Exam exam = getExamById(id);
        exam.setStatus(ExamStatus.ACTIVE);
        exam.setStartTime(LocalDateTime.now());
        exam.setEndTime(LocalDateTime.now().plusMinutes(exam.getDurationMinutes()));
        exam.setUpdatedAt(LocalDateTime.now());
        return examRepository.save(exam);
    }
    
    public Exam unpublishExam(Long id) {
        Exam exam = getExamById(id);
        exam.setStatus(ExamStatus.DRAFT);
        exam.setStartTime(null);
        exam.setEndTime(null);
        exam.setUpdatedAt(LocalDateTime.now());
        return examRepository.save(exam);
    }
    
    public List<Exam> getActiveExams() {
        return examRepository.findByStatus(ExamStatus.ACTIVE);
    }
    
    public List<Exam> getUpcomingExams() {
        return examRepository.findUpcomingExams(ExamStatus.ACTIVE, LocalDateTime.now());
    }
    
    public List<Exam> getCompletedExams() {
        return examRepository.findCompletedExams(ExamStatus.ACTIVE, LocalDateTime.now());
    }
    
    public void updateTotalMarks(Long examId, Integer totalMarks) {
        Exam exam = getExamById(examId);
        exam.setTotalMarks(totalMarks);
        
        // Auto-calculate passing marks as totalMarks/2
        if (totalMarks != null) {
            exam.setPassingMarks(totalMarks / 2);
        }
        
        exam.setUpdatedAt(LocalDateTime.now());
        examRepository.save(exam);
    }
}
