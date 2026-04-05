/* eslint-disable @typescript-eslint/unbound-method */
import { GetOrdersUseCase } from './get-orders.use-case.js';
import type { IOrderRepository } from '../../domain/repositories/order.repository.js';
import { Order } from '../../domain/aggregates/order.js';

function createMockRepo(): jest.Mocked<IOrderRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByDate: jest.fn(),
    findByDateRange: jest.fn().mockResolvedValue([]),
  };
}

describe('GetOrdersUseCase', () => {
  it('期間指定で注文一覧を取得する', async () => {
    const repo = createMockRepo();
    const order = Order.create({
      id: 'o1',
      orderDate: '2026-04-10',
      reservationIds: ['r1', 'r2'],
    });
    repo.findByDateRange.mockResolvedValue([order]);

    const useCase = new GetOrdersUseCase(repo);
    const result = await useCase.execute({
      from: '2026-04-01',
      to: '2026-04-30',
    });

    expect(repo.findByDateRange).toHaveBeenCalledWith(
      '2026-04-01',
      '2026-04-30',
    );
    expect(result).toHaveLength(1);
    expect(result[0].totalCount).toBe(2);
  });
});
