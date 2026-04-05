import { Injectable } from '@nestjs/common';
import { GuestEntity } from '../persistence/entities/guest.entity.js';
import { Guest } from '../../domain/aggregates/guest.js';

@Injectable()
export class GuestMapper {
  toDomain(entity: GuestEntity): Guest {
    return Guest.reconstruct({
      id: entity.id,
      guestName: entity.guest_name,
      createdByStaffId: entity.created_by_staff_id,
      visitDate: entity.visit_date,
      createdAt: entity.created_at,
    });
  }

  toPersistence(guest: Guest): Partial<GuestEntity> {
    return {
      id: guest.id,
      guest_name: guest.guestName,
      created_by_staff_id: guest.createdByStaffId,
      visit_date: guest.visitDate,
      created_at: guest.createdAt,
    };
  }
}
