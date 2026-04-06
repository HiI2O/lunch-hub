---
description: 手動テスト仕様書からPlaywright E2Eテストのひな形を生成
allowed-tools: Read, Write, Edit, Bash(cd:*), Bash(npx:*), Grep, Glob
argument-hint: <TC番号> <テスト名> (例: tc05 チケット購入と残高確認)
---

# E2E テスト生成: $ARGUMENTS

## 手順

### 1. 仕様の読み取り

1. `docs/08-test/manual-e2e-spec.md` を読み、指定されたTC番号のテストシナリオを取得する
2. テスト名、目的、前提条件、各ステップ（操作と期待結果）を把握する

### 2. 既存テストの確認

1. `frontend/e2e/` の既存テストファイルを確認し、重複がないことを確認する
2. `frontend/e2e/helpers/` の利用可能なヘルパーを確認する:
   - `auth.ts`: `loginViaUI()`, `loginAsAdmin()`
   - `screenshot.ts`: `takeEvidence()`
   - `cleanup.ts`: `resetTestEnvironment()`

### 3. テストファイル生成

以下のルールに従い `frontend/e2e/tc{番号}-{kebab-case}.spec.ts` を生成する:

#### 構造テンプレート

```typescript
import { test, expect } from '@playwright/test';
import { loginViaUI, loginAsAdmin } from './helpers/auth';  // 必要に応じて
import { takeEvidence } from './helpers/screenshot';
import { resetTestEnvironment } from './helpers/cleanup';

const TC = 'tc{番号}';

test.describe('TC-{番号}: {テスト名}', () => {
  test.beforeAll(async () => {
    await resetTestEnvironment();
  });

  test('{テストの概要}', async ({ page }) => {
    test.setTimeout(60000);  // フルフローテストの場合

    // --- ステップN: {操作の説明} ---
    // 操作を実行
    // expect で期待結果を検証
    // 決定的な瞬間でエビデンスを撮る
    await takeEvidence(page, TC, N, '{description}');
  });
});
```

#### MUST: スクリーンショットのルール

- 各ステップの**決定的な瞬間**を撮る
  - 操作前: フォーム入力完了・送信直前の状態
  - 操作後: 状態変化が画面に反映された直後（カウンター変化、バッジ表示、一覧への追加など）
- `takeEvidence(page, TC, ステップ番号, '説明')` を使う

#### MUST: MailHog メール取得時

```typescript
const rawBody = mailData.items[0].Content.Body;
const decodedBody = rawBody.replace(/=\r?\n/g, '').replace(/=3D/g, '=');
```

#### MUST: 認証

- ブラウザ操作でログイン: `loginViaUI()` または `loginAsAdmin()`
- localStorage は使わない（アプリはメモリでトークン管理）

### 4. 実行確認

1. テストを実行: `cd frontend && npx playwright test tc{番号} --reporter=list`
2. スクリーンショットが `frontend/e2e/screenshots/` に保存されたことを確認
3. 各ステップのエビデンスが「決定的な瞬間」を捉えているか確認

## 完了条件

- テストが全てパス
- 仕様書の各ステップに対応するスクリーンショットがある
- スクリーンショットが状態変化を明確に示している
