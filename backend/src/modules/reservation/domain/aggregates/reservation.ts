import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';
import { PaymentMethod } from '../value-objects/payment-method.js';
import {
  ReservationStatus,
  ReservationStatusValues,
} from '../value-objects/reservation-status.js';
import { ReservationCreatedEvent } from '../events/reservation-created.event.js';
import { ReservationCancelledEvent } from '../events/reservation-cancelled.event.js';
import { ReservationModifiedEvent } from '../events/reservation-modified.event.js';
import { ReservationFinalizedEvent } from '../events/reservation-finalized.event.js';

interface CreateParams {
  readonly id: string;
  readonly userId: string;
  readonly reservationDate: string;
  readonly paymentMethod: PaymentMethod;
  readonly ticketId?: string;
  readonly guestId?: string;
}

interface ReconstructParams {
  readonly id: string;
  readonly userId: string;
  readonly reservationDate: string;
  readonly paymentMethod: string;
  readonly status: string;
  readonly ticketId: string | null;
  readonly orderId: string | null;
  readonly guestId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
}

export class Reservation extends AggregateRoot<string> {
  private _userId: string;
  private _reservationDate: string;
  private _paymentMethod: PaymentMethod;
  private _status: ReservationStatus;
  private _ticketId: string | null;
  private _orderId: string | null;
  private _guestId: string | null;
  private _createdAt: Date;
  private _updatedAt: Date;
  private _version: number;

  private constructor(
    id: string,
    userId: string,
    reservationDate: string,
    paymentMethod: PaymentMethod,
    status: ReservationStatus,
    ticketId: string | null,
    orderId: string | null,
    guestId: string | null,
    createdAt: Date,
    updatedAt: Date,
    version: number,
  ) {
    super(id);
    this._userId = userId;
    this._reservationDate = reservationDate;
    this._paymentMethod = paymentMethod;
    this._status = status;
    this._ticketId = ticketId;
    this._orderId = orderId;
    this._guestId = guestId;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    this._version = version;
  }

  get userId(): string {
    return this._userId;
  }

  get reservationDate(): string {
    return this._reservationDate;
  }

  get paymentMethod(): PaymentMethod {
    return this._paymentMethod;
  }

  get status(): ReservationStatus {
    return this._status;
  }

  get ticketId(): string | null {
    return this._ticketId;
  }

  get orderId(): string | null {
    return this._orderId;
  }

  get guestId(): string | null {
    return this._guestId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get version(): number {
    return this._version;
  }

  static create(params: CreateParams): Reservation {
    const now = new Date();
    const reservation = new Reservation(
      params.id,
      params.userId,
      params.reservationDate,
      params.paymentMethod,
      ReservationStatus.create(ReservationStatusValues.CONFIRMED),
      params.ticketId ?? null,
      null,
      params.guestId ?? null,
      now,
      now,
      0,
    );

    reservation.addDomainEvent(
      new ReservationCreatedEvent(
        params.id,
        params.userId,
        params.reservationDate,
        params.paymentMethod.value,
      ),
    );

    return reservation;
  }

  static reconstruct(params: ReconstructParams): Reservation {
    return new Reservation(
      params.id,
      params.userId,
      params.reservationDate,
      PaymentMethod.create(params.paymentMethod),
      ReservationStatus.create(params.status),
      params.ticketId,
      params.orderId,
      params.guestId,
      params.createdAt,
      params.updatedAt,
      params.version,
    );
  }

  cancel(): void {
    this.ensureCanModify();
    this._status = ReservationStatus.create(ReservationStatusValues.CANCELLED);
    this._updatedAt = new Date();

    this.addDomainEvent(
      new ReservationCancelledEvent(
        this.id,
        this._userId,
        this._reservationDate,
      ),
    );
  }

  changePaymentMethod(
    newPaymentMethod: PaymentMethod,
    ticketId?: string,
  ): void {
    this.ensureCanModify();
    this._paymentMethod = newPaymentMethod;
    this._ticketId = newPaymentMethod.isTicket() ? (ticketId ?? null) : null;
    this._updatedAt = new Date();

    this.addDomainEvent(
      new ReservationModifiedEvent(
        this.id,
        this._userId,
        newPaymentMethod.value,
      ),
    );
  }

  finalize(orderId: string): void {
    this.ensureCanModify();
    this._status = ReservationStatus.create(ReservationStatusValues.FINALIZED);
    this._orderId = orderId;
    this._updatedAt = new Date();

    this.addDomainEvent(new ReservationFinalizedEvent(this.id, orderId));
  }

  canModify(): boolean {
    return this._status.canModify();
  }

  private ensureCanModify(): void {
    if (!this.canModify()) {
      throw new ValidationError('変更できない予約です');
    }
  }
}
