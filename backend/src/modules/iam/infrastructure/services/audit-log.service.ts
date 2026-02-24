import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from '../persistence/entities/audit-log.entity.js';

export interface LogParams {
  readonly actionType: string;
  readonly category: string;
  readonly actorId?: string;
  readonly targetType?: string;
  readonly targetId?: string;
  readonly details?: Record<string, unknown>;
  readonly ipAddress?: string;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly repo: Repository<AuditLogEntity>,
  ) {}

  async log(params: LogParams): Promise<void> {
    const entity: Partial<AuditLogEntity> = {
      id: crypto.randomUUID(),
      action_type: params.actionType,
      category: params.category,
      actor_id: params.actorId ?? null,
      target_type: params.targetType ?? null,
      target_id: params.targetId ?? null,
      details: params.details ?? null,
      ip_address: params.ipAddress ?? null,
    };
    await this.repo.save(entity);
  }
}
