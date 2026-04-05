# Reservation Presentation DTO テスト仕様

Reservation モジュール Presentation 層（DTO バリデーション）のテスト仕様書。

設計ドキュメントから導出:
- [Reservation モジュール設計](../../02-design/modules/reservation.md)
- [API設計 > 予約管理API / 係専用API](../../03-api-design.md)
- [テスト戦略 > Presentation層](../strategy.md)

---

## DTO バリデーション

### CreateReservationRequestDto

設計根拠: [API設計 > 予約作成](../../03-api-design.md)

リクエストボディ: `{ reservationDate: string, paymentMethod: string, ticketId?: string }`

#### reservationDate

- [ ] 正常: `"2026-04-10"`（YYYY-MM-DD 形式）→ バリデーション通過
- [ ] 異常: `"04-10-2026"`（不正な日付形式）→ バリデーションエラー
- [ ] 異常: `"2026/04/10"`（スラッシュ区切り）→ バリデーションエラー
- [ ] 異常: `"not-a-date"` → バリデーションエラー
- [ ] 異常: `""` 空文字 → バリデーションエラー（空でない文字列）
- [ ] 異常: `null` / 未指定 → バリデーションエラー（必須）

#### paymentMethod

- [ ] 正常: `"TICKET"` → バリデーション通過
- [ ] 正常: `"CASH"` → バリデーション通過
- [ ] 正常: `"INVALID_VALUE"` → バリデーション通過（DTO では `@IsString` + `@IsNotEmpty` のみ。不正値はドメイン層 `PaymentMethod` VO で拒否される）
- [ ] 異常: `""` 空文字 → バリデーションエラー（空でない文字列）
- [ ] 異常: `null` / 未指定 → バリデーションエラー（必須）

#### ticketId

- [ ] 正常: UUID 文字列 → バリデーション通過
- [ ] 正常: 未指定 → バリデーション通過（オプショナル）
- [ ] 異常: `""` 空文字（指定された場合）→ バリデーション通過（`@IsOptional` + `@IsString`）

---

### ModifyReservationRequestDto

設計根拠: [API設計 > 予約変更](../../03-api-design.md)

リクエストボディ: `{ paymentMethod: string, ticketId?: string }`

#### paymentMethod

- [ ] 正常: `"CASH"` → バリデーション通過
- [ ] 正常: `"TICKET"` → バリデーション通過
- [ ] 正常: `"INVALID_VALUE"` → バリデーション通過（DTO では `@IsString` + `@IsNotEmpty` のみ。不正値はドメイン層で拒否）
- [ ] 異常: `""` 空文字 → バリデーションエラー（空でない文字列）
- [ ] 異常: `null` / 未指定 → バリデーションエラー（必須）

#### ticketId

- [ ] 正常: UUID 文字列 → バリデーション通過
- [ ] 正常: 未指定 → バリデーション通過（オプショナル）

---

### CreateGuestRequestDto

設計根拠: [API設計 > ゲスト作成](../../03-api-design.md)

リクエストボディ: `{ guestName: string }`

#### guestName

- [ ] 正常: `"来客A様"` → バリデーション通過
- [ ] 異常: `""` 空文字 → バリデーションエラー（空でない文字列）
- [ ] 異常: `null` / 未指定 → バリデーションエラー（必須）
- [ ] 異常: 数値 `123` → バリデーションエラー（文字列型）

---

### CreateGuestReservationRequestDto

設計根拠: [API設計 > ゲスト予約作成](../../03-api-design.md)

リクエストボディ: `{ guestId: string, reservationDate: string }`

#### guestId

- [ ] 正常: UUID 文字列 → バリデーション通過
- [ ] 異常: `""` 空文字 → バリデーションエラー（空でない文字列）
- [ ] 異常: `null` / 未指定 → バリデーションエラー（必須）

#### reservationDate

- [ ] 正常: `"2026-04-10"`（YYYY-MM-DD 形式）→ バリデーション通過
- [ ] 異常: `"04-10-2026"`（不正な日付形式）→ バリデーションエラー
- [ ] 異常: `"not-a-date"` → バリデーションエラー
- [ ] 異常: `""` 空文字 → バリデーションエラー（空でない文字列）
- [ ] 異常: `null` / 未指定 → バリデーションエラー（必須）

---

## テスト対象外（理由付き）

| 対象 | 理由 |
|------|------|
| class-validator デコレータの動作そのもの | フレームワークが保証。DTO テストはビジネスルールの反映を確認 |
| paymentMethod の値の妥当性（TICKET/CASH 以外の拒否） | DTO では `@IsString` + `@IsNotEmpty` のみ。値の妥当性はドメイン層（PaymentMethod VO）で検証 |
| Controller のリクエスト処理 | Controller テスト（`reservation.controller.spec.ts` 等）で検証済み |
