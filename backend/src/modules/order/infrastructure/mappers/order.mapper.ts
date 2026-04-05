import { Injectable } from '@nestjs/common';
import { Order } from '../../domain/aggregates/order.js';
import type { OrderEntity } from '../persistence/entities/order.entity.js';

@Injectable()
export class OrderMapper {
  toDomain(entity: OrderEntity): Order {
    return Order.reconstruct({
      id: entity.id,
      orderDate: entity.order_date,
      reservationIds: entity.reservation_ids,
      status: entity.status,
      totalCount: entity.total_count,
      createdAt: entity.created_at,
      placedAt: entity.placed_at,
      version: entity.version,
    });
  }

  toPersistence(domain: Order): Partial<OrderEntity> {
    return {
      id: domain.id,
      order_date: domain.orderDate,
      reservation_ids: [...domain.reservationIds],
      status: domain.status.value,
      total_count: domain.totalCount,
      placed_at: domain.placedAt,
    };
  }
}
