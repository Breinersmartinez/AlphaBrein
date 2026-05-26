package com.example.bcrypt2025.user.controller;

import com.example.bcrypt2025.user.DTO.UpdateUserRequest;
import com.example.bcrypt2025.user.DTO.UserResponse;
import com.example.bcrypt2025.user.enums.Role;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface UserController {

    ResponseEntity<List<UserResponse>> getAllUsers();

    ResponseEntity<UserResponse> getUserById( Integer idCard);


    ResponseEntity<UserResponse> getCurrentUser(Authentication authentication);


    ResponseEntity<List<UserResponse>> getActiveUsers();


    ResponseEntity<List<UserResponse>> getUsersByRole( Role role);


    ResponseEntity<UserResponse> updateUser(
             Integer idCard,
            UpdateUserRequest request,
            Authentication authentication
    );


    ResponseEntity<UserResponse> deactivateUser( Integer idCard);


    ResponseEntity<UserResponse> activateUser(@PathVariable Integer idCard);


}
