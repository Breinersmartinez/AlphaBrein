# AlphaBrein

AlphaBrein es una plataforma de autenticación y chat inteligente basada en Spring Boot, PostgreSQL y bcrypt. El proyecto implementa un sistema seguro de registro, inicio de sesión y mensajería de chat con integración n8n para respuestas de IA, documentación automática con Swagger, monitoreo con Prometheus/Grafana y despliegue con Docker.

## Características Principales

- **Autenticación segura**: Registro/login con JWT y hashing de contraseñas BCrypt (strength=10)
- **Chat inteligente**: Sesiones de chat persistentes con integración n8n para IA
- **Arquitectura 3 capas**: Frontend (React 19 + Vite + Tailwind) → Backend (Spring Boot 3 + Java 17) → Base de datos (PostgreSQL)
- **API Documentada**: Swagger/OpenAPI en `/swagger-ui.html`
- **Monitoreo**: Prometheus + Grafana + Graphite
- **Despliegue**: Docker Compose (dev/prod) + Makefile
- **Emails**: Notificaciones via Gmail SMTP
- **Pagos**: Integración Mercado Pago (SDK Java)

## Estructura del Repositorio

```
AlphaBrein/
├── bcrypt2025-springboot/     # Backend Spring Boot
│   ├── src/main/java/com/example/bcrypt2025/
│   │   ├── auth/              # Autenticación (JWT, BCrypt, Controllers, Services)
│   │   ├── user/              # Gestión de usuarios (Model, DTO, Repository, Service)
│   │   ├── chatSession/       # Sesiones de chat (Model, DTO, Repository, Service, Controller)
│   │   ├── chatMessage/       # Mensajes de chat (Model, DTO, Repository)
│   │   ├── jwt/               # JWT Service & Filter
│   │   ├── config/            # Security, Mail, Swagger configs
│   │   └── audit/             # Auditable base class
│   ├── Dockerfile
│   └── pom.xml
├── bcrypt2025-front-end/      # Frontend React 19 + Vite + Tailwind
│   ├── src/
│   │   ├── components/        # Login, SignUp, Dashboard, ChatWindow, UserDashboard
│   │   ├── context/           # AuthContext (React Context API)
│   │   ├── services/          # AuthService, ChatService
│   │   └── assets/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── db/
│   └── alphabrein.sql         # Schema SQL
├── docs/                      # Documentación técnica
│   ├── ARCHITECTURE.md        # Arquitectura 3 capas, flujos, patrones
│   ├── API.md                 # Referencia completa de endpoints
│   ├── AUTHENTICATION.md      # JWT, BCrypt, Spring Security
│   ├── CHAT_SYSTEM.md         # Sistema de chat, ciclo de vida, n8n
│   ├── DATABASE.md            # Esquema BD, queries, índices
│   ├── INSTALLATION.md        # Guía paso a paso
│   ├── data_dictonary.md      # Diccionario de datos
│   └── image/                 # Diagramas de arquitectura
├── monitoring/
│   ├── prometheus/prometheus.yml
│   ├── grafana/datasources/
│   ├── grafana/dashboards/
│   └── graphite/storage-schemas.conf
├── n8n/
│   └── AlphaBrein.json        # Workflow n8n export
├── docker-compose.yml         # Desarrollo
├── docker-compose.prod.yml    # Producción
├── Makefile                   # Comandos Docker
├── .env.example               # Variables de entorno ejemplo
└── README.md
```

## Tecnologías

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Java | 17 | Lenguaje |
| Spring Boot | 3.4.4 | Framework |
| Spring Security | 3.x | Autenticación/Autorización |
| Spring Data JPA | 3.x | ORM |
| PostgreSQL Driver | 42.x | Conexión BD |
| JWT (jjwt) | 0.12.3 | Tokens |
| BCrypt | Spring Security | Hashing contraseñas |
| Swagger/OpenAPI | 2.8.6 | Documentación API |
| Actuator + Micrometer | 3.x | Métricas Prometheus |
| JavaMailSender | 3.x | Emails Gmail |
| Mercado Pago SDK | 2.1.7 | Pagos |

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.1.1 | UI Library |
| Vite | 7.1.7 | Build tool |
| Tailwind CSS | 4.1.17 | Styling |
| Lucide React | 0.544.0 | Iconos |
| pdfjs-dist | 5.4.149 | PDF viewer |
| mammoth | 1.11.0 | Word docs |

### Infraestructura
| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| PostgreSQL | 16-alpine | Base de datos |
| Docker | 20.x+ | Contenedores |
| Prometheus | 2.54.0 | Métricas |
| Grafana | 10.4.0 | Dashboards |
| Graphite | 1.1.10-3 | Métricas legacy |
| n8n | Latest | Workflow automation |

## Requisitos

- Java 17+
- Maven 3.8+ (o usar `./mvnw`)
- Node.js 18+ y npm 9+
- Docker 20+ y Docker Compose (para contenedores)
- Cuenta Neon DB (o PostgreSQL local)
- Cuenta n8n (para IA)
- Cuenta Gmail (para emails)

## Inicio Rápido

### Opción 1: Docker Compose (Recomendado)

```bash
# 1. Configurar variables de entorno
make env-example
# Editar .env con tus valores

# 2. Levantar todo (backend, frontend, postgres)
make up

# 3. Ver logs
make logs

# Servicios disponibles:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:8080
# - Swagger UI: http://localhost:8080/swagger-ui.html
# - Prometheus: http://localhost:9090
# - Grafana: http://localhost:3000 (admin/admin)
```

### Opción 2: Desarrollo Local

**Backend:**
```bash
cd bcrypt2025-springboot
# Configurar application.properties o variables de entorno
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd bcrypt2025-front-end
npm install
npm run dev
```

## Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```properties
# Database
POSTGRES_DB=alphabrein
POSTGRES_USER=alphabrein
POSTGRES_PASSWORD=secure_password

# Backend
TOKEN_JWT=your-base64-encoded-secret-key-min-32-chars
USER_NAME_MAIL=your-email@gmail.com
APP_PASSWORD=your-gmail-app-password
N8N_WEBHOOK_URL=https://your-n8n-instance/webhook/alphabrein
ACCESS_TOKEN=mercado-libre-token

# Frontend
VITE_API_URL=http://localhost:8080

# Monitoring
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=secure_password
```

**Generar JWT Secret:**
```bash
openssl rand -base64 32
```

## API Endpoints Principales

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |

### Chat
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/chat/session` | Crear/obtener sesión |
| POST | `/api/chat/message?sessionId=` | Enviar mensaje |
| GET | `/api/chat/sessions` | Listar sesiones |
| GET | `/api/chat/session/{id}/history` | Historial sesión |
| POST | `/api/chat/session/{id}/close` | Cerrar sesión |

### Usuarios (requiere ADMIN)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users` | Listar todos |
| GET | `/api/users/me` | Perfil actual |
| GET | `/api/users/{idCard}` | Usuario por ID |
| GET | `/api/users/active` | Usuarios activos |
| GET | `/api/users/role/{role}` | Por rol |

**Documentación interactiva:** `http://localhost:8080/swagger-ui.html`

## Comandos Makefile

```bash
make help              # Ver todos los comandos
make up                # Levantar servicios dev
make up-mon            # Con monitoreo (Prometheus, Grafana, Graphite)
make down              # Bajar servicios
make build             # Build sin cache
make logs              # Ver logs todos
make logs-backend      # Solo backend
make status            # Estado y health checks
make shell-backend     # Shell en backend
make shell-db          # psql en postgres
make db-backup         # Backup BD
make clean-all         # Limpiar todo (volúmenes, imágenes)
make prod-up           # Levantar producción
```

## Arquitectura

Ver [ARCHITECTURE.md](docs/ARCHITECTURE.md) para detalles completos:
- 3 capas: Presentación → Negocio → Persistencia
- Flujo completo: Frontend → Spring Boot → n8n → PostgreSQL
- Patrones: MVC, Service Layer, DTO, Repository, DI, Filter, Strategy
- Escalabilidad horizontal (stateless JWT)

## Base de Datos

Ver [DATABASE.md](docs/DATABASE.md):
- Tablas: USUARIO, CHAT_SESSION, CHAT_MESSAGE
- Índices optimizados
- Constraints FK, UNIQUE, CHECK
- Queries comunes y estadísticas

## Despliegue Producción

```bash
# 1. Configurar .env con valores producción
# 2. Build y up con compose prod
make prod-build
make prod-up

# Servicios en prod:
# - Frontend: puerto 80/443 (nginx)
# - Backend: puerto 8080 (interno)
# - Postgres: puerto 5432 (interno)
# - Monitoreo: puertos 9090, 3000
```

## Documentación

| Archivo | Descripción |
|---------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arquitectura, capas, flujos, patrones |
| [API.md](docs/API.md) | Referencia completa endpoints + ejemplos |
| [AUTHENTICATION.md](docs/AUTHENTICATION.md) | JWT, BCrypt, Spring Security detalles |
| [CHAT_SYSTEM.md](docs/CHAT_SYSTEM.md) | Chat, n8n, ciclo de vida sesiones |
| [DATABASE.md](docs/DATABASE.md) | Esquema BD, queries, índices |
| [INSTALLATION.md](docs/INSTALLATION.md) | Guía instalación paso a paso |

## Seguridad

- **BCrypt** strength=10 para contraseñas (~100ms/hash)
- **JWT** HS256, expiración 24h, claims: sub, iat, exp, iss, role
- **Stateless**: Sin sesiones en servidor
- **CORS**: Configurado para desarrollo (`*`)
- **HTTPS**: Requerido en producción
- **Variables de entorno**: Secrets nunca en código

## Monitoreo

- **Prometheus**: Métricas Spring Boot Actuator (`/actuator/prometheus`)
- **Grafana**: Dashboards preconfigurados (Spring Boot, JVM, DB)
- **Graphite**: Métricas legacy (opcional)
- **Health checks**: PostgreSQL, Backend

## Testing

```bash
# Backend tests
cd bcrypt2025-springboot
./mvnw test

# Frontend lint
cd bcrypt2025-front-end
npm run lint
```

## Contribuir

1. Fork del repositorio
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit changes (`git commit -am 'Add nueva funcionalidad'`)
4. Push branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## Licencia

Proyecto privado - AlphaBrein 2025

## Contacto

- **Autor**: Breiner Martinez
- **Email**: breinersmartinezmunoz@gmail.com o breynersmartinezmunoz@gmail.com
- **Repositorio**: GitHub

---

**Última actualización**: Agosto 2026  
**Versión**: 1.0.0  
**Estado**: Producción lista