package com.example.bcrypt2025.user.controller.impl;

import com.example.bcrypt2025.user.DTO.UpdateUserRequest;
import com.example.bcrypt2025.user.DTO.UserResponse;


import com.example.bcrypt2025.user.controller.UserController;
import com.example.bcrypt2025.user.enums.Role;
import com.example.bcrypt2025.user.service.impl.UserServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserControllerImpl implements UserController {

    private final UserServiceImpl userServiceImpl;

    public UserControllerImpl(UserServiceImpl userServiceImpl) {
        this.userServiceImpl = userServiceImpl;
    }

    // Obtener todos los usuarios (solo admin)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        try {
            List<UserResponse> users = userServiceImpl.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener usuario por ID (admin o el mismo usuario)
    //     Tanto los usuarios como los administradores pueden realizar peticiones
//     Los usuarios y administradores deben utilizar su respectivo tockend para poder realizar las peticiones

    @GetMapping("/{idCard}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Integer idCard) {
        try {
            UserResponse user = userServiceImpl.getUserById(idCard);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Obtener perfil del usuario autenticado
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        try {
            String email = authentication.getName();
            UserResponse user = userServiceImpl.getUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Obtener usuarios activos (solo admin)
    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getActiveUsers() {
        try {
            List<UserResponse> users = userServiceImpl.getActiveUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Obtener usuarios por rol (solo admin)
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable Role role) {
        try {
            List<UserResponse> users = userServiceImpl.getUsersByRole(role);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // Actualizar usuario (admin o el mismo usuario)
    @PutMapping("/{idCard}")
    @PreAuthorize("hasRole('ADMIN') or #idCard == authentication.principal.idCard")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Integer idCard,
            @RequestBody UpdateUserRequest request,
            Authentication authentication
    ) {
        try {
            // Si no es admin, no puede cambiar el rol ni el estado activo
            if (!authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                request.setRole(null);
                request.setActive(null);
            }

            UserResponse updatedUser = userServiceImpl.updateUser(idCard, request);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Eliminar usuario físicamente (solo admin)
    @DeleteMapping("/{idCard}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer idCard) {
        try {
            userServiceImpl.deleteUser(idCard);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Desactivar usuario (eliminación lógica - solo admin)
    @PatchMapping("/{idCard}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable Integer idCard) {
        try {
            UserResponse user = userServiceImpl.deactivateUser(idCard);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Activar usuario (solo admin)
    @PatchMapping("/{idCard}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> activateUser(@PathVariable Integer idCard) {
        try {
            UserResponse user = userServiceImpl.activateUser(idCard);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
