# Ticket Infrastructure Layer テスト仕様

Ticket モジュール Infrastructure 層（Mapper・TypeORM リポジトリ）のテスト仕様書。

設計ドキュメントから導出:
- [Ticket モジュール設計](../../02-design/modules/ticket.md)
- [テスト戦略 > Infrastructure層](../strategy.md)

---

## Mapper

### TicketMapper

設計根拠: [テスト戦略 > Mapper テスト](../strategy.md)

ドメインモデル ↔ 永続化モデルの双方向変換の正確性を検証する。

#### toDomain()

- [ ] 正常: `TicketEntity` → `Ticket` ドメインオブジェクトに変換される
- [ ] 正常: `id`, `owner_id`, `remaining_count`, `status`, `purchase_date`, `created_at`, `version` が正しくマッピングされる
- [ ] 正常: `Ticket.reconstruct` が正しいパラメータで呼ばれる

#### toPersistence()

- [ ] 正常: `Ticket` → `Partial<TicketEntity>` に変換される
- [ ] 正常: `id` → `id`, `ownerId` → `owner_id`, `remainingCount` → `remaining_count` のカラム名変換が正しい
- [ ] 正常: `status` はドメインオブジェクトの `.value` プロパティから取得される

---

### TicketPurchaseReservationMapper

設計根拠: [テスト戦略 > Mapper テスト](../strategy.md)

#### toDomain()

- [ ] 正常: `TicketPurchaseReservationEntity` → `TicketPurchaseReservation` ドメインオブジェクトに変換される
- [ ] 正常: `id`, `user_id`, `purchase_date`, `quantity`, `status`, `ticket_id`, `created_at`, `version` が正しくマッピングされる
- [ ] 正常: `TicketPurchaseReservation.reconstruct` が正しいパラメータで呼ばれる

#### toPersistence()

- [ ] 正常: `TicketPurchaseReservation` → `Partial<TicketPurchaseReservationEntity>` に変換される
- [ ] 正常: `quantity` は `domain.quantity.getSets()` から取得される（VO → プリミティブ変換）
- [ ] 正常: `status` は `domain.status.value` から取得される
- [ ] 正常: `userId` → `user_id`, `purchaseDate` → `purchase_date`, `ticketId` → `ticket_id` のカラム名変換が正しい

---

## リポジトリ（TypeORM）

### TypeormTicketRepository

設計根拠: [Ticket設計 > ITicketRepository](../../02-design/modules/ticket.md)

外部依存（TypeORM Repository, TicketMapper）をモックし、リポジトリのアダプタロジックを検証する。

#### save()

- [ ] 正常: `TicketMapper.toPersistence` でエンティティに変換し `repo.save` を呼ぶ

#### findById()

- [ ] 正常: 存在する ID → `TicketMapper.toDomain` でドメインオブジェクトを返す
- [ ] 正常: 存在しない ID → `null` を返す

#### findByOwnerId()

- [ ] 正常: 所有者 ID に紐づくチケット一覧を返す
- [ ] 正常: 結果は `created_at DESC` でソートされる
- [ ] 正常: 該当なし → 空配列を返す

---

### TypeormTicketPurchaseReservationRepository

設計根拠: [Ticket設計 > ITicketPurchaseReservationRepository](../../02-design/modules/ticket.md)

外部依存（TypeORM Repository, TicketPurchaseReservationMapper）をモックし、リポジトリのアダプタロジックを検証する。

#### save()

- [ ] 正常: `TicketPurchaseReservationMapper.toPersistence` でエンティティに変換し `repo.save` を呼ぶ

#### findById()

- [ ] 正常: 存在する ID → ドメインオブジェクトを返す
- [ ] 正常: 存在しない ID → `null` を返す

#### findByUserId()

- [ ] 正常: ユーザー ID に紐づく購入予約一覧を返す
- [ ] 正常: 結果は `created_at DESC` でソートされる
- [ ] 正常: 該当なし → 空配列を返す

#### findByPurchaseDate()

- [ ] 正常: 購入日に紐づく購入予約一覧を返す
- [ ] 正常: 結果は `created_at DESC` でソートされる
- [ ] 正常: 該当なし → 空配列を返す

---

## テスト対象外（理由付き）

| 対象 | 理由 |
|------|------|
| TypeORM のクエリ実行・DB接続 | フレームワークが保証。テストでは TypeORM Repository をモック |
| VO の生成・バリデーション | Domain 層テスト（`ticket-count.spec.ts`, `ticket-status.spec.ts` 等）で検証済み |
| `Ticket.reconstruct` / `TicketPurchaseReservation.reconstruct` の内部ロジック | Domain 層テストで検証済み。Mapper テストは引数の正しさを確認 |
| TypeORM リポジトリの DB エラー伝播 | TypeORM がスローする例外はそのまま NestJS のエラーハンドリングに委ねる。アダプタ層でキャッチ・変換するロジックがないため、テスト対象外 |
