package com.examportal.userservice.repository;

import com.examportal.userservice.entity.User;
import com.examportal.userservice.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
	Optional<User> findByUsername(String username);
	Optional<User> findByEmail(String email);
	boolean existsByUsername(String username);
	boolean existsByEmail(String email);
	long countByRole(Role role);
	List<User> findByRole(Role role);
	Page<User> findByRole(Role role, Pageable pageable);
	Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);
}
