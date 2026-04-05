import { IReservationRepository } from '../../domain/repositories/reservation.repository.js';
import { IGuestRepository } from '../../domain/repositories/guest.repository.js';
import { Reservation } from '../../domain/aggregates/reservation.js';
import {
  PaymentMethod,
  PaymentMethodValues,
} from '../../domain/value-objects/payment-method.js';
import { ReservationDeadlineService } from '../../domain/services/reservation-deadline.service.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error.js';
import type { ReservationResultDto } from '../dto/reservation-result.dto.js';

interface CreateGuestReservationDto {
  readonly guestId: string;
  readonly reservationDate: string;
  readonly staffId: string;
}

export class CreateGuestReservationUseCase {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly guestRepository: IGuestRepository,
    private readonly nowFn: () => Date = () => new Date(),
  ) {}

  async execute(dto: CreateGuestReservationDto): Promise<ReservationResultDto> {
    const now = this.nowFn();

    // 締め切りチェック
    if (
      !ReservationDeadlineService.isBeforeDeadline(dto.reservationDate, now)
    ) {
      throw new ValidationError('予��の締め切り時刻を過ぎています');
    }

    // ゲスト存在チェック
    const guest = await this.guestRepository.findById(dto.guestId);
    if (guest === null) {
      throw new NotFoundError('Guest', dto.guestId);
    }

    // ゲスト予約は現金固定
    const reservation = Reservation.create({
      id: crypto.randomUUID(),
      userId: dto.staffId,
      reservationDate: dto.reservationDate,
      paymentMethod: PaymentMethod.create(PaymentMethodValues.CASH),
      guestId: dto.guestId,
    });

    // ゲストの訪問日を予約日から自動設定
    guest.setVisitDate(dto.reservationDate);

    await this.reservationRepository.save(reservation);
    await this.guestRepository.save(guest);

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
