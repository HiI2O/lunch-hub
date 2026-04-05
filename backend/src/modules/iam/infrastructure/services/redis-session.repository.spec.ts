import { RedisSessionRepository } from './redis-session.repository.js';
import { Session } from '../../domain/aggregates/session.js';
import type Redis from 'ioredis';

describe('RedisSessionRepository', () => {
  let repository: RedisSessionRepository;
  let redis: Record<string, jest.Mock>;
  let pipelineMock: Record<string, jest.Mock>;

  const sessionData = {
    id: 'session-1',
    userId: 'user-1',
    refreshToken: 'refresh-token-1',
    isRevoked: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    lastAccessedAt: '2025-01-01T00:00:00.000Z',
    expiresAt: '2025-01-08T00:00:00.000Z',
  };

  function createSession(overrides: Partial<typeof sessionData> = {}): Session {
    const data = { ...sessionData, ...overrides };
    return Session.reconstruct({
      id: data.id,
      userId: data.userId,
      refreshToken: data.refreshToken,
      isRevoked: data.isRevoked,
      createdAt: new Date(data.createdAt),
      lastAccessedAt: new Date(data.lastAccessedAt),
      expiresAt: new Date(data.expiresAt),
    });
  }

  beforeEach(() => {
    pipelineMock = {
      set: jest.fn().mockReturnThis(),
      sadd: jest.fn().mockReturnThis(),
      expire: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      srem: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };
    redis = {
      pipeline: jest.fn().mockReturnValue(pipelineMock),
      get: jest.fn(),
      smembers: jest.fn(),
      del: jest.fn(),
    };
    repository = new RedisSessionRepository(redis as unknown as Redis);
  });

  describe('save', () => {
    it('セッションデータをJSONシリアライズしてsession:{id}キーに保存する', async () => {
      const session = createSession();

      await repository.save(session);

      expect(pipelineMock.set).toHaveBeenCalledWith(
        'session:session-1',
        expect.any(String),
        'EX',
        604800,
      );
      const savedJson = pipelineMock.set.mock.calls[0][1] as string;
      const parsed = JSON.parse(savedJson);
      expect(parsed.id).toBe('session-1');
      expect(parsed.userId).toBe('user-1');
    });

    it('refreshToken:{token}キーにセッションIDをマッピングする', async () => {
      const session = createSession();

      await repository.save(session);

      expect(pipelineMock.set).toHaveBeenCalledWith(
        'refreshToken:refresh-token-1',
        'session-1',
        'EX',
        604800,
      );
    });

    it('user:{userId}:sessionsセットにセッションIDを追加する', async () => {
      const session = createSession();

      await repository.save(session);

      expect(pipelineMock.sadd).toHaveBeenCalledWith(
        'user:user-1:sessions',
        'session-1',
      );
    });

    it('各キーにTTL（7日 = 604800秒）が設定される', async () => {
      const session = createSession();

      await repository.save(session);

      expect(pipelineMock.expire).toHaveBeenCalledWith(
        'user:user-1:sessions',
        604800,
      );
    });

    it('pipelineを使って一括実行される', async () => {
      const session = createSession();

      await repository.save(session);

      expect(redis.pipeline).toHaveBeenCalledTimes(1);
      expect(pipelineMock.exec).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('存在するセッションID → Sessionドメインオブジェクトを返す', async () => {
      redis.get.mockResolvedValue(JSON.stringify(sessionData));

      const result = await repository.findById('session-1');

      expect(result).toBeInstanceOf(Session);
      expect(result?.id).toBe('session-1');
      expect(result?.userId).toBe('user-1');
    });

    it('存在しないセッションID → nullを返す', async () => {
      redis.get.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('isRevoked: trueのセッションが正しく復元される', async () => {
      redis.get.mockResolvedValue(
        JSON.stringify({ ...sessionData, isRevoked: true }),
      );

      const result = await repository.findById('session-1');

      expect(result?.isRevoked).toBe(true);
    });
  });

  describe('findByRefreshToken', () => {
    it('存在するリフレッシュトークン → 対応するSessionを返す', async () => {
      redis.get
        .mockResolvedValueOnce('session-1') // refreshToken lookup
        .mockResolvedValueOnce(JSON.stringify(sessionData)); // session lookup

      const result = await repository.findByRefreshToken('refresh-token-1');

      expect(result?.id).toBe('session-1');
    });

    it('存在しないリフレッシュトークン → nullを返す', async () => {
      redis.get.mockResolvedValue(null);

      const result = await repository.findByRefreshToken('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('ユーザーに紐づくセッション一覧を返す', async () => {
      redis.smembers.mockResolvedValue(['session-1', 'session-2']);
      redis.get
        .mockResolvedValueOnce(JSON.stringify(sessionData))
        .mockResolvedValueOnce(
          JSON.stringify({ ...sessionData, id: 'session-2' }),
        );

      const result = await repository.findByUserId('user-1');

      expect(result).toHaveLength(2);
    });

    it('セッションが0件の場合 → 空配列を返す', async () => {
      redis.smembers.mockResolvedValue([]);

      const result = await repository.findByUserId('user-1');

      expect(result).toEqual([]);
    });

    it('期限切れでRedisから消えたセッションIDはスキップする', async () => {
      redis.smembers.mockResolvedValue(['session-1', 'expired-session']);
      redis.get
        .mockResolvedValueOnce(JSON.stringify(sessionData))
        .mockResolvedValueOnce(null);

      const result = await repository.findByUserId('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('session-1');
    });
  });

  describe('delete', () => {
    it('セッションキー、リフレッシュトークンキー、ユーザーセッションセットから削除する', async () => {
      redis.get.mockResolvedValue(JSON.stringify(sessionData));

      await repository.delete('session-1');

      expect(pipelineMock.del).toHaveBeenCalledWith('session:session-1');
      expect(pipelineMock.del).toHaveBeenCalledWith(
        'refreshToken:refresh-token-1',
      );
      expect(pipelineMock.srem).toHaveBeenCalledWith(
        'user:user-1:sessions',
        'session-1',
      );
    });

    it('存在しないセッションID → 何もしない（エラーにならない）', async () => {
      redis.get.mockResolvedValue(null);

      await expect(repository.delete('nonexistent')).resolves.not.toThrow();
      expect(redis.pipeline).not.toHaveBeenCalled();
    });
  });

  describe('deleteAllByUserId', () => {
    it('ユーザーの全セッションを削除する', async () => {
      redis.smembers.mockResolvedValue(['session-1']);
      redis.get.mockResolvedValue(JSON.stringify(sessionData));

      await repository.deleteAllByUserId('user-1');

      expect(pipelineMock.del).toHaveBeenCalledWith('session:session-1');
    });

    it('ユーザーセッションセット自体も削除する', async () => {
      redis.smembers.mockResolvedValue([]);

      await repository.deleteAllByUserId('user-1');

      expect(redis.del).toHaveBeenCalledWith('user:user-1:sessions');
    });
  });
});
