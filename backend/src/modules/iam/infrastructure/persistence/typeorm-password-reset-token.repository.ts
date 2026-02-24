import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IPasswordResetTokenRepository,
  type PasswordResetTokenRecord,
} from '../../domain/repositories/password-reset-token.repository.js';
import { PasswordResetTokenEntity } from './entities/password-reset-token.entity.js';
import { PasswordResetTokenMapper } from '../mappers/password-reset-token.mapper.js';

@Injectable()
export class TypeormPasswordResetTokenRepository extends IPasswordResetTokenRepository {
  constructor(
    @InjectRepository(PasswordResetTokenEntity)
    private readonly repo: Repository<PasswordResetTokenEntity>,
    private readonly mapper: PasswordResetTokenMapper,
  ) {
    super();
  }

  async save(record: PasswordResetTokenRecord): Promise<void> {
    const entity = this.mapper.toPersistence(record);
    await this.repo.save(entity);
  }

  async findByToken(token: string): Promise<PasswordResetTokenRecord | null> {
    const entity = await this.repo.findOneBy({ token });
    if (entity === null) {
      return null;
    }
    return this.mapper.toDomain(entity);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.repo.delete({ user_id: userId });
  }
}
