package com.example.authservice.dto;

public class TokenValidationResponse {

    private boolean valid;
    private String username;
    private Long userId;

    public TokenValidationResponse() {
    }

    public TokenValidationResponse(boolean valid, String username, Long userId) {
        this.valid = valid;
        this.username = username;
        this.userId = userId;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
