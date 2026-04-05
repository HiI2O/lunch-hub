import { AuditLogService, type LogParams } from './audit-log.service.js';
import type { Repository } from 'typeorm';
import type { AuditLogEntity } from '../persistence/entities/audit-log.entity.js';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let repo: jest.Mocked<Pick<Repository<AuditLogEntity>, 'save'>>;

  beforeEach(() => {
    jest.spyOn(crypto, 'randomUUID').mockReturnValue(
      '550e8400-e29b-41d4-a716-446655440000' as ReturnType<
        typeof crypto.randomUUID
      >,
    );
    repo = { save: jest.fn().mockResolvedValue(undefined) };
    service = new AuditLogService(
      repo as unknown as Repository<AuditLogEntity>,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log', () => {
    it('必須パラメータ（actionType, category）のみで保存できる', async () => {
      await service.log({ actionType: 'LOGIN', category: 'AUTH' });

      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('全パラメータ指定時に正しくエンティティに変換される', async () => {
      const params: LogParams = {
        actionType: 'ROLE_CHANGE',
        category: 'IAM',
        actorId: 'actor-1',
        targetType: 'User',
        targetId: 'target-1',
        details: { oldRole: 'GENERAL_USER', newRole: 'STAFF' },
        ipAddress: '192.168.1.1',
      };

      await service.log(params);

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          action_type: 'ROLE_CHANGE',
          category: 'IAM',
          actor_id: 'actor-1',
          target_type: 'User',
          target_id: 'target-1',
          details: { oldRole: 'GENERAL_USER', newRole: 'STAFF' },
          ip_address: '192.168.1.1',
        }),
      );
    });

    it('オプショナル項目未指定時はnullが設定される', async () => {
      await service.log({ actionType: 'LOGIN', category: 'AUTH' });

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          actor_id: null,
          target_type: null,
          target_id: null,
          details: null,
          ip_address: null,
        }),
      );
    });

    it('idにUUIDが自動生成される', async () => {
      await service.log({ actionType: 'LOGIN', category: 'AUTH' });

      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '550e8400-e29b-41d4-a716-446655440000',
        }),
      );
    });

    it('repo.saveが1回呼ばれる', async () => {
      await service.log({ actionType: 'LOGIN', category: 'AUTH' });

      expect(repo.save).toHaveBeenCalledTimes(1);
    });
  });
});
