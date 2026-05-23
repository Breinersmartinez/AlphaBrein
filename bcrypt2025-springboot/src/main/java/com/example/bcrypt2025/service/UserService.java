package com.example.bcrypt2025.service;


import com.example.bcrypt2025.dto.userDTO.UpdateUserRequest;
import com.example.bcrypt2025.dto.userDTO.UserResponse;

import com.example.bcrypt2025.model.user.User;
import com.example.bcrypt2025.model.enums.Role;
import com.example.bcrypt2025.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service

public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Obtener todos los usuarios
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Obtener usuario por ID
    public UserResponse getUserById(Integer idCard) {
        User user = userRepository.findById(idCard)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idCard));
        return convertToResponse(user);
    }

    // Obtener usuario por email
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + email));
        return convertToResponse(user);
    }

    // Actualizar usuario
    @Transactional
    public UserResponse updateUser(Integer idCard, UpdateUserRequest request) {
        User user = userRepository.findById(idCard)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idCard));

        // Actualizar solo los campos que no son nulos
        if (request.getFirstName() != null && !request.getFirstName().isEmpty()) {
            user.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null && !request.getLastName().isEmpty()) {
            user.setLastName(request.getLastName());
        }

        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            // Verificar que el email no esté en uso por otro usuario
            userRepository.findByEmail(request.getEmail())
                    .ifPresent(existingUser -> {
                        if (!existingUser.getIdCard().equals(idCard)) {
                            throw new RuntimeException("El email ya está en uso");
                        }
                    });
            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }

        if (request.getDirection() != null) {
            user.setDirection(request.getDirection());
        }

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }

    // Eliminar usuario (eliminación física)
    @Transactional
    public void deleteUser(Integer idCard) {
        User user = userRepository.findById(idCard)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idCard));
        userRepository.delete(user);
    }

    // Desactivar usuario (eliminación lógica - recomendado)
    @Transactional
    public UserResponse deactivateUser(Integer idCard) {
        User user = userRepository.findById(idCard)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idCard));
        user.setActive(false);
        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }

    // Activar usuario
    @Transactional
    public UserResponse activateUser(Integer idCard) {
        User user = userRepository.findById(idCard)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idCard));
        user.setActive(true);
        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }

    // Obtener usuarios activos
    public List<UserResponse> getActiveUsers() {
        return userRepository.findByActive(true).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Obtener usuarios por rol
    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Convertir User a UserResponse (sin exponer la contraseña)
    private UserResponse convertToResponse(User user) {
        return UserResponse.builder()
                .idCard(user.getIdCard())
                .identificationType(user.getIdentificationType())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .direction(user.getDirection())
                .role(user.getRole())
                .registrationDate(user.getRegistrationDate())
                .active(user.getActive())
                .build();
    }
}
