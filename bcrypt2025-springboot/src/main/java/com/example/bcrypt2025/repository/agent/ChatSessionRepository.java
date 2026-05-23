package com.example.bcrypt2025.repository.agent;

import com.example.bcrypt2025.model.agent.ChatSession;
import com.example.bcrypt2025.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    Optional<ChatSession> findBySessionId(String sessionId);

    List<ChatSession> findByUser(User user);

    List<ChatSession> findByUserAndActiva(User user, Boolean activa);

}