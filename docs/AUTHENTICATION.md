# AUTHENTICATION.md - Sistema de Autenticación JWT y BCrypt

## 🔐 Introducción

AlphaBrein implementa un sistema de autenticación **stateless** basado en:
- **JWT (JSON Web Tokens)** para tokens de acceso
- **BCrypt** para hashing de contraseñas
- **Spring Security** para protección de endpoints
- **Filtros personalizados** para validación en cada request

---

## 🔒 BCrypt - Hashing de Contraseñas

### ¿Qué es BCrypt?

BCrypt es un algoritmo de hashing basado en **Blowfish** que:
- Aplica **salt rounds** (iterations) para aumentar la dificultad computacional
- Es **adaptive**: se puede aumentar la dificultad con el tiempo
- Resiste ataques de fuerza bruta mediante "stretching"
- Estándar en la industria para derivación de contraseñas

### Configuración en AlphaBrein

```java
// SecurityConfig.java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(
        10,  // strength (rounds) - default 10
        SecureRandom.getInstance("SHA1PRNG")  // random generator
    );
}
```

**Strength (Salt Rounds) = 10**:
- Tiempo de hashing: ~100-200 ms por contraseña
- Equilibrio entre seguridad y rendimiento
- Reutilizable como parámetro de investigación

### Flujo de Hashing (Registro)

```
┌─────────────────────────────────────────────────────┐
│  USER INPUT                                         │
│  password: "MiContraseñaSegura123!"                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  BCRYPT HASHING PROCESS                             │
│  1. Generate random salt (16 bytes)                │
│  2. Derive key using Blowfish with rounds=10       │
│  3. Encode salt + hash to bcrypt format            │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  BCRYPT HASH OUTPUT                                 │
│  $2a$10$N9qo8uLOickgx2ZMRZoHy.u3k3hh5D5m1X8B8...  │
│                                                     │
│  Format: $2a$rounds$salt(22)$hash(31)              │
│  Length: 60 characters (fixed)                     │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  DATABASE STORAGE                                   │
│  INSERT INTO USUARIO (CONTRASEÑA) VALUES (hash)   │
│  Password NUNCA se almacena en plaintext          │
└─────────────────────────────────────────────────────┘
```

#### Código de Registro (AuthService)

```java
public AuthResponse register(RegisterRequest request) {
    User user = new User();
    
    // BCrypt hashing automático
    user.setPassword(
        passwordEncoder.encode(request.getPassword())
    );
    
    userRepository.save(user);  // Hash se persiste
    
    String jwtToken = jwtService.generateToken(user);
    
    return AuthResponse.builder()
            .token(jwtToken)
            .message("Usuario registrado exitosamente")
            .build();
}
```

### Flujo de Validación (Login)

```
┌─────────────────────────────────────────────────────┐
│  USER LOGIN REQUEST                                 │
│  email: "breiner@example.com"                       │
│  password: "MiContraseñaSegura123!"                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  SPRING SECURITY AUTHENTICATOR                      │
│  authenticationManager.authenticate(                │
│    UsernamePasswordAuthenticationToken(email, pwd)  │
│  )                                                  │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  LOAD USER FROM DATABASE                            │
│  CustomUserDetailsService.loadUserByUsername(email)│
│  SELECT * FROM USUARIO WHERE CORREO = email       │
│  → Returns User object implementing UserDetails   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  BCRYPT COMPARISON                                  │
│  passwordEncoder.matches(                           │
│    plaintext_password_from_request,                │
│    stored_bcrypt_hash_from_db                      │
│  )                                                  │
│                                                     │
│  Process:                                           │
│  1. Extract salt from stored hash                 │
│  2. Hash the provided password with same salt    │
│  3. Compare resulting hash with stored hash      │
│  4. If match → authentication succeeds           │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
         ┌───────┴────────┐
         │                │
    ✓ MATCH          ✗ NO MATCH
         │                │
         ▼                ▼
    Generate JWT   Return 401 Unauthorized
```

#### Código de Login (AuthService)

```java
public AuthResponse login(LoginRequest request) {
    // Spring Security maneja BCrypt comparison aquí
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            request.getEmail(),
            request.getPassword()
        )
    );
    
    // Si llega aquí, autenticación fue exitosa
    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow();
    
    String jwtToken = jwtService.generateToken(user);
    
    return AuthResponse.builder()
            .token(jwtToken)
            .message("Login exitoso")
            .build();
}
```

### Performance y Benchmarks de BCrypt

| Rounds | Tiempo (ms) | Intentos/seg | Seguridad |
|--------|------------|-------------|----------|
| 4      | 10-50      | 20,000      | Baja     |
| 6      | 50-100     | 10,000      | Media    |
| **10** | **100**    | **10,000**  | **Alta** |
| 12     | 250-400    | 3,000       | Muy alta |
| 14     | 1000+      | 1,000       | Extrema  |

**AlphaBrein usa Rounds=10** → Equilibrio seguridad/performance

---

## 🎫 JWT (JSON Web Tokens)

### Estructura del JWT

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiJicmVpbmVyQGV4YW1wbGUuY29tIiwiaWF0IjoxNjg0NzA3Njk2LCJleHAiOjE2ODQ3OTQwOTZ9.
TJVA95OrMZ7zKQ6MJEiVdq_Z-e3_hZW8AuqVUDnB2T8

│   Header    │              Payload                    │     Signature     │
```

### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Decodificado (Base64URL)**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

### Payload
```json
{
  "sub": "breiner@example.com",
  "iat": 1684707696,
  "exp": 1684794096,
  "iss": "AlphaBrein",
  "role": "USER"
}
```

**Claims**:
- `sub` (subject): Email del usuario
- `iat` (issued at): Timestamp de creación
- `exp` (expiration): Timestamp de expiración
- `iss` (issuer): AlphaBrein
- `role`: Rol del usuario

### Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  SECRET_KEY
)
```

---

### Generación de JWT (JwtService)

```java
@Service
public class JwtService {

    @Value("${jwt.secret.key}")
    private String secretKey;

    @Value("${jwt.expiration.time}")
    private long jwtExpiration;  // 86400000 ms = 24 hours

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    private String buildToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())  // email
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

### Validación de JWT (JwtAuthenticationFilter)

```java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        // 1. Extraer header Authorization
        final String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extraer token (substring "Bearer ")
        final String jwt = authHeader.substring(7);
        
        // 3. Extraer email del token
        final String userEmail = jwtService.extractUsername(jwt);

        // 4. Si usuario no está autenticado
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // 5. Cargar detalles del usuario
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

            // 6. Validar token
            if (jwtService.isTokenValid(jwt, userDetails)) {
                
                // 7. Crear authentication token
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );
                
                // 8. Establecer contexto de seguridad
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### Ciclo de Vida del Token

```
┌──────────────────────┐
│  TOKEN CREADO        │
│  iat: NOW            │
│  exp: NOW + 24h      │
└──────────┬───────────┘
           │
           │ Frontend → localStorage
           │
           ▼
┌──────────────────────┐
│  TOKEN VÁLIDO        │
│  (< 24 horas)        │
│  ✅ Acepto requests  │
└──────────┬───────────┘
           │
           │ 1 hora después...
           │
           ▼
┌──────────────────────┐
│  TOKEN VÁLIDO        │
│  (23 horas left)     │
│  ✅ Acepto requests  │
└──────────┬───────────┘
           │
           │... (repetir cada hora)
           │
           ▼
┌──────────────────────┐
│  TOKEN EXPIRA        │
│  exp < NOW           │
│  ❌ Rechazo requests │
└──────────┬───────────┘
           │ Error 401
           ▼
┌──────────────────────┐
│  Frontend:           │
│  1. Limpiar token    │
│  2. Redirigir a login│
│  3. Pedir nuevo login│
└──────────────────────┘
```

---

## 🔐 Spring Security Configuration

### SecurityConfig.java

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            // CSRF disabled (stateless, JWT)
            .csrf(csrf -> csrf.disable())
            
            // Authorization rules
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()  // Public
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()  // Todo lo demás requiere JWT
            )
            
            // Stateless (no sesiones)
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Authentication provider
            .authenticationProvider(authenticationProvider())
            
            // JWT filter
            .addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(
            Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = 
            new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

---

## 🔄 Flujo Completo de Autenticación

### Registro

```
1. User → POST /api/auth/register
   {
     "firstName": "Breiner",
     "email": "breiner@example.com",
     "password": "MiContraseñaSegura123!"
   }

2. AuthController.register()
   ├─ Validar email no existe
   ├─ Validar cédula no existe
   └─ Llamar AuthService.register()

3. AuthService.register()
   ├─ user.setPassword(
   │    passwordEncoder.encode(password)
   │  )  // BCrypt hash
   ├─ userRepository.save(user)
   ├─ jwtService.generateToken(user)
   └─ Enviar email de confirmación

4. Return AuthResponse
   {
     "token": "eyJhbGci...",
     "email": "breiner@example.com",
     "message": "Usuario registrado exitosamente"
   }

5. Frontend
   ├─ localStorage.setItem('token', token)
   ├─ localStorage.setItem('email', email)
   └─ Redirigir a Dashboard
```

### Login

```
1. User → POST /api/auth/login
   {
     "email": "breiner@example.com",
     "password": "MiContraseñaSegura123!"
   }

2. AuthController.login()
   └─ Llamar AuthService.login()

3. AuthService.login()
   ├─ authenticationManager.authenticate(
   │    new UsernamePasswordAuthenticationToken(email, password)
   │  )
   │
   │  Internamente:
   │  ├─ userDetailsService.loadUserByUsername(email)
   │  │  └─ SELECT * FROM USUARIO WHERE email = ...
   │  ├─ passwordEncoder.matches(password, stored_hash)
   │  │  └─ BCrypt comparison
   │  └─ Si ✓ continúa, si ✗ throw BadCredentialsException
   │
   ├─ jwtService.generateToken(user)
   └─ Return AuthResponse with token

4. Return AuthResponse
   {
     "token": "eyJhbGci...",
     "email": "breiner@example.com",
     "role": "USER"
   }

5. Frontend
   ├─ localStorage.setItem('token', token)
   └─ Incluir en futuras requests:
      Authorization: Bearer {token}
```

### Protected Request

```
1. Frontend → GET /api/chat/sessions
   Headers: {
     "Authorization": "Bearer eyJhbGci..."
   }

2. JwtAuthenticationFilter.doFilterInternal()
   ├─ Parse header
   ├─ Extract token ("eyJhbGci...")
   ├─ jwtService.extractUsername(token)
   │  └─ Decode payload → get email
   ├─ userDetailsService.loadUserByUsername(email)
   ├─ jwtService.isTokenValid(token, userDetails)
   │  ├─ Verify signature with SECRET_KEY
   │  ├─ Check expiration time
   │  └─ Return true/false
   │
   ├─ If valid:
   │  ├─ Create UsernamePasswordAuthenticationToken
   │  └─ SecurityContextHolder.setAuthentication(token)
   │
   └─ If invalid:
      └─ Return 401 Unauthorized

3. Authentication disponible en Controller
   @PostMapping
   public ResponseEntity<...> getSessionHistory(
       Authentication authentication,  // Injected by Spring
       ...
   ) {
       User user = (User) authentication.getPrincipal();
       // user está autenticado y autorizado
   }

4. Return 200 OK con datos
```

---

## 🔑 Variables de Entorno

### JWT Secret Key

```properties
# application.properties
jwt.secret.key=YOUR_BASE64_ENCODED_SECRET_KEY
jwt.expiration.time=86400000  # 24 horas en ms
```

**Generar secret key**:
```bash
# Opción 1: OpenSSL
openssl rand -base64 32

# Opción 2: Java
java -c "import java.util.Base64; import java.security.SecureRandom; byte[] key = new byte[32]; new SecureRandom().nextBytes(key); System.out.println(Base64.getEncoder().encodeToString(key));"

# Ejemplo output:
# qQckl72XlKK8l2J1wQ9p3mV5b8L9nKp0xZ2yR3sT4uV5wX6y
```

### Neon DB Connection

```properties
URL_DB=postgresql://userid:password@host:5432/neondb
USER_NAME=postgres
PASSWORD_DB=yourpassword
```

---

## 🛡️ Mecanismos de Protección

### 1. Token Expiration
- JWT expira después de 24 horas
- Frontend debe pedir nuevo login
- Backend rechaza tokens expirados

### 2. Secret Key
- HMAC-SHA256 signing
- Base64 encoded
- Nunca almacenar en .git
- Usar variables de entorno

### 3. HTTPS (Production)
- Siempre usar HTTPS en producción
- TLS encryption para tokens en tránsito
- Neon DB usa SSL/TLS

### 4. CORS
- Configured en SecurityConfig
- Allow specific origins (futura mejora)
- Prevent XSS attacks

### 5. Rate Limiting
- TODO: Implementar rate limit en login
- Proteger contra brute force
- Usar Redis para counter

### 6. Password Requirements
- Via OWASP guidelines
- Min 8 caracteres
- BCrypt hashing with salt rounds=10

---

## 🔍 Debugging de Autenticación

### Verificar Token en DevTools

```javascript
// Chrome DevTools Console
localStorage.getItem('token')
// Output: eyJhbGci...

// Decodificar en jwt.io (no uses datos sensibles)
// - Pegar token completo
// - Ver payload
```

### Logs de Spring Security

```properties
# application.properties
logging.level.org.springframework.security=DEBUG
```

### Verificar Autenticación Activa

```java
// En Controller
@GetMapping("/debug")
public String debug(Authentication authentication) {
    if (authentication != null && authentication.isAuthenticated()) {
        return "Usuario: " + authentication.getName();
    }
    return "No autenticado";
}
```

---

## 🚨 Errores Comunes

| Síntoma | Causa | Solución |
|--------|-------|----------|
| 401 Unauthorized | Token expirado | Login nuevamente |
| 401 Unauthorized | Token inválido | Verificar SECRET_KEY |
| 400 Bad Request | Email duplicado | Usar otro email |
| 400 Bad Request | Password < 8 chars | Usar contraseña más larga |
| 403 Forbidden | Rol insuficiente | Usar usuario ADMIN |

---

## 🔐 Tabla Comparativa: BCrypt vs MD5 vs SHA256

| Característica | BCrypt | MD5 | SHA256 |
|---|---|---|---|
| **Adaptable** | ✅ Sí | ❌ No | ❌ No |
| **Salt** | ✅ Incl. | ❌ Manual | ❌ Manual |
| **Tiempo** | ✅ 100ms | ❌ <1ms | ❌ <1ms |
| **Reversible** | ❌ No | ❌ No | ❌ No |
| **Recomendado** | ✅ SÍ | ❌ NO | ✅ Si + salt |

**Conclusión**: BCrypt es el estándar de la industria para contraseñas.

---

**Última actualización**: Mayo 2026  
**Versión**: 1.0  
**Status**: Producción
