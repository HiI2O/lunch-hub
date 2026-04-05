import { AggregateRoot } from '../../../../shared/domain/aggregate-root.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

interface CreateParams {
  readonly id: string;
  readonly guestName: string;
  readonly createdByStaffId: string;
}

interface ReconstructParams {
  readonly id: string;
  readonly guestName: string;
  readonly createdByStaffId: string;
  readonly visitDate: string | null;
  readonly createdAt: Date;
}

export class Guest extends AggregateRoot<string> {
  private _guestName: string;
  private _createdByStaffId: string;
  private _visitDate: string | null;
  private _createdAt: Date;

  private constructor(
    id: string,
    guestName: string,
    createdByStaffId: string,
    visitDate: string | null,
    createdAt: Date,
  ) {
    super(id);
    this._guestName = guestName;
    this._createdByStaffId = createdByStaffId;
    this._visitDate = visitDate;
    this._createdAt = createdAt;
  }

  get guestName(): string {
    return this._guestName;
  }

  get createdByStaffId(): string {
    return this._createdByStaffId;
  }

  get visitDate(): string | null {
    return this._visitDate;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  static create(params: CreateParams): Guest {
    Guest.validateGuestName(params.guestName);
    return new Guest(
      params.id,
      params.guestName,
      params.createdByStaffId,
      null,
      new Date(),
    );
  }

  static reconstruct(params: ReconstructParams): Guest {
    return new Guest(
      params.id,
      params.guestName,
      params.createdByStaffId,
      params.visitDate,
      params.createdAt,
    );
  }

  setVisitDate(date: string): void {
    this._visitDate = date;
  }

  private static validateGuestName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ValidationError('ゲスト名を入力してください');
    }
    if (name.length > 255) {
      throw new ValidationError('ゲスト名は255文字以下で入力してください');
    }
  }
}
