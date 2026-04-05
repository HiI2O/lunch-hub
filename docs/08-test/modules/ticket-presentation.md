# Ticket Presentation Layer テスト仕様

Ticket モジュール Presentation 層（Controller / DTO）のテスト仕様書。

設計ドキュメントから導出:
- [Ticket モジュール設計](../../02-design/modules/ticket.md)
- [API設計 > チケット管理API](../../03-api-design.md)
- [テスト戦略 > Presentation層](../strategy.md)

---

## Controllers

### TicketController（一般ユーザー向け）

設計根拠: [API設計 > チケット管理API](../../03-api-design.md)

認証済みユーザーが自分のチケットを管理するエンドポイント群。

#### GET /api/tickets — 自分のチケット一覧取得

設計根拠: [Ticket設計 > GetMyTicketsUseCase](../../02-design/modules/ticket.md)

- [ ] 正常: `GetMyTicketsUseCase` にリクエストユーザーの ID を渡して呼び出す
- [ ] 正常: ユースケースの戻り値をレスポンスボディ `{ data: [...] }` として返す
- [ ] 正常: HTTP 200 を返す
- [ ] 認可: 全認証済みユーザー（GENERAL_USER, STAFF, ADMINISTRATOR）がアクセス可能
- [ ] 異常: 未認証リクエスト → 401 を返す

#### GET /api/tickets/:id — チケット詳細取得

設計根拠: [Ticket設計 > GetTicketDetailUseCase](../../02-design/modules/ticket.md)

- [ ] 正常: `GetTicketDetailUseCase` にチケット ID とリクエストユーザー ID を渡して呼び出す
- [ ] 正常: ユースケースの戻り値をレスポンスボディ `{ data: { ... } }` として返す
- [ ] 正常: HTTP 200 を返す
- [ ] 異常: 存在しないチケット ID → `RESOURCE_NOT_FOUND` / 404 を返す
- [ ] 異常: 他ユーザーのチケット ID → `PERMISSION_DENIED` / 403 を返す
- [ ] 異常: 未認証リクエスト → 401 を返す

#### POST /api/tickets/purchase — チケット購入予約

設計根拠: [API設計 > チケット購入予約](../../03-api-design.md), [Ticket設計 > CreateTicketPurchaseReservationUseCase](../../02-design/modules/ticket.md)

- [ ] 正常: `CreateTicketPurchaseReservationUseCase` にリクエストユーザー ID と DTO（quantity, purchaseDate）を渡して呼び出す
- [ ] 正常: レスポンスに `purchaseReservation` と `ticket` を含む `{ data: { ... } }` を返す
- [ ] 正常: HTTP 201 を返す
- [ ] 異常: NestJS ValidationPipe が DTO 不正を検出 → `VALIDATION_ERROR` / 400 を返す（個別のバリデーションルールは DTO 単体テストで検証）
- [ ] 異常: 未認証リクエスト → 401 を返す
- [ ] エラーマッピング: ユースケースが `DomainException` をスローした場合、適切な HTTP ステータスに変換される

#### DELETE /api/tickets/purchase/:id — チケット購入予約キャンセル

設計根拠: [API設計 > チケット購入予約キャンセル](../../03-api-design.md), [Ticket設計 > CancelTicketPurchaseReservationUseCase](../../02-design/modules/ticket.md)

> **Note**: API設計書では `purchases`（複数形）だが、実装（`ticket.controller.ts:70`）では `purchase`（単数形）。実装に合わせる。

- [ ] 正常: `CancelTicketPurchaseReservationUseCase` に購入予約 ID とリクエストユーザー ID を渡して呼び出す
- [ ] 正常: キャンセル結果 `{ data: { id, status: 'CANCELLED' } }` を返す
- [ ] 正常: HTTP 200 を返す
- [ ] 異常: 存在しない購入予約 ID → `RESOURCE_NOT_FOUND` / 404 を返す
- [ ] 異常: 他ユーザーの購入予約 → `PERMISSION_DENIED` / 403 を返す
- [ ] 異常: RECEIVED 状態の購入予約をキャンセル → 400 を返す（キャンセル不可）
- [ ] 異常: CANCELLED 状態の購入予約をキャンセル → 400 を返す（既にキャンセル済み）
- [ ] 異常: 未認証リクエスト → 401 を返す
- [ ] エラーマッピング: ユースケースが `DomainException` をスローした場合、適切な HTTP ステータスに変換される

---

### StaffTicketController（係・管理者向け）

設計根拠: [API設計 > チケット受取確認](../../03-api-design.md), [Ticket設計 > ReceiveTicketUseCase](../../02-design/modules/ticket.md)

#### POST /api/staff/tickets/:purchaseReservationId/receive — チケット受取確認

> **Note**: API設計書では `PUT /api/tickets/:id/receive` だが、実装（`staff-ticket.controller.ts:23`）では `POST /api/staff/tickets/:purchaseReservationId/receive`。パラメータも `purchaseReservationId`。実装に合わせる。

- [ ] 正常: `ReceiveTicketUseCase` に `purchaseReservationId` を渡して呼び出す
- [ ] 正常: 受取確認結果 `{ data: { id, status: 'RECEIVED' } }` を返す
- [ ] 正常: HTTP 200 を返す
- [ ] 認可: STAFF ロールでアクセス可能
- [ ] 認可: ADMINISTRATOR ロールでアクセス可能
- [ ] 認可: GENERAL_USER ロール → `PERMISSION_DENIED` / 403 を返す
- [ ] 異常: 存在しないチケット ID → `RESOURCE_NOT_FOUND` / 404 を返す
- [ ] 異常: 既に RECEIVED 状態のチケット → 400 を返す
- [ ] 異常: 未認証リクエスト → 401 を返す

---

## DTO バリデーション

### CreatePurchaseReservationRequestDto

設計根拠: [API設計 > チケット購入予約リクエスト](../../03-api-design.md), [Ticket設計 > TicketSetQuantity](../../02-design/modules/ticket.md)

リクエストボディ: `{ quantity: number, purchaseDate: string }`

#### quantity

- [ ] 正常: `1` → バリデーション通過
- [ ] 正常: 整数値 → バリデーション通過
- [ ] 境界値: 大きな値（例: `100`）→ バリデーション通過（上限は設計上なし）
- [ ] 異常: `0` → バリデーションエラー（1セット以上）
- [ ] 異常: `-1` → バリデーションエラー（正の整数）
- [ ] 異常: `1.5` → バリデーションエラー（整数のみ）
- [ ] 異常: `null` / 未指定 → バリデーションエラー（必須）
- [ ] 異常: 文字列 `"abc"` → バリデーションエラー（数値）

#### purchaseDate

- [ ] 正常: `"2026-04-05"`（YYYY-MM-DD 形式）→ バリデーション通過
- [ ] 異常: `null` / 未指定 → バリデーションエラー（必須）
- [ ] 異常: `"04-05-2026"`（不正な日付形式）→ バリデーションエラー
- [ ] 異常: `""` 空文字 → バリデーションエラー
- [ ] 異常: `"not-a-date"` → バリデーションエラー

---

## テスト対象外（理由付き）

| 対象 | 理由 |
|------|------|
| ユースケースの内部ロジック | Application 層テストで検証。Controller はユースケースへの委譲のみ確認 |
| ドメインの不変条件検証 | Domain 層テストで検証。Controller はエラーの伝播を確認 |
| JWT トークンのパース処理 | ガード / デコレータのテストで検証 |
| class-validator デコレータの動作そのもの | フレームワークが保証。DTO テストはビジネスルールの反映を確認 |
| quantity の上限バリデーション | Domain 層 `TicketSetQuantity` VO のテストで検証。DTO 層では「上限なし」を境界値テストで確認するのみ |
