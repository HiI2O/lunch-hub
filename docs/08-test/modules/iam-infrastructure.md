# IAM Infrastructure Layer テスト仕様

IAM モジュール Infrastructure 層（サービス・リポジトリ）のテスト仕様書。

設計ドキュメントから導出:
- [IAM モジュール設計](../../02-design/modules/iam.md)
- [テスト戦略 > Infrastructure層](../strategy.md)

---

## サービス

### NodemailerEmailService

設計根拠: [IAM設計 > IEmailService ポート](../../02-design/modules/iam.md)

外部依存（nodemailer Transporter）をモックし、アダプタロジックを検証する。

#### send()

- [ ] 正常: `SendEmailParams` を渡すと `transporter.sendMail` が呼ばれる
- [ ] 正常: `from` に ConfigService の `mail.from` の値が設定される
- [ ] 正常: `to`, `subject`, `html` が `SendEmailParams` の値と一致する
- [ ] 正常: `mail.from` 未設定時にデフォルト `noreply@lunch-hub.local` が使用される
- [ ] 異常: `transporter.sendMail` が例外をスローした場合、例外が伝播する

#### コンストラクタ

- [ ] 正常: ConfigService から `mail.host`, `mail.port`, `mail.secure`, `mail.user`, `mail.pass` を読み取り Transporter を生成する

---

### RedisRateLimiter

設計根拠: [IAM設計 > IRateLimiter ポート](../../02-design/modules/iam.md)

外部依存（Redis）をモックし、レート制限ロジックを検証する。

#### isRateLimited()

- [ ] 正常: キーが存在しない場合 → `false` を返す
- [ ] 正常: 現在値が `maxAttempts` 未満 → `false` を返す
- [ ] 正常: 現在値が `maxAttempts` と等しい → `true` を返す
- [ ] 正常: 現在値が `maxAttempts` を超える → `true` を返す

#### increment()

- [ ] 正常: `redis.incr` でキーをインクリメントする
- [ ] 正常: 初回インクリメント（結果が1）の場合、`redis.expire` で TTL を設定する
- [ ] 正常: 2回目以降のインクリメントでは `redis.expire` を呼ばない

#### reset()

- [ ] 正常: `redis.del` でキーを削除する

---

### RedisSessionRepository

設計根拠: [IAM設計 > ISessionRepository](../../02-design/modules/iam.md)

外部依存（Redis）をモックし、セッション永続化ロジックを検証する。

#### save()

- [ ] 正常: セッションデータを JSON シリアライズして `session:{id}` キーに保存する
- [ ] 正常: `refreshToken:{token}` キーにセッション ID をマッピングする
- [ ] 正常: `user:{userId}:sessions` セットにセッション ID を追加する
- [ ] 正常: 各キーに TTL（7日 = 604800秒）が設定される
- [ ] 正常: pipeline を使って一括実行される

#### findById()

- [ ] 正常: 存在するセッション ID → `Session` ドメインオブジェクトを返す
- [ ] 正常: 存在しないセッション ID → `null` を返す
- [ ] 正常: JSON デシリアライズで `Session.reconstruct` が正しく呼ばれる
- [ ] 正常: `isRevoked: true` のセッションが正しく復元される（revoked 状態の保持）

#### findByRefreshToken()

- [ ] 正常: 存在するリフレッシュトークン → 対応する `Session` を返す
- [ ] 正常: 存在しないリフレッシュトークン → `null` を返す

#### findByUserId()

- [ ] 正常: ユーザーに紐づくセッション一覧を返す
- [ ] 正常: セッションが0件の場合 → 空配列を返す
- [ ] 正常: 期限切れで Redis から消えたセッション ID はスキップする

#### delete()

- [ ] 正常: セッションキー、リフレッシュトークンキー、ユーザーセッションセットから削除する
- [ ] 正常: 存在しないセッション ID → 何もしない（エラーにならない）

#### deleteAllByUserId()

- [ ] 正常: ユーザーの全セッションを削除する
- [ ] 正常: ユーザーセッションセット自体も削除する

---

### AuditLogService

設計根拠: [IAM設計 > 監査ログ](../../02-design/modules/iam.md)

外部依存（TypeORM Repository）をモックし、監査ログ記録ロジックを検証する。

#### log()

- [ ] 正常: 必須パラメータ（`actionType`, `category`）のみで保存できる
- [ ] 正常: 全パラメータ指定時に正しくエンティティに変換される
- [ ] 正常: オプショナル項目（`actorId`, `targetType`, `targetId`, `details`, `ipAddress`）未指定時は `null` が設定される
- [ ] 正常: `id` に UUID が自動生成される
- [ ] 正常: `repo.save` が1回呼ばれる

---

## リポジトリ（TypeORM）

### TypeormUserRepository

設計根拠: [IAM設計 > IUserRepository](../../02-design/modules/iam.md)

外部依存（TypeORM Repository, UserMapper）をモックし、リポジトリのアダプタロジックを検証する。

#### save()

- [ ] 正常: `UserMapper.toPersistence` でエンティティに変換し `repo.save` を呼ぶ

#### findById()

- [ ] 正常: 存在する ID → `UserMapper.toDomain` でドメインオブジェクトを返す
- [ ] 正常: 存在しない ID → `null` を返す

#### findByEmail()

- [ ] 正常: 存在するメール → ドメインオブジェクトを返す
- [ ] 正常: 存在しないメール → `null` を返す

#### findByInvitationToken()

- [ ] 正常: 存在するトークン → ドメインオブジェクトを返す
- [ ] 正常: 存在しないトークン → `null` を返す

#### existsByEmail()

- [ ] 正常: 存在するメール → `true` を返す
- [ ] 正常: 存在しないメール → `false` を返す

#### findAll()

- [ ] 正常: 全ユーザーをドメインオブジェクトの配列で返す
- [ ] 正常: ユーザー0件 → 空配列を返す

---

### TypeormPasswordResetTokenRepository

設計根拠: [IAM設計 > IPasswordResetTokenRepository](../../02-design/modules/iam.md)

#### save()

- [ ] 正常: `PasswordResetTokenMapper.toPersistence` で変換し `repo.save` を呼ぶ

#### findByToken()

- [ ] 正常: 存在するトークン → `PasswordResetTokenMapper.toDomain` でレコードを返す
- [ ] 正常: 存在しないトークン → `null` を返す

#### deleteByUserId()

- [ ] 正常: `repo.delete` でユーザー ID に紐づくレコードを削除する

---

## テスト対象外（理由付き）

| 対象 | 理由 |
|------|------|
| TypeORM のクエリ実行そのもの | フレームワークが保証。リポジトリテストは Mapper 連携とクエリ条件の正しさを検証 |
| Redis の接続・切断処理 | NestJS モジュールのライフサイクルで管理。テストでは Redis クライアントをモック |
| nodemailer の SMTP 通信 | 外部依存。Transporter をモックしてアダプタの引数組み立てを検証 |
| Mapper の変換ロジック詳細 | Mapper のユニットテスト（`user.mapper.spec.ts` 等）で検証済み |
| TypeORM リポジトリの DB エラー伝播 | TypeORM がスローする例外はそのまま NestJS のエラーハンドリングに委ねる。アダプタ層でキャッチ・変換するロジックがないため、テスト対象外 |
