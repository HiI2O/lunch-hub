# TDD ワークフロー

## 必須プロセス

新機能・バグ修正は必ず以下の順序で行う:

1. **RED** — 失敗するテストを先に書く
2. **GREEN** — テストを通す最小限の実装を書く
3. **REFACTOR** — テストが通った状態でリファクタリング

## カバレッジ

- MUST: 新規コードのカバレッジ 80% 以上
- `npm run test:cov` で確認

## テスト実行

```bash
cd backend && npm test              # 全テスト
cd backend && npm test -- --watch   # ウォッチモード
cd backend && npm run test:e2e      # E2E
```
