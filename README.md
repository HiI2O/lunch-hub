# Lunch Hub

社内用お弁当注文Webアプリケーション

## 概要

Lunch Hubは、社内の弁当注文プロセスを効率化するためのWebアプリケーションです。DDDとクリーンアーキテクチャの原則に従って開発されています。

## 開発環境

### 前提条件
- **Node.js**: 18.x以上
- **Docker Desktop**: Windows/Mac/Linux
- **Git**

### 1. Docker コンテナの起動

```bash
docker compose up -d
```

以下のサービスが起動します：
- **PostgreSQL (5432)**: メインデータベース
- **Redis (6379)**: セッション管理・レート制限
- **MailHog (1025/8025)**: 開発用メールサーバー（Web UI: http://localhost:8025）

### 2. Backend セットアップ

```bash
cd backend
cp .env.example .env   # 環境変数を設定（必要に応じて .env を編集）
npm install
npm run start:dev
```

### 3. Frontend セットアップ

```bash
cd frontend
npm install
npm run dev
```

### 4. コンテナの停止

```bash
docker compose down
```

## ドキュメント

- [要件定義](./docs/01-requirements.md)
- [アーキテクチャ設計](./docs/02-design/architecture.md)
- [ドメインモデル](./docs/02-design/domain-model.md)
- [ユビキタス言語](./docs/02-design/ubiquitous-language.md)
- [UI設計](./docs/02-design/ui-design.md)
- [モジュール設計](./docs/02-design/modules/) (IAM, Reservation, Order, Ticket)
- [API設計](./docs/03-api-design.md)
- [データベース設計](./docs/04-database-design.md)
- [認証フロー詳細](./docs/05-implementation/authentication-flows.md)
- [実装計画](./docs/06-implementation-plan.md)
