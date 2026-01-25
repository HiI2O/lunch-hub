# Lunch Hub

社内用お弁当注文Webアプリケーション

## 概要

Lunch Hubは、社内の弁当注文プロセスを効率化するためのWebアプリケーションです。DDDとクリーンアーキテクチャの原則に従って開発されています。

## AI 駆動開発フロー

このプロジェクトでは、複数のAIエージェントを使い分けて開発を進めています。

- **Antigravity (Architect)**: 設計、要件定義、実装計画、コードレビューを担当。
- **Claude Code CLI (Builder)**: 実装計画に基づいたコードの実装、テストの実行を担当。

### 開発サイクル
1. Antigravityが実装計画（`implementation_plan.md`）を作成・更新。
2. Claude Code CLIがその計画を読み取り、実装を行う。
3. 実装完了後、Antigravityがレビューを行い、次のタスクへ進む。

## 開発環境

このプロジェクトは **Docker Desktop** をベースとした開発環境を採用しています。

### 前提条件
- **Node.js**: 18.x以上 (ローカル)
- **Docker Desktop**: Windows/Mac/Linux
- **Git**

### 1. データベースとRedisの起動 (必須)

開発を始める前に、必ずDockerコンテナを起動してください。

```bash
docker compose up -d
```

このコマンドにより以下のサービスが起動します：
- **PostgreSQL (5432)**: メインデータベース
- **Redis (6379)**: セッション管理・レート制限

### 2. コンテナの停止

作業を終了する際は、以下のコマンドで停止します。

```bash
docker compose down
```

## プロジェクト構造

リポジトリ直下に `backend` と `frontend` のディレクトリがあります。

### Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

## ドキュメント

詳細な仕様や設計については以下のドメインドキュメントを参照してください。

- [要件定義](./docs/requirements.md)
- [ユビキタス言語](./docs/ubiquitous-language.md)
- [ドメインモデル](./docs/domain-model.md)
- [アーキテクチャ設計](./docs/architecture.md)
- [統合実装計画](./docs/implementation_plan.md) (※ artifacts ディレクトリにある場合があります。ユーザーに確認してください)

## 初期管理者アカウント

初回起動時に自動的に作成される想定です:
- Email: admin@yourcompany.com
- Password: ChangeMe123!

---

このプロジェクトは学習目的で作成されています。
