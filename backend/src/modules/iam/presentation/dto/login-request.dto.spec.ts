import { validate } from 'class-validator';
import { LoginRequestDto } from './login-request.dto.js';

describe('LoginRequestDto', () => {
  it('有効なデータの場合、バリデーションエラーがない', async () => {
    const dto = new LoginRequestDto();
    dto.email = 'test@example.com';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('無効なメールアドレスの場合、エラーを返す', async () => {
    const dto = new LoginRequestDto();
    dto.email = 'not-an-email';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('パスワードが空の場合、エラーを返す', async () => {
    const dto = new LoginRequestDto();
    dto.email = 'test@example.com';
    dto.password = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });
});
