# Lunch Hub Project Instructions

## プロジェクト概要
Lunch Hubは、NestJSバックエンドとReactフロントエンドで構成されるアプリケーションです。

## 技術スタック
- Backend: NestJS + TypeORM
- Frontend: React
- アーキテクチャ: DDD（ドメイン駆動設計） + クリーンアーキテクチャ
- 開発環境: Docker Desktop (PostgreSQL, Redis)

## 開発環境のセットアップ

開発を開始する前に、必ず Docker コンテナを起動してください：

```bash
docker compose up -d
```

### 接続情報
- **PostgreSQL**: `localhost:5432` (User: `postgres`, Pass: `postgres`, DB: `lunch_hub`)
- **Redis**: `localhost:6379`
- **Backend API**: `http://localhost:3000`
- **Frontend**: `http://localhost:5173`

### 環境設定
- 初期管理者のパスワード等の機密情報は `backend/.env` で管理する。
- タイムゾーンは `Asia/Tokyo` 固定。

## ディレクトリ構造

各モジュールは `backend/src/modules/[module-name]` に配置し、以下の構造に従う：

```
[module-name]/
├── domain/                # ドメイン層（外部依存なし）
│   ├── aggregates/        # 集約（Entities + VOs）
│   ├── services/          # ドメインサービス
│   └── repositories/      # リポジトリインターフェース
├── application/           # アプリケーション層
│   ├── use-cases/         # ユースケース（Command/Query）
│   └── dto/               # 入出力データ定義
├── infrastructure/        # インフラストラクチャ層
│   ├── persistence/       # TypeORM/Redis 実装
│   └── mappers/           # ドメインモデル ↔ 永続化モデルの変換
└── presentation/          # プレゼンテーション層
    ├── controllers/       # NestJS Controllers
    ├── guards/            # 認可ガード
    └── decorators/        # カスタムデコレータ
```

## 実装ルール

### ドメイン層
- `domain/` 内のコードは NestJS や TypeORM などの外部ライブラリに依存しない
- プリミティブ型を直接使わず、Value Object でバリデーションをカプセル化する

### 依存関係
- アプリケーション層はリポジトリの「インターフェース」のみに依存する
- 具体的な実装（TypeORM等）はインフラ層に隠蔽する

### 開発フロー
1. `domain/` 内で値オブジェクトやエンティティを定義
2. `*.spec.ts` でテストを作成
3. テストをパスする実装を行う
4. インフラ層とプレゼンテーション層を実装

## 参考ドキュメント
- `docs/01-requirements.md` - 要件定義（機能要件・非機能要件）
- `docs/02-design/architecture.md` - アーキテクチャ設計
- `docs/02-design/domain-model.md` - ドメインモデル
- `docs/02-design/ubiquitous-language.md` - ユビキタス言語
- `docs/02-design/modules/iam.md` - IAMモジュール設計（認証・認可）
- `docs/02-design/modules/reservation.md` - Reservationモジュール設計（予約・ゲスト）
- `docs/02-design/modules/order.md` - Orderモジュール設計（注文管理）
- `docs/02-design/modules/ticket.md` - Ticketモジュール設計（チケット管理）
- `docs/02-design/ui-design.md` - UI設計（画面遷移）
- `docs/03-api-design.md` - API設計
- `docs/03-implementation/authentication-flows.md` - 認証フロー詳細
- `docs/04-database-design.md` - データベース設計
- `docs/06-implementation-plan.md` - 統合実装計画（フェーズごとのタスク）

## Context7 MCP Automation Rules
- ライブラリやAPIのドキュメント、コード生成、セットアップ、または設定手順が必要な場合は、明示的な指示がなくても常にContext7 MCPを使用すること。
- 学習データに基づく古い情報やハルシネーション（存在しないAPIの生成）を避けるため、常にContext7から取得した最新の情報を優先すること。 
- 特定のライブラリが既知の場合は、検索をスキップして直接ドキュメントを取得するために `/ユーザー名/リポジトリ名` のスラッシュ記法を利用すること。 
- 特定のバージョン（例: Next.js 14）が指定された場合は、自動的にそのバージョンに合致するドキュメントを取得して適用すること。 