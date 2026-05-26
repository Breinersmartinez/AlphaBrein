package com.example.bcrypt2025.chatSession.controller;

import com.example.bcrypt2025.chatMessage.DTO.ChatMessageRequest;
import com.example.bcrypt2025.chatMessage.DTO.ChatMessageResponse;
import com.example.bcrypt2025.chatSession.DTO.ChatSessionDetailDto;
import com.example.bcrypt2025.chatSession.model.ChatSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

public interface ChatController {

    ResponseEntity<ChatSession> getSession(Authentication authentication);

    ResponseEntity<ChatMessageResponse> sendMessage(
             String sessionId,
             ChatMessageRequest request,
            Authentication authentication);

    ResponseEntity<ChatSessionDetailDto> getSessionHistory(
             String sessionId,
            Authentication authentication);


    ResponseEntity<List<ChatSession>> getUserSessions(Authentication authentication);


    ResponseEntity<Void> closeSession(
             String sessionId,
            Authentication authentication);


}
