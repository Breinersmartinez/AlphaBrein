package com.example.bcrypt2025.chatSession.service.impl;


import com.example.bcrypt2025.chatMessage.DTO.ChatMessageDto;
import com.example.bcrypt2025.chatSession.DTO.ChatSessionDetailDto;
import com.example.bcrypt2025.chatMessage.model.ChatMessage;
import com.example.bcrypt2025.chatSession.model.ChatSession;
import com.example.bcrypt2025.user.model.User;
import com.example.bcrypt2025.chatMessage.repository.ChatMessageRepository;
import com.example.bcrypt2025.chatSession.repository.ChatSessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Value("${n8n.webhook.url}")
    private  String N8N_WEBHOOK;


    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final RestTemplate restTemplate;


    public ChatService(ChatSessionRepository chatSessionRepository,
                       ChatMessageRepository chatMessageRepository,
                       RestTemplate restTemplate) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.restTemplate = restTemplate;
    }

    // Crear o obtener sesión para un usuario
    public ChatSession getOrCreateSession(User user) {
        // Siempre crea una nueva sesión
        String sessionId = UUID.randomUUID().toString();
        String n8nSessionId = UUID.randomUUID().toString(); // UUID distinto para n8n
        ChatSession session = new ChatSession(sessionId, user, n8nSessionId);
        return chatSessionRepository.save(session);
    }

    // Enviar mensaje a n8n y guardar en BD
    public String sendMessageToN8n(String sessionId, String chatInput) {
        ChatSession session = chatSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada"));

        // Guardar mensaje del usuario
        ChatMessage userMessage = new ChatMessage(session, "USER", chatInput);
        chatMessageRepository.save(userMessage);

        // Actualizar última actividad
        session.setFechaUltimaInteraccion(LocalDateTime.now());
        session.setUpdatedAt(LocalDateTime.now());
        chatSessionRepository.save(session);

        // Construir el cuerpo para n8n
        Map<String, String> body = new HashMap<>();
        body.put("sessionId", session.getN8nSessionId());
        body.put("action", "sendMessage");
        body.put("chatInput", chatInput);

        try {
            String response = restTemplate.postForObject(N8N_WEBHOOK, body, String.class);

            // Guardar respuesta del agente
            ChatMessage agentMessage = new ChatMessage(session, "AGENT", response);
            chatMessageRepository.save(agentMessage);

            return response;
        } catch (Exception e) {
            throw new RuntimeException("Error al comunicarse con n8n: " + e.getMessage());
        }
    }

    // Obtener historial de una sesión
    public ChatSessionDetailDto getSessionHistory(String sessionId, User user) {
        ChatSession session = chatSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada"));

        // Verificar que el usuario sea dueño de la sesión
        if (!session.getUser().getIdCard().equals(user.getIdCard())) {
            throw new RuntimeException("No tienes permiso para ver esta sesión");
        }

        List<ChatMessage> messages = chatMessageRepository.findByChatSessionOrderByFechaEnvioAsc(session);
        List<ChatMessageDto> messageDtos = messages.stream()
                .map(m -> new ChatMessageDto(m.getId(), m.getSender(), m.getMensaje(), m.getFechaEnvio()))
                .collect(Collectors.toList());

        return new ChatSessionDetailDto(
                session.getId(),
                session.getSessionId(),
                session.getTitulo(),
                session.getFechaInicio(),
                session.getFechaUltimaInteraccion(),
                session.getActiva(),
                messageDtos
        );
    }

    // Obtener todas las sesiones de un usuario
    public List<ChatSession> getUserSessions(User user) {
        return chatSessionRepository.findByUserAndActiva(user, true);
    }

    // Cerrar sesión
    public void closeSession(String sessionId, User user) {
        ChatSession session = chatSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada"));

        if (!session.getUser().getIdCard().equals(user.getIdCard())) {
            throw new RuntimeException("No tienes permiso");
        }

        session.setActiva(false);
        session.setUpdatedAt(LocalDateTime.now());

        chatSessionRepository.save(session);
    }
}