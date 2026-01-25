---
description: Playwrightを使用してE2Eテストを生成・実行。テストジャーニーを作成し、テストを実行し、スクリーンショット/ビデオ/トレースをキャプチャし、アーティファクトをアップロード。
---

# E2Eコマンド

このコマンドは **e2e-runner** エージェントを呼び出して、Playwrightを使用したE2Eテストの生成、メンテナンス、実行を行います。

## このコマンドの機能

1. **テストジャーニー生成** - ユーザーフロー用のPlaywrightテストを作成
2. **E2Eテスト実行** - 複数ブラウザでテストを実行
3. **アーティファクトキャプチャ** - 失敗時のスクリーンショット、ビデオ、トレース
4. **結果アップロード** - HTMLレポートとJUnit XML
5. **不安定なテストの特定** - 不安定なテストを隔離

## 使用タイミング

以下の場合に `/e2e` を使用:
- 重要なユーザージャーニーのテスト（ログイン、取引、支払い）
- 複数ステップのフローがE2Eで動作することを確認
- UI操作とナビゲーションのテスト
- フロントエンドとバックエンドの統合を検証
- プロダクションデプロイの準備

## 動作方法

e2e-runnerエージェントは以下を行います：

1. **ユーザーフローを分析**してテストシナリオを特定
2. Page Object Modelパターンを使用して**Playwrightテストを生成**
3. 複数ブラウザで**テストを実行**（Chrome, Firefox, Safari）
4. スクリーンショット、ビデオ、トレースで**失敗をキャプチャ**
5. 結果とアーティファクトの**レポートを生成**
6. **不安定なテストを特定**して修正を推奨

## 使用例

```
ユーザー: /e2e マーケット検索と表示フローをテスト

エージェント (e2e-runner):
# E2Eテスト生成: マーケット検索と表示フロー

## 特定されたテストシナリオ

**ユーザージャーニー:** マーケット検索 → 結果表示 → マーケットクリック → 詳細表示

**テストカバレッジ:**
1. マーケットページにナビゲート
2. セマンティック検索を実行
3. 検索結果を確認
4. 最初の結果をクリック
5. マーケット詳細ページのロードを確認
6. チャートがレンダリングされることを確認
```

## テストアーティファクト

テスト実行時に以下のアーティファクトがキャプチャされます：

**すべてのテスト:**
- タイムラインと結果を含むHTMLレポート
- CI統合用JUnit XML

**失敗時のみ:**
- 失敗状態のスクリーンショット
- テストのビデオ録画
- デバッグ用トレースファイル（ステップバイステップのリプレイ）
- ネットワークログ
- コンソールログ

## アーティファクトの表示

```bash
# ブラウザでHTMLレポートを表示
npx playwright show-report

# 特定のトレースファイルを表示
npx playwright show-trace artifacts/trace-abc123.zip

# スクリーンショットはartifacts/ディレクトリに保存
open artifacts/search-results.png
```

## ブラウザ設定

デフォルトで複数ブラウザでテストを実行：
- ✅ Chromium（デスクトップChrome）
- ✅ Firefox（デスクトップ）
- ✅ WebKit（デスクトップSafari）
- ✅ モバイルChrome（オプション）

ブラウザ調整は `playwright.config.ts` で設定。

## CI/CD統合

CIパイプラインに追加：

```yaml
# .github/workflows/e2e.yml
- name: Playwrightインストール
  run: npx playwright install --with-deps

- name: E2Eテスト実行
  run: npx playwright test

- name: アーティファクトアップロード
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## ベストプラクティス

**すべきこと:**
- ✅ 保守性のためPage Object Modelを使用
- ✅ セレクターにdata-testid属性を使用
- ✅ 任意のタイムアウトではなくAPIレスポンスを待つ
- ✅ 重要なユーザージャーニーをE2Eでテスト
- ✅ mainにマージする前にテストを実行
- ✅ テスト失敗時にアーティファクトをレビュー

**すべきでないこと:**
- ❌ 脆弱なセレクターを使用（CSSクラスは変更される可能性あり）
- ❌ 実装詳細をテスト
- ❌ プロダクションに対してテストを実行
- ❌ 不安定なテストを無視
- ❌ 失敗時にアーティファクトレビューをスキップ
- ❌ すべてのエッジケースをE2Eでテスト（ユニットテストを使用）

## 重要な注意事項

**CRITICAL:**
- 実際のお金が関わるE2Eテストはtestnet/stagingでのみ実行
- プロダクションに対して取引テストを実行しない
- 金融テストには `test.skip(process.env.NODE_ENV === 'production')` を設定
- 少額のテスト資金のみを持つテストウォレットを使用

## 他のコマンドとの統合

- `/plan` を使用してテストすべき重要なジャーニーを特定
- `/tdd` を使用してユニットテスト（より高速、より粒度が細かい）
- `/e2e` を使用して統合とユーザージャーニーテスト
- `/code-review` を使用してテスト品質を確認

## 関連エージェント

このコマンドは以下にある `e2e-runner` エージェントを呼び出します：
`~/.claude/agents/e2e-runner.md`

## クイックコマンド

```bash
# すべてのE2Eテストを実行
npx playwright test

# 特定のテストファイルを実行
npx playwright test tests/e2e/markets/search.spec.ts

# headedモードで実行（ブラウザを表示）
npx playwright test --headed

# テストをデバッグ
npx playwright test --debug

# テストコードを生成
npx playwright codegen http://localhost:3000

# レポートを表示
npx playwright show-report
```
