import { Link } from 'react-router-dom';

export function LoginPage() {
  return (
    <>
      <h2 className="auth-title">ログイン</h2>
      <form>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            className="form-input"
            placeholder="example@company.com"
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            パスワード
          </label>
          <input
            type="password"
            id="password"
            className="form-input"
            placeholder="••••••••"
          />
        </div>
        <div className="form-group">
          <Link to="/calendar" className="btn btn-primary btn-block">
            ログイン
          </Link>
        </div>
      </form>
      <div className="text-center mt-2">
        <Link to="/signup" className="link text-sm">
          新規登録はこちら
        </Link>
      </div>
    </>
  );
}
