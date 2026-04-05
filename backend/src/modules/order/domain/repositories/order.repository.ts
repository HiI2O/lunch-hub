import type { Order } from '../aggregates/order.js';

export abstract class IOrderRepository {
  abstract save(order: Order): Promise<void>;
  abstract findById(id: string): Promise<Order | null>;
  abstract findByDate(date: string): Promise<Order | null>;
  abstract findByDateRange(from: string, to: string): Promise<Order[]>;
}
