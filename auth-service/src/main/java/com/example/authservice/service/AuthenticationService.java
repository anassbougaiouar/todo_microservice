package com.example.authservice.service;

import com.example.authservice.client.UserServiceClient;
import com.example.authservice.dto.LoginRequest;
import com.example.authservice.dto.LoginResponse;
import com.example.authservice.dto.TokenValidationResponse;
import com.example.authservice.dto.UserSummary;
import com.example.authservice.entity.AuthSession;
import com.example.authservice.repository.AuthSessionRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {

    private final UserServiceClient userServiceClient;
    private final AuthSessionRepository authSessionRepository;
    private final long tokenTtlMinutes;

    public AuthenticationService(
            UserServiceClient userServiceClient,
            AuthSessionRepository authSessionRepository,
            @Value("${auth.token.ttl-minutes:120}") long tokenTtlMinutes) {
        this.userServiceClient = userServiceClient;
        this.authSessionRepository = authSessionRepository;
        this.tokenTtlMinutes = tokenTtlMinutes;
    }

    public LoginResponse login(LoginRequest request) {
        cleanupExpiredTokens();

        UserSummary user = userServiceClient.verifyCredentials(request);

        if (user == null) {
            return null;
        }

        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(tokenTtlMinutes);

        AuthSession session = new AuthSession();
        session.setToken(token);
        session.setUsername(user.getUsername());
        session.setUserId(user.getId());
        session.setExpiresAt(expiresAt);

        authSessionRepository.save(session);

        return new LoginResponse("Login reussi", token, user.getUsername(), user.getId());
    }

    public TokenValidationResponse validateToken(String authorizationHeader) {
        cleanupExpiredTokens();

        String token = extractToken(authorizationHeader);

        if (token == null) {
            return new TokenValidationResponse(false, null, null);
        }

        return authSessionRepository.findByToken(token)
                .filter(session -> session.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(session -> new TokenValidationResponse(true, session.getUsername(), session.getUserId()))
                .orElseGet(() -> new TokenValidationResponse(false, null, null));
    }

    private void cleanupExpiredTokens() {
        authSessionRepository.deleteByExpiresAtBefore(LocalDateTime.now());
    }

    private String extractToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authorizationHeader.substring(7).trim();
        return token.isEmpty() ? null : token;
    }
}
