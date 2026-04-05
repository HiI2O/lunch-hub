import {
  ReservationStatus,
  ReservationStatusValues,
} from './reservation-status.js';

describe('ReservationStatus', () => {
  describe('create', () => {
    it.each(['CONFIRMED', 'CANCELLED', 'FINALIZED'])(
      '%sで作成できる',
      (status) => {
        const rs = ReservationStatus.create(status);
        expect(rs.value).toBe(status);
      },
    );

    it('無効な値で作成するとエラーになる', () => {
      expect(() => ReservationStatus.create('INVALID')).toThrow(
        'Invalid reservation status',
      );
    });
  });

  describe('振る舞い', () => {
    it('isConfirmed()がCONFIRMEDの場合trueを返す', () => {
      const rs = ReservationStatus.create('CONFIRMED');
      expect(rs.isConfirmed()).toBe(true);
      expect(rs.isCancelled()).toBe(false);
      expect(rs.isFinalized()).toBe(false);
    });

    it('isCancelled()がCANCELLEDの場合trueを返す', () => {
      const rs = ReservationStatus.create('CANCELLED');
      expect(rs.isCancelled()).toBe(true);
    });

    it('isFinalized()がFINALIZEDの場合trueを返す', () => {
      const rs = ReservationStatus.create('FINALIZED');
      expect(rs.isFinalized()).toBe(true);
    });

    it('canModify()はCONFIRMEDのみtrue', () => {
      expect(ReservationStatus.create('CONFIRMED').canModify()).toBe(true);
      expect(ReservationStatus.create('CANCELLED').canModify()).toBe(false);
      expect(ReservationStatus.create('FINALIZED').canModify()).toBe(false);
    });
  });

  it('ReservationStatusValuesが正しい値を持つ', () => {
    expect(ReservationStatusValues.CONFIRMED).toBe('CONFIRMED');
    expect(ReservationStatusValues.CANCELLED).toBe('CANCELLED');
    expect(ReservationStatusValues.FINALIZED).toBe('FINALIZED');
  });
});
