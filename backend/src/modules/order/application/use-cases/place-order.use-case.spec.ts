/* eslint-disable @typescript-eslint/unbound-method */
import { PlaceOrderUseCase } from './place-order.use-case.js';
import type { IOrderRepository } from '../../domain/repositories/order.repository.js';
import { Order } from '../../domain/aggregates/order.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';

function createMockRepo(): jest.Mocked<IOrderRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn().mockResolvedValue(null),
    findByDate: jest.fn().mockResolvedValue(null),
    findByDateRange: jest.fn().mockResolvedValue([]),
  };
}

describe('PlaceOrderUseCase', () => {
  let useCase: PlaceOrderUseCase;
  let repo: jest.Mocked<IOrderRepository>;

  beforeEach(() => {
    repo = createMockRepo();
    useCase = new PlaceOrderUseCase(repo);
  });

  it('注文を確定する', async () => {
    const order = Order.create({
      id: 'o1',
      orderDate: '2026-04-10',
      reservationIds: ['r1', 'r2'],
    });
    repo.findById.mockResolvedValue(order);

    const result = await useCase.execute({ orderId: 'o1' });

    expect(result.status).toBe('PLACED');
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('存在しない注文はNotFoundError', async () => {
    await expect(useCase.execute({ orderId: 'not-found' })).rejects.toThrow(
      NotFoundError,
    );
  });
});
