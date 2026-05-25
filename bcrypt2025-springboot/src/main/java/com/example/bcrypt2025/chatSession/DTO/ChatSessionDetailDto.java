package com.example.bcrypt2025.chatSession.DTO;

import com.example.bcrypt2025.chatMessage.DTO.ChatMessageDto;

import java.time.LocalDateTime;
import java.util.List;

public class ChatSessionDetailDto {
    private Long id;
    private String sessionId;
    private String titulo;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaUltimaInteraccion;
    private Boolean activa;
    private List<ChatMessageDto> mensajes;

    public ChatSessionDetailDto(Long id, String sessionId, String titulo,
                                LocalDateTime fechaInicio, LocalDateTime fechaUltimaInteraccion,
                                Boolean activa, List<ChatMessageDto> mensajes) {
        this.id = id;
        this.sessionId = sessionId;
        this.titulo = titulo;
        this.fechaInicio = fechaInicio;
        this.fechaUltimaInteraccion = fechaUltimaInteraccion;
        this.activa = activa;
        this.mensajes = mensajes;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public String getTitulo() {
        return titulo;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public LocalDateTime getFechaUltimaInteraccion() {
        return fechaUltimaInteraccion;
    }

    public Boolean getActiva() {
        return activa;
    }

    public List<ChatMessageDto> getMensajes() {
        return mensajes;
    }
}
