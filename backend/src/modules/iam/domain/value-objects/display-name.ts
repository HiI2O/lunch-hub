import { ValueObject } from '../../../../shared/domain/value-object.base.js';
import { ValidationError } from '../../../../shared/domain/errors/validation.error.js';

interface DisplayNameProps {
  readonly value: string;
}

const DISPLAY_NAME_REGEX = /^[\p{L}\p{N}\s・ー-]+$/u;
const MIN_LENGTH = 1;
const MAX_LENGTH = 50;

export class DisplayName extends ValueObject<DisplayNameProps> {
  private constructor(props: DisplayNameProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(name: string): DisplayName {
    const trimmed = name.trim();
    if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
      throw new ValidationError(
        `Display name must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`,
      );
    }
    if (!DISPLAY_NAME_REGEX.test(trimmed)) {
      throw new ValidationError(
        'Display name can only contain letters, numbers, spaces, middle dot, and prolonged sound mark',
      );
    }
    return new DisplayName({ value: trimmed });
  }
}
