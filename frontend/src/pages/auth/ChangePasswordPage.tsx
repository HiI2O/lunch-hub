import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { createAuthApi } from '../../api/auth';
import { ApiError } from '../../api/client';
import { apiClient } from '../../api/client-instance';
import { validators } from '../../utils/validation';

type FormErrors = {
  currentPassword?: string;
  newPassword?: string;
  newPasswordConfirm?: string;
};

const authApi = createAuthApi(apiClient);

export function ChangePasswordPage(): React.JSX.Element {
  const { user } = useAuth();
  const { show } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    const currentPasswordError = validators.required(currentPassword) ? '現在のパスワードを入力してください' : undefined;
    const newPasswordError = validators.password(newPassword);
    const newPasswordConfirmError = validators.passwordConfirm(newPasswordConfirm, newPassword);
    setErrors({
      currentPassword: currentPasswordError,
      newPassword: newPasswordError,
      newPasswordConfirm: newPasswordConfirmError,
    });

    if (currentPasswordError || newPasswordError || newPasswordConfirmError) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      await authApi.changePassword(currentPassword, newPassword);
      show({ type: 'success', message: 'パスワードを変更しました' });
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
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

  return (
    <div className="card">
      <h2>パスワード変更</h2>
      {user && <p className="text-secondary text-sm mb-2">{user.email}</p>}
      <form onSubmit={(e) => { void handleSubmit(e); }}>
        {apiError && <p className="form-error mb-2">{apiError}</p>}
        <div className="form-group">
          <label className="form-label" htmlFor="currentPassword">
            現在のパスワード
          </label>
          <input
            type="password"
            id="currentPassword"
            className={`form-input ${errors.currentPassword ? 'error' : ''}`}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          {errors.currentPassword && <p className="form-error">{errors.currentPassword}</p>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="newPassword">
            新しいパスワード
          </label>
          <input
            type="password"
            id="newPassword"
            className={`form-input ${errors.newPassword ? 'error' : ''}`}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {errors.newPassword ? (
            <p className="form-error">{errors.newPassword}</p>
          ) : (
            <p className="form-hint">8文字以上、英字・数字・記号を含む</p>
          )}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="newPasswordConfirm">
            新しいパスワード（確認）
          </label>
          <input
            type="password"
            id="newPasswordConfirm"
            className={`form-input ${errors.newPasswordConfirm ? 'error' : ''}`}
            value={newPasswordConfirm}
            onChange={(e) => setNewPasswordConfirm(e.target.value)}
          />
          {errors.newPasswordConfirm && <p className="form-error">{errors.newPasswordConfirm}</p>}
        </div>
        <div className="form-group">
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? '変更中...' : 'パスワードを変更'}
          </button>
        </div>
      </form>
    </div>
  );
}
