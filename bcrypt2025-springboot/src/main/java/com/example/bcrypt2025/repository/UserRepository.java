package com.example.bcrypt2025.repository;

import com.example.bcrypt2025.model.user.User;


import com.example.bcrypt2025.model.enums.Role;
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
