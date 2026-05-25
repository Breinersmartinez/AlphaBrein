package com.example.bcrypt2025.chatMessage.DTO;

import java.time.LocalDateTime;

public class ChatMessageDto {
    private Long id;
    private String sender;
    private String mensaje;
    private LocalDateTime fechaEnvio;

    public ChatMessageDto(Long id, String sender, String mensaje, LocalDateTime fechaEnvio) {
        this.id = id;
        this.sender = sender;
        this.mensaje = mensaje;
        this.fechaEnvio = fechaEnvio;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getSender() {
        return sender;
    }

    public String getMensaje() {
        return mensaje;
    }

    public LocalDateTime getFechaEnvio() {
        return fechaEnvio;
    }
}
