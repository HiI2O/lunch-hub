import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderEntity } from './infrastructure/persistence/entities/order.entity.js';
import { OrderMapper } from './infrastructure/mappers/order.mapper.js';
import { IOrderRepository } from './domain/repositories/order.repository.js';
import { TypeormOrderRepository } from './infrastructure/persistence/typeorm-order.repository.js';
import { GetOrdersUseCase } from './application/use-cases/get-orders.use-case.js';
import { PlaceOrderUseCase } from './application/use-cases/place-order.use-case.js';
import { OrderController } from './presentation/controllers/order.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity])],
  controllers: [OrderController],
  providers: [
    OrderMapper,
    { provide: IOrderRepository, useClass: TypeormOrderRepository },
    {
      provide: GetOrdersUseCase,
      useFactory: (repo: IOrderRepository): GetOrdersUseCase =>
        new GetOrdersUseCase(repo),
      inject: [IOrderRepository],
    },
    {
      provide: PlaceOrderUseCase,
      useFactory: (repo: IOrderRepository): PlaceOrderUseCase =>
        new PlaceOrderUseCase(repo),
      inject: [IOrderRepository],
    },
  ],
})
export class OrderModule {}
