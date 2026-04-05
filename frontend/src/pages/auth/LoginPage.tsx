import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ApiError } from '../../api/client';
import { validators } from '../../utils/validation';

type FormErrors = {
  email?: string;
  password?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません',
  AUTH_LOCKED_OUT: 'アカウントがロックされています。15分後に再試行してください',
  NETWORK_ERROR: 'サーバーに接続できません。ネットワーク接続を確認してください',
};

export function LoginPage(): React.JSX.Element {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const emailError = validators.email(email);
    const passwordError = validators.required(password) ? 'パスワードを入力してください' : undefined;
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      await login(email, password);
      navigate('/calendar', { replace: true });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(ERROR_MESSAGES[err.code] ?? err.message);
      } else {
        setApiError('予期しないエラーが発生しました');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <h2 className="auth-title">ログイン</h2>
      <form onSubmit={(e) => { void handleSubmit(e); }}>
        {apiError && <p className="form-error mb-2">{apiError}</p>}
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            メールアドレス
          </label>
          <input
            type="text"
            id="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="example@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="form-error">{errors.email}</p>}
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
          {errors.password && <p className="form-error">{errors.password}</p>}
        </div>
        <div className="form-group">
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'ログイン中...' : 'ログイン'}
          </button>
        </div>
      </form>
      <div className="text-center mt-2">
        <Link to="/signup" className="link text-sm">
          新規登録はこちら
        </Link>
      </div>
      <div className="text-center mt-1">
        <Link to="/forgot-password" className="link text-sm">
          パスワードをお忘れの方
        </Link>
      </div>
    </>
  );
}
