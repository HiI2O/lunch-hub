import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';
import { EmailAddress } from '../value-objects/email-address.js';
import { DisplayName } from '../value-objects/display-name.js';
import { PasswordHash } from '../value-objects/password-hash.js';
import { Role } from '../value-objects/role.js';
import { UserStatus, UserStatusValues } from '../value-objects/user-status.js';
import { InvitationToken } from '../value-objects/invitation-token.js';
import { UserInvitedEvent } from '../events/user-invited.event.js';
import { UserActivatedEvent } from '../events/user-activated.event.js';
import { PasswordChangedEvent } from '../events/password-changed.event.js';
import { UserDeactivatedEvent } from '../events/user-deactivated.event.js';
import { UserReactivatedEvent } from '../events/user-reactivated.event.js';

interface UserProps {
  readonly email: EmailAddress;
  readonly displayName: DisplayName | null;
  readonly passwordHash: PasswordHash | null;
  readonly role: Role;
  readonly status: UserStatus;
  readonly invitationToken: InvitationToken | null;
  readonly invitedBy: string | null;
  readonly invitedAt: Date | null;
  readonly activatedAt: Date | null;
  readonly lastLoginAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}

interface InviteParams {
  readonly id: string;
  readonly email: EmailAddress;
  readonly role: Role;
  readonly invitedBy: string;
}

interface SelfSignUpParams {
  readonly id: string;
  readonly email: EmailAddress;
}

interface ReconstructParams {
  readonly id: string;
  readonly email: EmailAddress;
  readonly displayName: DisplayName | null;
  readonly passwordHash: PasswordHash | null;
  readonly role: Role;
  readonly status: UserStatus;
  readonly invitationToken: InvitationToken | null;
  readonly invitedBy: string | null;
  readonly invitedAt: Date | null;
  readonly activatedAt: Date | null;
  readonly lastLoginAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}

export class User extends AggregateRoot<string> {
  private _props: UserProps;

  private constructor(id: string, props: UserProps) {
    super(id);
    this._props = props;
  }

  get email(): EmailAddress {
    return this._props.email;
  }
  get displayName(): DisplayName | null {
    return this._props.displayName;
  }
  get passwordHash(): PasswordHash | null {
    return this._props.passwordHash;
  }
  get role(): Role {
    return this._props.role;
  }
  get status(): UserStatus {
    return this._props.status;
  }
  get invitationToken(): InvitationToken | null {
    return this._props.invitationToken;
  }
  get invitedBy(): string | null {
    return this._props.invitedBy;
  }
  get invitedAt(): Date | null {
    return this._props.invitedAt;
  }
  get activatedAt(): Date | null {
    return this._props.activatedAt;
  }
  get lastLoginAt(): Date | null {
    return this._props.lastLoginAt;
  }
  get createdAt(): Date {
    return this._props.createdAt;
  }
  get updatedAt(): Date {
    return this._props.updatedAt;
  }
  get version(): number {
    return this._props.version;
  }

  static invite(params: InviteParams): User {
    const now = new Date();
    const invitationToken = InvitationToken.create();
    const user = new User(params.id, {
      email: params.email,
      displayName: null,
      passwordHash: null,
      role: params.role,
      status: UserStatus.create(UserStatusValues.INVITED),
      invitationToken,
      invitedBy: params.invitedBy,
      invitedAt: now,
      activatedAt: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
      version: 0,
    });
    user.addDomainEvent(
      new UserInvitedEvent({
        aggregateId: params.id,
        email: params.email.value,
        invitationToken: invitationToken.token,
      }),
    );
    return user;
  }

  static selfSignUp(params: SelfSignUpParams): User {
    const now = new Date();
    const invitationToken = InvitationToken.create();
    const user = new User(params.id, {
      email: params.email,
      displayName: null,
      passwordHash: null,
      role: Role.create('GENERAL_USER'),
      status: UserStatus.create(UserStatusValues.INVITED),
      invitationToken,
      invitedBy: null,
      invitedAt: now,
      activatedAt: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
      version: 0,
    });
    user.addDomainEvent(
      new UserInvitedEvent({
        aggregateId: params.id,
        email: params.email.value,
        invitationToken: invitationToken.token,
      }),
    );
    return user;
  }

  static reconstruct(params: ReconstructParams): User {
    return new User(params.id, {
      email: params.email,
      displayName: params.displayName,
      passwordHash: params.passwordHash,
      role: params.role,
      status: params.status,
      invitationToken: params.invitationToken,
      invitedBy: params.invitedBy,
      invitedAt: params.invitedAt,
      activatedAt: params.activatedAt,
      lastLoginAt: params.lastLoginAt,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
      version: params.version,
    });
  }

  activate(passwordHash: PasswordHash, displayName: DisplayName): void {
    if (!this._props.status.isInvited()) {
      throw new ValidationError('Only invited users can be activated');
    }
    if (
      this._props.invitationToken !== null &&
      this._props.invitationToken.isExpired()
    ) {
      throw new ValidationError('Invitation token has expired');
    }
    this._props = {
      ...this._props,
      passwordHash,
      displayName,
      status: UserStatus.create(UserStatusValues.ACTIVE),
      invitationToken: null,
      activatedAt: new Date(),
      updatedAt: new Date(),
    };
    this.addDomainEvent(new UserActivatedEvent(this.id));
  }

  changePassword(newPasswordHash: PasswordHash): void {
    if (!this._props.status.isActive()) {
      throw new ValidationError('Only active users can change password');
    }
    this._props = {
      ...this._props,
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    };
    this.addDomainEvent(new PasswordChangedEvent(this.id));
  }

  changeRole(newRole: Role): void {
    if (!this._props.status.isActive()) {
      throw new ValidationError(
        'Only active users can have their role changed',
      );
    }
    this._props = {
      ...this._props,
      role: newRole,
      updatedAt: new Date(),
    };
  }

  deactivate(): void {
    if (!this._props.status.isActive()) {
      throw new ValidationError('Only active users can be deactivated');
    }
    this._props = {
      ...this._props,
      status: UserStatus.create(UserStatusValues.DEACTIVATED),
      updatedAt: new Date(),
    };
    this.addDomainEvent(new UserDeactivatedEvent(this.id));
  }

  reactivate(): void {
    if (!this._props.status.isDeactivated()) {
      throw new ValidationError('Only deactivated users can be reactivated');
    }
    this._props = {
      ...this._props,
      status: UserStatus.create(UserStatusValues.ACTIVE),
      updatedAt: new Date(),
    };
    this.addDomainEvent(new UserReactivatedEvent(this.id));
  }

  updateLastLogin(): void {
    this._props = {
      ...this._props,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    };
  }

  refreshInvitationToken(): void {
    if (!this._props.status.isInvited()) {
      throw new ValidationError(
        'Only invited users can have their token refreshed',
      );
    }
    const newToken = InvitationToken.create();
    this._props = {
      ...this._props,
      invitationToken: newToken,
      updatedAt: new Date(),
    };
    this.addDomainEvent(
      new UserInvitedEvent({
        aggregateId: this.id,
        email: this._props.email.value,
        invitationToken: newToken.token,
      }),
    );
  }

  cancelInvitation(): void {
    if (!this._props.status.isInvited()) {
      throw new ValidationError(
        'Only invited users can have their invitation cancelled',
      );
    }
    this._props = {
      ...this._props,
      invitationToken: null,
      status: UserStatus.create(UserStatusValues.DEACTIVATED),
      updatedAt: new Date(),
    };
  }

  isActive(): boolean {
    return this._props.status.isActive();
  }

  isInvited(): boolean {
    return this._props.status.isInvited();
  }

  canLogin(): boolean {
    return this._props.status.isActive() && this._props.passwordHash !== null;
  }

  hasRole(role: string): boolean {
    return this._props.role.value === role;
  }
}
