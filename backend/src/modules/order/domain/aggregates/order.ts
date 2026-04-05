import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';
import { OrderStatus } from '../value-objects/order-status.js';
import { OrderPlacedEvent } from '../events/order-placed.event.js';

interface CreateParams {
  readonly id: string;
  readonly orderDate: string;
  readonly reservationIds: readonly string[];
}

interface ReconstructParams {
  readonly id: string;
  readonly orderDate: string;
  readonly reservationIds: readonly string[];
  readonly status: string;
  readonly totalCount: number;
  readonly createdAt: Date;
  readonly placedAt: Date | null;
  readonly version: number;
}

export class Order extends AggregateRoot<string> {
  private readonly _orderDate: string;
  private readonly _reservationIds: readonly string[];
  private _status: OrderStatus;
  private readonly _totalCount: number;
  private readonly _createdAt: Date;
  private _placedAt: Date | null;
  private readonly _version: number;

  private constructor(
    id: string,
    orderDate: string,
    reservationIds: readonly string[],
    status: OrderStatus,
    totalCount: number,
    createdAt: Date,
    placedAt: Date | null,
    version: number,
  ) {
    super(id);
    this._orderDate = orderDate;
    this._reservationIds = reservationIds;
    this._status = status;
    this._totalCount = totalCount;
    this._createdAt = createdAt;
    this._placedAt = placedAt;
    this._version = version;
  }

  static create(params: CreateParams): Order {
    if (params.reservationIds.length === 0) {
      throw new ValidationError('予約が1つ以上必要です');
    }
    return new Order(
      params.id,
      params.orderDate,
      params.reservationIds,
      OrderStatus.create('PENDING'),
      params.reservationIds.length,
      new Date(),
      null,
      0,
    );
  }

  static reconstruct(params: ReconstructParams): Order {
    return new Order(
      params.id,
      params.orderDate,
      params.reservationIds,
      OrderStatus.create(params.status),
      params.totalCount,
      params.createdAt,
      params.placedAt,
      params.version,
    );
  }

  get orderDate(): string {
    return this._orderDate;
  }

  get reservationIds(): readonly string[] {
    return this._reservationIds;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get totalCount(): number {
    return this._totalCount;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get placedAt(): Date | null {
    return this._placedAt;
  }

  get version(): number {
    return this._version;
  }

  placeOrder(): void {
    if (!this._status.canModify()) {
      throw new ValidationError('変更できない注文です');
    }
    this._status = OrderStatus.create('PLACED');
    this._placedAt = new Date();
    this.addDomainEvent(
      new OrderPlacedEvent(this.id, this._orderDate, this._totalCount),
    );
  }

  canModify(): boolean {
    return this._status.canModify();
  }
}
