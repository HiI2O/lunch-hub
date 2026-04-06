---
paths:
  - "frontend/e2e/**"
  - "frontend/playwright.config.ts"
---
# Playwright E2E テスト規約

## ファイル配置

```
frontend/e2e/
├── helpers/
│   ├── auth.ts          # ログインヘルパー（loginViaUI, loginAsAdmin）
│   ├── screenshot.ts    # スクリーンショットヘルパー（takeEvidence）
│   └── cleanup.ts       # DB/MailHog クリーンアップ
├── tc01-*.spec.ts       # テストケースごとに1ファイル
├── tc02-*.spec.ts
└── screenshots/         # エビデンス出力先（.gitignore済み）
```

## テストケースの命名

- ファイル名: `tc{番号}-{kebab-case-説明}.spec.ts`
- テスト仕様書: `docs/08-test/manual-e2e-spec.md` のTC番号に対応

## スクリーンショット（エビデンス）のルール

- MUST: `takeEvidence(page, tcId, step, description)` を使う
- MUST: 各ステップの**決定的な瞬間**を撮る（結果が画面に反映されたタイミング）
  - 操作前: フォーム入力完了・送信直前の状態
  - 操作後: 状態変化が画面に反映された直後
- MUST: 状態の変化が分かるスクショを撮る（例: カウンターが 0→1 に増えた瞬間）
- ファイル名規則: `{tcId}-step{番号(2桁)}-{description}.png`

### 良い例

```typescript
// 招待送信後 → 一覧に追加されたことを確認してから撮る
await expect(page.getByText(testEmail)).toBeVisible();
await takeEvidence(page, TC, 2, 'user-invited-in-list');

// フォーム入力完了 → 送信直前に撮る
await page.getByLabel('表示名').fill(testDisplayName);
await page.getByLabel('パスワード').fill(testPassword);
await takeEvidence(page, TC, 5, 'activation-form-filled');
```

### 悪い例

```typescript
// ページ遷移直後で中身が読み込まれる前に撮ってしまう
await page.goto('/admin/users');
await takeEvidence(page, TC, 1, 'user-management'); // ❌ ローディング中かも
```

## 認証ヘルパー

- アプリはアクセストークンをメモリ管理（localStorage未使用）
- MUST: `loginViaUI()` でブラウザ操作によりログインする
- `loginViaApi()` + localStorage は使わない

## MailHog メール取得

- MailHog API: `http://localhost:8025/api/v2/search?kind=to&query={email}`
- MUST: メール本文は Quoted-Printable エンコーディングのためデコードが必要
  ```typescript
  const decodedBody = rawBody.replace(/=\r?\n/g, '').replace(/=3D/g, '=');
  ```
- MailHog の Web UI (`http://localhost:8025`) を `page.goto()` で開いてスクショ可

## テスト前の環境リセット

- フルフローテスト前は `e2e/helpers/cleanup.ts` の `resetTestEnvironment()` を使用
- 管理者（admin@company.com）以外のユーザーとMailHogメールを全削除

## 実行コマンド

```bash
cd frontend
npm run test:e2e              # 全テスト（ヘッドレス）
npm run test:e2e:headed       # ブラウザ表示
npm run test:e2e:ui           # UI モード（ステップ確認）
npx playwright test tc01      # 個別テスト
# PowerShell でスローモーション:
$env:SLOW_MO="1500"; npx playwright test --headed --workers=1
```

## タイムアウト

- フルフローテスト（複数ステップ）: `test.setTimeout(60000)` を設定
- 個別の待機: `{ timeout: 10000 }` をページ遷移の expect に付与
