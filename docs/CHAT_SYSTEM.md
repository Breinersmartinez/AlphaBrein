# CHAT_SYSTEM.md - Sistema de Chat Conversacional

## 💬 Descripción General

El sistema de chat de AlphaBrein permite a usuarios abrir sesiones conversacionales que:
- Persisten en PostgreSQL (historial completo)
- Se comunican con workflows de n8n vía webhooks
- Mantienen contexto mediante IDs de sesión únicos
- Permiten recuperar historial en cualquier momento

---

## 🏗️ Componentes del Sistema de Chat

```
┌──────────────────────────────────────────┐
│      Frontend (React)                    │
│  ChatWindow Component                    │
│  AuthContext → User data                 │
│  ChatService → API calls                 │
└────────────┬─────────────────────────────┘
             │ HTTP REST
             ▼
┌──────────────────────────────────────────┐
│      Backend (Spring Boot)               │
│  ChatController                          │
│  ├─ POST /api/chat/session               │
│  ├─ POST /api/chat/message               │
│  ├─ GET /api/chat/sessions               │
│  ├─ GET /api/chat/session/{id}/history   │
│  └─ POST /api/chat/session/{id}/close    │
└────────────┬─────────────────────────────┘
             │
             ├─────────────────────────────────┐
             │                                 │
             ▼                                 ▼
┌──────────────────────┐      ┌──────────────────────┐
│   ChatService        │      │   PostgreSQL         │
│  (Business Logic)    │      │  (Persistence)       │
│                      │      │                      │
│  - CRUD operations   │      │  ├─ CHAT_SESSION     │
│  - n8n integration   │      │  ├─ CHAT_MESSAGE     │
│  - Message handling  │      │  └─ USUARIO          │
└────────┬─────────────┘      └────────┬─────────────┘
         │                             │
         │ RestTemplate                │ JPA Repos
         ▼                             │
┌──────────────────────┐              │
│   n8n Webhooks       │◄─────────────┘
│  (External AI)       │
│                      │
│  - Process message   │
│  - Generate response │
│  - Return JSON       │
└──────────────────────┘
```

---

## 📅 Ciclo de Vida de una Sesión de Chat

### Fase 1: Creación de Sesión

```
1. User abre chat (frontend)
   └─ Click "New Chat" button

2. Frontend → POST /api/chat/session
   Headers: {
     "Authorization": "Bearer <JWT>"
   }

3. ChatController.getSession()
   ├─ Extract User from Authentication
   └─ Call ChatService.getOrCreateSession(user)

4. ChatService.getOrCreateSession()
   ├─ Generate UUID sessionId
   │  └─ sessionId = UUID.randomUUID().toString()
   │     Result: "38c2a0d1-c889-48e0-9c63-a41f04cbb787"
   │
   ├─ Generate UUID n8nSessionId
   │  └─ n8nSessionId = UUID.randomUUID().toString()
   │     Result: "5f7c8b2a-1234-5678-9abc-def012345678"
   │
   ├─ Create ChatSession object
   │  ├─ sessionId = "38c2a0d1..."
   │  ├─ user = authenticated user
   │  ├─ n8nSessionId = "5f7c8b2a..."
   │  ├─ fechaInicio = NOW
   │  ├─ fechaUltimaInteraccion = NOW
   │  └─ activa = true
   │
   ├─ chatSessionRepository.save(session)
   │  └─ INSERT INTO CHAT_SESSION (...)
   │     VALUES ('38c2a0d1-...', user_id, '5f7c8b2a-...', NOW, NOW, true)
   │
   └─ Return ChatSession object

5. Frontend receives:
   {
     "id": 1,
     "sessionId": "38c2a0d1-c889-48e0-9c63-a41f04cbb787",
     "n8nSessionId": "5f7c8b2a-...",
     "fechaInicio": "2025-01-15T10:30:00",
     "activa": true
   }

6. Frontend stores sessionId:
   sessionId = "38c2a0d1-c889-48e0-9c63-a41f04cbb787"
   (used for all future messages in this session)

┌─────────────────────────────────────────────┐
│  STATE: Session Created and Active          │
└─────────────────────────────────────────────┘
```

### Fase 2: Enviar Primer Mensaje

```
1. User types message
   message = "¿Cuáles son mis derechos laborales?"

2. User clicks "Send"
   └─ Frontend → POST /api/chat/message?sessionId=38c2a0d1-...
      Headers: {
        "Authorization": "Bearer <JWT>",
        "Content-Type": "application/json"
      }
      Body: {
        "chatInput": "¿Cuáles son mis derechos laborales?"
      }

3. ChatController.sendMessage()
   ├─ Validate sessionId exists
   ├─ Extract User from Authentication
   └─ Call ChatService.sendMessageToN8n(sessionId, input)

4. ChatService.sendMessageToN8n()
   ├─ Step A: Find session
   │  ├─ session = chatSessionRepository.findBySessionId(sessionId)
   │  │  └─ SELECT * FROM CHAT_SESSION 
   │  │     WHERE SESSION_ID = '38c2a0d1-...'
   │  │
   │  └─ Result: ChatSession object (id=1, user_id=1234567890, ...)
   │
   ├─ Step B: Save USER message
   │  ├─ userMessage = new ChatMessage(
   │  │    session,           // session id=1
   │  │    "USER",            // sender
   │  │    "¿Cuáles son..."   // mensaje
   │  │  )
   │  │
   │  ├─ userMessage.setFechaEnvio(NOW)
   │  │
   │  ├─ chatMessageRepository.save(userMessage)
   │  │  └─ INSERT INTO CHAT_MESSAGE 
   │  │     (SESSION_ID, SENDER, MENSAJE, FECHA_ENVIO)
   │  │     VALUES (1, 'USER', '¿Cuáles son...', NOW)
   │  │
   │  └─ Result: Message id=1 in DB
   │
   ├─ Step C: Update session activity
   │  ├─ session.setFechaUltimaInteraccion(NOW)
   │  ├─ session.setUpdatedAt(NOW)
   │  │
   │  ├─ chatSessionRepository.save(session)
   │  │  └─ UPDATE CHAT_SESSION
   │  │     SET FECHA_ULTIMA_INTERACCION = NOW,
   │  │         UPDATED_AT = NOW
   │  │     WHERE ID = 1
   │  │
   │  └─ Result: Session timestamps updated
   │
   ├─ Step D: Call n8n webhook
   │  ├─ Build payload:
   │  │  {
   │  │    "sessionId": "5f7c8b2a-1234-5678-9abc-def012345678",
   │  │    "action": "sendMessage",
   │  │    "chatInput": "¿Cuáles son mis derechos laborales?"
   │  │  }
   │  │
   │  ├─ restTemplate.postForObject(
   │  │    "https://n8n.company.com/webhook/alphabrein",
   │  │    body,
   │  │    String.class
   │  │  )
   │  │
   │  └─ Result: n8n receives message and processes it
   │     ├─ Retrieve relevant legal documents
   │     ├─ Query LLM for legal answer
   │     ├─ Format response
   │     └─ Return JSON string
   │
   │     Example response:
   │     {
   │       "output": "De acuerdo a la Ley 50 de 1990...",
   │       "references": ["art. 48", "art. 49"]
   │     }
   │
   ├─ Step E: Save AGENT message
   │  ├─ agentMessage = new ChatMessage(
   │  │    session,                                    // session id=1
   │  │    "AGENT",                                    // sender
   │  │    "{\"output\": \"De acuerdo a la Ley...\"}"  // JSON response
   │  │  )
   │  │
   │  ├─ agentMessage.setFechaEnvio(NOW)
   │  │
   │  ├─ chatMessageRepository.save(agentMessage)
   │  │  └─ INSERT INTO CHAT_MESSAGE 
   │  │     (SESSION_ID, SENDER, MENSAJE, FECHA_ENVIO)
   │  │     VALUES (1, 'AGENT', '{\"output\"...}', NOW)
   │  │
   │  └─ Result: Message id=2 in DB
   │
   └─ Return ChatMessageResponse:
      {
        "sessionId": "38c2a0d1-c889-48e0-9c63-a41f04cbb787",
        "message": "¿Cuáles son mis derechos laborales?",
        "response": "{\"output\": \"De acuerdo a la Ley 50...\"}"
      }

5. Frontend receives response:
   ├─ Display user message: "¿Cuáles son mis derechos..."
   ├─ Display AI response: "De acuerdo a la Ley 50..."
   └─ Update chat UI

┌─────────────────────────────────────────────┐
│  STATE: 1 USER + 1 AGENT message in DB      │
│         Session active, timestamps updated  │
└─────────────────────────────────────────────┘
```

### Fase 3: Continuar Conversación

```
User types second message: "¿Y sobre vacaciones?"
│
└─ Frontend → POST /api/chat/message?sessionId=38c2a0d1-...
   Body: { "chatInput": "¿Y sobre vacaciones?" }

Same flow as Fase 2:
├─ Save USER message → DB (id=3)
├─ Update session timestamps
├─ Call n8n webhook
├─ Save AGENT response → DB (id=4)
└─ Return response to frontend

┌─────────────────────────────────────────────┐
│  STATE: 4 messages in DB (2 USER, 2 AGENT) │
│         Session still active                │
└─────────────────────────────────────────────┘

(Repetir para cada mensaje subsecuente)
```

### Fase 4: Obtener Historial

```
1. User → GET /api/chat/session/38c2a0d1-.../history
   Headers: {
     "Authorization": "Bearer <JWT>"
   }

2. ChatController.getSessionHistory()
   ├─ Validate sessionId
   ├─ Extract User from Authentication
   └─ Call ChatService.getSessionHistory(sessionId, user)

3. ChatService.getSessionHistory()
   ├─ Find session:
   │  ├─ session = chatSessionRepository.findBySessionId(sessionId)
   │  └─ Verify user is owner
   │
   ├─ Get all messages:
   │  ├─ messages = chatMessageRepository
   │  │    .findByChatSessionOrderByFechaEnvioAsc(session)
   │  │
   │  └─ SELECT * FROM CHAT_MESSAGE
   │     WHERE SESSION_ID = 1
   │     ORDER BY FECHA_ENVIO ASC
   │
   │     Result:
   │     [
   │       { id: 1, sender: 'USER', mensaje: '¿Cuáles son...', fechaEnvio: '10:31:00' },
   │       { id: 2, sender: 'AGENT', mensaje: '{\"output\"...}', fechaEnvio: '10:31:05' },
   │       { id: 3, sender: 'USER', mensaje: '¿Y sobre...', fechaEnvio: '10:32:00' },
   │       { id: 4, sender: 'AGENT', mensaje: '{\"output\"...}', fechaEnvio: '10:32:05' }
   │     ]
   │
   ├─ Map to DTOs:
   │  └─ Convert to ChatMessageDto objects
   │
   └─ Return ChatSessionDetailDto:
      {
        "id": 1,
        "sessionId": "38c2a0d1-...",
        "titulo": null,
        "fechaInicio": "2025-01-15T10:30:00",
        "fechaUltimaInteraccion": "2025-01-15T10:32:05",
        "activa": true,
        "mensajes": [
          { id: 1, sender: 'USER', mensaje: '¿Cuáles son...', fechaEnvio: '10:31:00' },
          { id: 2, sender: 'AGENT', mensaje: '{\"output\"...}', fechaEnvio: '10:31:05' },
          { id: 3, sender: 'USER', mensaje: '¿Y sobre...', fechaEnvio: '10:32:00' },
          { id: 4, sender: 'AGENT', mensaje: '{\"output\"...}', fechaEnvio: '10:32:05' }
        ]
      }

4. Frontend receives:
   ├─ Reconstruct conversation
   ├─ Display all messages in chronological order
   ├─ Highlight USER messages with different style
   └─ Display AGENT responses

┌─────────────────────────────────────────────┐
│  STATE: Historial visible al usuario        │
│         Si sesión está cerrada: solo lectura │
└─────────────────────────────────────────────┘
```

### Fase 5: Cerrar Sesión

```
1. User clicks "Close Chat" button
   └─ Frontend → POST /api/chat/session/38c2a0d1-.../close
      Headers: {
        "Authorization": "Bearer <JWT>"
      }

2. ChatController.closeSession()
   ├─ Validate sessionId
   ├─ Extract User from Authentication
   └─ Call ChatService.closeSession(sessionId, user)

3. ChatService.closeSession()
   ├─ Find session:
   │  └─ session = chatSessionRepository.findBySessionId(sessionId)
   │
   ├─ Verify user ownership:
   │  └─ if (session.user != authenticated_user) throw Error
   │
   ├─ Mark as inactive:
   │  ├─ session.setActiva(false)
   │  └─ session.setUpdatedAt(NOW)
   │
   ├─ Persist change:
   │  ├─ chatSessionRepository.save(session)
   │  │
   │  └─ UPDATE CHAT_SESSION
   │     SET ACTIVA = false, UPDATED_AT = NOW
   │     WHERE ID = 1
   │
   └─ Return 204 No Content

4. Frontend:
   ├─ Close ChatWindow
   ├─ Clear sessionId from memory
   └─ Allow user to create new session

┌─────────────────────────────────────────────┐
│  STATE: Session closed (activa=false)       │
│         - Historial persiste para siempre   │
│         - NO se acepta messages             │
│         - Usuario puede crear nueva sesión  │
└─────────────────────────────────────────────┘
```

---

## 🔄 Manejo de Memoria Conversacional

### Contexto Persistente en n8n

Cada sesión tiene un `n8nSessionId` único:

```javascript
// n8n workflow recibe:
{
  sessionId: "5f7c8b2a-1234-5678-9abc-def012345678",  // Tracked by n8n
  action: "sendMessage",
  chatInput: "¿Y sobre vacaciones?"
}
```

n8n puede:
1. **Recuperar historial** de mensajes anteriores (si lo almacena)
2. **Mantener contexto** de la conversación
3. **Personalizar respuestas** según el historial

### Contexto Persistente en AlphaBrein

```sql
-- Si n8n necesita historial:
SELECT * FROM CHAT_MESSAGE
WHERE SESSION_ID = (
    SELECT ID FROM CHAT_SESSION 
    WHERE N8N_SESSION_ID = '5f7c8b2a-...'
)
ORDER BY FECHA_ENVIO ASC
```

---

## 🛠️ Componentes Clave

### 1. ChatController

```java
@RestController
@RequestMapping("/api/chat")
public class ChatController {
    
    @PostMapping("/session")
    public ResponseEntity<ChatSession> getSession(Authentication auth) {
        User user = (User) auth.getPrincipal();
        ChatSession session = chatService.getOrCreateSession(user);
        return ResponseEntity.ok(session);
    }
    
    @PostMapping("/message")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @RequestParam String sessionId,
            @RequestBody ChatMessageRequest request,
            Authentication auth) {
        User user = (User) auth.getPrincipal();
        String response = chatService.sendMessageToN8n(sessionId, request.getChatInput());
        // ...
        return ResponseEntity.ok(messageResponse);
    }
    
    @GetMapping("/session/{sessionId}/history")
    public ResponseEntity<ChatSessionDetailDto> getSessionHistory(
            @PathVariable String sessionId,
            Authentication auth) {
        User user = (User) auth.getPrincipal();
        ChatSessionDetailDto history = chatService.getSessionHistory(sessionId, user);
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSession>> getUserSessions(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<ChatSession> sessions = chatService.getUserSessions(user);
        return ResponseEntity.ok(sessions);
    }
    
    @PostMapping("/session/{sessionId}/close")
    public ResponseEntity<Void> closeSession(
            @PathVariable String sessionId,
            Authentication auth) {
        User user = (User) auth.getPrincipal();
        chatService.closeSession(sessionId, user);
        return ResponseEntity.noContent().build();
    }
}
```

### 2. ChatService

```java
@Service
public class ChatService {
    
    @Value("${n8n.webhook.url}")
    private String N8N_WEBHOOK;
    
    // Crear sesión
    public ChatSession getOrCreateSession(User user) {
        String sessionId = UUID.randomUUID().toString();
        String n8nSessionId = UUID.randomUUID().toString();
        ChatSession session = new ChatSession(sessionId, user, n8nSessionId);
        return chatSessionRepository.save(session);
    }
    
    // Enviar mensaje y obtener respuesta de n8n
    public String sendMessageToN8n(String sessionId, String chatInput) {
        ChatSession session = chatSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new RuntimeException("Sesión no encontrada"));
        
        // Guardar mensaje del usuario
        ChatMessage userMessage = new ChatMessage(session, "USER", chatInput);
        chatMessageRepository.save(userMessage);
        
        // Actualizar timestamps
        session.setFechaUltimaInteraccion(LocalDateTime.now());
        chatSessionRepository.save(session);
        
        // Llamar n8n
        Map<String, String> body = new HashMap<>();
        body.put("sessionId", session.getN8nSessionId());
        body.put("action", "sendMessage");
        body.put("chatInput", chatInput);
        
        String response = restTemplate.postForObject(N8N_WEBHOOK, body, String.class);
        
        // Guardar respuesta del agente
        ChatMessage agentMessage = new ChatMessage(session, "AGENT", response);
        chatMessageRepository.save(agentMessage);
        
        return response;
    }
    
    // Obtener historial
    public ChatSessionDetailDto getSessionHistory(String sessionId, User user) {
        ChatSession session = chatSessionRepository.findBySessionId(sessionId)
                .orElseThrow();
        
        // Verificar propiedad
        if (!session.getUser().getIdCard().equals(user.getIdCard())) {
            throw new RuntimeException("No tienes permiso");
        }
        
        List<ChatMessage> messages = chatMessageRepository
                .findByChatSessionOrderByFechaEnvioAsc(session);
        
        List<ChatMessageDto> mess ageDtos = messages.stream()
                .map(m -> new ChatMessageDto(m.getId(), m.getSender(), 
                    m.getMensaje(), m.getFechaEnvio()))
                .collect(Collectors.toList());
        
        return new ChatSessionDetailDto(
                session.getId(), session.getSessionId(), session.getTitulo(),
                session.getFechaInicio(), session.getFechaUltimaInteraccion(),
                session.getActiva(), messageDtos);
    }
}
```

### 3. DTOs

```java
// ChatMessageRequest
public class ChatMessageRequest {
    private String chatInput;
}

// ChatMessageResponse
public class ChatMessageResponse {
    private String sessionId;
    private String message;
    private String response;
}

// ChatSessionDetailDto
public class ChatSessionDetailDto {
    private Long id;
    private String sessionId;
    private String titulo;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaUltimaInteraccion;
    private Boolean activa;
    private List<ChatMessageDto> mensajes;
}

// ChatMessageDto
public class ChatMessageDto {
    private Long id;
    private String sender;  // "USER" | "AGENT"
    private String mensaje;
    private LocalDateTime fechaEnvio;
}
```

---

## 📊 Diagrama de Secuencia Temporal

```
User Timeline                  Frontend                Backend                n8n
│                               │                        │                      │
├─ Open Chat ──────────────────►│                        │                      │
│                               ├─ POST /api/chat/session────────────────►│      │
│                               │                        ├─ Create Session      │
│                               │                        ├─ Save DB             │
│                               │◄─────────────────────────────────────────┤      │
│                               │ {sessionId, ...}      │                      │
│                               │◄────────────────────────────────────────────│
│                               │
├─ Type Message ──────────────►│                        │                      │
├─ Click Send                  ├─ POST /api/chat/message────────────────►│      │
│                               │    ?sessionId=...     ├─ Save USER msg       │
│                               │    {chatInput}        ├─ Call Webhook ──────►│
│                               │                        │                      ├─ Process
│                               │                        │                      ├─ Query LLM
│                               │                        │                      ├─ Generate response
│                               │                        │◄──────────────────────┤
│                               │                        │ {output: "..."}      │
│                               │                        ├─ Save AGENT msg      │
│                               │◄────────────────────────────────────────────┤
│                               │ {message, response}   │                      │
│                               │◄────────────────────────────────────────────────│
│                               │
├─ Read Response ◄─────────────┤                        │                      │
│                               │                        │                      │
├─ Type 2nd Message ───────────►│                        │                      │
├─ Click Send                  ├─ POST /api/chat/message────────────────►│      │
│                               │    ?sessionId=...     ├─ [Same as before]    │
│                               │                        │
│                               │       ...repeat...     │
│                               │                        │
├─ Click "View History"────────►│                        │                      │
│                               ├─ GET /api/chat/session/  .../history ──►│      │
│                               │                        ├─ Query all messages  │
│                               │                        │ SELECT * WHERE...    │
│                               │◄────────────────────────────────────────────┤
│                               │ ChatSessionDetailDto   │                      │
│                               │ {mensajes: [4 msgs]}   │                      │
│                               │                        │                      │
├─ Close Chat ────────────────►│                        │                      │
│                               ├─ POST /api/chat/session/{sid}/close ──►│      │
│                               │                        ├─ Set ACTIVA = false  │
│                               │                        ├─ Update DB           │
│                               │◄────────────────────────────────────────────┤
│                               │ 204 No Content         │                      │
│                               │                        │                      │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## ❌ Errores y Validaciones

### Validaciones del Sistema

| Validación | Dónde | Acción |
|-----------|-------|--------|
| JWT válido | JwtAuthenticationFilter | 401 si inválido |
| User propietario sesión | ChatService | 403 si no propietario |
| Session existe | ChatService.sendMessage | 400 si no existe |
| ChatInput no vacío | ChatMessageRequest | 400 si vacío |
| Session activa | ChatController (future) | 400 si cerrada |

### Manejo de Errores de n8n

```java
try {
    String response = restTemplate.postForObject(
        N8N_WEBHOOK, body, String.class
    );
    // ... guardar response
} catch (Exception e) {
    throw new RuntimeException("Error al comunicarse con n8n: " + e.getMessage());
}
```

**TODO**: Implementar retry logic con exponential backoff

---

## 💡 Mejoras Futuras

1. **WebSockets** para chat en tiempo real
2. **Typing indicators** ("User is typing...")
3. **Message editing** (editar mensajes enviados)
4. **Message reactions** (emojis, thumbs up)
5. **Session titles** (generar títulos automáticos)
6. **Export conversations** (PDF, DOCX)
7. **Message search** en historial
8. **Conversation threading** en chats largos
9. **Attachments** (upload documentos)
10. **Chat sharing** con otros usuarios (futura)

---

**Última actualización**: Mayo 2026  
**Versión**: 1.0  
**Status**: Producción
