# Order Presentation Layer テスト仕様

Order モジュール Presentation 層（Controller）のテスト仕様書。

設計ドキュメントから導出:
- [Order モジュール設計](../../02-design/modules/order.md)
- [API設計 > 注文管理API](../../03-api-design.md)
- [テスト戦略 > Presentation層](../strategy.md)

---

## Controllers

### OrderController（係・管理者向け）

設計根拠: [API設計 > 注文管理API](../../03-api-design.md)

注文管理は係（STAFF）と管理者（ADMINISTRATOR）のみがアクセス可能。

#### GET /api/orders — 注文一覧取得（期間指定）

設計根拠: [Order設計 > GetOrdersUseCase](../../02-design/modules/order.md)

- [ ] 正常: `GetOrdersUseCase` にクエリパラメータ `from`, `to` を渡して呼び出す
- [ ] 正常: ユースケースの戻り値をレスポンスボディ `{ data: [...] }` として返す
- [ ] 正常: 各注文に `id`, `orderDate`, `totalCount`, `status`, `placedAt` が含まれる
- [ ] 正常: レスポンスに `meta` フィールドを含まない（API設計でページネーション未定義のため）
- [ ] 正常: HTTP 200 を返す
- [ ] 認可: STAFF ロールでアクセス可能
- [ ] 認可: ADMINISTRATOR ロールでアクセス可能
- [ ] 認可: GENERAL_USER ロール → `PERMISSION_DENIED` / 403 を返す
- [ ] 異常: 未認証リクエスト → 401 を返す
- [ ] バリデーション: `from` が YYYY-MM-DD 形式でない → `VALIDATION_ERROR` / 400
- [ ] バリデーション: `to` が YYYY-MM-DD 形式でない → `VALIDATION_ERROR` / 400
- [ ] バリデーション: `from` 未指定 → `VALIDATION_ERROR` / 400（必須パラメータ）
- [ ] バリデーション: `to` 未指定 → `VALIDATION_ERROR` / 400（必須パラメータ）

> **Warning**: 現在の実装（`order.controller.ts`）では `@Query('from') from: string` と素通しでユースケースに渡しており、Query 用の DTO / ValidationPipe が未適用。上記バリデーションテストを有効化するには、Query DTO の追加実装が必要。
- [ ] 境界値: 過去の日付（例: 1年前）→ 正常に空配列を返す
- [ ] 境界値: 未来の遠い日付（例: 1年後）→ 正常に空配列を返す

#### GET /api/orders/:date — 特定日の注文詳細取得（未実装）

設計根拠: [Order設計 > GetOrderDetailUseCase](../../02-design/modules/order.md), [API設計 > 注文詳細レスポンス](../../03-api-design.md)

> **Warning**: このエンドポイントは API 設計書に定義されていますが、`order.controller.ts` に未実装です。`GetOrderDetailUseCase` も未実装のため、実装時にテスト仕様を有効化してください。

- [ ] 正常: `GetOrderDetailUseCase` に日付パラメータを渡して呼び出す
- [ ] 正常: レスポンスに `orderDate`, `totalCount`, `cashCount`, `ticketCount`, `guestCount`, `status`, `reservations` が含まれる
- [ ] 正常: HTTP 200 を返す
- [ ] 認可: STAFF ロールでアクセス可能
- [ ] 認可: ADMINISTRATOR ロールでアクセス可能
- [ ] 認可: GENERAL_USER ロール → `PERMISSION_DENIED` / 403 を返す
- [ ] 異常: 該当日の注文が存在しない → `RESOURCE_NOT_FOUND` / 404 を返す
- [ ] 異常: 不正な日付形式（例: `"not-a-date"`）→ `VALIDATION_ERROR` / 400
- [ ] 異常: 未認証リクエスト → 401 を返す
- [ ] エラーマッピング: ユースケースが `DomainException` をスローした場合、適切な HTTP ステータスに変換される

#### POST /api/orders/:id/place — 注文確定

設計根拠: [Order設計 > PlaceOrderUseCase](../../02-design/modules/order.md), [Order設計 > OrderStatus / DeadlineTime](../../02-design/modules/order.md)

> **Note**: API設計書では `:date` だが、実装（`order.controller.ts:38-39`）では `:id`（注文ID）でルーティング。`PlaceOrderUseCase` に `orderId` を渡す。実装に合わせる。

- [ ] 正常: `PlaceOrderUseCase` に注文 ID パラメータを渡して呼び出す
- [ ] 正常: レスポンスに `orderDate`, `totalCount`, `status: 'PLACED'`, `placedAt` が含まれる
- [ ] 正常: HTTP 200 を返す
- [ ] 認可: STAFF ロールでアクセス可能
- [ ] 認可: ADMINISTRATOR ロールでアクセス可能
- [ ] 認可: GENERAL_USER ロール → `PERMISSION_DENIED` / 403 を返す
- [ ] 異常: 該当日の注文が存在しない → `RESOURCE_NOT_FOUND` / 404 を返す
- [ ] 異常: 既に PLACED 状態の注文 → 400 を返す（変更不可）
- [ ] 異常: 注文は存在するが予約0件（totalCount=0）の場合の挙動を確認
- [ ] 異常: 不正な日付形式 → `VALIDATION_ERROR` / 400
- [ ] 異常: 未認証リクエスト → 401 を返す
- [ ] エラーマッピング: ユースケースが `DomainException` をスローした場合、適切な HTTP ステータスに変換される

---

## テスト対象外（理由付き）

| 対象 | 理由 |
|------|------|
| 締め切り時刻（9:30）のビジネスロジック | Domain 層の `DeadlineTime` で検証。Controller はドメインエラーの伝播を確認 |
| 予約の集計ロジック（現金/チケット/ゲスト内訳） | Domain 層の `OrderAggregationService` で検証 |
| ユースケースの内部フロー | Application 層テストで検証。Controller はユースケースへの委譲のみ確認 |
| JWT トークンのパース処理 | ガード / デコレータのテストで検証 |
| ロールガードの判定ロジック自体 | Guard のユニットテストで検証。Controller テストではガード適用の有無を確認 |
