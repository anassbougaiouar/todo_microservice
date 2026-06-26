package com.example.authservice.client;

import com.example.authservice.dto.LoginRequest;
import com.example.authservice.dto.UserSummary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Component
public class UserServiceClient {

    private final RestTemplate restTemplate;

    public UserServiceClient(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${user.service.url:http://localhost:5000}") String userServiceUrl) {
        this.restTemplate = restTemplateBuilder.rootUri(userServiceUrl).build();
    }

    public UserSummary verifyCredentials(LoginRequest request) {
        try {
            ResponseEntity<UserSummary> response = restTemplate.exchange(
                    "/users/verify",
                    HttpMethod.POST,
                    new HttpEntity<>(request),
                    UserSummary.class);

            return response.getBody();
        } catch (HttpClientErrorException exception) {
            return null;
        }
    }
}
