import { validate } from 'class-validator';
import { ChangePasswordRequestDto } from './change-password-request.dto.js';

describe('ChangePasswordRequestDto', () => {
  function createValidDto(): ChangePasswordRequestDto {
    const dto = new ChangePasswordRequestDto();
    dto.currentPassword = 'OldPass1!';
    dto.newPassword = 'NewPass1!';
    return dto;
  }

  it('有効なデータの場合、バリデーションエラーがない', async () => {
    const dto = createValidDto();
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  describe('currentPassword', () => {
    it('空文字 → バリデーション通過（@IsStringのみ）', async () => {
      const dto = createValidDto();
      dto.currentPassword = '';
      const errors = await validate(dto);
      const currentPasswordErrors = errors.filter(
        (e) => e.property === 'currentPassword',
      );
      expect(currentPasswordErrors).toHaveLength(0);
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
      dto.newPassword = 'newpassword1';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('数字なしの場合、エラーを返す', async () => {
      const dto = createValidDto();
      dto.newPassword = 'NewPassword!';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('英字なしの場合、エラーを返す', async () => {
      const dto = createValidDto();
      dto.newPassword = '12345678!';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
