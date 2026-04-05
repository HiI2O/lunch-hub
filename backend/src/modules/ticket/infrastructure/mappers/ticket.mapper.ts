import { Injectable } from '@nestjs/common';
import { Ticket } from '../../domain/aggregates/ticket.js';
import type { TicketEntity } from '../persistence/entities/ticket.entity.js';

@Injectable()
export class TicketMapper {
  toDomain(entity: TicketEntity): Ticket {
    return Ticket.reconstruct({
      id: entity.id,
      ownerId: entity.owner_id,
      remainingCount: entity.remaining_count,
      status: entity.status,
      purchaseDate: entity.purchase_date,
      createdAt: entity.created_at,
      version: entity.version,
    });
  }

  toPersistence(domain: Ticket): Partial<TicketEntity> {
    return {
      id: domain.id,
      owner_id: domain.ownerId,
      remaining_count: domain.remainingCount,
      status: domain.status.value,
      purchase_date: domain.purchaseDate,
    };
  }
}
