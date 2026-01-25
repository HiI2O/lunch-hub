# Lunch Hub アーキテクチャ設計

## 概要

Lunch Hubは、社内の弁当注文を管理するWebアプリケーションです。DDDとクリーンアーキテクチャの原則に従い、保守性と拡張性の高いシステムを構築します。

## アーキテクチャ概要

### レイヤー構造

```
┌─────────────────────────────────────────────┐
│ Presentation Layer (UI/API)                │
│ - React Frontend                            │
│ - NestJS REST API Controllers               │
│ - DTOs, Guards, Middleware                  │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│ Application Layer (Use Cases)              │
│ - InviteUserUseCase                         │
│ - CreateReservationUseCase                  │
│ - PlaceOrderUseCase                         │
│ - PurchaseTicketUseCase                     │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│ Domain Layer                                │
│ Aggregates:                                 │
│ - User (IAM + Profile)                      │
│ - Reservation                               │
│ - Order                                     │
│ - Ticket                                    │
│ - Guest                                     │
│ - Session                                   │
│                                             │
│ Domain Services, Events, Value Objects      │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│ Infrastructure Layer                        │
│ - PostgreSQL (TypeORM)                      │
│ - Redis (Session, Cache)                    │
│ - Email Service (Nodemailer/SendGrid)       │
│ - File Storage                              │
└─────────────────────────────────────────────┘
```

## 技術スタック

### Backend
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15.x
- **Cache/Session**: Redis 7.x
- **ORM**: TypeORM 0.3.x
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Email**: Nodemailer (開発) / SendGrid (本番)
- **Validation**: class-validator, class-transformer
- **Testing**: Jest, Supertest

### Frontend
- **Framework**: React 18.x
- **Language**: TypeScript 5.x
- **Build Tool**: Vite
- **State Management**: Zustand または React Context API
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **UI Components**: 検討中(Material-UI、Ant Design、または独自実装)
- **Date Handling**: date-fns
- **Testing**: Vitest, React Testing Library

### DevOps
- **Container**: Docker, Docker Compose
- **CI/CD**: 未定(GitHub Actions想定)
- **Deployment**: 未定(AWS、GCP、Azureなど)

## 境界づけられたコンテキスト (Bounded Contexts)

### 1. Identity and Access Management Context (IAM)
**責務**: ユーザー認証・認可

**集約**:
- User (認証情報 + プロフィール)
- Session

**主要ユースケース**:
- ユーザー招待
- アカウントアクティベーション
- ログイン・ログアウト
- パスワード管理

---

### 2. Reservation Management Context
**責務**: 弁当予約の管理

**集約**:
- Reservation
- Guest

**主要ユースケース**:
- 予約作成
- 予約変更
- 予約キャンセル
- ゲスト予約作成(係のみ)

---

### 3. Order Management Context
**責務**: 注文の取りまとめと発注

**集約**:
- Order

**主要ユースケース**:
- 注文集計
- 注文確定
- 注文履歴確認

---

### 4. Ticket Management Context
**責務**: チケットの購入と管理

**集約**:
- Ticket
- TicketPurchaseReservation

**主要ユースケース**:
- チケット購入予約
- チケット使用
- チケット残高確認

---

## コンテキストマッピング

```mermaid
graph TB
    IAM[IAM Context<br/>User, Session]
    Reservation[Reservation Context<br/>Reservation, Guest]
    Order[Order Context<br/>Order]
    Ticket[Ticket Context<br/>Ticket]
    
    IAM -->|UserId, Role| Reservation
    IAM -->|UserId, Role| Order
    IAM -->|UserId| Ticket
    
    Reservation -->|ReservationId| Order
    Reservation -->|TicketId| Ticket
    
    style IAM fill:#e1f5ff
    style Reservation fill:#fff4e1
    style Order fill:#f0e1ff
    style Ticket fill:#e1ffe1
```

**統合パターン**:
- **Shared Kernel**: UserId, Role, DisplayName, EmailAddress
- **Customer-Supplier**: IAM → 他のコンテキスト(UserIdを提供)
- **Partnership**: Reservation ↔ Ticket(チケット払いの予約)

## ディレクトリ構造

```
lunch-hub/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── iam/                          # IAM Context
│   │   │   │   ├── domain/
│   │   │   │   │   ├── aggregates/
│   │   │   │   │   │   ├── user/
│   │   │   │   │   │   │   ├── user.aggregate.ts
│   │   │   │   │   │   │   ├── user-id.vo.ts
│   │   │   │   │   │   │   ├── email.vo.ts
│   │   │   │   │   │   │   ├── display-name.vo.ts
│   │   │   │   │   │   │   ├── password.vo.ts
│   │   │   │   │   │   │   ├── role.enum.ts
│   │   │   │   │   │   │   ├── user-status.enum.ts
│   │   │   │   │   │   │   └── invitation-token.vo.ts
│   │   │   │   │   │   └── session/
│   │   │   │   │   │       ├── session.aggregate.ts
│   │   │   │   │   │       ├── access-token.vo.ts
│   │   │   │   │   │       └── refresh-token.vo.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── authentication.service.ts
│   │   │   │   │   │   └── invitation.service.ts
│   │   │   │   │   ├── events/
│   │   │   │   │   │   ├── user-invited.event.ts
│   │   │   │   │   │   ├── user-activated.event.ts
│   │   │   │   │   │   └── password-changed.event.ts
│   │   │   │   │   └── repositories/
│   │   │   │   │       ├── user.repository.interface.ts
│   │   │   │   │       └── session.repository.interface.ts
│   │   │   │   ├── application/
│   │   │   │   │   └── use-cases/
│   │   │   │   │       ├── invite-user/
│   │   │   │   │       ├── activate-user/
│   │   │   │   │       ├── login/
│   │   │   │   │       └── change-password/
│   │   │   │   ├── infrastructure/
│   │   │   │   │   ├── persistence/
│   │   │   │   │   │   ├── typeorm/
│   │   │   │   │   │   │   ├── entities/
│   │   │   │   │   │   │   ├── repositories/
│   │   │   │   │   │   │   └── mappers/
│   │   │   │   │   │   └── redis/
│   │   │   │   │   ├── email/
│   │   │   │   │   └── jwt/
│   │   │   │   └── presentation/
│   │   │   │       ├── controllers/
│   │   │   │       ├── guards/
│   │   │   │       ├── decorators/
│   │   │   │       └── dto/
│   │   │   │
│   │   │   ├── reservation/                  # Reservation Context
│   │   │   │   ├── domain/
│   │   │   │   │   ├── aggregates/
│   │   │   │   │   │   ├── reservation/
│   │   │   │   │   │   │   ├── reservation.aggregate.ts
│   │   │   │   │   │   │   ├── payment-method.enum.ts
│   │   │   │   │   │   │   ├── reservation-status.enum.ts
│   │   │   │   │   │   │   └── reservation-period.vo.ts
│   │   │   │   │   │   └── guest/
│   │   │   │   │   │       └── guest.aggregate.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── reservation-deadline.service.ts
│   │   │   │   │   └── repositories/
│   │   │   │   │       ├── reservation.repository.interface.ts
│   │   │   │   │       └── guest.repository.interface.ts
│   │   │   │   ├── application/
│   │   │   │   │   └── use-cases/
│   │   │   │   │       ├── create-reservation/
│   │   │   │   │       ├── cancel-reservation/
│   │   │   │   │       └── create-guest-reservation/
│   │   │   │   ├── infrastructure/
│   │   │   │   └── presentation/
│   │   │   │
│   │   │   ├── order/                        # Order Context
│   │   │   │   ├── domain/
│   │   │   │   │   ├── aggregates/
│   │   │   │   │   │   └── order/
│   │   │   │   │   │       ├── order.aggregate.ts
│   │   │   │   │   │       ├── order-status.enum.ts
│   │   │   │   │   │       └── deadline-time.vo.ts
│   │   │   │   │   ├── services/
│   │   │   │   │   │   └── order-aggregation.service.ts
│   │   │   │   │   └── repositories/
│   │   │   │   │       └── order.repository.interface.ts
│   │   │   │   ├── application/
│   │   │   │   │   └── use-cases/
│   │   │   │   │       ├── aggregate-orders/
│   │   │   │   │       └── place-order/
│   │   │   │   ├── infrastructure/
│   │   │   │   └── presentation/
│   │   │   │
│   │   │   └── ticket/                       # Ticket Context
│   │   │       ├── domain/
│   │   │       │   ├── aggregates/
│   │   │       │   │   └── ticket/
│   │   │       │   │       ├── ticket.aggregate.ts
│   │   │       │   │       ├── ticket-purchase-reservation.entity.ts
│   │   │       │   │       ├── ticket-status.enum.ts
│   │   │       │   │       ├── ticket-count.vo.ts
│   │   │       │   │       └── ticket-set-quantity.vo.ts
│   │   │       │   ├── services/
│   │   │       │   │   └── ticket-usage.service.ts
│   │   │       │   └── repositories/
│   │   │       │       └── ticket.repository.interface.ts
│   │   │       ├── application/
│   │   │       │   └── use-cases/
│   │   │       │       ├── purchase-ticket/
│   │   │       │       └── use-ticket/
│   │   │       ├── infrastructure/
│   │   │       └── presentation/
│   │   │
│   │   ├── shared/                           # 共有カーネル
│   │   │   ├── domain/
│   │   │   │   ├── value-objects/
│   │   │   │   │   ├── user-id.vo.ts
│   │   │   │   │   ├── email.vo.ts
│   │   │   │   │   └── display-name.vo.ts
│   │   │   │   ├── base-aggregate.ts
│   │   │   │   ├── base-entity.ts
│   │   │   │   └── domain-event.ts
│   │   │   ├── application/
│   │   │   │   └── base-use-case.ts
│   │   │   └── infrastructure/
│   │   │       └── event-bus/
│   │   │
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   │
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   ├── redis.config.ts
│   │   │   └── jwt.config.ts
│   │   │
│   │   ├── app.module.ts
│   │   └── main.ts
│   │
│   ├── test/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── docker-compose.yml
│
└── frontend/
    ├── src/
    │   ├── features/
    │   │   ├── auth/
    │   │   │   ├── components/
    │   │   │   ├── pages/
    │   │   │   ├── hooks/
    │   │   │   └── services/
    │   │   ├── reservation/
    │   │   │   ├── components/
    │   │   │   ├── pages/
    │   │   │   └── services/
    │   │   ├── order/
    │   │   └── ticket/
    │   ├── shared/
    │   │   ├── components/
    │   │   ├── contexts/
    │   │   ├── guards/
    │   │   ├── hooks/
    │   │   └── utils/
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

## データベース設計

### PostgreSQL スキーマ

#### users テーブル
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL, -- GENERAL_USER, STAFF, ADMINISTRATOR
  status VARCHAR(50) NOT NULL, -- INVITED, ACTIVE, DEACTIVATED
  
  -- 招待情報
  invitation_token VARCHAR(255) UNIQUE,
  invitation_token_expires_at TIMESTAMP,
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP,
  activated_at TIMESTAMP,
  
  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP,
  
  CONSTRAINT chk_status CHECK (status IN ('INVITED', 'ACTIVE', 'DEACTIVATED')),
  CONSTRAINT chk_role CHECK (role IN ('GENERAL_USER', 'STAFF', 'ADMINISTRATOR'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_invitation_token ON users(invitation_token);
```

#### reservations テーブル
```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  guest_id UUID REFERENCES guests(id),
  reservation_date DATE NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- CASH, TICKET
  status VARCHAR(50) NOT NULL, -- CONFIRMED, CANCELLED, FINALIZED
  ticket_id UUID REFERENCES tickets(id),
  order_id UUID REFERENCES orders(id),
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  
  CONSTRAINT chk_payment_method CHECK (payment_method IN ('CASH', 'TICKET')),
  CONSTRAINT chk_status CHECK (status IN ('CONFIRMED', 'CANCELLED', 'FINALIZED')),
  CONSTRAINT chk_ticket_payment CHECK (
    (payment_method = 'TICKET' AND ticket_id IS NOT NULL) OR
    (payment_method = 'CASH' AND ticket_id IS NULL)
  )
);

CREATE INDEX idx_reservations_user_id ON reservations(user_id);
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_order_id ON reservations(order_id);
```

#### orders テーブル
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_date DATE NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL, -- PENDING, PLACED
  total_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  placed_at TIMESTAMP,
  
  CONSTRAINT chk_status CHECK (status IN ('PENDING', 'PLACED'))
);

CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status);
```

#### tickets テーブル
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  remaining_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL, -- PENDING, RECEIVED
  purchase_date DATE NOT NULL,
  purchase_reservation_id UUID REFERENCES ticket_purchase_reservations(id),
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  
  CONSTRAINT chk_status CHECK (status IN ('PENDING', 'RECEIVED')),
  CONSTRAINT chk_remaining_count CHECK (remaining_count >= 0)
);

CREATE INDEX idx_tickets_owner_id ON tickets(owner_id);
CREATE INDEX idx_tickets_status ON tickets(status);
```

#### ticket_purchase_reservations テーブル
```sql
CREATE TABLE ticket_purchase_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  purchase_date DATE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1, -- セット数
  status VARCHAR(50) NOT NULL, -- PENDING, RECEIVED, CANCELLED
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  
  CONSTRAINT chk_status CHECK (status IN ('PENDING', 'RECEIVED', 'CANCELLED')),
  CONSTRAINT chk_quantity CHECK (quantity > 0)
);

CREATE INDEX idx_ticket_purchases_user_id ON ticket_purchase_reservations(user_id);
CREATE INDEX idx_ticket_purchases_date ON ticket_purchase_reservations(purchase_date);
```

#### guests テーブル
```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name VARCHAR(255) NOT NULL,
  created_by_staff_id UUID NOT NULL REFERENCES users(id),
  visit_date DATE NOT NULL,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guests_visit_date ON guests(visit_date);
CREATE INDEX idx_guests_staff_id ON guests(created_by_staff_id);
```

#### password_reset_tokens テーブル
```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
```

### Redis データ構造

```
# セッション
session:{sessionId} = {
  userId: string,
  refreshToken: string,
  createdAt: timestamp,
  lastAccessedAt: timestamp
}
TTL: 7 days

# リフレッシュトークンマッピング
refreshToken:{token} = sessionId
TTL: 7 days

# ユーザーのアクティブセッション
user:{userId}:sessions = Set<sessionId>
TTL: 7 days

# レート制限
login:attempts:{email} = count
TTL: 15 minutes

# キャッシュ(将来的に)
cache:user:{userId} = User JSON
TTL: 1 hour
```

## API設計

### 認証関連
```
POST   /api/auth/login              # ログイン
POST   /api/auth/logout             # ログアウト
POST   /api/auth/refresh            # トークン更新
POST   /api/auth/activate           # アカウントアクティベーション
POST   /api/auth/forgot-password    # パスワードリセット要求
POST   /api/auth/reset-password     # パスワードリセット
GET    /api/auth/me                 # 現在のユーザー情報
```

### ユーザー管理
```
GET    /api/users/me                # 自分のプロフィール
PUT    /api/users/me                # プロフィール更新
PUT    /api/users/me/password       # パスワード変更
```

### 管理者機能
```
POST   /api/admin/users/invite      # ユーザー招待
GET    /api/admin/users             # ユーザー一覧
PUT    /api/admin/users/:id/deactivate    # ユーザー無効化
PUT    /api/admin/users/:id/reactivate    # ユーザー再有効化
```

### 予約管理
```
GET    /api/reservations            # 予約一覧(自分の予約)
POST   /api/reservations            # 予約作成
GET    /api/reservations/:id        # 予約詳細
PUT    /api/reservations/:id        # 予約変更
DELETE /api/reservations/:id        # 予約キャンセル
GET    /api/reservations/calendar   # カレンダー表示用
```

### 係専用 - 予約管理
```
GET    /api/staff/reservations      # 全予約一覧
POST   /api/staff/guests            # ゲスト作成
POST   /api/staff/reservations/guest # ゲスト予約作成
```

### 注文管理(係・管理者)
```
GET    /api/orders                  # 注文一覧
GET    /api/orders/:date            # 特定日の注文詳細
POST   /api/orders/:date/place      # 注文確定
```

### チケット管理
```
GET    /api/tickets                 # 自分のチケット一覧
POST   /api/tickets/purchase        # チケット購入予約
GET    /api/tickets/:id             # チケット詳細
PUT    /api/tickets/:id/receive     # チケット受取確認(係)
DELETE /api/tickets/purchases/:id   # チケット購入予約キャンセル
```

## セキュリティ設計

### 認証フロー
```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant AuthService
    participant DB
    participant Redis

    User->>Frontend: ログイン(email, password)
    Frontend->>API: POST /api/auth/login
    API->>AuthService: authenticate(email, password)
    AuthService->>DB: findUserByEmail(email)
    DB-->>AuthService: User
    AuthService->>AuthService: verifyPassword(password)
    AuthService->>Redis: createSession(userId)
    Redis-->>AuthService: sessionId
    AuthService->>AuthService: generateTokens(userId, role)
    AuthService-->>API: accessToken, refreshToken
    API-->>Frontend: Set-Cookie: refreshToken (HTTP-only)
    API-->>Frontend: { accessToken, user }
    Frontend->>Frontend: Store accessToken in memory
```

### 認可フロー
```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant AuthGuard
    participant RolesGuard
    participant Controller

    User->>Frontend: リクエスト(with accessToken)
    Frontend->>API: GET /api/staff/reservations
    API->>AuthGuard: validate JWT
    AuthGuard->>AuthGuard: verify token signature
    AuthGuard->>AuthGuard: check expiration
    AuthGuard->>RolesGuard: check required roles
    RolesGuard->>RolesGuard: user.role in [STAFF, ADMIN]?
    RolesGuard-->>Controller: authorized
    Controller-->>Frontend: reservations data
```

### セキュリティ対策

1. **パスワード**
   - bcrypt (cost factor: 12)
   - 最低8文字、英数字記号を含む

2. **JWT**
   - アクセストークン: 15分
   - リフレッシュトークン: 7日
   - HTTP-only cookie

3. **レート制限とロックアウト**
   - ログイン試行: 10回/15分
   - ロックアウト挙動: 10回失敗後、15分間は429 (Too Many Requests) を返し、すべてのリクエストを拒否する。自動解除のみとする。
   - API全般: 100回/分

4. **セッションタイムアウト UX**
   - アクセストークン(15m)が切れた際、フロントエンド（Axios Interceptor）でリフレッシュトークンを用いてサイレントリフレッシュを行う。
   - リフレッシュトークンも期限切れの場合は、強制ログアウトし、ログイン画面へ遷移する。

4. **CORS**
   - フロントエンドのオリジンのみ許可

5. **CSRF対策**
   - SameSite cookie
   - CSRFトークン

6. **その他**
   - Helmet.js (セキュリティヘッダー)
   - 入力バリデーション
   - SQLインジェクション対策(TypeORM)
   - XSS対策(サニタイゼーション)

## システムの想定規模
- **想定ユーザー数**: 最大50名程度
- **同時接続数**: 10名程度
- **1日の予約数**: 30〜40件程度
- **データサイズ**: 数年間運用しても数GB以内に収まる想定

```env
# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=lunch_hub
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lunch_hub

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-access-secret-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@lunch-hub.com

# Initial Admin
INITIAL_ADMIN_EMAIL=admin@yourcompany.com
INITIAL_ADMIN_PASSWORD=ChangeMe123!
INITIAL_ADMIN_NAME=システム管理者

# Security
BCRYPT_ROUNDS=12
INVITATION_TOKEN_EXPIRY_HOURS=48
PASSWORD_RESET_TOKEN_EXPIRY_HOURS=1
COMPANY_PIN=LunchHub2024 # 社員共有用のPINコード
```

## デプロイメント構成

### 開発環境 (Docker Compose)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: lunch_hub
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/lunch_hub
      - REDIS_URL=redis://redis:6379

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 本番環境(未定)
- クラウドプロバイダー選定後に詳細化
- コンテナオーケストレーション(Kubernetes、ECS等)検討
- マネージドサービス活用(RDS、ElastiCache等)

## テスト戦略

### 単体テスト
- ドメインロジック(集約、値オブジェクト)
- ユースケース
- ドメインサービス

### 統合テスト
- リポジトリ(DB接続)
- APIエンドポイント
- 認証フロー

### E2Eテスト
- 主要なユーザーフロー
- ブラウザテスト

## パフォーマンス考慮事項

1. **データベース**
   - 適切なインデックス
   - N+1問題の回避
   - コネクションプーリング

2. **キャッシュ**
   - Redisでセッション管理
   - 頻繁にアクセスされるデータのキャッシュ

3. **API**
   - ページネーション
   - レスポンスの最適化

4. **フロントエンド**
   - コード分割
   - 遅延ローディング
   - 最適化されたバンドル

## 今後の拡張

### Phase 2
- 通知機能(メール、プッシュ通知)
- レポート機能(注文統計、利用状況)
- 二要素認証(2FA)

### Phase 3
- モバイルアプリ
- 外部システム連携
- 高度な分析機能
