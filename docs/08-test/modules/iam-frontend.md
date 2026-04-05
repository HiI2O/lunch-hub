# IAM Frontend テスト仕様

Phase 1 Frontend（認証基盤 + 認証画面）のテスト仕様書。

設計ドキュメントから導出:
- [フロントエンド設計](../../02-design/frontend.md)
- [API設計](../../03-api-design.md)
- [認証フロー詳細](../../05-implementation/authentication-flows.md)

---

## API通信層

### ApiClient (`api/client.ts`)

設計根拠: [フロントエンド設計 > fetchラッパー](../../02-design/frontend.md)

ApiClient の責務は6つ: ベースURL付与、Authorization ヘッダー付与、401時の自動リフレッシュ+リトライ、リフレッシュ排他制御、エラー変換、credentials: include。

#### 基本リクエスト
- [ ] GET リクエストにベースURLが付与される
- [ ] POST リクエストで body が JSON 送信される（Content-Type: application/json）
- [ ] PUT リクエストを送信できる
- [ ] DELETE リクエストを送信できる
- [ ] body がない場合、Content-Type ヘッダーを付与しない
- [ ] すべてのリクエストに `credentials: 'include'` が設定される（Cookie送信のため）
- [ ] レスポンスの `data` フィールドを返す（`ApiResponse<T>` のアンラップ）

#### Authorization ヘッダー
- [ ] accessToken 設定時に `Authorization: Bearer <token>` ヘッダーを付与する
- [ ] accessToken 未設定時は Authorization ヘッダーなし

#### エラー変換
設計根拠: [API設計 > エラーコード一覧](../../03-api-design.md)

- [ ] APIエラーレスポンス（`{ error: { code, message } }`）を `ApiError` に変換する
- [ ] `VALIDATION_ERROR` 時の `fieldErrors`（`Record<string, string[]>`）を保持する
- [ ] レスポンスボディが JSON パース不能な場合、`UNKNOWN_ERROR` + HTTP ステータスで `ApiError` を生成する
- [ ] ネットワークエラー（fetch 自体の失敗）を `ApiError(NETWORK_ERROR, 0)` に変換する

#### 自動トークンリフレッシュ
設計根拠: [認証フロー > トークンリフレッシュ処理](../../05-implementation/authentication-flows.md)

- [ ] 401 + `AUTH_TOKEN_EXPIRED` の場合、リフレッシュ後にリトライする
- [ ] リトライ時に新しい accessToken が使われる
- [ ] `AUTH_TOKEN_EXPIRED` 以外の 401（例: `AUTH_INVALID_CREDENTIALS`）ではリフレッシュしない
- [ ] リフレッシュハンドラ未設定時はリフレッシュせずエラーを返す
- [ ] リフレッシュ失敗時はリトライせず**元のエラー**を返す（リフレッシュエラーではなく）
- [ ] リトライは1回のみ（リトライ後の401では再リフレッシュしない）

#### リフレッシュ排他制御
設計根拠: [フロントエンド設計 > リフレッシュの排他制御](../../02-design/frontend.md)

- [ ] 同時に複数リクエストが 401 を受けても、リフレッシュは1回だけ実行される
- [ ] 全リクエストが新しいトークンでリトライされ成功する

### AuthApi (`api/auth.ts`)

設計根拠: [API設計 > 認証関連API](../../03-api-design.md), [フロントエンド設計 > 認証API関数](../../02-design/frontend.md)

各関数が正しいHTTPメソッド・パス・ボディで ApiClient を呼ぶことを検証。

- [ ] `login(email, password)` → POST `/auth/login` + `{ email, password }`
- [ ] `logout()` → POST `/auth/logout`（ボディなし）
- [ ] `refresh()` → POST `/auth/refresh`（ボディなし）
- [ ] `signup(email, pin)` → POST `/auth/signup` + `{ email, pin }`
- [ ] `activate(token, password, displayName)` → POST `/auth/activate` + `{ token, password, displayName }`
- [ ] `forgotPassword(email)` → POST `/auth/forgot-password` + `{ email }`
- [ ] `resetPassword(token, password)` → POST `/auth/reset-password` + `{ token, password }`
- [ ] `changePassword(currentPassword, newPassword)` → PUT `/users/me/password` + `{ currentPassword, newPassword }`
- [ ] `getProfile()` → GET `/users/me`

---

## 認証コンテキスト

### AuthContext / AuthProvider (`contexts/AuthContext.tsx`)

設計根拠: [フロントエンド設計 > 認証アーキテクチャ > 認証フロー](../../02-design/frontend.md)

#### 初期化（アプリ起動時のセッション復元）
- [ ] 初期化中は `isLoading=true`, `isAuthenticated=false`, `user=null`
- [ ] リフレッシュ成功時: accessToken を取得 → プロフィール取得 → `isAuthenticated=true`, `user` にプロフィール設定
- [ ] リフレッシュ失敗時: `isAuthenticated=false`, `user=null`, accessToken クリア
- [ ] 初期化完了後、いずれの場合も `isLoading=false`

#### login
- [ ] 成功時: accessToken を client に設定、`user` にレスポンスのユーザー情報を設定、`isAuthenticated=true`
- [ ] 失敗時: エラーを throw（呼び出し元で処理）、状態は未認証のまま

#### logout
- [ ] API 呼び出し後: accessToken クリア、`user=null`, `isAuthenticated=false`
- [ ] API 呼び出しが失敗しても: accessToken クリア、`user=null` （finally で処理）

#### updateUser
- [ ] `user` の値が即座に更新される

#### トークンリフレッシュハンドラ連携
- [ ] `client` にリフレッシュハンドラが登録される
- [ ] ハンドラは `authApi.refresh()` を呼び、取得した accessToken を client に設定して返す
- [ ] アンマウント時にハンドラが解除される

#### useAuth フック
- [ ] `AuthProvider` 内で使用すると `AuthContextValue` を返す
- [ ] `AuthProvider` 外で使用すると `Error('useAuth must be used within an AuthProvider')` を throw

### ToastContext / ToastProvider (`contexts/ToastContext.tsx`)

設計根拠: [フロントエンド設計 > 通知コンポーネント（Toast）](../../02-design/frontend.md)

#### 表示
- [ ] `show({ type: 'success', message })` で成功トーストが表示される
- [ ] `show({ type: 'error', message })` でエラートーストが表示される
- [ ] トーストは `role="alert"` を持つ（アクセシビリティ）
- [ ] 複数のトーストを同時にスタック表示できる

#### 自動消去
- [ ] success トーストは 3秒後に自動消去される
- [ ] error トーストは自動消去されない（手動で閉じる必要がある）

#### 手動消去
- [ ] error トーストの閉じるボタンで消去できる

#### useToast フック
- [ ] `ToastProvider` 内で使用すると `show` 関数を返す
- [ ] `ToastProvider` 外で使用すると `Error('useToast must be used within a ToastProvider')` を throw

---

## ルートガード

### AuthGuard (`guards/AuthGuard.tsx`)

設計根拠: [フロントエンド設計 > ルートガード > AuthGuard](../../02-design/frontend.md)

- [ ] `isLoading=true` の場合: ローディング表示（`role="status"`）
- [ ] 未認証（`isAuthenticated=false`）の場合: `/login` にリダイレクト
- [ ] 認証済みの場合: 子ルート（`Outlet`）を表示

### RoleGuard (`guards/RoleGuard.tsx`)

設計根拠: [フロントエンド設計 > ルートガード > RoleGuard](../../02-design/frontend.md)

- [ ] 許可ロールに一致するユーザーの場合: 子ルートを表示
- [ ] 許可ロールに一致しないユーザーの場合: `/calendar` にリダイレクト
- [ ] `user=null` の場合: `/calendar` にリダイレクト
- [ ] 複数ロール指定時の組み合わせ検証:
  - [ ] `roles=['STAFF', 'ADMINISTRATOR']` に STAFF → 許可
  - [ ] `roles=['STAFF', 'ADMINISTRATOR']` に ADMINISTRATOR → 許可
  - [ ] `roles=['STAFF', 'ADMINISTRATOR']` に GENERAL_USER → 拒否
  - [ ] `roles=['ADMINISTRATOR']` に STAFF → 拒否

---

## 共通 UI コンポーネント

### LoadingSpinner (`components/ui/LoadingSpinner.tsx`)

- [ ] `role="status"` で表示される（スクリーンリーダー対応）
- [ ] デフォルトの `aria-label` が設定される
- [ ] カスタム `label` を指定できる

---

## 認証画面

### LoginPage (`pages/auth/LoginPage.tsx`)

設計根拠: [API設計 > ログイン](../../03-api-design.md), [認証フロー > ログイン処理 > エラーハンドリング](../../05-implementation/authentication-flows.md)

#### レンダリング
- [ ] メールアドレス入力欄が表示される
- [ ] パスワード入力欄が表示される
- [ ] ログインボタンが表示される
- [ ] サインアップ画面へのリンクが表示される
- [ ] パスワードを忘れた場合のリンクが表示される

#### バリデーション（フロントエンド）
設計根拠: [フロントエンド設計 > バリデーションルール](../../02-design/frontend.md)

- [ ] メール未入力で submit → バリデーションエラー表示
- [ ] パスワード未入力で submit → バリデーションエラー表示
- [ ] 不正なメール形式で submit → バリデーションエラー表示

#### API 連携
- [ ] 正常: 有効な認証情報で submit → `login()` 呼び出し → `/calendar` に遷移
- [ ] 異常: `AUTH_INVALID_CREDENTIALS` → エラーメッセージ表示（「メールアドレスまたはパスワードが正しくありません」）
- [ ] 異常: `AUTH_LOCKED_OUT` → エラーメッセージ表示（「アカウントがロックされています。15分後に再試行してください」）
- [ ] 異常: ネットワークエラー → エラーメッセージ表示
- [ ] 状態: 送信中はボタンが disabled になる（二重送信防止）
- [ ] 状態: 送信中はローディング表示が出る

### SignupPage (`pages/auth/SignupPage.tsx`)

設計根拠: [API設計 > セルフサインアップ](../../03-api-design.md), [認証フロー > セルフサインアップ処理](../../05-implementation/authentication-flows.md)

#### レンダリング
- [ ] メールアドレス入力欄が表示される
- [ ] PINコード入力欄が表示される
- [ ] 登録ボタンが表示される
- [ ] ログイン画面へのリンクが表示される

#### バリデーション（フロントエンド）
- [ ] メール未入力で submit → バリデーションエラー表示
- [ ] 不正なメール形式で submit → バリデーションエラー表示
- [ ] PIN 未入力で submit → バリデーションエラー表示
- [ ] PIN が 6文字未満で submit → バリデーションエラー表示
- [ ] PIN が 12文字超過で submit → バリデーションエラー表示

#### API 連携
- [ ] 正常: 登録成功 → 完了メッセージ表示（「招待メールを送信しました」）
- [ ] 異常: PIN 不一致（`AUTH_INVALID_CREDENTIALS` or 401） → エラーメッセージ表示
- [ ] 異常: メール重複（409） → エラーメッセージ表示
- [ ] 異常: ネットワークエラー → エラーメッセージ表示
- [ ] 状態: 送信中はボタンが disabled になる

### ActivatePage (`pages/auth/ActivatePage.tsx`)

設計根拠: [API設計 > アカウントアクティベーション](../../03-api-design.md), [認証フロー > アカウント有効化処理](../../05-implementation/authentication-flows.md)

#### レンダリング
- [ ] パスワード入力欄が表示される
- [ ] パスワード確認入力欄が表示される
- [ ] 表示名入力欄が表示される
- [ ] 有効化ボタンが表示される

#### URL パラメータ
- [ ] URLクエリパラメータ `?token=xxx` からトークンを取得する
- [ ] トークンがURLに含まれない場合、エラー表示またはリダイレクト

#### バリデーション（フロントエンド）
設計根拠: [認証フロー > セキュリティ実装詳細 > パスワードポリシー](../../05-implementation/authentication-flows.md)

- [ ] パスワード未入力で submit → バリデーションエラー
- [ ] パスワードが 8文字未満 → バリデーションエラー
- [ ] パスワードに英字が含まれない → バリデーションエラー
- [ ] パスワードに数字が含まれない → バリデーションエラー
- [ ] パスワードに記号（`!@#$%^&*`）が含まれない → バリデーションエラー
- [ ] パスワードと確認が不一致 → バリデーションエラー
- [ ] 表示名未入力で submit → バリデーションエラー
- [ ] 表示名が 50文字超過 → バリデーションエラー

#### API 連携
- [ ] 正常: 有効化成功 → 自動ログイン（accessToken 取得）→ `/calendar` に遷移
- [ ] 異常: トークン不正（404）→ 「リンクが無効または期限切れです」
- [ ] 異常: トークン期限切れ（410）→ 「リンクが無効または期限切れです」
- [ ] 異常: パスワードポリシー違反（400）→ サーバー側バリデーションエラー表示
- [ ] 異常: ネットワークエラー → エラーメッセージ表示
- [ ] 状態: 送信中はボタンが disabled になる

### ForgotPasswordPage (`pages/auth/ForgotPasswordPage.tsx`)

設計根拠: [API設計 > パスワードリセット要求](../../03-api-design.md), [認証フロー > パスワードリセット処理 > リセット要求](../../05-implementation/authentication-flows.md)

#### レンダリング
- [ ] メールアドレス入力欄が表示される
- [ ] 送信ボタンが表示される
- [ ] ログイン画面へのリンクが表示される

#### バリデーション
- [ ] メール未入力で submit → バリデーションエラー
- [ ] 不正なメール形式で submit → バリデーションエラー

#### API 連携
- [ ] 正常: 送信成功 → 完了メッセージ表示（「パスワードリセットメールを送信しました」）
- [ ] 正常: 存在しないメールでも成功メッセージを表示する（情報漏洩防止、サーバー側で制御）
- [ ] 異常: ネットワークエラー → エラーメッセージ表示
- [ ] 状態: 送信中はボタンが disabled になる

### ResetPasswordPage (`pages/auth/ResetPasswordPage.tsx`)

設計根拠: [API設計 > パスワードリセット](../../03-api-design.md), [認証フロー > パスワードリセット処理 > リセット実行](../../05-implementation/authentication-flows.md)

#### レンダリング
- [ ] 新しいパスワード入力欄が表示される
- [ ] パスワード確認入力欄が表示される
- [ ] 送信ボタンが表示される

#### URL パラメータ
- [ ] URLクエリパラメータ `?token=xxx` からトークンを取得する
- [ ] トークンがURLに含まれない場合、エラー表示またはリダイレクト

#### バリデーション
- [ ] パスワード未入力 → バリデーションエラー
- [ ] パスワードが 8文字未満 → バリデーションエラー
- [ ] パスワードポリシー違反（英字+数字+記号）→ バリデーションエラー
- [ ] パスワードと確認が不一致 → バリデーションエラー

#### API 連携
- [ ] 正常: リセット成功 → 完了メッセージ → ログイン画面へ遷移
- [ ] 異常: トークン不正/期限切れ → エラーメッセージ表示
- [ ] 異常: ネットワークエラー → エラーメッセージ表示
- [ ] 状態: 送信中はボタンが disabled になる

### ChangePasswordPage (新規: `/settings/password`)

設計根拠: [API設計 > パスワード変更](../../03-api-design.md)

#### レンダリング
- [ ] 現在のパスワード入力欄が表示される
- [ ] 新しいパスワード入力欄が表示される
- [ ] 新しいパスワード確認入力欄が表示される
- [ ] 変更ボタンが表示される

#### バリデーション
- [ ] 現在のパスワード未入力 → バリデーションエラー
- [ ] 新しいパスワードが 8文字未満 → バリデーションエラー
- [ ] 新しいパスワードポリシー違反 → バリデーションエラー
- [ ] 新しいパスワードと確認が不一致 → バリデーションエラー

#### API 連携
- [ ] 正常: 変更成功 → 成功メッセージ表示（トースト）
- [ ] 異常: 現在のパスワード不正 → エラーメッセージ表示
- [ ] 異常: ネットワークエラー → エラーメッセージ表示
- [ ] 状態: 送信中はボタンが disabled になる

---

## レイアウト認証連携

### Header (`components/layout/Header.tsx`)

設計根拠: [フロントエンド設計 > Step 7](../../02-design/frontend.md)

- [ ] 認証済み: ユーザーの表示名が表示される
- [ ] 認証済み: ログアウトボタンが表示される
- [ ] ログアウトボタン押下: `logout()` が呼ばれ、ログイン画面に遷移する
- [ ] 未認証: ユーザー情報が表示されない

### Sidebar (`components/layout/Sidebar.tsx`)

設計根拠: [フロントエンド設計 > ルート定義](../../02-design/frontend.md)

- [ ] GENERAL_USER: カレンダー、履歴、チケットのメニューが表示される
- [ ] GENERAL_USER: 管理メニューが表示されない
- [ ] STAFF: 上記 + 注文管理、ゲスト予約のメニューが表示される
- [ ] ADMINISTRATOR: 上記 + ユーザー管理のメニューが表示される

---

## テスト対象外（理由付き）

| 対象 | 理由 |
|------|------|
| `routes/index.tsx` | ルート定義のみ。AuthGuard / RoleGuard テストで間接カバー |
| `api/types.ts` | 型定義のみ。ランタイムコードなし |
| `contexts/auth-context-value.ts` | `createContext` + 型エクスポートのみ |
| `contexts/toast-context-value.ts` | `createContext` + 型エクスポートのみ |
| `App.tsx`, `main.tsx` | エントリポイント。E2E で確認 |
| `pages/reservation/*`, `pages/admin/*`, `pages/ticket/*` | Phase 2 以降のスコープ |
