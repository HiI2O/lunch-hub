import { Link } from 'react-router-dom';

export function ActivatePage() {
  return (
    <>
      <h2 className="auth-title">アカウント有効化</h2>
      <p className="text-secondary text-sm text-center mb-2">
        パスワードと表示名を設定してアカウントを有効化してください
      </p>
      <form>
        <div className="form-group">
          <label className="form-label" htmlFor="displayName">
            表示名
          </label>
          <input
            type="text"
            id="displayName"
            className="form-input"
            placeholder="山田 太郎"
          />
          <p className="form-hint">他のユーザーに表示される名前です</p>
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
          <p className="form-hint">8文字以上、英字・数字・記号を含む</p>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="passwordConfirm">
            パスワード（確認）
          </label>
          <input
            type="password"
            id="passwordConfirm"
            className="form-input"
            placeholder="••••••••"
          />
        </div>
        <div className="form-group">
          <Link to="/login" className="btn btn-primary btn-block">
            アカウントを有効化
          </Link>
        </div>
      </form>
    </>
  );
}
