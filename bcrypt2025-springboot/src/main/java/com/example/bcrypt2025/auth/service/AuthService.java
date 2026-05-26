package com.example.bcrypt2025.auth.service;

import com.example.bcrypt2025.auth.DTO.AuthResponse;
import com.example.bcrypt2025.auth.DTO.LoginRequest;
import com.example.bcrypt2025.user.DTO.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

}
