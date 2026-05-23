# API.md - Referencia Completa de Endpoints

## 📡 Introducción

AlphaBrein expone una API REST completamente documentada con Swagger/OpenAPI. Todos los endpoints requieren:

- Base URL: `http://localhost:8080` (desarrollo)
- Content-Type: `application/json`
- CORS: Habilitado para `*`

---

## 🔐 Autenticación

### Headers Requeridos

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Token JWT

Obtenido del endpoint `/api/auth/login` o `/api/auth/register`. Válido por **24 horas** (86400000 ms).

**Estructura del Token**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNjg0NzA3Njk2LCJleHAiOjE2ODQ3OTQwOTZ9.
TJVA95OrMZ7zKQ6MJEiVdq_Z-e3_hZW8AuqVUDnB2T8
```

---

## 🧑‍💼 Autenticación (Authentication)

### 1. Registrar Usuario

**Endpoint**: `POST /api/auth/register`  
**Autenticación**: No requerida  
**Rate Limit**: Sin límite  
**CORS**: Habilitado  

**Request Body**:
```json
{
  "firstName": "Breiner",
  "lastName": "López García",
  "idCard": 1234567890,
  "identificationType": "CC",
  "email": "breiner@example.com",
  "password": "SecurePassword123!",
  "phoneNumber": "+573005551234",
  "direction": "Calle 1 #2-3, Apartado 101",
  "role": "USER"
}
```

**Request Validations**:
- `firstName`: String, no vacío, max 100 chars
- `lastName`: String, no vacío, max 100 chars
- `idCard`: Integer, único en BD, > 0
- `identificationType`: Enum (CC, CE, PP, PEP, NIT)
- `email`: String, email válido, único en BD
- `password`: String, min 8 chars (bcrypt hash con salt rounds)
- `phoneNumber`: String, opcional
- `direction`: String, opcional
- `role`: Enum (USER, ADMIN) - default: USER

**Success Response (201 Created)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "breiner@example.com",
  "firstName": "Breiner",
  "lastName": "López García",
  "role": "USER",
  "message": "Usuario registrado exitosamente"
}
```

**Error Response (400 Bad Request)**:
```json
{
  "message": "El email ya está registrado"
}
```

**HTTP Status Codes**:
| Code | Meaning |
|------|---------|
| `201` | Usuario creado exitosamente |
| `400` | Email o idCard duplicados |
| `400` | Validación de datos falló |
| `500` | Error interno del servidor |

**Email Enviado**:
- Destinatario: Email del usuario registrado
- Asunto: "¡Bienvenido a AlphaBrein!"
- Contenido: Detalles de registro + links de soporte

**Ejemplo cURL**:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Breiner",
    "lastName": "López",
    "idCard": 1234567890,
    "identificationType": "CC",
    "email": "breiner@example.com",
    "password": "SecurePassword123!",
    "phoneNumber": "+573005551234",
    "direction": "Calle 1 #2-3",
    "role": "USER"
  }'
```

**Ejemplo JavaScript**:
```javascript
const response = await fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    firstName: 'Breiner',
    lastName: 'López',
    idCard: 1234567890,
    identificationType: 'CC',
    email: 'breiner@example.com',
    password: 'SecurePassword123!',
    phoneNumber: '+573005551234',
    direction: 'Calle 1 #2-3',
    role: 'USER'
  })
});

const data = await response.json();
console.log(data.token); // Store this token
```

**Ejemplo Python**:
```python
import requests
import json

url = 'http://localhost:8080/api/auth/register'
payload = {
    'firstName': 'Breiner',
    'lastName': 'López',
    'idCard': 1234567890,
    'identificationType': 'CC',
    'email': 'breiner@example.com',
    'password': 'SecurePassword123!',
    'phoneNumber': '+573005551234',
    'direction': 'Calle 1 #2-3',
    'role': 'USER'
}

response = requests.post(url, json=payload)
data = response.json()
print(f"Token: {data['token']}")
```

---

### 2. Login

**Endpoint**: `POST /api/auth/login`  
**Autenticación**: No requerida  
**Rate Limit**: Sin límite (implementar futura mejora)  
**CORS**: Habilitado  

**Request Body**:
```json
{
  "email": "breiner@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "breiner@example.com",
  "firstName": "Breiner",
  "lastName": "López García",
  "role": "USER",
  "message": "Login exitoso"
}
```

**Error Response (400 Bad Request)**:
```json
{
  "message": "Credenciales inválidas"
}
```

**HTTP Status Codes**:
| Code | Meaning |
|------|---------|
| `200` | Login exitoso |
| `400` | Email no existe o password incorrecto |
| `401` | Usuario inactivo |
| `500` | Error interno del servidor |

**Token Válido Por**: 24 horas

**Notas**:
- La comparación de password usa BCrypt con salt rounds configurados
- Si el usuario no existe, retorna "Credenciales inválidas" (no revela si existe)
- Si la contraseña es incorrecta, también retorna el mismo mensaje

**Ejemplo cURL**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "breiner@example.com",
    "password": "SecurePassword123!"
  }'
```

**Ejemplo JavaScript**:
```javascript
const response = await fetch('http://localhost:8080/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'breiner@example.com',
    password: 'SecurePassword123!'
  })
});

const { token } = await response.json();
localStorage.setItem('token', token);
localStorage.setItem('email', 'breiner@example.com');
```

---

## 💬 Chat (Chat Management)

### 1. Crear/Obtener Sesión de Chat

**Endpoint**: `POST /api/chat/session`  
**Autenticación**: Requerida (JWT)  
**Roles**: USER, ADMIN  
**CORS**: Habilitado  

**Request Body**: Empty or `{}`

**Success Response (200 OK)**:
```json
{
  "id": 1,
  "sessionId": "38c2a0d1-c889-48e0-9c63-a41f04cbb787",
  "user": null,
  "n8nSessionId": "38c2a0d1-c889-48e0-9c63-a41f04cbb787",
  "titulo": null,
  "fechaInicio": "2025-01-15T10:30:00",
  "fechaUltimaInteraccion": "2025-01-15T10:30:00",
  "activa": true,
  "createdAt": "2025-01-15T10:30:00",
  "updatedAt": "2025-01-15T10:30:00"
}
```

**HTTP Status Codes**:
| Code | Meaning |
|------|---------|
| `200` | Sesión creada/obtenida |
| `401` | Token inválido o expirado |
| `403` | Acceso denegado |
| `500` | Error interno |

**Notas**:
- Siempre crea una **nueva sesión** (no reutiliza)
- `sessionId` es único (UUID v4)
- `n8nSessionId` permite linking con workflows de n8n
- Usuario NO se retorna en JSON (Jackson @JsonIgnore)

**Ejemplo cURL**:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:8080/api/chat/session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

**Ejemplo JavaScript**:
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:8080/api/chat/session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});

const session = await response.json();
console.log(session.sessionId); // Guardar para enviar mensajes
```

---

### 2. Enviar Mensaje

**Endpoint**: `POST /api/chat/message`  
**Autenticación**: Requerida (JWT)  
**Query Parameters**: `sessionId` (required)  
**Roles**: USER, ADMIN  
**CORS**: Habilitado  

**Query String**:
```
?sessionId=38c2a0d1-c889-48e0-9c63-a41f04cbb787
```

**Request Body**:
```json
{
  "chatInput": "¿Cuáles son mis derechos laborales en caso de despido?"
}
```

**Success Response (200 OK)**:
```json
{
  "sessionId": "38c2a0d1-c889-48e0-9c63-a41f04cbb787",
  "message": "¿Cuáles son mis derechos laborales en caso de despido?",
  "response": "De acuerdo a la Ley 50 de 1990...",
  "timestamp": "2025-01-15T10:31:00"
}
```

**Error Response (400 Bad Request)**:
```json
{
  "message": "Sesión no encontrada"
}
```

**HTTP Status Codes**:
| Code | Meaning |
|------|---------|
| `200` | Mensaje enviado y respuesta recibida |
| `400` | sessionId no existe o error en n8n |
| `401` | Token inválido |
| `403` | Usuario no propietario de sesión |
| `500` | Error comunicando con n8n |

**Flujo Interno**:
1. Valida sesión existe
2. Persiste mensaje: `{ sender: "USER", mensaje: input }`
3. Envía webhook a n8n con `n8nSessionId`
4. Espera respuesta de n8n (timeout implícito)
5. Persiste respuesta: `{ sender: "AGENT", mensaje: response }`
6. Retorna ambos mensajes

**Notas**:
- n8n response se asume JSON string y se parsea
- Si parse falla, se retorna el raw string
- Último mensaje actualiza `fechaUltimaInteraccion` de sesión
- Mensajes no se **eliminan** aunque sesión cierre (auditoría)

**Ejemplo cURL**:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SESSION_ID="38c2a0d1-c889-48e0-9c63-a41f04cbb787"

curl -X POST "http://localhost:8080/api/chat/message?sessionId=$SESSION_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chatInput": "¿Cuáles son mis derechos laborales?"
  }'
```

**Ejemplo JavaScript**:
```javascript
const token = localStorage.getItem('token');
const sessionId = '38c2a0d1-c889-48e0-9c63-a41f04cbb787';

const response = await fetch(
  `http://localhost:8080/api/chat/message?sessionId=${sessionId}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      chatInput: '¿Cuáles son mis derechos laborales?'
    })
  }
);

const data = await response.json();
console.log('User said:', data.message);
console.log('AI responded:', data.response);
```

---

### 3. Obtener Historial de Sesión

**Endpoint**: `GET /api/chat/session/{sessionId}/history`  
**Autenticación**: Requerida (JWT)  
**Path Parameters**: `sessionId` (required, UUID)  
**Roles**: USER, ADMIN (solo propietario)  
**CORS**: Habilitado  

**Success Response (200 OK)**:
```json
{
  "id": 1,
  "sessionId": "38c2a0d1-c889-48e0-9c63-a41f04cbb787",
  "titulo": null,
  "fechaInicio": "2025-01-15T10:30:00",
  "fechaUltimaInteraccion": "2025-01-15T10:35:00",
  "activa": true,
  "mensajes": [
    {
      "id": 1,
      "sender": "USER",
      "mensaje": "¿Cuáles son mis derechos?",
      "fechaEnvio": "2025-01-15T10:31:00"
    },
    {
      "id": 2,
      "sender": "AGENT",
      "mensaje": "{\"output\": \"De acuerdo a la ley...\"}",
      "fechaEnvio": "2025-01-15T10:31:05"
    },
    {
      "id": 3,
      "sender": "USER",
      "mensaje": "¿Y sobre vacaciones?",
      "fechaEnvio": "2025-01-15T10:32:00"
    },
    {
      "id": 4,
      "sender": "AGENT",
      "mensaje": "{\"output\": \"Las vacaciones son un derecho...\"}",
      "fechaEnvio": "2025-01-15T10:32:05"
    }
  ]
}
```

**Error Response (404 Not Found)**:
```json
{
  "message": "Sesión no encontrada"
}
```

**Error Response (403 Forbidden)**:
```json
{
  "message": "No tienes permiso para ver esta sesión"
}
```

**HTTP Status Codes**:
| Code | Meaning |
|------|---------|
| `200` | Historial retornado |
| `400` | sessionId inválido |
| `401` | Token inválido |
| `403` | Usuario no propietario |
| `404` | Sesión no existe |
| `500` | Error interno |

**Notas**:
- Retorna mensajes en orden cronológico (ASC)
- User está oculto del JSON (seguridad)
- Mensajes incluyen timestamps originales
- Disponible incluso si sesión está cerrada

**Ejemplo cURL**:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SESSION_ID="38c2a0d1-c889-48e0-9c63-a41f04cbb787"

curl -X GET "http://localhost:8080/api/chat/session/$SESSION_ID/history" \
  -H "Authorization: Bearer $TOKEN"
```

**Ejemplo JavaScript**:
```javascript
const token = localStorage.getItem('token');
const sessionId = '38c2a0d1-c889-48e0-9c63-a41f04cbb787';

const response = await fetch(
  `http://localhost:8080/api/chat/session/${sessionId}/history`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
);

const history = await response.json();
history.mensajes.forEach(msg => {
  console.log(`${msg.sender}: ${msg.mensaje}`);
});
```

---

### 4. Obtener Todas las Sesiones del Usuario

**Endpoint**: `GET /api/chat/sessions`  
**Autenticación**: Requerida (JWT)  
**Roles**: USER, ADMIN  
**CORS**: Habilitado  

**Success Response (200 OK)**:
```json
[
  {
    "id": 1,
    "sessionId": "38c2a0d1-c889-48e0-9c63-a41f04cbb787",
    "n8nSessionId": "38c2a0d1-c889-48e0-9c63-a41f04cbb787",
    "titulo": null,
    "fechaInicio": "2025-01-15T10:30:00",
    "fechaUltimaInteraccion": "2025-01-15T10:35:00",
    "activa": true,
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-15T10:35:00"
  },
  {
    "id": 2,
    "sessionId": "f7e8d9c0-1234-5678-9abc-def012345678",
    "n8nSessionId": "f7e8d9c0-1234-5678-9abc-def012345678",
    "titulo": null,
    "fechaInicio": "2025-01-14T14:20:00",
    "fechaUltimaInteraccion": "2025-01-14T14:45:00",
    "activa": false,
    "createdAt": "2025-01-14T14:20:00",
    "updatedAt": "2025-01-14T14:45:00"
  }
]
```

**HTTP Status Codes**:
| Code | Meaning |
|------|---------|
| `200` | Sesiones retornadas (puede ser []) |
| `401` | Token inválido |
| `500` | Error interno |

**Notas**:
- Solo retorna sesiones **activas** (`activa = true`)
- Ordenadas por fecha de creación (descendente implícito)
- Lista vacía si no hay sesiones

**Ejemplo cURL**:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:8080/api/chat/sessions \
  -H "Authorization: Bearer $TOKEN"
```

---

### 5. Cerrar Sesión de Chat

**Endpoint**: `POST /api/chat/session/{sessionId}/close`  
**Autenticación**: Requerida (JWT)  
**Path Parameters**: `sessionId` (required)  
**Roles**: USER, ADMIN (solo propietario)  
**CORS**: Habilitado  

**Request Body**: Empty or `{}`

**Success Response (204 No Content)**:
```
(sin body)
```

**Error Response (403 Forbidden)**:
```json
{
  "message": "No tienes permiso"
}
```

**HTTP Status Codes**:
| Code | Meaning |
|------|---------|
| `204` | Sesión cerrada exitosamente |
| `401` | Token inválido |
| `403` | Usuario no propietario |
| `404` | Sesión no existe |
| `500` | Error interno |

**Cambios Internos**:
- `ChatSession.activa` = `false`
- `ChatSession.updatedAt` = NOW
- Mensajes **no se eliminan** (auditoría)
- Nueva sesión necesaria para nuevo chat

**Notas**:
- Irreversible: sesión cerrada no se puede reabriendo
- Historial permanece accesible
- Usuario puede crear nueva sesión después

**Ejemplo cURL**:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SESSION_ID="38c2a0d1-c889-48e0-9c63-a41f04cbb787"

curl -X POST "http://localhost:8080/api/chat/session/$SESSION_ID/close" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 👥 Usuarios (User Management)

### 1. Listar Todos los Usuarios (ADMIN)

**Endpoint**: `GET /api/users`  
**Autenticación**: Requerida (JWT)  
**Roles**: **ADMIN only**  
**CORS**: Habilitado  

**Success Response (200 OK)**:
```json
[
  {
    "idCard": 1234567890,
    "firstName": "Breiner",
    "lastName": "López",
    "email": "breiner@example.com",
    "phoneNumber": "+573005551234",
    "role": "USER",
    "active": true,
    "registrationDate": "2025-01-15T10:00:00"
  },
  {
    "idCard": 9876543210,
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@example.com",
    "phoneNumber": "+573001234567",
    "role": "ADMIN",
    "active": true,
    "registrationDate": "2025-01-01T08:00:00"
  }
]
```

**HTTP Status Codes**:
| Code | Meaning |
|------|---------|
| `200` | Lista de usuarios |
| `401` | Token inválido |
| `403` | Usuario no es ADMIN |
| `500` | Error interno |

**Notas**:
- Requiere rol ADMIN (@PreAuthorize)
- Retorna todos los usuarios (activos e inactivos)
- **Password NO se retorna** (seguridad)

**Ejemplo cURL**:
```bash
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

### 2. Obtener Usuario por ID

**Endpoint**: `GET /api/users/{idCard}`  
**Autenticación**: Requerida (JWT)  
**Path Parameters**: `idCard` (required, integer)  
**Roles**: USER, ADMIN  
**CORS**: Habilitado  

**Success Response (200 OK)**:
```json
{
  "idCard": 1234567890,
  "firstName": "Breiner",
  "lastName": "López",
  "email": "breiner@example.com",
  "phoneNumber": "+573005551234",
  "role": "USER",
  "active": true,
  "registrationDate": "2025-01-15T10:00:00"
}
```

**Error Response (404 Not Found)**:
```json
{
  "message": "Usuario no encontrado"
}
```

**HTTP Status Codes**:
| Code | Meaning |
|------|---------|
| `200` | Usuario encontrado |
| `401` | Token inválido |
| `404` | Usuario no existe |
| `500` | Error interno |

**Notas**:
- Cualquier usuario autenticado puede llamar
- Requiere autenticación pero no rol específico
- **Password NO se retorna**

**Ejemplo cURL**:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:8080/api/users/1234567890 \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Obtener Perfil del Usuario Actual

**Endpoint**: `GET /api/users/me`  
**Autenticación**: Requerida (JWT)  
**Roles**: USER, ADMIN  
**CORS**: Habilitado  

**Success Response (200 OK)**:
```json
{
  "idCard": 1234567890,
  "firstName": "Breiner",
  "lastName": "López",
  "email": "breiner@example.com",
  "phoneNumber": "+573005551234",
  "role": "USER",
  "active": true,
  "registrationDate": "2025-01-15T10:00:00"
}
```

**HTTP Status Codes**:
| Code | Meaning |
|------|---------|
| `200` | Perfil retornado |
| `401` | Token inválido |
| `404` | Usuario no existe (raro) |
| `500` | Error interno |

**Notas**:
- Endpoint de conveniencia para obtener datos del usuario autenticado
- El email se extrae del JWT token
- Equivalente a `GET /api/users/{idCard}` pero automático

**Ejemplo cURL**:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```

**Ejemplo JavaScript**:
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:8080/api/users/me', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const profile = await response.json();
console.log(`Hola ${profile.firstName} ${profile.lastName}`);
```

---

### 4. Obtener Usuarios Activos (ADMIN)

**Endpoint**: `GET /api/users/active`  
**Autenticación**: Requerida (JWT)  
**Roles**: **ADMIN only**  
**CORS**: Habilitado  

**Success Response (200 OK)**:
```json
[
  {
    "idCard": 1234567890,
    "firstName": "Breiner",
    "lastName": "López",
    "email": "breiner@example.com",
    "role": "USER",
    "active": true
  }
]
```

**HTTP Status Codes**:
| Code | Meaning |
|------|---------|
| `200` | Lista de usuarios activos |
| `401` | Token inválido |
| `403` | Usuario no es ADMIN |
| `500` | Error interno |

---

### 5. Obtener Usuarios por Rol (ADMIN)

**Endpoint**: `GET /api/users/role/{role}`  
**Autenticación**: Requerida (JWT)  
**Path Parameters**: `role` (USER o ADMIN)  
**Roles**: **ADMIN only**  
**CORS**: Habilitado  

**Success Response (200 OK)**:
```json
[
  {
    "idCard": 1234567890,
    "firstName": "Breiner",
    "lastName": "López",
    "email": "breiner@example.com",
    "role": "USER",
    "active": true
  }
]
```

**HTTP Status Codes**:
| Code | Meaning |
|------|---------|
| `200` | Usuarios con rol específico |
| `401` | Token inválido |
| `403` | Usuario no es ADMIN |
| `500` | Error interno |

---

## 📊 Códigos HTTP Estándar

| Code | Nombre | Significado |
|------|--------|-----------|
| `200` | OK | Solicitud exitosa |
| `201` | Created | Recurso creado |
| `204` | No Content | Éxito sin body |
| `400` | Bad Request | Datos inválidos |
| `401` | Unauthorized | Token inválido/expirado |
| `403` | Forbidden | Acceso denegado |
| `404` | Not Found | Recurso no existe |
| `500` | Server Error | Error interno |

---

## 🔗 Relaciones Entre Endpoints

```
AUTENTICACIÓN
├─ POST /api/auth/register
│  └─ Crea usuario + genera token
├─ POST /api/auth/login
│  └─ Valida credenciales + genera token

CHAT
├─ POST /api/chat/session
│  └─ Crea sesión (usar sessionId en otros endpoints)
├─ POST /api/chat/message
│  └─ Requiere sessionId del endpoint anterior
├─ GET /api/chat/sessions
│  └─ Lista sesiones (extrae sessionId aquí)
├─ GET /api/chat/session/{sessionId}/history
│  └─ Usa sessionId de POST session o GET sessions
└─ POST /api/chat/session/{sessionId}/close
   └─ Cierra sessionId (no acepta mensajes después)

USUARIOS
├─ GET /api/users (ADMIN)
│  └─ Obtiene idCard de usuarios
├─ GET /api/users/{idCard} (CUALQUIERA)
│  └─ Usa idCard
├─ GET /api/users/me (CUALQUIERA)
│  └─ No requiere parámetros
├─ GET /api/users/active (ADMIN)
│  └─ Retorna idCard de usuarios activos
└─ GET /api/users/role/{role} (ADMIN)
   └─ Retorna usuarios por rol
```

---

## 📝 DTOs (Data Transfer Objects)

### AuthResponse
```json
{
  "token": "string (JWT)",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "enum (USER|ADMIN)",
  "message": "string"
}
```

### ChatMessageRequest
```json
{
  "chatInput": "string (requerido, no vacío)"
}
```

### ChatMessageResponse
```json
{
  "sessionId": "string (UUID)",
  "message": "string (lo que usuario escribió)",
  "response": "string (respuesta de n8n)",
  "timestamp": "string (ISO-8601)"
}
```

### UserResponse
```json
{
  "idCard": "integer",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phoneNumber": "string (nullable)",
  "direction": "string (nullable)",
  "role": "enum (USER|ADMIN)",
  "active": "boolean",
  "registrationDate": "string (ISO-8601)"
}
```

---

## 🧪 Validación de Entrada

### Email
- Formato válido (RFC 5322)
- Único en BD
- Max 255 caracteres

### Password (en login)
- Min 8 caracteres
- Comparado con BCrypt hash en BD

### idCard
- Integer positivo
- Único en BD
- No puede cambiar

### ChatInput
- String no vacío
- Max 5000 caracteres
- Charset UTF-8

---

## ⏱ Timeouts y SLAs

| Operación | Timeout | SLA |
|-----------|---------|-----|
| Login | 5s | 99.5% |
| Crear sesión | 2s | 99.9% |
| Enviar mensaje | 30s | 99% |
| Obtener historial | 10s | 99.9% |
| Listar sesiones | 5s | 99.9% |

---

## 🔍 Documentación Interactiva

Acceder a Swagger UI:
```
http://localhost:8080/swagger-ui.html
```

JSON OpenAPI:
```
http://localhost:8080/v3/api-docs
```

---

**Última actualización**: Mayo 2026  
**Versión API**: 1.0  
**Estado**: Producción
