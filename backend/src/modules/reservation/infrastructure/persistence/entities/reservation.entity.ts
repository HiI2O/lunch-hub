import {
  Entity,
  Column,
  PrimaryColumn,
  VersionColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('reservations')
@Index(['user_id'])
@Index(['reservation_date'])
@Index(['status'])
@Index(['order_id'])
export class ReservationEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'uuid', nullable: true })
  guest_id!: string | null;

  @Column({ type: 'date' })
  reservation_date!: string;

  @Column({ type: 'varchar', length: 50 })
  payment_method!: string;

  @Column({ type: 'varchar', length: 50, default: 'CONFIRMED' })
  status!: string;

  @Column({ type: 'uuid', nullable: true })
  ticket_id!: string | null;

  @Column({ type: 'uuid', nullable: true })
  order_id!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @VersionColumn()
  version!: number;
}
