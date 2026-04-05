import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITicketPurchaseReservationRepository } from '../../domain/repositories/ticket-purchase-reservation.repository.js';
import type { TicketPurchaseReservation } from '../../domain/aggregates/ticket-purchase-reservation.js';
import { TicketPurchaseReservationEntity } from './entities/ticket-purchase-reservation.entity.js';
import { TicketPurchaseReservationMapper } from '../mappers/ticket-purchase-reservation.mapper.js';

@Injectable()
export class TypeormTicketPurchaseReservationRepository extends ITicketPurchaseReservationRepository {
  constructor(
    @InjectRepository(TicketPurchaseReservationEntity)
    private readonly repo: Repository<TicketPurchaseReservationEntity>,
    private readonly mapper: TicketPurchaseReservationMapper,
  ) {
    super();
  }

  async save(pr: TicketPurchaseReservation): Promise<void> {
    const entity = this.mapper.toPersistence(pr);
    await this.repo.save(entity);
  }

  async findById(id: string): Promise<TicketPurchaseReservation | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<TicketPurchaseReservation[]> {
    const entities = await this.repo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findByPurchaseDate(date: string): Promise<TicketPurchaseReservation[]> {
    const entities = await this.repo.find({
      where: { purchase_date: date },
      order: { created_at: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }
}
