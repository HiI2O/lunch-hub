# Order Module 設計書

## 概要

Order モジュールは、弁当の注文管理を担当するコンテキストです。係がお弁当屋さんに電話で発注するための集計・確定処理を提供します。

**責務:**
- 複数の予約を日単位の注文にまとめる
- 注文の集計（現金/チケット/ゲストの内訳）
- 注文の確定（発注済みステータスへの変更）

## 集約

### 1. Order集約

**集約ルート:** `Order`

**責務:**
- 複数の予約を取りまとめる
- お弁当屋さんへの発注管理
- 注文の確定

**エンティティ: Order**

属性:
- orderId (識別子)
- orderDate (注文日)
- reservationIds (紐づく予約IDのリスト)
- status (注文ステータス)
- totalCount (予約総数)
- createdAt (タイムスタンプ)

ファクトリメソッド:
- `create()`: 注文作成（予約の集約）

コマンド:
- `placeOrder()`: 注文確定（ステータスをPLACEDに変更）

クエリ:
- `canModify()`: 変更可能かチェック（PENDING状態のみ）
- `getTotalCount()`: 予約総数を取得

**値オブジェクト:**

| 名前           | 責務               | バリデーション       |
| -------------- | ------------------ | -------------------- |
| `OrderStatus`  | 注文ステータス管理 | PENDING, PLACED      |
| `DeadlineTime` | 締め切り時刻管理   | 9:30固定             |

**DeadlineTime の詳細:**
- **責務**: 注文締め切り時刻（9:30）の管理
- **固定値**: 9時30分
- **振る舞い**:
  - `isPassed()`: 現在時刻が締め切りを過ぎているかチェック

**ドメインイベント:**
- `OrderPlaced`: 注文が確定された

**不変条件:**
- 注文は1つの日付に紐づく
- 発注済み（PLACED）の注文に含まれる予約は変更・キャンセル不可
- 締め切り時刻（9:30）後に注文を確定

**他集約との関係（IDのみ参照）:**
- reservationIds で Reservation集約を参照

---

## ドメインサービス

### OrderAggregationService

複数の予約を日単位の注文にまとめるドメインサービス。

**責務:**
- 特定日の予約を集計
- 現金払い・チケット払い・ゲスト予約の内訳を算出
- 注文の作成

**振る舞い:**
- `aggregateByDate(date)`: 指定日の予約を集計し、注文を作成/更新
- `getOrderSummary(date)`: 指定日の注文サマリー（総数、内訳）を取得

---

## リポジトリインターフェース

### OrderRepository
- `save(order)`: 注文の保存
- `findById(orderId)`: IDによる注文取得
- `findByDate(date)`: 日付による注文取得
- `findByDateRange(from, to)`: 期間による注文一覧取得

---

## ユースケース一覧

| ユースケース                | 説明                           | アクター              |
| --------------------------- | ------------------------------ | --------------------- |
| `GetOrdersUseCase`          | 注文一覧を取得（期間指定）     | STAFF, ADMINISTRATOR  |
| `GetOrderDetailUseCase`     | 特定日の注文詳細を取得         | STAFF, ADMINISTRATOR  |
| `PlaceOrderUseCase`         | 注文を確定（発注済みに変更）   | STAFF, ADMINISTRATOR  |
