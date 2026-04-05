import {
  Entity,
  Column,
  PrimaryColumn,
  VersionColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('tickets')
@Index(['owner_id'])
export class TicketEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  owner_id!: string;

  @Column({ type: 'integer' })
  remaining_count!: number;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status!: string;

  @Column({ type: 'date' })
  purchase_date!: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @VersionColumn()
  version!: number;
}
