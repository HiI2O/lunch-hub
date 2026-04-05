import { validate } from 'class-validator';
import { CreateGuestRequestDto } from './create-guest-request.dto.js';

describe('CreateGuestRequestDto', () => {
  it('有効なデータの場合、バリデーションエラーがない', async () => {
    const dto = new CreateGuestRequestDto();
    dto.guestName = '来客A様';
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('空文字 → エラー', async () => {
    const dto = new CreateGuestRequestDto();
    dto.guestName = '';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('数値型 → エラー（文字列型）', async () => {
    const dto = new CreateGuestRequestDto();
    (dto as unknown as Record<string, unknown>).guestName = 123;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
