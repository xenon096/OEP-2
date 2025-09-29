package com.examportal.examservice;

import com.examportal.examservice.entity.Exam;
import com.examportal.examservice.entity.ExamStatus;
import com.examportal.examservice.repository.ExamRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import java.time.LocalDateTime;
import java.util.List;

@SpringBootApplication
@EnableMethodSecurity(prePostEnabled = true)
@EnableFeignClients
public class ExamServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExamServiceApplication.class, args);
    }

    @Bean
    CommandLineRunner normalizeStatuses(ExamRepository examRepository) {
        return args -> {
            List<Exam> published = examRepository.findByStatus(ExamStatus.PUBLISHED);
            for (Exam exam : published) {
                exam.setStatus(ExamStatus.ACTIVE);
                if (exam.getStartTime() == null) {
                    exam.setStartTime(LocalDateTime.now());
                }
                if (exam.getEndTime() == null && exam.getDurationMinutes() != null) {
                    exam.setEndTime(exam.getStartTime().plusMinutes(exam.getDurationMinutes()));
                }
                examRepository.save(exam);
            }
        };
    }
}
