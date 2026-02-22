---
description: DDD/TDD/セキュリティ観点でのコードレビュー
allowed-tools: Read, Grep, Glob, Bash(git:*), Bash(cd:*)
argument-hint: [HEAD~1 | main | コミットSHA]
---

# コードレビュー

## コンテキスト

- 変更ファイル: !`git diff --name-only HEAD~1`
- 差分: !`git diff HEAD~1`

$ARGUMENTS が指定された場合はそのリビジョンとの差分を使うこと。

## レビュー観点

### DDD チェック (CRITICAL)
- domain/ に NestJS・TypeORM 等の外部依存がないか
- プリミティブ型が直接使われていないか（Value Object でラップすべき）
- application 層がリポジトリの具体実装に依存していないか
- 集約の境界は適切か

### セキュリティ (CRITICAL)
- ハードコードされた認証情報・APIキー・トークン
- SQLインジェクション・XSS脆弱性
- 入力バリデーションの欠落

### TDD チェック (HIGH)
- 新規コードにテストがあるか
- テストカバレッジは80%以上か
- テスト名がビジネス要件を表現しているか

### コード品質 (MEDIUM)
- 50行を超える関数
- 800行を超えるファイル
- 4レベルを超えるネスト
- `any` 型の使用
- イミュータブルパターンの違反

## 出力形式

各項目を以下で評価:
- 🔴 **CRITICAL**: 必ず修正
- 🟡 **HIGH/MEDIUM**: 改善推奨
- 🟢 **OK**: 問題なし

ファイルパスと行番号を含めること。
