import { IReservationRepository } from '../../domain/repositories/reservation.repository.js';
import { Reservation } from '../../domain/aggregates/reservation.js';
import { PaymentMethod } from '../../domain/value-objects/payment-method.js';
import { ReservationPeriod } from '../../domain/value-objects/reservation-period.js';
import { ReservationDeadlineService } from '../../domain/services/reservation-deadline.service.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';
import { ConflictError } from '../../../../shared/domain/errors/conflict.error.js';
import type { CreateReservationDto } from '../dto/create-reservation.dto.js';
import type { ReservationResultDto } from '../dto/reservation-result.dto.js';

export class CreateReservationUseCase {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly nowFn: () => Date = () => new Date(),
  ) {}

  async execute(dto: CreateReservationDto): Promise<ReservationResultDto> {
    const now = this.nowFn();

    // 支払い方法バリデーション（PaymentMethod.createが内部でバリデーション）
    const paymentMethod = PaymentMethod.create(dto.paymentMethod);

    // 予約可能期間チェック
    if (!ReservationPeriod.isWithinPeriod(dto.reservationDate, now)) {
      throw new ValidationError('予約可能期間外の日付です');
    }

    // 締め切りチェック
    if (
      !ReservationDeadlineService.isBeforeDeadline(dto.reservationDate, now)
    ) {
      throw new ValidationError('予約の締め切り時刻を過ぎています');
    }

    // 重複チェック
    const existing = await this.reservationRepository.findByUserIdAndDate(
      dto.userId,
      dto.reservationDate,
    );
    if (existing !== null && existing.canModify()) {
      throw new ConflictError('同じ日に既に予約が存在します');
    }

    const reservation = Reservation.create({
      id: crypto.randomUUID(),
      userId: dto.userId,
      reservationDate: dto.reservationDate,
      paymentMethod,
      ticketId: dto.ticketId,
    });

    await this.reservationRepository.save(reservation);

    return {
      id: reservation.id,
      reservationDate: reservation.reservationDate,
      paymentMethod: reservation.paymentMethod.value,
      status: reservation.status.value,
      ticketId: reservation.ticketId,
      createdAt: reservation.createdAt,
    };
  }
}
