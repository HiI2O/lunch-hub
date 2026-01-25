# Codemap更新

コードベース構造を分析し、アーキテクチャドキュメントを更新：

1. すべてのソースファイルをスキャンしてインポート、エクスポート、依存関係を取得
2. 以下のフォーマットでトークン効率の良いcodemapを生成:
   - codemaps/architecture.md - 全体アーキテクチャ
   - codemaps/backend.md - バックエンド構造
   - codemaps/frontend.md - フロントエンド構造
   - codemaps/data.md - データモデルとスキーマ

3. 前バージョンからの差分パーセンテージを計算
4. 変更が30%を超える場合、更新前にユーザー承認をリクエスト
5. 各codemapに新しさのタイムスタンプを追加
6. レポートを.reports/codemap-diff.txtに保存

分析にはTypeScript/Node.jsを使用。実装詳細ではなく、高レベルの構造にフォーカス。
