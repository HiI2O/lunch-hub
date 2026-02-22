---
description: Conventional Commitsに従うコミット作成（日本語）
allowed-tools: Bash(git:*)
---

# コミット作成

## コンテキスト

- ステータス: !`git status`
- 差分: !`git diff HEAD`
- ブランチ: !`git branch --show-current`
- 直近コミット: !`git log --oneline -5`

## コミットルール

@.claude/rules/git-workflow.md

## 手順

1. 上記の差分を分析し、変更内容を把握する
2. コミットメッセージの候補を **3つ** 提示する
3. ユーザーが選択または修正を指示するまで待つ
4. 選択されたメッセージでコミットを実行する

## コミットメッセージ形式

- `<type>: <emoji> <subject>`（日本語）
- type: feat(✨), fix(🐛), docs(📝), style(💄), refactor(♻️), test(✅), chore(🔧)
- 例: `feat: ✨ ログイン画面の実装`

## 禁止事項

- NEVER 確認なしに git commit を実行してはいけない
- NEVER git add を勝手に実行してはいけない（ステージ済みと仮定する）
- NEVER コミットメッセージを英語にしてはいけない
