import type { User } from '../aggregates/user.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

export class InvitationService {
  validateInvitationToken(user: User, token: string): void {
    if (!user.isInvited()) {
      throw new ValidationError('User is not in invited status');
    }
    const invitationToken = user.invitationToken;
    if (invitationToken === null) {
      throw new ValidationError('User has no invitation token');
    }
    if (invitationToken.token !== token) {
      throw new ValidationError('Invalid invitation token');
    }
    if (invitationToken.isExpired()) {
      throw new ValidationError('Invitation token has expired');
    }
  }
}
