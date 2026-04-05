import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IGuestRepository } from '../../domain/repositories/guest.repository.js';
import { Guest } from '../../domain/aggregates/guest.js';
import { GuestEntity } from './entities/guest.entity.js';
import { GuestMapper } from '../mappers/guest.mapper.js';

@Injectable()
export class TypeormGuestRepository extends IGuestRepository {
  constructor(
    @InjectRepository(GuestEntity)
    private readonly repo: Repository<GuestEntity>,
    private readonly mapper: GuestMapper,
  ) {
    super();
  }

  async save(guest: Guest): Promise<void> {
    const entity = this.mapper.toPersistence(guest);
    await this.repo.save(entity);
  }

  async findById(id: string): Promise<Guest | null> {
    const entity = await this.repo.findOneBy({ id });
    if (entity === null) return null;
    return this.mapper.toDomain(entity);
  }

  async findByVisitDate(date: string): Promise<Guest[]> {
    const entities = await this.repo.find({
      where: { visit_date: date },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }
}
