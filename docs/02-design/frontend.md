# Lunch Hub フロントエンド設計

## 概要

Phase 1 バックエンドAPI（IAM Context）が完成したため、フロントエンドの認証基盤とAPI通信層を設計する。既存のUIスキャフォールド（モックデータ・CSSデザインシステム）を活かし、バックエンド接続と認証フローを実装する。

## 技術選定

### 確定済み（変更なし）
| 技術 | バージョン | 用途 |
|------|-----------|------|
| React | 19.x | UIフレームワーク |
| TypeScript | 5.9.x | 型安全 |
| Vite | 7.x | ビルドツール |
| react-router-dom | 7.x | ルーティング |

### Phase 1 で追加
| 技術 | 用途 | 選定理由 |
|------|------|---------|
| Vitest + React Testing Library | テスト | Viteとの統合が自然、Jest互換API |
| React Context | 認証状態管理 | 50名規模の社内アプリにはContext十分。外部ライブラリ不要 |
| Fetch API（カスタムラッパー） | API通信 | axiosの追加依存を避ける。インターセプターはラッパーで実現 |

### 見送り（Phase 1 では不要）
| 技術 | 理由 |
|------|------|
| Zustand / Redux | 認証以外のグローバル状態が少ない。Phase 2以降で必要に応じて導入 |
| React Hook Form | フォーム数が少ない（4画面）。カスタムフックで十分 |
| Tanstack Query | API呼び出しが認証系のみ。Phase 2のカレンダー/予約で検討 |
| CSS Modules / Tailwind | 既存のmock.cssデザインシステムが完成済み。移行コスト不要 |

## ディレクトリ構成

```
frontend/src/
├── main.tsx                     # エントリーポイント
├── App.tsx                      # RouterProvider
├── index.css                    # グローバルスタイル
│
├── api/                         # API通信層
│   ├── client.ts                # fetchラッパー（トークン付与・リフレッシュ・エラー変換）
│   ├── auth.ts                  # 認証API関数
│   └── types.ts                 # APIレスポンス型定義
│
├── contexts/                    # React Context
│   ├── AuthContext.tsx           # 認証状態・ログイン/ログアウト・トークン管理
│   └── ToastContext.tsx          # 通知状態管理・useToastフック提供
│
├── hooks/                       # カスタムフック
│   ├── useAuth.ts               # AuthContext消費用フック
│   └── useForm.ts               # フォームバリデーションフック
│
├── components/
│   ├── layout/                  # レイアウト（既存）
│   │   ├── AuthLayout.tsx
│   │   ├── MainLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── BottomNav.tsx
│   └── ui/                      # 共通UIコンポーネント（Phase 1）
│       ├── LoadingSpinner.tsx    # ローディング表示
│       └── Toast.tsx            # 成功/エラー通知（ToastContext経由で管理）
│
├── guards/                      # ルートガード
│   ├── AuthGuard.tsx            # 認証必須ルート
│   └── RoleGuard.tsx            # 役割ベースアクセス制御
│
├── pages/                       # ページコンポーネント（既存）
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── ActivatePage.tsx
│   │   ├── ForgotPasswordPage.tsx    # 新規
│   │   └── ResetPasswordPage.tsx     # 新規
│   ├── reservation/
│   ├── ticket/
│   └── admin/
│
├── routes/
│   └── index.tsx                # ルート定義
│
├── styles/
│   └── mock.css                 # デザインシステム（既存）
│
└── utils/                       # ユーティリティ
    └── validation.ts            # バリデーションルール（パスワードポリシー等）
```

## 認証アーキテクチャ

### トークン管理方針

| トークン | 保存場所 | 有効期限 | 用途 |
|---------|---------|---------|------|
| accessToken | メモリ（Context state） | 15分 | API認証ヘッダー |
| refreshToken | HttpOnly Cookie（サーバー設定） | 7日 | トークン更新 |

- accessTokenをlocalStorage/sessionStorageに保存しない（XSS対策）
- refreshTokenはサーバーがSet-Cookieで管理（フロントエンドからアクセス不可）
- ページリロード時は `/api/auth/refresh` でaccessTokenを再取得

### 認証フロー

```
[アプリ起動]
    │
    ▼
AuthContext初期化
    │
    ├─ refreshToken Cookie あり → POST /api/auth/refresh
    │       │
    │       ├─ 成功 → accessToken保存 → 認証済み状態
    │       └─ 失敗 → 未認証状態 → ログイン画面へ
    │
    └─ refreshToken Cookie なし → 未認証状態 → ログイン画面へ

[API呼び出し]
    │
    ▼
fetchラッパー（Authorization: Bearer <accessToken>）
    │
    ├─ 200 OK → レスポンス返却
    ├─ 401 (TOKEN_EXPIRED) → POST /api/auth/refresh → リトライ
    └─ 401 (その他) → ログアウト → ログイン画面へ
```

### AuthContext 設計

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;  // 初期化中（リフレッシュ試行中）
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'GENERAL_USER' | 'STAFF' | 'ADMINISTRATOR';
}
```

## API通信層

### fetchラッパー（`api/client.ts`）

責務:
1. ベースURL付与（環境変数 `VITE_API_BASE_URL`）
2. accessTokenのAuthorizationヘッダー付与
3. 401レスポンス時の自動トークンリフレッシュ + リトライ（1回のみ）
4. リフレッシュの排他制御（複数リクエストが同時に401を受けた場合の競合防止）
5. APIエラーレスポンスの統一的なエラーオブジェクト変換
6. credentials: 'include'（Cookie送信）

```typescript
// 使用例
const response = await apiClient.post<LoginResponse>('/auth/login', {
  email, password
});

// エラー型
class ApiError extends Error {
  constructor(
    public readonly code: string,      // 例: 'AUTH_INVALID_CREDENTIALS'
    public readonly status: number,
    message: string,
    public readonly fieldErrors?: Record<string, string[]>,  // VALIDATION_ERROR時のフィールド単位エラー
  ) {
    super(message);
  }
}

// リフレッシュの排他制御
// 複数のAPIリクエストが同時に401を受けた場合、リフレッシュが1回だけ実行される
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
  return refreshPromise;
}
```

### 認証API関数（`api/auth.ts`）

```typescript
// Phase 1 で実装するAPI関数
const authApi = {
  login(email: string, password: string): Promise<LoginResponse>;
  logout(): Promise<void>;
  refresh(): Promise<RefreshResponse>;
  signup(email: string, pin: string): Promise<MessageResponse>;
  activate(token: string, password: string, displayName: string): Promise<LoginResponse>;
  forgotPassword(email: string): Promise<MessageResponse>;
  resetPassword(token: string, password: string): Promise<MessageResponse>;
  changePassword(currentPassword: string, newPassword: string): Promise<MessageResponse>;
  getProfile(): Promise<UserProfile>;
};
```

## ルートガード

### AuthGuard

未認証ユーザーを `/login` にリダイレクト。初期化中（isLoading）はローディング表示。

```
<AuthGuard>
  <MainLayout>
    <Outlet />
  </MainLayout>
</AuthGuard>
```

### RoleGuard

役割不足の場合、カレンダー画面（ホーム）にリダイレクト。

```
<RoleGuard roles={['STAFF', 'ADMINISTRATOR']}>
  <OrderPage />
</RoleGuard>
```

## ルート定義（更新版）

```
/                     → 認証状態に応じたリダイレクト（認証済み→/calendar、未認証→/login）

--- 公開ルート（AuthLayout） ---

/login                → LoginPage
/signup               → SignupPage
/activate?token=xxx   → ActivatePage
/forgot-password      → ForgotPasswordPage（新規）
/reset-password?token=xxx → ResetPasswordPage（新規）

--- 認証必須ルート（AuthGuard > MainLayout > Outlet） ---

/calendar             → CalendarPage
/history              → HistoryPage
/tickets              → TicketPage
/settings/password    → ChangePasswordPage（新規）

--- 認証必須 + RoleGuard(STAFF, ADMINISTRATOR) ---

/admin/orders         → OrderPage
/admin/guest          → GuestReservationPage

--- 認証必須 + RoleGuard(ADMINISTRATOR) ---

/admin/users          → UserManagementPage
```

> **Note**: 既存の `routes/index.tsx` はルートごとに `<MainLayout>` を個別ラッピングしているが、
> Step 4 で `AuthGuard > MainLayout > Outlet` のネスト構造にリファクタリングする。

## バリデーションルール

フロントエンドでのバリデーションはUX向上のため。最終的なバリデーションはバックエンドで行う。

```typescript
// utils/validation.ts
const rules = {
  // 社内アプリのため、必要に応じてドメイン制限（@company.com）を追加可能
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/, // 英字+数字+記号
  },
  pin: {
    minLength: 6,
    maxLength: 12,
  },
  displayName: {
    minLength: 1,
    maxLength: 50,
  },
};
```

## エラーハンドリング方針

### API エラー表示

| エラーコード | UI表示 |
|-------------|--------|
| `AUTH_INVALID_CREDENTIALS` | 「メールアドレスまたはパスワードが正しくありません」 |
| `AUTH_LOCKED_OUT` | 「アカウントがロックされています。15分後に再試行してください」 |
| `AUTH_TOKEN_EXPIRED` | 自動リフレッシュ（ユーザーには見せない） |
| `AUTH_INVALID_TOKEN` | 「リンクが無効または期限切れです」 |
| `VALIDATION_ERROR` | フィールド単位のエラー表示 |
| ネットワークエラー | 「サーバーに接続できません。ネットワーク接続を確認してください」 |

### 通知コンポーネント（Toast）

- 成功: 緑色トースト（3秒で自動消去）
- エラー: 赤色トースト（手動で閉じる）
- 画面上部に表示、複数スタック可能

**状態管理**: `ToastContext` + `useToast` フックで管理。App直下に `<ToastProvider>` を配置し、任意のコンポーネントから `useToast().show({ type, message })` で通知を表示する。Toast UIは React Portal でbody直下にレンダリングし、レイアウトに依存しない。

## Phase 1 実装スコープ

### 実装する
1. API通信層（fetchラッパー + 認証API関数 + 型定義）
2. AuthContext（認証状態管理 + トークンリフレッシュ）
3. ルートガード（AuthGuard + RoleGuard）
4. 既存認証画面のAPI接続（ログイン、サインアップ、アクティベーション）
5. パスワード管理画面（忘れた場合のリセット + ログイン後の変更）
6. 共通UIコンポーネント（LoadingSpinner、Toast）
7. Header/Sidebarの認証連携（ユーザー情報表示、ログアウト）
8. テスト（Vitest + React Testing Library）

### 実装しない（Phase 2 以降）
- 予約カレンダーのAPI接続
- チケット管理のAPI接続
- 管理画面のAPI接続
- Tanstack Query導入
- 外部状態管理ライブラリ

## Phase 1 実装順序

```
Step 1: テスト基盤セットアップ
        → Vitest + React Testing Library + テスト設定

Step 2: API通信層
        → api/types.ts → api/client.ts → api/auth.ts
        → テスト: client.tsのリトライ・エラー変換

Step 3: 認証コンテキスト
        → contexts/AuthContext.tsx → hooks/useAuth.ts
        → テスト: ログイン/ログアウト/リフレッシュ

Step 4: ルートガード + ルート構造リファクタリング
        → guards/AuthGuard.tsx → guards/RoleGuard.tsx
        → routes/index.tsx を AuthGuard > MainLayout > Outlet のネスト構造にリファクタ
        → / のスマートリダイレクト（認証済み→/calendar、未認証→/login）
        → テスト: 未認証リダイレクト・役割制御

Step 5: 共通UIコンポーネント
        → LoadingSpinner.tsx → ToastContext.tsx + Toast.tsx（Portal）
        → テスト: 表示・自動消去・useToast

Step 6: 認証画面のAPI接続
        → LoginPage → SignupPage → ActivatePage
        → ForgotPasswordPage（新規） → ResetPasswordPage（新規）
        → ChangePasswordPage（新規、/settings/password）
        → テスト: フォーム送信・エラー表示・リダイレクト

Step 7: レイアウトの認証連携
        → Header（ユーザー情報・ログアウト）
        → Sidebar（役割ベースナビゲーション）
        → MainLayout（AuthContext接続）
        → テスト: ユーザー情報表示・役割別メニュー

Step 8: バリデーション統一
        → utils/validation.ts → 既存フォームに適用
```

## 環境変数

```bash
# frontend/.env.example
VITE_API_BASE_URL=http://localhost:3000/api
```

## 関連ドキュメント

- [API設計](../03-api-design.md)
- [UI設計](./ui-design.md)
- [アーキテクチャ設計](./architecture.md)
- [IAMモジュール設計](./modules/iam.md)
