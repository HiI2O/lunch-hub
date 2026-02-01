# IAM Module 設計書

## 概要

Identity and Access Management (IAM) モジュールは、Lunch Hubアプリケーションの認証・認可を担当するコンテキストです。

**責務:**
- ユーザーの招待とアクティベーション
- 認証情報の管理
- セッション管理
- 役割ベースのアクセス制御(RBAC)

## 集約

### 1. User集約

**集約ルート:** `User`

**責務:**
- ユーザーの識別情報と認証情報の管理
- ユーザーのライフサイクル管理（招待 → アクティベーション → アクティブ）
- パスワードの変更とリセット
- 役割の管理

**エンティティ:**
```typescript
class User {
  // 識別子
  private readonly userId: UserId;

  // 基本情報
  private email: EmailAddress;
  private displayName: DisplayName;
  private status: UserStatus; // INVITED, ACTIVE, DEACTIVATED

  // 認証情報
  private passwordHash: PasswordHash;
  private role: Role; // GENERAL_USER, STAFF, ADMINISTRATOR

  // 招待情報
  private invitationToken?: InvitationToken;
  private invitedAt?: Date;
  private invitedBy?: UserId;

  // アクティベーション情報
  private activatedAt?: Date;

  // タイムスタンプ
  private createdAt: Date;
  private updatedAt: Date;
  private lastLoginAt?: Date;

  // ファクトリメソッド
  static invite(email: EmailAddress, role: Role, invitedBy: UserId): User;
  static selfSignUp(email: EmailAddress): User;

  // コマンド
  activate(password: Password, displayName: DisplayName): void;
  changePassword(currentPassword: Password, newPassword: Password): void;
  initiatePasswordReset(): PasswordResetToken;
  resetPassword(token: PasswordResetToken, newPassword: Password): void;
  deactivate(): void;
  reactivate(): void;
  updateLastLogin(): void;

  // クエリ
  isActive(): boolean;
  isInvited(): boolean;
  hasRole(role: Role): boolean;
  canLogin(): boolean;
}
```

**値オブジェクト:**

| 名前                 | 責務                 | バリデーション                             |
| -------------------- | -------------------- | ------------------------------------------ |
| `EmailAddress`       | メールアドレス管理   | メール形式、一意性                         |
| `DisplayName`        | 表示名管理           | 1-50文字、日本語/英数字/スペース/中点/長音 |
| `PasswordHash`       | ハッシュ化パスワード | bcryptハッシュ形式                         |
| `InvitationToken`    | 招待トークン         | UUID形式、48時間有効                       |
| `PasswordResetToken` | リセットトークン     | UUID形式、1時間有効                        |
| `Role`               | ユーザー役割         | GENERAL_USER, STAFF, ADMINISTRATOR         |
| `UserStatus`         | ユーザー状態         | INVITED, ACTIVE, DEACTIVATED               |

**ドメインイベント:**
- `UserInvited`: ユーザーが招待された
- `UserActivated`: ユーザーがアクティベートされた
- `PasswordChanged`: パスワードが変更された
- `PasswordResetRequested`: パスワードリセットが要求された
- `PasswordReset`: パスワードがリセットされた
- `UserDeactivated`: ユーザーが無効化された
- `UserReactivated`: ユーザーが再有効化された

**不変条件:**
- メールアドレスは一意である
- アクティブなユーザーは必ずパスワードハッシュを持つ
- 招待済みユーザーは招待トークンを持つ
- 招待トークンの有効期限は48時間
- パスワードリセットトークンの有効期限は1時間

---

### 2. Session集約

**集約ルート:** `Session`

**責務:**
- セッションの作成と管理
- トークンの発行と検証
- セッションの無効化

**エンティティ:**
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
  static create(userId: UserId, role: Role): Session;

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

| 名前           | 責務                   | 有効期限 |
| -------------- | ---------------------- | -------- |
| `AccessToken`  | API認証用JWTトークン   | 15分     |
| `RefreshToken` | トークン更新用トークン | 7日      |

**ドメインイベント:**
- `SessionCreated`: セッションが作成された
- `AccessTokenRefreshed`: アクセストークンが更新された
- `SessionRevoked`: セッションが無効化された

**不変条件:**
- アクセストークンの有効期限は15分
- リフレッシュトークンの有効期限は7日
- 無効化されたセッションは再利用できない

---

## ドメインサービス

### AuthenticationService
ユーザーの認証を担当するドメインサービス。

**責務:**
- パスワードの検証
- セッションの作成
- トークンの生成

### InvitationService
ユーザー招待を担当するドメインサービス。

**責務:**
- 招待トークンの生成
- 招待の有効性検証

---

## リポジトリインターフェース

### UserRepository
```typescript
interface UserRepository {
  findById(userId: UserId): Promise<User | null>;
  findByEmail(email: EmailAddress): Promise<User | null>;
  findByInvitationToken(token: InvitationToken): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(userId: UserId): Promise<void>;
}
```

### SessionRepository
```typescript
interface SessionRepository {
  findById(sessionId: SessionId): Promise<Session | null>;
  findByUserId(userId: UserId): Promise<Session[]>;
  save(session: Session): Promise<void>;
  delete(sessionId: SessionId): Promise<void>;
  revokeAllByUserId(userId: UserId): Promise<void>;
}
```

---

## ユースケース一覧

### 招待関連
| ユースケース              | 説明                           | アクター      |
| ------------------------- | ------------------------------ | ------------- |
| `InviteUserUseCase`       | 管理者がユーザーを招待         | ADMINISTRATOR |
| `SelfSignUpUseCase`       | ユーザー自身がPINで登録申請    | 未認証        |
| `ActivateUserUseCase`     | 招待トークンでアカウント有効化 | 未認証        |
| `ResendInvitationUseCase` | 招待メールを再送信             | ADMINISTRATOR |
| `CancelInvitationUseCase` | 招待を取り消す                 | ADMINISTRATOR |

### 認証関連
| ユースケース          | 説明         | アクター |
| --------------------- | ------------ | -------- |
| `LoginUseCase`        | ログイン     | 未認証   |
| `LogoutUseCase`       | ログアウト   | 認証済み |
| `RefreshTokenUseCase` | トークン更新 | 認証済み |

### パスワード管理
| ユースケース                  | 説明                   | アクター |
| ----------------------------- | ---------------------- | -------- |
| `ChangePasswordUseCase`       | パスワード変更         | 認証済み |
| `RequestPasswordResetUseCase` | パスワードリセット要求 | 未認証   |
| `ResetPasswordUseCase`        | パスワードリセット実行 | 未認証   |

### ユーザー管理
| ユースケース            | 説明             | アクター      |
| ----------------------- | ---------------- | ------------- |
| `DeactivateUserUseCase` | ユーザー無効化   | ADMINISTRATOR |
| `ReactivateUserUseCase` | ユーザー再有効化 | ADMINISTRATOR |
| `GetUserProfileUseCase` | プロフィール取得 | 認証済み      |

