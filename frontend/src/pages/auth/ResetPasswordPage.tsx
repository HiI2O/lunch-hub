import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiClient } from '../../api/client';
import { createAuthApi } from '../../api/auth';
import { ApiError } from '../../api/client';
import { validators } from '../../utils/validation';

type FormErrors = {
  password?: string;
  passwordConfirm?: string;
};

const client = new ApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
});
const authApi = createAuthApi(client);

export function ResetPasswordPage(): React.JSX.Element {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <>
        <h2 className="auth-title">エラー</h2>
        <p className="form-error text-center">リンクが無効です。パスワードリセットメールのリンクを確認してください。</p>
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const passwordError = validators.password(password);
    const passwordConfirmError = validators.passwordConfirm(passwordConfirm, password);
    setErrors({ password: passwordError, passwordConfirm: passwordConfirmError });

    if (passwordError || passwordConfirmError) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      await authApi.resetPassword(token, password);
      setSuccessMessage('パスワードを変更しました。ログイン画面からログインしてください。');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.code === 'AUTH_INVALID_TOKEN' || err.status === 404 || err.status === 410) {
          setApiError('リンクが無効または期限切れです');
        } else {
          setApiError(err.message);
        }
      } else {
        setApiError('予期しないエラーが発生しました');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successMessage) {
    return (
      <>
        <h2 className="auth-title">パスワード変更完了</h2>
        <p className="text-center mb-2">{successMessage}</p>
        <div className="text-center">
          <Link to="/login" className="link">ログイン画面へ</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="auth-title">新しいパスワードを設定</h2>
      <form onSubmit={(e) => { void handleSubmit(e); }}>
        {apiError && <p className="form-error mb-2">{apiError}</p>}
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            新しいパスワード
          </label>
          <input
            type="password"
            id="password"
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password ? (
            <p className="form-error">{errors.password}</p>
          ) : (
            <p className="form-hint">8文字以上、英字・数字・記号を含む</p>
          )}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="passwordConfirm">
            パスワード（確認）
          </label>
          <input
            type="password"
            id="passwordConfirm"
            className={`form-input ${errors.passwordConfirm ? 'error' : ''}`}
            placeholder="••••••••"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
          {errors.passwordConfirm && <p className="form-error">{errors.passwordConfirm}</p>}
        </div>
        <div className="form-group">
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? '処理中...' : 'パスワードを変更'}
          </button>
        </div>
      </form>
    </>
  );
}
