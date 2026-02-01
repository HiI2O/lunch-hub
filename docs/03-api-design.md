# Lunch Hub API設計

## 概要

このドキュメントでは、Lunch Hub REST APIの全エンドポイントを定義します。

## 共通仕様

### ベースURL
- 開発環境: `http://localhost:3000/api`
- 本番環境: `https://lunch-hub.example.com/api`

### 認証
- Bearer Token認証（JWTアクセストークン）
- `Authorization: Bearer <accessToken>`

### レスポンス形式
```typescript
// 成功時
{
  "data": { ... },
  "meta"?: {
    "total": number,
    "page": number,
    "limit": number
  }
}

// エラー時
{
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ"
  }
}
```

### エラーコード一覧

| コード | 説明 | HTTP Status |
|--------|------|-------------|
| `AUTH_INVALID_CREDENTIALS` | 認証失敗 | 401 |
| `AUTH_TOKEN_EXPIRED` | トークン期限切れ | 401 |
| `AUTH_LOCKED_OUT` | アカウントロック中 | 429 |
| `AUTH_INVALID_TOKEN` | 無効なトークン | 401 |
| `PERMISSION_DENIED` | 権限不足 | 403 |
| `RESOURCE_NOT_FOUND` | リソース未存在 | 404 |
| `VALIDATION_ERROR` | バリデーションエラー | 400 |
| `RESERVATION_DUPLICATE` | 重複予約 | 409 |
| `RESERVATION_DEADLINE_PASSED` | 締め切り超過 | 400 |
| `TICKET_INSUFFICIENT_BALANCE` | チケット残高不足 | 400 |
| `RATE_LIMIT_EXCEEDED` | レート制限超過 | 429 |

---

## 認証関連 API

### ログイン
```
POST /api/auth/login
```

**リクエスト:**
```json
{
  "email": "user@company.com",
  "password": "SecurePassword123!"
}
```

**レスポンス:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@company.com",
      "displayName": "田中太郎",
      "role": "GENERAL_USER"
    }
  }
}
```

**Cookie:**
```
Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

---

### ログアウト
```
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

**レスポンス:**
```json
{
  "data": {
    "message": "ログアウトしました"
  }
}
```

---

### トークン更新
```
POST /api/auth/refresh
Cookie: refreshToken=...
```

**レスポンス:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### セルフサインアップ
```
POST /api/auth/signup
```

**リクエスト:**
```json
{
  "email": "newuser@company.com",
  "pin": "LunchHub2024"
}
```

**レスポンス:**
```json
{
  "data": {
    "message": "招待メールを送信しました"
  }
}
```

---

### アカウントアクティベーション
```
POST /api/auth/activate
```

**リクエスト:**
```json
{
  "token": "invitation-token-here",
  "password": "SecurePassword123!",
  "displayName": "田中太郎"
}
```

**レスポンス:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "newuser@company.com",
      "displayName": "田中太郎",
      "role": "GENERAL_USER"
    }
  }
}
```

---

### パスワードリセット要求
```
POST /api/auth/forgot-password
```

**リクエスト:**
```json
{
  "email": "user@company.com"
}
```

**レスポンス:**
```json
{
  "data": {
    "message": "パスワードリセットメールを送信しました"
  }
}
```

---

### パスワードリセット
```
POST /api/auth/reset-password
```

**リクエスト:**
```json
{
  "token": "reset-token-here",
  "password": "NewSecurePassword123!"
}
```

**レスポンス:**
```json
{
  "data": {
    "message": "パスワードを変更しました"
  }
}
```

---

### 現在のユーザー情報取得
```
GET /api/auth/me
Authorization: Bearer <accessToken>
```

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@company.com",
    "displayName": "田中太郎",
    "role": "GENERAL_USER",
    "status": "ACTIVE",
    "createdAt": "2025-12-01T00:00:00Z",
    "lastLoginAt": "2025-12-02T13:00:00Z"
  }
}
```

---

## ユーザー管理 API

### プロフィール取得
```
GET /api/users/me
Authorization: Bearer <accessToken>
```

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@company.com",
    "displayName": "田中太郎",
    "role": "GENERAL_USER"
  }
}
```

---

### プロフィール更新
```
PUT /api/users/me
Authorization: Bearer <accessToken>
```

**リクエスト:**
```json
{
  "displayName": "田中太郎（更新）"
}
```

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "email": "user@company.com",
    "displayName": "田中太郎（更新）",
    "role": "GENERAL_USER"
  }
}
```

---

### パスワード変更
```
PUT /api/users/me/password
Authorization: Bearer <accessToken>
```

**リクエスト:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**レスポンス:**
```json
{
  "data": {
    "message": "パスワードを変更しました"
  }
}
```

---

## 管理者機能 API

### ユーザー招待
```
POST /api/admin/users/invite
Authorization: Bearer <accessToken>
Roles: ADMINISTRATOR
```

**リクエスト:**
```json
{
  "email": "newuser@company.com",
  "role": "STAFF"
}
```

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "email": "newuser@company.com",
    "status": "INVITED",
    "role": "STAFF",
    "invitedAt": "2025-12-02T13:00:00Z"
  }
}
```

---

### 招待再送信
```
POST /api/admin/users/:id/resend-invitation
Authorization: Bearer <accessToken>
Roles: ADMINISTRATOR
```

**レスポンス:**
```json
{
  "data": {
    "message": "招待メールを再送信しました"
  }
}
```

---

### 招待取り消し
```
DELETE /api/admin/users/:id/invitation
Authorization: Bearer <accessToken>
Roles: ADMINISTRATOR
```

**レスポンス:**
```json
{
  "data": {
    "message": "招待を取り消しました"
  }
}
```

---

### ユーザー一覧取得
```
GET /api/admin/users
Authorization: Bearer <accessToken>
Roles: ADMINISTRATOR
```

**クエリパラメータ:**
- `status`: INVITED | ACTIVE | DEACTIVATED
- `role`: GENERAL_USER | STAFF | ADMINISTRATOR
- `page`: ページ番号（デフォルト: 1）
- `limit`: 取得件数（デフォルト: 20）

**レスポンス:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@company.com",
      "displayName": "田中太郎",
      "role": "GENERAL_USER",
      "status": "ACTIVE",
      "createdAt": "2025-12-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

---

### ユーザー無効化
```
PUT /api/admin/users/:id/deactivate
Authorization: Bearer <accessToken>
Roles: ADMINISTRATOR
```

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "status": "DEACTIVATED"
  }
}
```

---

### ユーザー再有効化
```
PUT /api/admin/users/:id/reactivate
Authorization: Bearer <accessToken>
Roles: ADMINISTRATOR
```

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "status": "ACTIVE"
  }
}
```

---

## 予約管理 API

### 自分の予約一覧取得
```
GET /api/reservations
Authorization: Bearer <accessToken>
```

**クエリパラメータ:**
- `from`: 開始日（YYYY-MM-DD）
- `to`: 終了日（YYYY-MM-DD）
- `status`: CONFIRMED | CANCELLED | FINALIZED

**レスポンス:**
```json
{
  "data": [
    {
      "id": "uuid",
      "reservationDate": "2025-12-03",
      "paymentMethod": "TICKET",
      "status": "CONFIRMED",
      "ticketId": "uuid",
      "createdAt": "2025-12-01T10:00:00Z"
    }
  ]
}
```

---

### 予約作成
```
POST /api/reservations
Authorization: Bearer <accessToken>
```

**リクエスト:**
```json
{
  "reservationDate": "2025-12-03",
  "paymentMethod": "TICKET",
  "ticketId": "uuid"
}
```

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "reservationDate": "2025-12-03",
    "paymentMethod": "TICKET",
    "status": "CONFIRMED",
    "ticketId": "uuid",
    "createdAt": "2025-12-01T10:00:00Z"
  }
}
```

---

### 予約詳細取得
```
GET /api/reservations/:id
Authorization: Bearer <accessToken>
```

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "reservationDate": "2025-12-03",
    "paymentMethod": "TICKET",
    "status": "CONFIRMED",
    "ticketId": "uuid",
    "createdAt": "2025-12-01T10:00:00Z",
    "updatedAt": "2025-12-01T10:00:00Z"
  }
}
```

---

### 予約変更
```
PUT /api/reservations/:id
Authorization: Bearer <accessToken>
```

**リクエスト:**
```json
{
  "paymentMethod": "CASH"
}
```

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "reservationDate": "2025-12-03",
    "paymentMethod": "CASH",
    "status": "CONFIRMED"
  }
}
```

---

### 予約キャンセル
```
DELETE /api/reservations/:id
Authorization: Bearer <accessToken>
```

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "status": "CANCELLED"
  }
}
```

---

### カレンダー表示用データ取得
```
GET /api/reservations/calendar
Authorization: Bearer <accessToken>
```

**クエリパラメータ:**
- `year`: 年（YYYY）
- `month`: 月（1-12）

**レスポンス:**
```json
{
  "data": {
    "2025-12-01": { "hasReservation": true, "status": "CONFIRMED" },
    "2025-12-02": { "hasReservation": false },
    "2025-12-03": { "hasReservation": true, "status": "CONFIRMED" }
  }
}
```

---

## 係専用 - 予約管理 API

### 全予約一覧取得
```
GET /api/staff/reservations
Authorization: Bearer <accessToken>
Roles: STAFF, ADMINISTRATOR
```

**クエリパラメータ:**
- `date`: 日付（YYYY-MM-DD）
- `status`: CONFIRMED | CANCELLED | FINALIZED

**レスポンス:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "displayName": "田中太郎",
        "email": "tanaka@company.com"
      },
      "reservationDate": "2025-12-03",
      "paymentMethod": "TICKET",
      "status": "CONFIRMED"
    }
  ],
  "meta": {
    "total": 30,
    "cashCount": 10,
    "ticketCount": 20
  }
}
```

---

### ゲスト作成
```
POST /api/staff/guests
Authorization: Bearer <accessToken>
Roles: STAFF, ADMINISTRATOR
```

**リクエスト:**
```json
{
  "guestName": "来客A様",
  "visitDate": "2025-12-03"
}
```

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "guestName": "来客A様",
    "visitDate": "2025-12-03",
    "createdAt": "2025-12-01T10:00:00Z"
  }
}
```

---

### ゲスト予約作成
```
POST /api/staff/reservations/guest
Authorization: Bearer <accessToken>
Roles: STAFF, ADMINISTRATOR
```

**リクエスト:**
```json
{
  "guestId": "uuid",
  "reservationDate": "2025-12-03"
}
```

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "guest": {
      "id": "uuid",
      "guestName": "来客A様"
    },
    "reservationDate": "2025-12-03",
    "paymentMethod": "CASH",
    "status": "CONFIRMED"
  }
}
```

---

## 注文管理 API

### 注文一覧取得
```
GET /api/orders
Authorization: Bearer <accessToken>
Roles: STAFF, ADMINISTRATOR
```

**クエリパラメータ:**
- `from`: 開始日（YYYY-MM-DD）
- `to`: 終了日（YYYY-MM-DD）

**レスポンス:**
```json
{
  "data": [
    {
      "id": "uuid",
      "orderDate": "2025-12-03",
      "totalCount": 30,
      "status": "PLACED",
      "placedAt": "2025-12-03T09:30:00Z"
    }
  ]
}
```

---

### 特定日の注文詳細取得
```
GET /api/orders/:date
Authorization: Bearer <accessToken>
Roles: STAFF, ADMINISTRATOR
```

**レスポンス:**
```json
{
  "data": {
    "orderDate": "2025-12-03",
    "totalCount": 30,
    "cashCount": 10,
    "ticketCount": 18,
    "guestCount": 2,
    "status": "PENDING",
    "reservations": [
      {
        "id": "uuid",
        "user": { "displayName": "田中太郎" },
        "paymentMethod": "TICKET"
      }
    ]
  }
}
```

---

### 注文確定
```
POST /api/orders/:date/place
Authorization: Bearer <accessToken>
Roles: STAFF, ADMINISTRATOR
```

**レスポンス:**
```json
{
  "data": {
    "orderDate": "2025-12-03",
    "totalCount": 30,
    "status": "PLACED",
    "placedAt": "2025-12-03T09:30:00Z"
  }
}
```

---

## チケット管理 API

### 自分のチケット一覧取得
```
GET /api/tickets
Authorization: Bearer <accessToken>
```

**レスポンス:**
```json
{
  "data": [
    {
      "id": "uuid",
      "remainingCount": 8,
      "status": "RECEIVED",
      "purchaseDate": "2025-12-01",
      "createdAt": "2025-12-01T10:00:00Z"
    }
  ]
}
```

---

### チケット購入予約
```
POST /api/tickets/purchase
Authorization: Bearer <accessToken>
```

**リクエスト:**
```json
{
  "quantity": 1,
  "purchaseDate": "2025-12-03"
}
```

**レスポンス:**
```json
{
  "data": {
    "purchaseReservation": {
      "id": "uuid",
      "quantity": 1,
      "status": "PENDING",
      "purchaseDate": "2025-12-03"
    },
    "ticket": {
      "id": "uuid",
      "remainingCount": 10,
      "status": "PENDING"
    }
  }
}
```

---

### チケット詳細取得
```
GET /api/tickets/:id
Authorization: Bearer <accessToken>
```

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "remainingCount": 8,
    "status": "RECEIVED",
    "purchaseDate": "2025-12-01",
    "createdAt": "2025-12-01T10:00:00Z"
  }
}
```

---

### チケット受取確認（係専用）
```
PUT /api/tickets/:id/receive
Authorization: Bearer <accessToken>
Roles: STAFF, ADMINISTRATOR
```

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "status": "RECEIVED"
  }
}
```

---

### チケット購入予約キャンセル
```
DELETE /api/tickets/purchases/:id
Authorization: Bearer <accessToken>
```

**レスポンス:**
```json
{
  "data": {
    "id": "uuid",
    "status": "CANCELLED"
  }
}
```

---

## 関連ドキュメント

- [アーキテクチャ設計](./02-design/architecture.md)
- [データベース設計](./04-database-design.md)
- [IAMモジュール設計](./02-design/modules/iam-module.md)

---

**更新履歴:**
- 2026-02-01: 初版作成（architecture.md、detailed-design.md、authentication-architecture.mdから統合）
