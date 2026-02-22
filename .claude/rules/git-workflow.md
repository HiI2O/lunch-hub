# Git ワークフロー

## ブランチ

- GitHub Flow: main → feature ブランチ → PR → マージ
- 命名: `feature/xxx`, `fix/xxx`, `refactor/xxx`, `docs/xxx`

## コミットメッセージ

- 言語: 日本語
- 形式: `<type>: <emoji> <subject>`
- タイプ: feat(✨), fix(🐛), docs(📝), style(💄), refactor(♻️), test(✅), chore(🔧)
- 例: `feat: ✨ ログイン画面の実装`

## PR 作成

1. 全コミット履歴を分析（`git diff main...HEAD`）
2. 包括的なサマリーを作成
3. TODO 付きテストプランを記載
4. 新規ブランチは `-u` フラグ付きで push
