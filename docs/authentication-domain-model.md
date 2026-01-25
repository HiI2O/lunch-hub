# 認証機能 ドメインモデル

## 境界づけられたコンテキスト (Bounded Context)

### Identity and Access Management Context (IAM Context)
認証・認可を担当するコンテキスト。ユーザーの識別、認証、権限管理を行う。

**責務:**
- ユーザーの招待とアクティベーション
- 認証情報の管理
- セッション管理
- 役割ベースのアクセス制御

**他のコンテキストとの関係:**
- **Ordering Context**: ユーザーIDを提供し、注文者を識別
- **Menu Management Context**: 管理者権限の検証

## 集約 (Aggregates)

### 1. User集約

**集約ルート:** `User`

**責務:**
- ユーザーの識別情報と認証情報の管理
- ユーザーのライフサイクル管理(招待 → アクティベーション → アクティブ)
- パスワードの変更とリセット
- 役割の管理

**エンティティ:**

#### User (集約ルート)
```typescript
class User {
  // 識別子
  private readonly userId: UserId;
  
  // 基本情報
  private email: Email;
  private name: UserName;
  private status: UserStatus; // INVITED, ACTIVE, DEACTIVATED
  
  // 認証情報
  private passwordHash: PasswordHash;
  private role: Role; // ADMIN, EMPLOYEE
  
  // 招待情報
  private invitationToken?: InvitationToken;
  private invitedAt?: Date;
  private invitedBy?: UserId;
  
  // アクティベーション情報
  private activatedAt?: Date;
  
  // タイムスタンプ
  private createdAt: Date;
  private updatedAt: Date;
  
  // ファクトリメソッド
  static invite(email: Email, role: Role, invitedBy: UserId): User;
  
  // コマンド
  activate(password: Password): void;
  changePassword(currentPassword: Password, newPassword: Password): void;
  initiatePasswordReset(): PasswordResetToken;
  resetPassword(token: PasswordResetToken, newPassword: Password): void;
  deactivate(): void;
  reactivate(): void;
  
  // クエリ
  isActive(): boolean;
  isInvited(): boolean;
  hasRole(role: Role): boolean;
  canLogin(): boolean;
}
```

**値オブジェクト:**

#### Email
```typescript
class Email {
  private readonly value: string;
  
  constructor(email: string) {
    // バリデーション: メールアドレス形式チェック
  }
  
  equals(other: Email): boolean;
  toString(): string;
}
```

#### Password
```typescript
class Password {
  private readonly value: string;
  
  constructor(password: string) {
    // バリデーション: パスワードポリシーチェック
    // - 最低8文字
    // - 英数字と記号を含む
  }
  
  hash(): PasswordHash;
}
```

#### PasswordHash
```typescript
class PasswordHash {
  private readonly value: string;
  
  verify(password: Password): boolean;
}
```

#### InvitationToken
```typescript
class InvitationToken {
  private readonly value: string;
  private readonly expiresAt: Date;
  
  static generate(): InvitationToken;
  
  isExpired(): boolean;
  isValid(): boolean;
}
```

#### PasswordResetToken
```typescript
class PasswordResetToken {
  private readonly value: string;
  private readonly expiresAt: Date;
  private readonly userId: UserId;
  
  static generate(userId: UserId): PasswordResetToken;
  
  isExpired(): boolean;
  isValid(): boolean;
}
```

#### Role
```typescript
enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE'
}
```

#### UserStatus
```typescript
enum UserStatus {
  INVITED = 'INVITED',      // 招待済み、未アクティベート
  ACTIVE = 'ACTIVE',        // アクティブ
  DEACTIVATED = 'DEACTIVATED' // 無効化
}
```

**ドメインイベント:**
- `UserInvited`: ユーザーが招待された
- `UserActivated`: ユーザーがアクティベートされた
- `PasswordChanged`: パスワードが変更された
- `PasswordResetRequested`: パスワードリセットが要求された
- `PasswordReset`: パスワードがリセットされた
- `UserDeactivated`: ユーザーが無効化された
- `UserReactivated`: ユーザーが再有効化された

**不変条件 (Invariants):**
- メールアドレスは一意である
- アクティブなユーザーは必ずパスワードハッシュを持つ
- 招待済みユーザーは招待トークンを持つ
- 招待トークンの有効期限は48時間
- パスワードリセットトークンの有効期限は1時間

### 2. Session集約

**集約ルート:** `Session`

**責務:**
- セッションの作成と管理
- トークンの発行と検証
- セッションの無効化

**エンティティ:**

#### Session (集約ルート)
```typescript
class Session {
  // 識別子
  private readonly sessionId: SessionId;
  
  // ユーザー情報
  private readonly userId: UserId;
  
  // トークン
  private accessToken: AccessToken;
  private refreshToken: RefreshToken;
  
  // セッション状態
  private isRevoked: boolean;
  
  // タイムスタンプ
  private createdAt: Date;
  private lastAccessedAt: Date;
  
  // ファクトリメソッド
  static create(userId: UserId): Session;
  
  // コマンド
  refreshAccessToken(): AccessToken;
  revoke(): void;
  updateLastAccessed(): void;
  
  // クエリ
  isValid(): boolean;
  isExpired(): boolean;
}
```

**値オブジェクト:**

#### AccessToken
```typescript
class AccessToken {
  private readonly value: string; // JWT
  private readonly expiresAt: Date;
  
  static generate(userId: UserId, role: Role): AccessToken;
  
  isExpired(): boolean;
  verify(): TokenPayload;
}
```

#### RefreshToken
```typescript
class RefreshToken {
  private readonly value: string;
  private readonly expiresAt: Date;
  
  static generate(): RefreshToken;
  
  isExpired(): boolean;
}
```

**ドメインイベント:**
- `SessionCreated`: セッションが作成された
- `AccessTokenRefreshed`: アクセストークンが更新された
- `SessionRevoked`: セッションが無効化された

**不変条件:**
- アクセストークンの有効期限は15分
- リフレッシュトークンの有効期限は7日
- 無効化されたセッションは再利用できない

## ドメインサービス

### AuthenticationService
```typescript
class AuthenticationService {
  // ログイン処理
  login(email: Email, password: Password): Session;
  
  // パスワード検証
  verifyPassword(user: User, password: Password): boolean;
}
```

### InvitationService
```typescript
class InvitationService {
  // 招待メール送信
  sendInvitationEmail(user: User, invitationToken: InvitationToken): void;
  
  // パスワードリセットメール送信
  sendPasswordResetEmail(user: User, resetToken: PasswordResetToken): void;
}
```

### RateLimitService
```typescript
class RateLimitService {
  // ログイン試行回数チェック
  checkLoginAttempts(email: Email): boolean;
  
  // ログイン試行を記録
  recordLoginAttempt(email: Email, success: boolean): void;
}
```

## リポジトリ

### UserRepository
```typescript
interface UserRepository {
  // 保存
  save(user: User): Promise<void>;
  
  // 検索
  findById(userId: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByInvitationToken(token: InvitationToken): Promise<User | null>;
  
  // 存在チェック
  existsByEmail(email: Email): Promise<boolean>;
}
```

### SessionRepository
```typescript
interface SessionRepository {
  // 保存
  save(session: Session): Promise<void>;
  
  // 検索
  findById(sessionId: SessionId): Promise<Session | null>;
  findByRefreshToken(refreshToken: RefreshToken): Promise<Session | null>;
  findActiveSessionsByUserId(userId: UserId): Promise<Session[]>;
  
  // 削除
  revokeAllByUserId(userId: UserId): Promise<void>;
}
```

### PasswordResetTokenRepository
```typescript
interface PasswordResetTokenRepository {
  // 保存
  save(token: PasswordResetToken): Promise<void>;
  
  // 検索
  findByToken(token: string): Promise<PasswordResetToken | null>;
  
  // 削除
  deleteByUserId(userId: UserId): Promise<void>;
}
```

## アプリケーションサービス (ユースケース)

### 招待関連
- `InviteUserUseCase`: ユーザーを招待する
- `ActivateUserUseCase`: ユーザーをアクティベートする
- `ResendInvitationUseCase`: 招待メールを再送信する
- `CancelInvitationUseCase`: 招待を取り消す

### 認証関連
- `LoginUseCase`: ログインする
- `LogoutUseCase`: ログアウトする
- `RefreshTokenUseCase`: トークンを更新する

### パスワード管理
- `ChangePasswordUseCase`: パスワードを変更する
- `RequestPasswordResetUseCase`: パスワードリセットを要求する
- `ResetPasswordUseCase`: パスワードをリセットする

### ユーザー管理
- `DeactivateUserUseCase`: ユーザーを無効化する
- `ReactivateUserUseCase`: ユーザーを再有効化する
- `GetUserProfileUseCase`: ユーザープロフィールを取得する

## 既存のLunch Hubドメインモデルとの統合

### User集約の拡張
既存の`User`集約に認証機能を統合する方針:

1. **既存のUser集約を拡張**
   - 認証情報(パスワードハッシュ、役割など)を追加
   - 招待・アクティベーション機能を追加

2. **分離の可能性**
   - 将来的に認証機能が複雑化した場合、`AuthUser`として分離も検討
   - 現時点では同一集約として管理

### コンテキストマッピング

```
┌─────────────────────────────────┐
│ IAM Context                     │
│ - User (with auth info)         │
│ - Session                       │
└───────────┬─────────────────────┘
            │ provides UserId
            │ provides Role
            ↓
┌─────────────────────────────────┐
│ Ordering Context                │
│ - Order                         │
│ - OrderItem                     │
└─────────────────────────────────┘
```

**統合パターン:** Shared Kernel (UserId, Role)
