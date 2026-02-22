---
description: コードベース構造を分析しアーキテクチャcodemapを更新
allowed-tools: Read, Write, Edit, Bash(cd:*), Bash(find:*), Grep, Glob
---

# Codemap更新

## 手順

1. すべてのソースファイルをスキャンしてインポート・エクスポート・依存関係を取得
2. 以下のcodemapを生成/更新:
   - `codemaps/architecture.md` — 全体アーキテクチャ
   - `codemaps/backend.md` — バックエンド構造
   - `codemaps/frontend.md` — フロントエンド構造
   - `codemaps/data.md` — データモデルとスキーマ
3. 前バージョンからの差分パーセンテージを計算
4. 変更が30%を超える場合、更新前にユーザー承認をリクエスト
5. 各codemapにタイムスタンプを追加

実装詳細ではなく、高レベルの構造にフォーカスすること。
