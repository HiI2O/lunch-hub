import type { Guest } from '../aggregates/guest.js';

export abstract class IGuestRepository {
  abstract save(guest: Guest): Promise<void>;
  abstract findById(id: string): Promise<Guest | null>;
  abstract findByVisitDate(date: string): Promise<Guest[]>;
}
