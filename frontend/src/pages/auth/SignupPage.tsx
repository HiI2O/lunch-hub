import { useState } from 'react';
import { Link } from 'react-router-dom';

// バリデーションルール
const PIN_REGEX = /^[a-zA-Z0-9]{6,12}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormErrors {
  email?: string;
  pin?: string;
}

export function SignupPage() {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ email: boolean; pin: boolean }>({
    email: false,
    pin: false,
  });

  const validateEmail = (value: string): string | undefined => {
    if (!value) {
      return 'メールアドレスを入力してください';
    }
    if (!EMAIL_REGEX.test(value)) {
      return '有効なメールアドレスを入力してください';
    }
    return undefined;
  };

  const validatePin = (value: string): string | undefined => {
    if (!value) {
      return 'PINを入力してください';
    }
    if (!PIN_REGEX.test(value)) {
      return 'PINは6〜12文字の英数字で入力してください';
    }
    return undefined;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPin(value);
    if (touched.pin) {
      setErrors((prev) => ({ ...prev, pin: validatePin(value) }));
    }
  };

  const handleBlur = (field: 'email' | 'pin') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    } else {
      setErrors((prev) => ({ ...prev, pin: validatePin(pin) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const pinError = validatePin(pin);

    setErrors({ email: emailError, pin: pinError });
    setTouched({ email: true, pin: true });

    if (!emailError && !pinError) {
      // TODO: API call
      alert('登録申請を送信しました。メールをご確認ください。');
    }
  };

  return (
    <>
      <h2 className="auth-title">新規登録</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            className={`form-input ${errors.email && touched.email ? 'error' : ''}`}
            placeholder="example@company.com"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => handleBlur('email')}
          />
          {errors.email && touched.email ? (
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
            className={`form-input ${errors.pin && touched.pin ? 'error' : ''}`}
            placeholder="PIN を入力"
            value={pin}
            onChange={handlePinChange}
            onBlur={() => handleBlur('pin')}
            maxLength={12}
          />
          {errors.pin && touched.pin ? (
            <p className="form-error">{errors.pin}</p>
          ) : (
            <p className="form-hint">6〜12文字の英数字（社内で共有されているPIN）</p>
          )}
        </div>
        <div className="form-group">
          <button type="submit" className="btn btn-primary btn-block">
            登録申請
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
