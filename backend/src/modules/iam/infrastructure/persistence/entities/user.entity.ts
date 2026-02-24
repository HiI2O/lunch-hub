import {
  Entity,
  Column,
  PrimaryColumn,
  VersionColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
@Index(['email'])
@Index(['status'])
@Index(['invitation_token'])
export class UserEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  display_name!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password_hash!: string | null;

  @Column({ type: 'varchar', length: 50, default: 'GENERAL_USER' })
  role!: string;

  @Column({ type: 'varchar', length: 50, default: 'INVITED' })
  status!: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  invitation_token!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  invitation_token_expires_at!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  invited_by!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  invited_at!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  activated_at!: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at!: Date | null;

  @VersionColumn()
  version!: number;
}
