---
description: E2Eテスト環境リセット→テスト実行→エビデンス確認を一括実行
allowed-tools: Read, Bash(cd:*), Bash(npx:*), Bash(docker:*), Bash(curl:*), Bash(ls:*), Bash(rm:*), Glob
argument-hint: [TC番号 (省略時は全テスト実行)] (例: tc01, tc10, 省略で全テスト)
---

# E2E テスト実行: $ARGUMENTS

## 手順

### 1. 前提条件チェック

以下が起動していることを確認する:

1. Docker コンテナ: `docker compose ps`
   - lunch-hub-postgres (healthy)
   - lunch-hub-redis (healthy)
   - lunch-hub-mailhog (running)
2. Backend: `curl -s http://localhost:3000/api/auth/login 2>&1`（レスポンスがあればOK）
3. Frontend: `curl -s http://localhost:5173 2>&1`（レスポンスがあればOK、なければ `webServer` 設定で自動起動される）

起動していないサービスがあればユーザーに通知して停止する。

### 2. 古いエビデンスの削除

対象TCの古いスクリーンショットを削除する:

- 特定TC: `rm frontend/e2e/screenshots/{TC番号}-*`
- 全テスト: `rm frontend/e2e/screenshots/*.png`

### 3. テスト実行

```bash
cd frontend && npx playwright test {TC番号またはなし} --reporter=list
```

### 4. エビデンス確認

1. `frontend/e2e/screenshots/` の生成されたスクリーンショットを一覧表示
2. 各スクリーンショットをユーザーに表示して確認を促す

### 5. 結果レポート

テスト結果をサマリーで報告:

| TC | テスト名 | 結果 | エビデンス数 |
|----|---------|------|------------|
| TC-XX | ... | PASS/FAIL | N枚 |
