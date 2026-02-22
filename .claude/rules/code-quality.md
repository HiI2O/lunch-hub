# コード品質ルール

## 型安全

- MUST: `any` 禁止。`unknown` + 型ガードを使う
- MUST: 関数の戻り値型を明示する（推論に頼らない）
- SHOULD: union 型で状態を表現し、boolean フラグを避ける

## イミュータビリティ

- MUST: オブジェクトや配列を直接変更しない（スプレッド演算子や `map`/`filter` を使う）
- MUST: ドメインエンティティのプロパティは `readonly` にする

## ファイル・関数サイズ

- ファイル: 800 行以下
- 関数: 50 行以下
- ネスト: 4 レベル以下（早期リターンで平坦化）

## 命名規則

- クラス/型: PascalCase
- 変数/関数: camelCase
- ファイル: kebab-case（例: `user-repository.ts`）
- テスト: `*.spec.ts`（ユニット）、`*.e2e-spec.ts`（E2E）
