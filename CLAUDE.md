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
- `docs/02-design/modules/iam-module.md` - IAMモジュール設計（認証・認可）
- `docs/03-api-design.md` - API設計
- `docs/04-database-design.md` - データベース設計
- `docs/05-basic-design.md` - 基本設計書（図解、画面遷移）
- `docs/06-implementation-plan.md` - 統合実装計画（フェーズごとのタスク）
