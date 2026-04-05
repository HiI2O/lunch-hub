# E2E テスト仕様書

## 方針

E2Eテストは**クリティカルパスのみ**に絞る。各層のロジック検証はユニット/結合テストでカバー済みのため、E2Eでは「APIシナリオが一連のフローとして正しく動作するか」を検証する。

### E2Eテストの責務

| 検証する | 検証しない（ユニット/結合で十分） |
|----------|----------------------------------|
| 認証→操作→結果確認の一連フロー | DTOバリデーションの個別パターン |
| 認可（ロール別アクセス制御） | 各VOの境界値 |
| モジュール間連携（予約×チケット） | マッパーの変換精度 |
| ビジネスクリティカルなドメインルール | パスワードリセット等のサブフロー |

### テスト環境

- Jest + supertest
- 実DB（PostgreSQL）+ 実Redis接続
- 初期管理者はAdminSeedServiceで投入済み
- テストユーザーは各テスト内で招待→アクティベーションして作成

---

## 1. IAM（既存）

> ファイル: `backend/test/iam/`

### 1.1 auth.e2e-spec.ts（実装済み）

- [x] ログイン成功（シード管理者）
- [x] ログイン失敗（不正パスワード、存在しないユーザー、必須項目欠落）
- [x] プロフィール取得（認証あり/なし/不正トークン）
- [x] トークンリフレッシュ（正常/Cookie なし）
- [x] ログアウト（正常/未認証）

### 1.2 invitation.e2e-spec.ts（実装済み）

- [x] 招待フルフロー: 招待 → トークン取得 → アクティベーション → ログイン
- [x] 招待エラー: 未認証、不正ロール、不正トークンでのアクティベーション

### 1.3 admin.e2e-spec.ts（実装済み）

- [x] 役割変更（GENERAL_USER → STAFF、不正ロール値）
- [x] ユーザー無効化 → ログイン不可
- [x] 強制ログアウト → セッション無効化
- [x] ユーザー一覧取得（管理者/非管理者の認可チェック）

---

## 2. Reservation（予約管理）

> ファイル: `backend/test/reservation/reservation.e2e-spec.ts`

### 2.1 予約コアフロー

一般ユーザーの基本的な予約ライフサイクルを検証する。

- [ ] **予約作成→確認→変更→キャンセルのフルフロー**
  - 前提: 認証済み一般ユーザー
  - 手順: 予約作成（現金払い） → GET で確認 → 支払い方法変更（チケット払い） → キャンセル
  - 検証: 各ステップのレスポンス形式、ステータス遷移（CONFIRMED → CANCELLED）

- [ ] **重複予約の拒否**
  - 前提: 同一ユーザーが同一日に予約済み
  - 手順: 同じ日付で再度予約作成
  - 検証: 409 RESERVATION_DUPLICATE

- [ ] **カレンダーデータ取得**
  - 前提: 複数日に予約を作成済み
  - 手順: GET /api/reservations/calendar で月間データ取得
  - 検証: 予約がある日に `hasReservation: true` が返る

### 2.2 締め切りルール（ビジネスクリティカル）

当日9:30の締め切りはシステム最大のビジネスルール。E2Eで必ず検証する。

> 実装方針: `jest.useFakeTimers()` または時刻注入で9:30前後をシミュレート

- [ ] **締め切り後の予約作成が拒否される**
  - 前提: 現在時刻 = 当日9:31（fakeTimers）
  - 手順: 当日日付で予約作成
  - 検証: 400 RESERVATION_DEADLINE_PASSED

- [ ] **締め切り後の予約変更が拒否される**
  - 前提: 9:30前に予約作成済み → 時刻を9:31に進める
  - 手順: 予約の支払い方法を変更
  - 検証: 400 RESERVATION_DEADLINE_PASSED

- [ ] **締め切り後の予約キャンセルが拒否される**
  - 前提: 9:30前に予約作成済み → 時刻を9:31に進める
  - 手順: 予約をキャンセル
  - 検証: 400 RESERVATION_DEADLINE_PASSED

- [ ] **翌日以降の予約は締め切りに関係なく作成可能**
  - 前提: 現在時刻 = 9:31
  - 手順: 翌日の日付で予約作成
  - 検証: 201 正常作成

### 2.3 係によるゲスト予約

> ファイル: `backend/test/reservation/guest.e2e-spec.ts`

- [ ] **ゲスト作成→ゲスト予約作成のフルフロー**
  - 前提: STAFF ロールのユーザー
  - 手順: ゲスト作成 → ゲスト予約作成（現金固定）
  - 検証: ゲスト情報と予約のレスポンス、paymentMethod が CASH

- [ ] **一般ユーザーによるゲスト作成の拒否**
  - 前提: GENERAL_USER ロールのユーザー
  - 手順: POST /api/staff/guests
  - 検証: 403 PERMISSION_DENIED

---

## 3. Ticket（チケット管理）

> ファイル: `backend/test/ticket/ticket.e2e-spec.ts`

### 3.1 チケット購入と利用フロー

- [ ] **チケット購入予約→チケット払いで弁当予約→キャンセル時の残高復元**
  - 前提: 認証済み一般ユーザー
  - 手順:
    1. POST /api/tickets/purchase（1セット購入予約）→ チケットID取得、remainingCount = 10
    2. POST /api/reservations（チケット払い、上記チケットID指定）
    3. GET /api/tickets/:id → remainingCount = 9 を確認
    4. DELETE /api/reservations/:id（キャンセル）
    5. GET /api/tickets/:id → remainingCount = 10 に復元を確認
  - 検証: 各ステップの残高整合性

- [ ] **チケット購入＋弁当予約の同時作成**
  - 前提: 認証済み一般ユーザー
  - 手順: POST /api/reservations/with-ticket-purchase
  - 検証: reservation, purchaseReservation, ticket が全て返る。ticket.remainingCount = 9

### 3.2 チケット受取確認（係フロー）

- [ ] **係によるチケット受取確認**
  - 前提: 一般ユーザーがチケット購入予約済み + STAFF ユーザー
  - 手順: PUT /api/tickets/:id/receive（STAFF トークンで実行）
  - 検証: status が RECEIVED に変更

---

## 4. Order（注文管理）

> ファイル: `backend/test/order/order.e2e-spec.ts`

### 4.1 注文確定フロー

- [ ] **予約一覧確認→注文確定のフルフロー**
  - 前提: 複数ユーザーが同一日に予約済み + STAFF ユーザー
  - 手順:
    1. GET /api/staff/reservations?date=YYYY-MM-DD → 予約一覧確認
    2. GET /api/orders/:date → 注文詳細（totalCount、内訳）確認
    3. POST /api/orders/:date/place → 注文確定
  - 検証: status が PLACED に変更、totalCount が正しい

### 4.2 係による他ユーザー予約管理

- [ ] **他ユーザーの予約をキャンセル**
  - 前提: 一般ユーザーの予約済み + STAFF ユーザー
  - 手順: DELETE /api/staff/reservations/:id
  - 検証: 200、予約ステータスが CANCELLED

---

## 5. 認可の横断チェック

> ファイル: `backend/test/authorization.e2e-spec.ts`

ロール別のアクセス制御がHTTPレベルで正しく動作することを一括検証する。

### 5.1 一般ユーザーの制限

- [ ] **GENERAL_USER が係専用 API を叩くと 403**
  - GET /api/staff/reservations → 403
  - POST /api/staff/guests → 403
  - POST /api/staff/reservations/guest → 403
  - PUT /api/tickets/:id/receive → 403

- [ ] **GENERAL_USER が管理者専用 API を叩くと 403**
  - POST /api/admin/users/invite → 403
  - PUT /api/admin/users/:id/role → 403
  - PUT /api/admin/users/:id/deactivate → 403

### 5.2 係（STAFF）の制限

- [ ] **STAFF が管理者専用 API を叩くと 403**
  - POST /api/admin/users/invite → 403
  - PUT /api/admin/users/:id/role → 403
  - PUT /api/admin/users/:id/deactivate → 403

### 5.3 未認証アクセス

- [ ] **トークンなしで認証必須 API を叩くと 401**
  - GET /api/reservations → 401
  - POST /api/reservations → 401
  - GET /api/tickets → 401

---

## テストヘルパー

各E2Eテストファイルで共通利用するヘルパーを `backend/test/helpers/` に配置する。

### e2e-app.helper.ts

```typescript
// NestApplication の初期化（全テストで共通のセットアップ）
export async function createE2EApp(): Promise<INestApplication> { ... }
```

### e2e-user.helper.ts

```typescript
// テストユーザーの作成（招待→アクティベーション）
export async function createActivatedUser(
  app: INestApplication,
  adminToken: string,
  options?: { role?: string; emailPrefix?: string },
): Promise<{ userId: string; accessToken: string; email: string }> { ... }

// 管理者トークンの取得
export async function getAdminToken(
  app: INestApplication,
): Promise<string> { ... }
```

---

## テスト実行

```bash
cd backend

# E2Eテスト全体
npm run test:e2e

# 個別ファイル
npm run test:e2e -- --testPathPattern=reservation
npm run test:e2e -- --testPathPattern=ticket
npm run test:e2e -- --testPathPattern=order
npm run test:e2e -- --testPathPattern=authorization
```

---

## カバレッジ目標

| 区分 | テストケース数 | 備考 |
|------|---------------|------|
| IAM（既存） | 15件 | 実装済み |
| Reservation | 8件 | 締め切りルール重点 |
| Ticket | 3件 | 残高整合性重点 |
| Order | 2件 | 注文確定フロー |
| 認可横断 | 3グループ | ロール別一括検証 |
| **合計** | **約31件** | |

> DTOバリデーションの個別パターン、VOの境界値、マッパー変換、パスワードリセットフロー等はユニット/結合テストでカバーするため、E2Eでは対象外とする。
