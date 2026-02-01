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

5. **CORS**
   - フロントエンドのオリジンのみ許可

6. **CSRF対策**
   - SameSite cookie
   - CSRFトークン

7. **その他**
   - Helmet.js (セキュリティヘッダー)
   - 入力バリデーション
   - SQLインジェクション対策(TypeORM)
   - XSS対策(サニタイゼーション)

## 環境変数

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

## システムの想定規模
- **想定ユーザー数**: 最大50名程度
- **同時接続数**: 10名程度
- **1日の予約数**: 30〜40件程度
- **データサイズ**: 数年間運用しても数GB以内に収まる想定

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

## 関連ドキュメント

- [API設計](../03-api-design.md) - 全APIエンドポイントの詳細
- [データベース設計](../04-database-design.md) - PostgreSQLスキーマとRedisデータ構造
- [ドメインモデル](./domain-model.md) - 集約と値オブジェクトの定義
- [IAMモジュール設計](./modules/iam-module.md) - 認証機能の詳細設計

## 今後の拡張

### Phase 2
- 通知機能(メール、プッシュ通知)
- レポート機能(注文統計、利用状況)
- 二要素認証(2FA)

### Phase 3
- モバイルアプリ
- 外部システム連携
- 高度な分析機能

---

**更新履歴:**
- 2025-11-30: 初版作成
- 2026-02-01: ドキュメント再編成（API設計・DB設計を別ファイルに分離）
