package com.example.authservice.repository;

import com.example.authservice.entity.AuthSession;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthSessionRepository extends JpaRepository<AuthSession, Long> {

    Optional<AuthSession> findByToken(String token);

    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
