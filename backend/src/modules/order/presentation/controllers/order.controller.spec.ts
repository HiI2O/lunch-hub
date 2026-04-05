/* eslint-disable @typescript-eslint/unbound-method */
import { OrderController } from './order.controller.js';
import type { GetOrdersUseCase } from '../../application/use-cases/get-orders.use-case.js';
import type { PlaceOrderUseCase } from '../../application/use-cases/place-order.use-case.js';
import type { OrderResultDto } from '../../application/dto/order-result.dto.js';

const mockOrderResult: OrderResultDto = {
  id: 'order-1',
  orderDate: '2026-04-05',
  totalCount: 3,
  status: 'PENDING',
  placedAt: null,
};

describe('OrderController', () => {
  let controller: OrderController;
  let getOrders: jest.Mocked<GetOrdersUseCase>;
  let placeOrder: jest.Mocked<PlaceOrderUseCase>;

  beforeEach(() => {
    getOrders = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetOrdersUseCase>;
    placeOrder = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<PlaceOrderUseCase>;
    controller = new OrderController(getOrders, placeOrder);
  });

  describe('GET /orders — list', () => {
    it('GetOrdersUseCaseにクエリパラメータfrom, toを渡して呼び出す', async () => {
      getOrders.execute.mockResolvedValue([]);

      await controller.list('2026-04-01', '2026-04-30');

      expect(getOrders.execute).toHaveBeenCalledWith({
        from: '2026-04-01',
        to: '2026-04-30',
      });
    });

    it('ユースケースの戻り値を{ data: [...] }として返す', async () => {
      getOrders.execute.mockResolvedValue([mockOrderResult]);

      const result = await controller.list('2026-04-01', '2026-04-30');

      expect(result).toEqual({ data: [mockOrderResult] });
    });
  });

  describe('POST /orders/:id/place — place', () => {
    it('PlaceOrderUseCaseに注文IDを渡して呼び出す', async () => {
      const placed = {
        ...mockOrderResult,
        status: 'PLACED',
        placedAt: '2026-04-05T09:00:00Z',
      };
      placeOrder.execute.mockResolvedValue(placed);

      await controller.place('order-1');

      expect(placeOrder.execute).toHaveBeenCalledWith({
        orderId: 'order-1',
      });
    });

    it('レスポンスに{ data: { ... } }を返す', async () => {
      const placed = {
        ...mockOrderResult,
        status: 'PLACED',
        placedAt: '2026-04-05T09:00:00Z',
      };
      placeOrder.execute.mockResolvedValue(placed);

      const result = await controller.place('order-1');

      expect(result).toEqual({ data: placed });
    });
  });
});
