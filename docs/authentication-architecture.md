# 認証機能 アーキテクチャ設計

## アーキテクチャ概要

認証機能はクリーンアーキテクチャとDDDの原則に従い、以下のレイヤー構造で実装する。

```
┌─────────────────────────────────────────────┐
│ Presentation Layer (API/Controllers)       │
│ - REST API endpoints                        │
│ - Request/Response DTOs                     │
│ - Authentication middleware                 │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│ Application Layer (Use Cases)              │
│ - InviteUserUseCase                         │
│ - LoginUseCase                              │
│ - ChangePasswordUseCase                     │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│ Domain Layer                                │
│ - User aggregate                            │
│ - Session aggregate                         │
│ - Domain services                           │
│ - Domain events                             │
└────────────────┬────────────────────────────┘
                 │
┌────────────────▼────────────────────────────┐
│ Infrastructure Layer                        │
│ - UserRepository (TypeORM)                  │
│ - SessionRepository (Redis)                 │
│ - Email service (Nodemailer/SendGrid)       │
│ - JWT service                               │
└─────────────────────────────────────────────┘
```

## 技術スタック

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL (ユーザー情報)
- **Cache/Session**: Redis (セッション、レート制限)
- **ORM**: TypeORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Email**: Nodemailer または SendGrid
- **Validation**: class-validator, class-transformer

### Frontend
- **Framework**: React
- **Language**: TypeScript
- **State Management**: React Context API または Zustand
- **HTTP Client**: Axios
- **Routing**: React Router
- **Form Handling**: React Hook Form
- **Validation**: Zod

## ディレクトリ構造

```
lunch-hub/
├── backend/
│   └── src/
│       ├── modules/
│       │   └── iam/                          # Identity and Access Management
│       │       ├── domain/
│       │       │   ├── aggregates/
│       │       │   │   ├── user/
│       │       │   │   │   ├── user.aggregate.ts
│       │       │   │   │   ├── user-id.vo.ts
│       │       │   │   │   ├── email.vo.ts
│       │       │   │   │   ├── password.vo.ts
│       │       │   │   │   ├── role.enum.ts (ADMINISTRATOR, STAFF, GENERAL_USER)
│       │       │   │   │   └── user-status.enum.ts (INVITED, ACTIVE, DEACTIVATED)
│       │       │   │   └── session/
│       │       │   │       ├── session.aggregate.ts
│       │       │   │       ├── session-id.vo.ts
│       │       │   │       ├── access-token.vo.ts
│       │       │   │       └── refresh-token.vo.ts
│       │       │   ├── services/
│       │       │   │   ├── authentication.service.ts
│       │       │   │   ├── invitation.service.ts
│       │       │   │   └── rate-limit.service.ts
│       │       │   ├── events/
│       │       │   │   ├── user-invited.event.ts
│       │       │   │   ├── user-activated.event.ts
│       │       │   │   ├── password-changed.event.ts
│       │       │   │   └── session-created.event.ts
│       │       │   └── repositories/
│       │       │       ├── user.repository.interface.ts
│       │       │       ├── session.repository.interface.ts
│       │       │       └── password-reset-token.repository.interface.ts
│       │       ├── application/
│       │       │   ├── use-cases/
│       │       │   │   ├── invite-user/
│       │       │   │   │   ├── invite-user.use-case.ts
│       │       │   │   │   ├── invite-user.dto.ts
│       │       │   │   │   └── invite-user.spec.ts
│       │       │   │   ├── activate-user/
│       │       │   │   ├── login/
│       │       │   │   ├── logout/
│       │       │   │   ├── refresh-token/
│       │       │   │   ├── change-password/
│       │       │   │   ├── request-password-reset/
│       │       │   │   └── reset-password/
│       │       │   └── dto/
│       │       │       ├── user.dto.ts
│       │       │       └── session.dto.ts
│       │       ├── infrastructure/
│       │       │   ├── persistence/
│       │       │   │   ├── typeorm/
│       │       │   │   │   ├── entities/
│       │       │   │   │   │   ├── user.entity.ts
│       │       │   │   │   │   └── password-reset-token.entity.ts
│       │       │   │   │   ├── repositories/
│       │       │   │   │   │   └── user.repository.impl.ts
│       │       │   │   │   └── mappers/
│       │       │   │   │       └── user.mapper.ts
│       │       │   │   └── redis/
│       │       │   │       ├── repositories/
│       │       │   │       │   └── session.repository.impl.ts
│       │       │   │       └── rate-limit.service.impl.ts
│       │       │   ├── email/
│       │       │   │   ├── email.service.ts
│       │       │   │   └── templates/
│       │       │   │       ├── invitation.template.ts
│       │       │   │       └── password-reset.template.ts
│       │       │   └── jwt/
│       │       │       └── jwt.service.ts
│       │       └── presentation/
│       │           ├── controllers/
│       │           │   ├── auth.controller.ts
│       │           │   ├── user.controller.ts
│       │           │   └── admin.controller.ts
│       │           ├── guards/
│       │           │   ├── jwt-auth.guard.ts
│       │           │   └── roles.guard.ts
│       │           ├── decorators/
│       │           │   ├── current-user.decorator.ts
│       │           │   └── roles.decorator.ts
│       │           └── dto/
│       │               ├── login.request.dto.ts
│       │               ├── login.response.dto.ts
│       │               ├── invite-user.request.dto.ts
│       │               └── change-password.request.dto.ts
│       └── shared/
│           └── guards/
│               └── throttler.guard.ts
└── frontend/
    └── src/
        ├── features/
        │   └── auth/
        │       ├── components/
        │       │   ├── LoginForm.tsx
        │       │   ├── ActivateAccountForm.tsx
        │       │   ├── ChangePasswordForm.tsx
        │       │   └── ForgotPasswordForm.tsx
        │       ├── hooks/
        │       │   ├── useAuth.ts
        │       │   └── useCurrentUser.ts
        │       ├── services/
        │       │   └── auth.service.ts
        │       └── types/
        │           └── auth.types.ts
        └── shared/
            ├── guards/
            │   └── AuthGuard.tsx
            └── contexts/
                └── AuthContext.tsx
```

## API設計

### エンドポイント一覧

#### 認証関連
```
POST   /api/auth/login              # ログイン
POST   /api/auth/logout             # ログアウト
POST   /api/auth/refresh            # トークン更新
POST   /api/auth/activate           # アカウントアクティベーション
POST   /api/auth/forgot-password    # パスワードリセット要求
POST   /api/auth/reset-password     # パスワードリセット
GET    /api/auth/me                 # 現在のユーザー情報取得
```

#### ユーザー管理
```
PUT    /api/users/me/password       # パスワード変更
GET    /api/users/me                # 自分のプロフィール取得
PUT    /api/users/me                # 自分のプロフィール更新
```

#### 管理者機能
```
POST   /api/admin/users/invite      # ユーザー招待
POST   /api/admin/users/:id/resend-invitation  # 招待再送信
DELETE /api/admin/users/:id/invitation         # 招待取り消し
PUT    /api/admin/users/:id/deactivate         # ユーザー無効化
PUT    /api/admin/users/:id/reactivate         # ユーザー再有効化
GET    /api/admin/users              # ユーザー一覧取得
```

### リクエスト/レスポンス例

#### ログイン
```typescript
// POST /api/auth/login
Request:
{
  "email": "user@company.com",
  "password": "SecurePassword123!"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@company.com",
    "name": "John Doe",
    "role": "EMPLOYEE"
  }
}

// リフレッシュトークンはHTTP-only cookieで返却
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

#### ユーザー招待
```typescript
// POST /api/admin/users/invite
Request:
{
  "email": "newuser@company.com",
  "role": "EMPLOYEE"
}

Response:
{
  "id": "uuid",
  "email": "newuser@company.com",
  "status": "INVITED",
  "role": "EMPLOYEE",
  "invitedAt": "2025-12-02T13:00:00Z"
}
```

#### アカウントアクティベーション
```typescript
// POST /api/auth/activate
Request:
{
  "token": "invitation-token-here",
  "password": "SecurePassword123!",
  "name": "John Doe"
}

Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "newuser@company.com",
    "name": "John Doe",
    "role": "EMPLOYEE"
  }
}
```

## データベーススキーマ

### PostgreSQL (ユーザー情報)

```sql
-- users テーブル
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL, -- ADMIN, EMPLOYEE
  status VARCHAR(50) NOT NULL, -- INVITED, ACTIVE, DEACTIVATED
  
  -- 招待情報
  invitation_token VARCHAR(255) UNIQUE,
  invitation_token_expires_at TIMESTAMP,
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP,
  
  -- アクティベーション情報
  activated_at TIMESTAMP,
  
  -- タイムスタンプ
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- パスワードリセットトークン テーブル
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_invitation_token ON users(invitation_token);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
```

### Redis (セッション、レート制限)

```
# セッション
session:{sessionId} = {
  userId: string,
  refreshToken: string,
  createdAt: timestamp,
  lastAccessedAt: timestamp
}
TTL: 7 days

# リフレッシュトークンからセッションIDへのマッピング
refreshToken:{token} = sessionId
TTL: 7 days

# ユーザーのアクティブセッション一覧
user:{userId}:sessions = Set<sessionId>
TTL: 7 days

# ログイン試行回数(レート制限)
login:attempts:{email} = count
TTL: 15 minutes
```

## セキュリティ実装

### 1. パスワードハッシュ化
```typescript
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

// ハッシュ化
const hash = await bcrypt.hash(password, SALT_ROUNDS);

// 検証
const isValid = await bcrypt.compare(password, hash);
```

### 2. JWT設定
```typescript
// アクセストークン
{
  secret: process.env.JWT_ACCESS_SECRET,
  expiresIn: '15m',
  algorithm: 'HS256'
}

// リフレッシュトークン
{
  secret: process.env.JWT_REFRESH_SECRET,
  expiresIn: '7d',
  algorithm: 'HS256'
}
```

- ログイン試行: 10回/15分 (Redisによるカウント)
- サインアップ試行 (PIN確認): 10回/15分
- パスワードポリシー: 最低8文字、英字・数字・記号(`!@#$%^&*`)混在。

#### 4. PINの検証ロジック
PINの検証は、タイミング攻撃を避けるために定数時間比較（Constant-time comparison）を行うか、安全な方法で比較する。
```typescript
// 例: crypto.timingSafeEqual 等を利用
const isPinValid = crypto.timingSafeEqual(
  Buffer.from(inputPin),
  Buffer.from(process.env.COMPANY_PIN)
);
```

### 4. CSRF対策
```typescript
// NestJS CSRF protection
app.use(csurf({ cookie: true }));
```

## 環境変数

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lunch_hub
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@lunch-hub.com

# Application
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Security
BCRYPT_ROUNDS=12
INVITATION_TOKEN_EXPIRY_HOURS=48
PASSWORD_RESET_TOKEN_EXPIRY_HOURS=1
```

## テスト戦略

### 単体テスト
- ドメインロジック(集約、値オブジェクト)のテスト
- ユースケースのテスト
- バリデーションのテスト

### 統合テスト
- API エンドポイントのテスト
- リポジトリのテスト
- 認証フローのテスト

## 実装上の重要な決定事項

### 1. トランザクション管理
- 基本的に「1ユースケース = 1トランザクション」とする。
- Reservation作成とTicket残高更新が別の集約であっても、同一Bounded Context内の場合はユースケース層で TypeORM の `EntityManager.transaction` を用いて一括更新する。
- 異なるコンテキスト（例：IAMとReservation）にまたがる場合は、ドメインイベント（同期ハンドラ）を用いて順次実行する。

### 2. ID生成
- UUID v4 を採用する。
- 生成は Application Layer (Use Case) で行い、Domainモデルの第1引数として渡す。

### 3. タイムゾーン
- Asia/Tokyo (JST) 固定。
- アプリケーション、DB接続文字列、Docker環境変数で `TZ=Asia/Tokyo` を設定する。
- 締切時刻 `09:30:00` は JST とする。

## デプロイメント考慮事項

### 初期セットアップ
1. データベースマイグレーション実行
2. 初期管理者アカウント作成(シードデータ)
3. 環境変数設定
4. Redis接続確認

### セキュリティチェックリスト
- [ ] HTTPS有効化
- [ ] CORS設定
- [ ] レート制限設定
- [ ] セキュリティヘッダー設定(Helmet.js)
- [ ] 環境変数の適切な管理
- [ ] ログ監視設定

## 今後の拡張

### Phase 2
- 二要素認証(2FA)
- セッション管理画面(アクティブセッション一覧、個別無効化)
- 監査ログ画面

### Phase 3
- ソーシャルログイン(Google OAuth)
- パスワードレス認証(Magic Link)
- シングルサインオン(SSO)
