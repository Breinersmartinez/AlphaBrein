# INSTALLATION.md - Guía de Instalación y Configuración

## 📋 Requisitos Previos

### Sistema Operativo
- Linux, macOS o Windows 10+
- Git instalado (`git --version`)
- Acceso a internet

### Backend (Java)
```
Java 17 SDK                    ✓ Requerido
Maven 3.8+                     ✓ Requerido
PostgreSQL 14+ (local)         ○ Opcional (usaremos Neon DB)
```

**Verificar instalaciones**:
```bash
java -version
mvn -v
```

### Frontend (Node.js)
```
Node.js 18+                    ✓ Requerido
npm 9+                         ✓ Incluido con Node.js
```

**Verificar**:
```bash
node -v
npm -v
```

### Cuentas Externas
- Neon DB Account (https://neon.tech)
- n8n Account (https://n8n.io) o instancia local
- Gmail Account (para envío de emails)

---

## 🔨 Instalación Step-by-Step

### Paso 1: Clonar Repositorio

```bash
git clone https://github.com/yourusername/alphabrein.git
cd AlphaBrein
```

**Verificar estructura**:
```bash
ls -la
# Debe mostrar:
# bcrypt2025-springboot/
# bcrypt2025-front-end/
# db/
# docs/
# README.md
```

---

### Paso 2: Configurar Backend (Spring Boot)

#### 2.1 Crear Base de Datos en Neon DB

1. Ir a https://neon.tech
2. Sign up / Login
3. Crear nuevo proyecto
4. Copiar connection string:
   ```
   postgresql://user:password@host:5432/neondb
   ```

#### 2.2 Configurar Variables de Entorno

```bash
cd bcrypt2025-springboot
```

**Opción A: Archivo `.env` (desarrollo)**

Crear `.env` en raíz del proyecto:
```properties
URL_DB=postgresql://your_user:your_password@your_host:5432/alphabrein
USER_NAME=your_user
PASSWORD_DB=your_password
TOKEN_JWT=YOUR_BASE64_ENCODED_SECRET_KEY
USER_NAME_MAIL=your_email@gmail.com
APP_PASSWORD=your_app_specific_password
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/alphabrein
ACCESS_TOKEN=optional_meli_token
```

**Opción B: System environment variables**

```bash
export URL_DB=postgresql://...
export USER_NAME=...
export PASSWORD_DB=...
export TOKEN_JWT=...
export USER_NAME_MAIL=...
export APP_PASSWORD=...
export N8N_WEBHOOK_URL=...
```

#### 2.3 Generar JWT Secret Key

```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Java
java -c "import java.util.Base64; import java.security.SecureRandom; byte[] key = new byte[32]; new SecureRandom().nextBytes(key); System.out.println(Base64.getEncoder().encodeToString(key));"

# Copiar output y asignarlo a TOKEN_JWT
```

**Configurar application.properties**:

Editar `src/main/resources/application.properties`:

```properties
# Base de Datos
spring.datasource.url=${URL_DB}
spring.datasource.username=${USER_NAME}
spring.datasource.password=${PASSWORD_DB}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# JWT
jwt.secret.key=${TOKEN_JWT}
jwt.expiration.time=86400000

# Servidor
server.port=8080

# Gmail
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${USER_NAME_MAIL}
spring.mail.password=${APP_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# n8n
n8n.webhook.url=${N8N_WEBHOOK_URL}

# Logging
logging.level.root=INFO
logging.level.com.example.bcrypt2025=DEBUG
```

#### 2.4 Compilar Backend

```bash
./mvnw clean compile
```

**Esperado**:
```
[INFO] BUILD SUCCESS
```

#### 2.5 Run Tests (Opcional)

```bash
./mvnw test
```

#### 2.6 Ejecutar Backend

```bash
./mvnw spring-boot:run
```

**Esperado**: El servidor inicia en `http://localhost:8080`

```
2025-01-15 10:30:00 - Started Bcrypt2025Application in 3.5 seconds
```

**Verificar en browser**: 
```
http://localhost:8080/swagger-ui.html
```

---

### Paso 3: Configurar Frontend (React)

#### 3.1 Instalar Dependencias

```bash
cd ../bcrypt2025-front-end
npm install
```

**Esperado**: Sin errores, `node_modules/` creado

```
added 1234 packages in 45s
```

#### 3.2 Configurar Variables de Entorno

Crear/editar `.env`:

```
VITE_API_URL=http://localhost:8080
```

#### 3.3 Ejecutar Desarrollo

```bash
npm run dev
```

**Esperado**: 
```
  VITE v5.1.7  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Acceder**: `http://localhost:5173`

---

### Paso 4: Probar Autenticación

#### 4.1 Crear Usuario

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "idCard": 123456789,
    "identificationType": "CC",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "phoneNumber": "+573005551234",
    "direction": "Test Address",
    "role": "USER"
  }'
```

**Esperado**:
```json
{
  "token": "eyJhbGci...",
  "email": "test@example.com",
  "message": "Usuario registrado exitosamente"
}
```

#### 4.2 Hacer Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

**Esperado**: JWT token

#### 4.3 Crear Sesión de Chat

```bash
TOKEN="eyJhbGci..."

curl -X POST http://localhost:8080/api/chat/session \
  -H "Authorization: Bearer $TOKEN"
```

**Esperado**:
```json
{
  "id": 1,
  "sessionId": "uuid-here",
  "activa": true
}
```

---

## ⚙️ Configuración Avanzada

### Base de Datos PostgreSQL Local (Alternativa a Neon)

**Instalar PostgreSQL**:

```bash
# macOS
brew install postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Windows
# Descargar desde https://www.postgresql.org/download/windows/
```

**Crear database local**:

```bash
psql -U postgres

postgres=# CREATE DATABASE alphabrein;
postgres=# CREATE USER alphabrein_user WITH PASSWORD 'your_secure_password';
postgres=# ALTER ROLE alphabrein_user SET client_encoding TO 'utf8';
postgres=# ALTER ROLE alphabrein_user SET default_transaction_isolation TO 'read committed';
postgres=# ALTER ROLE alphabrein_user SET default_transaction_deferrable TO on;
postgres=# ALTER ROLE alphabrein_user SET search_path TO public;
postgres=# GRANT ALL PRIVILEGES ON DATABASE alphabrein TO alphabrein_user;
postgres=# \q
```

**Actualizar application.properties**:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/alphabrein
spring.datasource.username=alphabrein_user
spring.datasource.password=your_secure_password
```

---

### Configurar Gmail para Emails

1. **Ir a**: https://myaccount.google.com/security

2. **Habilitar "Less secure apps"** (deprecated) o usar **App Password**:
   - 2-factor authentication → App passwords
   - Seleccionar "Mail" y "Windows"
   - Copiar password de 16 caracteres

3. **Actualizar `.env`**:
```
USER_NAME_MAIL=tu_email@gmail.com
APP_PASSWORD=xxxx xxxx xxxx xxxx
```

---

### Docker (Opcional)

**Containerizar backend**:

```bash
cd bcrypt2025-springboot

# Build image
docker build -t alphabrein:latest .

# Run container
docker run -p 8080:8080 \
  -e URL_DB=postgresql://host:5432/alphabrein \
  -e TOKEN_JWT=your_secret \
  alphabrein:latest
```

---

## 🧪 Verificación de Instalación

```bash
# 1. Backend respondiendo
curl http://localhost:8080/swagger-ui.html

# 2. Base de datos conectada
curl http://localhost:8080/api/users/me (401 is OK - needs token)

# 3. Frontend cargando
curl http://localhost:5173

# 4. CORS habilitado
curl -X OPTIONS http://localhost:8080/api/chat/sessions
```

---

## 📝 Troubleshooting Instalación

### Error: "Port 8080 already in use"

```bash
# Kill proceso en puerto 8080
# macOS/Linux
lsof -i :8080 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows
netstat -ano | findstr :8080
taskkill /PID {PID} /F

# O cambiar puerto en application.properties:
server.port=8081
```

### Error: "Cannot connect to database"

```bash
# 1. Verificar credenciales en .env
# 2. Verificar IP/host es accesible
# 3. Para Neon: agregar IP whitelist

# Test conexión:
psql -h your_host -U your_user -d alphabrein
```

### Error: "TOKEN_JWT no encontrado"

```bash
# Asegurarse que .env se carga:
echo $TOKEN_JWT

# O pasar directamente:
export TOKEN_JWT=your_base64_key
```

### Error: npm install falla

```bash
# Limpiar cache
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 🚀 Setup Recomendado para Desarrollo

### IDE / Editor

**Backend**:
- IntelliJ IDEA Community (gratis)
- VS Code + Extension Pack for Java

**Frontend**:
- VS Code + ESLint + Prettier

### Extensiones Recomendadas

**Chrome DevTools**:
```
React Developer Tools
Redux DevTools
```

**VS Code Backend**:
```
Extension Pack for Java (Microsoft)
Spring Boot Extension Pack (Pivotal)
REST Client (Huachao Mao)
```

**VS Code Frontend**:
```
ES7+ React/Redux/React-Native snippets
Tailwind CSS IntelliSense
Prettier - Code formatter
```

---

## 📊 Verificación de Stack

```bash
# Backend
java -version          # Java 17+
mvn -v                 # Maven 3.8+
./mvnw -v              # Maven wrapper

# Frontend
node -v                # Node 18+
npm -v                 # npm 9+

# Base de Datos
psql --version         # PostgreSQL 14+ (si local)

# Herramientas útiles
curl --version         # Para testing API
git --version          # Git
```

---

## ✅ Checklist de Instalación Exitosa

- [ ] Backend compila sin errores
- [ ] Backend inicia en puerto 8080
- [ ] Swagger UI accesible en `/swagger-ui.html`
- [ ] Base de datos conectada (logs sin error)
- [ ] Frontend npm dependencies instaladas
- [ ] Frontend inicia en puerto 5173
- [ ] Puedo acceder a http://localhost:5173
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Crear sesión de chat funciona
- [ ] Enviar mensaje funciona (con n8n configurado)

---

## 📚 Siguientes Pasos

1. **Leer documentación**:
   - [API.md](API.md) - Referencia de endpoints
   - [AUTHENTICATION.md](AUTHENTICATION.md) - Detalles de JWT/BCrypt
   - [CHAT_SYSTEM.md](CHAT_SYSTEM.md) - Sistema de chat

2. **Explorar código**:
   - Backend: `bcrypt2025-springboot/src/main/java/com/example/bcrypt2025/`
   - Frontend: `bcrypt2025-front-end/src/`

3. **Configurar Webhooks n8n**:
   - Ver [DEPLOYMENT.md](DEPLOYMENT.md)

4. **Ejecutar tests**:
   - Ver [TESTING.md](TESTING.md)

---

**Última actualización**: Mayo 2026  
**Versión**: 1.0  
**Compatibilidad**: Windows, macOS, Linux
