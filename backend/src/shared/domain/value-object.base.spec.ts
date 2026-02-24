import { ValueObject } from './value-object.base.js';

interface TestProps {
  readonly name: string;
  readonly age: number;
}

class TestValueObject extends ValueObject<TestProps> {
  constructor(props: TestProps) {
    super(props);
  }

  get name(): string {
    return this.props.name;
  }
}

class AnotherValueObject extends ValueObject<TestProps> {
  constructor(props: TestProps) {
    super(props);
  }
}

describe('ValueObject', () => {
  it('should freeze props on creation', () => {
    const vo = new TestValueObject({ name: 'test', age: 25 });
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (vo as any).props.name = 'changed';
    }).toThrow();
  });

  it('should be equal when props are the same', () => {
    const vo1 = new TestValueObject({ name: 'test', age: 25 });
    const vo2 = new TestValueObject({ name: 'test', age: 25 });
    expect(vo1.equals(vo2)).toBe(true);
  });

  it('should not be equal when props differ', () => {
    const vo1 = new TestValueObject({ name: 'test', age: 25 });
    const vo2 = new TestValueObject({ name: 'other', age: 25 });
    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should not be equal to null or undefined', () => {
    const vo = new TestValueObject({ name: 'test', age: 25 });
    expect(vo.equals(null)).toBe(false);
    expect(vo.equals(undefined)).toBe(false);
  });

  it('should not be equal to different ValueObject type', () => {
    const vo1 = new TestValueObject({ name: 'test', age: 25 });
    const vo2 = new AnotherValueObject({ name: 'test', age: 25 });
    expect(vo1.equals(vo2)).toBe(false);
  });

  it('should expose props via getter', () => {
    const vo = new TestValueObject({ name: 'test', age: 25 });
    expect(vo.name).toBe('test');
  });
});
