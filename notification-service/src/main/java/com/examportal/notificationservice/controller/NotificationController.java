package com.examportal.notificationservice.controller;

import com.examportal.notificationservice.entity.Notification;
import com.examportal.notificationservice.service.NotificationService;
import com.examportal.notificationservice.service.FallbackNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private FallbackNotificationService fallbackService;
    
    @PostMapping("/exam-published/{examId}")
    public ResponseEntity<String> notifyExamPublished(@PathVariable Long examId) {
        try {
            String result = notificationService.notifyExamPublished(examId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            // Fallback: create a simple notification for testing
            try {
                Notification testNotification = new Notification(
                    1L, // Assume user ID 1 exists
                    examId,
                    "New Exam Published",
                    "A new exam has been published.",
                    "EXAM_PUBLISHED"
                );
                notificationService.getNotificationRepository().save(testNotification);
                return ResponseEntity.ok("Fallback notification created for exam " + examId);
            } catch (Exception fallbackError) {
                return ResponseEntity.ok("Error: " + e.getMessage());
            }
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByUser(@PathVariable Long userId) {
        try {
            List<Notification> notifications = notificationService.getNotificationsByUser(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("❌ Controller error fetching notifications for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of()); // Return empty list instead of error
        }
    }
    
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotificationsByUser(@PathVariable Long userId) {
        try {
            List<Notification> notifications = notificationService.getUnreadNotificationsByUser(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("❌ Controller error fetching unread notifications for user " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of()); // Return empty list instead of error
        }
    }
    
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Notification Service is running!");
    }
    
    @GetMapping("/simple-test")
    public ResponseEntity<String> simpleTest() {
        try {
            // Test database connection
            long count = notificationService.getNotificationCount();
            return ResponseEntity.ok("Service OK - Total notifications: " + count);
        } catch (Exception e) {
            return ResponseEntity.ok("Service Error: " + e.getMessage());
        }
    }
    
    @GetMapping("/test-students")
    public ResponseEntity<String> testStudents() {
        try {
            String result = notificationService.testStudentFetch();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/test-create/{userId}")
    public ResponseEntity<String> createTestNotification(@PathVariable Long userId) {
        try {
            String result = notificationService.createTestNotification(userId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/exam-published-fallback/{examId}")
    public ResponseEntity<String> notifyExamPublishedFallback(@PathVariable Long examId) {
        try {
            String result = fallbackService.notifyExamPublishedFallback(examId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }
}