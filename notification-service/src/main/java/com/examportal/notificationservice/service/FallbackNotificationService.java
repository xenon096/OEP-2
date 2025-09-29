package com.examportal.notificationservice.service;

import com.examportal.notificationservice.entity.Notification;
import com.examportal.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class FallbackNotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    private final RestTemplate restTemplate = new RestTemplate();
    
    public String notifyExamPublishedFallback(Long examId) {
        try {
            System.out.println("🔔 FallbackNotificationService: Starting notification for exam ID: " + examId);
            
            // Try to get students via direct HTTP call
            List<Map<String, Object>> students = null;
            try {
                String userServiceUrl = "http://localhost:8081/api/users/students";
                students = restTemplate.getForObject(userServiceUrl, List.class);
                System.out.println("🔔 FallbackNotificationService: Found " + (students != null ? students.size() : 0) + " students");
            } catch (Exception e) {
                System.err.println("⚠️ FallbackNotificationService: Failed to get students via HTTP: " + e.getMessage());
                // Create a test notification for user ID 1 (assuming admin exists)
                return createSingleTestNotification(examId, 1L);
            }
            
            if (students == null || students.isEmpty()) {
                return "No students found to notify";
            }
            
            int notificationCount = 0;
            for (Map<String, Object> student : students) {
                try {
                    Object idObj = student.get("id");
                    Long userId = idObj instanceof Integer ? ((Integer) idObj).longValue() : (Long) idObj;
                    String username = (String) student.get("username");
                    
                    Notification notification = new Notification(
                        userId,
                        examId,
                        "New Exam Published",
                        "A new exam has been published and is now available for you to take.",
                        "EXAM_PUBLISHED"
                    );
                    
                    notificationRepository.save(notification);
                    notificationCount++;
                    System.out.println("🔔 FallbackNotificationService: Created notification for: " + username);
                } catch (Exception e) {
                    System.err.println("⚠️ FallbackNotificationService: Failed to create notification: " + e.getMessage());
                }
            }
            
            String result = "Notifications sent to " + notificationCount + " students (fallback method)";
            System.out.println("🔔 FallbackNotificationService: " + result);
            return result;
        } catch (Exception e) {
            System.err.println("❌ FallbackNotificationService Error: " + e.getMessage());
            return "Error: " + e.getMessage();
        }
    }
    
    private String createSingleTestNotification(Long examId, Long userId) {
        try {
            Notification notification = new Notification(
                userId,
                examId,
                "New Exam Published",
                "A new exam has been published and is now available.",
                "EXAM_PUBLISHED"
            );
            
            notificationRepository.save(notification);
            return "Test notification created for user " + userId + " (fallback)";
        } catch (Exception e) {
            return "Failed to create test notification: " + e.getMessage();
        }
    }
}