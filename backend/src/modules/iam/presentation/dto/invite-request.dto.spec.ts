import { validate } from 'class-validator';
import { InviteRequestDto } from './invite-request.dto.js';

describe('InviteRequestDto', () => {
  function createValidDto(): InviteRequestDto {
    const dto = new InviteRequestDto();
    dto.email = 'newuser@company.com';
    dto.role = 'GENERAL_USER';
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

  describe('role', () => {
    it('STAFF → バリデーション通過', async () => {
      const dto = createValidDto();
      dto.role = 'STAFF';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('ADMINISTRATOR → バリデーション通過', async () => {
      const dto = createValidDto();
      dto.role = 'ADMINISTRATOR';
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('SUPER_ADMIN → バリデーションエラー（許可値以外）', async () => {
      const dto = createValidDto();
      dto.role = 'SUPER_ADMIN';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('空文字 → バリデーションエラー', async () => {
      const dto = createValidDto();
      dto.role = '';
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
