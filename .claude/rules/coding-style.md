# コーディングスタイル

## イミュータビリティ（重要）

常に新しいオブジェクトを作成し、決してミューテーションしない：

```javascript
// 悪い例: ミューテーション
function updateUser(user, name) {
  user.name = name  // ミューテーション！
  return user
}

// 良い例: イミュータビリティ
function updateUser(user, name) {
  return {
    ...user,
    name
  }
}
```

## ファイル構成

多くの小さなファイル > 少数の大きなファイル：
- 高凝集、低結合
- 通常200-400行、最大800行
- 大きなコンポーネントからユーティリティを抽出
- 型別ではなく、機能/ドメイン別に整理

## エラーハンドリング

常に包括的にエラーを処理：

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('詳細でユーザーフレンドリーなメッセージ')
}
```

## 入力バリデーション

常にユーザー入力を検証：

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

const validated = schema.parse(input)
```

## コード品質チェックリスト

作業完了前に確認：
- [ ] コードが読みやすく、適切な命名がされている
- [ ] 関数が小さい（<50行）
- [ ] ファイルが焦点を絞っている（<800行）
- [ ] 深いネストがない（>4レベル）
- [ ] 適切なエラーハンドリング
- [ ] console.log文がない
- [ ] ハードコードされた値がない
- [ ] ミューテーションがない（イミュータブルパターンを使用）
