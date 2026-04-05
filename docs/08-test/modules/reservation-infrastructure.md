# Reservation Infrastructure Layer テスト仕様

Reservation モジュール Infrastructure 層（TypeORM リポジトリ）のテスト仕様書。

設計ドキュメントから導出:
- [Reservation モジュール設計](../../02-design/modules/reservation.md)
- [テスト戦略 > Infrastructure層](../strategy.md)

---

## リポジトリ（TypeORM）

### TypeormReservationRepository

設計根拠: [Reservation設計 > IReservationRepository](../../02-design/modules/reservation.md)

外部依存（TypeORM Repository, ReservationMapper）をモックし、リポジトリのアダプタロジックを検証する。

#### save()

- [ ] 正常: `ReservationMapper.toPersistence` でエンティティに変換し `repo.save` を呼ぶ

#### findById()

- [ ] 正常: 存在する ID → `ReservationMapper.toDomain` でドメインオブジェクトを返す
- [ ] 正常: 存在しない ID → `null` を返す

#### findByUserId()

- [ ] 正常: ユーザー ID のみ指定 → 該当ユーザーの全予約を返す
- [ ] 正常: `from` + `to` 指定 → `Between(from, to)` で期間フィルタが適用される
- [ ] 正常: `status` 指定 → ステータスフィルタが適用される
- [ ] 正常: `from` + `to` + `status` 全指定 → 両方のフィルタが適用される
- [ ] 正常: 結果は `reservation_date ASC` でソートされる
- [ ] 正常: 該当なし → 空配列を返す

#### findByDate()

- [ ] 正常: 指定日の予約一覧を返す（CANCELLED 除外）
- [ ] 正常: `status: Not(Equal('CANCELLED'))` 条件が適用される
- [ ] 正常: 結果は `created_at ASC` でソートされる
- [ ] 正常: 該当なし → 空配列を返す

#### findByUserIdAndDate()

- [ ] 正常: ユーザー ID + 日付で一致する予約を返す（CANCELLED 除外）
- [ ] 正常: 該当なし → `null` を返す

#### findCalendarData()

- [ ] 正常: `user_id` フィルタが適用される（指定ユーザーの予約のみ返す）
- [ ] 正常: 年月指定でその月の全予約を返す（CANCELLED 除外）
- [ ] 正常: 月初日と月末日が正しく計算される（例: 2月 → 28日 or 29日）
- [ ] 正常: `Between(startDate, endDate)` で期間フィルタが適用される
- [ ] 正常: 該当なし → 空配列を返す

---

### TypeormGuestRepository

設計根拠: [Reservation設計 > IGuestRepository](../../02-design/modules/reservation.md)

外部依存（TypeORM Repository, GuestMapper）をモックし、リポジトリのアダプタロジックを検証する。

#### save()

- [ ] 正常: `GuestMapper.toPersistence` でエンティティに変換し `repo.save` を呼ぶ

#### findById()

- [ ] 正常: 存在する ID → `GuestMapper.toDomain` でドメインオブジェクトを返す
- [ ] 正常: 存在しない ID → `null` を返す

#### findByVisitDate()

- [ ] 正常: 指定日に訪問するゲスト一覧を返す
- [ ] 正常: 該当なし → 空配列を返す

---

## テスト対象外（理由付き）

| 対象 | 理由 |
|------|------|
| TypeORM のクエリ実行・DB接続 | フレームワークが保証。テストでは TypeORM Repository をモック |
| Mapper の変換ロジック詳細 | Mapper のユニットテスト（`reservation.mapper.spec.ts`, `guest.mapper.spec.ts`）で検証済み |
| CANCELLED 除外のビジネスルール判断 | ドメイン層の責務。リポジトリはクエリ条件への反映を検証 |
| TypeORM リポジトリの DB エラー伝播 | TypeORM がスローする例外はそのまま NestJS のエラーハンドリングに委ねる。アダプタ層でキャッチ・変換するロジックがないため、テスト対象外 |
