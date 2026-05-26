package com.example.bcrypt2025.auth.controller.impl;

import com.example.bcrypt2025.auth.DTO.AuthResponse;
import com.example.bcrypt2025.auth.DTO.LoginRequest;
import com.example.bcrypt2025.auth.controller.AuthController;
import com.example.bcrypt2025.user.DTO.RegisterRequest;
import com.example.bcrypt2025.auth.service.impl.AuthServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/auth")

public class AuthControllerImpl implements AuthController {

    private final AuthServiceImpl authServiceImpl;

    public AuthControllerImpl(AuthServiceImpl authServiceImpl) {
        this.authServiceImpl = authServiceImpl;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authServiceImpl.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(AuthResponse.builder()
                            .message(e.getMessage())
                            .build());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authServiceImpl.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(AuthResponse.builder()
                            .message("Credenciales inválidas")
                            .build());
        }
    }
}
