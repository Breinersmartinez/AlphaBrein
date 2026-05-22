package com.example.bcrypt2025.repository.agent;

import com.example.bcrypt2025.model.agent.ChatMessage;
import com.example.bcrypt2025.model.agent.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatSessionOrderByFechaEnvioAsc(ChatSession chatSession);
}