import { Role, RoleValues } from './role.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

describe('Role', () => {
  it('should create GENERAL_USER role', () => {
    const role = Role.create('GENERAL_USER');
    expect(role.value).toBe(RoleValues.GENERAL_USER);
    expect(role.isGeneralUser()).toBe(true);
    expect(role.isStaff()).toBe(false);
    expect(role.isAdministrator()).toBe(false);
  });

  it('should create STAFF role', () => {
    const role = Role.create('STAFF');
    expect(role.value).toBe(RoleValues.STAFF);
    expect(role.isStaff()).toBe(true);
  });

  it('should create ADMINISTRATOR role', () => {
    const role = Role.create('ADMINISTRATOR');
    expect(role.value).toBe(RoleValues.ADMINISTRATOR);
    expect(role.isAdministrator()).toBe(true);
  });

  it('should throw on invalid role', () => {
    expect(() => Role.create('SUPER_ADMIN')).toThrow(ValidationError);
    expect(() => Role.create('')).toThrow(ValidationError);
  });

  it('should be equal when values match', () => {
    const r1 = Role.create('STAFF');
    const r2 = Role.create('STAFF');
    expect(r1.equals(r2)).toBe(true);
  });

  it('should not be equal when values differ', () => {
    const r1 = Role.create('STAFF');
    const r2 = Role.create('ADMINISTRATOR');
    expect(r1.equals(r2)).toBe(false);
  });
});
