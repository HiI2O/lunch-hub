import { validate } from 'class-validator';
import { CreateGuestReservationRequestDto } from './create-guest-reservation-request.dto.js';

describe('CreateGuestReservationRequestDto', () => {
  function createValidDto(): CreateGuestReservationRequestDto {
    const dto = new CreateGuestReservationRequestDto();
    dto.guestId = '550e8400-e29b-41d4-a716-446655440000';
    dto.reservationDate = '2026-04-10';
    return dto;
  }

  it('有効なデータの場合、バリデーションエラーがない', async () => {
    const dto = createValidDto();
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  describe('guestId', () => {
    it('空文字 → エラー', async () => {
      const dto = createValidDto();
      dto.guestId = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('reservationDate', () => {
    it('YYYY-MM-DD形式 → バリデーション通過', async () => {
      const dto = createValidDto();
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('不正な日付形式 → エラー', async () => {
      const dto = createValidDto();
      dto.reservationDate = '04-10-2026';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('not-a-date → エラー', async () => {
      const dto = createValidDto();
      dto.reservationDate = 'not-a-date';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('空文字 → エラー', async () => {
      const dto = createValidDto();
      dto.reservationDate = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
