import { useState } from 'react';
import type { StaffReservationApi } from '../../api/staff-reservation';
import type { GuestReservationResult } from '../../api/types';

type GuestReservationPageProps = {
  readonly staffReservationApi: StaffReservationApi;
};

type FormErrors = {
  guestName?: string;
  reservationDate?: string;
};

export function GuestReservationPage({
  staffReservationApi,
}: GuestReservationPageProps): React.JSX.Element {
  const [guestName, setGuestName] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentReservations, setRecentReservations] = useState<
    readonly GuestReservationResult[]
  >([]);

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!guestName.trim()) {
      newErrors.guestName = 'ゲスト名を入力してください';
    }
    if (!reservationDate) {
      newErrors.reservationDate = '予約日を選択してください';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const formErrors = validate();
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const guest = await staffReservationApi.createGuest(guestName.trim());
      const reservation = await staffReservationApi.createGuestReservation(
        guest.id,
        reservationDate,
      );
      setRecentReservations((prev) => [reservation, ...prev]);
      setGuestName('');
      setReservationDate('');
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h3 className="card-title">ゲスト予約を作成</h3>
        <p className="text-secondary text-sm mb-2">
          来客や外部の方のために弁当を代理予約できます。
          <br />
          ゲスト予約は現金払いのみとなります。
        </p>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="form-group">
            <label className="form-label" htmlFor="guestName">
              ゲスト名
            </label>
            <input
              type="text"
              id="guestName"
              className={`form-input${errors.guestName ? ' form-input-error' : ''}`}
              placeholder="例：佐藤様"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
            />
            {errors.guestName && (
              <p className="form-error">{errors.guestName}</p>
            )}
            <p className="form-hint">識別用の名前を入力してください</p>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reservationDate">
              予約日
            </label>
            <input
              type="date"
              id="reservationDate"
              className={`form-input${errors.reservationDate ? ' form-input-error' : ''}`}
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
            />
            {errors.reservationDate && (
              <p className="form-error">{errors.reservationDate}</p>
            )}
          </div>
          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              ゲスト予約を作成
            </button>
          </div>
        </form>
      </div>

      {recentReservations.length > 0 && (
        <div className="card">
          <h3 className="card-title">作成済みゲスト予約</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ゲスト名</th>
                  <th>予約日</th>
                  <th>支払方法</th>
                  <th>ステータス</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.map((item) => (
                  <tr key={item.id}>
                    <td>{item.guest.guestName}</td>
                    <td>{item.reservationDate}</td>
                    <td>現金</td>
                    <td>
                      <span className="badge badge-success">予約済</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
