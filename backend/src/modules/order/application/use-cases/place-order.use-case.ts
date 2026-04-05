import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';
import type { IOrderRepository } from '../../domain/repositories/order.repository.js';
import type { OrderResultDto } from '../dto/order-result.dto.js';

interface Input {
  readonly orderId: string;
}

export class PlaceOrderUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(input: Input): Promise<OrderResultDto> {
    const order = await this.orderRepo.findById(input.orderId);
    if (!order) {
      throw new NotFoundError('Order', input.orderId);
    }

    order.placeOrder();
    await this.orderRepo.save(order);

    return {
      id: order.id,
      orderDate: order.orderDate,
      totalCount: order.totalCount,
      status: order.status.value,
      placedAt: order.placedAt?.toISOString() ?? null,
    };
  }
}
