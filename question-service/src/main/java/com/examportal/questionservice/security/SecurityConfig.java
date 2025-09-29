package com.examportal.questionservice.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/questions/health").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/questions/exam/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/questions/exam/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/questions/*").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/questions/import-csv").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/questions").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/questions/**").hasAnyRole("ADMIN", "TEACHER")
                .anyRequest().authenticated()
            )
            .exceptionHandling().authenticationEntryPoint(jwtAuthenticationEntryPoint)
            .and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
