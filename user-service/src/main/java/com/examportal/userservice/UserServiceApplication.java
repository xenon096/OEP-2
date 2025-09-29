package com.examportal.userservice;

import com.examportal.userservice.entity.Role;
import com.examportal.userservice.entity.User;
import com.examportal.userservice.repository.UserRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableMethodSecurity(prePostEnabled = true)
@EnableFeignClients
public class UserServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(UserServiceApplication.class, args);
	}

	@Bean
	public CommandLineRunner updateAdminPassword(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.countByRole(Role.ADMIN) == 0) {
				User admin = new User();
				admin.setUsername("admin");
				admin.setEmail("admin@gmail.com");
				admin.setPassword(passwordEncoder.encode("Admin123!"));
				admin.setRole(Role.ADMIN);
				admin.setActive(true);
				userRepository.save(admin);
			}
		};
	}
}
