import { UserStatus, UserStatusValues } from './user-status.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

describe('UserStatus', () => {
  it('should create INVITED status', () => {
    const status = UserStatus.create('INVITED');
    expect(status.value).toBe(UserStatusValues.INVITED);
    expect(status.isInvited()).toBe(true);
    expect(status.isActive()).toBe(false);
    expect(status.isDeactivated()).toBe(false);
  });

  it('should create ACTIVE status', () => {
    const status = UserStatus.create('ACTIVE');
    expect(status.isActive()).toBe(true);
  });

  it('should create DEACTIVATED status', () => {
    const status = UserStatus.create('DEACTIVATED');
    expect(status.isDeactivated()).toBe(true);
  });

  it('should throw on invalid status', () => {
    expect(() => UserStatus.create('SUSPENDED')).toThrow(ValidationError);
    expect(() => UserStatus.create('')).toThrow(ValidationError);
  });

  it('should be equal when values match', () => {
    const s1 = UserStatus.create('ACTIVE');
    const s2 = UserStatus.create('ACTIVE');
    expect(s1.equals(s2)).toBe(true);
  });
});
