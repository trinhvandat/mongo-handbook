export const authLessons = [
  {
    id: 1,
    title: "Authentication Fundamentals",
    desc: "Nen tang xac thuc - Hieu ro Authentication vs Authorization vs Identification",
    content: `
## Authentication Fundamentals

**Authentication** (xac thuc) la qua trinh xac minh danh tinh cua mot nguoi dung hoac he thong. Day la buoc dau tien va quan trong nhat trong bao mat.

### Authentication vs Authorization vs Identification

| Khai niem | Dinh nghia | Vi du |
|-----------|-----------|-------|
| **Identification** | Tuyen bo ban la ai | Nhap username |
| **Authentication** | Chung minh ban la ai | Nhap password, scan van tay |
| **Authorization** | Xac dinh ban duoc lam gi | Kiem tra quyen admin, user |

\`\`\`mermaid
graph LR
    subgraph "Quy trinh bao mat"
        I[Identification<br/>Ban la ai?] --> A[Authentication<br/>Chung minh di!]
        A --> Z[Authorization<br/>Ban duoc lam gi?]
    end
    style I fill:#3b82f6,stroke:#2563eb,color:#fff
    style A fill:#22c55e,stroke:#16a34a,color:#fff
    style Z fill:#f59e0b,stroke:#d97706,color:#fff
\`\`\`

### Factors of Authentication

Authentication dua tren **3 yeu to chinh**:

| Factor | Mo ta | Vi du |
|--------|-------|-------|
| **Knowledge** (Something you know) | Thong tin chi ban biet | Password, PIN, security question |
| **Possession** (Something you have) | Vat ban so huu | Phone (OTP), hardware token, smart card |
| **Inherence** (Something you are) | Dac diem sinh trac hoc | Fingerprint, face scan, iris scan |

\`\`\`mermaid
graph TD
    subgraph "Multi-Factor Authentication"
        K[Knowledge Factor<br/>Password, PIN]
        P[Possession Factor<br/>Phone, Token]
        I[Inherence Factor<br/>Biometrics]
    end
    K --> MFA{MFA}
    P --> MFA
    I --> MFA
    MFA --> S[Secure Access]
    style MFA fill:#ef4444,stroke:#dc2626,color:#fff
    style S fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

### Multi-Factor Authentication (MFA)

MFA yeu cau **2 hoac nhieu yeu to** de xac thuc. Ket hop cac factor giup tang bao mat dang ke:

- **2FA (Two-Factor Authentication)**: 2 yeu to, vd: password + OTP
- **3FA**: 3 yeu to, vd: password + smart card + fingerprint

**Cac phuong thuc MFA pho bien**:

1. **TOTP (Time-based One-Time Password)**: Google Authenticator, Authy
2. **SMS OTP**: Ma xac thuc qua SMS (kem bao mat hon TOTP)
3. **Push Notification**: Xac nhan tren app (Microsoft Authenticator)
4. **Hardware Key**: YubiKey, FIDO2 key
5. **Biometric**: Van tay, khuon mat

\`\`\`java
// Vi du: Verify TOTP code
import org.apache.commons.codec.binary.Base32;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class TOTPVerifier {

    public static boolean verifyTOTP(String secret, String code) {
        long timeStep = System.currentTimeMillis() / 1000 / 30;

        // Check current time step and +/- 1 step (window)
        for (int i = -1; i <= 1; i++) {
            String generated = generateTOTP(secret, timeStep + i);
            if (generated.equals(code)) {
                return true;
            }
        }
        return false;
    }

    private static String generateTOTP(String secret, long timeStep) {
        byte[] key = new Base32().decode(secret);
        byte[] data = new byte[8];
        for (int i = 7; i >= 0; i--) {
            data[i] = (byte) (timeStep & 0xFF);
            timeStep >>= 8;
        }

        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(data);

            int offset = hash[hash.length - 1] & 0x0F;
            int otp = ((hash[offset] & 0x7F) << 24)
                     | ((hash[offset + 1] & 0xFF) << 16)
                     | ((hash[offset + 2] & 0xFF) << 8)
                     | (hash[offset + 3] & 0xFF);

            return String.format("%06d", otp % 1000000);
        } catch (Exception e) {
            throw new RuntimeException("TOTP generation failed", e);
        }
    }
}
\`\`\`

### Authentication Flow Overview

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant C as Client App
    participant S as Auth Server
    participant DB as User Store

    U->>C: 1. Enter credentials
    C->>S: 2. Send credentials (HTTPS)
    S->>DB: 3. Lookup user
    DB-->>S: 4. Return user data
    S->>S: 5. Verify password hash
    alt Authentication Success
        S-->>C: 6a. Return token/session
        C-->>U: 7a. Access granted
    else Authentication Failed
        S-->>C: 6b. Return 401 Unauthorized
        C-->>U: 7b. Show error
    end
\`\`\`

### Session-based vs Token-based Authentication

| Tieu chi | Session-based | Token-based (JWT) |
|----------|--------------|-------------------|
| **Luu tru** | Server-side (memory/Redis) | Client-side (cookie/localStorage) |
| **Stateful/Stateless** | Stateful | Stateless |
| **Scale** | Can shared session store | De scale (khong can server state) |
| **Revocation** | De dang (xoa session) | Kho (can blacklist) |
| **Size** | Session ID nho | Token lon (chua claims) |
| **CSRF** | Can CSRF token | Khong bi CSRF (neu dung header) |
| **Mobile** | Kho implement | De dang |
| **Cross-domain** | Kho (cookie same-origin) | De (dung header) |

\`\`\`mermaid
graph TD
    subgraph "Session-based"
        C1[Client] -->|Session ID in Cookie| S1[Server]
        S1 -->|Lookup| SS[Session Store<br/>Redis/Memory]
    end

    subgraph "Token-based"
        C2[Client] -->|JWT in Header| S2[Server]
        S2 -->|Verify Signature| S2
    end

    style SS fill:#f59e0b,stroke:#d97706,color:#fff
    style S2 fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

> ⚠️ Luu y: Khong co phuong phap nao hoan hao. Session-based phu hop cho web truyen thong, Token-based phu hop cho API va microservices. Nhieu he thong dung ket hop ca hai.

### Best Practices

1. **Luon dung HTTPS** - Khong bao gio gui credentials qua HTTP
2. **Implement rate limiting** - Chong brute force
3. **Dung MFA** cho cac tai khoan quan trong
4. **Log authentication events** - De audit va phat hien bat thuong
5. **Khong tiet lo thong tin** - "Invalid credentials" thay vi "Wrong password"
6. **Lock account** sau nhieu lan that bai
7. **Password policy** - Do dai toi thieu, do phuc tap
    `
  },
  {
    id: 2,
    title: "Password Security",
    desc: "Bao mat mat khau - Hash, Salt, Pepper va cac chien luoc chong tan cong",
    content: `
## Password Security

Mat khau la phuong thuc xac thuc pho bien nhat. Bao mat mat khau dung cach la nen tang cua moi he thong.

### Tai sao khong luu plain text?

\`\`\`text
❌ KHONG BAO GIO luu plain text password!

Database bi hack => Tat ca password bi lo
Employee doc duoc password cua user
Log file co the chua password
\`\`\`

### Encryption vs Hashing

| | Encryption | Hashing |
|---|-----------|---------|
| **Chieu** | 2 chieu (encrypt/decrypt) | 1 chieu (khong dao nguoc) |
| **Key** | Can key de decrypt | Khong co key |
| **Muc dich** | Bao ve data can doc lai | Luu tru password |
| **Vi du** | AES-256, RSA | bcrypt, Argon2 |

> ⚠️ Luu y: Encryption password cung KHONG an toan vi key co the bi lo. Luon dung HASHING cho password.

### Hash Algorithms Comparison

| Algorithm | An toan? | Toc do | Ghi chu |
|-----------|---------|--------|---------|
| **MD5** | ❌ Broken | Rat nhanh | KHONG BAO GIO dung cho password |
| **SHA-256** | ❌ Khong phu hop | Nhanh | Thiet ke cho data integrity, khong cho password |
| **bcrypt** | ✅ Tot | Cham (configurable) | Chuan cong nghiep, co salt built-in |
| **scrypt** | ✅ Tot | Cham + memory-hard | Chong GPU/ASIC attack |
| **Argon2** | ✅ Tot nhat | Configurable | Winner Password Hashing Competition 2015 |

### Salt va Pepper

**Salt** la mot gia tri ngau nhien, UNIQUE cho moi password:

\`\`\`text
password = "mypassword"
salt = "x7k9m2p4" (random, unique per user)
hash = bcrypt(password + salt)

Stored: salt + hash
\`\`\`

**Pepper** la mot secret value, GIONG NHAU cho tat ca passwords, luu NGOAI database:

\`\`\`text
password = "mypassword"
salt = "x7k9m2p4" (from DB)
pepper = "GLOBAL_SECRET_KEY" (from env/config)
hash = bcrypt(password + salt + pepper)
\`\`\`

\`\`\`mermaid
graph LR
    P[Password] --> COMBINE[Combine]
    S[Salt<br/>unique/user<br/>stored in DB] --> COMBINE
    PP[Pepper<br/>global secret<br/>stored in config] --> COMBINE
    COMBINE --> H[Hash Function<br/>bcrypt/Argon2]
    H --> HASH[Password Hash<br/>stored in DB]
    style H fill:#ef4444,stroke:#dc2626,color:#fff
    style HASH fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

### Work Factor Tuning

**Work factor** (cost factor) quyet dinh thoi gian hash. Tang work factor = cham hon = an toan hon:

\`\`\`java
// bcrypt work factor (cost)
// Cost 10: ~100ms (minimum recommended)
// Cost 12: ~400ms (good default)
// Cost 14: ~1.6s (high security)
// Cost 16: ~6.4s (too slow for most apps)

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// Recommended: cost = 12
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
String hash = encoder.encode("mypassword");
\`\`\`

**Argon2 parameters**:

\`\`\`java
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;

// Parameters: saltLength, hashLength, parallelism, memory(KB), iterations
Argon2PasswordEncoder encoder = new Argon2PasswordEncoder(
    16,    // salt length: 16 bytes
    32,    // hash length: 32 bytes
    1,     // parallelism: 1 thread
    65536, // memory: 64 MB
    3      // iterations: 3
);

String hash = encoder.encode("mypassword");
boolean matches = encoder.matches("mypassword", hash);
\`\`\`

### bcrypt in Java - Full Example

\`\`\`java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService {

    private final BCryptPasswordEncoder encoder;

    public PasswordService() {
        // Work factor = 12 (~400ms per hash)
        this.encoder = new BCryptPasswordEncoder(12);
    }

    /**
     * Hash password truoc khi luu vao database
     */
    public String hashPassword(String rawPassword) {
        // bcrypt tu dong generate salt va embed vao hash
        // Output format: $2a$12$salt22chars.hash31chars
        return encoder.encode(rawPassword);
    }

    /**
     * Verify password khi login
     */
    public boolean verifyPassword(String rawPassword, String storedHash) {
        return encoder.matches(rawPassword, storedHash);
    }
}

// Usage in AuthService
@Service
public class AuthService {

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private UserRepository userRepository;

    public void register(String username, String rawPassword) {
        // Validate password policy
        validatePasswordPolicy(rawPassword);

        // Hash password
        String hashedPassword = passwordService.hashPassword(rawPassword);

        // Save user
        User user = new User(username, hashedPassword);
        userRepository.save(user);
    }

    public User login(String username, String rawPassword) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new AuthException("Invalid credentials"));

        if (!passwordService.verifyPassword(rawPassword, user.getPassword())) {
            // KHONG noi "wrong password" - chi noi "invalid credentials"
            throw new AuthException("Invalid credentials");
        }

        return user;
    }

    private void validatePasswordPolicy(String password) {
        if (password.length() < 8) {
            throw new ValidationException("Password must be at least 8 characters");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new ValidationException("Password must contain uppercase letter");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new ValidationException("Password must contain lowercase letter");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new ValidationException("Password must contain digit");
        }
        if (!password.matches(".*[!@#$%^&*].*")) {
            throw new ValidationException("Password must contain special character");
        }
    }
}
\`\`\`

### Password Policy Best Practices

| Policy | Recommended | Ghi chu |
|--------|-------------|---------|
| Min length | 8-12 characters | NIST khuyen nghi 8+ |
| Max length | 64-128 characters | Cho phep passphrase |
| Complexity | Khong bat buoc | NIST 2024: complexity rules khong hieu qua |
| Expiration | Khong bat buoc | Chi doi khi bi compromise |
| History | 5-10 previous passwords | Khong cho dung lai |
| Common password check | Required | Check against breached list |

### Credential Stuffing va Brute Force Prevention

\`\`\`mermaid
graph TD
    A[Attack Types] --> B[Brute Force<br/>Thu tat ca to hop]
    A --> C[Dictionary Attack<br/>Thu tu wordlist]
    A --> D[Credential Stuffing<br/>Dung leaked credentials]
    A --> E[Rainbow Table<br/>Pre-computed hashes]

    B --> F[Prevention]
    C --> F
    D --> F
    E --> F

    F --> G[Rate Limiting]
    F --> H[Account Lockout]
    F --> I[CAPTCHA]
    F --> J[MFA]
    F --> K[Salted Hashing]

    style A fill:#ef4444,stroke:#dc2626,color:#fff
    style F fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

### Rate Limiting Implementation

\`\`\`java
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    // Cache: key = username/IP, value = attempt count
    private LoadingCache<String, Integer> attemptsCache;

    public LoginAttemptService() {
        attemptsCache = CacheBuilder.newBuilder()
            .expireAfterWrite(LOCKOUT_MINUTES, TimeUnit.MINUTES)
            .build(new CacheLoader<String, Integer>() {
                @Override
                public Integer load(String key) {
                    return 0;
                }
            });
    }

    public void loginFailed(String key) {
        int attempts = attemptsCache.getUnchecked(key);
        attemptsCache.put(key, attempts + 1);
    }

    public void loginSucceeded(String key) {
        attemptsCache.invalidate(key);
    }

    public boolean isBlocked(String key) {
        return attemptsCache.getUnchecked(key) >= MAX_ATTEMPTS;
    }

    public int getRemainingAttempts(String key) {
        return MAX_ATTEMPTS - attemptsCache.getUnchecked(key);
    }
}
\`\`\`

> ⚠️ Luu y: Luon ket hop nhieu lop bao ve: rate limiting + account lockout + CAPTCHA + MFA. Khong dua vao mot phuong phap duy nhat.
    `
  },
  {
    id: 3,
    title: "Session-Based Authentication",
    desc: "Xac thuc dua tren session - Cookie, CSRF, va quan ly session trong distributed system",
    content: `
## Session-Based Authentication

Session-based authentication la phuong phap truyen thong nhat, su dung **server-side session** va **cookie** de duy tri trang thai dang nhap.

### HTTP Stateless va Cookies

HTTP la **stateless protocol** - moi request la doc lap. Server khong nho request truoc do.

**Cookie** giup duy tri trang thai giua cac request:

\`\`\`http
// Server set cookie trong response
HTTP/1.1 200 OK
Set-Cookie: JSESSIONID=abc123; Path=/; HttpOnly; Secure; SameSite=Strict

// Client gui cookie trong moi request tiep theo
GET /api/profile HTTP/1.1
Cookie: JSESSIONID=abc123
\`\`\`

### Session Flow

\`\`\`mermaid
sequenceDiagram
    participant B as Browser
    participant S as Server
    participant SS as Session Store<br/>(Redis/Memory)

    B->>S: 1. POST /login {username, password}
    S->>S: 2. Verify credentials
    S->>SS: 3. Create session {userId, roles, expiry}
    SS-->>S: 4. Return sessionId = "abc123"
    S-->>B: 5. Set-Cookie: JSESSIONID=abc123

    Note over B,S: Subsequent requests

    B->>S: 6. GET /api/profile (Cookie: JSESSIONID=abc123)
    S->>SS: 7. Lookup session "abc123"
    SS-->>S: 8. Return {userId: 42, roles: [USER]}
    S-->>B: 9. Return profile data

    Note over B,S: Logout

    B->>S: 10. POST /logout (Cookie: JSESSIONID=abc123)
    S->>SS: 11. Delete session "abc123"
    S-->>B: 12. Set-Cookie: JSESSIONID=; Max-Age=0
\`\`\`

### Cookie Attributes

| Attribute | Mo ta | Vi du |
|-----------|-------|-------|
| **HttpOnly** | Khong truy cap duoc tu JavaScript | Chong XSS |
| **Secure** | Chi gui qua HTTPS | Chong man-in-the-middle |
| **SameSite** | Kiem soat cross-site requests | Strict, Lax, None |
| **Path** | Cookie chi gui cho path cu the | Path=/ |
| **Domain** | Cookie chi gui cho domain cu the | Domain=.example.com |
| **Max-Age** | Thoi gian song (seconds) | Max-Age=3600 |
| **Expires** | Ngay het han | Expires=Thu, 01 Jan 2025 |

\`\`\`java
// Spring Boot - Configure session cookie
@Configuration
public class SessionConfig {

    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName("SESSIONID");
        serializer.setDomainName("example.com");
        serializer.setCookiePath("/");
        serializer.setUseHttpOnlyCookie(true);
        serializer.setUseSecureCookie(true);
        serializer.setSameSite("Strict");
        serializer.setCookieMaxAge(3600); // 1 hour
        return serializer;
    }
}
\`\`\`

### Session Storage Options

| Storage | Uu diem | Nhuoc diem | Use case |
|---------|---------|------------|----------|
| **In-Memory** | Nhanh nhat | Mat khi restart, khong share | Dev, single server |
| **Redis** | Nhanh, shared, TTL | Can Redis cluster | Production, distributed |
| **Database** | Ben vung, de backup | Cham hon Redis | Small scale, audit |
| **Hazelcast** | Distributed, embedded | Phuc tap | Java enterprise |

\`\`\`java
// Spring Session with Redis
// pom.xml
// <dependency>
//     <groupId>org.springframework.session</groupId>
//     <artifactId>spring-session-data-redis</artifactId>
// </dependency>

@Configuration
@EnableRedisHttpSession(maxInactiveIntervalInSeconds = 1800)
public class RedisSessionConfig {

    @Bean
    public LettuceConnectionFactory connectionFactory() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName("localhost");
        config.setPort(6379);
        config.setPassword("redis-password");
        return new LettuceConnectionFactory(config);
    }
}
\`\`\`

### Session Fixation Prevention

**Session Fixation Attack**: Attacker set session ID truoc khi victim login.

\`\`\`mermaid
sequenceDiagram
    participant A as Attacker
    participant V as Victim
    participant S as Server

    A->>S: 1. Get session ID = "evil123"
    A->>V: 2. Trick victim vao link voi session "evil123"
    V->>S: 3. Login voi session "evil123"
    S->>S: 4. Session "evil123" now authenticated
    A->>S: 5. Access voi session "evil123" (DA AUTHENTICATED!)
\`\`\`

**Prevention**: Tao session ID moi sau khi login:

\`\`\`java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .sessionManagement(session -> session
                // Tao session moi sau login, copy attributes
                .sessionFixation().migrateSession()
                // Hoac: tao session hoan toan moi
                // .sessionFixation().newSession()
                .maximumSessions(1) // 1 session per user
                .maxSessionsPreventsLogin(false) // Kick old session
            );
        return http.build();
    }
}
\`\`\`

### CSRF Protection

**CSRF (Cross-Site Request Forgery)**: Attacker trick user thuc hien action khong mong muon.

\`\`\`mermaid
sequenceDiagram
    participant V as Victim Browser
    participant E as Evil Site
    participant B as Bank Server

    V->>B: 1. Login to bank (co session cookie)
    V->>E: 2. Visit evil site
    E->>V: 3. Hidden form: POST /transfer?to=attacker&amount=10000
    V->>B: 4. Browser auto-attach cookie, transfer money!
\`\`\`

**Prevention voi CSRF Token**:

\`\`\`java
// Spring Security - CSRF enabled by default
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
            );
        return http.build();
    }
}
\`\`\`

\`\`\`html
<!-- CSRF token in form -->
<form method="POST" action="/transfer">
    <input type="hidden" name="_csrf" value="token-value-here"/>
    <input type="text" name="amount"/>
    <button type="submit">Transfer</button>
</form>
\`\`\`

\`\`\`java
// CSRF token in AJAX request
// JavaScript:
// fetch('/api/transfer', {
//     method: 'POST',
//     headers: {
//         'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content
//     },
//     body: JSON.stringify({amount: 100})
// });
\`\`\`

### Session Scaling in Distributed Systems

\`\`\`mermaid
graph TD
    subgraph "Sticky Session (khong khuyen nghi)"
        C1[Client] --> LB1[Load Balancer<br/>Sticky]
        LB1 --> S1A[Server A<br/>Session Store]
        LB1 --> S1B[Server B<br/>Session Store]
    end

    subgraph "Shared Session Store (khuyen nghi)"
        C2[Client] --> LB2[Load Balancer]
        LB2 --> S2A[Server A]
        LB2 --> S2B[Server B]
        S2A --> R[Redis Cluster<br/>Shared Sessions]
        S2B --> R
    end

    style R fill:#ef4444,stroke:#dc2626,color:#fff
    style LB2 fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

| Strategy | Uu diem | Nhuoc diem |
|----------|---------|------------|
| **Sticky Session** | Don gian | Single point of failure, khong balance deu |
| **Session Replication** | Moi server co tat ca session | Ton memory, network overhead |
| **Shared Store (Redis)** | Scale tot, consistent | Them dependency (Redis) |
| **Token-based** | Khong can session store | Token revocation kho |

> ⚠️ Luu y: Trong production voi multiple servers, luon dung shared session store (Redis) hoac chuyen sang token-based auth. Khong dung in-memory session.
    `
  },
  {
    id: 4,
    title: "JSON Web Tokens (JWT)",
    desc: "JWT - Cau truc, Signing, Validation va Best Practices",
    content: `
## JSON Web Tokens (JWT)

JWT (RFC 7519) la mot **compact, URL-safe** format de truyen thong tin giua cac ben duoi dang JSON object, duoc ky (signed) de dam bao tinh toan ven.

### JWT Structure

JWT gom 3 phan, ngan cach boi dau cham (.):

\`\`\`text
xxxxx.yyyyy.zzzzz
  |      |      |
Header Payload Signature
\`\`\`

\`\`\`mermaid
graph LR
    subgraph "JWT Token"
        H[Header<br/>Algorithm + Type]
        P[Payload<br/>Claims/Data]
        S[Signature<br/>Verify integrity]
    end
    H --> B1[Base64URL Encode]
    P --> B2[Base64URL Encode]
    B1 --> DOT1[.]
    B2 --> DOT1
    DOT1 --> SIGN[Sign with Secret/Key]
    SIGN --> S

    style H fill:#ef4444,stroke:#dc2626,color:#fff
    style P fill:#7c3aed,stroke:#6d28d9,color:#fff
    style S fill:#3b82f6,stroke:#2563eb,color:#fff
\`\`\`

**Header**:
\`\`\`json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-id-123"
}
\`\`\`

**Payload**:
\`\`\`json
{
  "iss": "https://auth.example.com",
  "sub": "user-42",
  "aud": "https://api.example.com",
  "exp": 1700000000,
  "iat": 1699996400,
  "nbf": 1699996400,
  "jti": "unique-token-id",
  "roles": ["USER", "ADMIN"],
  "email": "user@example.com"
}
\`\`\`

**Signature**:
\`\`\`text
RSASHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  privateKey
)
\`\`\`

### JWT Claims

| Claim | Ten day du | Mo ta |
|-------|-----------|-------|
| **iss** | Issuer | Ai tao token |
| **sub** | Subject | Token cho ai (user ID) |
| **aud** | Audience | Token danh cho service nao |
| **exp** | Expiration Time | Het han luc nao (Unix timestamp) |
| **iat** | Issued At | Tao luc nao |
| **nbf** | Not Before | Khong hop le truoc thoi diem nay |
| **jti** | JWT ID | ID duy nhat cua token |

### Signing Algorithms

| Algorithm | Loai | Key | Use case |
|-----------|------|-----|----------|
| **HS256** | Symmetric (HMAC) | Shared secret | Single service, internal |
| **RS256** | Asymmetric (RSA) | Private/Public key pair | Microservices, distributed |
| **ES256** | Asymmetric (ECDSA) | Private/Public key pair | Mobile, performance-sensitive |
| **PS256** | Asymmetric (RSA-PSS) | Private/Public key pair | High security requirement |

\`\`\`mermaid
graph TD
    subgraph "Symmetric (HS256)"
        SA[Auth Server] -->|Sign with SECRET| T1[JWT]
        T1 -->|Verify with SAME SECRET| SB[API Server]
    end

    subgraph "Asymmetric (RS256)"
        AA[Auth Server] -->|Sign with PRIVATE KEY| T2[JWT]
        T2 -->|Verify with PUBLIC KEY| AB[API Server 1]
        T2 -->|Verify with PUBLIC KEY| AC[API Server 2]
    end

    style SA fill:#f59e0b,stroke:#d97706,color:#fff
    style AA fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

### Access Token vs Refresh Token

| | Access Token | Refresh Token |
|---|-------------|---------------|
| **Muc dich** | Access resources | Get new access token |
| **Thoi han** | Ngan (15 min - 1 hour) | Dai (7 days - 30 days) |
| **Luu tru** | Memory / Cookie | HttpOnly Cookie / Secure storage |
| **Gui di** | Moi API request | Chi khi refresh |
| **Revoke** | Kho (stateless) | De (luu trong DB) |

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant A as Auth Server
    participant R as Resource Server

    C->>A: 1. Login (credentials)
    A-->>C: 2. Access Token (15 min) + Refresh Token (7 days)

    C->>R: 3. GET /api/data (Authorization: Bearer access-token)
    R-->>C: 4. Response data

    Note over C,R: Access token expired after 15 min

    C->>R: 5. GET /api/data (expired access token)
    R-->>C: 6. 401 Unauthorized

    C->>A: 7. POST /refresh (refresh token)
    A->>A: 8. Validate refresh token
    A-->>C: 9. New Access Token + New Refresh Token (rotation)

    C->>R: 10. GET /api/data (new access token)
    R-->>C: 11. Response data
\`\`\`

### Token Rotation Strategy

\`\`\`java
@Service
public class TokenRotationService {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    public TokenPair rotateTokens(String oldRefreshToken) {
        RefreshToken stored = refreshTokenRepository
            .findByToken(oldRefreshToken)
            .orElseThrow(() -> new AuthException("Invalid refresh token"));

        // Check if token was already used (reuse detection)
        if (stored.isUsed()) {
            // Possible token theft! Revoke entire family
            refreshTokenRepository.revokeFamily(stored.getFamily());
            throw new AuthException("Refresh token reuse detected!");
        }

        // Check expiration
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            throw new AuthException("Refresh token expired");
        }

        // Mark old token as used
        stored.setUsed(true);
        refreshTokenRepository.save(stored);

        // Generate new tokens
        String newAccessToken = jwtService.generateAccessToken(stored.getUserId());
        String newRefreshToken = UUID.randomUUID().toString();

        // Save new refresh token with same family
        RefreshToken newToken = new RefreshToken();
        newToken.setToken(newRefreshToken);
        newToken.setUserId(stored.getUserId());
        newToken.setFamily(stored.getFamily());
        newToken.setExpiresAt(Instant.now().plusDays(7));
        refreshTokenRepository.save(newToken);

        return new TokenPair(newAccessToken, newRefreshToken);
    }
}
\`\`\`

### JWT Creation and Verification in Java

\`\`\`java
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.KeyPair;

@Service
public class JwtService {

    // For RS256 - Asymmetric
    private final KeyPair keyPair;

    public JwtService() {
        this.keyPair = Keys.keyPairFor(SignatureAlgorithm.RS256);
    }

    /**
     * Tao JWT Access Token
     */
    public String generateAccessToken(Long userId, List<String> roles) {
        return Jwts.builder()
            .setIssuer("https://auth.example.com")
            .setSubject(String.valueOf(userId))
            .setAudience("https://api.example.com")
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000)) // 15 min
            .setId(UUID.randomUUID().toString())
            .claim("roles", roles)
            .signWith(keyPair.getPrivate(), SignatureAlgorithm.RS256)
            .compact();
    }

    /**
     * Verify va parse JWT
     */
    public Claims verifyToken(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(keyPair.getPublic())
            .requireIssuer("https://auth.example.com")
            .requireAudience("https://api.example.com")
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
}

// JWT Filter for Spring Security
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                Claims claims = jwtService.verifyToken(token);
                String userId = claims.getSubject();
                List<String> roles = claims.get("roles", List.class);

                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                        userId, null,
                        roles.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList())
                    );

                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (JwtException e) {
                // Invalid token - do nothing, request will be unauthorized
            }
        }

        filterChain.doFilter(request, response);
    }
}
\`\`\`

### JWT Storage: localStorage vs Cookie

| | localStorage | HttpOnly Cookie |
|---|-------------|-----------------|
| **XSS** | ❌ Vulnerable | ✅ Protected |
| **CSRF** | ✅ Protected | ❌ Needs CSRF token |
| **Access tu JS** | Co | Khong |
| **Auto-send** | Khong (phai attach header) | Co (moi request) |
| **Cross-domain** | De dang | Kho (SameSite) |

> ⚠️ Luu y: **HttpOnly Cookie** la lua chon an toan nhat cho web app. Dung SameSite=Strict + CSRF token. Tranh luu JWT trong localStorage vi XSS co the danh cap token.
    `
  },
  {
    id: 5,
    title: "OAuth 2.0 Framework",
    desc: "OAuth 2.0 - Grant Types, Scopes va cac luong uy quyen",
    content: `
## OAuth 2.0 Framework

OAuth 2.0 (RFC 6749) la **authorization framework** cho phep ung dung ben thu ba truy cap tai nguyen cua nguoi dung ma **khong can biet password**.

### OAuth 2.0 Roles

| Role | Mo ta | Vi du |
|------|-------|-------|
| **Resource Owner** | Nguoi so huu tai nguyen | End user |
| **Client** | Ung dung muon truy cap tai nguyen | Web app, mobile app |
| **Authorization Server** | Cap phep va phat hanh token | Keycloak, Auth0, Google |
| **Resource Server** | Server chua tai nguyen | API server |

\`\`\`mermaid
graph TD
    RO[Resource Owner<br/>User] -->|1. Authorize| AS[Authorization Server<br/>Keycloak/Auth0]
    C[Client<br/>Web App] -->|2. Request Token| AS
    AS -->|3. Issue Token| C
    C -->|4. Access with Token| RS[Resource Server<br/>API]
    RS -->|5. Validate Token| AS

    style AS fill:#7c3aed,stroke:#6d28d9,color:#fff
    style RS fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

### Client Types

| Type | Mo ta | Vi du | Token Storage |
|------|-------|-------|--------------|
| **Confidential** | Co the giu secret an toan | Server-side web app | Server |
| **Public** | Khong the giu secret | SPA, mobile app, desktop | Client (insecure) |

### Grant Types

#### 1. Authorization Code (voi PKCE) - Recommended

Day la grant type **an toan nhat va pho bien nhat**. PKCE (Proof Key for Code Exchange) bat buoc cho public clients.

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant C as Client App
    participant AS as Auth Server
    participant RS as Resource Server

    Note over C: Generate code_verifier + code_challenge

    U->>C: 1. Click "Login with Google"
    C->>AS: 2. GET /authorize?response_type=code<br/>&client_id=xxx&redirect_uri=xxx<br/>&scope=openid profile&state=random<br/>&code_challenge=xxx&code_challenge_method=S256
    AS->>U: 3. Show login + consent page
    U->>AS: 4. Login + Grant permission
    AS->>C: 5. Redirect to callback?code=AUTH_CODE&state=random
    C->>AS: 6. POST /token {code, client_id, client_secret, code_verifier}
    AS-->>C: 7. {access_token, refresh_token, id_token}
    C->>RS: 8. GET /api/resource (Authorization: Bearer access_token)
    RS-->>C: 9. Resource data
\`\`\`

\`\`\`java
// PKCE Implementation
import java.security.MessageDigest;
import java.util.Base64;

public class PKCEUtil {

    /**
     * Generate code_verifier: random 43-128 character string
     */
    public static String generateCodeVerifier() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Generate code_challenge: SHA256 hash of code_verifier
     */
    public static String generateCodeChallenge(String codeVerifier) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(codeVerifier.getBytes("US-ASCII"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("PKCE challenge generation failed", e);
        }
    }
}
\`\`\`

#### 2. Client Credentials - Machine-to-Machine

\`\`\`mermaid
sequenceDiagram
    participant C as Client (Service)
    participant AS as Auth Server
    participant RS as Resource Server

    C->>AS: 1. POST /token {grant_type=client_credentials,<br/>client_id, client_secret, scope}
    AS-->>C: 2. {access_token}
    C->>RS: 3. GET /api/resource (Bearer token)
    RS-->>C: 4. Resource data
\`\`\`

\`\`\`java
// Client Credentials - Service-to-Service call
@Service
public class ServiceAuthClient {

    private final WebClient webClient;

    public String getServiceToken() {
        TokenResponse response = webClient.post()
            .uri("https://auth.example.com/oauth/token")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(BodyInserters
                .fromFormData("grant_type", "client_credentials")
                .with("client_id", "my-service")
                .with("client_secret", "service-secret")
                .with("scope", "read:users"))
            .retrieve()
            .bodyToMono(TokenResponse.class)
            .block();

        return response.getAccessToken();
    }
}
\`\`\`

#### 3. Resource Owner Password (DEPRECATED)

\`\`\`text
❌ KHONG DUNG cho ung dung moi!

Chi dung khi:
- Client la first-party trusted app
- Khong co cach nao khac (legacy migration)
\`\`\`

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant AS as Auth Server

    U->>C: 1. Enter username + password
    C->>AS: 2. POST /token {grant_type=password,<br/>username, password, client_id, scope}
    AS-->>C: 3. {access_token, refresh_token}
\`\`\`

#### 4. Implicit (DEPRECATED)

\`\`\`text
❌ DEPRECATED! Dung Authorization Code + PKCE thay the.

Van de cua Implicit:
- Token trong URL fragment (lo qua browser history, referrer)
- Khong co refresh token
- Khong co client authentication
\`\`\`

#### 5. Device Authorization (Device Code)

Dung cho thiet bi khong co browser (Smart TV, IoT, CLI):

\`\`\`mermaid
sequenceDiagram
    participant D as Device (TV)
    participant AS as Auth Server
    participant U as User Phone/PC

    D->>AS: 1. POST /device/code {client_id, scope}
    AS-->>D: 2. {device_code, user_code: "WDJB-MJHT",<br/>verification_uri: "https://auth.example.com/device"}
    D->>D: 3. Display: "Go to auth.example.com/device<br/>Enter code: WDJB-MJHT"

    U->>AS: 4. Go to verification_uri
    U->>AS: 5. Enter user_code + Login + Consent

    loop Polling
        D->>AS: 6. POST /token {grant_type=device_code,<br/>device_code, client_id}
        AS-->>D: 7. {error: "authorization_pending"}
    end

    AS-->>D: 8. {access_token, refresh_token}
\`\`\`

### Scopes and Consent

Scopes dinh nghia **quyen truy cap** ma client yeu cau:

\`\`\`text
scope=openid profile email read:repos write:repos

openid     - Get ID token (OIDC)
profile    - Read user profile (name, picture)
email      - Read email address
read:repos - Read repositories
write:repos - Write to repositories
\`\`\`

### Token Endpoint Responses

\`\`\`json
// Success Response
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2g...",
  "scope": "openid profile email",
  "id_token": "eyJhbGciOiJSUzI1NiIs..."
}

// Error Response
{
  "error": "invalid_grant",
  "error_description": "Authorization code has expired"
}
\`\`\`

### OAuth 2.0 Security Best Practices

1. **Luon dung PKCE** cho tat ca clients (khong chi public clients)
2. **Validate state parameter** chong CSRF
3. **Dung exact redirect_uri matching** - khong dung wildcard
4. **Refresh token rotation** - moi lan dung refresh token, issue token moi
5. **Short-lived access tokens** - 15 min max
6. **Validate scopes** - chi cap quyen can thiet (least privilege)
7. **Dung Authorization Code** - KHONG dung Implicit hoac Password grant

> ⚠️ Luu y: OAuth 2.0 la **authorization** framework, KHONG phai authentication. De authentication, dung **OpenID Connect** (OIDC) tren nen OAuth 2.0. Xem bai tiep theo.
    `
  },
  {
    id: 6,
    title: "OpenID Connect (OIDC)",
    desc: "OIDC - Identity layer tren OAuth 2.0, ID Token va UserInfo",
    content: `
## OpenID Connect (OIDC)

OpenID Connect la **identity layer** xay dung tren OAuth 2.0. Trong khi OAuth 2.0 chi lam **authorization** (uy quyen), OIDC them **authentication** (xac thuc danh tinh).

### OIDC vs OAuth 2.0

| | OAuth 2.0 | OIDC |
|---|----------|------|
| **Muc dich** | Authorization (uy quyen) | Authentication + Authorization |
| **Tra loi** | "App nay co quyen truy cap photos" | "Day la user John, email john@..." |
| **Token** | Access Token only | Access Token + **ID Token** |
| **User info** | Khong co chuan | UserInfo endpoint chuan |
| **Discovery** | Khong co | .well-known/openid-configuration |
| **Standard claims** | Khong co | sub, name, email, picture... |

\`\`\`mermaid
graph TD
    subgraph "OAuth 2.0"
        O1[Authorization]
        O2[Access Token]
        O3[Scope-based permissions]
    end

    subgraph "OIDC = OAuth 2.0 + Identity"
        OI1[Authorization]
        OI2[Access Token]
        OI3[Scope-based permissions]
        OI4[Authentication]
        OI5[ID Token]
        OI6[UserInfo endpoint]
        OI7[Standard claims]
    end

    style OI4 fill:#22c55e,stroke:#16a34a,color:#fff
    style OI5 fill:#22c55e,stroke:#16a34a,color:#fff
    style OI6 fill:#22c55e,stroke:#16a34a,color:#fff
    style OI7 fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

### ID Token vs Access Token

| | ID Token | Access Token |
|---|---------|-------------|
| **Muc dich** | Xac thuc user identity | Truy cap resource |
| **Audience** | Client app | Resource server (API) |
| **Noi dung** | User info (who) | Permissions (what) |
| **Gui den** | Client only | API server |
| **Format** | Luon la JWT | JWT hoac opaque |

**ID Token example**:
\`\`\`json
{
  "iss": "https://accounts.google.com",
  "sub": "110169484474386276334",
  "aud": "my-client-id.apps.googleusercontent.com",
  "exp": 1700000000,
  "iat": 1699996400,
  "nonce": "random-nonce-value",
  "auth_time": 1699996350,
  "name": "Nguyen Van A",
  "email": "nguyenvana@gmail.com",
  "email_verified": true,
  "picture": "https://lh3.googleusercontent.com/photo.jpg",
  "locale": "vi"
}
\`\`\`

### OIDC Flow (Authorization Code)

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant C as Client App
    participant OP as OpenID Provider<br/>(Google, Keycloak)
    participant API as Resource Server

    U->>C: 1. Click "Login with Google"
    C->>OP: 2. GET /authorize?<br/>response_type=code<br/>&scope=openid profile email<br/>&client_id=xxx<br/>&redirect_uri=xxx<br/>&state=random<br/>&nonce=random
    OP->>U: 3. Login page
    U->>OP: 4. Enter credentials + Consent
    OP->>C: 5. Redirect with ?code=AUTH_CODE&state=random
    C->>OP: 6. POST /token {code, client_id, client_secret}
    OP-->>C: 7. {access_token, id_token, refresh_token}
    C->>C: 8. Validate ID Token (signature, nonce, exp, aud)
    C->>C: 9. Extract user info from ID Token

    opt Need more user info
        C->>OP: 10. GET /userinfo (Authorization: Bearer access_token)
        OP-->>C: 11. {name, email, picture, ...}
    end

    C->>API: 12. GET /api/data (Authorization: Bearer access_token)
    API-->>C: 13. Response data
\`\`\`

### UserInfo Endpoint

\`\`\`http
GET /userinfo HTTP/1.1
Host: auth.example.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

HTTP/1.1 200 OK
Content-Type: application/json

{
  "sub": "user-42",
  "name": "Nguyen Van A",
  "given_name": "A",
  "family_name": "Nguyen",
  "email": "nguyenvana@example.com",
  "email_verified": true,
  "picture": "https://example.com/photo.jpg",
  "locale": "vi",
  "updated_at": 1699996400
}
\`\`\`

### Discovery Document

Moi OpenID Provider cung cap discovery document tai:
\`\`\`text
GET /.well-known/openid-configuration
\`\`\`

\`\`\`json
{
  "issuer": "https://auth.example.com",
  "authorization_endpoint": "https://auth.example.com/authorize",
  "token_endpoint": "https://auth.example.com/oauth/token",
  "userinfo_endpoint": "https://auth.example.com/userinfo",
  "jwks_uri": "https://auth.example.com/.well-known/jwks.json",
  "registration_endpoint": "https://auth.example.com/register",
  "scopes_supported": ["openid", "profile", "email", "address", "phone"],
  "response_types_supported": ["code", "token", "id_token"],
  "grant_types_supported": ["authorization_code", "refresh_token", "client_credentials"],
  "subject_types_supported": ["public"],
  "id_token_signing_alg_values_supported": ["RS256", "ES256"],
  "claims_supported": ["sub", "name", "email", "picture", "locale"]
}
\`\`\`

### Standard Claims

| Scope | Claims duoc tra ve |
|-------|--------------------|
| **openid** | sub |
| **profile** | name, family_name, given_name, middle_name, nickname, preferred_username, picture, website, gender, birthdate, zoneinfo, locale, updated_at |
| **email** | email, email_verified |
| **address** | address (JSON object) |
| **phone** | phone_number, phone_number_verified |

### Nonce for Replay Protection

**Nonce** ngan chan replay attack - dam bao ID Token la response cho request cu the:

\`\`\`java
// 1. Client generate nonce truoc khi gui request
String nonce = UUID.randomUUID().toString();
session.setAttribute("oidc_nonce", nonce);

// 2. Gui nonce trong authorization request
String authUrl = authorizationEndpoint
    + "?response_type=code"
    + "&scope=openid profile email"
    + "&nonce=" + nonce
    + "&state=" + state;

// 3. Verify nonce trong ID Token
Claims idTokenClaims = parseIdToken(idToken);
String tokenNonce = idTokenClaims.get("nonce", String.class);
String expectedNonce = session.getAttribute("oidc_nonce");

if (!tokenNonce.equals(expectedNonce)) {
    throw new SecurityException("Nonce mismatch - possible replay attack!");
}
\`\`\`

### Spring Security OIDC Integration

\`\`\`java
// application.yml
// spring:
//   security:
//     oauth2:
//       client:
//         registration:
//           google:
//             client-id: your-client-id
//             client-secret: your-client-secret
//             scope: openid, profile, email
//           keycloak:
//             client-id: my-app
//             client-secret: my-secret
//             scope: openid, profile, email
//             authorization-grant-type: authorization_code
//             redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
//         provider:
//           keycloak:
//             issuer-uri: https://keycloak.example.com/realms/my-realm

@Configuration
@EnableWebSecurity
public class OidcSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/login")
                .userInfoEndpoint(userInfo -> userInfo
                    .oidcUserService(customOidcUserService())
                )
            );
        return http.build();
    }

    @Bean
    public OidcUserService customOidcUserService() {
        return new CustomOidcUserService();
    }
}

@Service
public class CustomOidcUserService extends OidcUserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest request) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(request);

        // Sync user to local database
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();
        String sub = oidcUser.getSubject();

        User localUser = userRepository.findByOidcSubject(sub)
            .orElseGet(() -> {
                User newUser = new User();
                newUser.setOidcSubject(sub);
                newUser.setEmail(email);
                newUser.setName(name);
                return userRepository.save(newUser);
            });

        return oidcUser;
    }
}
\`\`\`

> ⚠️ Luu y: Luon validate ID Token day du: verify signature, check issuer, audience, expiration, va nonce. Khong tin ID Token ma khong validate.
    `
  },
  {
    id: 7,
    title: "SAML 2.0",
    desc: "SAML 2.0 - XML-based SSO protocol cho enterprise",
    content: `
## SAML 2.0

SAML (Security Assertion Markup Language) 2.0 la **XML-based framework** de trao doi authentication va authorization data giua cac ben. SAML la chuan **enterprise SSO** pho bien nhat.

### SAML Concepts

| Concept | Mo ta |
|---------|-------|
| **Assertion** | XML document chua authentication/authorization statements |
| **Protocol** | Request/Response messages (AuthnRequest, Response) |
| **Binding** | Cach truyen SAML messages (HTTP Redirect, POST, Artifact) |
| **Profile** | Ket hop Protocol + Binding cho use case cu the (Web SSO) |

### SAML Roles

| Role | Mo ta | Vi du |
|------|-------|-------|
| **Identity Provider (IdP)** | Xac thuc user va phat hanh Assertion | Okta, ADFS, Keycloak |
| **Service Provider (SP)** | Ung dung can biet user la ai | Your web app |
| **Principal** | User can xac thuc | End user |

\`\`\`mermaid
graph LR
    U[User/Principal] --> SP[Service Provider<br/>Your App]
    SP <-->|SAML Messages| IdP[Identity Provider<br/>Okta/ADFS]

    style IdP fill:#7c3aed,stroke:#6d28d9,color:#fff
    style SP fill:#3b82f6,stroke:#2563eb,color:#fff
\`\`\`

### SAML Assertion Structure

\`\`\`xml
<saml2:Assertion xmlns:saml2="urn:oasis:names:tc:SAML:2.0:assertion"
                  ID="_assertion123"
                  Version="2.0"
                  IssueInstant="2024-01-15T10:30:00Z">

    <!-- Issuer: Identity Provider -->
    <saml2:Issuer>https://idp.example.com</saml2:Issuer>

    <!-- Digital Signature -->
    <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <!-- Signature validates assertion integrity -->
    </ds:Signature>

    <!-- Subject: Who is this assertion about -->
    <saml2:Subject>
        <saml2:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">
            user@example.com
        </saml2:NameID>
        <saml2:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer">
            <saml2:SubjectConfirmationData
                InResponseTo="_request456"
                Recipient="https://app.example.com/saml/acs"
                NotOnOrAfter="2024-01-15T10:35:00Z"/>
        </saml2:SubjectConfirmation>
    </saml2:Subject>

    <!-- Conditions: When is this assertion valid -->
    <saml2:Conditions NotBefore="2024-01-15T10:30:00Z"
                       NotOnOrAfter="2024-01-15T10:35:00Z">
        <saml2:AudienceRestriction>
            <saml2:Audience>https://app.example.com</saml2:Audience>
        </saml2:AudienceRestriction>
    </saml2:Conditions>

    <!-- Authentication Statement -->
    <saml2:AuthnStatement AuthnInstant="2024-01-15T10:29:50Z"
                           SessionIndex="_session789">
        <saml2:AuthnContext>
            <saml2:AuthnContextClassRef>
                urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
            </saml2:AuthnContextClassRef>
        </saml2:AuthnContext>
    </saml2:AuthnStatement>

    <!-- Attribute Statement: User attributes -->
    <saml2:AttributeStatement>
        <saml2:Attribute Name="firstName">
            <saml2:AttributeValue>Nguyen</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute Name="lastName">
            <saml2:AttributeValue>Van A</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute Name="email">
            <saml2:AttributeValue>user@example.com</saml2:AttributeValue>
        </saml2:Attribute>
        <saml2:Attribute Name="roles">
            <saml2:AttributeValue>ADMIN</saml2:AttributeValue>
            <saml2:AttributeValue>USER</saml2:AttributeValue>
        </saml2:Attribute>
    </saml2:AttributeStatement>

</saml2:Assertion>
\`\`\`

### SP-Initiated SSO Flow

\`\`\`mermaid
sequenceDiagram
    participant U as User Browser
    participant SP as Service Provider
    participant IdP as Identity Provider

    U->>SP: 1. Access protected resource
    SP->>SP: 2. User not authenticated
    SP->>U: 3. Redirect to IdP with AuthnRequest
    U->>IdP: 4. AuthnRequest (HTTP Redirect/POST)

    alt User not logged in at IdP
        IdP->>U: 5. Show login page
        U->>IdP: 6. Enter credentials
        IdP->>IdP: 7. Authenticate user
    end

    IdP->>U: 8. SAML Response with Assertion (HTTP POST)
    U->>SP: 9. POST to ACS URL with SAML Response
    SP->>SP: 10. Validate Assertion (signature, conditions, audience)
    SP->>SP: 11. Create local session
    SP->>U: 12. Redirect to original resource
\`\`\`

### IdP-Initiated SSO Flow

\`\`\`mermaid
sequenceDiagram
    participant U as User Browser
    participant IdP as Identity Provider
    participant SP as Service Provider

    U->>IdP: 1. Login to IdP portal
    IdP->>IdP: 2. Authenticate user
    U->>IdP: 3. Click on SP app icon
    IdP->>U: 4. SAML Response with Assertion
    U->>SP: 5. POST to ACS URL with SAML Response
    SP->>SP: 6. Validate Assertion
    SP->>SP: 7. Create local session
    SP->>U: 8. Access granted
\`\`\`

### SAML Bindings

| Binding | Mo ta | Khi nao dung |
|---------|-------|-------------|
| **HTTP Redirect** | SAML message trong URL query string | AuthnRequest (nho) |
| **HTTP POST** | SAML message trong hidden form field | Response/Assertion (lon) |
| **Artifact** | Chi gui reference, resolve sau | Khi SAML message qua lon cho URL |

### XML Signature and Encryption

\`\`\`text
SAML Security:

1. XML Signature (XMLDSig):
   - Sign Assertion: Dam bao noi dung khong bi thay doi
   - Sign Response: Dam bao toan bo response chinh xac

2. XML Encryption (XMLEnc):
   - Encrypt Assertion: Chi SP moi doc duoc noi dung
   - Encrypt NameID: Bao ve danh tinh user

3. Certificate-based:
   - IdP ky bang private key
   - SP verify bang IdP's public key (trong metadata)
\`\`\`

### SAML vs OIDC Comparison

| Tieu chi | SAML 2.0 | OIDC |
|----------|----------|------|
| **Format** | XML | JSON |
| **Token** | Assertion (XML) | JWT (JSON) |
| **Transport** | HTTP Redirect/POST | HTTP REST |
| **Complexity** | Phuc tap | Don gian hon |
| **Mobile** | Kho | De |
| **Enterprise** | Chuan enterprise | Dang duoc adopt |
| **Size** | Lon (XML verbose) | Nho (JSON compact) |
| **Protocol** | SAML Protocol | OAuth 2.0 + OIDC |
| **Discovery** | Metadata XML | .well-known/openid-configuration |
| **Signature** | XML Signature | JWT Signature |
| **Encryption** | XML Encryption | JWE (JSON Web Encryption) |

### Spring Security SAML Configuration

\`\`\`java
@Configuration
@EnableWebSecurity
public class SamlSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login").permitAll()
                .anyRequest().authenticated()
            )
            .saml2Login(saml2 -> saml2
                .loginPage("/login")
            )
            .saml2Logout(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public RelyingPartyRegistrationRepository relyingPartyRegistrations() {
        RelyingPartyRegistration registration = RelyingPartyRegistrations
            .fromMetadataLocation("https://idp.example.com/metadata")
            .registrationId("my-saml-app")
            .entityId("https://app.example.com/saml/metadata")
            .assertionConsumerServiceLocation(
                "https://app.example.com/login/saml2/sso/{registrationId}")
            .build();

        return new InMemoryRelyingPartyRegistrationRepository(registration);
    }
}
\`\`\`

> ⚠️ Luu y: SAML phuc tap va de bi tan cong XML-based (XXE, XML Signature Wrapping). Luon dung thu vien SAML duoc maintain tot (Spring Security SAML, OpenSAML). Khong tu parse XML.
    `
  },
  {
    id: 8,
    title: "Single Sign-On (SSO)",
    desc: "SSO - Kien truc, Implementation va Security Considerations",
    content: `
## Single Sign-On (SSO)

SSO cho phep user **dang nhap mot lan** va truy cap nhieu ung dung ma khong can dang nhap lai.

### SSO Concepts va Benefits

**Loi ich cua SSO**:

| Loi ich | Mo ta |
|---------|-------|
| **User Experience** | Dang nhap 1 lan, truy cap tat ca apps |
| **Security** | Giam so luong password, de enforce MFA |
| **Admin** | Quan ly tap trung, de revoke access |
| **Compliance** | Audit log tap trung, consistent policies |
| **Productivity** | Giam thoi gian dang nhap, giam support tickets |

### SSO Architectures

\`\`\`mermaid
graph TD
    subgraph "Centralized SSO"
        U1[User] --> IDP1[Central IdP<br/>Keycloak/Okta]
        IDP1 --> A1[App 1]
        IDP1 --> A2[App 2]
        IDP1 --> A3[App 3]
    end

    subgraph "Federated SSO"
        U2[User] --> IDP2A[IdP A<br/>Company A]
        U2 --> IDP2B[IdP B<br/>Company B]
        IDP2A <-->|Trust| IDP2B
        IDP2A --> A4[App 1]
        IDP2B --> A5[App 2]
    end

    style IDP1 fill:#7c3aed,stroke:#6d28d9,color:#fff
    style IDP2A fill:#3b82f6,stroke:#2563eb,color:#fff
    style IDP2B fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

| Architecture | Mo ta | Use case |
|-------------|-------|----------|
| **Centralized** | Mot IdP trung tam cho tat ca apps | Noi bo company |
| **Federated** | Nhieu IdP tin tuong lan nhau | Cross-organization (B2B) |
| **Cooperative** | Nhieu IdP chia se user directory | Academic networks |

### SSO with OIDC Implementation

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant App1 as App 1 (SP)
    participant App2 as App 2 (SP)
    participant IdP as Keycloak (IdP)

    Note over U,IdP: First login to App 1
    U->>App1: 1. Access App 1
    App1->>IdP: 2. Redirect to /authorize
    IdP->>U: 3. Show login page
    U->>IdP: 4. Login (username + password)
    IdP->>IdP: 5. Create SSO session (cookie)
    IdP->>App1: 6. Redirect with auth code
    App1->>IdP: 7. Exchange code for tokens
    App1->>App1: 8. Create local session
    App1->>U: 9. Access granted

    Note over U,IdP: Access App 2 (NO re-login!)
    U->>App2: 10. Access App 2
    App2->>IdP: 11. Redirect to /authorize
    IdP->>IdP: 12. SSO session exists!
    IdP->>App2: 13. Redirect with auth code (no login needed)
    App2->>IdP: 14. Exchange code for tokens
    App2->>App2: 15. Create local session
    App2->>U: 16. Access granted (no password needed!)
\`\`\`

\`\`\`java
// Keycloak SSO Configuration - application.yml
// spring:
//   security:
//     oauth2:
//       client:
//         registration:
//           keycloak:
//             client-id: app1
//             client-secret: app1-secret
//             scope: openid, profile, email
//             authorization-grant-type: authorization_code
//         provider:
//           keycloak:
//             issuer-uri: https://keycloak.example.com/realms/my-realm

@Configuration
@EnableWebSecurity
public class SsoConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("/dashboard")
                .failureUrl("/login?error")
            )
            .logout(logout -> logout
                // OIDC logout - redirect to Keycloak to end SSO session
                .logoutSuccessHandler(oidcLogoutSuccessHandler())
            );

        return http.build();
    }

    private LogoutSuccessHandler oidcLogoutSuccessHandler() {
        OidcClientInitiatedLogoutSuccessHandler handler =
            new OidcClientInitiatedLogoutSuccessHandler(
                clientRegistrationRepository);
        handler.setPostLogoutRedirectUri("{baseUrl}/login?logout");
        return handler;
    }
}
\`\`\`

### SSO with SAML Implementation

\`\`\`java
// Spring Security SAML SSO
@Configuration
@EnableWebSecurity
public class SamlSsoConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/login").permitAll()
                .anyRequest().authenticated()
            )
            .saml2Login(saml2 -> saml2
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard")
            )
            .saml2Logout(logout -> logout
                .logoutUrl("/logout")
                .logoutResponse(response -> response
                    .logoutUrl("/logout/saml2/slo"))
            );

        return http.build();
    }
}
\`\`\`

### Cross-Domain SSO Challenges

| Challenge | Van de | Solution |
|-----------|--------|----------|
| **Cookie same-origin** | Cookie khong share cross-domain | Dung redirect flow (OIDC/SAML) |
| **Third-party cookie** | Browsers block 3rd-party cookies | Dung redirect thay vi iframe |
| **Session sync** | Logout 1 app, cac app khac van active | Implement Single Logout (SLO) |
| **Clock skew** | Time khac nhau giua servers | Cho phep tolerance (vd: 5 phut) |

### Single Logout (SLO)

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant App1 as App 1
    participant App2 as App 2
    participant IdP as Identity Provider

    Note over U,IdP: User logged in to App1 and App2

    U->>App1: 1. Logout from App 1
    App1->>App1: 2. Destroy local session
    App1->>IdP: 3. Logout Request

    par Notify other apps
        IdP->>App2: 4a. Back-channel logout notification
        App2->>App2: 4b. Destroy session for this user
    end

    IdP->>IdP: 5. Destroy SSO session
    IdP->>U: 6. Redirect to post-logout page
\`\`\`

**SLO Methods**:

| Method | Mo ta | Uu diem | Nhuoc diem |
|--------|-------|---------|------------|
| **Front-channel** | Redirect user qua moi app de logout | Don gian | Cham, co the fail |
| **Back-channel** | IdP goi truc tiep den moi app | Nhanh, reliable | Can app expose endpoint |
| **Session timeout** | Session het han tu dong | Automatic | Delay, khong instant |

### Enterprise SSO Solutions

| Solution | Loai | Use case |
|----------|------|----------|
| **Keycloak** | Open source IdP | Full-featured, self-hosted |
| **Okta** | Cloud IdP | Enterprise SaaS |
| **Auth0** | Cloud IdP | Developer-friendly |
| **Azure AD** | Cloud IdP | Microsoft ecosystem |
| **Active Directory + ADFS** | On-premise | Windows enterprise |
| **PingFederate** | Enterprise IdP | Large enterprise |

### Keycloak Setup Example

\`\`\`bash
# Docker Compose for Keycloak
# docker-compose.yml:
# version: '3.8'
# services:
#   keycloak:
#     image: quay.io/keycloak/keycloak:23.0
#     environment:
#       KEYCLOAK_ADMIN: admin
#       KEYCLOAK_ADMIN_PASSWORD: admin
#       KC_DB: postgres
#       KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
#       KC_DB_USERNAME: keycloak
#       KC_DB_PASSWORD: keycloak
#     command: start-dev
#     ports:
#       - "8080:8080"
#     depends_on:
#       - postgres
#
#   postgres:
#     image: postgres:15
#     environment:
#       POSTGRES_DB: keycloak
#       POSTGRES_USER: keycloak
#       POSTGRES_PASSWORD: keycloak
#     volumes:
#       - pgdata:/var/lib/postgresql/data
#
# volumes:
#   pgdata:
\`\`\`

\`\`\`text
Keycloak Setup Steps:
1. Create Realm: "my-company"
2. Create Client: "app1" (confidential, authorization code)
3. Set Redirect URIs: https://app1.example.com/callback
4. Create Roles: ADMIN, USER, MANAGER
5. Create Users va assign roles
6. Configure Identity Providers (Google, SAML IdP)
7. Configure Client Scopes
8. Setup Brute Force Detection
9. Configure Password Policies
10. Setup 2FA (TOTP)
\`\`\`

### SSO Security Considerations

1. **Token/Assertion validation** - Luon validate signature, issuer, audience, expiration
2. **Secure communication** - HTTPS bat buoc cho moi endpoint
3. **Session management** - Timeout, concurrent session limits
4. **SLO implementation** - Dam bao logout toan bo he thong
5. **Account linking** - Can than khi link accounts tu nhieu IdP
6. **Privilege escalation** - Validate roles/permissions tai moi SP
7. **Phishing** - Protect redirect URIs, validate state parameter
8. **Token theft** - Dung short-lived tokens, implement token binding

> ⚠️ Luu y: SSO tap trung rui ro vao IdP - neu IdP bi hack, tat ca apps bi anh huong. Dam bao IdP duoc bao ve tot nhat: MFA cho admin, audit logging, regular security review.
    `
  },
  {
    id: 9,
    title: 'API Security',
    desc: 'API authentication methods, OWASP API Top 10, CORS, input validation',
    content: `
## API Security

API la cua ngo chinh vao he thong. Bao ve API dung cach la critical de ngan chan data breaches va unauthorized access.

### API Authentication Methods

| Method | Security | Complexity | Use Case |
|--------|----------|------------|----------|
| API Key | Low | Low | Public APIs, rate limiting |
| Bearer Token (JWT) | Medium | Medium | User-facing APIs |
| OAuth 2.0 | High | High | Third-party access |
| mTLS | Very High | High | Service-to-service |
| HMAC Signature | High | Medium | Webhooks, AWS-style |

### API Key Security

\`\`\`java
// API Key validation middleware
@Component
public class ApiKeyFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response, FilterChain chain) {
        String apiKey = request.getHeader("X-API-Key");

        if (apiKey == null || !apiKeyService.isValid(apiKey)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Invalid API key");
            return;
        }

        // Rate limiting per API key
        if (rateLimiter.isRateLimited(apiKey)) {
            response.setStatus(429);
            response.setHeader("Retry-After", "60");
            return;
        }

        chain.doFilter(request, response);
    }
}
\`\`\`

### Input Validation

\`\`\`java
// Spring Validation
@RestController
public class UserController {
    @PostMapping("/api/users")
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest req) {
        // Validated automatically
        return ResponseEntity.ok(userService.create(req));
    }
}

public class CreateUserRequest {
    @NotBlank @Size(min = 2, max = 100)
    private String name;

    @NotBlank @Email
    private String email;

    @NotBlank @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\\\d).{8,}$",
        message = "Password must have 8+ chars, upper, lower, digit")
    private String password;

    @Min(18) @Max(120)
    private int age;
}
\`\`\`

### SQL Injection Prevention

\`\`\`java
// BAD: String concatenation (SQL Injection vulnerable!)
String query = "SELECT * FROM users WHERE name = '" + name + "'";
// Input: ' OR '1'='1  => Returns ALL users!

// GOOD: Parameterized query
PreparedStatement ps = conn.prepareStatement(
    "SELECT * FROM users WHERE name = ?");
ps.setString(1, name);

// GOOD: Spring Data JPA (auto-parameterized)
@Query("SELECT u FROM User u WHERE u.email = :email")
User findByEmail(@Param("email") String email);
\`\`\`

### CORS Configuration

\`\`\`java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("https://myapp.com", "https://admin.myapp.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("Authorization", "Content-Type")
            .exposedHeaders("X-Request-Id")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
\`\`\`

### OWASP API Security Top 10

| # | Vulnerability | Prevention |
|---|--------------|------------|
| 1 | Broken Object Level Authorization | Check ownership on every request |
| 2 | Broken Authentication | Strong auth, rate limiting, MFA |
| 3 | Broken Object Property Authorization | Whitelist response fields |
| 4 | Unrestricted Resource Consumption | Rate limiting, pagination |
| 5 | Broken Function Level Authorization | RBAC on every endpoint |
| 6 | Server Side Request Forgery | Validate/whitelist URLs |
| 7 | Security Misconfiguration | Security headers, disable debug |
| 8 | Lack of Protection from Automated Threats | Bot detection, CAPTCHA |
| 9 | Improper Inventory Management | API versioning, deprecation |
| 10 | Unsafe Consumption of APIs | Validate third-party responses |

> ⚠️ Luu y: API Security khong chi la authentication - authorization (ai duoc lam gi) quan trong khong kem. Luon kiem tra quyen truy cap tai EVERY endpoint, EVERY resource.
    `
  },
  {
    id: 10,
    title: 'Authorization Models',
    desc: 'RBAC, ABAC, ReBAC, policy engines, Spring Security authorization',
    content: `
## Authorization Models

Authorization quyet dinh user duoc phep lam gi sau khi da authenticated. Chon dung model la key cho scalable permission system.

### Authorization Models Comparison

| Model | Based On | Flexibility | Complexity | Best For |
|-------|----------|-------------|------------|----------|
| ACL | Resource -> Users | Low | Low | File systems |
| RBAC | Roles -> Permissions | Medium | Medium | Enterprise apps |
| ABAC | Attributes + Policies | Very High | High | Complex policies |
| ReBAC | Relationships | High | Medium-High | Social networks, docs |

### RBAC Implementation

\`\`\`mermaid
graph LR
    U[User] --> R1[Role: Admin]
    U --> R2[Role: Editor]
    R1 --> P1[Permission: user:read]
    R1 --> P2[Permission: user:write]
    R1 --> P3[Permission: user:delete]
    R2 --> P1
    R2 --> P2
    style U fill:#3b82f6,stroke:#2563eb,color:#fff
    style R1 fill:#f59e0b,stroke:#d97706,color:#fff
    style R2 fill:#f59e0b,stroke:#d97706,color:#fff
    style P1 fill:#22c55e,stroke:#16a34a,color:#fff
    style P2 fill:#22c55e,stroke:#16a34a,color:#fff
    style P3 fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

\`\`\`java
// Spring Security RBAC
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .requestMatchers("/api/users/**").hasAnyRole("ADMIN", "USER")
            .requestMatchers("/api/public/**").permitAll()
            .anyRequest().authenticated()
        );
        return http.build();
    }
}

// Method-level security
@Service
public class UserService {
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(Long id) { ... }

    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public User getUser(Long userId) { ... }

    @PostAuthorize("returnObject.owner == authentication.name")
    public Document getDocument(Long docId) { ... }
}
\`\`\`

### ABAC - Attribute Based Access Control

\`\`\`java
// ABAC decision: Can user access resource?
public class AbacDecision {
    public boolean canAccess(User user, Resource resource, String action) {
        // Subject attributes
        String department = user.getDepartment();
        String clearanceLevel = user.getClearanceLevel();

        // Resource attributes
        String classification = resource.getClassification();
        String resourceDept = resource.getDepartment();

        // Environment attributes
        LocalTime now = LocalTime.now();
        boolean isBusinessHours = now.isAfter(LocalTime.of(9, 0))
            && now.isBefore(LocalTime.of(18, 0));

        // Policy evaluation
        if (action.equals("READ")) {
            return clearanceLevel.compareTo(classification) >= 0
                && (department.equals(resourceDept) || isBusinessHours);
        }
        if (action.equals("WRITE")) {
            return clearanceLevel.compareTo(classification) >= 0
                && department.equals(resourceDept);
        }
        return false;
    }
}
\`\`\`

### Database Permission Schema

\`\`\`sql
-- RBAC database schema
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(20) NOT NULL,
    UNIQUE(resource, action)
);

CREATE TABLE role_permissions (
    role_id INT REFERENCES roles(id),
    permission_id INT REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id INT REFERENCES users(id),
    role_id INT REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- Check permission query
SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = $1
    AND p.resource = $2
    AND p.action = $3
) AS has_permission;
\`\`\`

### Open Policy Agent (OPA)

\`\`\`text
# Rego policy language
package authz

default allow = false

# Admin can do anything
allow {
    input.user.role == "admin"
}

# Users can read their own data
allow {
    input.method == "GET"
    input.path == ["api", "users", input.user.id]
}

# Editors can update documents in their department
allow {
    input.method == "PUT"
    input.user.role == "editor"
    data.documents[input.resource_id].department == input.user.department
}
\`\`\`

> ⚠️ Luu y: Bat dau voi RBAC - don gian va du cho hau het ung dung. Chi chuyen sang ABAC khi RBAC khong du linh hoat (vd: "chi cho phep edit khi gio hanh chinh VA cung department").
    `
  },
  {
    id: 11,
    title: 'Cryptography Essentials',
    desc: 'Symmetric/asymmetric encryption, digital signatures, TLS 1.3, PKI',
    content: `
## Cryptography Essentials

Cryptography la nen tang cua moi he thong bao mat. Hieu dung cac primitive giup ban chon va implement bao mat chinh xac.

### Encryption Types

\`\`\`mermaid
graph LR
    subgraph "Symmetric"
        K1[Same Key] --> E1[Encrypt]
        K1 --> D1[Decrypt]
        E1 --> CT1[Ciphertext]
        CT1 --> D1
    end
    subgraph "Asymmetric"
        PUB[Public Key] --> E2[Encrypt]
        PRV[Private Key] --> D2[Decrypt]
        E2 --> CT2[Ciphertext]
        CT2 --> D2
    end
    style K1 fill:#22c55e,stroke:#16a34a,color:#fff
    style PUB fill:#3b82f6,stroke:#2563eb,color:#fff
    style PRV fill:#ef4444,stroke:#dc2626,color:#fff
\`\`\`

### Symmetric Encryption (AES)

| Algorithm | Key Size | Block Size | Security | Speed |
|-----------|----------|------------|----------|-------|
| AES-128 | 128 bit | 128 bit | Good | Fast |
| AES-256 | 256 bit | 128 bit | Excellent | Fast |
| ChaCha20 | 256 bit | N/A (stream) | Excellent | Very Fast |

\`\`\`java
// AES-256-GCM encryption (authenticated encryption)
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;

public class AesEncryption {
    private static final int GCM_TAG_LENGTH = 128;
    private static final int IV_LENGTH = 12;

    public byte[] encrypt(byte[] plaintext, byte[] key) throws Exception {
        byte[] iv = new byte[IV_LENGTH];
        new SecureRandom().nextBytes(iv);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE,
            new SecretKeySpec(key, "AES"),
            new GCMParameterSpec(GCM_TAG_LENGTH, iv));

        byte[] ciphertext = cipher.doFinal(plaintext);

        // Prepend IV to ciphertext
        byte[] result = new byte[iv.length + ciphertext.length];
        System.arraycopy(iv, 0, result, 0, iv.length);
        System.arraycopy(ciphertext, 0, result, iv.length, ciphertext.length);
        return result;
    }

    public byte[] decrypt(byte[] encrypted, byte[] key) throws Exception {
        byte[] iv = Arrays.copyOfRange(encrypted, 0, IV_LENGTH);
        byte[] ciphertext = Arrays.copyOfRange(encrypted, IV_LENGTH, encrypted.length);

        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE,
            new SecretKeySpec(key, "AES"),
            new GCMParameterSpec(GCM_TAG_LENGTH, iv));

        return cipher.doFinal(ciphertext);
    }
}
\`\`\`

### Asymmetric Encryption (RSA)

\`\`\`java
// RSA key pair generation and usage
import java.security.KeyPairGenerator;
import java.security.KeyPair;

// Generate key pair
KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
generator.initialize(2048);
KeyPair keyPair = generator.generateKeyPair();

// Encrypt with public key
Cipher cipher = Cipher.getInstance("RSA/ECB/OAEPWithSHA-256AndMGF1Padding");
cipher.init(Cipher.ENCRYPT_MODE, keyPair.getPublic());
byte[] encrypted = cipher.doFinal(plaintext);

// Decrypt with private key
cipher.init(Cipher.DECRYPT_MODE, keyPair.getPrivate());
byte[] decrypted = cipher.doFinal(encrypted);
\`\`\`

### Digital Signatures

\`\`\`java
// Sign data with private key
Signature signer = Signature.getInstance("SHA256withRSA");
signer.initSign(privateKey);
signer.update(data);
byte[] signature = signer.sign();

// Verify with public key
Signature verifier = Signature.getInstance("SHA256withRSA");
verifier.initVerify(publicKey);
verifier.update(data);
boolean isValid = verifier.verify(signature);
\`\`\`

### TLS 1.3 Handshake

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: ClientHello (supported ciphers, key share)
    S->>C: ServerHello (chosen cipher, key share)
    S->>C: EncryptedExtensions
    S->>C: Certificate
    S->>C: CertificateVerify (signature)
    S->>C: Finished
    C->>S: Finished
    Note over C,S: 1-RTT Handshake Complete!
    C->>S: Application Data (encrypted)
    S->>C: Application Data (encrypted)
\`\`\`

### Certificate Chain (PKI)

\`\`\`text
Root CA (self-signed, stored in OS/browser trust store)
  └── Intermediate CA (signed by Root CA)
        └── Server Certificate (signed by Intermediate CA)
              - Subject: myapp.com
              - Public Key
              - Validity: 2024-01-01 to 2025-01-01
              - Issuer: Intermediate CA

Verification process:
1. Client receives server cert
2. Check signature with Intermediate CA public key
3. Check Intermediate CA signature with Root CA public key
4. Root CA is in trust store -> TRUSTED!
5. Check expiry, hostname match, revocation (OCSP/CRL)
\`\`\`

### Key Management Best Practices

- **Never hardcode keys** in source code
- **Use key derivation** (PBKDF2, HKDF) from passwords
- **Rotate keys** regularly (90 days for symmetric, yearly for asymmetric)
- **Use HSM** (Hardware Security Module) for critical keys
- **Separate encryption keys** from signing keys
- **Use envelope encryption**: encrypt data with data key, encrypt data key with master key

> ⚠️ Luu y: KHONG BAO GIO tu implement cryptographic algorithms. Luon dung well-tested libraries (Bouncy Castle, libsodium). Mot loi nho trong crypto implementation co the pha huy toan bo bao mat.
    `
  },
  {
    id: 12,
    title: 'OAuth 2.0 Advanced - Token Security',
    desc: 'Token introspection, revocation, DPoP, refresh rotation, JWT attacks',
    content: `
## OAuth 2.0 Advanced - Token Security

Token security la critical trong OAuth 2.0. Hieu cac attack vectors va defense mechanisms giup xay dung secure token lifecycle.

### Token Introspection (RFC 7662)

\`\`\`http
POST /oauth/introspect HTTP/1.1
Host: auth.example.com
Content-Type: application/x-www-form-urlencoded
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW

token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...

HTTP/1.1 200 OK
{
  "active": true,
  "sub": "user123",
  "client_id": "my-app",
  "scope": "read write",
  "exp": 1719500000,
  "iat": 1719496400,
  "token_type": "Bearer"
}
\`\`\`

\`\`\`java
// Resource server validates token via introspection
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.oauth2ResourceServer(oauth2 -> oauth2
        .opaqueToken(opaque -> opaque
            .introspectionUri("https://auth.example.com/oauth/introspect")
            .introspectionClientCredentials("client-id", "client-secret")
        )
    );
    return http.build();
}
\`\`\`

### Token Revocation (RFC 7009)

\`\`\`http
POST /oauth/revoke HTTP/1.1
Host: auth.example.com
Content-Type: application/x-www-form-urlencoded
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW

token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
&token_type_hint=access_token
\`\`\`

### Refresh Token Rotation

\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant AS as Auth Server
    C->>AS: Token Request (refresh_token_1)
    AS->>AS: Invalidate refresh_token_1
    AS->>C: New access_token + refresh_token_2
    Note over C: Store refresh_token_2

    C->>AS: Token Request (refresh_token_2)
    AS->>AS: Invalidate refresh_token_2
    AS->>C: New access_token + refresh_token_3

    Note over C,AS: If attacker uses stolen refresh_token_1:
    C->>AS: Token Request (refresh_token_1)
    AS->>AS: Token reuse detected!
    AS->>AS: Revoke ALL tokens for this user
    AS->>C: 401 Unauthorized
\`\`\`

\`\`\`java
// Refresh token rotation implementation
public TokenResponse refreshToken(String refreshToken) {
    RefreshTokenEntity token = tokenRepository.findByToken(refreshToken)
        .orElseThrow(() -> new InvalidTokenException("Invalid refresh token"));

    // Detect reuse (token already used)
    if (token.isUsed()) {
        // Potential token theft! Revoke all tokens for this user
        tokenRepository.revokeAllByUserId(token.getUserId());
        throw new TokenReuseException("Token reuse detected, all tokens revoked");
    }

    // Mark current token as used
    token.setUsed(true);
    tokenRepository.save(token);

    // Issue new tokens
    String newAccessToken = jwtService.generateAccessToken(token.getUserId());
    String newRefreshToken = generateRefreshToken(token.getUserId());

    return new TokenResponse(newAccessToken, newRefreshToken);
}
\`\`\`

### Common JWT Attacks

| Attack | Description | Prevention |
|--------|-------------|------------|
| None Algorithm | Set alg to "none", bypass signature | Whitelist allowed algorithms |
| Key Confusion | Use RS256 public key as HS256 secret | Explicitly set algorithm in verification |
| Token Substitution | Use token from one service in another | Validate audience (aud) claim |
| Expired Token | Use old expired token | Always validate exp claim |
| JWK Injection | Inject attacker's key in JWT header | Only trust configured keys |
| Token Sidejacking | Steal token from insecure channel | Use HTTPS, secure cookies |

\`\`\`java
// Secure JWT validation
public Claims validateToken(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(publicKey)
        .requireAudience("my-api")        // Validate audience
        .requireIssuer("https://auth.example.com")  // Validate issuer
        .setAllowedClockSkewSeconds(30)   // Small clock skew tolerance
        .build()
        .parseClaimsJws(token)
        .getBody();
    // Library automatically validates: exp, nbf, signature
    // Library automatically rejects: alg=none, wrong algorithm
}
\`\`\`

### DPoP (Demonstration of Proof-of-Possession)

\`\`\`text
DPoP prevents token theft by binding tokens to client's key pair:

1. Client generates ephemeral key pair
2. Client creates DPoP proof JWT (signed with private key):
   {
     "typ": "dpop+jwt",
     "alg": "ES256",
     "jwk": { /* public key */ }
   }.{
     "htm": "POST",
     "htu": "https://api.example.com/orders",
     "iat": 1719496400,
     "jti": "unique-id"
   }

3. Client sends both access token and DPoP proof:
   Authorization: DPoP eyJhbGciOiJSUzI1NiJ9...
   DPoP: eyJ0eXAiOiJkcG9wK2p3dCJ9...

4. Server validates:
   - DPoP proof signature matches public key in proof
   - Public key matches thumbprint in access token (jkt claim)
   - Method and URL match
   → Even if access token is stolen, attacker cannot use it
     without the private key!
\`\`\`

> ⚠️ Luu y: Access token nen co lifetime ngan (5-15 phut). Refresh token lifetime dai hon (7-30 ngay) nhung PHAI implement rotation va reuse detection. Luon validate iss, aud, exp claims.
    `
  },
  {
    id: 13,
    title: 'Identity Federation & Multi-Tenancy',
    desc: 'Federation, identity brokering, multi-tenant auth, SCIM provisioning',
    content: `
## Identity Federation & Multi-Tenancy

Enterprise systems thuong can integrate nhieu identity providers va support multi-tenant architecture. Federation va identity brokering la key patterns.

### Identity Federation

\`\`\`mermaid
graph TD
    subgraph "Organization A"
        UA[Users A] --> IDP_A[IdP A<br/>Active Directory]
    end
    subgraph "Organization B"
        UB[Users B] --> IDP_B[IdP B<br/>Okta]
    end
    subgraph "Service Provider"
        IDP_A --> IB[Identity Broker<br/>Keycloak]
        IDP_B --> IB
        IB --> APP[Application]
    end
    style IB fill:#3b82f6,stroke:#2563eb,color:#fff
    style APP fill:#22c55e,stroke:#16a34a,color:#fff
    style IDP_A fill:#f59e0b,stroke:#d97706,color:#fff
    style IDP_B fill:#f59e0b,stroke:#d97706,color:#fff
\`\`\`

### Identity Brokering with Keycloak

\`\`\`json
{
  "realm": "my-app",
  "identityProviders": [
    {
      "alias": "google",
      "providerId": "google",
      "enabled": true,
      "config": {
        "clientId": "google-client-id",
        "clientSecret": "google-client-secret",
        "defaultScope": "openid email profile"
      }
    },
    {
      "alias": "corporate-saml",
      "providerId": "saml",
      "enabled": true,
      "config": {
        "singleSignOnServiceUrl": "https://corporate-idp.com/sso",
        "signingCertificate": "MIIDpTCCA...",
        "nameIDPolicyFormat": "urn:oasis:names:tc:SAML:2.0:nameid-format:persistent"
      }
    }
  ]
}
\`\`\`

### Multi-Tenant Authentication

\`\`\`text
Multi-tenancy patterns:

1. Separate realm/tenant per customer:
   - URL: auth.example.com/realms/{tenant}
   - Full isolation
   - More resources needed

2. Shared realm with tenant attribute:
   - All users in one realm
   - tenant_id claim in token
   - Less isolation, more efficient

3. Hybrid: Shared auth, separate data:
   - Common auth service
   - Tenant routing at data layer
\`\`\`

\`\`\`java
// Multi-tenant JWT validation
public class TenantAwareAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response, FilterChain chain) {
        String token = extractToken(request);
        Claims claims = jwtService.validateToken(token);

        String tenantId = claims.get("tenant_id", String.class);
        String requestTenant = extractTenantFromUrl(request);

        // Ensure token tenant matches requested tenant
        if (!tenantId.equals(requestTenant)) {
            response.setStatus(403);
            return;
        }

        // Set tenant context for downstream services
        TenantContext.setCurrentTenant(tenantId);

        try {
            chain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
}
\`\`\`

### SCIM - User Provisioning

\`\`\`http
POST /scim/v2/Users HTTP/1.1
Host: app.example.com
Content-Type: application/scim+json
Authorization: Bearer token123

{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
  "userName": "john.doe@company.com",
  "name": {
    "givenName": "John",
    "familyName": "Doe"
  },
  "emails": [{
    "primary": true,
    "value": "john.doe@company.com",
    "type": "work"
  }],
  "active": true,
  "groups": [{
    "value": "group-id-123",
    "display": "Engineering"
  }]
}
\`\`\`

\`\`\`text
SCIM Operations:
- POST /Users - Create user
- GET /Users/{id} - Get user
- PUT /Users/{id} - Replace user
- PATCH /Users/{id} - Update user
- DELETE /Users/{id} - Deactivate user
- GET /Users?filter=userName eq "john" - Search users

SCIM enables:
1. Automatic user provisioning from IdP to app
2. Deprovisioning when employee leaves
3. Group/role sync across systems
4. Reduces manual account management
\`\`\`

### Account Linking

\`\`\`text
Scenario: User signs up with email, later logs in with Google

1. User registers: email=john@example.com, password
2. User clicks "Sign in with Google"
3. Google returns: email=john@example.com
4. System detects: same email, different auth method
5. Options:
   a. Auto-link (if email verified by both) ← Risky
   b. Prompt user to verify existing account ← Safe
   c. Create separate account ← Confusing

Best practice:
- Require verification of existing account before linking
- Never auto-link without email verification from BOTH sides
- Allow users to unlink accounts
\`\`\`

### JIT (Just-In-Time) Provisioning

\`\`\`java
// Auto-create user on first SSO login
public UserDetails loadUserBySamlAssertion(SamlAssertion assertion) {
    String email = assertion.getAttribute("email");
    String name = assertion.getAttribute("name");
    String department = assertion.getAttribute("department");

    User user = userRepository.findByEmail(email)
        .orElseGet(() -> {
            // JIT provisioning: create user on first login
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setDepartment(department);
            newUser.setRoles(mapRolesFromAssertion(assertion));
            return userRepository.save(newUser);
        });

    // Update attributes on every login (sync from IdP)
    user.setName(name);
    user.setDepartment(department);
    user.setLastLogin(Instant.now());
    userRepository.save(user);

    return user;
}
\`\`\`

> ⚠️ Luu y: Multi-tenant systems phai dam bao COMPLETE data isolation giua tenants. Mot loi nho co the expose data cua tenant nay cho tenant khac - day la security incident nghiem trong nhat.
    `
  },
  {
    id: 14,
    title: 'Zero Trust Architecture',
    desc: 'Never trust always verify, mTLS, service mesh, BeyondCorp model',
    content: `
## Zero Trust Architecture

Zero Trust la mo hinh bao mat hien dai: "Never trust, always verify". Moi request phai duoc authenticated va authorized, bat ke source.

### Zero Trust Principles

\`\`\`mermaid
graph TD
    subgraph "Traditional (Castle & Moat)"
        FW[Firewall] --> INT[Internal Network<br/>TRUSTED]
        EXT[External] --> FW
    end
    subgraph "Zero Trust"
        R1[Request] --> PEP[Policy Enforcement Point]
        PEP --> PDP[Policy Decision Point]
        PDP --> PIP[Policy Information Point]
        PEP --> RS[Resource]
    end
    style INT fill:#ef4444,stroke:#dc2626,color:#fff
    style PEP fill:#3b82f6,stroke:#2563eb,color:#fff
    style PDP fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

### Core Principles

1. **Verify explicitly** - Always authenticate and authorize based on all available data
2. **Use least privilege access** - Limit access with Just-In-Time and Just-Enough-Access
3. **Assume breach** - Minimize blast radius, segment access, verify end-to-end encryption

### mTLS (Mutual TLS)

\`\`\`text
Regular TLS:
  Client verifies Server certificate
  Server does NOT verify Client

Mutual TLS:
  Client verifies Server certificate ← AND →
  Server verifies Client certificate

mTLS ensures BOTH parties are who they claim to be
\`\`\`

\`\`\`java
// Spring Boot mTLS configuration
server:
  ssl:
    enabled: true
    key-store: classpath:server-keystore.p12
    key-store-password: changeit
    key-store-type: PKCS12
    trust-store: classpath:truststore.p12
    trust-store-password: changeit
    client-auth: need  # require client certificate

// RestTemplate with client certificate
@Bean
public RestTemplate mtlsRestTemplate() throws Exception {
    SSLContext sslContext = SSLContextBuilder.create()
        .loadKeyMaterial(keyStore, keyPassword)      // Client cert
        .loadTrustMaterial(trustStore, null)          // CA certs
        .build();

    HttpClient httpClient = HttpClients.custom()
        .setSSLContext(sslContext)
        .build();

    return new RestTemplateBuilder()
        .requestFactory(() -> new HttpComponentsClientHttpRequestFactory(httpClient))
        .build();
}
\`\`\`

### Service Mesh Security (Istio)

\`\`\`yaml
# Istio: Automatic mTLS between all services
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT  # All traffic must use mTLS

---
# Authorization policy: Only allow specific service-to-service calls
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: order-service-policy
  namespace: production
spec:
  selector:
    matchLabels:
      app: order-service
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/production/sa/api-gateway"]
      to:
        - operation:
            methods: ["GET", "POST"]
            paths: ["/api/orders/*"]
    - from:
        - source:
            principals: ["cluster.local/ns/production/sa/payment-service"]
      to:
        - operation:
            methods: ["GET"]
            paths: ["/api/orders/*/status"]
\`\`\`

### BeyondCorp Model (Google)

\`\`\`text
Traditional VPN approach:
  Employee -> VPN -> Internal Network -> All Resources

BeyondCorp approach:
  Employee -> Identity-Aware Proxy -> Specific Resource

Key components:
1. Device Trust: Is this a managed, compliant device?
   - OS patched? Disk encrypted? Antivirus running?

2. User Trust: Is this the right user?
   - MFA verified? Risk score acceptable?

3. Context Trust: Is this request reasonable?
   - Usual location? Usual time? Usual behavior?

4. Access Decision: Combine all signals
   - Device trust + User trust + Context = Allow/Deny
\`\`\`

### Zero Trust Implementation

\`\`\`mermaid
graph LR
    subgraph "Identity"
        IDP[Identity Provider]
        MFA[MFA]
        RISK[Risk Engine]
    end
    subgraph "Network"
        SEG[Micro-segmentation]
        FW[Next-Gen Firewall]
        MESH[Service Mesh]
    end
    subgraph "Data"
        ENC[Encryption at rest]
        TLS[Encryption in transit]
        DLP[Data Loss Prevention]
    end
    subgraph "Endpoint"
        EDR[EDR Agent]
        COMP[Compliance Check]
        PATCH[Patch Management]
    end
    style IDP fill:#3b82f6,stroke:#2563eb,color:#fff
    style MESH fill:#22c55e,stroke:#16a34a,color:#fff
    style ENC fill:#f59e0b,stroke:#d97706,color:#fff
    style EDR fill:#e11d48,stroke:#be123c,color:#fff
\`\`\`

### Implementation Roadmap

| Phase | Actions | Timeline |
|-------|---------|----------|
| 1. Foundation | MFA everywhere, TLS, basic IAM | 0-3 months |
| 2. Visibility | Logging, monitoring, asset inventory | 3-6 months |
| 3. Micro-segmentation | Network policies, service mesh | 6-12 months |
| 4. Automation | Automated response, continuous verification | 12-18 months |
| 5. Optimization | ML-based risk scoring, adaptive policies | 18-24 months |

> ⚠️ Luu y: Zero Trust khong phai "xoa het va lam lai" - day la mot HANH TRINH. Bat dau tu nhung buoc don gian nhu MFA va mTLS, roi dan mo rong. VPN van co the la mot layer trong Zero Trust architecture.
    `
  },
  {
    id: 15,
    title: 'Production Security Best Practices',
    desc: 'Security headers, secrets management, compliance, incident response, CI/CD security',
    content: `
## Production Security Best Practices

Security trong production doi hoi approach toan dien - tu code den infrastructure, tu development den operations. Day la tong hop tat ca best practices.

### Security Headers

\`\`\`java
// Spring Security headers configuration
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.headers(headers -> headers
        .contentSecurityPolicy(csp -> csp
            .policyDirectives("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"))
        .referrerPolicy(ref -> ref
            .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
        .permissionsPolicy(perm -> perm
            .policy("camera=(), microphone=(), geolocation=()"))
        .frameOptions(frame -> frame.deny())
        .httpStrictTransportSecurity(hsts -> hsts
            .includeSubDomains(true)
            .maxAgeInSeconds(31536000))
    );
    return http.build();
}
\`\`\`

| Header | Purpose | Recommended Value |
|--------|---------|-------------------|
| Strict-Transport-Security | Force HTTPS | max-age=31536000; includeSubDomains |
| Content-Security-Policy | Prevent XSS | default-src 'self' |
| X-Content-Type-Options | Prevent MIME sniffing | nosniff |
| X-Frame-Options | Prevent clickjacking | DENY |
| Referrer-Policy | Control referrer info | strict-origin-when-cross-origin |
| Permissions-Policy | Disable browser features | camera=(), microphone=() |

### Secrets Management

\`\`\`text
NEVER store secrets in:
✗ Source code
✗ Environment variables (can leak via /proc, logs)
✗ Config files committed to git
✗ Docker images

DO store secrets in:
✓ HashiCorp Vault
✓ AWS Secrets Manager / Parameter Store
✓ Azure Key Vault
✓ GCP Secret Manager
✓ Kubernetes Secrets (encrypted at rest)
\`\`\`

\`\`\`java
// Spring Cloud Vault integration
// bootstrap.yml
spring:
  cloud:
    vault:
      uri: https://vault.example.com
      authentication: KUBERNETES
      kubernetes:
        role: my-app
        service-account-token-file: /var/run/secrets/kubernetes.io/serviceaccount/token
      kv:
        backend: secret
        default-context: my-app

// Use secrets as regular Spring properties
@Value("${database.password}")
private String dbPassword;  // Fetched from Vault at runtime
\`\`\`

### Security in CI/CD Pipeline

\`\`\`mermaid
graph LR
    CODE[Code] --> SAST[SAST<br/>Static Analysis]
    SAST --> SEC[Secret Scanning]
    SEC --> DEP[Dependency Check]
    DEP --> BUILD[Build]
    BUILD --> DAST[DAST<br/>Dynamic Testing]
    DAST --> IMG[Image Scan]
    IMG --> DEPLOY[Deploy]
    style SAST fill:#ef4444,stroke:#dc2626,color:#fff
    style SEC fill:#f59e0b,stroke:#d97706,color:#fff
    style DEP fill:#3b82f6,stroke:#2563eb,color:#fff
    style DAST fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style IMG fill:#22c55e,stroke:#16a34a,color:#fff
\`\`\`

\`\`\`yaml
# GitHub Actions security pipeline
name: Security Checks
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Secret scanning
      - name: Detect secrets
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified

      # Dependency vulnerability check
      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'my-app'
          format: 'HTML'
          args: --failOnCVSS 7

      # SAST
      - name: SonarQube Scan
        uses: sonarqube/sonarcloud-github-action@master
        env:
          SONAR_TOKEN: secrets.SONAR_TOKEN

      # Container image scan
      - name: Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'my-app:latest'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'
\`\`\`

### OWASP Top 10 Prevention Checklist

| Vulnerability | Prevention |
|--------------|------------|
| Injection | Parameterized queries, input validation |
| Broken Auth | MFA, strong passwords, session management |
| Sensitive Data Exposure | Encryption at rest/transit, minimize data |
| XML External Entities | Disable DTD, use JSON |
| Broken Access Control | RBAC, test authorization on every endpoint |
| Security Misconfiguration | Hardening, remove defaults, automate config |
| XSS | Content Security Policy, output encoding |
| Insecure Deserialization | Whitelist classes, integrity checks |
| Known Vulnerabilities | Dependency scanning, regular updates |
| Insufficient Logging | Structured logging, security event monitoring |

### Security Logging & Monitoring

\`\`\`java
// Security event logging
@Component
public class SecurityEventLogger {
    private static final Logger secLog = LoggerFactory.getLogger("SECURITY");

    public void logAuthSuccess(String userId, String method) {
        secLog.info("AUTH_SUCCESS user={} method={} ip={}",
            userId, method, getClientIp());
    }

    public void logAuthFailure(String username, String reason) {
        secLog.warn("AUTH_FAILURE username={} reason={} ip={}",
            username, reason, getClientIp());
    }

    public void logAccessDenied(String userId, String resource) {
        secLog.warn("ACCESS_DENIED user={} resource={} ip={}",
            userId, resource, getClientIp());
    }

    public void logSuspiciousActivity(String userId, String activity) {
        secLog.error("SUSPICIOUS user={} activity={} ip={}",
            userId, activity, getClientIp());
    }
}
\`\`\`

### Compliance Overview

| Standard | Focus | Key Requirements |
|----------|-------|-----------------|
| GDPR | Data privacy (EU) | Consent, right to deletion, DPO |
| SOC 2 | Service organizations | Security, availability, confidentiality |
| PCI DSS | Payment card data | Encryption, access control, monitoring |
| HIPAA | Health data (US) | PHI protection, audit trails |
| ISO 27001 | Information security | ISMS, risk management |

### Production Security Checklist

| Category | Item | Priority |
|----------|------|----------|
| **Auth** | MFA enabled for all users | Required |
| **Auth** | JWT validation (iss, aud, exp) | Required |
| **Auth** | Refresh token rotation | Required |
| **API** | Rate limiting on all endpoints | Required |
| **API** | Input validation | Required |
| **API** | CORS properly configured | Required |
| **Network** | TLS 1.2+ everywhere | Required |
| **Network** | Security headers configured | Required |
| **Network** | mTLS for service-to-service | Recommended |
| **Secrets** | No secrets in code/config | Required |
| **Secrets** | Vault/Secrets Manager | Required |
| **Secrets** | Key rotation automated | Recommended |
| **Logging** | Security events logged | Required |
| **Logging** | Centralized log aggregation | Required |
| **CI/CD** | SAST in pipeline | Required |
| **CI/CD** | Dependency scanning | Required |
| **CI/CD** | Container image scanning | Required |
| **Monitoring** | Intrusion detection alerts | Recommended |
| **Compliance** | Regular security audits | Required |
| **Compliance** | Penetration testing (yearly) | Required |

> ⚠️ Luu y: Security la PROCESS, khong phai PRODUCT. Khong co giai phap "set and forget". Phai lien tuc review, update, va improve. Mot lo hong tu dependency update co the xuat hien bat cu luc nao - automated scanning la bat buoc.
    `
  }
];
