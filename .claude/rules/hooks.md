# フックシステム

## フックの種類

- **PreToolUse**: ツール実行前（バリデーション、パラメータ変更）
- **PostToolUse**: ツール実行後（自動フォーマット、チェック）
- **Stop**: セッション終了時（最終検証）

## 現在のフック（~/.claude/settings.json 内）

### PreToolUse
- **tmuxリマインダー**: 長時間実行コマンド（npm, pnpm, yarn, cargo等）にtmuxを提案
- **git pushレビュー**: プッシュ前にZedでレビューを開く
- **docブロッカー**: 不要な.md/.txtファイルの作成をブロック

### PostToolUse
- **PR作成**: PR URLとGitHub Actionsステータスをログ
- **Prettier**: 編集後にJS/TSファイルを自動フォーマット
- **TypeScriptチェック**: .ts/.tsxファイル編集後にtscを実行
- **console.log警告**: 編集ファイル内のconsole.logについて警告

### Stop
- **console.log監査**: セッション終了前に全変更ファイルのconsole.logをチェック

## 自動承認権限

慎重に使用：
- 信頼できる明確な計画には有効化
- 探索的作業には無効化
- dangerously-skip-permissionsフラグは絶対に使用しない
- 代わりに `~/.claude.json` で `allowedTools` を設定

## TodoWriteベストプラクティス

TodoWriteツールの使用目的：
- 複数ステップタスクの進捗追跡
- 指示の理解確認
- リアルタイムの軌道修正
- 詳細な実装ステップの表示

Todoリストで判明すること：
- 順序が間違っているステップ
- 欠落している項目
- 不要な追加項目
- 粒度の誤り
- 要件の誤解
