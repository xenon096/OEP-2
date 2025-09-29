package com.examportal.userservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "result-service")
public interface ResultServiceClient {
    
    @DeleteMapping("/api/results/user/{userId}")
    void deleteResultsByUserId(@PathVariable("userId") Long userId);
}