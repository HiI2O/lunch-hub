---
paths:
  - "frontend/**/*.tsx"
  - "frontend/**/*.ts"
---
# React コンポーネント規約

## コンポーネント設計

- MUST: 関数コンポーネント + hooks のみ（class コンポーネント禁止）
- MUST: Props は型定義する（`type XxxProps = { ... }`）
- SHOULD: 1 ファイル 1 エクスポートコンポーネント

## 状態管理

- ローカル状態: `useState` / `useReducer`
- フォーム: controlled components
- SHOULD: 副作用の cleanup を忘れない（`useEffect` の return）

## ルーティング

- react-router-dom v7 を使用
- ページコンポーネントは `pages/` 配下に配置
