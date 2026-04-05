import { validate } from 'class-validator';
import { ForgotPasswordRequestDto } from './forgot-password-request.dto.js';

describe('ForgotPasswordRequestDto', () => {
  it('有効なメールアドレスの場合、バリデーションエラーがない', async () => {
    const dto = new ForgotPasswordRequestDto();
    dto.email = 'user@company.com';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('無効なメールアドレスの場合、エラーを返す', async () => {
    const dto = new ForgotPasswordRequestDto();
    dto.email = 'not-an-email';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('空文字の場合、エラーを返す', async () => {
    const dto = new ForgotPasswordRequestDto();
    dto.email = '';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
