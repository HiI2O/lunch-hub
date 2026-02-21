# Reservation Module 設計書

## 概要

Reservation モジュールは、弁当予約とゲスト管理を担当するコンテキストです。

**責務:**
- 弁当予約の作成・変更・キャンセル
- 予約締め切り（当日9:30）の制御
- 支払い方法（現金/チケット）の管理
- ゲスト（社外訪問者）の情報管理と代理予約

## 集約

### 1. Reservation集約

**集約ルート:** `Reservation`

**責務:**
- 弁当予約の作成・変更・キャンセル
- 締め切り時刻のチェック
- 支払い方法の管理

**エンティティ: Reservation**

属性:
- reservationId (識別子)
- userId (予約者のユーザーID)
- reservationDate (予約日)
- paymentMethod (支払い方法)
- status (予約ステータス)
- ticketId (チケットID、チケット払いの場合)
- orderId (注文ID、注文に紐づけられた場合)
- createdAt, updatedAt (タイムスタンプ)

ファクトリメソッド:
- `create()`: 予約作成（締め切り前チェック、チケット残高チェックを含む）

コマンド:
- `cancel()`: 予約キャンセル（締め切り前のみ）
- `changePaymentMethod()`: 支払い方法の変更（締め切り前のみ）
- `finalize()`: 注文確定時にステータスをFINALIZEDに変更

クエリ:
- `canModify()`: 変更可能かチェック
- `isBeforeDeadline()`: 締め切り前かチェック

**値オブジェクト:**

| 名前                | 責務               | バリデーション                         |
| ------------------- | ------------------ | -------------------------------------- |
| `PaymentMethod`     | 支払い方法管理     | CASH, TICKET                           |
| `ReservationStatus` | 予約ステータス管理 | CONFIRMED, CANCELLED, FINALIZED        |
| `ReservationPeriod` | 予約可能期間管理   | 現在日〜翌月末                         |

**ドメインイベント:**
- `ReservationCreated`: 予約が作成された
- `ReservationCancelled`: 予約がキャンセルされた
- `ReservationModified`: 予約が変更された
- `ReservationFinalized`: 予約が確定された

**不変条件:**
- 予約は1つの日付に紐づく
- 予約は1つの支払い方法を持つ
- 締め切り時刻（当日9:30）を過ぎた予約は変更・キャンセル不可
- チケット払いの場合、チケットの残り枚数が1以上必要
- 予約可能期間は現在日〜翌月末
- 同一ユーザーが同一日に重複予約はできない

---

### 2. Guest集約

**集約ルート:** `Guest`

**責務:**
- 社外訪問者の情報管理
- 係による代理予約

**エンティティ: Guest**

属性:
- guestId (識別子)
- guestName (ゲスト名)
- createdByStaffId (作成した係のユーザーID)
- visitDate (訪問日)

ファクトリメソッド:
- `create()`: ゲスト作成（係のみ実行可能）

クエリ:
- なし（シンプルなエンティティ）

**不変条件:**
- ゲストは係（STAFF）または管理者（ADMINISTRATOR）のみが作成可能
- ゲストは自分でログインできない
- ゲスト予約の支払い方法は現金固定

---

## ドメインサービス

### ReservationDeadlineService

当日9:30の締め切り時刻を管理するドメインサービス。

**責務:**
- 現在時刻と締め切り時刻（9:30）の比較
- 締め切り後の予約作成・変更・キャンセルの拒否

**振る舞い:**
- `isBeforeDeadline(date)`: 指定日の予約が締め切り前かチェック
  - 当日の場合: 現在時刻が9:30より前ならtrue
  - 翌日以降の場合: 常にtrue
  - 過去の日付: 常にfalse

---

## リポジトリインターフェース

### ReservationRepository
- `save(reservation)`: 予約の保存
- `findById(reservationId)`: IDによる予約取得
- `findByUserId(userId, period?)`: ユーザーIDによる予約一覧取得
- `findByDate(date)`: 日付による予約一覧取得（係用）
- `findByUserIdAndDate(userId, date)`: ユーザーIDと日付による予約取得（重複チェック用）
- `findCalendarData(userId, year, month)`: カレンダー表示用データ取得

### GuestRepository
- `save(guest)`: ゲストの保存
- `findById(guestId)`: IDによるゲスト取得
- `findByVisitDate(date)`: 訪問日によるゲスト一覧取得

---

## ユースケース一覧

### 一般ユーザー向け
| ユースケース                      | 説明                         | アクター   |
| --------------------------------- | ---------------------------- | ---------- |
| `CreateReservationUseCase`        | 弁当予約を作成               | 認証済み   |
| `ModifyReservationUseCase`        | 自分の予約を変更             | 認証済み   |
| `CancelReservationUseCase`        | 自分の予約をキャンセル       | 認証済み   |
| `GetMyReservationsUseCase`        | 自分の予約一覧を取得         | 認証済み   |
| `GetReservationDetailUseCase`     | 予約詳細を取得               | 認証済み   |
| `GetCalendarDataUseCase`          | カレンダー表示用データを取得 | 認証済み   |

### 係・管理者向け
| ユースケース                          | 説明                       | アクター              |
| ------------------------------------- | -------------------------- | --------------------- |
| `CreateGuestUseCase`                  | ゲストを作成               | STAFF, ADMINISTRATOR  |
| `CreateGuestReservationUseCase`       | ゲストの弁当予約を作成     | STAFF, ADMINISTRATOR  |
| `GetAllReservationsUseCase`           | 全予約一覧を取得（日付別） | STAFF, ADMINISTRATOR  |
| `ModifyOtherUserReservationUseCase`   | 他ユーザーの予約を変更     | STAFF, ADMINISTRATOR  |
| `CancelOtherUserReservationUseCase`   | 他ユーザーの予約をキャンセル | STAFF, ADMINISTRATOR |

### コンテキスト横断（Ticketコンテキストと連携）
| ユースケース                                  | 説明                                   | アクター   |
| --------------------------------------------- | -------------------------------------- | ---------- |
| `CreateReservationWithTicketPurchaseUseCase`   | チケット購入と弁当予約を同時に作成     | 認証済み   |
