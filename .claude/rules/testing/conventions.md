---
paths:
  - "**/*.spec.ts"
  - "**/*.test.ts"
  - "**/*.e2e-spec.ts"
---
# テスト規約

## 構造

- AAA パターン: Arrange → Act → Assert
- describe ブロック: クラス名またはユースケース名
- it/test: 日本語で「〜の場合、〜する」形式

```typescript
describe('CreateOrderCommand', () => {
  it('有効な注文の場合、注文を作成する', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## 命名・配置

- ユニットテスト: 実装ファイルと同階層に `*.spec.ts`
- E2Eテスト: `backend/test/` に `*.e2e-spec.ts`

## ルール

- MUST: テスト間で状態を共有しない（各テストが独立）
- MUST: 外部依存（DB, API）はモックする（ユニットテスト）
- SHOULD: テストデータはファクトリパターンで生成
