---
paths:
  - "backend/src/**/application/**"
---
# アプリケーション層ルール

## 依存制約

- MUST: リポジトリの「インターフェース」のみに依存（具体実装を import しない）
- MUST: TypeORM エンティティや Express の Request/Response を直接扱わない
- OK: NestJS の `@Injectable()` デコレータは使用可

## ユースケース設計

- 1 ユースケース = 1 クラス（Command/Query パターン）
- DTO で入出力を定義し、ドメインオブジェクトを外部に漏らさない
- トランザクション管理はこの層で行う

## ファイル配置

```
application/
├── use-cases/   # XxxCommand.ts / XxxQuery.ts
└── dto/         # input/output DTO
```
