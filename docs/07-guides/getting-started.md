# Lunch Hub 開発環境セットアップ & 動作確認ガイド

このガイドでは、Lunch Hub のバックエンドを開発環境で起動し、動作確認・テストを行う手順を説明します。

---

## 目次

1. [事前準備（初回のみ）](#1-事前準備初回のみ)
2. [アプリケーションの起動](#2-アプリケーションの起動)
3. [動作確認（APIを叩いてみる）](#3-動作確認apiを叩いてみる)
4. [テストの実行](#4-テストの実行)
5. [アプリケーションの停止](#5-アプリケーションの停止)
6. [トラブルシューティング](#6-トラブルシューティング)

---

## 1. 事前準備（初回のみ）

### 1-1. 必要なソフトウェア

以下がインストールされていることを確認してください。

| ソフトウェア | 確認コマンド | 必要バージョン |
|-------------|-------------|---------------|
| Node.js | `node -v` | 18.x 以上 |
| npm | `npm -v` | 9.x 以上 |
| Docker Desktop | Docker Desktop を開く | 最新版 |

### 1-2. 環境変数ファイルの作成

`backend/.env.example` をコピーして `backend/.env` を作成します。

```powershell
cd D:\my-app\lunch-hub\backend
Copy-Item .env.example .env
```

> **注意**: `.env` ファイルにはパスワードやシークレットキーが含まれます。Git にコミットしないでください（`.gitignore` で除外済み）。

### 1-3. パッケージのインストール

```powershell
cd D:\my-app\lunch-hub\backend
npm install
```

初回は数分かかります。`node_modules` フォルダが作成されれば完了です。

---

## 2. アプリケーションの起動

毎回の開発作業の開始時に行う手順です。

### 2-1. Docker Desktop を起動する

Windows のスタートメニューから **Docker Desktop** を起動してください。
タスクバーにクジラのアイコンが表示され、「Docker Desktop is running」になるまで待ちます。

### 2-2. Docker コンテナを起動する

PowerShell を開いて以下を実行します。

```powershell
cd D:\my-app\lunch-hub
docker compose up -d
```

以下の3つのコンテナが起動します。

| コンテナ名 | 役割 | ポート |
|-----------|------|-------|
| lunch-hub-postgres | データベース (PostgreSQL) | 5432 |
| lunch-hub-redis | セッション管理 (Redis) | 6379 |
| lunch-hub-mailhog | メール確認用ツール | 8025 (Web画面), 1025 (SMTP) |

起動確認：

```powershell
docker compose ps
```

3つとも `Up` と表示されていれば OK です。

### 2-3. データベースのテーブルを作成する（初回のみ）

```powershell
cd D:\my-app\lunch-hub\backend
npm run migration:run
```

「Migration CreateIamTables... has been executed successfully.」と表示されれば成功です。

> **2回目以降**: テーブルが既に存在する場合は「0 migrations are new」と表示されるだけなので、毎回実行しても問題ありません。

### 2-4. バックエンドアプリを起動する

```powershell
cd D:\my-app\lunch-hub\backend
npm run start:dev
```

以下のようなログが表示されれば起動成功です。

```
[NestApplication] Nest application successfully started
[AdminSeedService] Admin user seeded: admin@company.com
```

> **ポイント**: `start:dev` はファイルを変更すると自動で再起動します（ホットリロード）。

---

## 3. 動作確認（APIを叩いてみる）

バックエンドが起動している状態で、**別の PowerShell ウィンドウ**を開いて操作します。

### 3-1. ヘルスチェック

アプリが動いているか確認します。

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api
```

```
Hello World!
```

と返ってくれば OK です。

### 3-2. 管理者ログイン

初期管理者アカウントでログインします。

```powershell
$response = Invoke-RestMethod -Uri http://localhost:3000/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"admin@company.com","password":"Admin123!"}'
$response.data
```

以下のような結果が返ります。

```
accessToken : eyJhbGciOiJIUzI1NiIs...（長い文字列）
user        : @{id=...; email=admin@company.com; displayName=管理者; role=ADMINISTRATOR}
```

### 3-3. ログインしたユーザーのプロフィールを取得

ログインで取得した accessToken を使って、認証が必要なAPIを叩きます。

```powershell
# 上の手順で $response に結果が入っている場合
$token = $response.data.accessToken
Invoke-RestMethod -Uri http://localhost:3000/api/users/me -Headers @{ Authorization = "Bearer $token" }
```

以下のような結果が返ります。

```
data : @{id=...; email=admin@company.com; displayName=管理者; role=ADMINISTRATOR; status=ACTIVE; ...}
```

### 3-4. ユーザー一覧を取得（管理者のみ）

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/admin/users -Headers @{ Authorization = "Bearer $token" }
```

### 3-5. メール送信の確認（MailHog）

招待メールやパスワードリセットメールの確認は、ブラウザで以下を開きます。

```
http://localhost:8025
```

MailHog の画面が開き、アプリから送信されたメールを確認できます。

---

## 4. テストの実行

テストはアプリを起動していなくても実行できます（E2Eテスト以外）。

### 4-1. ユニットテスト（全239件）

```powershell
cd D:\my-app\lunch-hub\backend
npm test
```

結果の見方：

```
Test Suites: 46 passed, 46 total    ← テストファイル数
Tests:       239 passed, 239 total  ← テストケース数
```

すべて `passed`（緑色）になっていれば OK です。

### 4-2. カバレッジ付きテスト

テストがコードのどれくらいをカバーしているか確認できます。

```powershell
npm run test:cov
```

実行後、`backend/coverage/lcov-report/index.html` をブラウザで開くと、ファイルごとのカバレッジを視覚的に確認できます。

### 4-3. 特定のテストだけ実行する

```powershell
# ファイル名の一部を指定
npx jest user.spec

# 特定のディレクトリ配下だけ
npx jest --testPathPattern=domain/aggregates
```

### 4-4. E2Eテスト（統合テスト）

E2Eテストは実際にデータベースやRedisを使うため、**Docker コンテナが起動している必要があります**。
ただし、アプリの起動（`npm run start:dev`）は不要です。

```powershell
cd D:\my-app\lunch-hub\backend
npm run test:e2e
```

### 4-5. Lint（コード品質チェック）

コードのスタイルや潜在的な問題をチェックします。

```powershell
npm run lint
```

何も出力されなければ問題なしです。

---

## 5. アプリケーションの停止

### 5-1. バックエンドアプリの停止

`npm run start:dev` を実行しているターミナルで：

```
Ctrl + C
```

「本当に停止しますか？」と聞かれたら `Y` を押してください。

### 5-2. Docker コンテナの停止

```powershell
cd D:\my-app\lunch-hub
docker compose down
```

> **注意**: `docker compose down` はコンテナを停止・削除しますが、データベースのデータは保持されます（ボリュームに保存）。

データベースのデータも完全に削除したい場合：

```powershell
docker compose down -v
```

> この場合、次回起動時に `npm run migration:run` を再実行する必要があります。

### 5-3. Docker Desktop の終了

タスクバーのクジラアイコンを右クリック → **Quit Docker Desktop**

---

## 6. トラブルシューティング

### Q. ポート 5432 が使えないエラーが出る

```
Error: listen tcp 0.0.0.0:5432: bind: An attempt was made to access a socket...
```

**原因**: Windows の Hyper-V がポートを予約している場合があります。

**対処法**:
1. まず PC を再起動してみる
2. それでも直らない場合 → `docker-compose.yml` のポートを変更

```yaml
# docker-compose.yml の postgres セクション
ports:
  - "5433:5432"  # 左側を 5433 に変更
```

```env
# backend/.env
DB_PORT=5433
```

### Q. `npm run start:dev` でエラーが出る

**Docker コンテナが起動しているか確認**：

```powershell
docker compose ps
```

3つとも `Up` になっていなければ `docker compose up -d` を再実行してください。

### Q. ログインしたら「Unauthorized」と返ってくる

accessToken の有効期限は **15分** です。期限切れの場合は再度ログインしてください。

### Q. データベースをリセットしたい

```powershell
cd D:\my-app\lunch-hub\backend

# テーブルを削除
npm run migration:revert

# テーブルを再作成
npm run migration:run
```

### Q. テストが失敗する

```powershell
# まず全テストを実行して状況を確認
npm test

# 失敗したテストだけ再実行（ファイル名を指定）
npx jest <失敗したファイル名>
```

---

## クイックリファレンス

毎回の作業で使うコマンドのまとめです。

```powershell
# === 起動 ===
docker compose up -d                     # Docker起動
cd backend && npm run migration:run      # DB準備（初回のみ）
cd backend && npm run start:dev          # アプリ起動

# === 確認 ===
# （別ターミナルで）
Invoke-RestMethod http://localhost:3000/api   # ヘルスチェック

# === テスト ===
cd backend && npm test                   # ユニットテスト
cd backend && npm run test:cov           # カバレッジ
cd backend && npm run test:e2e           # E2Eテスト
cd backend && npm run lint               # Lint

# === 停止 ===
Ctrl + C                                # アプリ停止
docker compose down                      # Docker停止
```
