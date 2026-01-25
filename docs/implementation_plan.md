# Lunch Hub 統合実装計画

## 概要

Lunch Hubアプリケーション全体(認証機能 + コア機能)を段階的に実装します。DDDとクリーンアーキテクチャの原則に従い、テスト駆動で開発を進めます。

## 前提条件

### 完了している設計ドキュメント
- ✅ [要件定義](./requirements.md)
- ✅ [ユビキタス言語](./ubiquitous-language.md)
- ✅ [ドメインモデル](./domain-model.md)
- ✅ [アーキテクチャ設計](./architecture.md)
- ✅ [認証機能 - 要件定義](./authentication-requirements.md)
- ✅ [認証機能 - ユビキタス言語](./authentication-ubiquitous-language.md)
- ✅ [認証機能 - ドメインモデル](./authentication-domain-model.md)
- ✅ [認証機能 - アーキテクチャ](./authentication-architecture.md)

### 技術スタック確認
- Backend: NestJS + TypeScript + PostgreSQL + Redis
- Frontend: React + TypeScript + Vite
- Email: Nodemailer (開発) → SendGrid等(本番)
- 初期管理者: 環境変数 + 起動時自動作成

## ユーザーレビュー必須項目

> [!IMPORTANT]
> **実装の優先順位**
> 
> この計画では、以下の優先順位で実装を進めます:
> 1. Phase 1: 基盤 + IAM (認証・認可)
> 2. Phase 2: 予約管理
> 3. Phase 3: チケット管理 + 注文管理
> 4. Phase 4: 管理機能 + UI改善
> 
> 各フェーズ完了後に動作確認を行い、問題がなければ次のフェーズに進みます。

> [!WARNING]
> **開発環境のセットアップが必要**
> 
> 実装開始前に以下の準備が必要です:
> - Node.js 18.x以上のインストール
> - PostgreSQL 15.xのインストール(またはDocker)
> - Redis 7.xのインストール(またはDocker)
> - Gmailアカウント(開発用メール送信)
> 
> Docker Composeを使用する場合は、Dockerのみで構いません。

## 実装フェーズ

### Phase 1: 基盤 + IAM Context (認証・認可)

**目標**: ユーザー招待、ログイン、認証基盤の構築

#### Backend

##### 1. プロジェクトセットアップ
- [NEW] プロジェクト初期化
  ```bash
  nest new lunch-hub-backend
  ```
- [NEW] 依存関係インストール
  - `@nestjs/typeorm`, `typeorm`, `pg`
  - `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`
  - `bcrypt`, `@types/bcrypt`
  - `ioredis`
  - `nodemailer`, `@types/nodemailer`
  - `class-validator`, `class-transformer`
  - `@nestjs/throttler`

##### 2. 共有カーネル (Shared Kernel)
- [NEW] `src/shared/domain/base-aggregate.ts`: 集約の基底クラス (version/updated_atを含む)
- [NEW] `src/shared/domain/base-entity.ts`: エンティティの基底クラス (id/created_atを含む)
- [NEW] `src/shared/domain/domain-event.ts`: ドメインイベントの基底クラス
- [NEW] `src/shared/domain/value-objects/user-id.vo.ts`: ユーザーID値オブジェクト
- [NEW] `src/shared/domain/value-objects/email.vo.ts`: メールアドレス値オブジェクト
- [NEW] `src/shared/domain/value-objects/display-name.vo.ts`: 表示名値オブジェクト

##### 3. IAM Module - Domain Layer
- [NEW] User集約
  - `src/modules/iam/domain/aggregates/user/user.aggregate.ts`
  - `src/modules/iam/domain/aggregates/user/password.vo.ts`
  - `src/modules/iam/domain/aggregates/user/role.enum.ts` (ADMINISTRATOR, STAFF, GENERAL_USER)
  - `src/modules/iam/domain/aggregates/user/user-status.enum.ts` (INVITED, ACTIVE, DEACTIVATED)
  - `src/modules/iam/domain/aggregates/user/invitation-token.vo.ts`

- [NEW] Session集約
  - `src/modules/iam/domain/aggregates/session/session.aggregate.ts`
  - `src/modules/iam/domain/aggregates/session/access-token.vo.ts`
  - `src/modules/iam/domain/aggregates/session/refresh-token.vo.ts`

- [NEW] ドメインサービス
  - `src/modules/iam/domain/services/authentication.service.ts`
  - `src/modules/iam/domain/services/invitation.service.ts`

- [NEW] リポジトリインターフェース
  - `src/modules/iam/domain/repositories/user.repository.interface.ts`
  - `src/modules/iam/domain/repositories/session.repository.interface.ts`

##### 4. IAM Module - Application Layer
- [NEW] ユースケース
  - `src/modules/iam/application/use-cases/invite-user/invite-user.use-case.ts`
  - `src/modules/iam/application/use-cases/activate-user/activate-user.use-case.ts`
  - `src/modules/iam/application/use-cases/login/login.use-case.ts`
  - `src/modules/iam/application/use-cases/logout/logout.use-case.ts`
  - `src/modules/iam/application/use-cases/refresh-token/refresh-token.use-case.ts`
  - `src/modules/iam/application/use-cases/change-password/change-password.use-case.ts`

##### 5. IAM Module - Infrastructure Layer
- [NEW] TypeORM
  - `src/modules/iam/infrastructure/persistence/typeorm/entities/user.entity.ts`
  - `src/modules/iam/infrastructure/persistence/typeorm/repositories/user.repository.impl.ts`
  - `src/modules/iam/infrastructure/persistence/typeorm/mappers/user.mapper.ts`

- [NEW] Redis
  - `src/modules/iam/infrastructure/persistence/redis/repositories/session.repository.impl.ts`

- [NEW] Email Service
  - `src/modules/iam/infrastructure/email/email.service.ts`
  - `src/modules/iam/infrastructure/email/templates/invitation.template.ts`

- [NEW] JWT Service
  - `src/modules/iam/infrastructure/jwt/jwt.service.ts`

##### 6. IAM Module - Presentation Layer
- [NEW] Controllers
  - `src/modules/iam/presentation/controllers/auth.controller.ts`
  - `src/modules/iam/presentation/controllers/user.controller.ts`
  - `src/modules/iam/presentation/controllers/admin.controller.ts`

- [NEW] Guards & Decorators
  - `src/modules/iam/presentation/guards/jwt-auth.guard.ts`
  - `src/modules/iam/presentation/guards/roles.guard.ts`
  - `src/modules/iam/presentation/decorators/current-user.decorator.ts`

##### 7. Database
- [NEW] Migrations
  - `src/database/migrations/XXXXXX-create-users-table.migration.ts`

- [NEW] Seeds
  - `src/database/seeds/initial-admin.seed.ts`

##### 8. Configuration
- [NEW] `.env.example`
- [MODIFY] `src/app.module.ts`: IAMモジュールのインポート

---

#### Frontend

##### 1. プロジェクトセットアップ
- [NEW] プロジェクト初期化
  ```bash
  npm create vite@latest lunch-hub-frontend -- --template react-ts
  ```
- [NEW] 依存関係インストール
  - `react-router-dom`, `axios`, `zustand`, `react-hook-form`, `zod`, `date-fns`

##### 2. 認証機能
- [NEW] Components
  - `src/features/auth/components/LoginForm.tsx`
  - `src/features/auth/components/ActivateAccountForm.tsx`
  - `src/features/auth/components/ChangePasswordForm.tsx`

- [NEW] Pages
  - `src/features/auth/pages/LoginPage.tsx`
  - `src/features/auth/pages/ActivateAccountPage.tsx`

- [NEW] Services & Hooks
  - `src/features/auth/services/auth.service.ts`
  - `src/features/auth/hooks/useAuth.ts`

- [NEW] Context & Guards
  - `src/shared/contexts/AuthContext.tsx`
  - `src/shared/guards/AuthGuard.tsx`

---

### Phase 2: Reservation Context (予約管理)

**目標**: 弁当予約の作成、変更、キャンセル機能

#### Backend

##### 1. Reservation Module - Domain Layer
- [NEW] Reservation集約
- [NEW] Guest集約
- [NEW] ドメインサービス

##### 2. Reservation Module - Application Layer
- [NEW] ユースケース

##### 3. Reservation Module - Infrastructure & Presentation
- [NEW] TypeORM, Controllers

##### 4. Database
- [NEW] Migrations

---

#### Frontend

##### 1. 予約機能
- [NEW] Components, Pages, Services

---

### Phase 3: Ticket Context + Order Context

**目標**: チケット管理と注文管理機能

#### Backend
- [NEW] Ticket Module, Order Module

#### Frontend
- [NEW] チケット機能, 注文機能(係・管理者)

---

### Phase 4: 管理機能 + UI改善

**目標**: 管理画面の充実、UX改善

#### Backend
- [NEW] ユーザー管理機能の拡充、レポート機能、監査ログ

#### Frontend
- [NEW] 管理ダッシュボード、ユーザー管理画面、レポート画面、UI/UXの改善

---

## 検証計画

### Phase 1 検証
- 単体テスト (Domain Layer, Use Cases)
- 統合テスト (API)
- E2Eテスト (手動)
- セキュリティ検証

## 実装の進め方
1. Phase完了ごとに確認
2. テスト駆動開発(TDD)
3. コミット粒度を意識
4. コードレビュー
