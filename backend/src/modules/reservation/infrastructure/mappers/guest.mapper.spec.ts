import { GuestMapper } from './guest.mapper.js';
import { Guest } from '../../domain/aggregates/guest.js';
import type { GuestEntity } from '../persistence/entities/guest.entity.js';

describe('GuestMapper', () => {
  const mapper = new GuestMapper();

  describe('toDomain', () => {
    it('エンティティからドメインオブジェクトに変換できる', () => {
      const entity: GuestEntity = {
        id: 'g-1',
        guest_name: '来客A様',
        created_by_staff_id: 'staff-1',
        visit_date: '2026-04-10',
        created_at: new Date('2026-04-01'),
      };

      const domain = mapper.toDomain(entity);

      expect(domain.id).toBe('g-1');
      expect(domain.guestName).toBe('来客A様');
      expect(domain.createdByStaffId).toBe('staff-1');
      expect(domain.visitDate).toBe('2026-04-10');
    });
  });

  describe('toPersistence', () => {
    it('ドメインオブジェクトからエンティティに変換できる', () => {
      const guest = Guest.create({
        id: 'g-2',
        guestName: '来客B様',
        createdByStaffId: 'staff-2',
      });

      const entity = mapper.toPersistence(guest);

      expect(entity.id).toBe('g-2');
      expect(entity.guest_name).toBe('来客B様');
      expect(entity.created_by_staff_id).toBe('staff-2');
      expect(entity.visit_date).toBeNull();
    });
  });
});
