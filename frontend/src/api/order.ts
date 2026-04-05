import type { ApiClient } from './client';
import type { OrderResult } from './types';

// --- 型定義 ---

export type OrderFilter = {
  readonly from: string;
  readonly to: string;
};

// --- API ---

export type OrderApi = {
  getOrders(filter: OrderFilter): Promise<OrderResult[]>;
  placeOrder(id: string): Promise<OrderResult>;
};

export function createOrderApi(client: ApiClient): OrderApi {
  return {
    getOrders(filter) {
      return client.get<OrderResult[]>(
        `/orders?from=${filter.from}&to=${filter.to}`,
      );
    },
    placeOrder(id) {
      return client.post<OrderResult>(`/orders/${id}/place`);
    },
  };
}
