import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';

function createMockExecutionContext(
  userRole: string | undefined,
): ExecutionContext {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        user: userRole !== undefined ? { role: userRole } : undefined,
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new RolesGuard(reflector);
  });

  it('ロール制約がない場合はtrueを返す', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const context = createMockExecutionContext('GENERAL_USER');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('ユーザーのロールが要求ロールに含まれる場合はtrueを返す', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMINISTRATOR']);
    const context = createMockExecutionContext('ADMINISTRATOR');

    expect(guard.canActivate(context)).toBe(true);
  });

  it('ユーザーのロールが要求ロールに含まれない場合はfalseを返す', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMINISTRATOR']);
    const context = createMockExecutionContext('GENERAL_USER');

    expect(guard.canActivate(context)).toBe(false);
  });

  it('ユーザーが存在しない場合はfalseを返す', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMINISTRATOR']);
    const context = createMockExecutionContext(undefined);

    expect(guard.canActivate(context)).toBe(false);
  });

  it('複数のロールが指定されている場合、いずれかにマッチすればtrueを返す', () => {
    reflector.getAllAndOverride.mockReturnValue(['ADMINISTRATOR', 'STAFF']);
    const context = createMockExecutionContext('STAFF');

    expect(guard.canActivate(context)).toBe(true);
  });
});
