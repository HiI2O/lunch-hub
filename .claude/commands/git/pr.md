---
description: PRブランチ作成・push・PR作成を一括実行
allowed-tools: Bash(git:*), Bash(gh:*)
---

# PR 作成

## コンテキスト

- ステータス: !`git status`
- ブランチ: !`git branch --show-current`
- mainからの差分コミット: !`git log --oneline main..HEAD`
- mainからの変更ファイル: !`git diff --stat main...HEAD`

## 手順

1. 現在のブランチが main の場合、適切なブランチ名を提案して作成する
   - 命名規則: `feature/xxx`, `fix/xxx`, `refactor/xxx`, `docs/xxx`
2. 全コミット履歴（`git diff main...HEAD`）を分析し、包括的なサマリーを作成
3. PRタイトル（日本語、70文字以内）と本文を提案する
4. ユーザーの承認後に以下を実行:
   - `git push -u origin <branch>`
   - `gh pr create --title "..." --body "..."`

## PR本文テンプレート

```
## 概要
- 変更の要約（箇条書き）

## 変更内容
- 具体的な変更点

## テストプラン
- [ ] テスト項目
```

## 禁止事項

- NEVER 確認なしに push や PR 作成を実行してはいけない
- NEVER main ブランチに直接 push してはいけない
