import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('guests')
@Index(['visit_date'])
@Index(['created_by_staff_id'])
export class GuestEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  guest_name!: string;

  @Column({ type: 'uuid' })
  created_by_staff_id!: string;

  @Column({ type: 'date', nullable: true })
  visit_date!: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;
}
