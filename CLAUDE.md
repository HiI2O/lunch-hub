# Lunch Hub

社内ランチ予約・注文管理アプリ（NestJS + React + TypeORM）

## Commands

```bash
# Docker (PostgreSQL, Redis)
docker compose up -d

# Backend (backend/)
npm run start:dev          # 開発サーバー (localhost:3000)
npm test                   # ユニットテスト
npm run test:cov           # カバレッジ付きテスト
npm run test:e2e           # E2Eテスト
npm run lint               # ESLint

# Frontend (frontend/)
npm run dev                # 開発サーバー (localhost:5173)
npm run build              # ビルド
npm run lint               # ESLint
```

## Architecture

- DDD + クリーンアーキテクチャ（domain → application → infrastructure/presentation）
- TZ は `Asia/Tokyo` 固定、機密情報は `backend/.env` で管理

### モジュール構成（MUST: この構造に従う）

```
backend/src/
├── shared/domain/   # 基底クラス・汎用VOのみ（ビジネスロジック禁止）
└── modules/[module-name]/
    ├── domain/          {aggregates/, services/, repositories/}
    ├── application/     {use-cases/, dto/}
    ├── infrastructure/  {persistence/, mappers/}
    └── presentation/    {controllers/, guards/, decorators/}
```

- MUST: 上記以外のトップレベルディレクトリを勝手に作らない
- MUST: 新モジュール作成時は `docs/02-design/modules/` の設計ドキュメントを先に確認する

## Gotchas (地雷マップ)

- MUST: domain/ 内は NestJS・TypeORM 等の外部ライブラリに依存禁止（純粋なTS/JSのみ）
- MUST: プリミティブ型を直接使わず Value Object でラップする
- MUST: application 層はリポジトリの「インターフェース」のみに依存（具体実装はinfra層）
- MUST: TDD — テストを先に書き、RED → GREEN → REFACTOR
- MUST: テストカバレッジ 80% 以上
- SHOULD: イミュータブルパターン — オブジェクトを直接変更しない
- SHOULD: ファイルは 800 行以下、関数は 50 行以下

## Done Checklist

- [ ] テストが全てパス (`npm test`)
- [ ] lint エラーなし (`npm run lint`)
- [ ] 新規コードにテストがある（カバレッジ 80%+）
- [ ] domain/ に外部依存を持ち込んでいない
- [ ] 機密情報がハードコードされていない

## Docs

設計ドキュメントは `docs/` 配下を参照（要件定義、API設計、DB設計、実装計画等）
