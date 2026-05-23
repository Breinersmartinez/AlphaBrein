package com.example.bcrypt2025.model.agent;

import com.example.bcrypt2025.model.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "CHAT_SESSION")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "SESSION_ID", unique = true, nullable = false)
    private String sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    @JsonIgnore  // Ignora la serialización del usuario
    private User user;

    @Column(name = "N8N_SESSION_ID", nullable = false)
    private String n8nSessionId;

    @Column(name = "TITULO")
    private String titulo;

    @Column(name = "FECHA_INICIO", nullable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "FECHA_ULTIMA_INTERACCION")
    private LocalDateTime fechaUltimaInteraccion;

    @Column(name = "ACTIVA")
    private Boolean activa = true;

    @Column(name = "CREATED_AT")
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    public ChatSession() {
    }

    public ChatSession(String sessionId, User user, String n8nSessionId) {
        this.sessionId = sessionId;
        this.user = user;
        this.n8nSessionId = n8nSessionId;
        this.fechaInicio = LocalDateTime.now();
        this.fechaUltimaInteraccion = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.activa = true;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getN8nSessionId() {
        return n8nSessionId;
    }

    public void setN8nSessionId(String n8nSessionId) {
        this.n8nSessionId = n8nSessionId;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaUltimaInteraccion() {
        return fechaUltimaInteraccion;
    }

    public void setFechaUltimaInteraccion(LocalDateTime fechaUltimaInteraccion) {
        this.fechaUltimaInteraccion = fechaUltimaInteraccion;
    }

    public Boolean getActiva() {
        return activa;
    }

    public void setActiva(Boolean activa) {
        this.activa = activa;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}