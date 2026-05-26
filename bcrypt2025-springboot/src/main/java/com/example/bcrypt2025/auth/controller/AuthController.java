package com.example.bcrypt2025.auth.controller;

import com.example.bcrypt2025.auth.DTO.AuthResponse;
import com.example.bcrypt2025.auth.DTO.LoginRequest;
import com.example.bcrypt2025.user.DTO.RegisterRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

public interface AuthController {

    ResponseEntity<AuthResponse> register( RegisterRequest request);

    ResponseEntity<AuthResponse> login( LoginRequest request);
}
