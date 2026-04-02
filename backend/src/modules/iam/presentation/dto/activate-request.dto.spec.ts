import { validate } from 'class-validator';
import { ActivateRequestDto } from './activate-request.dto.js';

describe('ActivateRequestDto', () => {
  function createValidDto(): ActivateRequestDto {
    const dto = new ActivateRequestDto();
    dto.token = 'some-token';
    dto.password = 'Password1!';
    dto.displayName = 'Test User';
    return dto;
  }

  it('有効なデータの場合、バリデーションエラーがない', async () => {
    const dto = createValidDto();
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('パスワードが8文字未満の場合、エラーを返す', async () => {
    const dto = createValidDto();
    dto.password = 'Pa1!';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('パスワードに英字がない場合、エラーを返す', async () => {
    const dto = createValidDto();
    dto.password = '12345678!';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('パスワードに数字がない場合、エラーを返す', async () => {
    const dto = createValidDto();
    dto.password = 'Password!';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('パスワードに特殊文字がない場合、エラーを返す', async () => {
    const dto = createValidDto();
    dto.password = 'Password1';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('表示名が空の場合、エラーを返す', async () => {
    const dto = createValidDto();
    dto.displayName = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('表示名が50文字を超える場合、エラーを返す', async () => {
    const dto = createValidDto();
    dto.displayName = 'A'.repeat(51);

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
