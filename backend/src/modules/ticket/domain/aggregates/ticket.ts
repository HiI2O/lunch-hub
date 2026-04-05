import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';
import { TicketStatus } from '../value-objects/ticket-status.js';
import { TicketCount } from '../value-objects/ticket-count.js';
import { TicketCreatedEvent } from '../events/ticket-created.event.js';
import { TicketUsedEvent } from '../events/ticket-used.event.js';
import { TicketRestoredEvent } from '../events/ticket-restored.event.js';
import { TicketReceivedEvent } from '../events/ticket-received.event.js';

interface CreateParams {
  readonly id: string;
  readonly ownerId: string;
  readonly initialCount: number;
  readonly purchaseDate: string;
}

interface ReconstructParams {
  readonly id: string;
  readonly ownerId: string;
  readonly remainingCount: number;
  readonly status: string;
  readonly purchaseDate: string;
  readonly createdAt: Date;
  readonly version: number;
}

export class Ticket extends AggregateRoot<string> {
  private readonly _ownerId: string;
  private _remainingCount: TicketCount;
  private _status: TicketStatus;
  private readonly _purchaseDate: string;
  private readonly _createdAt: Date;
  private readonly _version: number;

  private constructor(
    id: string,
    ownerId: string,
    remainingCount: TicketCount,
    status: TicketStatus,
    purchaseDate: string,
    createdAt: Date,
    version: number,
  ) {
    super(id);
    this._ownerId = ownerId;
    this._remainingCount = remainingCount;
    this._status = status;
    this._purchaseDate = purchaseDate;
    this._createdAt = createdAt;
    this._version = version;
  }

  static create(params: CreateParams): Ticket {
    const ticket = new Ticket(
      params.id,
      params.ownerId,
      TicketCount.create(params.initialCount),
      TicketStatus.create('PENDING'),
      params.purchaseDate,
      new Date(),
      0,
    );
    ticket.addDomainEvent(
      new TicketCreatedEvent(params.id, params.ownerId, params.initialCount),
    );
    return ticket;
  }

  static reconstruct(params: ReconstructParams): Ticket {
    return new Ticket(
      params.id,
      params.ownerId,
      TicketCount.create(params.remainingCount),
      TicketStatus.create(params.status),
      params.purchaseDate,
      params.createdAt,
      params.version,
    );
  }

  get ownerId(): string {
    return this._ownerId;
  }

  get remainingCount(): number {
    return this._remainingCount.value;
  }

  get status(): TicketStatus {
    return this._status;
  }

  get purchaseDate(): string {
    return this._purchaseDate;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get version(): number {
    return this._version;
  }

  use(): void {
    this._remainingCount = this._remainingCount.decrement();
    this.addDomainEvent(
      new TicketUsedEvent(this.id, this._remainingCount.value),
    );
  }

  restoreCount(): void {
    this._remainingCount = this._remainingCount.increment();
    this.addDomainEvent(
      new TicketRestoredEvent(this.id, this._remainingCount.value),
    );
  }

  addCount(count: number): void {
    this._remainingCount = this._remainingCount.add(count);
  }

  receive(): void {
    if (this._status.isReceived()) {
      throw new ValidationError('既に受取済みです');
    }
    this._status = TicketStatus.create('RECEIVED');
    this.addDomainEvent(new TicketReceivedEvent(this.id));
  }

  canUse(): boolean {
    return this._remainingCount.canUse();
  }
}
