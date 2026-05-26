package com.example.bcrypt2025.chatSession.controller.impl;


import com.example.bcrypt2025.chatMessage.DTO.ChatMessageRequest;
import com.example.bcrypt2025.chatMessage.DTO.ChatMessageResponse;
import com.example.bcrypt2025.chatSession.DTO.ChatSessionDetailDto;
import com.example.bcrypt2025.chatSession.controller.ChatController;
import com.example.bcrypt2025.chatSession.model.ChatSession;
import com.example.bcrypt2025.chatSession.service.impl.ChatServiceImpl;
import com.example.bcrypt2025.user.model.User;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;



@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/chat")
public class ChatControllerImpl implements ChatController {

    private final ChatServiceImpl chatServiceImpl;

    public ChatControllerImpl(ChatServiceImpl chatServiceImpl) {
        this.chatServiceImpl = chatServiceImpl;
    }

    // Obtener o crear sesión
    @PostMapping("/session")
    public ResponseEntity<ChatSession> getSession(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        ChatSession session = chatServiceImpl.getOrCreateSession(user);
        return ResponseEntity.ok(session);
    }

    // Enviar mensaje
    @PostMapping("/message")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @RequestParam String sessionId,
            @RequestBody ChatMessageRequest request,
            Authentication authentication) {

        try {
            User user = (User) authentication.getPrincipal();

            String response = chatServiceImpl.sendMessageToN8n(
                    sessionId,
                    request.getChatInput()
            );

            ChatMessageResponse messageResponse = new ChatMessageResponse(
                    sessionId,
                    request.getChatInput(),
                    response
            );

            return ResponseEntity.ok(messageResponse);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    // Obtener historial de una sesión
    @GetMapping("/session/{sessionId}/history")
    public ResponseEntity<ChatSessionDetailDto> getSessionHistory(
            @PathVariable String sessionId,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            ChatSessionDetailDto history = chatServiceImpl.getSessionHistory(sessionId, user);
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Obtener todas las sesiones del usuario
    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSession>> getUserSessions(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<ChatSession> sessions = chatServiceImpl.getUserSessions(user);
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Cerrar sesión
    @PostMapping("/session/{sessionId}/close")
    public ResponseEntity<Void> closeSession(
            @PathVariable String sessionId,
            Authentication authentication) {

        try {
            User user = (User) authentication.getPrincipal();

            chatServiceImpl.closeSession(sessionId, user);

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}