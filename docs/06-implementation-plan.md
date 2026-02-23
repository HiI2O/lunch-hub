# Lunch Hub 統合実装計画

## 概要

Lunch Hubアプリケーション全体(認証機能 + コア機能)を段階的に実装します。DDDとクリーンアーキテクチャの原則に従い、テスト駆動で開発を進めます。

## 前提条件

### 完了している設計ドキュメント
- [要件定義](./01-requirements.md)
- [ユビキタス言語](./02-design/ubiquitous-language.md)
- [ドメインモデル](./02-design/domain-model.md)
- [アーキテクチャ設計](./02-design/architecture.md)
- [IAMモジュール設計](./02-design/modules/iam.md)
- [API設計](./03-api-design.md)
- [データベース設計](./04-database-design.md)

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
> - Docker Compose（PostgreSQL, Redis, MailHog）
> - `backend/.env.example` をコピーして `backend/.env` を作成
>
> 開発用メール確認には MailHog（`http://localhost:8025`）を使用します。

## 実装フェーズ

### Phase 1: 基盤 + IAM Context (認証・認可)

**目標**: ユーザー招待、ログイン、認証基盤の構築

#### Backend

- プロジェクトセットアップ（NestJS初期化、依存関係インストール）
- 共有カーネル（集約/エンティティ基底クラス、共有値オブジェクト）
- IAM Module - Domain Layer（User集約、Session集約、ドメインサービス、リポジトリIF）
- IAM Module - Application Layer（ユースケース: 招待、アクティベーション、ログイン/ログアウト、パスワード管理、役割変更、強制ログアウト）
- IAM Module - Infrastructure Layer（TypeORM永続化、Redis セッション、メール送信、JWT）
- IAM Module - Presentation Layer（コントローラー、認証ガード、ロールガード）
- Database（マイグレーション、初期管理者シード）
- 監査ログ基盤（audit_logs テーブル、ログ記録サービス）

#### Frontend

> **Note**: フロントエンドの詳細設計（コンポーネント構成、状態管理方針、UIライブラリ選定）は Phase 1 バックエンド完了後に作成する。バックエンドAPIが確定してから設計することで、手戻りを防ぐ。

- プロジェクトセットアップ（React + Vite初期化、依存関係インストール）
- 認証機能（ログイン画面、サインアップ画面、アカウント有効化画面、パスワード変更）
- 認証基盤（認証コンテキスト、認証ガード、トークン管理）

---

### Phase 2: Reservation Context (予約管理)

**目標**: 弁当予約の作成、変更、キャンセル機能

#### Backend

- Reservation Module（Domain / Application / Infrastructure / Presentation 各層）
- Guest集約とゲスト予約機能
- 予約締め切りのドメインルール（当日9:30自動制御）

#### Frontend

- 予約カレンダー画面、予約履歴画面
- ゲスト予約画面（係・管理者）

---

### Phase 3: Ticket Context + Order Context

**目標**: チケット管理と注文管理機能

#### Backend

- Ticket Module（チケット購入予約、残高管理、受取確認）
- Order Module（注文集計、手動発注）
- チケット購入と弁当予約の同時作成

#### Frontend

- チケット管理画面
- 注文管理画面（係・管理者）

---

### Phase 4: 管理機能 + UI改善

**目標**: 管理画面の充実、UX改善

#### Backend

- ユーザー管理機能の拡充（役割変更、強制ログアウト）
- 監査ログの定期削除バッチ

#### Frontend

- ユーザー管理画面
- UI/UXの改善

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
