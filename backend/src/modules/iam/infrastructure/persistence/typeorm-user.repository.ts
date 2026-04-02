import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/user.repository.js';
import { User } from '../../domain/aggregates/user.js';
import { UserEntity } from './entities/user.entity.js';
import { UserMapper } from '../mappers/user.mapper.js';

@Injectable()
export class TypeormUserRepository extends IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
    private readonly mapper: UserMapper,
  ) {
    super();
  }

  async save(user: User): Promise<void> {
    const entity = this.mapper.toPersistence(user);
    await this.repo.save(entity);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOneBy({ id });
    if (entity === null) {
      return null;
    }
    return this.mapper.toDomain(entity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repo.findOneBy({ email });
    if (entity === null) {
      return null;
    }
    return this.mapper.toDomain(entity);
  }

  async findByInvitationToken(token: string): Promise<User | null> {
    const entity = await this.repo.findOneBy({ invitation_token: token });
    if (entity === null) {
      return null;
    }
    return this.mapper.toDomain(entity);
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.repo.existsBy({ email });
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repo.find();
    return entities.map((entity) => this.mapper.toDomain(entity));
  }
}
