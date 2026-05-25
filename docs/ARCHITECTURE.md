# ARCHITECTURE.md - Arquitectura del Sistema AlphaBrein

##  Descripción General de la Arquitectura

AlphaBrein está diseñado siguiendo una **arquitectura de 3 capas** (Three-Tier Architecture) con componentes claramente separados por responsabilidades, permitiendo escalabilidad horizontal y mantenibilidad.

---

##  Capas de la Arquitectura

### Capa 1: Presentación (Frontend)
**Tecnología**: React 19 + Vite + Tailwind CSS

![capa presentacion front.png](image/capa%20presentacion%20front.png)

**Responsabilidades**:
- Renderizar interfaz de usuario
- Gestionar estado local con Context API
- Comunicar con backend vía REST API
- Almacenar tokens JWT en localStorage
- Validación de formularios en cliente

---

### Capa 2: Negocio (Backend)
**Tecnología**: Spring Boot 3 + Java 17

![capa presentacion back.png](image/capa%20presentacion%20back.png)

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

![capa persistencia.png](image/capa%20persistencia.png)

**Responsabilidades**:
- Persistir datos en PostgreSQL
- Mapear objetos Java a tablas SQL (ORM)
- Gestionar conexiones a BD
- Realizar queries optimizadas
- Mantener integridad referencial

---

##  Flujo de Datos - Arquitectura en Capas

![flujo datos.png](image/flujo%20datos.png)

---

##  Flujo Completo: Frontend → Backend → n8n → Database

### Caso de Uso: Enviar Mensaje de Chat

![flujo completo chat.png](image/flujo%20completo%20chat.png)

---

##  Estructura de Paquetes Java

![estructura de paquetes.png](image/estructura%20de%20paquetes
---

##  Ciclo de Vida de una Conversación

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

##  Patrones de Diseño Implementados

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

##  Interacciones Entre Capas

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

##  Componentes Principales

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

##  Diagrama de Secuencia - Login User

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

##  Escalabilidad y Consideraciones

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

##  Tecnologías de Soporte

| Herramienta | Propósito | Configuración |
|-----------|----------|---------------|
| Swagger | API Documentation | `/swagger-ui.html` |
| Spring Security | Authentication | `SecurityConfig.java` |
| JPA/Hibernate | ORM | `spring.jpa.*` |
| HikariCP | Connection Pool | Default Spring Boot |
| CORS | Cross-Origin Requests | `CorsConfigurationSource` |
| Lombok | Boilerplate reduction | Mixto (algunos DTOs) |

---

##  Deployment Considerations

- **Containerization**: Dockerfile incluido para Docker
- **Environment Variables**: Injected en application.properties
- **Database Migrations**: Hibernate auto-ddl configurado
- **Health Checks**: Actuator endpoint (futura mejora)
- **Logging**: SLF4J + Logback

---

**Última actualización**: Mayo 2026  
**Versión de Arquitectura**: 1.0  
**Estado**: Producción lista
