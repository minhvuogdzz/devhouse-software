# Part I — Mermaid Diagrams (§43)

[← Index](README.md)

GitLab renders these diagrams natively in Markdown.

## 43. Mermaid Diagrams

### 43.1 High-level system architecture

```mermaid
flowchart TB
  V["Visitors and crawlers"]
  A["Admin users"]

  subgraph VPS["VPS - Docker Compose - internal network"]
    EDGE["edge - Nginx<br/>TLS, host routing, micro-cache, rate limits"]
    WEB["web - Node SSR<br/>React Router + Vite build"]
    ADMIN["admin - Nginx static<br/>React SPA"]
    API["api - Express<br/>REST /api/v1"]
  end

  ATLAS[("MongoDB Atlas")]
  CLD["Cloudinary<br/>storage, transforms, CDN"]
  SMTP["SMTP provider"]
  OBS["Error tracker and uptime monitor"]

  V -->|"https www"| EDGE
  A -->|"https admin"| EDGE
  EDGE -->|"www: pages"| WEB
  EDGE -->|"www: public /api/v1"| API
  EDGE -->|"admin: app shell"| ADMIN
  EDGE -->|"admin: /api/v1 incl. auth and admin"| API
  WEB -->|"loaders, internal HTTP"| API
  API --> ATLAS
  API -->|"sign, verify, delete"| CLD
  API --> SMTP
  A -.->|"signed direct upload"| CLD
  V -.->|"images f_auto q_auto"| CLD
  API -.-> OBS
  WEB -.-> OBS
```

### 43.2 Frontend architecture

```mermaid
flowchart LR
  subgraph WEBAPP["apps/web - server-rendered, hydrated"]
    WR["Route modules<br/>loader, meta, error boundary"]
    WT["Page templates"]
    WS["Sections and UI components"]
    WQ["Query option factories<br/>TanStack Query"]
    WC["API client<br/>isomorphic fetch wrapper"]
    WR --> WT --> WS
    WR --> WQ
    WT --> WQ
    WQ --> WC
  end

  subgraph ADMINAPP["apps/admin - SPA"]
    AG["Router, AuthGuard, PermissionGuard"]
    AF["Feature modules<br/>pages, forms, tables"]
    AB["Shared building blocks<br/>DataTable, ResourceForm, MediaPicker"]
    AQ["Queries and mutations<br/>TanStack Query"]
    AC["API client"]
    AG --> AF --> AB
    AF --> AQ --> AC
  end

  subgraph PKG["packages"]
    SH["shared<br/>Zod schemas, permissions, error codes"]
    CT["content<br/>definitions, defaults, resolver"]
    CF["config<br/>lint, Tailwind theme"]
  end

  API["REST API /api/v1"]

  WC --> API
  AC --> API
  WR -.->|"fallback defaults"| CT
  AF -.->|"section forms"| CT
  WQ -.-> SH
  AQ -.-> SH
  WS -.-> CF
  AB -.-> CF
```

### 43.3 Backend request flow

```mermaid
flowchart TD
  REQ["HTTP request"] --> GM["Global middleware<br/>request id, logger, helmet, body limits, origin check, rate limit"]
  GM --> RT["Router<br/>module routes"]
  RT --> AUTHN{"Admin or auth route?"}
  AUTHN -->|"yes"| AN["authenticate<br/>session cookie to req.auth"]
  AN --> AZ["authorize<br/>requirePermission"]
  AUTHN -->|"no"| VAL
  AZ --> VAL["validate<br/>Zod: params, query, body"]
  VAL --> CTRL["Controller<br/>HTTP in, HTTP out"]
  CTRL --> SVC["Service<br/>business rules, orchestration"]
  SVC --> REPO["Repository<br/>queries, scopes, pagination"]
  REPO --> MODEL["Mongoose model"]
  MODEL --> DB[("MongoDB Atlas")]
  SVC --> AUD["Audit log"]
  SVC --> CACHE["Cache invalidate"]
  SVC --> INT["Integrations<br/>Cloudinary, mail"]
  CTRL --> DTO["DTO mapper"]
  DTO --> RES["Response envelope<br/>success, data, meta"]

  AN -.->|"401"| ERR
  AZ -.->|"403"| ERR
  VAL -.->|"422"| ERR
  SVC -.->|"404 or 409"| ERR
  REPO -.->|"database error"| ERR
  ERR["Error middleware<br/>maps to error envelope, logs with request id"]
```

### 43.4 Database architecture

```mermaid
erDiagram
  USERS }o--o{ ROLES : "assigned"
  USERS ||--o{ SESSIONS : "owns"
  USERS ||--o{ AUTH_TOKENS : "owns"
  USERS |o--o| AUTHORS : "optional link"
  USERS ||--o{ AUDIT_LOGS : "actor snapshot"

  CATEGORIES ||--o{ SERVICES : "type service"
  CATEGORIES ||--o{ PROJECTS : "type project"
  CATEGORIES ||--o{ TECHNOLOGIES : "type technology"
  CATEGORIES ||--o{ BLOG_POSTS : "type post"

  SERVICES }o--o{ TECHNOLOGIES : "uses"
  SOLUTIONS }o--o{ SERVICES : "combines"
  SOLUTIONS }o--o{ TECHNOLOGIES : "uses"
  PROJECTS }o--o{ SERVICES : "delivered via"
  PROJECTS }o--o{ TECHNOLOGIES : "built with"

  AUTHORS ||--o{ BLOG_POSTS : "writes"
  BLOG_POSTS }o--o{ TAGS : "tagged"

  SERVICES |o--o{ CONTACT_REQUESTS : "enquiry about"
  USERS |o--o{ CONTACT_REQUESTS : "assigned to"

  MEDIA ||--o{ SERVICES : "ImageRef snapshot"
  MEDIA ||--o{ PROJECTS : "ImageRef snapshot"
  MEDIA ||--o{ BLOG_POSTS : "ImageRef snapshot"
  MEDIA ||--o{ TECHNOLOGIES : "ImageRef snapshot"
  MEDIA ||--o{ PAGES : "ImageRef snapshot"

  USERS {
    string email UK
    string passwordHash
    objectId[] roles FK
    string status
  }
  ROLES {
    string key UK
    string[] permissions
    boolean isSystem
  }
  SESSIONS {
    string tokenHash UK
    objectId user FK
    date expiresAt
  }
  CATEGORIES {
    string type
    string slug
    number sortOrder
  }
  SERVICES {
    string slug UK
    string status
    objectId[] technologies FK
    object seo
  }
  SOLUTIONS {
    string slug UK
    string status
    objectId[] services FK
  }
  PROJECTS {
    string slug UK
    string status
    date publishedAt
    objectId[] services FK
    objectId[] technologies FK
  }
  TECHNOLOGIES {
    string slug UK
    objectId category FK
    boolean isFeatured
  }
  BLOG_POSTS {
    string slug UK
    string status
    date publishedAt
    objectId author FK
    objectId[] tags FK
  }
  AUTHORS {
    string slug UK
    objectId user FK
  }
  TAGS {
    string slug UK
  }
  MEDIA {
    string publicId UK
    string resourceType
    number version
  }
  PAGES {
    string key UK
    object sections
  }
  SITE_SETTINGS {
    string key UK
    object data
  }
  NAVIGATION_MENUS {
    string key UK
    object[] items
  }
  CONTACT_REQUESTS {
    string email
    string status
    objectId service FK
  }
  REDIRECTS {
    string from UK
    string to
  }
  AUDIT_LOGS {
    string action
    object actor
    object resource
  }
  AUTH_TOKENS {
    string tokenHash UK
    string type
    date expiresAt
  }
```

### 43.5 Content resolution architecture

```mermaid
flowchart TD
  subgraph CODE["Code - @devhouse/content"]
    DEF["Section definitions<br/>fields + defaults"]
    CAT["Default catalog<br/>services, technologies, categories"]
    RES["resolveContent()"]
  end

  subgraph DBS["MongoDB Atlas"]
    OVR["Sparse overrides<br/>pages, site_settings, navigation_menus"]
    COL["Collections<br/>services, projects, posts, ..."]
  end

  ADMIN["Admin edits"] -->|"validated against definitions"| OVR
  ADMIN --> COL
  CAT -->|"idempotent seed on deploy"| COL

  DEF --> RES
  OVR --> RES
  RES --> RESOLVED["Resolved content"]
  RESOLVED --> APICACHE["API cache<br/>invalidated on write"]
  APICACHE --> APIRESP["GET /site and /pages/:key"]
  COL --> LIST["GET /services, /projects, ..."]
  CAT -.->|"only if collection never populated"| LIST

  APIRESP --> WEB["web loader"]
  LIST --> WEB
  DEF -.->|"API unreachable: local defaults"| WEB
  WEB --> PAGE["Rendered page<br/>never blank"]
```

### 43.6 Admin architecture

```mermaid
flowchart TB
  BROWSER["Admin browser<br/>admin.devhouse.example"] --> SHELL

  subgraph SPA["apps/admin"]
    SHELL["App shell<br/>providers, router"]
    AUTHG["AuthGuard<br/>GET /auth/me"]
    PERMG["PermissionGuard<br/>per route"]
    NAV["Sidebar<br/>built from module nav.js, filtered by permission"]

    subgraph MODS["Feature modules"]
      M1["Pages, Settings, Navigation"]
      M2["Services, Solutions, Projects, Technologies, Categories"]
      M3["Blog posts, Tags, Authors"]
      M4["Media"]
      M5["Contact requests"]
      M6["Users, Roles, Audit logs, Dashboard"]
    end

    BLOCKS["Shared building blocks<br/>DataTable, ResourceForm, SectionForm, MediaPicker, RichTextEditor"]
    QUERY["TanStack Query<br/>queries, mutations, invalidation"]
  end

  SHELL --> AUTHG --> PERMG --> MODS
  SHELL --> NAV
  MODS --> BLOCKS
  MODS --> QUERY
  QUERY -->|"same-origin /api/v1, session cookie"| API

  subgraph BACKEND["api"]
    API["authenticate, requirePermission, validate"]
    SVC["Module services"]
    AUDIT["Audit log"]
  end

  API --> SVC --> DB[("MongoDB Atlas")]
  SVC --> AUDIT
  M4 -.->|"signed direct upload"| CLD["Cloudinary"]
  SVC -->|"sign, verify, delete"| CLD
```

### 43.7 Cloudinary upload architecture

```mermaid
sequenceDiagram
  autonumber
  participant B as Admin browser
  participant API as API
  participant C as Cloudinary
  participant DB as MongoDB Atlas
  participant V as Visitor browser

  B->>API: POST /admin/media/signature (folder, resourceType)
  Note over API: Checks session and media:upload<br/>Chooses public_id, folder, allowed formats<br/>Signs with CLOUDINARY_API_SECRET
  API-->>B: cloudName, apiKey, timestamp, signature, params
  B->>C: POST upload (file + signed params)
  Note over C: Rejects if any signed param was altered
  C-->>B: public_id, version, signature, width, height, bytes, format
  B->>API: POST /admin/media (upload result, alt, title)
  API->>C: Verify asset (response signature or resource lookup)
  C-->>API: Authoritative metadata
  API->>DB: Insert media document
  API->>DB: Insert audit log
  API-->>B: 201 Media
  Note over B,DB: Content forms then send mediaId only.<br/>API writes the ImageRef snapshot into content.

  V->>C: GET image via CDN (f_auto, q_auto, width from srcset)
  C-->>V: AVIF or WebP at requested size
```

### 43.8 Authentication flow

```mermaid
sequenceDiagram
  autonumber
  participant B as Admin browser
  participant E as Nginx edge
  participant API as API
  participant DB as MongoDB Atlas

  B->>E: POST /api/v1/auth/login (email, password)
  E->>API: Forward (rate limited)
  API->>DB: Find user by email
  alt Account locked or disabled
    API-->>B: 423 ACCOUNT_LOCKED or 403 ACCOUNT_DISABLED
  else Password invalid
    API->>DB: Increment failedLoginCount, set lockUntil if needed
    API->>DB: Insert audit log (auth.login.failure)
    API-->>B: 401 INVALID_CREDENTIALS
  else Password valid
    Note over API: Generate random 256-bit token<br/>Store only SHA-256 of it
    API->>DB: Insert session (tokenHash, expiresAt)
    API->>DB: Reset counters, insert audit log (auth.login.success)
    API-->>B: 200 user + permissions<br/>Set-Cookie __Host-dh_sid (HttpOnly, Secure, SameSite=Strict)
  end

  B->>E: PATCH /api/v1/admin/services/:id (cookie sent automatically)
  E->>API: Forward
  Note over API: Origin check<br/>Hash cookie token, look up session (30 s cache)<br/>Load permissions, check services:update
  alt Session missing or expired
    API-->>B: 401 SESSION_EXPIRED
    Note over B: SPA redirects to /login
  else Permission missing
    API-->>B: 403 FORBIDDEN
  else Allowed
    API->>DB: Update service, insert audit log
    API-->>B: 200 updated service
  end

  B->>E: POST /api/v1/auth/logout
  E->>API: Forward
  API->>DB: Delete session
  API-->>B: 204 and cleared cookie
```

### 43.9 Production deployment

```mermaid
flowchart TB
  NET["Internet"] --> DNS["DNS<br/>optional CDN or WAF"]
  DNS --> FW["Host firewall<br/>22, 80, 443"]

  subgraph HOST["Production VPS - Ubuntu LTS + Docker Engine"]
    FW --> EDGE["edge - Nginx<br/>ports 80 and 443<br/>TLS, cache, rate limit"]
    subgraph NETINT["Internal Docker network - no published ports"]
      WEB["web<br/>Node SSR :3000"]
      ADMIN["admin<br/>Nginx static :8080"]
      API["api<br/>Express :4000"]
    end
    EDGE --> WEB
    EDGE --> ADMIN
    EDGE --> API
    WEB --> API
    ENV["Env files 0600<br/>/opt/devhouse/env"]
    CERT["Certbot<br/>certificates volume"]
    ENV -.-> API
    ENV -.-> WEB
    CERT -.-> EDGE
  end

  API -->|"TLS, IP allow-list"| ATLAS[("MongoDB Atlas<br/>backups enabled")]
  API --> CLD["Cloudinary"]
  API --> SMTP["SMTP provider"]
  REG["GitLab Container Registry"] -->|"pull by SHA tag"| HOST
  CI["GitLab CI deploy job"] -->|"SSH forced command: deploy.sh TAG"| HOST
  MON["External uptime monitor"] -.->|"probe home page and /api/v1/health"| EDGE
```

### 43.10 GitLab CI/CD pipeline

```mermaid
flowchart LR
  DEV["Developer"] --> BR["feature or fix branch"]
  BR --> MR["Merge Request"]

  subgraph MRP["MR pipeline"]
    I1["install"] --> L1["lint, format, type check"]
    I1 --> T1["unit, integration, component tests"]
    I1 --> B1["build web and admin"]
    I1 --> S1["secret detection, dependency audit"]
  end

  MR --> MRP
  MRP --> REV{"Green and approved?"}
  REV -->|"no"| BR
  REV -->|"yes"| MAIN["merge to main"]

  subgraph MAINP["main pipeline"]
    V2["verify and test"] --> PKG["docker build<br/>tag = commit SHA"]
    PKG --> PUSH["push to Container Registry"]
    PUSH --> SCAN["image scan"]
    SCAN --> DS["deploy staging<br/>automatic"]
    DS --> HS{"health gate"}
    HS -->|"pass"| E2E["E2E smoke"]
    HS -->|"fail"| RBS["rollback staging"]
  end

  MAIN --> MAINP
  E2E --> TAG["release tag vX.Y.Z<br/>Maintainer"]

  subgraph PRODP["release pipeline"]
    CHK["verify SHA images exist"] --> APPR["manual approval<br/>protected environment"]
    APPR --> DP["deploy production<br/>same images"]
    DP --> HP{"health gate"}
    HP -->|"pass"| OK["live, tag images, notify"]
    HP -->|"fail"| RBP["automatic rollback<br/>to previous tag"]
  end

  TAG --> PRODP
```
