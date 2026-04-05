import { Guest } from './guest.js';

describe('Guest', () => {
  describe('create', () => {
    it('ゲストを作成できる', () => {
      const guest = Guest.create({
        id: 'guest-id-1',
        guestName: '来客A様',
        createdByStaffId: 'staff-id-1',
      });

      expect(guest.id).toBe('guest-id-1');
      expect(guest.guestName).toBe('来客A様');
      expect(guest.createdByStaffId).toBe('staff-id-1');
      expect(guest.visitDate).toBeNull();
    });

    it('空のゲスト名ではエラーになる', () => {
      expect(() =>
        Guest.create({
          id: 'guest-id-1',
          guestName: '',
          createdByStaffId: 'staff-id-1',
        }),
      ).toThrow('ゲスト名');
    });

    it('256文字を超えるゲスト名ではエラーになる', () => {
      expect(() =>
        Guest.create({
          id: 'guest-id-1',
          guestName: 'a'.repeat(256),
          createdByStaffId: 'staff-id-1',
        }),
      ).toThrow('ゲスト名');
    });
  });

  describe('setVisitDate', () => {
    it('訪問日を設定できる', () => {
      const guest = Guest.create({
        id: 'guest-id-1',
        guestName: '来客A様',
        createdByStaffId: 'staff-id-1',
      });

      guest.setVisitDate('2026-04-10');

      expect(guest.visitDate).toBe('2026-04-10');
    });
  });

  describe('reconstruct', () => {
    it('永続化されたデータから再構築できる', () => {
      const now = new Date();
      const guest = Guest.reconstruct({
        id: 'guest-id-1',
        guestName: '来客B様',
        createdByStaffId: 'staff-id-2',
        visitDate: '2026-04-15',
        createdAt: now,
      });

      expect(guest.id).toBe('guest-id-1');
      expect(guest.guestName).toBe('来客B様');
      expect(guest.visitDate).toBe('2026-04-15');
      expect(guest.createdAt).toBe(now);
    });
  });
});
