import { validate } from 'class-validator';
import { ChangeRoleRequestDto } from './change-role-request.dto.js';

describe('ChangeRoleRequestDto', () => {
  it('GENERAL_USER → バリデーション通過', async () => {
    const dto = new ChangeRoleRequestDto();
    dto.role = 'GENERAL_USER';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('STAFF → バリデーション通過', async () => {
    const dto = new ChangeRoleRequestDto();
    dto.role = 'STAFF';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('ADMINISTRATOR → バリデーション通過', async () => {
    const dto = new ChangeRoleRequestDto();
    dto.role = 'ADMINISTRATOR';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('INVALID_ROLE → バリデーションエラー（許可値以外）', async () => {
    const dto = new ChangeRoleRequestDto();
    dto.role = 'INVALID_ROLE';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('空文字 → バリデーションエラー', async () => {
    const dto = new ChangeRoleRequestDto();
    dto.role = '';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
