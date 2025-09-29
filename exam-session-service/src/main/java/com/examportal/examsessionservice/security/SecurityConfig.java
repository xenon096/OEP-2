package com.examportal.examsessionservice.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf().disable()
            .cors().and()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/sessions/health").permitAll()
                .requestMatchers("/api/sessions/create").permitAll()
                .requestMatchers("/api/sessions/{sessionId}/start").permitAll()
                .requestMatchers("/api/sessions/{sessionId}/answer").permitAll()
                .requestMatchers("/api/sessions/{sessionId}/submit").permitAll()
                .requestMatchers("/api/sessions/{sessionId}").permitAll()
                .requestMatchers("/api/sessions/user/**").permitAll()
                .requestMatchers("/api/sessions/{sessionId}/answers").permitAll()
                .requestMatchers("/api/sessions/{sessionId}/answer/**").permitAll()
                .requestMatchers("/api/sessions/{sessionId}/time").permitAll()
                .requestMatchers("/api/sessions/{sessionId}/cancel").permitAll()
                .requestMatchers("/api/sessions/exam/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/sessions/expired").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/sessions/auto-submit-expired").hasAnyRole("ADMIN", "TEACHER")
                .anyRequest().authenticated()
            )
            .exceptionHandling().authenticationEntryPoint(jwtAuthenticationEntryPoint)
            .and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
