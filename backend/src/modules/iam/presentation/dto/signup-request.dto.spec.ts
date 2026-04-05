import { validate } from 'class-validator';
import { SignupRequestDto } from './signup-request.dto.js';

describe('SignupRequestDto', () => {
  function createValidDto(): SignupRequestDto {
    const dto = new SignupRequestDto();
    dto.email = 'user@company.com';
    dto.pin = 'LunchHub2024';
    return dto;
  }

  it('有効なデータの場合、バリデーションエラーがない', async () => {
    const dto = createValidDto();
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  describe('email', () => {
    it('無効なメールアドレスの場合、エラーを返す', async () => {
      const dto = createValidDto();
      dto.email = 'not-an-email';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('空文字の場合、エラーを返す', async () => {
      const dto = createValidDto();
      dto.email = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('pin', () => {
    it('空文字の場合、エラーを返す', async () => {
      const dto = createValidDto();
      dto.pin = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
