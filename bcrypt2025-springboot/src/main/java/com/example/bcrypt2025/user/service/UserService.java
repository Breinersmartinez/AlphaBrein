package com.example.bcrypt2025.user.service;

import com.example.bcrypt2025.user.DTO.UpdateUserRequest;
import com.example.bcrypt2025.user.DTO.UserResponse;
import com.example.bcrypt2025.user.enums.Role;
import com.example.bcrypt2025.user.model.User;

import java.util.List;

public interface UserService {

     List<UserResponse> getAllUsers();

    UserResponse getUserById(Integer idCard);

    UserResponse getUserByEmail(String email);

    UserResponse updateUser(Integer idCard, UpdateUserRequest request);


    void deleteUser(Integer idCard);

    UserResponse deactivateUser(Integer idCard);


    UserResponse activateUser(Integer idCard);


    List<UserResponse> getActiveUsers();



    List<UserResponse> getUsersByRole(Role role);




}
