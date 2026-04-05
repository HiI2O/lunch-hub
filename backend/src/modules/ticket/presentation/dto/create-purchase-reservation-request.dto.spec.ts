import { validate } from 'class-validator';
import { CreatePurchaseReservationRequestDto } from './create-purchase-reservation-request.dto.js';

describe('CreatePurchaseReservationRequestDto', () => {
  function createValidDto(): CreatePurchaseReservationRequestDto {
    const dto = new CreatePurchaseReservationRequestDto();
    dto.quantity = 1;
    dto.purchaseDate = '2026-04-05';
    return dto;
  }

  it('有効なデータの場合、バリデーションエラーがない', async () => {
    const dto = createValidDto();
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  describe('quantity', () => {
    it('整数値1 → バリデーション通過', async () => {
      const dto = createValidDto();
      dto.quantity = 1;
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('大きな整数値（100） → バリデーション通過', async () => {
      const dto = createValidDto();
      dto.quantity = 100;
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('0 → エラー（1セット以上）', async () => {
      const dto = createValidDto();
      dto.quantity = 0;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('-1 → エラー（正の整数）', async () => {
      const dto = createValidDto();
      dto.quantity = -1;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('1.5 → エラー（整数のみ）', async () => {
      const dto = createValidDto();
      dto.quantity = 1.5;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('purchaseDate', () => {
    it('YYYY-MM-DD形式 → バリデーション通過', async () => {
      const dto = createValidDto();
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('不正な日付形式 → エラー', async () => {
      const dto = createValidDto();
      dto.purchaseDate = '04-05-2026';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('空文字 → エラー', async () => {
      const dto = createValidDto();
      dto.purchaseDate = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('not-a-date → エラー', async () => {
      const dto = createValidDto();
      dto.purchaseDate = 'not-a-date';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
