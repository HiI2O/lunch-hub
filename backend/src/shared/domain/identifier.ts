import { ValueObject } from './value-object.base.js';

interface UniqueIdProps {
  readonly value: string;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class UniqueId extends ValueObject<UniqueIdProps> {
  private constructor(props: UniqueIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(id?: string): UniqueId {
    if (id !== undefined) {
      if (!UUID_REGEX.test(id)) {
        throw new Error(`Invalid UUID format: ${id}`);
      }
      return new UniqueId({ value: id });
    }
    return new UniqueId({ value: crypto.randomUUID() });
  }

  toString(): string {
    return this.props.value;
  }
}
