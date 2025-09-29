package com.examportal.notificationservice.service;

import com.examportal.notificationservice.client.ExamClient;
import com.examportal.notificationservice.client.UserClient;
import com.examportal.notificationservice.entity.Notification;
import com.examportal.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private UserClient userClient;
    
    @Autowired
    private ExamClient examClient;
    
    @Autowired
    private FallbackNotificationService fallbackService;
    
    public String notifyExamPublished(Long examId) {
        try {
            System.out.println("📧 NotificationService: Starting notification process for exam ID: " + examId);
            
            String examTitle = "Exam " + examId; // Fallback title
            List<Map<String, Object>> students = null;
            
            // Try to get exam details and students, but continue even if it fails
            try {
                Map<String, Object> exam = examClient.getExamById(examId);
                examTitle = (String) exam.get("title");
                System.out.println("📧 NotificationService: Retrieved exam title: " + examTitle);
            } catch (Exception e) {
                System.err.println("⚠️ NotificationService: Failed to get exam details: " + e.getMessage());
            }
            
            try {
                students = userClient.getAllStudents();
                System.out.println("📧 NotificationService: Found " + students.size() + " students");
            } catch (Exception e) {
                System.err.println("⚠️ NotificationService: Feign failed, trying fallback: " + e.getMessage());
                return fallbackService.notifyExamPublishedFallback(examId);
            }
            
            if (students == null || students.isEmpty()) {
                return "No students found to notify";
            }
            
            int notificationCount = 0;
            // Create notifications for all students
            for (Map<String, Object> student : students) {
                try {
                    Long userId = ((Number) student.get("id")).longValue();
                    String username = (String) student.get("username");
                    
                    Notification notification = new Notification(
                        userId,
                        examId,
                        "New Exam Published",
                        "A new exam '" + examTitle + "' has been published and is now available for you to take.",
                        "EXAM_PUBLISHED"
                    );
                    
                    notificationRepository.save(notification);
                    notificationCount++;
                    System.out.println("📧 NotificationService: Created notification for student: " + username + " (ID: " + userId + ")");
                } catch (Exception e) {
                    System.err.println("⚠️ NotificationService: Failed to create notification for student: " + e.getMessage());
                }
            }
            
            String result = "Notifications sent to " + notificationCount + " students";
            System.out.println("📧 NotificationService: " + result);
            return result;
        } catch (Exception e) {
            System.err.println("❌ NotificationService Error: " + e.getMessage());
            e.printStackTrace();
            return "Error sending notifications: " + e.getMessage();
        }
    }
    
    public List<Notification> getNotificationsByUser(Long userId) {
        try {
            return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        } catch (Exception e) {
            System.err.println("❌ Error fetching notifications for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            // Return empty list instead of throwing exception
            return List.of();
        }
    }
    
    public List<Notification> getUnreadNotificationsByUser(Long userId) {
        try {
            return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        } catch (Exception e) {
            System.err.println("❌ Error fetching unread notifications for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            // Return empty list instead of throwing exception
            return List.of();
        }
    }
    
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElse(null);
        if (notification != null) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }
    
    public String testStudentFetch() {
        try {
            System.out.println("🔍 Testing student fetch...");
            List<Map<String, Object>> students = userClient.getAllStudents();
            StringBuilder result = new StringBuilder();
            result.append("Found ").append(students.size()).append(" students:\n");
            for (Map<String, Object> student : students) {
                result.append("- ID: ").append(student.get("id"))
                      .append(", Username: ").append(student.get("username"))
                      .append(", Role: ").append(student.get("role")).append("\n");
            }
            System.out.println("✅ Student fetch successful");
            return result.toString();
        } catch (Exception e) {
            System.err.println("❌ Student fetch failed: " + e.getMessage());
            e.printStackTrace();
            return "Error fetching students: " + e.getClass().getSimpleName() + " - " + e.getMessage();
        }
    }
    
    public String createTestNotification(Long userId) {
        try {
            Notification notification = new Notification(
                userId,
                999L, // Test exam ID
                "Test Notification",
                "This is a test notification to verify the system is working.",
                "TEST"
            );
            
            notificationRepository.save(notification);
            return "Test notification created successfully for user ID: " + userId;
        } catch (Exception e) {
            return "Error creating test notification: " + e.getMessage();
        }
    }
    
    public long getNotificationCount() {
        return notificationRepository.count();
    }
    
    public NotificationRepository getNotificationRepository() {
        return notificationRepository;
    }
}