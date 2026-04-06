# E2Eテスト (TC-01) 不具合修正レポート

**作成日**: 2026-04-05
**対象テスト**: TC-01（初回登録〜ログインフロー）

本ドキュメントは、TC-01の手動ブラウザE2Eテスト実施中に発見されたアプリケーションの実装不具合と、その解決策についてまとめたものです。

---

## 1. バックエンド: 招待メール送信時の 500 エラー

### 発見された不具合
管理者がユーザー招待画面からメールアドレスを送信した際、`500 Internal Server Error` が発生して招待に失敗する事象が確認されました。
原因は、開発環境用の SMTP サーバー（MailHogなど）を利用する際、環境変数 `SMTP_USER` および `SMTP_PASS` が空（未設定）になっている場合でも、Nodemailer の `auth` 設定オブジェクトが無理やり渡されていたためです。空の認証情報でSMTPサーバーに接続しようとして、認証不能によるエラーが発生していました。

### 修正内容
`backend/src/modules/iam/infrastructure/services/nodemailer-email.service.ts` を修正しました。
Nodemailer 用の `Transport` 初期化時に、ユーザー名（`SMTP_USER`）が存在する場合のみ `auth` プロパティを付与するように条件分岐を追加しました。

```typescript
const options: nodemailer.TransportOptions = {
  host: this.configService.get('mail.host'),
  port: this.configService.get('mail.port'),
  secure: this.configService.get('mail.secure'),
};

const user = this.configService.get<string>('mail.user');
const pass = this.configService.get<string>('mail.pass');

if (user) {
  options.auth = { user, pass };
}

this.transporter = nodemailer.createTransport(options);
```
これにより認証不要なローカルのMailHogに対して正常にメールが送信されるようになりました。

---

## 2. フロントエンド: アカウント有効化時の 404 エラー

### 発見された不具合
招待されたユーザーがメールに記載されたリンクから「アカウント有効化画面 (`ActivatePage.tsx`) 」を開き、データを送信した際、本来バックエンド (`http://localhost:3000/api/...`) に飛ぶべきAPIリクエストが フロントエンド自身の URL (`http://localhost:5173/api/auth/activate`) に対して送信され、APIが存在しないため `404 Not Found` が返る不具合が確認されました。

調査の結果、以下の原因が判明しました：
1. `ActivatePage.tsx` や `SignupPage.tsx` といった「非ログイン状態」で動く各画面において、`new ApiClient()` を用いてページごとに個別のAPIクライアントを手動生成していた。
2. 生成時の設定 `baseUrl: import.meta.env['VITE_API_BASE_URL'] ?? '/api'` が問題だった。Vite はブラケット記法(`['...']`)の環境変数を静的置換しないため、実行時に評価され `undefined` となり、常にフォールバックである相対パス `'/api'` が使われてしまっていた。
3. 相対パスが使われた結果、Fetch API がアクセス元のFQDN（フロントの`localhost:5173`）を起点にしてリクエストを構築してしまった。

### 修正内容
各ページで独自に `ApiClient` を生成する設計を改め、アプリケーション全体で共有している正しい `apiClient` インスタンスを利用するように統一しました。
ただし、単に `routes/index.tsx` からインポートしようとすると **「ページコンポーネント」と「ルーターファイル」の間で循環参照（Circular Dependency）** が発生して React アプリがクラッシュしたため、以下の手順で基盤を整理しました。

1. **インスタンス共有ファイルの切り出し (`src/api/client-instance.ts`)**
   ```typescript
   import { ApiClient } from './client';
   export const apiClient = new ApiClient({
     baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
   });
   ```
2. **各コンポーネントからの参照変更**
   `routes/index.tsx` や `ActivatePage.tsx`, `SignupPage.tsx`, `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx`, `ChangePasswordPage.tsx` が独自生成をやめ、上記で作成した共有 `apiClient` をインポートして使用するように書き換えました。

この対応により、ログイン前を含むすべての画面から確実に `http://localhost:3000/api` 宛てにリクエストが送信されるようになり、無事にアカウントの有効化やログインが完了するようになりました。
