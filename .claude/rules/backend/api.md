---
paths:
  - "backend/src/**/presentation/**"
  - "backend/src/**/infrastructure/**"
---
# プレゼンテーション・インフラ層ルール

## コントローラ（presentation）

- MUST: ビジネスロジックを書かない。ユースケースに委譲する
- MUST: バリデーションは class-validator / DTO で行う
- SHOULD: レスポンス型を明示する（Swagger 対応）

## インフラ層（infrastructure）

- リポジトリインターフェースの TypeORM 実装を配置
- Mapper でドメインモデル ↔ 永続化モデルを変換
- MUST: ドメインモデルを TypeORM エンティティから独立させる

## ファイル配置

```
infrastructure/
├── persistence/   # TypeORM リポジトリ実装、TypeORM エンティティ
└── mappers/       # ドメインモデル ↔ ORM エンティティ変換

presentation/
├── controllers/   # NestJS コントローラ
├── guards/        # 認可ガード
└── decorators/    # カスタムデコレータ
```
