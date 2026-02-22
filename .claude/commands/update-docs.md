---
description: package.jsonと.env.exampleからドキュメントを同期更新
allowed-tools: Read, Write, Edit, Grep, Glob
---

# ドキュメント更新

## 手順

1. `package.json` の scripts セクションを読み取り、スクリプト参照テーブルを生成
2. `.env.example` を読み取り、全環境変数を抽出・文書化
3. 以下を生成/更新:
   - `docs/CONTRIB.md` — 開発ワークフロー、利用可能なスクリプト、環境セットアップ
   - `docs/RUNBOOK.md` — デプロイ手順、監視、一般的な問題と修正
4. 古くなったドキュメント（90日以上未更新）を特定しリスト表示
5. 差分サマリーを表示

真実のソース: `package.json` と `.env.example`
