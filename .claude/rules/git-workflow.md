# Git ワークフロー

## コミットメッセージ形式

```
<type>: <description>

<optional body>
```

タイプ: feat, fix, refactor, docs, test, chore, perf, ci

注: ~/.claude/settings.json でグローバルに帰属表示は無効化。

## プルリクエストワークフロー

PR作成時：
1. 全コミット履歴を分析（最新コミットだけでなく）
2. `git diff [base-branch]...HEAD` で全変更を確認
3. 包括的なPRサマリーを作成
4. TODOを含むテストプランを記載
5. 新規ブランチの場合は `-u` フラグ付きでプッシュ

## 機能実装ワークフロー

1. **まず計画**
   - **planner** エージェントで実装計画を作成
   - 依存関係とリスクを特定
   - フェーズに分解

2. **TDDアプローチ**
   - **tdd-guide** エージェントを使用
   - まずテストを書く（RED）
   - テストをパスする実装（GREEN）
   - リファクタリング（IMPROVE）
   - 80%以上のカバレッジを確認

3. **コードレビュー**
   - コード作成直後に **code-reviewer** エージェントを使用
   - CRITICALとHIGHの問題に対処
   - 可能な限りMEDIUMの問題も修正

4. **コミット & プッシュ**
   - 詳細なコミットメッセージ
   - Conventional Commits形式に従う
