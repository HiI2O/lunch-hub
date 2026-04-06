import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createAuthApi } from '../../api/auth';
import { ApiError } from '../../api/client';
import { apiClient } from '../../api/client-instance';
import { validators } from '../../utils/validation';

type FormErrors = {
  email?: string;
  pin?: string;
};

const authApi = createAuthApi(apiClient);

export function SignupPage(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const emailError = validators.email(email);
    const pinError = validators.pin(pin);
    setErrors({ email: emailError, pin: pinError });

    if (emailError || pinError) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      await authApi.signup(email, pin);
      setSuccessMessage('招待メールを送信しました。メールをご確認ください。');
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
        <h2 className="auth-title">登録申請完了</h2>
        <p className="text-center mb-2">{successMessage}</p>
        <div className="text-center">
          <Link to="/login" className="link">ログイン画面に戻る</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="auth-title">新規登録</h2>
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
          {errors.email ? (
            <p className="form-error">{errors.email}</p>
          ) : (
            <p className="form-hint">会社のメールアドレスを入力してください</p>
          )}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="pin">
            社員用PIN
          </label>
          <input
            type="text"
            id="pin"
            className={`form-input ${errors.pin ? 'error' : ''}`}
            placeholder="PIN を入力"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={12}
          />
          {errors.pin ? (
            <p className="form-error">{errors.pin}</p>
          ) : (
            <p className="form-hint">6〜12文字の英数字（社内で共有されているPIN）</p>
          )}
        </div>
        <div className="form-group">
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? '送信中...' : '登録申請'}
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
