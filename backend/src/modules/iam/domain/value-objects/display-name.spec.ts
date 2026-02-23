import { DisplayName } from './display-name.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

describe('DisplayName', () => {
  it('should create a valid display name', () => {
    const name = DisplayName.create('田中太郎');
    expect(name.value).toBe('田中太郎');
  });

  it('should accept English names', () => {
    const name = DisplayName.create('John Doe');
    expect(name.value).toBe('John Doe');
  });

  it('should accept names with middle dot and prolonged sound mark', () => {
    const name = DisplayName.create('ジョン・ドゥー');
    expect(name.value).toBe('ジョン・ドゥー');
  });

  it('should trim whitespace', () => {
    const name = DisplayName.create('  田中太郎  ');
    expect(name.value).toBe('田中太郎');
  });

  it('should throw on empty name', () => {
    expect(() => DisplayName.create('')).toThrow(ValidationError);
    expect(() => DisplayName.create('   ')).toThrow(ValidationError);
  });

  it('should throw on name exceeding 50 characters', () => {
    const longName = 'あ'.repeat(51);
    expect(() => DisplayName.create(longName)).toThrow(ValidationError);
  });

  it('should accept exactly 50 characters', () => {
    const name = 'あ'.repeat(50);
    expect(DisplayName.create(name).value).toBe(name);
  });

  it('should throw on invalid characters', () => {
    expect(() => DisplayName.create('test@user')).toThrow(ValidationError);
    expect(() => DisplayName.create('test<script>')).toThrow(ValidationError);
  });

  it('should be equal when values match', () => {
    const n1 = DisplayName.create('田中太郎');
    const n2 = DisplayName.create('田中太郎');
    expect(n1.equals(n2)).toBe(true);
  });
});
