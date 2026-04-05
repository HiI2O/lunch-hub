import { validate } from 'class-validator';
import { CreateReservationRequestDto } from './create-reservation-request.dto.js';

describe('CreateReservationRequestDto', () => {
  function createValidDto(): CreateReservationRequestDto {
    const dto = new CreateReservationRequestDto();
    dto.reservationDate = '2026-04-10';
    dto.paymentMethod = 'TICKET';
    return dto;
  }

  it('有効なデータの場合、バリデーションエラーがない', async () => {
    const dto = createValidDto();
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  describe('reservationDate', () => {
    it('YYYY-MM-DD形式 → バリデーション通過', async () => {
      const dto = createValidDto();
      dto.reservationDate = '2026-04-10';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('不正な日付形式（MM-DD-YYYY） → エラー', async () => {
      const dto = createValidDto();
      dto.reservationDate = '04-10-2026';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('スラッシュ区切り → エラー', async () => {
      const dto = createValidDto();
      dto.reservationDate = '2026/04/10';
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

  describe('paymentMethod', () => {
    it('CASH → バリデーション通過', async () => {
      const dto = createValidDto();
      dto.paymentMethod = 'CASH';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('INVALID_VALUE → バリデーション通過（DTOでは@IsString+@IsNotEmptyのみ）', async () => {
      const dto = createValidDto();
      dto.paymentMethod = 'INVALID_VALUE';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('空文字 → エラー', async () => {
      const dto = createValidDto();
      dto.paymentMethod = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('ticketId', () => {
    it('UUID文字列 → バリデーション通過', async () => {
      const dto = createValidDto();
      dto.ticketId = '550e8400-e29b-41d4-a716-446655440000';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('未指定 → バリデーション通過（オプショナル）', async () => {
      const dto = createValidDto();
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
