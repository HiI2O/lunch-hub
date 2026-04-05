import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { IOrderRepository } from '../../domain/repositories/order.repository.js';
import type { Order } from '../../domain/aggregates/order.js';
import { OrderEntity } from './entities/order.entity.js';
import { OrderMapper } from '../mappers/order.mapper.js';

@Injectable()
export class TypeormOrderRepository extends IOrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repo: Repository<OrderEntity>,
    private readonly mapper: OrderMapper,
  ) {
    super();
  }

  async save(order: Order): Promise<void> {
    const entity = this.mapper.toPersistence(order);
    await this.repo.save(entity);
  }

  async findById(id: string): Promise<Order | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByDate(date: string): Promise<Order | null> {
    const entity = await this.repo.findOne({
      where: { order_date: date },
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByDateRange(from: string, to: string): Promise<Order[]> {
    const entities = await this.repo.find({
      where: { order_date: Between(from, to) },
      order: { order_date: 'ASC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }
}
