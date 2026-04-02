import { ValueObject } from '../../../../shared/domain/value-object.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

export const UserStatusValues = {
  INVITED: 'INVITED',
  ACTIVE: 'ACTIVE',
  DEACTIVATED: 'DEACTIVATED',
} as const;

export type UserStatusType =
  (typeof UserStatusValues)[keyof typeof UserStatusValues];

interface UserStatusProps {
  readonly value: UserStatusType;
}

export class UserStatus extends ValueObject<UserStatusProps> {
  private constructor(props: UserStatusProps) {
    super(props);
  }

  get value(): UserStatusType {
    return this.props.value;
  }

  static create(status: string): UserStatus {
    if (!Object.values(UserStatusValues).includes(status as UserStatusType)) {
      throw new ValidationError(`Invalid user status: ${status}`);
    }
    return new UserStatus({ value: status as UserStatusType });
  }

  isActive(): boolean {
    return this.props.value === UserStatusValues.ACTIVE;
  }

  isInvited(): boolean {
    return this.props.value === UserStatusValues.INVITED;
  }

  isDeactivated(): boolean {
    return this.props.value === UserStatusValues.DEACTIVATED;
  }
}
