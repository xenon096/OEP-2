package com.examportal.userservice.service;

import com.examportal.userservice.client.ExamSessionServiceClient;
import com.examportal.userservice.client.NotificationServiceClient;
import com.examportal.userservice.client.ResultServiceClient;
import com.examportal.userservice.entity.Role;
import com.examportal.userservice.entity.User;
import com.examportal.userservice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private ResultServiceClient resultServiceClient;
    
    @Autowired
    private ExamSessionServiceClient examSessionServiceClient;
    
    @Autowired
    private NotificationServiceClient notificationServiceClient;
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }
    
    public Page<User> getUsersByRole(Role role, Pageable pageable) {
        return userRepository.findByRole(role, pageable);
    }
    
    public Page<User> searchUsers(String username, Pageable pageable) {
        return userRepository.findByUsernameContainingIgnoreCase(username, pageable);
    }
    
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }
    
    public User createUser(User user) {
        // Check for duplicate username or email
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists: " + user.getUsername());
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }
        
        // Only block creation of additional ADMIN users
        if (user.getRole() == Role.ADMIN && userRepository.countByRole(Role.ADMIN) >= 1) {
            throw new RuntimeException("Only one ADMIN user is allowed");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        boolean isPromotingToAdmin = user.getRole() != Role.ADMIN && userDetails.getRole() == Role.ADMIN;
        if (isPromotingToAdmin && userRepository.countByRole(Role.ADMIN) >= 1) {
            throw new RuntimeException("Only one ADMIN user is allowed");
        }
        
        // Check for duplicate username or email (excluding current user)
        if (!user.getUsername().equals(userDetails.getUsername()) && 
            userRepository.existsByUsername(userDetails.getUsername())) {
            throw new RuntimeException("Username already exists: " + userDetails.getUsername());
        }
        if (!user.getEmail().equals(userDetails.getEmail()) && 
            userRepository.existsByEmail(userDetails.getEmail())) {
            throw new RuntimeException("Email already exists: " + userDetails.getEmail());
        }
        
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
            String raw = userDetails.getPassword();
            if (!raw.startsWith("$2a$") && !raw.startsWith("$2b$") && !raw.startsWith("$2y$")) {
                user.setPassword(passwordEncoder.encode(raw));
            } else {
                user.setPassword(raw);
            }
        }
        user.setRole(userDetails.getRole());
        user.setActive(userDetails.isActive());
        return userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        User user = getUserById(id);
        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot delete the ADMIN user");
        }
        
        // Delete related data from other services
        try {
            resultServiceClient.deleteResultsByUserId(id);
        } catch (Exception e) {
            System.err.println("Failed to delete results for user " + id + ": " + e.getMessage());
        }
        
        try {
            examSessionServiceClient.deleteExamSessionsByUserId(id);
        } catch (Exception e) {
            System.err.println("Failed to delete exam sessions for user " + id + ": " + e.getMessage());
        }
        
        try {
            notificationServiceClient.deleteNotificationsByUserId(id);
        } catch (Exception e) {
            System.err.println("Failed to delete notifications for user " + id + ": " + e.getMessage());
        }
        
        // Finally delete the user
        userRepository.deleteById(id);
    }
    
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }
    
    public List<User> getStudents() {
        return userRepository.findByRole(Role.STUDENT);
    }
}
