import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal, Between, And } from 'typeorm';
import { IReservationRepository } from '../../domain/repositories/reservation.repository.js';
import { Reservation } from '../../domain/aggregates/reservation.js';
import { ReservationEntity } from './entities/reservation.entity.js';
import { ReservationMapper } from '../mappers/reservation.mapper.js';

@Injectable()
export class TypeormReservationRepository extends IReservationRepository {
  constructor(
    @InjectRepository(ReservationEntity)
    private readonly repo: Repository<ReservationEntity>,
    private readonly mapper: ReservationMapper,
  ) {
    super();
  }

  async save(reservation: Reservation): Promise<void> {
    const entity = this.mapper.toPersistence(reservation);
    await this.repo.save(entity);
  }

  async findById(id: string): Promise<Reservation | null> {
    const entity = await this.repo.findOneBy({ id });
    if (entity === null) return null;
    return this.mapper.toDomain(entity);
  }

  async findByUserId(
    userId: string,
    from?: string,
    to?: string,
    status?: string,
  ): Promise<Reservation[]> {
    const where: Record<string, unknown> = { user_id: userId };

    if (from && to) {
      where.reservation_date = Between(from, to);
    }
    if (status) {
      where.status = status;
    }

    const entities = await this.repo.find({
      where,
      order: { reservation_date: 'ASC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findByDate(date: string): Promise<Reservation[]> {
    const entities = await this.repo.find({
      where: { reservation_date: date, status: Not(Equal('CANCELLED')) },
      order: { created_at: 'ASC' },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }

  async findByUserIdAndDate(
    userId: string,
    date: string,
  ): Promise<Reservation | null> {
    const entity = await this.repo.findOneBy({
      user_id: userId,
      reservation_date: date,
      status: Not(Equal('CANCELLED')),
    });
    if (entity === null) return null;
    return this.mapper.toDomain(entity);
  }

  async findCalendarData(
    userId: string,
    year: number,
    month: number,
  ): Promise<Reservation[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;

    const entities = await this.repo.find({
      where: {
        user_id: userId,
        reservation_date: And(
          Not(Equal('')), // Ensure Between works
          Between(startDate, endDate),
        ),
        status: Not(Equal('CANCELLED')),
      },
    });
    return entities.map((e) => this.mapper.toDomain(e));
  }
}
