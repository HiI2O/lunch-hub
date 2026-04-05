import { validate } from 'class-validator';
import { ResetPasswordRequestDto } from './reset-password-request.dto.js';

describe('ResetPasswordRequestDto', () => {
  function createValidDto(): ResetPasswordRequestDto {
    const dto = new ResetPasswordRequestDto();
    dto.token = 'some-token';
    dto.newPassword = 'Password1!';
    return dto;
  }

  it('有効なデータの場合、バリデーションエラーがない', async () => {
    const dto = createValidDto();
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  describe('token', () => {
    it('任意の文字列 → バリデーション通過', async () => {
      const dto = createValidDto();
      dto.token = 'any-string-value';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('newPassword', () => {
    it('8文字未満の場合、エラーを返す', async () => {
      const dto = createValidDto();
      dto.newPassword = 'short1!';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('特殊文字なしの場合、エラーを返す', async () => {
      const dto = createValidDto();
      dto.newPassword = 'password1';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('数字なしの場合、エラーを返す', async () => {
      const dto = createValidDto();
      dto.newPassword = 'Password!';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('英字なしの場合、エラーを返す', async () => {
      const dto = createValidDto();
      dto.newPassword = '12345678!';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('空文字の場合、エラーを返す', async () => {
      const dto = createValidDto();
      dto.newPassword = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
