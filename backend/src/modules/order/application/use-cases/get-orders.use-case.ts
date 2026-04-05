import type { IOrderRepository } from '../../domain/repositories/order.repository.js';
import type { OrderResultDto } from '../dto/order-result.dto.js';

interface Input {
  readonly from: string;
  readonly to: string;
}

export class GetOrdersUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(input: Input): Promise<OrderResultDto[]> {
    const orders = await this.orderRepo.findByDateRange(input.from, input.to);
    return orders.map((o) => ({
      id: o.id,
      orderDate: o.orderDate,
      totalCount: o.totalCount,
      status: o.status.value,
      placedAt: o.placedAt?.toISOString() ?? null,
    }));
  }
}
