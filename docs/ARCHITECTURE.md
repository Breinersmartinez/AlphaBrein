# ARCHITECTURE.md - Arquitectura del Sistema AlphaBrein

## 📐 Descripción General de la Arquitectura

AlphaBrein está diseñado siguiendo una **arquitectura de 3 capas** (Three-Tier Architecture) con componentes claramente separados por responsabilidades, permitiendo escalabilidad horizontal y mantenibilidad.

---

## 🏗 Capas de la Arquitectura

### Capa 1: Presentación (Frontend)
**Tecnología**: React 19 + Vite + Tailwind CSS

```
┌─────────────────────────────────────────┐
│         CAPA DE PRESENTACIÓN             │
├─────────────────────────────────────────┤
│                                         │
│  React Components                       │
│  ├── Login                              │
│  ├── ClientSignUp                       │
│  ├── Dashboard (USER)                   │
│  ├── UserDashboard (ADMIN)              │
│  └── ChatWindow                         │
│                                         │
│  State Management                       │
│  └── AuthContext (Context API)          │
│                                         │
│  HTTP Clients                           │
│  ├── AuthService                        │
│  └── ChatService                        │
│                                         │
│  Styling                                │
│  └── Tailwind CSS                       │
│                                         │
└─────────────────────────────────────────┘
```

**Responsabilidades**:
- Renderizar interfaz de usuario
- Gestionar estado local con Context API
- Comunicar con backend vía REST API
- Almacenar tokens JWT en localStorage
- Validación de formularios en cliente

---

### Capa 2: Negocio (Backend)
**Tecnología**: Spring Boot 3 + Java 17

```
┌─────────────────────────────────────────┐
│         CAPA DE NEGOCIO                  │
├─────────────────────────────────────────┤
│                                         │
│  Controllers (REST Endpoints)           │
│  ├── AuthController                     │
│  ├── ChatController                     │
│  └── UserController                     │
│                                         │
│  Services (Lógica de Negocio)           │
│  ├── AuthService                        │
│  ├── UserService                        │
│  └── ChatService                        │
│                                         │
│  DTOs (Data Transfer Objects)           │
│  ├── LoginRequest/AuthResponse          │
│  ├── ChatMessageRequest/Response        │
│  ├── RegisterRequest/UserResponse       │
│  └── ChatSessionDetailDto               │
│                                         │
│  Seguridad                              │
│  ├── JwtService                         │
│  ├── JwtAuthenticationFilter            │
│  └── SecurityConfig                     │
│                                         │
│  Integraciones                          │
│  ├── n8n Webhook (RestTemplate)         │
│  └── Email Service (JavaMailSender)     │
│                                         │
└─────────────────────────────────────────┘
```

**Responsabilidades**:
- Procesar solicitudes HTTP
- Validar tokens JWT
- Aplicar lógica de negocio
- Gestionar autenticación y autorización
- Orquestar comunicación con BD y servicios externos
- Manejo de excepciones y errores

---

### Capa 3: Persistencia (Base de Datos)
**Tecnología**: PostgreSQL + Hibernate ORM + JPA

```
┌─────────────────────────────────────────┐
│         CAPA DE PERSISTENCIA             │
├─────────────────────────────────────────┤
│                                         │
│  JPA Repositories                       │
│  ├── UserRepository                     │
│  ├── ChatSessionRepository              │
│  └── ChatMessageRepository              │
│                                         │
│  Entidades JPA (Domain Models)          │
│  ├── User                               │
│  ├── ChatSession                        │
│  └── ChatMessage                        │
│                                         │
│  Database (PostgreSQL)                  │
│  ├── USUARIO                            │
│  ├── CHAT_SESSION                       │
│  └── CHAT_MESSAGE                       │
│                                         │
│  Connection Pool (HikariCP)             │
│                                         │
└─────────────────────────────────────────┘
```

**Responsabilidades**:
- Persistir datos en PostgreSQL
- Mapear objetos Java a tablas SQL (ORM)
- Gestionar conexiones a BD
- Realizar queries optimizadas
- Mantener integridad referencial

---

## 🔄 Flujo de Datos - Arquitectura en Capas

```
CLIENT (Browser)
      │
      │ HTTP Request
      ▼
┌─────────────────────────────────────┐
│  Frontend (React + Context)         │
├─────────────────────────────────────┤
│ 1. User interacts with UI           │
│ 2. Event dispatched (login, chat)   │
│ 3. AuthContext updated              │
│ 4. API call via Fetch               │
└──────────────┬──────────────────────┘
               │ REST JSON
               ▼
        NETWORK (CORS enabled)
               │
               ▼
┌─────────────────────────────────────┐
│  Backend (Spring Boot)              │
├─────────────────────────────────────┤
│ 1. Controller receives request      │
│ 2. JwtAuthenticationFilter validates│
│ 3. SecurityContext sets user        │
│ 4. Service processes business logic │
│ 5. Repository queries database     │
│ 6. Response marshalled to JSON      │
└──────────────┬──────────────────────┘
               │ REST JSON
               ▼
┌─────────────────────────────────────┐
│  Database (PostgreSQL)              │
├─────────────────────────────────────┤
│ 1. Query/Mutation executed         │
│ 2. Data persisted/retrieved        │
│ 3. Constraints validated           │
│ 4. Transaction committed           │
└──────────────┬──────────────────────┘
               │ Result Set
               ▼
        RESPONSE Path (Same route)
```

---

## 🌍 Flujo Completo: Frontend → Backend → n8n → Database

### Caso de Uso: Enviar Mensaje de Chat

```
┌────────────────────────────────────────────────────────────────────┐
│              FLUJO COMPLETO DE MENSAJE DE CHAT                     │
└────────────────────────────────────────────────────────────────────┘

STEP 1: Frontend (React)
┌──────────────────────────────────────────────────┐
│ User types message in ChatWindow component       │
│ Click "Send" button                              │
│ ChatService.sendMessage(sessionId, "mensaje")    │
│ Fetch POST /api/chat/message                     │
│ Header: Authorization: Bearer <JWT_TOKEN>        │
│ Body: { chatInput: "mensaje" }                   │
└──────────────────────┬───────────────────────────┘
                       │ HTTP POST
                       ▼
STEP 2: Network
┌──────────────────────────────────────────────────┐
│ CORS Check (origins: "*")                        │
│ Route to Spring Boot server (localhost:8080)     │
└──────────────────────────────────────────────────┘
                       │
                       ▼
STEP 3: Spring Boot - Security Filter
┌──────────────────────────────────────────────────┐
│ JwtAuthenticationFilter.doFilterInternal()       │
│ 1. Extract header: "Authorization: Bearer X"    │
│ 2. Extract token from header (substring(7))     │
│ 3. Call jwtService.extractUsername(token)       │
│ 4. Load UserDetails from database               │
│ 5. Verify token validity with jwtService        │
│ 6. Set SecurityContext with authenticated user  │
│ 7. Allow request to proceed                     │
└──────────────────────────────────────────────────┘
                       │ Authenticated
                       ▼
STEP 4: Spring Boot - Controller
┌──────────────────────────────────────────────────┐
│ ChatController.sendMessage()                     │
│ @PostMapping("/message")                         │
│ @RequestParam sessionId                          │
│ @RequestBody ChatMessageRequest                  │
│ Authentication authentication = principal        │
│ Get user: (User) authentication.getPrincipal()  │
└──────────────────────────────────────────────────┘
                       │
                       ▼
STEP 5: Spring Boot - Service Business Logic
┌──────────────────────────────────────────────────┐
│ ChatService.sendMessageToN8n(sessionId, input)   │
│                                                  │
│ a) Find ChatSession:                             │
│    session = chatSessionRepository               │
│      .findBySessionId(sessionId)                 │
│                                                  │
│ b) Save USER message to DB:                      │
│    userMessage = new ChatMessage(                │
│      session, "USER", chatInput)                 │
│    chatMessageRepository.save(userMessage)       │
│                                                  │
│ c) Update session timestamp:                     │
│    session.setFechaUltimaInteraccion(now)       │
│    chatSessionRepository.save(session)           │
│                                                  │
│ d) Build n8n webhook body:                       │
│    {sessionId: session.n8nSessionId,             │
│     action: "sendMessage",                       │
│     chatInput: input}                            │
└──────────────────────────────────────────────────┘
                       │
                       ▼
STEP 6: Spring Boot - n8n Integration
┌──────────────────────────────────────────────────┐
│ restTemplate.postForObject(                      │
│   N8N_WEBHOOK_URL,                               │
│   body,                                          │
│   String.class                                   │
│ )                                                │
│                                                  │
│ HTTP POST to:                                    │
│ https://tu-instancia-n8n.com/webhook/alphabrein │
│                                                  │
│ n8n receives:                                    │
│ {                                                │
│   sessionId: "uuid-n8n",                         │
│   action: "sendMessage",                         │
│   chatInput: "mi mensaje aquí"                   │
│ }                                                │
└──────────────────────────────────────────────────┘
                       │
                       ▼ (External Process)
STEP 7: n8n Platform
┌──────────────────────────────────────────────────┐
│ 1. Webhook receives request                      │
│ 2. Workflow triggered                            │
│ 3. Process message:                              │
│    - RAG (Retrieve knowledge base)               │
│    - LLM (Generate response)                     │
│    - Format output                               │
│ 4. Send response back to Spring Boot             │
│                                                  │
│ Response:                                        │
│ {                                                │
│   output: "Respuesta jurídica especializada..."  │
│ }                                                │
└──────────────────────────────────────────────────┘
                       │
                       ▼
STEP 8: Spring Boot - Save AGENT Response
┌──────────────────────────────────────────────────┐
│ ChatService continues:                           │
│                                                  │
│ String response = restTemplate                   │
│   .postForObject(...)                            │
│                                                  │
│ Save AGENT message to DB:                        │
│ agentMessage = new ChatMessage(                  │
│   session, "AGENT", response)                    │
│ chatMessageRepository.save(agentMessage)         │
│                                                  │
│ Create response DTO:                             │
│ ChatMessageResponse {                            │
│   sessionId,                                     │
│   userMessage: input,                            │
│   agentResponse: response                        │
│ }                                                │
└──────────────────────────────────────────────────┘
                       │
                       ▼
STEP 9: Database - Persist Messages
┌──────────────────────────────────────────────────┐
│ PostgreSQL:                                      │
│                                                  │
│ INSERT INTO CHAT_MESSAGE                         │
│ (SESSION_ID, SENDER, MENSAJE, FECHA_ENVIO)      │
│ VALUES (1, 'USER', 'mi mensaje...', now())       │
│                                                  │
│ INSERT INTO CHAT_MESSAGE                         │
│ (SESSION_ID, SENDER, MENSAJE, FECHA_ENVIO)      │
│ VALUES (1, 'AGENT', '{"output":"..."}', now())   │
│                                                  │
│ UPDATE CHAT_SESSION                              │
│ SET FECHA_ULTIMA_INTERACCION = now()             │
│ WHERE SESSION_ID = '...'                         │
└──────────────────────────────────────────────────┘
                       │
                       ▼
STEP 10: Response Path
┌──────────────────────────────────────────────────┐
│ ChatController returns:                          │
│ ResponseEntity<ChatMessageResponse>              │
│                                                  │
│ Body:                                            │
│ {                                                │
│   "sessionId": "38c2a0d1-...",                   │
│   "message": "mi mensaje aquí",                  │
│   "response": "Respuesta jurídica..."            │
│ }                                                │
│                                                  │
│ Status: 200 OK                                   │
│ Content-Type: application/json                   │
└──────────────────────────────────────────────────┘
                       │ HTTP Response
                       ▼
STEP 11: Frontend - Update UI
┌──────────────────────────────────────────────────┐
│ ChatService.sendMessage() returns:               │
│ {                                                │
│   userMessage: "mi mensaje aquí",                │
│   aiResponse: "Respuesta jurídica..."            │
│ }                                                │
│                                                  │
│ ChatWindow component:                            │
│ 1. Add user message to messages array            │
│ 2. Add AI response to messages array             │
│ 3. Scroll to bottom                              │
│ 4. Clear input field                             │
│ 5. Re-render conversation                        │
│ 6. Update last activity timestamp                │
└──────────────────────────────────────────────────┘
                       │
                       ▼
STEP 12: User sees response
┌──────────────────────────────────────────────────┐
│ ChatWindow displays:                             │
│                                                  │
│ USER (10:30):                                    │
│ "mi mensaje aquí"                                │
│                                                  │
│ ALPHABREIN (10:31):                              │
│ "Respuesta jurídica especializada..."            │
│                                                  │
│ User can continue typing new messages            │
└──────────────────────────────────────────────────┘
```

---

## 📦 Estructura de Paquetes Java

```
com.example.bcrypt2025/
│
├── Bcrypt2025Application.java
│   └── Main entry point, @SpringBootApplication
│
├── audit/
│   └── Auditable.java
│       └── Base class con timestamps createdAt, updatedAt
│
├── config/
│   ├── SecurityConfig.java
│   │   └── Spring Security configuration, CORS, JWT filter
│   ├── MailConfig.java
│   │   └── Email configuration (Gmail SMTP)
│   └── documentationConfig/
│       └── SwaggerOpenApiConfig.java
│           └── Swagger/OpenAPI documentation
│
├── Controller/
│   ├── AuthController.java
│   │   └── POST /api/auth/register, login
│   ├── ChatController.java
│   │   └── POST/GET /api/chat/*, session management
│   └── UserController.java
│       └── GET /api/users/*, user management
│
├── Model/
│   ├── user/
│   │   └── User.java (UserDetails, Auditable)
│   │       └── idCard (PK), email, password, role
│   ├── agent/
│   │   ├── ChatSession.java
│   │   │   └── id (PK), sessionId, n8nSessionId, userId (FK)
│   │   └── ChatMessage.java
│   │       └── id (PK), sessionId (FK), sender, mensaje
│   └── enums/
│       ├── Role.java (ADMIN, USER)
│       └── IdentificationType.java (CC, CE, PP, etc.)
│
├── Service/
│   ├── AuthService.java
│   │   ├── register(RegisterRequest)
│   │   └── login(LoginRequest)
│   ├── UserService.java
│   │   ├── getAllUsers(), getUserById(), getActiveUsers()
│   │   └── getUserByEmail()
│   ├── CustomUserDetailsService.java
│   │   └── loadUserByUsername(email)
│   └── agent/
│       └── ChatService.java
│           ├── getOrCreateSession(user)
│           ├── sendMessageToN8n(sessionId, input)
│           ├── getSessionHistory(sessionId)
│           └── closeSession(sessionId)
│
├── Repository/
│   ├── UserRepository.java (extends JpaRepository<User, Integer>)
│   │   ├── findByEmail(String)
│   │   ├── findByActive(Boolean)
│   │   └── findByRole(Role)
│   └── agent/
│       ├── ChatSessionRepository.java
│       │   ├── findBySessionId(String)
│       │   ├── findByUserAndActiva(User, Boolean)
│       │   └── findByUser(User)
│       └── ChatMessageRepository.java
│           └── findByChatSessionOrderByFechaEnvioAsc()
│
├── dto/
│   ├── agent/
│   │   ├── ChatMessageDto.java
│   │   │   └── id, sender, mensaje, fechaEnvio
│   │   ├── ChatMessageRequest.java
│   │   │   └── chatInput (String)
│   │   ├── ChatMessageResponse.java
│   │   │   └── sessionId, message, response
│   │   └── ChatSessionDetailDto.java
│   │       └── id, sessionId, titulo, dates, messages
│   ├── authDTO/
│   │   ├── LoginRequest.java
│   │   │   └── email, password
│   │   ├── AuthResponse.java
│   │   │   └── token, email, firstName, role, message
│   │   └── (others)
│   └── userDTO/
│       ├── RegisterRequest.java
│       ├── UpdateUserRequest.java
│       └── UserResponse.java
│
└── jwt/
    ├── JwtService.java
    │   ├── generateToken(UserDetails)
    │   ├── extractUsername(token)
    │   ├── isTokenValid(token, userDetails)
    │   └── extractClaim(token)
    └── JwtAuthenticationFilter.java
        └── doFilterInternal(request, response, chain)
```

---

## 🔐 Ciclo de Vida de una Conversación

```
┌─────────────────────────────────────────────────────────────┐
│           CICLO DE VIDA DE UNA CONVERSACIÓN                 │
└─────────────────────────────────────────────────────────────┘

1️⃣ CREAR SESIÓN
   User autenticado → ChatController.getSession()
   ├─ Genera sessionId (UUID)
   ├─ Genera n8nSessionId (UUID distinto)
   ├─ Crea ChatSession
   ├─ Persiste en DB: INSERT CHAT_SESSION
   └─ Retorna datos: { id, sessionId, n8nSessionId, ... }
   
   State: ChatSession.active = TRUE, createdAt = NOW

2️⃣ ENVIAR PRIMER MENSAJE
   Frontend envía mensaje → ChatController.sendMessage()
   ├─ Valida sessionId existe
   ├─ Crea ChatMessage { sender: "USER", mensaje: input }
   ├─ Persiste mensaje: INSERT CHAT_MESSAGE
   ├─ Actualiza session: FECHA_ULTIMA_INTERACCION = NOW
   ├─ Llama n8n webhook con n8nSessionId
   ├─ Recibe respuesta de n8n
   ├─ Crea ChatMessage { sender: "AGENT", mensaje: response }
   ├─ Persiste respuesta: INSERT CHAT_MESSAGE
   └─ Retorna al frontend
   
   State: 2 mensajes en BD (USER + AGENT)

3️⃣ CONTINUAR CONVERSACIÓN
   User envía más mensajes → Repetir paso 2️⃣
   ├─ Mismo sessionId
   ├─ Mensajes se acumulan en BD
   ├─ ChatSession.fechaUltimaInteraccion se actualiza
   └─ Historial completo disponible
   
   State: N mensajes en BD

4️⃣ OBTENER HISTORIAL
   Frontend solicita → ChatController.getSessionHistory()
   ├─ Valida sessionId pertenece al usuario
   ├─ Query: SELECT * FROM CHAT_MESSAGE WHERE SESSION_ID = ?
   ├─ Ordena por FECHA_ENVIO ASC
   ├─ Mapea a ChatMessageDto[]
   └─ Retorna ChatSessionDetailDto con todos los mensajes
   
   State: Acceso de lectura, sin cambios

5️⃣ CERRAR SESIÓN
   Frontend cierra chat → ChatController.closeSession()
   ├─ Valida que usuario sea propietario
   ├─ UPDATE CHAT_SESSION: ACTIVA = FALSE
   ├─ Actualiza UPDATED_AT = NOW
   └─ Retorna 200 OK
   
   State: ChatSession.active = FALSE, no se aceptan mensajes

6️⃣ HISTORIAL PERSISTENTE (Post-cierre)
   ├─ Sesión cerrada pero no eliminada
   ├─ Mensajes permanecen en BD
   ├─ Usuario puede ver historial luego
   ├─ Ideal para auditoría y Machine Learning
   └─ Datos disponibles para análisis
   
   State: Read-only archive

┌─────────────────────────────────────────────────────────────┐
│ DIAGRAMAS DE ESTADO                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐                                          │
│  │   CREATED    │                                          │
│  │ (active=true)│                                          │
│  └──────┬───────┘                                          │
│         │ Send message                                    │
│         ▼                                                 │
│  ┌──────────────┐                                          │
│  │   ACTIVE     │◄──────┐                                  │
│  │ (active=true)│       │ Send more messages              │
│  └──────┬───────┘       │                                  │
│         │ Close         └─────────────────────────────────┤
│         ▼                                                 │
│  ┌──────────────┐                                          │
│  │   CLOSED     │                                          │
│  │(active=false)│                                          │
│  └──────────────┘                                          │
│                                                             │
│  Estados NO reversibles (una sesión cerrada es final)     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔀 Patrones de Diseño Implementados

### 1. **MVC (Model-View-Controller)**
- **View**: Components React
- **Controller**: @RestController en Spring
- **Model**: Entidades JPA + DTOs

### 2. **Service Layer Pattern**
- Controllers → Services → Repositories
- Separación de responsabilidades
- Lógica de negocio centralizada

### 3. **DTO Pattern (Data Transfer Object)**
- Desacoplamiento entre DB entities y API responses
- Validación en DTOs
- Seguridad (ocultar campos sensibles)

### 4. **Repository Pattern**
- Abstracción de acceso a datos
- JpaRepository para CRUD genérico
- Métodos de query custom

### 5. **Dependency Injection**
- Constructor injection en Services y Controllers
- Managed beans de Spring
- Loose coupling entre componentes

### 6. **Filter Pattern**
- JwtAuthenticationFilter
- Intercepta todas las requests
- Valida tokens antes de llegar a controllers

### 7. **Strategy Pattern**
- PasswordEncoder (BCryptPasswordEncoder)
- Different implementations posibles
- Intercambiable sin cambiar código

---

## 🔗 Interacciones Entre Capas

```
┌────────────────────────────────────────────────────────┐
│         FRONTEND ◄──────────► BACKEND                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│ AuthContext                    AuthController         │
│ ├─ login()  ────────────────► POST /api/auth/login   │
│ └─ logout() ◄──────────────── AuthResponse           │
│                                                        │
│ ChatService                    ChatController         │
│ ├─ createSession() ─────────► POST /api/chat/session │
│ ├─ getSessions() ────────────► GET /api/chat/sessions │
│ ├─ sendMessage() ────────────► POST /api/chat/message │
│ └─ getSessionHistory() ─────► GET /api/chat/session/ │
│                              {sessionId}/history     │
│                                                        │
│ localStorage                   JwtAuthenticationFilter│
│ └─ Guarda token ◄───────────── Valida en cada request│
│                                                        │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│    BACKEND  ◄──────────► DATABASE                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│ AuthService                    UserRepository         │
│ ├─ register() ──────────────► findByEmail()          │
│ │                            save(user)              │
│ └─ login() ─────────────────► findByEmail()          │
│                                                        │
│ ChatService                    ChatSessionRepository  │
│ ├─ getOrCreateSession() ────► save(session)          │
│ └─ sendMessageToN8n() ──────► findBySessionId()      │
│                                                        │
│                               ChatMessageRepository   │
│ ChatService                                           │
│ ├─ sendMessageToN8n() ──────► save(message)          │
│ └─ getSessionHistory() ─────► findByChatSession...() │
│                                                        │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│    BACKEND  ◄──────────► EXTERNAL SERVICES            │
├────────────────────────────────────────────────────────┤
│                                                        │
│ ChatService                    n8n Webhook            │
│ └─ sendMessageToN8n() ──────► POST /webhook/         │
│        (RestTemplate)         alphabrein              │
│        ◄──────────────────── JSON Response            │
│                                                        │
│ AuthService                    Gmail SMTP             │
│ └─ register() ──────────────► sendEmail()            │
│        (JavaMailSender)        (confirmation link)   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🏢 Componentes Principales

### 1. **User (Entity)**
- Implementa `UserDetails` para Spring Security
- Auditable para tracking de cambios
- Identificación colombiana como PK
- Roles: ADMIN, USER

### 2. **ChatSession (Entity)**
- Relación 1:N con User (ManyToOne)
- sessionId único (UUID)
- n8nSessionId para tracking en n8n
- Timestamps para auditoría

### 3. **ChatMessage (Entity)**
- Relación N:1 con ChatSession (ManyToOne)
- sender: "USER" o "AGENT"
- TEXT field para mensajes largos
- fechaEnvio para historial cronológico

### 4. **Controllers**
- Manejadores de requests HTTP
- Binding de Authentication desde SecurityContext
- DTOs para validación
- Exception handling

### 5. **Services**
- Lógica de negocio centralizada
- Transacciones ACID
- Validaciones
- Coordinación with repositories

### 6. **Repositories**
- CRUD operations vía JpaRepository
- Custom queries
- Lazy loading optimizations

---

## 📊 Diagrama de Secuencia - Login User

```
User                Frontend              Backend               Database
│                      │                    │                      │
├─ Click Login ─────►  │                    │                      │
│                      │                    │                      │
│                      ├─ Fetch POST        │                      │
│                      │ /api/auth/login ──►│                      │
│                      │                    │                      │
│                      │                    ├─ Validate credencials│
│                      │                    │                      │
│                      │                    ├─ Query user by email │
│                      │                    ├──────────────────────►│
│                      │                    │◄──────────────────────┤
│                      │                    │ User record          │
│                      │                    │                      │
│                      │                    ├─ BCrypt compare      │
│                      │                    │ password             │
│                      │                    │ (hash & salt)        │
│                      │                    │                      │
│                      │                    ├─ Generate JWT        │
│                      │                    │ (JwtService)         │
│                      │                    │                      │
│                      │ AuthResponse       │                      │
│                      │ {token, email,...} │                      │
│                      │◄───────────────────┤                      │
│                      │                    │                      │
│                      ├─ Store token      │                      │
│                      │ in localStorage    │                      │
│                      │                    │                      │
│◄─ Redirect to ───── │                    │                      │
│   Dashboard         │                    │                      │
```

---

## 📈 Escalabilidad y Consideraciones

### Horizontal Scaling (Múltiples Instancias Backend)
```
Load Balancer
├─ Spring Boot Instance 1 ─┐
├─ Spring Boot Instance 2  ├─► PostgreSQL (Shared) ◄─ n8n
├─ Spring Boot Instance 3 ─┘
```

**Requisitos**:
- Stateless design ✅ (JWT tokens no requieren sesiones en servidor)
- Shared database connection ✅ (HikariCP handles pooling)
- Distributed caching (futura mejora con Redis)

### Vertical Scaling (Más recursos)
- Connection pool size (HikariCP): configurar según CPU cores
- JVM heap size: según memoria disponible
- Thread pool de Tomcat: configurar según carga

---

## 🔍 Tecnologías de Soporte

| Herramienta | Propósito | Configuración |
|-----------|----------|---------------|
| Swagger | API Documentation | `/swagger-ui.html` |
| Spring Security | Authentication | `SecurityConfig.java` |
| JPA/Hibernate | ORM | `spring.jpa.*` |
| HikariCP | Connection Pool | Default Spring Boot |
| CORS | Cross-Origin Requests | `CorsConfigurationSource` |
| Lombok | Boilerplate reduction | Mixto (algunos DTOs) |

---

## 🚀 Deployment Considerations

- **Containerization**: Dockerfile incluido para Docker
- **Environment Variables**: Injected en application.properties
- **Database Migrations**: Hibernate auto-ddl configurado
- **Health Checks**: Actuator endpoint (futura mejora)
- **Logging**: SLF4J + Logback

---

**Última actualización**: Mayo 2026  
**Versión de Arquitectura**: 1.0  
**Estado**: Producción lista
