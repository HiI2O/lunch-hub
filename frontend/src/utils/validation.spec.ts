import { validators } from './validation';

describe('validators', () => {
  describe('email', () => {
    it('有効なメールアドレスの場合undefinedを返す', () => {
      expect(validators.email('user@example.com')).toBeUndefined();
    });

    it('空文字の場合エラーメッセージを返す', () => {
      expect(validators.email('')).toBeDefined();
    });

    it('不正な形式の場合エラーメッセージを返す', () => {
      expect(validators.email('invalid')).toBeDefined();
      expect(validators.email('a@b')).toBeDefined();
    });
  });

  describe('password', () => {
    it('ポリシーを満たすパスワードの場合undefinedを返す', () => {
      expect(validators.password('Abcd123!')).toBeUndefined();
    });

    it('空文字の場合エラーメッセージを返す', () => {
      expect(validators.password('')).toBeDefined();
    });

    it('8文字未満の場合エラーメッセージを返す', () => {
      expect(validators.password('Ab1!')).toBeDefined();
    });

    it('英字がない場合エラーメッセージを返す', () => {
      expect(validators.password('12345678!')).toBeDefined();
    });

    it('数字がない場合エラーメッセージを返す', () => {
      expect(validators.password('Abcdefgh!')).toBeDefined();
    });

    it('記号がない場合エラーメッセージを返す', () => {
      expect(validators.password('Abcdefg1')).toBeDefined();
    });
  });

  describe('passwordConfirm', () => {
    it('一致する場合undefinedを返す', () => {
      expect(validators.passwordConfirm('pass', 'pass')).toBeUndefined();
    });

    it('不一致の場合エラーメッセージを返す', () => {
      expect(validators.passwordConfirm('pass1', 'pass2')).toBeDefined();
    });
  });

  describe('pin', () => {
    it('有効なPINの場合undefinedを返す', () => {
      expect(validators.pin('abc123')).toBeUndefined();
    });

    it('空文字の場合エラーメッセージを返す', () => {
      expect(validators.pin('')).toBeDefined();
    });

    it('6文字未満の場合エラーメッセージを返す', () => {
      expect(validators.pin('abc')).toBeDefined();
    });

    it('12文字超過の場合エラーメッセージを返す', () => {
      expect(validators.pin('a'.repeat(13))).toBeDefined();
    });
  });

  describe('displayName', () => {
    it('有効な表示名の場合undefinedを返す', () => {
      expect(validators.displayName('田中太郎')).toBeUndefined();
    });

    it('空文字の場合エラーメッセージを返す', () => {
      expect(validators.displayName('')).toBeDefined();
    });

    it('50文字超過の場合エラーメッセージを返す', () => {
      expect(validators.displayName('あ'.repeat(51))).toBeDefined();
    });
  });

  describe('required', () => {
    it('値がある場合undefinedを返す', () => {
      expect(validators.required('test')).toBeUndefined();
    });

    it('空文字の場合エラーメッセージを返す', () => {
      expect(validators.required('')).toBeDefined();
    });
  });
});
