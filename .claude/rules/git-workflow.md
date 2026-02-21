# Git ワークフロー

## ブランチ戦略
- **GitHub Flow**: mainからfeatureブランチを作成、PRでマージ
- 命名: `feature/xxx`, `fix/xxx`, `refactor/xxx`, `docs/xxx`

## コミットメッセージ
- **言語**: 日本語
- **形式**: `<type>: <emoji> <subject>`
- **例**: `feat: ✨ ログイン画面の実装`
- **タイプ**: feat(✨), fix(🐛), docs(📝), style(💄), refactor(♻️), test(✅), chore(🔧)

注: ~/.claude/settings.json でグローバルに帰属表示は無効化。

## プルリクエストワークフロー

PR作成時：
1. 全コミット履歴を分析（最新コミットだけでなく）
2. `git diff [base-branch]...HEAD` で全変更を確認
3. 包括的なPRサマリーを作成
4. TODOを含むテストプランを記載
5. 新規ブランチの場合は `-u` フラグ付きでプッシュ
