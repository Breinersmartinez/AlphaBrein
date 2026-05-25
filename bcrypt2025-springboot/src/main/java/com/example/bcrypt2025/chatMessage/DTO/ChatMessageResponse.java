package com.example.bcrypt2025.chatMessage.DTO;

public class ChatMessageResponse {
    private String sessionId;
    private String message;
    private String response;

    public ChatMessageResponse(String sessionId, String message, String response) {
        this.sessionId = sessionId;
        this.message = message;
        this.response = response;
    }

    public String getSessionId() {
        return sessionId;
    }

    public String getMessage() {
        return message;
    }

    public String getResponse() {
        return response;
    }
}
