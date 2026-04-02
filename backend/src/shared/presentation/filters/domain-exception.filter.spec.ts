import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter.js';
import { NotFoundError } from '../../domain/errors/not-found.error.js';
import { ConflictError } from '../../domain/errors/conflict.error.js';
import { ValidationError } from '../../domain/errors/validation.error.js';

function createMockArgumentsHost(): {
  host: ArgumentsHost;
  mockJson: jest.Mock;
  mockStatus: jest.Mock;
} {
  const mockJson = jest.fn();
  const mockStatus = jest.fn().mockReturnValue({ json: mockJson });
  const host = {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: jest.fn().mockReturnValue({ status: mockStatus }),
    }),
  } as unknown as ArgumentsHost;
  return { host, mockJson, mockStatus };
}

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;

  beforeEach(() => {
    filter = new DomainExceptionFilter();
  });

  it('NotFoundErrorを404にマッピングする', () => {
    const { host, mockStatus, mockJson } = createMockArgumentsHost();
    const error = new NotFoundError('User', 'test-id');

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockJson).toHaveBeenCalledWith({
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: 'User with id test-id was not found',
      },
    });
  });

  it('ConflictErrorを409にマッピングする', () => {
    const { host, mockStatus, mockJson } = createMockArgumentsHost();
    const error = new ConflictError('Already exists');

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockJson).toHaveBeenCalledWith({
      error: { code: 'CONFLICT', message: 'Already exists' },
    });
  });

  it('ValidationErrorを400にマッピングする', () => {
    const { host, mockStatus, mockJson } = createMockArgumentsHost();
    const error = new ValidationError('Invalid input');

    filter.catch(error, host);

    expect(mockStatus).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockJson).toHaveBeenCalledWith({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid input' },
    });
  });
});
