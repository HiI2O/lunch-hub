---
description: TDDのRed-Green-Refactorサイクルを強制実行
allowed-tools: Read, Write, Edit, Bash(cd:*), Bash(npm:*), Bash(npx:*), Grep, Glob
argument-hint: [対象機能の説明]
---

# TDD サイクル: $ARGUMENTS

## コンテキスト

- テスト状況: !`cd backend && npx jest --passWithNoTests --silent 2>&1 | tail -5`

## 手順（厳守）

### 🔴 RED
1. 要件を分析し、インターフェース（型/DTO）を定義
2. **失敗するテストを先に書く**（`*.spec.ts`）
3. テストを実行して **失敗を確認**: `npx jest --testPathPattern="対象"`
4. NEVER Red Phase でプロダクションコードを書いてはいけない

### 🟢 GREEN
5. テストを通す **最小限の実装** を書く
6. テストを実行して **全てパス** を確認
7. NEVER この段階でリファクタリングしてはいけない

### 🔵 REFACTOR
8. テストが通る状態を維持しながらリファクタリング
9. 各リファクタリング後にテスト再実行
10. DDD原則（domain/にインフラ依存なし、VO使用）に沿っているか確認

## 完了条件

- 全テストがパス
- カバレッジ80%以上: `npx jest --coverage --collectCoverageFrom="対象パス"`
- domain/ に外部依存を持ち込んでいない
