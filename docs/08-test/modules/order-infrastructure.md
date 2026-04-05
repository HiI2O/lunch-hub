# Order Infrastructure Layer テスト仕様

Order モジュール Infrastructure 層（Mapper・TypeORM リポジトリ）のテスト仕様書。

設計ドキュメントから導出:
- [Order モジュール設計](../../02-design/modules/order.md)
- [テスト戦略 > Infrastructure層](../strategy.md)

---

## Mapper

### OrderMapper

設計根拠: [テスト戦略 > Mapper テスト](../strategy.md)

ドメインモデル ↔ 永続化モデルの双方向変換の正確性を検証する。

#### toDomain()

- [ ] 正常: `OrderEntity` → `Order` ドメインオブジェクトに変換される
- [ ] 正常: `id`, `order_date`, `reservation_ids`, `status`, `total_count`, `created_at`, `placed_at`, `version` が正しくマッピングされる
- [ ] 正常: `Order.reconstruct` が正しいパラメータで呼ばれる
- [ ] 正常: `placed_at` が `null` の場合も正しく変換される（PENDING 状態）

#### toPersistence()

- [ ] 正常: `Order` → `Partial<OrderEntity>` に変換される
- [ ] 正常: `orderDate` → `order_date`, `totalCount` → `total_count` のカラム名変換が正しい
- [ ] 正常: `status` はドメインオブジェクトの `.value` プロパティから取得される
- [ ] 正常: `reservationIds` はスプレッド演算子で新しい配列にコピーされる（イミュータビリティ）
- [ ] 正常: `placedAt` → `placed_at` のマッピングが正しい（`null` を含む）

---

## リポジトリ（TypeORM）

### TypeormOrderRepository

設計根拠: [Order設計 > IOrderRepository](../../02-design/modules/order.md)

外部依存（TypeORM Repository, OrderMapper）をモックし、リポジトリのアダプタロジックを検証する。

#### save()

- [ ] 正常: `OrderMapper.toPersistence` でエンティティに変換し `repo.save` を呼ぶ

#### findById()

- [ ] 正常: 存在する ID → `OrderMapper.toDomain` でドメインオブジェクトを返す
- [ ] 正常: 存在しない ID → `null` を返す

#### findByDate()

- [ ] 正常: 存在する日付 → ドメインオブジェクトを返す
- [ ] 正常: 存在しない日付 → `null` を返す
- [ ] 正常: `order_date` で検索される

#### findByDateRange()

- [ ] 正常: 期間内の注文一覧を返す
- [ ] 正常: `Between(from, to)` で期間フィルタが適用される
- [ ] 正常: 結果は `order_date ASC` でソートされる
- [ ] 正常: 該当なし → 空配列を返す

---

## テスト対象外（理由付き）

| 対象 | 理由 |
|------|------|
| TypeORM のクエリ実行・DB接続 | フレームワークが保証。テストでは TypeORM Repository をモック |
| VO の生成・バリデーション | Domain 層テスト（`order-status.spec.ts`）で検証済み |
| `Order.reconstruct` の内部ロジック | Domain 層テスト（`order.spec.ts`）で検証済み。Mapper テストは引数の正しさを確認 |
| TypeORM リポジトリの DB エラー伝播 | TypeORM がスローする例外はそのまま NestJS のエラーハンドリングに委ねる。アダプタ層でキャッチ・変換するロジックがないため、テスト対象外 |
