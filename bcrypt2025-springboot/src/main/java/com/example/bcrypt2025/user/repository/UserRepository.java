package com.example.bcrypt2025.user.repository;

import com.example.bcrypt2025.user.model.User;


import com.example.bcrypt2025.user.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    List<User> findByActive(Boolean active);
    List<User> findByRole(Role role);
}
