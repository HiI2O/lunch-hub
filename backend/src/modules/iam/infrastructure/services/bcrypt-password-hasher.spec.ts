import { BcryptPasswordHasher } from './bcrypt-password-hasher.js';

describe('BcryptPasswordHasher', () => {
  let hasher: BcryptPasswordHasher;

  beforeEach(() => {
    hasher = new BcryptPasswordHasher();
  });

  describe('hash', () => {
    it('should produce a valid bcrypt hash', async () => {
      const hash = await hasher.hash('password123');

      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$.{53}$/);
    });

    it('should produce different hashes for the same password', async () => {
      const hash1 = await hasher.hash('password123');
      const hash2 = await hasher.hash('password123');

      expect(hash1).not.toBe(hash2);
    });

    it('should use cost factor 12', async () => {
      const hash = await hasher.hash('test');

      expect(hash).toContain('$2b$12$');
    });
  });

  describe('compare', () => {
    it('should return true for matching password', async () => {
      const hash = await hasher.hash('correctPassword');

      const result = await hasher.compare('correctPassword', hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const hash = await hasher.hash('correctPassword');

      const result = await hasher.compare('wrongPassword', hash);

      expect(result).toBe(false);
    });

    it('should return false for empty password against a hash', async () => {
      const hash = await hasher.hash('somePassword');

      const result = await hasher.compare('', hash);

      expect(result).toBe(false);
    });
  });
});
