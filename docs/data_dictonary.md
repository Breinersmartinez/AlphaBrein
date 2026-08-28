# Diccionario de Datos - AlphaBrein

## Tablas de Base de Datos

### 1. USUARIO

**Descripción**: Almacena información de usuarios registrados en el sistema.

| Columna | Tipo | Nulo | Clave | Default | Descripción |
|---------|------|------|-------|---------|-------------|
| IDENTIFICACION | INTEGER | NO | PK | - | Cédula de identificación (PK natural) |
| TIPO_IDENTIFICACION | VARCHAR(50) | NO | - | - | Tipo: CC, CE, PP, PEP, NIT |
| NOMBRE | VARCHAR(100) | NO | - | - | Nombre(s) del usuario |
| APELLIDO | VARCHAR(100) | NO | - | - | Apellido(s) del usuario |
| CONTRASEÑA | VARCHAR(255) | NO | - | - | Hash BCrypt de la contraseña |
| CORREO | VARCHAR(255) | NO | UK | - | Email único del usuario |
| NUMERO_TELEFONO | VARCHAR(20) | SÍ | - | NULL | Teléfono de contacto |
| DIRECCION | VARCHAR(255) | SÍ | - | NULL | Dirección física |
| FECHA_REGISTRO | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Fecha de registro |
| ROL | VARCHAR(50) | NO | - | USER | Rol: ADMIN, USER |
| ACTIVO | BOOLEAN | NO | - | true | Estado del usuario |
| CREATED_AT | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Auditoría: creación |
| UPDATED_AT | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Auditoría: actualización |
| CREATED_BY | VARCHAR(255) | SÍ | - | NULL | Usuario creador |
| UPDATED_BY | VARCHAR(255) | SÍ | - | NULL | Usuario actualizador |

**Índices**:
- PK: IDENTIFICACION
- UK: CORREO
- IDX: idx_usuario_email (CORREO)
- IDX: idx_usuario_rol (ROL)
- IDX: idx_usuario_activo (ACTIVO)
- IDX: idx_usuario_fecha_registro (FECHA_REGISTRO)

**Relaciones**:
- 1:N → CHAT_SESSION (USER_ID)

---

### 2. CHAT_SESSION

**Descripción**: Sesiones de chat entre usuario e IA.

| Columna | Tipo | Nulo | Clave | Default | Descripción |
|---------|------|------|-------|---------|-------------|
| ID | BIGSERIAL | NO | PK | - | ID autoincremental |
| SESSION_ID | VARCHAR(36) | NO | UK | - | UUID v4 único para frontend |
| USER_ID | INTEGER | NO | FK | - | Referencia a USUARIO.IDENTIFICACION |
| N8N_SESSION_ID | VARCHAR(36) | NO | - | - | UUID v4 para tracking en n8n |
| TITULO | VARCHAR(255) | SÍ | - | NULL | Título opcional de la sesión |
| FECHA_INICIO | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Inicio de sesión |
| FECHA_ULTIMA_INTERACCION | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Último mensaje |
| ACTIVA | BOOLEAN | NO | - | true | Estado: abierta/cerrada |
| CREATED_AT | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Auditoría: creación |
| UPDATED_AT | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Auditoría: actualización |

**Índices**:
- PK: ID
- UK: SESSION_ID
- FK: USER_ID → USUARIO.IDENTIFICACION (ON DELETE CASCADE)
- IDX: idx_chat_session_session_id (SESSION_ID)
- IDX: idx_chat_session_user_id (USER_ID)
- IDX: idx_chat_session_activa (ACTIVA)
- IDX: idx_chat_session_fecha_inicio (FECHA_INICIO)
- IDX: idx_chat_session_user_activa (USER_ID, ACTIVA)

**Relaciones**:
- N:1 → USUARIO (USER_ID)
- 1:N → CHAT_MESSAGE (SESSION_ID)

---

### 3. CHAT_MESSAGE

**Descripción**: Mensajes individuales dentro de una sesión de chat.

| Columna | Tipo | Nulo | Clave | Default | Descripción |
|---------|------|------|-------|---------|-------------|
| ID | BIGSERIAL | NO | PK | - | ID autoincremental |
| SESSION_ID | BIGINT | NO | FK | - | Referencia a CHAT_SESSION.ID |
| SENDER | VARCHAR(50) | NO | - | - | Emisor: USER, AGENT |
| MENSAJE | TEXT | NO | - | - | Contenido del mensaje |
| FECHA_ENVIO | TIMESTAMP | NO | - | CURRENT_TIMESTAMP | Timestamp del envío |

**Índices**:
- PK: ID
- FK: SESSION_ID → CHAT_SESSION.ID (ON DELETE CASCADE)
- IDX: idx_chat_message_session_id (SESSION_ID)
- IDX: idx_chat_message_sender (SENDER)
- IDX: idx_chat_message_fecha_envio (FECHA_ENVIO)
- IDX: idx_chat_message_session_sender (SESSION_ID, SENDER)

**Relaciones**:
- N:1 → CHAT_SESSION (SESSION_ID)

**Constraints**:
- CHECK: SENDER IN ('USER', 'AGENT')

---

## Enumeraciones (Enums)

### Role (Rol de Usuario)
| Valor | Descripción |
|-------|-------------|
| ADMIN | Administrador del sistema |
| USER | Usuario estándar |

### IdentificationType (Tipo de Identificación)
| Valor | Descripción | País/Región |
|-------|-------------|-------------|
| CC | Cédula de Ciudadanía | Colombia |
| CE | Cédula de Extranjería | Colombia |
| PP | Pasaporte | Internacional |
| PEP | Permiso Especial de Permanencia | Colombia |
| NIT | Número de Identificación Tributaria | Colombia (empresas) |

### Sender (Emisor Mensaje)
| Valor | Descripción |
|-------|-------------|
| USER | Mensaje del usuario humano |
| AGENT | Respuesta del agente IA (n8n) |

---

## DTOs (Data Transfer Objects)

### Auth Package

#### RegisterRequest
| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| firstName | String | Sí | Not blank, max 100 |
| lastName | String | Sí | Not blank, max 100 |
| idCard | Integer | Sí | > 0, único |
| identificationType | IdentificationType | Sí | Enum válido |
| email | String | Sí | Email válido, único |
| password | String | Sí | Min 8 chars |
| phoneNumber | String | No | - |
| direction | String | No | - |
| role | Role | No | Default: USER |

#### LoginRequest
| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| email | String | Sí | Email válido |
| password | String | Sí | Not blank |

#### AuthResponse
| Campo | Tipo | Descripción |
|-------|------|-------------|
| token | String | JWT token |
| email | String | Email del usuario |
| firstName | String | Nombre |
| lastName | String | Apellido |
| role | Role | Rol del usuario |
| message | String | Mensaje de resultado |

### User Package

#### UserResponse
| Campo | Tipo | Descripción |
|-------|------|-------------|
| idCard | Integer | Identificación |
| firstName | String | Nombre |
| lastName | String | Apellido |
| email | String | Email |
| phoneNumber | String | Teléfono |
| direction | String | Dirección |
| role | Role | Rol |
| active | Boolean | Activo |
| registrationDate | LocalDateTime | Fecha registro |

#### UpdateUserRequest
| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| firstName | String | No | Max 100 |
| lastName | String | No | Max 100 |
| phoneNumber | String | No | - |
| direction | String | No | - |

### Chat Package

#### ChatMessageRequest
| Campo | Tipo | Requerido | Validaciones |
|-------|------|-----------|--------------|
| chatInput | String | Sí | Not blank, max 5000 |

#### ChatMessageResponse
| Campo | Tipo | Descripción |
|-------|------|-------------|
| sessionId | String | UUID sesión |
| message | String | Mensaje usuario |
| response | String | Respuesta IA |
| timestamp | LocalDateTime | Timestamp respuesta |

#### ChatMessageDto
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Long | ID mensaje |
| sender | String | USER / AGENT |
| mensaje | String | Contenido |
| fechaEnvio | LocalDateTime | Timestamp |

#### ChatSessionDetailDto
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Long | ID sesión |
| sessionId | String | UUID sesión |
| titulo | String | Título (nullable) |
| fechaInicio | LocalDateTime | Inicio |
| fechaUltimaInteraccion | LocalDateTime | Última actividad |
| activa | Boolean | Estado |
| mensajes | List<ChatMessageDto> | Historial completo |

---

## Variables de Entorno

### Backend (application.properties)

| Variable | Descripción | Ejemplo | Requerido |
|----------|-------------|---------|-----------|
| URL_DB | JDBC URL PostgreSQL | jdbc:postgresql://host:5432/db | Sí |
| USER_NAME | Usuario BD | alphabrein | Sí |
| PASSWORD_DB | Password BD | ******** | Sí |
| TOKEN_JWT | Secret key Base64 | openssl rand -base64 32 | Sí |
| USER_NAME_MAIL | Email Gmail | user@gmail.com | No |
| APP_PASSWORD | App Password Gmail | xxxx xxxx xxxx xxxx | No |
| N8N_WEBHOOK_URL | URL webhook n8n | https://n8n.io/webhook/... | No |
| ACCESS_TOKEN | Token Mercado Pago | APP_USR-... | No |

### Frontend (.env)

| Variable | Descripción | Ejemplo | Requerido |
|----------|-------------|---------|-----------|
| VITE_API_URL | URL backend API | http://localhost:8080 | Sí |

### Docker Compose

| Variable | Descripción | Default |
|----------|-------------|---------|
| POSTGRES_DB | Nombre BD | alphabrein |
| POSTGRES_USER | Usuario BD | alphabrein |
| POSTGRES_PASSWORD | Password BD | alphabrein |
| GRAFANA_ADMIN_USER | Usuario Grafana | admin |
| GRAFANA_ADMIN_PASSWORD | Password Grafana | admin |

---

## Códigos de Error Comunes

| Código HTTP | Código App | Mensaje | Causa |
|-------------|------------|---------|-------|
| 400 | EMAIL_EXISTS | El email ya está registrado | Duplicate key CORREO |
| 400 | ID_CARD_EXISTS | La identificación ya existe | Duplicate key IDENTIFICACION |
| 400 | INVALID_CREDENTIALS | Credenciales inválidas | Email no existe o password incorrecto |
| 401 | TOKEN_EXPIRED | Token expirado | JWT exp > now |
| 401 | TOKEN_INVALID | Token inválido | Firma incorrecta |
| 403 | ACCESS_DENIED | No tienes permiso | Usuario no propietario recurso |
| 404 | SESSION_NOT_FOUND | Sesión no encontrada | SESSION_ID no existe |
| 404 | USER_NOT_FOUND | Usuario no encontrado | IDENTIFICACION no existe |
| 500 | N8N_ERROR | Error comunicando con n8n | Webhook falla/timeout |
| 500 | INTERNAL_ERROR | Error interno del servidor | Excepción no controlada |

---

## Configuración de Puertos

| Servicio | Puerto Dev | Puerto Prod | Protocolo |
|----------|------------|-------------|-----------|
| Frontend | 5173 | 80/443 | HTTP/HTTPS |
| Backend | 8080 | 8080 (interno) | HTTP |
| PostgreSQL | 5434 | 5432 (interno) | TCP |
| Prometheus | 9090 | 9090 | HTTP |
| Grafana | 3000 | 3000 | HTTP |
| Graphite | 8081/2003/2004 | - | TCP/UDP |

---

## Naming Conventions

### Base de Datos
- Tablas: UPPER_SNAKE_CASE (USUARIO, CHAT_SESSION)
- Columnas: UPPER_SNAKE_CASE (FECHA_REGISTRO, N8N_SESSION_ID)
- PK: ID o nombre negocio (IDENTIFICACION)
- FK: TABLA_REFERENCIADA_ID (USER_ID, SESSION_ID)
- Índices: idx_tabla_columna

### Java
- Paquetes: lowercase (com.example.bcrypt2025.auth)
- Clases: PascalCase (User, ChatSession, AuthService)
- Interfaces: PascalCase (UserRepository)
- Implementaciones: Impl suffix (AuthServiceImpl)
- DTOs: Request/Response/Dto suffix
- Enums: PascalCase singular (Role, IdentificationType)
- Constantes: UPPER_SNAKE_CASE

### API REST
- Endpoints: kebab-case (/api/chat/session)
- Parámetros query: camelCase (?sessionId=)
- Body JSON: camelCase ({chatInput: "..."})
- Path variables: kebab-case (/{sessionId})

---

## Versionado de Esquema

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | Mayo 2026 | Esquema inicial: USUARIO, CHAT_SESSION, CHAT_MESSAGE |
| 1.1 | Pendiente | Agregar tabla de auditoría, roles extendidos |

---

**Última actualización**: Agosto 2026  
**Versión**: 1.0  
**SGBD**: PostgreSQL 16+