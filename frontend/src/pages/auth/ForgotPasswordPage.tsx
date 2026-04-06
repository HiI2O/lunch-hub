import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createAuthApi } from '../../api/auth';
import { ApiError } from '../../api/client';
import { apiClient } from '../../api/client-instance';
import { validators } from '../../utils/validation';

const authApi = createAuthApi(apiClient);

export function ForgotPasswordPage(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const emailError = validators.email(email);
    setError(emailError ?? '');

    if (emailError) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      await authApi.forgotPassword(email);
      setSuccessMessage('パスワードリセットメールを送信しました。メールをご確認ください。');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setApiError(err.message);
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
        <h2 className="auth-title">メール送信完了</h2>
        <p className="text-center mb-2">{successMessage}</p>
        <div className="text-center">
          <Link to="/login" className="link">ログイン画面に戻る</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="auth-title">パスワードリセット</h2>
      <p className="text-secondary text-sm text-center mb-2">
        登録済みのメールアドレスを入力してください
      </p>
      <form onSubmit={(e) => { void handleSubmit(e); }}>
        {apiError && <p className="form-error mb-2">{apiError}</p>}
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            メールアドレス
          </label>
          <input
            type="text"
            id="email"
            className={`form-input ${error ? 'error' : ''}`}
            placeholder="example@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="form-error">{error}</p>}
        </div>
        <div className="form-group">
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? '送信中...' : 'リセットメールを送信'}
          </button>
        </div>
      </form>
      <div className="text-center mt-2">
        <Link to="/login" className="link text-sm">
          ログイン画面に戻る
        </Link>
      </div>
    </>
  );
}
