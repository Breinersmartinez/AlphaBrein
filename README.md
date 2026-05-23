# AlphaBrein

AlphaBrein es una plataforma de autenticación y chat basada en Spring Boot, MySQL y bcrypt. El proyecto está diseñado para demostrar el uso seguro de contraseñas y la gestión de sesiones de chat mediante autenticación JWT.

## Descripción

Este proyecto implementa un sistema de registro, inicio de sesión y mensajería de chat con las siguientes características:

- Registro de usuarios con cifrado de contraseñas mediante bcrypt.
- Inicio de sesión con autenticación JWT.
- Creación y gestión de sesiones de chat autenticadas.
- Envío de mensajes de usuario y generación de respuestas de agente.
- Consultas del historial de sesiones y cierre de sesiones.

## Estructura del repositorio

La raíz del proyecto contiene dos subproyectos principales:

- `bcrypt2025-springboot`: backend en Java con Spring Boot.
- `bcrypt2025-front-end`: frontend en React.

## Tecnologías principales

- Java 17
- Spring Boot
- Spring Security
- JWT
- PostgreSQL
- bcrypt
- React
- Vite
- Tailwind CSS

## Requisitos

- Java 17 o superior
- Maven
- Node.js y npm o yarn
- PostgreSQL

## Configuración y ejecución

### Backend

1. Abrir `bcrypt2025-springboot/src/main/resources/application.properties` y configurar la conexión a la base de datos MySQL.
2. Compilar el proyecto:

   ./mvnw clean package

3. Ejecutar la aplicación:

   ./mvnw spring-boot:run

La API estará disponible en `http://localhost:8080`.

### Frontend

1. Acceder a la carpeta `bcrypt2025-front-end`.
2. Instalar dependencias:

   npm install

3. Iniciar la aplicación:

   npm run dev

El frontend se ejecutará en el puerto configurado por Vite, típicamente `http://localhost:5173`.

## API principal

### Autenticación

#### Registro de usuario

POST `/api/auth/register`

Request body:

```json
{
  "firstName": "Breiner",
  "lastName": "López",
  "idCard": 1234567890,
  "identificationType": "CC",
  "email": "breiner@example.com",
  "password": "password123",
  "phoneNumber": "3005551234",
  "direction": "Calle 1 #2-3"
}
```

Respuesta esperada:

```json
{
  "token": "...",
  "message": "Usuario registrado exitosamente"
}
```

#### Inicio de sesión

POST `/api/auth/login`

Request body:

```json
{
  "email": "breiner@example.com",
  "password": "password123"
}
```

Respuesta esperada:

```json
{
  "token": "...",
  "message": "Login exitoso"
}
```

### Chat

#### Crear o recuperar sesión de chat

POST `/api/chat/session`

Headers:

- `Content-Type: application/json`
- `Authorization: Bearer {token}`

Respuesta de ejemplo:

```json
{
  "id": 1,
  "sessionId": "38c2a0d1-c889-48e0-9c63-a41f04cbb787",
  "user": {
    "idCard": 1234567890,
    "firstName": "Breiner",
    "lastName": "López",
    "email": "breiner@example.com"
  },
  "n8nSessionId": "38c2a0d1-c889-48e0-9c63-a41f04cbb787",
  "createdAt": "2025-01-15T10:30:00",
  "lastActivity": "2025-01-15T10:30:00",
  "active": true
}
```

#### Enviar mensaje de chat

POST `/api/chat/message`

Headers:

- `Content-Type: application/json`
- `Authorization: Bearer {token}`

Request body:

```json
{
  "chatInput": "muy bien gracias, como vas? soy breiner"
}
```

Respuesta de ejemplo:

```json
{
  "sessionId": "38c2a0d1-c889-48e0-9c63-a41f04cbb787",
  "message": "muy bien gracias, como vas? soy breiner",
  "response": "¡Hola Breiner! Me alegra saludarte. Todo va bien por aquí..."
}
```

#### Cerrar sesión de chat

POST `/api/chat/session/{sessionId}/close`

Headers:

- `Authorization: Bearer {token}`

Respuesta esperada: `200 OK`

#### Obtener historial de una sesión

GET `/api/chat/session/{sessionId}/history`

Headers:

- `Authorization: Bearer {token}`

#### Obtener todas las sesiones del usuario

GET `/api/chat/sessions`

Headers:

- `Authorization: Bearer {token}`

## Ejemplos de uso

### JavaScript (Fetch)

1. Iniciar sesión en `/api/auth/login`.
2. Enviar el token en el encabezado `Authorization: Bearer {token}`.
3. Crear sesión en `/api/chat/session`.
4. Enviar mensajes a `/api/chat/message`.
5. Cerrar sesión en `/api/chat/session/{sessionId}/close`.

### Python (requests)

1. Iniciar sesión en `/api/auth/login`.
2. Agregar el token en `Authorization`.
3. Crear sesión en `/api/chat/session`.
4. Enviar mensajes a `/api/chat/message`.
5. Cerrar sesión en `/api/chat/session/{sessionId}/close`.

## Notas

- El proyecto se centra en la seguridad de contraseñas mediante bcrypt y en la gestión de autenticación con JWT.
- La separación del frontend y backend permite un desarrollo independiente más claro.
- La configuración de la base de datos y las variables de entorno se realiza en los archivos correspondientes de cada subproyecto.
