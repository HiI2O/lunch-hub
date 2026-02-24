import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  action_type!: string;

  @Column({ type: 'varchar', length: 50 })
  category!: string;

  @Column({ type: 'uuid', nullable: true })
  actor_id!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  target_type!: string | null;

  @Column({ type: 'uuid', nullable: true })
  target_id!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  details!: Record<string, unknown> | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}
