package com.example.bcrypt2025.chatSession.service;

import com.example.bcrypt2025.chatSession.DTO.ChatSessionDetailDto;
import com.example.bcrypt2025.chatSession.model.ChatSession;
import com.example.bcrypt2025.user.model.User;

import java.util.List;

public interface ChatService {

    ChatSession getOrCreateSession(User user);

    String sendMessageToN8n(String sessionId, String chatInput);

    ChatSessionDetailDto getSessionHistory(String sessionId, User user);

    List<ChatSession> getUserSessions(User user);

    void closeSession(String sessionId, User user);


}
