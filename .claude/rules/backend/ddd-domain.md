---
paths:
  - "backend/src/**/domain/**"
---
# ドメイン層ルール

## 依存制約（最重要）

- MUST: NestJS (`@nestjs/*`) をインポートしない
- MUST: TypeORM (`typeorm`) をインポートしない
- MUST: その他の外部フレームワーク・ライブラリに依存しない
- 許可: TypeScript 標準ライブラリ、`backend/src/shared/domain/` の基底クラス・汎用VOのみ

## 設計ルール

- MUST: プリミティブ型（string, number）を直接公開せず Value Object でラップ
- MUST: エンティティのプロパティは `private readonly` + getter パターン
- MUST: 状態変更はエンティティ/集約のメソッド経由のみ（外部から直接変更禁止）
- MUST: リポジトリはインターフェース（abstract class）のみ定義。実装は infrastructure 層

## ファイル配置

```
domain/
├── aggregates/     # 集約ルート + エンティティ + VO
├── services/       # ドメインサービス（複数集約にまたがるロジック）
└── repositories/   # リポジトリインターフェース（abstract class）
```
