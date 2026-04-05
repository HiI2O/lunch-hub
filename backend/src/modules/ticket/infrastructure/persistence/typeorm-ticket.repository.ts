import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITicketRepository } from '../../domain/repositories/ticket.repository.js';
import type { Ticket } from '../../domain/aggregates/ticket.js';
import { TicketEntity } from './entities/ticket.entity.js';
import { TicketMapper } from '../mappers/ticket.mapper.js';

@Injectable()
export class TypeormTicketRepository extends ITicketRepository {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly repo: Repository<TicketEntity>,
    private readonly mapper: TicketMapper,
  ) {
    super();
  }

  async save(ticket: Ticket): Promise<void> {
    const entity = this.mapper.toPersistence(ticket);
    await this.repo.save(entity);
  }

  async findById(id: string): Promise<Ticket | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Ticket[]> {
    const entities = await this.repo.find({
      where: { owner_id: ownerId },
      order: { created_at: 'DESC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }
}
