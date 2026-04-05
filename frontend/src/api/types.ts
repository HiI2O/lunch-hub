// --- 共通レスポンス型 ---

export type ApiResponse<T> = {
  readonly data: T;
  readonly meta?: PaginationMeta;
};

export type PaginationMeta = {
  readonly total: number;
  readonly page: number;
  readonly limit: number;
};

export type ApiErrorResponse = {
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly fieldErrors?: Record<string, string[]>;
  };
};

// --- ユーザー型 ---

export type UserRole = 'GENERAL_USER' | 'STAFF' | 'ADMINISTRATOR';

export type UserStatus = 'INVITED' | 'ACTIVE' | 'DEACTIVATED';

export type User = {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly role: UserRole;
};

export type UserProfile = User & {
  readonly status: UserStatus;
  readonly createdAt: string;
  readonly lastLoginAt: string | null;
};

// --- 認証レスポンス型 ---

export type LoginResponse = {
  readonly accessToken: string;
  readonly user: User;
};

export type RefreshResponse = {
  readonly accessToken: string;
};

export type MessageResponse = {
  readonly message: string;
};

// --- 予約型 ---

export type PaymentMethod = 'CASH' | 'TICKET';

export type ReservationStatus = 'CONFIRMED' | 'CANCELLED' | 'FINALIZED';

export type ReservationResult = {
  readonly id: string;
  readonly reservationDate: string;
  readonly paymentMethod: PaymentMethod;
  readonly status: ReservationStatus;
  readonly ticketId: string | null;
  readonly createdAt: string;
};

export type ReservationDetail = ReservationResult & {
  readonly updatedAt: string;
};

export type CalendarDayData = {
  readonly hasReservation: boolean;
  readonly status?: ReservationStatus;
};

export type CalendarData = Record<string, CalendarDayData>;

// --- ゲスト型 ---

export type GuestResult = {
  readonly id: string;
  readonly guestName: string;
  readonly createdAt: string;
};

export type GuestReservationResult = {
  readonly id: string;
  readonly guest: {
    readonly id: string;
    readonly guestName: string;
  };
  readonly reservationDate: string;
  readonly paymentMethod: 'CASH';
  readonly status: ReservationStatus;
};

// --- 係専用: 全予約一覧 ---

export type StaffReservationItem = {
  readonly id: string;
  readonly user: {
    readonly id: string;
    readonly displayName: string;
    readonly email: string;
  };
  readonly reservationDate: string;
  readonly paymentMethod: PaymentMethod;
  readonly status: ReservationStatus;
};

export type StaffReservationsMeta = {
  readonly total: number;
  readonly cashCount: number;
  readonly ticketCount: number;
};

// --- チケット型 ---

export type TicketStatus = 'PENDING' | 'RECEIVED';

export type PurchaseStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

export type TicketResult = {
  readonly id: string;
  readonly ownerId: string;
  readonly remainingCount: number;
  readonly status: TicketStatus;
  readonly purchaseDate: string;
};

export type PurchaseReservationResult = {
  readonly id: string;
  readonly userId: string;
  readonly purchaseDate: string;
  readonly quantity: number;
  readonly totalTickets: number;
  readonly status: PurchaseStatus;
  readonly ticketId: string | null;
};

// --- 注文型 ---

export type OrderStatus = 'PENDING' | 'PLACED';

export type OrderResult = {
  readonly id: string;
  readonly orderDate: string;
  readonly totalCount: number;
  readonly status: OrderStatus;
  readonly placedAt: string | null;
};
