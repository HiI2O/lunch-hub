# Ticket Module 設計書

## 概要

Ticket モジュールは、チケットの購入・管理を担当するコンテキストです。チケットは10枚綴りのセット単位で購入し、弁当予約の支払い手段として使用します。

**責務:**
- チケットの残枚数管理（使用・返却）
- チケット購入予約の作成・キャンセル
- チケット受取確認（係による承認）

## 集約

### 1. Ticket集約

**集約ルート:** `Ticket`

**責務:**
- チケットの使用・返却
- 残り枚数の管理

**エンティティ: Ticket**

属性:
- ticketId (識別子)
- ownerId (所有者のユーザーID)
- remainingCount (残り枚数)
- status (チケットステータス)
- purchaseDate (購入日)

ファクトリメソッド:
- `create()`: チケット作成（購入予約時に呼ばれる）

コマンド:
- `use()`: 1枚使用（弁当予約時）
- `restoreCount()`: 1枚返却（予約キャンセル時）
- `receive()`: 受取確認（係が承認）

クエリ:
- `canUse()`: 使用可能かチェック（残り枚数 > 0）

**値オブジェクト:**

| 名前           | 責務                 | バリデーション                 |
| -------------- | -------------------- | ------------------------------ |
| `TicketStatus` | チケットステータス   | PENDING, RECEIVED              |
| `TicketCount`  | チケット残枚数管理   | 0以上の整数                    |

**TicketCount の詳細:**
- **責務**: チケット残り枚数の管理と不変条件の保証
- **不変条件**: 0以上（上限なし）
- **振る舞い**:
  - `isValid()`: 範囲チェック（0以上）
  - `decrement()`: 1枚減らす（0枚の場合はエラー）
  - `increment()`: 1枚増やす
  - `add(count)`: 指定枚数を追加（チケット購入時）
  - `canUse()`: 使用可能かチェック（残り枚数 > 0）
- **注意**: 不変オブジェクト（変更時は新しいインスタンスを返す）

**ドメインイベント:**
- `TicketCreated`: チケットが作成された
- `TicketUsed`: チケットが1枚使用された
- `TicketRestored`: チケットが1枚返却された
- `TicketReceived`: チケットの受取が確認された

**不変条件:**
- チケットの残り枚数は0以上（上限なし）
- 予約中（PENDING）のチケットでも弁当予約に使用可能
- 残り枚数が0のチケットは使用不可

---

### 2. TicketPurchaseReservation集約

**集約ルート:** `TicketPurchaseReservation`

**責務:**
- チケット購入予約の作成・キャンセル
- 購入セット数の管理

**エンティティ: TicketPurchaseReservation**

属性:
- purchaseReservationId (識別子)
- userId (購入者のユーザーID)
- purchaseDate (購入日)
- quantity (購入セット数)
- status (購入ステータス)
- createdAt (タイムスタンプ)

ファクトリメソッド:
- `create()`: 購入予約作成

コマンド:
- `cancel()`: 購入予約キャンセル
- `receive()`: 受取確認

クエリ:
- `getTotalTickets()`: 合計枚数を計算（セット数 x 10）

**値オブジェクト:**

| 名前                | 責務                   | バリデーション                   |
| ------------------- | ---------------------- | -------------------------------- |
| `PurchaseStatus`    | 購入ステータス管理     | PENDING, RECEIVED, CANCELLED     |
| `TicketSetQuantity` | チケットセット数管理   | 1セット以上の整数                |

**TicketSetQuantity の詳細:**
- **責務**: チケット購入時のセット数管理と枚数計算
- **不変条件**:
  - 1セット以上
  - 整数のみ
  - 1セット = 10枚固定
- **振る舞い**:
  - `getSets()`: セット数を取得
  - `getTotalTickets()`: 合計枚数を計算（セット数 x 10）
  - `equals()`: 等価性チェック
- **ビジネスルール**: チケットは10枚セット単位でのみ購入可能
- **例**: 3セット購入 → 30枚のチケットが付与される

**ドメインイベント:**
- `TicketPurchaseReservationCreated`: 購入予約が作成された
- `TicketPurchaseReservationCancelled`: 購入予約がキャンセルされた

**不変条件:**
- 購入予約をすると、即座に「予約中」状態のチケットが作成される（結果整合性）
- 購入予約をキャンセルした場合、関連するチケットで使用した弁当予約も全てキャンセルされる（結果整合性）

**他集約との関係（IDのみ参照）:**
- ticketId で Ticket集約を参照

---

## ドメインサービス

### TicketUsageService

チケットの使用と返却を管理するドメインサービス。Reservation コンテキストとの連携ポイント。

**責務:**
- チケットの使用（予約時に残枚数を減らす）
- チケットの返却（予約キャンセル時に残枚数を増やす）

**振る舞い:**
- `useTicket(ticketId)`: チケットを1枚使用（残枚数を1減らす）
- `restoreTicket(ticketId)`: チケットを1枚返却（残枚数を1増やす）

---

## リポジトリインターフェース

### TicketRepository
- `save(ticket)`: チケットの保存
- `findById(ticketId)`: IDによるチケット取得
- `findByOwnerId(ownerId)`: 所有者IDによるチケット一覧取得

### TicketPurchaseReservationRepository
- `save(purchaseReservation)`: 購入予約の保存
- `findById(purchaseReservationId)`: IDによる購入予約取得
- `findByUserId(userId)`: ユーザーIDによる購入予約一覧取得
- `findByPurchaseDate(date)`: 購入日による購入予約一覧取得

---

## ユースケース一覧

### 一般ユーザー向け
| ユースケース                              | 説明                         | アクター   |
| ----------------------------------------- | ---------------------------- | ---------- |
| `GetMyTicketsUseCase`                     | 自分のチケット一覧を取得     | 認証済み   |
| `GetTicketDetailUseCase`                  | チケット詳細を取得           | 認証済み   |
| `CreateTicketPurchaseReservationUseCase`   | チケット購入予約を作成       | 認証済み   |
| `CancelTicketPurchaseReservationUseCase`   | チケット購入予約をキャンセル | 認証済み   |

### 係・管理者向け
| ユースケース                    | 説明                   | アクター              |
| ------------------------------- | ---------------------- | --------------------- |
| `ReceiveTicketUseCase`          | チケット受取を確認     | STAFF, ADMINISTRATOR  |
