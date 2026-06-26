package com.example.authservice.dto;

public class LoginResponse {

    private String message;
    private String token;
    private String username;
    private Long userId;

    public LoginResponse() {
    }

    public LoginResponse(String message, String token, String username, Long userId) {
        this.message = message;
        this.token = token;
        this.username = username;
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
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
