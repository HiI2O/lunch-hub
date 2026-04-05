import {
  Entity,
  Column,
  PrimaryColumn,
  VersionColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('orders')
@Index(['order_date'])
export class OrderEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'date' })
  order_date!: string;

  @Column({ type: 'jsonb' })
  reservation_ids!: string[];

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status!: string;

  @Column({ type: 'integer' })
  total_count!: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  placed_at!: Date | null;

  @VersionColumn()
  version!: number;
}
