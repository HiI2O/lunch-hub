# ドメインモデル

> このドキュメントは、Lunch-Hub システムのドメインモデルを視覚化し、エンティティ、値オブジェクト、集約、およびそれらの関係を定義します。

---

## 境界づけられたコンテキスト (Bounded Contexts)

```mermaid
graph TB
    subgraph "IAM Context"
        User[User集約]
        Session[Session集約]
    end

    subgraph "Reservation Context"
        Reservation[予約集約]
        Guest[ゲスト集約]
    end

    subgraph "Order Context"
        Order[注文集約]
    end

    subgraph "Ticket Context"
        Ticket[チケット集約]
        TicketPurchaseReservation[チケット購入予約集約]
    end

    User -->|userId| Reservation
    User -->|userId| Ticket
    User -->|staffId| Guest
    Session -->|userId| User
    Reservation -->|ticketId| Ticket
    Reservation -->|orderId| Order
    Guest -->|guestId| Reservation
```

---

## ドメインモデル全体図

```mermaid
classDiagram
    %% ユーザー集約
    class User {
        +UUID userId
        +DisplayName displayName
        +EmailAddress emailAddress
        +PasswordHash passwordHash
        +Role role
        +UserStatus status
        +InvitationToken invitationToken
        +DateTime invitedAt
        +UUID invitedBy
        +DateTime activatedAt
        +DateTime createdAt
        +DateTime updatedAt
        +activate()
        +changePassword()
        +initiatePasswordReset()
        +resetPassword()
        +deactivate()
        +reactivate()
        +isActive()
        +canLogin()
    }

    class Role {
        <<enumeration>>
        GENERAL_USER
        STAFF
        ADMINISTRATOR
    }

    class UserStatus {
        <<enumeration>>
        INVITED
        ACTIVE
        DEACTIVATED
    }

    %% セッション集約
    class Session {
        +UUID sessionId
        +UUID userId
        +AccessToken accessToken
        +RefreshToken refreshToken
        +Boolean isRevoked
        +DateTime createdAt
        +DateTime lastAccessedAt
        +refreshAccessToken()
        +revoke()
        +isValid()
    }

    %% 予約集約
    class Reservation {
        +UUID reservationId
        +UUID userId
        +Date reservationDate
        +PaymentMethod paymentMethod
        +ReservationStatus status
        +DateTime createdAt
        +DateTime updatedAt
        +cancel()
        +canModify()
        +isBeforeDeadline()
    }

    class ReservationStatus {
        <<enumeration>>
        CONFIRMED
        CANCELLED
        FINALIZED
    }

    class PaymentMethod {
        <<enumeration>>
        CASH
        TICKET
    }

    %% 注文集約
    class Order {
        +UUID orderId
        +Date orderDate
        +List~UUID~ reservationIds
        +OrderStatus status
        +Integer totalCount
        +DateTime createdAt
        +placeOrder()
        +canModify()
        +getTotalCount()
    }

    class OrderStatus {
        <<enumeration>>
        PENDING
        PLACED
    }

    %% チケット集約
    class Ticket {
        +UUID ticketId
        +UUID ownerId
        +TicketCount remainingCount
        +TicketStatus status
        +Date purchaseDate
        +use()
        +restoreCount()
        +canUse()
    }

    class TicketStatus {
        <<enumeration>>
        PENDING
        RECEIVED
    }

    class TicketPurchaseReservation {
        +UUID purchaseReservationId
        +UUID userId
        +Date purchaseDate
        +TicketSetQuantity quantity
        +PurchaseStatus status
        +DateTime createdAt
        +getTotalTickets()
        +cancel()
    }

    class PurchaseStatus {
        <<enumeration>>
        PENDING
        RECEIVED
        CANCELLED
    }

    %% ゲスト
    class Guest {
        +UUID guestId
        +String guestName
        +UUID createdByStaffId
        +Date visitDate
    }

    %% 値オブジェクト
    class DisplayName {
        <<value object>>
        +String value
        +isValid()
        +equals()
    }

    class EmailAddress {
        <<value object>>
        +String value
        +isValid()
        +equals()
    }

    class PasswordHash {
        <<value object>>
        +String hashedValue
        +equals()
    }

    class InvitationToken {
        <<value object>>
        +String value
        +DateTime expiresAt
        +isExpired()
        +isValid()
    }

    class PasswordResetToken {
        <<value object>>
        +String value
        +DateTime expiresAt
        +UUID userId
        +isExpired()
        +isValid()
    }

    class AccessToken {
        <<value object>>
        +String value
        +DateTime expiresAt
        +isExpired()
        +verify()
    }

    class RefreshToken {
        <<value object>>
        +String value
        +DateTime expiresAt
        +isExpired()
    }

    class TicketCount {
        <<value object>>
        +Integer value
        +isValid()
        +decrement()
        +increment()
        +add()
        +canUse()
    }

    class TicketSetQuantity {
        <<value object>>
        +Integer sets
        +getSets()
        +getTotalTickets()
        +equals()
    }

    class DeadlineTime {
        <<value object>>
        +Time time
        +isPassed()
    }

    class ReservationPeriod {
        <<value object>>
        +Date startDate
        +Date endDate
        +isWithinPeriod()
    }

    %% 関係性
    User "1" --> "1" DisplayName : has
    User "1" --> "1" EmailAddress : has
    User "1" --> "1" PasswordHash : has
    User "1" --> "1" Role : has
    User "1" --> "1" UserStatus : has
    User "1" --> "0..1" InvitationToken : has
    User "1" --> "0..*" Reservation : makes
    User "1" --> "0..*" Ticket : owns
    User "1" --> "0..*" TicketPurchaseReservation : makes
    User "1" --> "0..*" Guest : creates (staff only)
    User "1" --> "0..*" Session : has

    Session "1" --> "1" AccessToken : has
    Session "1" --> "1" RefreshToken : has

    Ticket "1" --> "1" TicketCount : has
    TicketPurchaseReservation "1" --> "1" TicketSetQuantity : has

    Reservation "1" --> "1" PaymentMethod : uses
    Reservation "1" --> "1" ReservationStatus : has
    Reservation "*" ..> "1" Order : references by orderId
    Reservation "0..1" ..> "1" Ticket : references by ticketId

    Order "1" --> "1" OrderStatus : has
    Order "1" --> "1" DeadlineTime : respects
    Order "1" ..> "*" Reservation : references by reservationIds

    Ticket "1" --> "1" TicketStatus : has
    TicketPurchaseReservation "1" ..> "1" Ticket : references by ticketId

    Guest "1" --> "0..*" Reservation : has

    Reservation --> ReservationPeriod : within
```

---

## 集約（Aggregate）の定義

DDDでは、関連するエンティティと値オブジェクトを**集約**としてグループ化します。各集約には**集約ルート**があり、外部からはこのルートを通じてのみアクセスします。

### 1. ユーザー集約 (User Aggregate)

→ 詳細は [IAMモジュール設計書](modules/iam.md#1-user集約) を参照

---

### 2. セッション集約 (Session Aggregate)

→ 詳細は [IAMモジュール設計書](modules/iam.md#2-session集約) を参照

---

### 3. 予約集約 (Reservation Aggregate)

→ 詳細は [Reservationモジュール設計書](modules/reservation.md#1-reservation集約) を参照

---

### 4. 注文集約 (Order Aggregate)

→ 詳細は [Orderモジュール設計書](modules/order.md#1-order集約) を参照

---

### 5. チケット集約 (Ticket Aggregate)

→ 詳細は [Ticketモジュール設計書](modules/ticket.md#1-ticket集約) を参照

---

### 6. チケット購入予約集約 (TicketPurchaseReservation Aggregate)

→ 詳細は [Ticketモジュール設計書](modules/ticket.md#2-ticketpurchasereservation集約) を参照

---

### 7. ゲスト集約 (Guest Aggregate)

→ 詳細は [Reservationモジュール設計書](modules/reservation.md#2-guest集約) を参照

---

## 集約間の関係

### 参照の方向

```mermaid
graph LR
    User[ユーザー集約]
    Session[セッション集約]
    Reservation[予約集約]
    Order[注文集約]
    Ticket[チケット集約]
    TicketPurchase[チケット購入予約集約]
    Guest[ゲスト集約]

    Session -->|userId| User
    User -->|userId| Reservation
    User -->|userId| Ticket
    User -->|userId| TicketPurchase
    User -->|staffId| Guest
    Reservation -->|ticketId| Ticket
    Reservation -->|orderId| Order
    Order -->|reservationIds| Reservation
    TicketPurchase -->|ticketId| Ticket
    Guest -->|guestId| Reservation
```

**重要な原則:**
- 集約間の参照は**IDのみ**を使用（オブジェクト参照は避ける）
- 集約の境界を越えた整合性は**結果整合性**で管理
- トランザクションは1つの集約内で完結

---

## エンティティ vs 値オブジェクト

### エンティティ（Identity を持つ）
- **User**: ユーザーID で識別
- **Session**: セッションID で識別
- **Reservation**: 予約ID で識別
- **Order**: 注文ID で識別
- **Ticket**: チケットID で識別
- **TicketPurchaseReservation**: 購入予約ID で識別
- **Guest**: ゲストID で識別

### 値オブジェクト（値で識別）

#### 列挙型
- **Role**: 列挙型（GENERAL_USER, STAFF, ADMINISTRATOR）
- **UserStatus**: 列挙型（INVITED, ACTIVE, DEACTIVATED）
- **PaymentMethod**: 列挙型（CASH, TICKET）
- **ReservationStatus**: 列挙型（CONFIRMED, CANCELLED, FINALIZED）
- **OrderStatus**: 列挙型（PENDING, PLACED）
- **TicketStatus**: 列挙型（PENDING, RECEIVED）

#### ビジネスルールを持つ値オブジェクト

各値オブジェクトの詳細（責務・不変条件・振る舞い）は、所属するモジュール設計書を参照。

| 値オブジェクト | 所属コンテキスト | 詳細リンク |
|---------------|-----------------|-----------|
| DisplayName, EmailAddress, PasswordHash, InvitationToken, PasswordResetToken, AccessToken, RefreshToken | IAM | [IAMモジュール設計書](modules/iam.md#1-user集約) |
| ReservationPeriod | Reservation | [Reservationモジュール設計書](modules/reservation.md#1-reservation集約) |
| DeadlineTime | Order | [Orderモジュール設計書](modules/order.md#1-order集約) |
| TicketCount | Ticket | [Ticketモジュール設計書](modules/ticket.md#1-ticket集約) |
| TicketSetQuantity | Ticket | [Ticketモジュール設計書](modules/ticket.md#2-ticketpurchasereservation集約) |

---

## ドメインサービス

集約に属さないビジネスロジックは**ドメインサービス**として実装します。

| サービス | 所属コンテキスト | 責務 | 詳細リンク |
|----------|-----------------|------|-----------|
| AuthenticationService | IAM | ログイン処理・パスワード検証 | [IAMモジュール設計書](modules/iam.md#ドメインサービス) |
| PasswordHasher | IAM | パスワードのハッシュ化と検証 | [IAMモジュール設計書](modules/iam.md#ドメインサービス) |
| InvitationService | IAM | 招待トークンの生成・検証 | [IAMモジュール設計書](modules/iam.md#ドメインサービス) |
| ReservationDeadlineService | Reservation | 締め切り時刻チェック（当日9:30） | [Reservationモジュール設計書](modules/reservation.md#ドメインサービス) |
| OrderAggregationService | Order | 複数の予約を日単位の注文にまとめる | [Orderモジュール設計書](modules/order.md#ドメインサービス) |
| TicketUsageService | Ticket | チケットの使用・返却 | [Ticketモジュール設計書](modules/ticket.md#ドメインサービス) |

---

## リポジトリインターフェース

各集約に対応するリポジトリインターフェースをドメイン層に定義し、具体的な永続化実装はインフラ層に配置する。

| リポジトリ | 所属コンテキスト | 詳細リンク |
|-----------|-----------------|-----------|
| UserRepository | IAM | [IAMモジュール設計書](modules/iam.md#リポジトリインターフェース) |
| SessionRepository | IAM | [IAMモジュール設計書](modules/iam.md#リポジトリインターフェース) |
| ReservationRepository | Reservation | [Reservationモジュール設計書](modules/reservation.md#リポジトリインターフェース) |
| GuestRepository | Reservation | [Reservationモジュール設計書](modules/reservation.md#リポジトリインターフェース) |
| OrderRepository | Order | [Orderモジュール設計書](modules/order.md#リポジトリインターフェース) |
| TicketRepository | Ticket | [Ticketモジュール設計書](modules/ticket.md#リポジトリインターフェース) |
| TicketPurchaseReservationRepository | Ticket | [Ticketモジュール設計書](modules/ticket.md#リポジトリインターフェース) |

---

## 主要なビジネスフロー

### 1. ユーザー招待・アクティベーションフロー

```mermaid
sequenceDiagram
    actor Admin as 管理者
    participant User
    participant InvitationService
    participant Email

    Admin->>User: invite(email, role)
    User->>User: InvitationToken生成
    User->>InvitationService: sendInvitationEmail()
    InvitationService->>Email: 招待メール送信

    Note over User: 48時間以内にアクティベート

    actor NewUser as 新規ユーザー
    NewUser->>User: activate(password)
    User->>User: パスワードポリシーチェック
    User->>User: PasswordHash生成
    User->>User: status = ACTIVE
```

### 2. ログインフロー

```mermaid
sequenceDiagram
    actor User as ユーザー
    participant RateLimitService
    participant AuthService as AuthenticationService
    participant Session

    User->>RateLimitService: checkLoginAttempts(email)
    alt 制限超過
        RateLimitService-->>User: エラー（15分間ロックアウト）
    else OK
        User->>AuthService: login(email, password)
        AuthService->>AuthService: verifyPassword()
        AuthService->>Session: create(userId)
        Session->>Session: AccessToken生成
        Session->>Session: RefreshToken生成
        Session-->>User: Session返却
    end
```

### 3. 弁当予約フロー

```mermaid
sequenceDiagram
    actor User
    participant Reservation
    participant Ticket
    participant DeadlineService

    User->>DeadlineService: 締め切り前かチェック
    DeadlineService-->>User: OK

    alt チケット払い
        User->>Ticket: 残り枚数チェック
        Ticket-->>User: OK (残り枚数 >= 1)
        User->>Reservation: 予約作成
        Reservation->>Ticket: 1枚使用
    else 現金払い
        User->>Reservation: 予約作成
    end
```

### 4. チケット購入 + 弁当予約の同時フロー

```mermaid
sequenceDiagram
    actor User
    participant TicketPurchase
    participant Ticket
    participant Reservation

    User->>TicketPurchase: チケット購入予約作成
    TicketPurchase->>Ticket: チケット作成（予約中、残り10枚）
    User->>Reservation: 弁当予約作成（チケット払い）
    Reservation->>Ticket: 1枚使用（残り9枚）
```

### 5. 注文確定フロー

```mermaid
sequenceDiagram
    actor Staff
    participant Order
    participant Reservation
    participant DeadlineService

    DeadlineService->>DeadlineService: 9:30になった
    Staff->>Order: 予約一覧を取得
    Order->>Reservation: 予約を集約
    Staff->>Order: 注文確定
    Order->>Order: ステータスを「発注済み」に変更
    Note over Reservation: この時点で予約の変更・キャンセル不可
```

---

## まとめ

このドメインモデルは以下を定義しています：

1. **7つの集約**: User, Session, Reservation, Order, Ticket, TicketPurchaseReservation, Guest
2. **エンティティと値オブジェクト**の区別
3. **集約間の関係**（IDによる参照）
4. **ドメインサービス**（集約に属さないロジック）
5. **リポジトリインターフェース**
6. **主要なビジネスフロー**

