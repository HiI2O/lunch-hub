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

**エンティティ: User**

属性:
- userId (識別子)
- email, displayName, status (基本情報)
- passwordHash, role (認証情報)
- invitationToken, invitedAt, invitedBy (招待情報)
- activatedAt, createdAt, updatedAt, lastLoginAt (タイムスタンプ)

ファクトリメソッド:
- `invite()`: 管理者によるユーザー招待
- `selfSignUp()`: セルフサインアップ

コマンド:
- `activate()`: アカウント有効化
- `changePassword()`: パスワード変更
- `initiatePasswordReset()`: パスワードリセット要求
- `resetPassword()`: パスワードリセット実行
- `changeRole()`: 役割変更
- `deactivate()` / `reactivate()`: 無効化・再有効化
- `updateLastLogin()`: 最終ログイン更新

クエリ:
- `isActive()`, `isInvited()`, `hasRole()`, `canLogin()`

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

**エンティティ: Session**

属性:
- sessionId (識別子)
- userId, accessToken, refreshToken
- isRevoked, createdAt, lastAccessedAt

ファクトリメソッド:
- `create()`: セッション作成

コマンド:
- `refreshAccessToken()`: アクセストークン更新
- `revoke()`: セッション無効化
- `updateLastAccessed()`: 最終アクセス更新

クエリ:
- `isValid()`, `isExpired()`

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
ユーザーの認証を担当するドメインサービス。PasswordHasher インターフェースを通じてパスワードを検証する。

**責務:**
- PasswordHasher 経由でのパスワード検証
- セッションの作成
- トークンの生成

### PasswordHasher（インターフェース）
パスワードのハッシュ化・検証の抽象。ドメイン層にインターフェースを定義し、具体的な実装（bcrypt等）はインフラ層に配置する。

**責務:**
- パスワードのハッシュ化
- パスワードとハッシュの一致検証

### InvitationService
ユーザー招待を担当するドメインサービス。

**責務:**
- 招待トークンの生成
- 招待の有効性検証

---

## リポジトリインターフェース

### UserRepository
- ユーザーの保存・取得（ID/メール/招待トークンによる検索）
- メールアドレスの存在チェック

### SessionRepository
- セッションの保存・取得（ID/リフレッシュトークン/ユーザーIDによる検索）
- ユーザーの全セッション無効化（強制ログアウト用）

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
| ユースケース            | 説明                     | アクター      |
| ----------------------- | ------------------------ | ------------- |
| `ChangeRoleUseCase`     | ユーザー役割変更         | ADMINISTRATOR |
| `DeactivateUserUseCase` | ユーザー無効化           | ADMINISTRATOR |
| `ReactivateUserUseCase` | ユーザー再有効化         | ADMINISTRATOR |
| `ForceLogoutUseCase`    | ユーザー強制ログアウト   | ADMINISTRATOR |
| `GetUserProfileUseCase` | プロフィール取得         | 認証済み      |

