package com.example.bcrypt2025.chatMessage.repository;

import com.example.bcrypt2025.chatMessage.model.ChatMessage;
import com.example.bcrypt2025.chatSession.model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatSessionOrderByFechaEnvioAsc(ChatSession chatSession);
}