# Documentación AlphaBrein

Índice central de toda la documentación técnica del proyecto.

## Guías de Inicio

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [INSTALLATION.md](INSTALLATION.md) | Instalación paso a paso (local + Docker) | Desarrolladores nuevos |
| [README.md](../README.md) | Resumen general del proyecto | Todos |

## Arquitectura y Diseño

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitectura 3 capas, flujos de datos, patrones de diseño, diagramas de secuencia | Arquitectos, Devs senior |
| [DATABASE.md](DATABASE.md) | Esquema ER, tablas, índices, constraints, queries comunes, configuración Hibernate | DBAs, Backend devs |
| [CHAT_SYSTEM.md](CHAT_SYSTEM.md) | Sistema de chat, ciclo de vida sesiones, integración n8n, manejo de memoria | Backend devs, IA team |

## Referencia de API

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [API.md](API.md) | Referencia completa endpoints (Auth, Chat, Users), DTOs, códigos HTTP, ejemplos cURL/JS/Python | Frontend devs, Integradores |
| Swagger UI | Documentación interactiva | `http://localhost:8080/swagger-ui.html` | Todos |

## Seguridad y Autenticación

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [AUTHENTICATION.md](AUTHENTICATION.md) | JWT (generación/validación), BCrypt (hashing/comparación), Spring Security config, flujos registro/login | Security team, Backend devs |

## Datos y Diccionarios

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| [data_dictonary.md](data_dictonary.md) | Diccionario de datos técnico | Analistas, DBAs |

## Diagramas Visuales

Ubicados en `docs/image/`:

| Archivo | Descripción |
|---------|-------------|
| `estructura de paquetes.png` | Package structure Java |
| `flujo completo chat.png` | Flujo completo mensaje chat |
| `capa persistencia.png` | Capa persistencia |
| `capa presentacion front.png` | Frontend components |
| `capa presentacion back.png` | Backend components |
| `flujo datos.png` | Data flow entre capas |

## Configuración y Despliegue

| Archivo | Descripción |
|---------|-------------|
| [../docker-compose.yml](../docker-compose.yml) | Desarrollo (PostgreSQL, Backend, Frontend, Monitoring) |
| [../docker-compose.prod.yml](../docker-compose.prod.yml) | Producción (recursos limitados, puertos 80/443) |
| [../.env.example](../.env.example) | Variables de entorno requeridas |
| [../Makefile](../Makefile) | Comandos Docker gestión |
| [../monitoring/](../monitoring/) | Config Prometheus, Grafana, Graphite |
| [../n8n/AlphaBrein.json](../n8n/AlphaBrein.json) | Workflow n8n export |

## Base de Datos

| Archivo | Descripción |
|---------|-------------|
| [../db/alphabrein.sql](../db/alphabrein.sql) | Schema SQL completo |

## Inicio Rápido por Rol

### Desarrollador Backend
1. [INSTALLATION.md](INSTALLATION.md#paso-2-configurar-backend-spring-boot)
2. [ARCHITECTURE.md](ARCHITECTURE.md#-estructura-de-paquetes-java)
3. [API.md](API.md) - Endpoints
4. [AUTHENTICATION.md](AUTHENTICATION.md) - JWT/BCrypt
5. [DATABASE.md](DATABASE.md) - Esquema y queries

### Desarrollador Frontend
1. [INSTALLATION.md](INSTALLATION.md#paso-3-configurar-frontend-react)
2. [ARCHITECTURE.md](ARCHITECTURE.md#capa-1-presentación-frontend)
3. [API.md](API.md) - Ejemplos JavaScript
4. [CHAT_SYSTEM.md](CHAT_SYSTEM.md#-componentes-clave) - ChatService

### DevOps / Infraestructura
1. [INSTALLATION.md](INSTALLATION.md#docker-opcional)
2. [../docker-compose.yml](../docker-compose.yml)
3. [../docker-compose.prod.yml](../docker-compose.prod.yml)
4. [../Makefile](../Makefile)
5. [../monitoring/](../monitoring/)
6. [DATABASE.md](DATABASE.md#-mantenimiento)

### QA / Testing
1. [API.md](API.md) - Endpoints y códigos de respuesta
2. [INSTALLATION.md](INSTALLATION.md#-verificación-de-instalación)
3. Swagger UI: `http://localhost:8080/swagger-ui.html`

### Product Owner / Stakeholders
1. [README.md](../README.md) - Resumen ejecutivo
2. [ARCHITECTURE.md](ARCHITECTURE.md#-descripción-general-de-la-arquitectura) - Visión general
3. [CHAT_SYSTEM.md](CHAT_SYSTEM.md#-ciclo-de-vida-de-una-sesión-de-chat) - Flujo usuario

## Convenciones de Documentación

- **Formato**: Markdown (.md)
- **Idioma**: Español
- **Diagramas**: Mermaid (renderizado en GitHub/GitLab) + PNG en `docs/image/`
- **Actualización**: Junto con cambios de código (PRs requieren docs actualizadas)
- **Versión**: Semántica en header de cada doc

## Estado de Documentación

| Documento | Versión | Última Actualización | Estado |
|-----------|---------|---------------------|--------|
| ARCHITECTURE.md | 1.0 | Mayo 2026 | ✅ Completo |
| API.md | 1.0 | Mayo 2026 | ✅ Completo |
| AUTHENTICATION.md | 1.0 | Mayo 2026 | ✅ Completo |
| CHAT_SYSTEM.md | 1.0 | Mayo 2026 | ✅ Completo |
| DATABASE.md | 1.0 | Mayo 2026 | ✅ Completo |
| INSTALLATION.md | 1.0 | Mayo 2026 | ✅ Completo |
| data_dictonary.md | - | - | ⚠️ Pendiente |

## Contribuir a la Documentación

1. Editar archivo `.md` correspondiente
2. Actualizar header con versión y fecha
3. Verificar enlaces internos
4. Incluir diagramas Mermaid si aplica
5. PR con label `documentation`

---

**Mantenido por**: Equipo AlphaBrein  
**Última actualización índice**: Agosto 2026