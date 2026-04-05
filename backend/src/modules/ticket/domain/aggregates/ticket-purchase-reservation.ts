import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';
import { PurchaseStatus } from '../value-objects/purchase-status.js';
import { TicketSetQuantity } from '../value-objects/ticket-set-quantity.js';
import { TicketPurchaseReservationCreatedEvent } from '../events/purchase-reservation-created.event.js';
import { TicketPurchaseReservationCancelledEvent } from '../events/purchase-reservation-cancelled.event.js';

interface CreateParams {
  readonly id: string;
  readonly userId: string;
  readonly purchaseDate: string;
  readonly quantity: number;
}

interface ReconstructParams {
  readonly id: string;
  readonly userId: string;
  readonly purchaseDate: string;
  readonly quantity: number;
  readonly status: string;
  readonly ticketId: string | null;
  readonly createdAt: Date;
  readonly version: number;
}

export class TicketPurchaseReservation extends AggregateRoot<string> {
  private readonly _userId: string;
  private readonly _purchaseDate: string;
  private readonly _quantity: TicketSetQuantity;
  private _status: PurchaseStatus;
  private _ticketId: string | null;
  private readonly _createdAt: Date;
  private readonly _version: number;

  private constructor(
    id: string,
    userId: string,
    purchaseDate: string,
    quantity: TicketSetQuantity,
    status: PurchaseStatus,
    ticketId: string | null,
    createdAt: Date,
    version: number,
  ) {
    super(id);
    this._userId = userId;
    this._purchaseDate = purchaseDate;
    this._quantity = quantity;
    this._status = status;
    this._ticketId = ticketId;
    this._createdAt = createdAt;
    this._version = version;
  }

  static create(params: CreateParams): TicketPurchaseReservation {
    const pr = new TicketPurchaseReservation(
      params.id,
      params.userId,
      params.purchaseDate,
      TicketSetQuantity.create(params.quantity),
      PurchaseStatus.create('PENDING'),
      null,
      new Date(),
      0,
    );
    pr.addDomainEvent(
      new TicketPurchaseReservationCreatedEvent(
        params.id,
        params.userId,
        params.quantity,
        params.purchaseDate,
      ),
    );
    return pr;
  }

  static reconstruct(params: ReconstructParams): TicketPurchaseReservation {
    return new TicketPurchaseReservation(
      params.id,
      params.userId,
      params.purchaseDate,
      TicketSetQuantity.create(params.quantity),
      PurchaseStatus.create(params.status),
      params.ticketId,
      params.createdAt,
      params.version,
    );
  }

  get userId(): string {
    return this._userId;
  }

  get purchaseDate(): string {
    return this._purchaseDate;
  }

  get quantity(): TicketSetQuantity {
    return this._quantity;
  }

  get status(): PurchaseStatus {
    return this._status;
  }

  get ticketId(): string | null {
    return this._ticketId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get version(): number {
    return this._version;
  }

  getTotalTickets(): number {
    return this._quantity.getTotalTickets();
  }

  cancel(): void {
    if (!this._status.canCancel()) {
      throw new ValidationError('キャンセルできない購入予約です');
    }
    this._status = PurchaseStatus.create('CANCELLED');
    this.addDomainEvent(
      new TicketPurchaseReservationCancelledEvent(
        this.id,
        this._userId,
        this._ticketId,
      ),
    );
  }

  receive(): void {
    this._status = PurchaseStatus.create('RECEIVED');
  }

  setTicketId(ticketId: string): void {
    this._ticketId = ticketId;
  }
}
