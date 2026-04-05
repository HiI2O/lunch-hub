import { validate } from 'class-validator';
import { ModifyReservationRequestDto } from './modify-reservation-request.dto.js';

describe('ModifyReservationRequestDto', () => {
  it('有効なデータの場合、バリデーションエラーがない', async () => {
    const dto = new ModifyReservationRequestDto();
    dto.paymentMethod = 'CASH';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  describe('paymentMethod', () => {
    it('TICKET → バリデーション通過', async () => {
      const dto = new ModifyReservationRequestDto();
      dto.paymentMethod = 'TICKET';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('INVALID_VALUE → バリデーション通過（DTOでは値の妥当性を検証しない）', async () => {
      const dto = new ModifyReservationRequestDto();
      dto.paymentMethod = 'INVALID_VALUE';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('空文字 → エラー', async () => {
      const dto = new ModifyReservationRequestDto();
      dto.paymentMethod = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('ticketId', () => {
    it('UUID文字列 → バリデーション通過', async () => {
      const dto = new ModifyReservationRequestDto();
      dto.paymentMethod = 'TICKET';
      dto.ticketId = '550e8400-e29b-41d4-a716-446655440000';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('未指定 → バリデーション通過（オプショナル）', async () => {
      const dto = new ModifyReservationRequestDto();
      dto.paymentMethod = 'CASH';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
