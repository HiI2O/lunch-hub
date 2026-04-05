import {
  Entity,
  Column,
  PrimaryColumn,
  VersionColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('ticket_purchase_reservations')
@Index(['user_id'])
@Index(['purchase_date'])
export class TicketPurchaseReservationEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'date' })
  purchase_date!: string;

  @Column({ type: 'integer' })
  quantity!: number;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status!: string;

  @Column({ type: 'uuid', nullable: true })
  ticket_id!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @VersionColumn()
  version!: number;
}
