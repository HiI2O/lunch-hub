---
paths:
  - "backend/src/shared/**"
---
# Shared Domain ルール

## 目的

モジュール横断で使う基底クラスと汎用 Value Object のみを置く場所。
kgrzybek/modular-monolith-with-ddd の `BuildingBlocks` に相当。

## 置いてよいもの（ホワイトリスト）

- `Entity` 基底クラス（ID生成、equals比較）
- `AggregateRoot` 基底クラス
- `ValueObject` 基底クラス（equals、hashCode）
- `DomainEvent` 基底クラス
- 汎用 VO（`Money`, `DateRange` など複数モジュールが使うもの）

## 禁止事項

- MUST: ビジネスロジックを書かない（特定モジュールの業務ルールは各モジュールの domain/ に置く）
- MUST: NestJS・TypeORM 等の外部ライブラリに依存しない（domain 層と同じ制約）
- MUST: 「とりあえず共通」で安易にファイルを追加しない。2つ以上のモジュールが実際に使う場合のみ

## ファイル配置

```
backend/src/shared/domain/
├── Entity.ts           # 基底クラス
├── AggregateRoot.ts    # 基底クラス
├── ValueObject.ts      # 基底クラス
├── DomainEvent.ts      # 基底クラス
└── value-objects/      # 汎用 VO（Money, DateRange 等）
```
