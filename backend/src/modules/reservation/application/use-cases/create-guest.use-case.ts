import { IGuestRepository } from '../../domain/repositories/guest.repository.js';
import { Guest } from '../../domain/aggregates/guest.js';

interface CreateGuestDto {
  readonly guestName: string;
  readonly createdByStaffId: string;
}

interface GuestResultDto {
  readonly id: string;
  readonly guestName: string;
  readonly createdAt: Date;
}

export class CreateGuestUseCase {
  constructor(private readonly guestRepository: IGuestRepository) {}

  async execute(dto: CreateGuestDto): Promise<GuestResultDto> {
    const guest = Guest.create({
      id: crypto.randomUUID(),
      guestName: dto.guestName,
      createdByStaffId: dto.createdByStaffId,
    });

    await this.guestRepository.save(guest);

    return {
      id: guest.id,
      guestName: guest.guestName,
      createdAt: guest.createdAt,
    };
  }
}
