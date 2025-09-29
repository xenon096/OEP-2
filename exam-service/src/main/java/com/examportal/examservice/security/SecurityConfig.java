package com.examportal.examservice.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;

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
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/exams/health").permitAll()
                .requestMatchers("/api/exams/debug-token").permitAll()
                .requestMatchers("/api/exams/test-auth").permitAll()
                .requestMatchers("/api/exams/active").permitAll()
                .requestMatchers("/api/exams/upcoming").permitAll()
                .requestMatchers("/api/exams/completed").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/exams/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/exams").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/exams").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.PUT, "/api/exams/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers(HttpMethod.DELETE, "/api/exams/**").hasAnyRole("ADMIN", "TEACHER")
                .anyRequest().authenticated()
            )
            .exceptionHandling().authenticationEntryPoint(jwtAuthenticationEntryPoint)
            .and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        // Add JWT filter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
