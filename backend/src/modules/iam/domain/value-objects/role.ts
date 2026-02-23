import { ValueObject } from '../../../../shared/domain/value-object.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

export const RoleValues = {
  GENERAL_USER: 'GENERAL_USER',
  STAFF: 'STAFF',
  ADMINISTRATOR: 'ADMINISTRATOR',
} as const;

export type RoleType = (typeof RoleValues)[keyof typeof RoleValues];

interface RoleProps {
  readonly value: RoleType;
}

export class Role extends ValueObject<RoleProps> {
  private constructor(props: RoleProps) {
    super(props);
  }

  get value(): RoleType {
    return this.props.value;
  }

  static create(role: string): Role {
    if (!Object.values(RoleValues).includes(role as RoleType)) {
      throw new ValidationError(`Invalid role: ${role}`);
    }
    return new Role({ value: role as RoleType });
  }

  isAdministrator(): boolean {
    return this.props.value === RoleValues.ADMINISTRATOR;
  }

  isStaff(): boolean {
    return this.props.value === RoleValues.STAFF;
  }

  isGeneralUser(): boolean {
    return this.props.value === RoleValues.GENERAL_USER;
  }
}
