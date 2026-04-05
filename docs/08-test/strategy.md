# テスト戦略

## 目的

このドキュメントは、Lunch Hub プロジェクト全体のテスト方針を定義する。
各モジュールのテスト仕様書（何をテストするか）は、このドキュメントの方針に従って作成する。

## テストの種類と責務

### Unit Test（ユニットテスト）

テスト対象のクラス/関数を**単体で**検証する。外部依存はすべてモック。

| 層 | テスト対象 | 検証内容 |
|----|-----------|---------|
| Domain - Value Object | 各VO | 生成ルール、バリデーション、等価性、不正値の拒否 |
| Domain - Aggregate | 集約ルート | 不変条件（invariant）の維持、状態遷移、ドメインイベントの発行 |
| Domain - Domain Service | ドメインサービス | 複数集約をまたぐビジネスルールの判定 |
| Application - Use Case | 各ユースケース | 正常系フロー、異常系（not found, validation, 権限）、リポジトリ/ポートの呼び出し検証 |
| Infrastructure - Mapper | マッパー | ドメインモデル ↔ 永続化モデルの双方向変換の正確性 |
| Infrastructure - Service | 外部サービスアダプタ | アダプタロジックの検証（外部API自体はモック） |
| Presentation - Controller | コントローラー | ユースケース委譲の確認、レスポンス形式、Cookie/ヘッダー操作 |
| Presentation - Guard | ガード | 認可ロジック（ロール判定、トークン検証） |
| Presentation - DTO | DTOバリデーション | class-validator によるバリデーションルール |
| Frontend - API Client | APIクライアント | リクエストURL/ボディの構築、レスポンスのパース |
| Frontend - Hook | カスタムフック | 状態遷移、副作用の発火タイミング |
| Frontend - Component | UIコンポーネント | レンダリング結果、ユーザー操作への応答 |

### Integration Test（結合テスト）

複数のコンポーネントを**結合した状態で**検証する。DBやRedisは実際に接続する。

| 対象 | 検証内容 |
|------|---------|
| Repository実装 | TypeORMリポジトリがドメインモデルを正しく永続化・復元できるか |
| Module全体 | NestJSモジュール内のDI配線が正しく動作するか |

### E2E Test（エンドツーエンドテスト）

APIエンドポイントを**HTTPリクエストレベル**で検証する。

| 対象 | 検証内容 |
|------|---------|
| APIシナリオ | 認証→操作→結果確認の一連のフローが正しく動作するか |
| 認証・認可 | JWT認証、ロールベースアクセス制御がHTTPレベルで機能するか |
| エラーレスポンス | 不正リクエストに対して適切なHTTPステータスとエラーボディを返すか |

## テストケース設計の基準

### 必須カバーするケース

各テスト対象に対して、以下のカテゴリを漏れなく検討する。

1. **正常系（Happy Path）** — 典型的な成功パターン
2. **異常系（Error Path）** — 予期されるエラー（バリデーション失敗、認証失敗、リソース不在）
3. **境界値（Boundary）** — 値の上限/下限、空文字、長さの閾値
4. **状態遷移（State Transition）** — 集約の状態に依存する操作の許可/拒否

### 省略してよいケース

- フレームワークが保証する動作（NestJSのDI解決、class-validatorのデコレータ動作そのもの）
- 純粋な委譲のみのコード（ロジックなしの単純パススルー）
- TypeScriptの型システムで防がれるケース（型不一致）

## モック方針

### ユニットテストでモックするもの

| 依存 | モック方法 |
|------|-----------|
| リポジトリ | インターフェースの `jest.Mocked<T>` / `vi.fn()` |
| 外部サービス（メール、ハッシュ、JWT） | ポートインターフェースの mock |
| 時刻 | `jest.useFakeTimers()` / テスト用の固定日時注入 |
| UUID生成 | テスト用の固定ID注入 |
| fetch (Frontend) | `vi.fn()` で差し替え |

### モックしないもの

| 対象 | 理由 |
|------|------|
| Value Object | ドメインの一部。実オブジェクトを使うことで不変条件を二重検証 |
| ドメインサービス（ユースケース内） | ユースケースの正確な動作検証には実ロジックが必要 |
| DB/Redis（結合テスト） | 永続化の正確性を検証するのが目的 |

## テストデータ

### ファクトリパターン

テストデータはファクトリ関数で生成する。テスト間でハードコードされたデータを共有しない。

```typescript
// Good: ファクトリ関数
function createActiveUser(overrides?: Partial<UserProps>): User {
  return User.reconstruct({
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: EmailAddress.create('test@example.com'),
    status: UserStatus.create('ACTIVE'),
    ...overrides,
  });
}

// Bad: グローバル変数
const testUser = User.reconstruct({ ... }); // テスト間で状態が共有される
```

### テスト用定数

パスワードハッシュなど生成コストの高い値は、テスト用定数として定義してよい。

```typescript
const VALID_HASH = '$2b$12$LJ3m4ys3Lg4CeQxrVBMOAOjFYpl1EUW5P4m3GJjfvAY5f6km2gBHa';
```

## カバレッジ

### 目標値

| 指標 | 目標 | 備考 |
|------|------|------|
| 行カバレッジ (Lines) | 80%以上 | 新規コード必須 |
| 分岐カバレッジ (Branches) | 70%以上 | 条件分岐の網羅を重視 |

### カバレッジ計測対象外

- `index.ts`（re-export のみ）
- `*.module.ts`（NestJS モジュール定義のみ）
- `main.ts`（エントリポイント）
- マイグレーションファイル

## テスト記述規約

（`.claude/rules/testing/conventions.md` に準拠）

- AAA パターン: Arrange → Act → Assert
- describe: クラス名/ユースケース名
- it: 日本語「〜の場合、〜する」形式
- テスト間の独立性を保つ（共有状態禁止）

## モジュールテスト仕様書

Phase 2（Reservation）以降、各モジュールの実装前に以下の形式でテスト仕様書を作成する。

配置: `docs/08-test/modules/{module-name}.md`

```markdown
# {Module Name} テスト仕様

## Domain Layer

### Value Objects
- {VO名}
  - [ ] 正常: {テストケース}
  - [ ] 異常: {テストケース}
  - [ ] 境界: {テストケース}

### Aggregates
- {集約名}
  - [ ] {操作}: {テストケース}
  - [ ] 不変条件: {テストケース}
  - [ ] 状態遷移: {テストケース}

## Application Layer

### Use Cases
- {ユースケース名}
  - [ ] 正常: {テストケース}
  - [ ] 異常: {テストケース}

## Infrastructure Layer
...

## Presentation Layer
...
```

## ツール

| 環境 | テストランナー | アサーション | モック |
|------|-------------|------------|-------|
| Backend | Jest | Jest built-in | `jest.fn()`, `jest.Mocked<T>` |
| Frontend | Vitest | Vitest built-in | `vi.fn()` |
| E2E | Jest + supertest | Jest built-in | なし（実サーバー） |
