package com.example.todoservice.client;

import com.example.todoservice.dto.TokenValidationResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Component
public class AuthServiceClient {

    private final RestTemplate restTemplate;

    public AuthServiceClient(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${auth.service.url:http://localhost:8081}") String authServiceUrl) {
        this.restTemplate = restTemplateBuilder.rootUri(authServiceUrl).build();
    }

    public boolean isTokenValid(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return false;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, authorizationHeader);

        try {
            ResponseEntity<TokenValidationResponse> response = restTemplate.exchange(
                    "/auth/validate",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    TokenValidationResponse.class);

            TokenValidationResponse body = response.getBody();
            return response.getStatusCode().is2xxSuccessful()
                    && body != null
                    && body.isValid();
        } catch (HttpClientErrorException exception) {
            return false;
        }
    }
}
