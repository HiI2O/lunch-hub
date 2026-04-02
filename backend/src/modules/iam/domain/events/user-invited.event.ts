import type { DomainEvent } from '../../../../shared/domain/domain-event.base.js';

export class UserInvitedEvent implements DomainEvent {
  readonly eventName = 'UserInvited';
  readonly occurredOn: Date;
  readonly aggregateId: string;
  readonly email: string;
  readonly invitationToken: string;

  constructor(params: {
    readonly aggregateId: string;
    readonly email: string;
    readonly invitationToken: string;
  }) {
    this.occurredOn = new Date();
    this.aggregateId = params.aggregateId;
    this.email = params.email;
    this.invitationToken = params.invitationToken;
  }
}
