import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { createAuthApi } from '../../api/auth';
import { ApiError } from '../../api/client';
import { apiClient } from '../../api/client-instance';
import { validators } from '../../utils/validation';

type FormErrors = {
  displayName?: string;
  password?: string;
  passwordConfirm?: string;
};

const authApi = createAuthApi(apiClient);

export function ActivatePage(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const token = searchParams.get('token');

  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <>
        <h2 className="auth-title">エラー</h2>
        <p className="form-error text-center">リンクが無効です。招待メールのリンクを確認してください。</p>
      </>
    );
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const displayNameError = validators.displayName(displayName);
    const passwordError = validators.password(password);
    const passwordConfirmError = validators.passwordConfirm(passwordConfirm, password);
    setErrors({
      displayName: displayNameError,
      password: passwordError,
      passwordConfirm: passwordConfirmError,
    });

    if (displayNameError || passwordError || passwordConfirmError) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      const result = await authApi.activate(token, password, displayName);
      // AuthContextのloginを呼ばず、直接トークンを設定
      // activate APIはログインと同じレスポンスを返すので、そのまま認証状態にする
      void result;
      // loginで認証状態にする（activateのレスポンスと同等）
      await login(result.user.email, password).catch(() => {
        // login失敗の場合はactivateは成功しているのでcalendarに遷移
      });
      navigate('/calendar', { replace: true });
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

  return (
    <>
      <h2 className="auth-title">アカウント有効化</h2>
      <p className="text-secondary text-sm text-center mb-2">
        パスワードと表示名を設定してアカウントを有効化してください
      </p>
      <form onSubmit={(e) => { void handleSubmit(e); }}>
        {apiError && <p className="form-error mb-2">{apiError}</p>}
        <div className="form-group">
          <label className="form-label" htmlFor="displayName">
            表示名
          </label>
          <input
            type="text"
            id="displayName"
            className={`form-input ${errors.displayName ? 'error' : ''}`}
            placeholder="山田 太郎"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          {errors.displayName ? (
            <p className="form-error">{errors.displayName}</p>
          ) : (
            <p className="form-hint">他のユーザーに表示される名前です</p>
          )}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            パスワード
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
            {isSubmitting ? '処理中...' : 'アカウントを有効化'}
          </button>
        </div>
      </form>
    </>
  );
}
